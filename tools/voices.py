#!/usr/bin/env python3
"""Renders the inner voices of Candle Ice.

    node tools/dump_lines.js > /tmp/lines.json
    python tools/voices.py /tmp/lines.json [--only HASH,...]

Every line spoken by one of the sixteen skills (and by the dead) is read by
Kokoro-82M, a small neural text-to-speech model with natural, sentence-aware
intonation, in one deep British narrator's voice for all the skills (as Disco
Elysium uses one actor), lowered a semitone with its formants kept, with a
little chest and compression and no reverb. The dead get their own voices and
their own rooms. The lines are packed into MP3 sprites under voice/ and indexed
in js/voice-manifest.js, keyed by the same hash the engine computes.

Needs (a virtualenv is simplest): pip install kokoro soundfile numpy
imageio-ffmpeg, and espeak-ng for unknown words. Kokoro downloads its voices
from Hugging Face on first use.
"""
import concurrent.futures as cf
import hashlib
import json
import os
import re
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

# How the voices were chosen (see README): naturalness was scored with a
# neural MOS predictor (torchaudio SQUIM) and intelligibility with a speech
# recogniser on a fixed sample. Piper scored 3.8/5; Kokoro's British "Lewis"
# voice 4.5/5, deep (about 94 Hz) and with a wide, sentence-aware intonation.
# Reverb and saturation both lowered the score, so the skills get almost no
# processing: a touch of depth and chest, and compression.
LIGHT = ['highpass=f=60', 'equalizer=f=130:t=q:w=1:g=2.5', 'equalizer=f=3200:t=q:w=1.2:g=1.5',
         'acompressor=threshold=-22dB:ratio=2.5:attack=8:release=180:makeup=2']
NARRATOR = ('b', 'bm_lewis')
PROFILES = {
    # The Examiner's head. One narrator, as in Disco Elysium; four tempers.
    'REASON': dict(voice=NARRATOR, speed=0.96, pitch=0.95, chain=LIGHT),
    'SOUL': dict(voice=NARRATOR, speed=0.87, pitch=0.94, chain=LIGHT),
    'FLESH': dict(voice=NARRATOR, speed=0.93, pitch=0.92, chain=LIGHT),
    'NERVE': dict(voice=NARRATOR, speed=0.98, pitch=0.95, chain=LIGHT),
    # The cold under the ice: slower, lower, a little further away.
    'THE COLD': dict(voice=('a', 'am_onyx'), speed=0.78, pitch=0.9, chain=LIGHT + ['lowpass=f=4500'] + room([70, 140], [0.12, 0.07])),
    # A boy of fourteen, heard through forty-four winters of water.
    'FELIKS': dict(voice=('a', 'am_puck'), speed=0.95, pitch=1.12, formant='shifted',
                   chain=['highpass=f=110', 'lowpass=f=3200', 'vibrato=f=3.5:d=0.04',
                          'acompressor=threshold=-22dB:ratio=2.5:attack=6:release=160:makeup=2'] + room([80, 170], [0.2, 0.1])),
    # The drowned Warden, speaking out of the ice-hum.
    'SARRE': dict(voice=('b', 'bm_george'), speed=0.9, pitch=0.9, chain=LIGHT + ['lowpass=f=5000'] + room([60, 130], [0.14, 0.08])),
    # A kitchen forty-four years ago.
    'YOUR MOTHER': dict(voice=('b', 'bf_emma'), speed=0.95, pitch=1.0, chain=['highpass=f=90', 'equalizer=f=250:t=q:w=1:g=1.5',
                        'acompressor=threshold=-22dB:ratio=2.5:attack=6:release=160:makeup=2'] + room([30, 60], [0.08, 0.05])),
}

# The invented names of Aubade, spelled for the phonemiser.
NAMES = {
    'Sarre': 'sˈɑːɹə', 'Aino': 'ˈInQ', 'Ilse': 'ˈɪlsə', 'Odile': 'Qdˈiːl', 'Castellane': 'kˌastəlˈɑːn',
    'Aubade': 'Qbˈɑːd', 'Rime': 'ɹˈIm', 'Tuula': 'tˈuːlə', 'Ailo': 'ˈIlQ', 'Marta': 'mˈɑːtə',
}


def profile_for(line):
    return PROFILES.get(line['attr']) or PROFILES['REASON']


def key_of(line):
    prof = profile_for(line)
    sig = json.dumps(['kokoro1', line['text'], prof['voice'], prof['speed'], prof['pitch'], prof.get('formant'), prof['chain'], NAMES])
    return hashlib.sha1(sig.encode()).hexdigest()[:16]


def prepare_text(t):
    # keep the dashes and ellipses: they are the intonation. Names get their phonemes.
    t = t.replace(' ... ', ' — ').replace(', ,', ',')
    for n, ph in NAMES.items():
        t = re.sub(r'\b%s\b' % n, '[%s](/%s/)' % (n, ph), t)
    return t


_pipes, _voices = {}, {}


def synth(line, voices_dir, raw_path):
    import soundfile as sf
    from kokoro import KPipeline
    prof = profile_for(line)
    lang, name = prof['voice']
    if lang not in _pipes:
        _pipes[lang] = KPipeline(lang_code=lang, repo_id='hexgrad/Kokoro-82M')
    audio = [a.numpy() for _, _, a in _pipes[lang](prepare_text(line['text']), voice=name, speed=prof['speed'])]
    sf.write(raw_path, np.concatenate(audio) if audio else np.zeros(2400, dtype=np.float32), 24000, subtype='PCM_16')


def process(line, raw_path, out_path):
    prof = profile_for(line)
    chain = []
    if prof['pitch'] != 1.0:
        chain += ['aresample=44100', 'rubberband=pitch=%g:formant=%s:pitchq=quality' % (prof['pitch'], prof.get('formant', 'preserved'))]
    chain += prof['chain']
    chain += ['apad=pad_dur=0.6', 'loudnorm=I=-17:TP=-2:LRA=11', 'aresample=%d' % RATE, 'silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-55dB']
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
    for i, l in enumerate(sorted(todo, key=lambda l: str(profile_for(l)['voice']))):
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
