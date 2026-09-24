"""Small numpy synth: instruments, drums, reverb, helpers. 48 kHz stereo."""
import math

import numpy as np
from scipy import signal

SR = 48000
RNG = np.random.default_rng(1234)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def stereo(x, pan=0.0):
    """Equal-power pan of a mono signal -> (n, 2)."""
    a = (pan + 1) * math.pi / 4
    return np.stack([x * math.cos(a), x * math.sin(a)], axis=1)


def add(buf, x, t0):
    """Mix x (n,2) into buf at time t0 (seconds), clipped to the buffer."""
    i = int(round(t0 * SR))
    if i >= len(buf) or i + len(x) <= 0:
        return
    a, b = max(0, i), min(len(buf), i + len(x))
    buf[a:b] += x[a - i: b - i]


def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def hp(x, fc, order=2):
    sos = signal.butter(order, fc, "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, min(hi, SR * 0.45)], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def attack(x, ms=3.0):
    n = min(len(x), int(SR * ms / 1000))
    if n > 1:
        x[:n] *= np.linspace(0, 1, n) ** 1.5
    return x


def fade_out(x, sec):
    n = min(len(x), int(SR * sec))
    if n > 1:
        x[-n:] *= np.linspace(1, 0, n)[:, None] if x.ndim == 2 else np.linspace(1, 0, n)
    return x


def noise(n):
    return RNG.standard_normal(n)


def sweep_sine(f0, f1, dur, curve="exp"):
    t = tt(dur)
    if curve == "exp":
        f = f0 * (f1 / f0) ** (t / dur)
    else:
        f = f0 + (f1 - f0) * (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph)


# ------------------------------------------------------------------ tonal instruments
def marimba(f, dur=0.5, vel=1.0):
    L = max(0.9, dur + 0.5) if f < 400 else max(0.7, dur + 0.35)
    t = tt(L)
    idx = 1.3 * np.exp(-t * 32)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * 4.0 * f * t))
    x += 0.22 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t * 20)
    x *= np.exp(-t * (3.2 + f / 600))
    return attack(x * vel, 1.5)


def pluck(f, dur=0.4, vel=1.0, bright=1.0):
    L = dur + 0.6
    t = tt(L)
    x = np.zeros_like(t)
    for k in range(1, 11):
        if k * f > 12000:
            break
        x += (1 / k ** (1.35 - 0.25 * bright)) * np.sin(2 * np.pi * k * f * t + k) * np.exp(-t * (2.2 + 1.9 * k))
    rel = np.clip(1 - (t - dur) / 0.25, 0, 1) ** 2
    return attack(x * rel * vel * 0.6, 2)


def glock(f, dur=0.3, vel=1.0):
    t = tt(2.2)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.0)
    x += 0.35 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 6)
    x += 0.18 * np.sin(2 * np.pi * 5.40 * f * t) * np.exp(-t * 11)
    return attack(x * vel * 0.55, 1)


def musicbox(f, dur=0.3, vel=1.0):
    t = tt(2.6)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 1.6)
    x += 0.28 * np.sin(2 * np.pi * 3.0 * f * t) * np.exp(-t * 4.5)
    x += 0.12 * np.sin(2 * np.pi * 4.95 * f * t) * np.exp(-t * 9)
    x += 0.05 * np.sin(2 * np.pi * 8.1 * f * t) * np.exp(-t * 20)
    return attack(x * vel * 0.55, 1)


def bell(f, dur=0.5, vel=1.0, decay=1.4):
    t = tt(max(1.5, decay * 2.2))
    idx = 2.2 * np.exp(-t * 3.0)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * 3.5 * f * t)) * np.exp(-t / decay * 2.2)
    return attack(x * vel * 0.5, 1)


def piano(f, dur=0.5, vel=1.0):
    L = dur + 1.2
    t = tt(L)
    B = 0.00035
    x = np.zeros_like(t)
    for k in range(1, 14):
        fk = k * f * math.sqrt(1 + B * k * k)
        if fk > 14000:
            break
        amp = (1 / k ** 1.6) * (0.5 + 0.5 * vel) ** (k * 0.3)
        dec = 0.5 + 0.32 * k + f / 900
        for det in (-0.0006, 0.0006):
            x += amp * 0.5 * np.sin(2 * np.pi * fk * (1 + det) * t + k * 0.7) * np.exp(-t * dec)
    rel = np.where(t < dur, 1.0, np.exp(-(t - dur) * 7))
    x *= rel
    ham = lp(noise(len(t)), 2500) * np.exp(-t * 180) * 0.15
    return attack((x + ham) * vel * 0.55, 1.2)


def bass(f, dur=0.5, vel=1.0):
    L = dur + 0.12
    t = tt(L)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)
    x = np.tanh(1.6 * x) / np.tanh(1.6)
    env = 0.65 + 0.35 * np.exp(-t * 7)
    env *= np.where(t < dur, 1.0, np.exp(-(t - dur) * 40))
    return attack(x * env * vel * 0.6, 6)


def saw(f, t, phase=0.0):
    return 2 * ((f * t + phase) % 1.0) - 1


def pad(freqs, dur, vel=1.0, cutoff=1800, att=0.7, rel=1.2, width=1.0):
    L = dur + rel
    t = tt(L)
    out = np.zeros((len(t), 2))
    for f in freqs:
        for ch in range(2):
            v = np.zeros_like(t)
            for d, ph in ((-0.0045, 0.1), (0.0, 0.5), (0.0045, 0.8)):
                dd = d * (1 if ch == 0 else -1) * width
                v += saw(f * (1 + dd), t, ph + ch * 0.33)
            out[:, ch] += v / 3
    out = lp(out, cutoff, 2)
    env = np.minimum(1.0, t / att) * np.where(t < dur, 1.0, np.exp(-(t - dur) / rel * 4))
    env *= 1 + 0.06 * np.sin(2 * np.pi * 0.25 * t)
    return out * env[:, None] * vel * 0.16 / max(1, len(freqs) ** 0.5)


# ------------------------------------------------------------------ drums
def kick(vel=1.0):
    t = tt(0.45)
    f = 44 + 120 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 8.5)
    x += hp(noise(len(t)), 3000) * np.exp(-t * 400) * 0.25
    return attack(x * vel * 0.9, 0.5)


def clap(vel=1.0):
    t = tt(0.35)
    n = bp(noise(len(t)), 900, 3200)
    env = np.zeros_like(t)
    for d in (0.0, 0.011, 0.022):
        env += np.where(t >= d, np.exp(-(t - d) * 140), 0)
    env += np.where(t >= 0.03, np.exp(-(t - 0.03) * 16) * 0.55, 0)
    return n * env * vel * 0.6


def shaker(vel=1.0):
    t = tt(0.09)
    n = hp(noise(len(t)), 6500)
    env = np.minimum(1, t / 0.008) * np.exp(-t * 55)
    return n * env * vel * 0.28


def snare_soft(vel=1.0):
    t = tt(0.25)
    x = bp(noise(len(t)), 1500, 7000) * np.exp(-t * 26) * 0.5
    x += np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5
    return x * vel


# ------------------------------------------------------------------ reverb
_IR = {}


def ir(kind="hall"):
    if kind not in _IR:
        rt = {"hall": 2.2, "room": 0.7, "big": 3.4}[kind]
        n = int(SR * rt * 1.1)
        t = np.arange(n) / SR
        out = np.zeros((n, 2))
        for ch in range(2):
            nz = noise(n)
            bright = lp(nz, 7000) * np.exp(-t * 6.9 / rt * 1.4)
            dark = lp(nz, 2200) * np.exp(-t * 6.9 / rt)
            out[:, ch] = bright * 0.4 + dark
        pre = int(SR * 0.018)
        out = np.vstack([np.zeros((pre, 2)), out])
        out /= np.sqrt(np.sum(out ** 2) / 2)
        _IR[kind] = out
    return _IR[kind]


def reverb(x, kind="hall", wet=0.25):
    """x: (n,2). Returns dry + wet with tail appended."""
    h = ir(kind)
    y = np.zeros((len(x) + len(h) - 1, 2))
    for ch in range(2):
        y[:, ch] = signal.oaconvolve(x[:, ch], h[:, ch])
    out = y * wet
    out[: len(x)] += x * (1 - wet * 0.3)
    return out


def norm_peak(x, peak=0.5):
    m = np.max(np.abs(x)) + 1e-9
    return x * (peak / m)
