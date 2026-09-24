"""Voice lines for "First Snow"."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "short"))
import voices as V  # noqa: E402

V.OUT = os.path.join(HERE, "build", "voice")
V.LINES = {
    "whoa": ("af_heart", 0.9, 1.2, "Whoa..."),
    "snow": ("af_heart", 1.0, 1.2, "Snow!"),
    "aww": ("af_heart", 0.9, 1.2, "Oh no..."),
    "hi": ("af_heart", 0.95, 1.2, "Hi, friend."),
}

if __name__ == "__main__":
    V.main(sys.argv[1:] or None)
