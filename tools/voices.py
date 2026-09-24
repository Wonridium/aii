#!/usr/bin/env python3
"""Renders the inner voices of Candle Ice.

    node tools/dump_lines.js > /tmp/lines.json
    python3 tools/voices.py /tmp/lines.json [--voices DIR] [--only HASH,...]

Every line spoken by one of the sixteen skills (and by the dead) is read by a
Piper neural voice, then dragged down into the register of an old radio
narrator: pitched down with its formants kept, pushed into soft saturation for
grit, a flutter of vocal fry, chest EQ, compression and a little room. The
lines are packed into MP3 sprites under voice/ and indexed in
js/voice-manifest.js, keyed by the same hash the engine computes.

Needs: pip install piper-tts numpy imageio-ffmpeg (for an ffmpeg build with
rubberband), and these Piper voices in --voices (default /tmp/piper):
en_US-norman-medium, en_US-ryan-high, en_GB-northern_english_male-medium,
en_GB-cori-medium.
"""
import concurrent.futures as cf
import hashlib
import json
import os
import subprocess
import sys
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.voice-cache')
OUT_DIR = os.path.join(ROOT, 'voice')
MANIFEST = os.path.join(ROOT, 'js', 'voice-manifest.js')
RATE = 24000
GAP = 0.35
CHUNK_SECONDS = 240

try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    FFMPEG = 'ffmpeg'

# The grain shared by every inner voice. Clarity first: a gentle saturation
# for grain (no fry, no heavy drive: both cost intelligibility), chest, a
# scooped-out mud band, a strong presence lift so consonants cut through the
# music, then compression and only a breath of room.
def grain(drive=6, chest=4, presence=5, air=2):
    return [
        'highpass=f=70',
        'equalizer=f=140:t=q:w=1:g=%g' % chest,
        'equalizer=f=400:t=q:w=1.2:g=-3',
        'equalizer=f=3000:t=q:w=1.2:g=%g' % presence,
        'equalizer=f=6000:t=q:w=1:g=%g' % air,
        'volume=%gdB' % drive,
        'asoftclip=type=atan:oversample=2',
        'volume=-%gdB' % (drive * 0.8),
        'acompressor=threshold=-24dB:ratio=3:attack=6:release=160:makeup=3',
    ]

def room(delays, decays, gain_in=0.85, gain_out=0.75):
    return ['aecho=%g:%g:%s:%s' % (gain_in, gain_out, '|'.join(str(d) for d in delays), '|'.join(str(d) for d in decays))]

# Voices were chosen by measuring intelligibility with a speech recogniser
# (word error rate on a fixed sample): the deep en_US-ryan-high reads at ~6%,
# where the old norman-based chain was at ~20% and the Cold was unreadable.
NARRATOR = 'en_US-ryan-high'
PROFILES = {
    # The Examiner's head. One narrator, four moods.
    'REASON': dict(voice=NARRATOR, length=1.03, pitch=0.83,
                   chain=grain(6, chest=3, presence=6) + room([25, 50], [0.06, 0.04])),
    'SOUL': dict(voice=NARRATOR, length=1.1, pitch=0.81,
                 chain=grain(5, chest=5, presence=5) + room([40, 80], [0.1, 0.06])),
    'FLESH': dict(voice=NARRATOR, length=1.05, pitch=0.79,
                  chain=grain(8, chest=6, presence=5) + room([25, 50], [0.05, 0.03])),
    'NERVE': dict(voice=NARRATOR, length=1.0, pitch=0.83,
                  chain=grain(6, chest=4, presence=6) + room([25, 50], [0.06, 0.04])),
    # The cold under the ice: slower, lower, a little further away.
    'THE COLD': dict(voice=NARRATOR, length=1.3, pitch=0.74,
                     chain=grain(6, chest=6, presence=4, air=0) + ['lowpass=f=4200'] + room([90, 190], [0.18, 0.1])),
    # A boy of fourteen, heard through forty-four winters of water.
    'FELIKS': dict(voice='en_US-ryan-high', length=1.1, pitch=1.2, formant='shifted',
                   chain=['highpass=f=120', 'lowpass=f=2600', 'vibrato=f=3.5:d=0.06',
                          'acompressor=threshold=-22dB:ratio=3:attack=5:release=150:makeup=2'] + room([90, 180, 310], [0.3, 0.2, 0.1], 0.8, 0.65)),
    # The drowned Warden, speaking out of the ice-hum.
    'SARRE': dict(voice='en_GB-northern_english_male-medium', length=1.12, pitch=0.9,
                  chain=grain(6, chest=5, presence=3, air=0) + ['lowpass=f=4000'] + room([70, 150, 240], [0.28, 0.18, 0.1], 0.8, 0.65)),
    # A kitchen forty-four years ago.
    'YOUR MOTHER': dict(voice='en_GB-cori-medium', length=1.05, pitch=0.96,
                        chain=['highpass=f=90', 'lowpass=f=5200', 'equalizer=f=250:t=q:w=1:g=2',
                               'acompressor=threshold=-22dB:ratio=3:attack=5:release=150:makeup=2'] + room([40, 85], [0.2, 0.12])),
}


def profile_for(line):
    return PROFILES.get(line['attr']) or PROFILES['REASON']


def key_of(line):
    prof = profile_for(line)
    sig = json.dumps([line['text'], prof['voice'], prof['length'], prof['pitch'], prof.get('formant'), prof['chain']])
    return hashlib.sha1(sig.encode()).hexdigest()[:16]


_voices = {}


def piper_voice(name, voices_dir):
    if name not in _voices:
        from piper import PiperVoice
        _voices[name] = PiperVoice.load(os.path.join(voices_dir, name + '.onnx'))
    return _voices[name]


def synth(line, voices_dir, raw_path):
    from piper import SynthesisConfig
    prof = profile_for(line)
    v = piper_voice(prof['voice'], voices_dir)
    cfg = SynthesisConfig(length_scale=prof['length'], noise_scale=0.6, noise_w_scale=0.7)
    with wave.open(raw_path, 'wb') as w:
        v.synthesize_wav(line['text'], w, syn_config=cfg)


def process(line, raw_path, out_path):
    prof = profile_for(line)
    chain = ['aresample=44100',
             'rubberband=pitch=%g:formant=%s:pitchq=quality:transients=smooth' % (prof['pitch'], prof.get('formant', 'preserved'))]
    chain += prof['chain']
    chain += ['apad=pad_dur=0.6', 'loudnorm=I=-17:TP=-2:LRA=9', 'aresample=%d' % RATE, 'silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-55dB']
    cmd = [FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-i', raw_path, '-af', ','.join(chain), '-ac', '1', '-ar', str(RATE), '-c:a', 'pcm_s16le', out_path]
    subprocess.run(cmd, check=True)


def read_wav(path):
    with wave.open(path) as w:
        assert w.getframerate() == RATE, path
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)


def write_wav(path, data):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(data.astype(np.int16).tobytes())


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    voices_dir = '/tmp/piper'
    if '--voices' in args:
        voices_dir = args[args.index('--voices') + 1]
    lines = json.load(open(args[0]))
    only = None
    if '--only' in args:
        only = set(args[args.index('--only') + 1].split(','))
        lines = [l for l in lines if l['hash'] in only]
    os.makedirs(CACHE, exist_ok=True)

    # 1. speech, one voice at a time (Piper already uses every core)
    todo, keys = [], set()
    for l in lines:
        k = key_of(l)
        l['wav'] = os.path.join(CACHE, k + '.wav')
        l['raw'] = os.path.join(CACHE, k + '.raw.wav')
        if not os.path.exists(l['wav']) and k not in keys:
            todo.append(l)
        keys.add(k)
    print('%d lines, %d to render' % (len(lines), len(todo)), flush=True)
    for i, l in enumerate(sorted(todo, key=lambda l: profile_for(l)['voice'])):
        if not os.path.exists(l['raw']):
            synth(l, voices_dir, l['raw'])
        if (i + 1) % 50 == 0:
            print('  spoke %d/%d' % (i + 1, len(todo)), flush=True)

    # 2. the voice of the head, in parallel
    def job(l):
        process(l, l['raw'], l['wav'])
        os.remove(l['raw'])
        return l['hash']
    with cf.ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as ex:
        for i, _ in enumerate(ex.map(job, todo)):
            if (i + 1) % 50 == 0:
                print('  processed %d/%d' % (i + 1, len(todo)), flush=True)
    if only:
        print('rendered to cache only (--only); sprites untouched')
        return

    # 3. sprites, in story order, a few minutes each
    os.makedirs(OUT_DIR, exist_ok=True)
    for f in os.listdir(OUT_DIR):
        if f.endswith('.mp3'):
            os.remove(os.path.join(OUT_DIR, f))
    files, index = [], {}
    gap = np.zeros(int(GAP * RATE), dtype=np.int16)
    groups = []
    for l in lines:
        if not groups or groups[-1][0] != l['file']:
            groups.append((l['file'], []))
        groups[-1][1].append(l)
    for fname, group in groups:
        chunk, parts, t, part_no = [], [], 0.0, 0

        def flush():
            nonlocal chunk, parts, t, part_no
            if not chunk:
                return
            name = '%s%s.mp3' % (fname, '' if part_no == 0 else '_%d' % part_no)
            tmp = os.path.join(CACHE, 'sprite.wav')
            write_wav(tmp, np.concatenate(parts))
            subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '48k', '-ar', str(RATE), '-ac', '1', os.path.join(OUT_DIR, name)], check=True)
            fi = len(files)
            files.append('voice/' + name)
            for h, start, dur in chunk:
                index[h] = [fi, round(start, 3), round(dur, 3)]
            chunk, parts, t = [], [], 0.0
            part_no += 1

        for l in group:
            data = read_wav(l['wav'])
            dur = len(data) / RATE
            if t > 0 and t + dur > CHUNK_SECONDS:
                flush()
            if not parts:
                parts.append(gap)
                t = GAP
            chunk.append((l['hash'], t, dur))
            parts.append(data)
            parts.append(gap)
            t += dur + GAP
        flush()

    total = sum(v[2] for v in index.values())
    with open(MANIFEST, 'w') as m:
        m.write('/* Generated by tools/voices.py: inner-voice audio sprites. Do not edit. */\n')
        m.write('window.CANDLE = window.CANDLE || {};\n')
        m.write('CANDLE.VOICE_MANIFEST = ')
        json.dump({'files': files, 'lines': index}, m, separators=(',', ':'))
        m.write(';\n')
    size = sum(os.path.getsize(os.path.join(ROOT, f)) for f in files)
    print('%d lines, %.1f minutes of speech, %d sprites, %.1f MB' % (len(index), total / 60, len(files), size / 1e6))


if __name__ == '__main__':
    main()
