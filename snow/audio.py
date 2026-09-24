"""Mix for "First Snow": score + voices + Kenney CC0 foley + synth wind."""
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "short"))
sys.path.insert(0, os.path.join(HERE, "..", "video"))
import audio as A  # noqa: E402  (short/audio.py helpers)
import sfx as synthfx  # noqa: E402
from synth import SR, add, bp, lp, noise  # noqa: E402

from beats import BEAT, DUR  # noqa: E402
from snowfilm import T  # noqa: E402

A.BUILD = os.path.join(HERE, "build")


def wind(dur):
    t = np.arange(int(dur * SR)) / SR
    n = noise(len(t))
    gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * t) * np.sin(2 * np.pi * 0.07 * t + 1)
    x = lp(n, 700) * gust + bp(noise(len(t)), 900, 2200) * gust ** 2 * 0.15
    return np.stack([x, np.roll(x, 900)], 1) * 0.35


def melt():
    t = np.arange(int(0.5 * SR)) / SR
    x = bp(noise(len(t)), 3000, 9000) * np.exp(-t * 9) * 0.4
    return np.stack([x, x], 1)


def crunch(g=0.3, k=0):
    return A.ken("impact-sounds", f"footstep_snow_00{k % 5}.ogg", g, 1.0)


def build():
    n = int((DUR + 0.5) * SR)
    fx = np.zeros((n, 2))
    amb = np.zeros((n, 2))
    vo = np.zeros((n, 2))
    add(fx, A.ken("rpg-audio", "doorOpen_1.ogg", 0.5, 1.0, -0.4), T["door"] - 0.05)
    add(fx, synthfx.render("whoosh") * 0.15, T["out"])
    add(fx, crunch(0.35, 1), T["out"] + 0.45)
    for k in range(8):  # hopping under the flake
        add(fx, crunch(0.22, k), T["cut_chase"] + k * BEAT + 0.3)
    add(fx, melt(), T["land"])
    add(fx, synthfx.render("sparkle") * 0.25, T["snowfall"])
    for k in range(6):
        add(fx, crunch(0.25, k), T["snowfall"] + k * BEAT + 0.35)
    # building: a crunchy pop for every piece
    for tb in [T["body"]] + T["legs"] + [T["arms"]]:
        add(fx, crunch(0.35, int(tb * 10)), tb)
        add(fx, synthfx.render("pop") * 0.2, tb + 0.02)
    for te in T["eyes"]:
        add(fx, A.ken("impact-sounds", "impactWood_light_001.ogg", 0.25, 1.6), te)
    add(fx, synthfx.render("sparkle") * 0.35, T["done"])
    add(fx, A.ken("rpg-audio", "cloth1.ogg", 0.35), T["hat_off"])
    add(fx, A.ken("rpg-audio", "cloth3.ogg", 0.3), T["hat_on"] - 0.05)
    add(fx, synthfx.render("wink") * 0.3, T["blink"])
    for k, tb in enumerate(T["bulbs"]):
        add(fx, A.ken("ui-audio", f"switch{(k * 3) % 38 + 1}.ogg", 0.12, 1.1), tb)
    add(fx, A.ken("rpg-audio", "metalClick.ogg", 0.4), T["lamp"])
    add(amb, wind(DUR + 0.5), 0.0)
    for lid in ("whoa", "snow", "aww", "hi"):
        add(vo, A.voice(lid), T[lid])
    vo = A.reverb(vo, "room", 0.06)[:n]
    A.finish(vo, fx, amb, n)


if __name__ == "__main__":
    build()
