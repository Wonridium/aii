"""Synthesised sound effects. Every function returns a (n, 2) float array."""
import math

import numpy as np

from synth import (SR, attack, bass, bell, bp, clap, glock, hp, kick, lp, mtof, musicbox, noise,
                   norm_peak, pad, piano, reverb, stereo, sweep_sine, tt)

PENTA = [0, 2, 4, 7, 9]


def _m(x, pan=0.0):
    return stereo(x, pan)


def msum(*xs):
    """Sum signals of different lengths (zero-padded)."""
    n = max(len(x) for x in xs)
    out = np.zeros((n,) + xs[0].shape[1:])
    for x in xs:
        out[: len(x)] += x
    return out


def pop(pitch=1.0, **_):
    t = tt(0.12)
    f = 520 * pitch * (1 + 1.2 * np.exp(-t * 60))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38)
    x += bp(noise(len(t)), 2000, 6000) * np.exp(-t * 300) * 0.15
    return reverb(_m(attack(x, 1)), "room", 0.12)


def tick(pitch=1.0, **_):
    t = tt(0.05)
    x = np.sin(2 * np.pi * 1800 * pitch * t) * np.exp(-t * 140)
    return _m(attack(x, 0.3))


def type_(pitch=1.0, **_):
    t = tt(0.05)
    x = np.sign(np.sin(2 * np.pi * 900 * pitch * t)) * np.exp(-t * 90) * 0.5
    return _m(lp(x, 5000))


def whoosh(up=None, dur=0.45, lo=300, hi=3000, **_):
    t = tt(dur)
    n = noise(len(t))
    out = np.zeros(len(t))
    steps = 24
    seg = len(t) // steps
    for i in range(steps):
        p = i / (steps - 1)
        if up is True:
            fc = lo * (hi / lo) ** p
        elif up is False:
            fc = hi * (lo / hi) ** p
        else:
            fc = lo * (hi / lo) ** math.sin(p * math.pi)
        a, b = i * seg, (i + 1) * seg if i < steps - 1 else len(t)
        out[a:b] = bp(n[max(0, a - 2000):b], fc * 0.6, fc * 1.6)[-(b - a):]
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6
    x = out * env
    L, R = x, np.roll(x, 90)
    return reverb(np.stack([L, R], 1), "room", 0.2)


def whoosh_down(**k):
    return whoosh(up=False, dur=0.4, lo=200, hi=2500)


def whoosh_up(pitch=1.0, **k):
    return whoosh(up=True, dur=0.35, lo=400 * pitch, hi=4000 * pitch)


def swish(**k):
    return whoosh(up=None, dur=0.28, lo=800, hi=5000)


def paper_up(**k):
    return whoosh(up=True, dur=0.3, lo=600, hi=3500) * 0.7


def slide(**k):
    return whoosh(up=None, dur=0.4, lo=300, hi=1600)


def boing(**_):
    t = tt(0.6)
    f = 220 * (1 + 0.9 * t / 0.6) * (1 + 0.28 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 5))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = np.tanh(2 * x) * np.exp(-t * 5)
    return reverb(_m(attack(lp(x, 3000), 2)), "room", 0.15)


def land(**_):
    t = tt(0.35)
    f = 50 + 90 * np.exp(-t * 25)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)
    x += lp(noise(len(t)), 900) * np.exp(-t * 30) * 0.5
    b = boing()[: len(t) + 10000] * 0.35
    out = np.zeros((max(len(t), len(b)), 2))
    out[: len(t)] += _m(x)
    out[: len(b)] += b
    return out


def sparkle(seed=0, n=7, span=0.45, **_):
    rng = np.random.default_rng(seed + 17)
    L = span + 1.6
    out = np.zeros((int(L * SR), 2))
    for i in range(n):
        m = 84 + rng.choice(PENTA) + 12 * rng.integers(0, 2)
        x = glock(mtof(m), vel=0.5 + 0.5 * rng.random())
        s = _m(x, rng.uniform(-0.7, 0.7))
        i0 = int(SR * span * i / n)
        out[i0: i0 + len(s)] += s[: len(out) - i0]
    return reverb(out, "hall", 0.35)


def ding(**_):
    x = msum(bell(mtof(88), decay=1.3), 0.5 * bell(mtof(95), decay=0.9))
    return reverb(_m(x), "hall", 0.3)


def boom_soft(**_):
    t = tt(1.6)
    x = np.sin(2 * np.pi * np.cumsum(38 + 40 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.5)
    x += lp(noise(len(t)), 300) * np.exp(-t * 4) * 0.5
    return reverb(_m(attack(x, 4)), "big", 0.3)


def impact(**_):
    return boom_soft() * 1.2


def zoom_in(**_):
    t = tt(0.3)
    x = sweep_sine(300, 1400, 0.3) * np.sin(np.pi * t / 0.3) * 0.5
    return msum(_m(x), whoosh(up=True, dur=0.3, lo=500, hi=5000) * 0.8)


def multiply(pitch=1.0, **_):
    out = np.zeros((int(SR * 0.9), 2))
    for i, m in enumerate([72, 76, 79, 84, 88]):
        p = pop(pitch=pitch * mtof(m) / mtof(72))
        i0 = int(SR * 0.05 * i)
        out[i0: i0 + len(p)] += p[: len(out) - i0] * 0.8
    return out


def stamp(**_):
    t = tt(0.4)
    f = 48 + 150 * np.exp(-t * 35)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    x += lp(noise(len(t)), 1800) * np.exp(-t * 45) * 0.9
    x += bp(noise(len(t)), 2500, 7000) * np.exp(-t * 250) * 0.5
    return reverb(_m(np.tanh(1.5 * x)), "room", 0.2)


def paper(pitch=1.0, **_):
    t = tt(0.09)
    x = bp(noise(len(t)), 1800 * pitch, 6000) * np.sin(np.pi * t / 0.09)
    return _m(x)


def pin(pitch=1.0, **_):
    return msum(pop(pitch=1.6 * pitch) * 0.8, tick(pitch=1.4 * pitch) * 0.3)


def crown(**_):
    out = np.zeros((int(SR * 3.0), 2))
    for i, m in enumerate([72, 76, 79, 84, 88, 91]):
        x = _m(msum(glock(mtof(m + 12)), 0.4 * bell(mtof(m), decay=1.0)), (i - 2.5) * 0.2)
        i0 = int(SR * 0.055 * i)
        out[i0: i0 + len(x)] += x[: len(out) - i0]
    ch = pad([mtof(60), mtof(64), mtof(67), mtof(72)], 0.6, att=0.02, rel=1.4, cutoff=4000)
    out[: len(ch)] += ch * 1.8
    return reverb(out, "hall", 0.35)


def check(pitch=1.0, **_):
    x = bell(mtof(84) * pitch, decay=0.35)
    return reverb(_m(x), "room", 0.2)


def tapestop(**_):
    t = tt(0.6)
    x = sweep_sine(300, 30, 0.6) * (1 - t / 0.6)
    return _m(lp(x, 800)) * 0.4


def deflate(pitch=1.0, **_):
    t = tt(0.4)
    f = 700 * pitch * np.exp(-t * 3.2)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35 + bp(noise(len(t)), 800, 3000) * 0.6
    x *= np.exp(-t * 7)
    return reverb(_m(x), "room", 0.2)


def zap(**_):
    t = tt(0.7)
    f = 400 * (8 ** (t / 0.7))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR + 3 * np.sin(2 * np.pi * 37 * t)) * np.exp(-t * 3) * 0.5
    out = _m(lp(x, 6000))
    s = sparkle(seed=3, n=9, span=0.5)
    L = max(len(out), len(s))
    y = np.zeros((L, 2))
    y[: len(out)] += out
    y[: len(s)] += s * 0.8
    return y


def blip(**_):
    out = np.zeros((int(SR * 0.3), 2))
    for i, m in enumerate([88, 84]):
        t = tt(0.07)
        x = np.sign(np.sin(2 * np.pi * mtof(m) * t)) * np.exp(-t * 30) * 0.3
        i0 = int(SR * 0.09 * i)
        out[i0: i0 + len(t)] += _m(lp(x, 4000))
    return out


def clatter(**_):
    out = np.zeros((int(SR * 0.6), 2))
    for i, (f, d) in enumerate([(900, 0), (700, 0.11), (820, 0.2), (650, 0.27)]):
        t = tt(0.06)
        x = np.sin(2 * np.pi * f * t) * np.exp(-t * 90) + bp(noise(len(t)), 1500, 5000) * np.exp(-t * 200) * 0.3
        i0 = int(SR * d)
        out[i0: i0 + len(t)] += _m(x * (1 - i * 0.2), 0.3)
    return reverb(out, "room", 0.2)


def wind(dur=5.0, **_):
    t = tt(dur)
    n = noise(len(t))
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t) * np.sin(2 * np.pi * 0.11 * t + 1)
    lo = lp(n, 500) * (0.6 + 0.4 * lfo)
    hi = bp(noise(len(t)), 700, 1600) * lfo * 0.25
    x = lo + hi
    env = np.minimum(1, t / 1.0) * np.minimum(1, (dur - t) / 1.0)
    L = x * env
    R = np.roll(L, 700)
    return np.stack([L, R], 1) * 0.5


def glitch(**_):
    rng = np.random.default_rng(5)
    out = np.zeros((int(SR * 0.9), 2))
    pos = 0
    while pos < len(out) - 2000:
        L = int(SR * rng.uniform(0.02, 0.07))
        t = tt(L / SR)
        kind = rng.integers(0, 3)
        if kind == 0:
            x = np.sign(np.sin(2 * np.pi * rng.uniform(80, 900) * t))
        elif kind == 1:
            x = noise(L)
        else:
            x = np.round(np.sin(2 * np.pi * rng.uniform(200, 2000) * t) * 3) / 3
        x *= rng.uniform(0.3, 1.0)
        seg = _m(x, rng.uniform(-0.8, 0.8))
        out[pos: pos + len(seg)] += seg[: len(out) - pos]
        pos += L + int(SR * rng.uniform(0, 0.03))
    return lp(out, 7000) * 0.5


def gameover(**_):
    notes = [(67, 0.0, 0.18), (66, 0.2, 0.18), (65, 0.4, 0.18), (64, 0.6, 0.7)]
    out = np.zeros((int(SR * 3.2), 2))
    for m, st, d in notes:
        t = tt(d + 0.1)
        f = mtof(m) * (1 + 0.01 * np.sin(2 * np.pi * 6 * t) * (t > 0.2))
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = (np.sign(np.sin(ph)) * 0.5 + np.sin(ph)) * np.where(t < d, 1, np.exp(-(t - d) * 30))
        x += 0.6 * (2 / np.pi) * np.arcsin(np.sin(ph / 2))  # triangle an octave down
        out[int(st * SR): int(st * SR) + len(t)] += _m(lp(x, 3500) * 0.35)
    # low final thud chord
    b = bass(mtof(36), 1.0) * 0.8
    out[int(0.6 * SR): int(0.6 * SR) + len(b)] += _m(b)
    return reverb(out, "room", 0.25)


def peek(**_):
    t = tt(0.25)
    x = sweep_sine(300, 700, 0.25) * np.sin(np.pi * t / 0.25) * 0.6
    return reverb(_m(x), "room", 0.2)


def click(**_):
    out = np.zeros((int(SR * 0.15), 2))
    for d, f in ((0, 3200), (0.06, 2600)):
        t = tt(0.02)
        x = bp(noise(len(t)), f * 0.7, f * 1.3) * np.exp(-t * 400)
        out[int(d * SR): int(d * SR) + len(t)] += _m(x)
    return out


def rewind(**_):
    dur = 2.4
    t = tt(dur)
    f = 900 * (3 ** (t / dur))
    x = bp(noise(len(t)), 900, 3500) * 0.18
    x += np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.1 * (1 + np.sin(2 * np.pi * 23 * t))
    env = np.minimum(1, t / 0.1) * np.minimum(1, (dur - t) / 0.15)
    return _m(x * env)


def sting_dark(**_):
    out = np.zeros((int(SR * 4.0), 2))
    sw = whoosh(up=True, dur=0.8, lo=100, hi=2500) * 0.9
    out[: len(sw)] += sw
    b = boom_soft()
    out[int(0.75 * SR): int(0.75 * SR) + len(b)] += b[: len(out) - int(0.75 * SR)]
    ch = pad([mtof(36), mtof(48), mtof(51), mtof(54)], 1.6, att=0.05, rel=1.5, cutoff=900)
    i0 = int(0.75 * SR)
    out[i0: i0 + len(ch)] += ch[: len(out) - i0] * 2.2
    return reverb(out, "big", 0.3)


def sting_bright(**_):
    out = np.zeros((int(SR * 4.0), 2))
    sw = whoosh(up=True, dur=0.5, lo=400, hi=6000) * 0.6
    out[: len(sw)] += sw
    i0 = int(0.45 * SR)
    ch = pad([mtof(60), mtof(64), mtof(67), mtof(72), mtof(76)], 1.4, att=0.03, rel=1.6, cutoff=5000)
    out[i0: i0 + len(ch)] += ch[: len(out) - i0] * 2.0
    for i, m in enumerate([72, 76, 79, 84, 88]):
        g = _m(glock(mtof(m + 12)), (i - 2) * 0.25)
        j = i0 + int(0.07 * i * SR)
        out[j: j + len(g)] += g[: len(out) - j]
    return reverb(out, "hall", 0.35)


def think(**_):
    out = np.zeros((int(SR * 0.6), 2))
    for i in range(3):
        x = tick(pitch=0.7 + 0.1 * i) * 0.8
        i0 = int(SR * 0.13 * i)
        out[i0: i0 + len(x)] += x
    return out


def idea(**_):
    x = msum(bell(mtof(88), decay=1.0), 0.6 * bell(mtof(95), decay=0.8))
    out = reverb(_m(x), "hall", 0.3)
    s = sparkle(seed=8, n=5, span=0.3)
    y = np.zeros((max(len(out), len(s)), 2))
    y[: len(out)] += out
    y[: len(s)] += s * 0.6
    return y


def clap_sfx(**_):
    x = clap(1.0)
    out = np.zeros((len(x) + 20000, 2))
    out[: len(x)] += _m(x)
    return reverb(out, "room", 0.3)


def scribble(dur=1.0, **_):
    t = tt(dur)
    rng = np.random.default_rng(2)
    strokes = np.abs(np.sin(2 * np.pi * 7.5 * t + 2 * np.sin(2 * np.pi * 1.3 * t)))
    x = bp(noise(len(t)), 2500, 7000) * strokes * (0.7 + 0.3 * rng.random(len(t)))
    return _m(x * 0.5, 0.2)


def bubble(**_):
    rng = np.random.default_rng(4)
    out = np.zeros((int(SR * 1.2), 2))
    for i in range(10):
        d = rng.uniform(0, 0.9)
        t = tt(0.08)
        f = rng.uniform(500, 1200) * (1 + 1.5 * t / 0.08)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.08)
        i0 = int(d * SR)
        out[i0: i0 + len(t)] += _m(x * 0.5, rng.uniform(-0.5, 0.5))
    return out


def grow(**_):
    t = tt(1.1)
    x = sweep_sine(200, 800, 1.1) * np.sin(np.pi * t / 1.1) * 0.25
    s = sparkle(seed=11, n=6, span=0.8)
    out = np.zeros((max(len(t), len(s)), 2))
    out[: len(t)] += _m(x)
    out[: len(s)] += s * 0.8
    return out


def chime_up(**_):
    out = np.zeros((int(SR * 2.5), 2))
    for i, m in enumerate([79, 81, 84, 86, 88, 91]):
        g = _m(glock(mtof(m + 12)), (i - 2.5) * 0.25)
        i0 = int(SR * 0.08 * i)
        out[i0: i0 + len(g)] += g[: len(out) - i0]
    return reverb(out, "hall", 0.3)


def whirr(**_):
    t = tt(1.6)
    x = lp(noise(len(t)), 400) * 0.5 + np.sin(2 * np.pi * 110 * t) * 0.1
    x *= np.sin(np.pi * t / 1.6)
    return _m(x)


def guide(pitch=1.0, **_):
    return reverb(_m(glock(mtof(84) * pitch) * 0.7), "hall", 0.3)


PIANO_KEYS = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83]


def piano_note(note=0, **_):
    m = PIANO_KEYS[note]
    x = piano(mtof(m), 0.45, vel=0.85)
    return reverb(_m(x, (note - 7) / 14), "hall", 0.25)


def bulb(note=0, **_):
    x = msum(bell(mtof(72 + note), decay=0.9) * 0.8, glock(mtof(84 + note)) * 0.5)
    return reverb(_m(x), "hall", 0.3)


def shooting_star(**_):
    out = np.zeros((int(SR * 2.4), 2))
    for i, m in enumerate([96, 93, 91, 88, 86, 84]):
        g = _m(glock(mtof(m)) * 0.6, 0.6 - i * 0.24)
        i0 = int(SR * 0.07 * i)
        out[i0: i0 + len(g)] += g[: len(out) - i0]
    return reverb(out, "big", 0.4)


def hug(**_):
    t = tt(0.22)
    x = sweep_sine(700, 1100, 0.22) * np.sin(np.pi * t / 0.22) * 0.3
    out = np.zeros((int(SR * 2.0), 2))
    out[: len(t)] += _m(x)
    b = _m(bell(mtof(79), decay=0.8) * 0.6)
    out[: len(b)] += b[: len(out)]
    return reverb(out, "hall", 0.3)


def star_ping(note=0, **_):
    return reverb(_m(msum(glock(mtof(84 + note)) * 0.8, bell(mtof(72 + note), decay=0.6) * 0.2), 0.3), "big", 0.35)


def fanfare(**_):
    out = np.zeros((int(SR * 4.5), 2))
    seq = [(67, 0.0, 0.12), (67, 0.13, 0.12), (67, 0.26, 0.12), (72, 0.4, 1.6)]
    for m, st, d in seq:
        for mm, v in ((m, 1.0), (m - 5 if m > 67 else m - 12, 0.6), (m + 4 if m == 72 else m, 0.5)):
            t = tt(d + 0.3)
            f = mtof(mm)
            x = np.zeros_like(t)
            for k in range(1, 9):
                x += np.sin(2 * np.pi * k * f * t) / k * (1 if k < 4 else 0.6)
            env = np.minimum(1, t / 0.02) * np.where(t < d, 1 - 0.2 * t / max(d, 0.1), np.exp(-(t - d) * 8))
            x = lp(x * env * v, 2500 if d < 1 else 3500)
            i0 = int(st * SR)
            out[i0: i0 + len(t)] += _m(x * 0.25, 0.1 if mm == m else -0.1)
    ch = pad([mtof(48), mtof(60), mtof(64), mtof(67), mtof(72)], 1.8, att=0.04, rel=1.5, cutoff=3500)
    i0 = int(0.4 * SR)
    out[i0: i0 + len(ch)] += ch[: len(out) - i0] * 2.0
    k = _m(kick(1.0))
    out[i0: i0 + len(k)] += k * 0.8
    for i, m in enumerate([84, 88, 91, 96]):
        g = _m(glock(mtof(m)), (i - 1.5) * 0.3)
        j = i0 + int(SR * (0.1 + 0.07 * i))
        out[j: j + len(g)] += g[: len(out) - j] * 0.8
    return reverb(out, "hall", 0.3)


def confetti(**_):
    out = np.zeros((int(SR * 2.5), 2))
    for d, pan in ((0.0, -0.6), (0.15, 0.6), (0.35, 0)):
        t = tt(0.12)
        x = lp(noise(len(t)), 3000) * np.exp(-t * 60) + np.sin(2 * np.pi * 150 * t) * np.exp(-t * 40) * 0.6
        i0 = int(d * SR)
        out[i0: i0 + len(t)] += _m(x, pan)
    s = sparkle(seed=21, n=12, span=1.0)
    out[: len(s)] += s[: len(out)] * 0.7
    return out


def wink(**_):
    x = glock(mtof(96)) * 0.6
    t = tt(0.12)
    y = sweep_sine(500, 900, 0.12) * np.sin(np.pi * t / 0.12) * 0.3
    out = np.zeros((len(x), 2))
    out[: len(x)] += _m(x)
    out[int(0.05 * SR): int(0.05 * SR) + len(y)] += _m(y)
    return reverb(out, "hall", 0.25)


def giggle(**_):
    return np.zeros((10, 2))


LIB = {
    "pop": pop, "tick": tick, "type": type_, "whoosh": lambda **k: whoosh(), "whoosh_down": whoosh_down,
    "whoosh_up": whoosh_up, "swish": swish, "paper_up": paper_up, "slide": slide, "boing": boing,
    "land": land, "sparkle": sparkle, "ding": ding, "boom_soft": boom_soft, "impact": impact,
    "zoom_in": zoom_in, "multiply": multiply, "stamp": stamp, "paper": paper, "pin": pin, "crown": crown,
    "check": check, "tapestop": tapestop, "deflate": deflate, "zap": zap, "blip": blip, "clatter": clatter,
    "wind": wind, "glitch": glitch, "gameover": gameover, "peek": peek, "click": click, "rewind": rewind,
    "sting_dark": sting_dark, "sting_bright": sting_bright, "think": think, "idea": idea, "clap": clap_sfx,
    "scribble": scribble, "bubble": bubble, "grow": grow, "chime_up": chime_up, "whirr": whirr,
    "guide": guide, "piano": piano_note, "bulb": bulb, "shooting_star": shooting_star, "hug": hug,
    "star_ping": star_ping, "fanfare": fanfare, "confetti": confetti, "wink": wink, "giggle": giggle,
}


def render(name, **kw):
    x = LIB[name](**kw)
    return norm_peak(np.asarray(x, dtype=np.float64), 0.8)
