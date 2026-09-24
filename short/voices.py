"""Voice lines for the short (Kokoro + the same polish chain as the long film)."""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "video"))
from tts import PAUSE, polish, trim  # noqa: E402

MODELS = os.path.join(HERE, "..", "assets", "models")
OUT = os.path.join(HERE, "build", "voice")

# id: (voice, speed, pitch, text)
LINES = {
    "found": ("af_heart", 1.05, 1.2, "Found you!"),
    "lost": ("af_heart", 0.95, 1.2, "Oh...|you're just lost?"),
    "go": ("af_heart", 1.0, 1.2, "There you go."),
    "green": ("af_heart", 1.05, 1.2, "All green!"),
    "thanks": ("af_sky", 1.0, 1.8, "Thank you!"),
}


def main(only=None):
    os.makedirs(OUT, exist_ok=True)
    k = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))
    dur = {}
    for lid, (voice, speed, pitch, text) in LINES.items():
        if only and lid not in only:
            continue
        parts = []
        for i, chunk in enumerate(text.split("|")):
            a, sr = k.create(chunk.strip(), voice=voice, speed=speed, lang="en-us")
            if i:
                parts.append(np.zeros(int(sr * PAUSE)))
            parts.append(trim(a))
        raw = os.path.join(OUT, f"{lid}.raw.wav")
        sf.write(raw, np.concatenate(parts), sr)
        polish(raw, os.path.join(OUT, f"{lid}.wav"), pitch)
        os.remove(raw)
        a, _ = sf.read(os.path.join(OUT, f"{lid}.wav"))
        dur[lid] = round(len(a) / 48000, 3)
        print(lid, dur[lid], text)
    p = os.path.join(OUT, "durations.json")
    old = json.load(open(p)) if os.path.exists(p) else {}
    old.update(dur)
    json.dump(old, open(p, "w"), indent=1)


if __name__ == "__main__":
    main(sys.argv[1:] or None)
