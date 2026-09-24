"""Word-level timings for captions (Whisper), mapped onto the script's words."""
import json
import os
import re

from faster_whisper import WhisperModel

from script import LINES

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    m = WhisperModel("small.en", device="cpu", compute_type="int8")
    out = {}
    for lid, (spk, text) in LINES.items():
        words = text.replace("|", " ").split()
        segs, _ = m.transcribe(os.path.join(HERE, "build", "voice", f"{lid}.wav"),
                               beam_size=5, word_timestamps=True)
        got = [w for s in segs for w in s.words]
        if len(got) == len(words):
            times = [(round(w.start, 3), round(w.end, 3)) for w in got]
        else:
            # fall back: spread script words over the recognised span by length
            t0 = got[0].start if got else 0.0
            t1 = got[-1].end if got else 1.0
            L = [len(re.sub(r"\W", "", w)) + 1 for w in words]
            acc, times = t0, []
            for n in L:
                d = (t1 - t0) * n / sum(L)
                times.append((round(acc, 3), round(acc + d, 3)))
                acc += d
        out[lid] = [[w, a, b] for w, (a, b) in zip(words, times)]
        print(lid, len(words), len(got))
    json.dump(out, open(os.path.join(HERE, "build", "voice", "words.json"), "w"), indent=0)


if __name__ == "__main__":
    main()
