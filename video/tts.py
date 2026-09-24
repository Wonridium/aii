"""Generate every voice line with Kokoro, then polish it with ffmpeg.

Output: build/voice/<ID>.wav (48 kHz mono) and build/voice/durations.json
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

from script import LINES, VOICES

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(HERE, "..", "assets", "models")
OUT = os.path.join(HERE, "build", "voice")


PAUSE = 0.32


def trim(a, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - 600): idx[-1] + 1200]


def polish(src, dst, pitch):
    chain = []
    if abs(pitch - 1.0) > 1e-3:
        # formant-shifted pitch: small cartoonish "critter" timbre on purpose
        chain.append(f"rubberband=pitch={pitch}:transients=smooth:window=short")
    chain += [
        "highpass=f=90",
        "equalizer=f=3500:t=q:w=1.2:g=2.5",  # presence
        "equalizer=f=250:t=q:w=1.0:g=-1.5",  # de-mud
        "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2",
        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02",
        "areverse",
        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06",
        "areverse",
        "aresample=48000",
    ]
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", ",".join(chain),
         "-ac", "1", "-c:a", "pcm_f32le", dst],
        check=True,
    )


def main(only=None):
    os.makedirs(OUT, exist_ok=True)
    k = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"),
               os.path.join(MODELS, "voices-v1.0.bin"))
    durations = {}
    dpath = os.path.join(OUT, "durations.json")
    if os.path.exists(dpath):
        durations = json.load(open(dpath))
    for lid, (spk, text) in LINES.items():
        if only and lid not in only:
            continue
        voice, speed, pitch = VOICES[spk]
        # "|" splits a line into takes joined by a deliberate pause
        parts = []
        for i, chunk in enumerate(text.split("|")):
            a, sr = k.create(chunk.strip(), voice=voice, speed=speed,
                             lang="en-gb" if voice[0] == "b" else "en-us")
            a = trim(a)
            if i:
                parts.append(np.zeros(int(sr * PAUSE)))
            parts.append(a)
        samples = np.concatenate(parts)
        raw = os.path.join(OUT, f"{lid}.raw.wav")
        sf.write(raw, samples, sr)
        dst = os.path.join(OUT, f"{lid}.wav")
        polish(raw, dst, pitch)
        os.remove(raw)
        a, _ = sf.read(dst)
        durations[lid] = round(len(a) / 48000, 3)
        print(f"{lid} {spk:5s} {durations[lid]:5.2f}s  {text}")
        json.dump(durations, open(dpath, "w"), indent=1)
    json.dump(durations, open(dpath, "w"), indent=1)


if __name__ == "__main__":
    main(sys.argv[1:] or None)
