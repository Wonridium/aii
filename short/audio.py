"""Mix for "The Bug": FluidSynth score + Kokoro voices + Kenney CC0 foley + synth ambience."""
import json
import os
import random
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "video"))
import sfx as synthfx  # noqa: E402
from synth import SR, add, bp, hp, lp, noise, reverb, stereo  # noqa: E402

from beats import BEAT, DUR, T  # noqa: E402

BUILD = os.path.join(HERE, "build")
KEN = os.path.join(HERE, "..", "assets", "sfx")


def db(x):
    return 10 ** (x / 20)


def ken(pack, name, gain=1.0, pitch=1.0, pan=0.0):
    a, sr = sf.read(os.path.join(KEN, pack, "Audio", name))
    if a.ndim == 2:
        a = a.mean(1)
    if sr != SR or pitch != 1.0:
        a = signal.resample_poly(a, int(SR / pitch), sr) if pitch != 1.0 else signal.resample_poly(a, SR, sr)
    a = a / (np.abs(a).max() + 1e-9)
    return stereo(a * gain, pan)


def chirp(n=1, base=2300, gap=0.09, dur=0.1, up=True):
    out = np.zeros(int(SR * (n * (dur + gap) + 0.2)))
    for k in range(n):
        t = np.arange(int(dur * SR)) / SR
        f0, f1 = (base, base * 1.45) if up else (base * 1.3, base * 0.95)
        f = f0 + (f1 - f0) * (t / dur) ** 0.7
        f *= 1 + 0.04 * np.sin(2 * np.pi * 32 * t)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 0.8
        x += 0.25 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR) * np.sin(np.pi * t / dur)
        i0 = int(k * (dur + gap) * SR)
        out[i0: i0 + len(x)] += x
    return reverb(stereo(out * 0.6), "room", 0.2)


def scurry(dur=0.6):
    rng = np.random.default_rng(3)
    out = np.zeros(int(SR * dur))
    t = 0.0
    while t < dur - 0.02:
        L = int(0.006 * SR)
        x = bp(noise(L), 3000, 9000) * np.exp(-np.arange(L) / SR * 900)
        i0 = int(t * SR)
        out[i0: i0 + L] += x * rng.uniform(0.4, 1.0)
        t += rng.uniform(0.02, 0.04)
    return stereo(out * 0.5)


def flutter(dur=1.3):
    t = np.arange(int(dur * SR)) / SR
    x = bp(noise(len(t)), 150, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 38 * t)) ** 2
    env = np.sin(np.pi * t / dur)
    return stereo(x * env * 0.6, -0.3)


def rain(dur, open_t):
    t = np.arange(int(dur * SR)) / SR
    bed = lp(hp(noise(len(t)), 400), 5000) * 0.18
    rng = np.random.default_rng(8)
    drops = np.zeros(len(t))
    for _ in range(int(dur * 45)):
        i = rng.integers(0, len(t) - 800)
        L = 400
        drops[i: i + L] += bp(noise(L), 2500, 8000) * np.exp(-np.arange(L) / SR * 400) * rng.uniform(0.1, 0.5)
    x = bed + drops
    # muffled until the window opens; after that the rain has stopped (clear night)
    k = np.clip((t - open_t) / 0.8, 0, 1)
    muff = lp(x, 1400)
    y = muff * (1 - k) * 0.9 + x * 0.0
    L_ = y
    R_ = np.roll(y, 300)
    return np.stack([L_, R_], 1)


def crickets(dur):
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros((len(t), 2))
    for k, (f, rate, pan) in enumerate(((4300, 3.1, -0.6), (4700, 2.3, 0.5), (3900, 1.7, 0.1))):
        pulse = (np.sin(2 * np.pi * rate * t + k) > 0.55).astype(float)
        trill = (np.sin(2 * np.pi * 28 * t) > 0).astype(float)
        x = np.sin(2 * np.pi * f * t) * pulse * trill
        x = lp(x, 7000) * 0.06
        out += stereo(x, pan)
    return out


def voice(lid):
    a, sr = sf.read(os.path.join(BUILD, "voice", f"{lid}.wav"))
    m = np.abs(a) > 0.02
    r = np.sqrt((a[m] ** 2).mean()) if m.sum() > 100 else np.sqrt((a ** 2).mean())
    return stereo(a * db(-18) / r)


def env_follow(x, att=0.03, rel=0.35):
    hop = SR // 200
    n = len(x) // hop
    r = np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1))
    out, s = np.zeros(n), 0.0
    ka, kr = 1 - np.exp(-1 / (att * 200)), 1 - np.exp(-1 / (rel * 200))
    for i, v in enumerate(r):
        s += (v - s) * (ka if v > s else kr)
        out[i] = s
    full = np.repeat(out, hop)
    return np.concatenate([full, np.full(len(x) - len(full), full[-1])])


def build():
    n = int((DUR + 0.5) * SR)
    fx = np.zeros((n, 2))
    vo = np.zeros((n, 2))
    amb = np.zeros((n, 2))
    rng = random.Random(4)

    # --- A: typing on a mechanical keyboard
    t = 0.2
    while t < T["typing_end"]:
        add(fx, ken("ui-audio", f"switch{rng.randint(1, 38)}.ogg", 0.16, rng.uniform(0.9, 1.15), 0.25), t)
        t += rng.uniform(0.06, 0.13)
    add(fx, ken("interface-sounds", "select_001.ogg", 0.25), T["run"])
    for k, tk in enumerate(T["ok"]):
        add(fx, ken("interface-sounds", "confirmation_001.ogg", 0.12, 1 + 0.08 * k), tk)
    add(fx, ken("interface-sounds", "error_004.ogg", 0.45), T["fail"])
    add(fx, synthfx.render("boom_soft") * 0.25, T["fail"])
    # --- B
    add(fx, scurry(0.6) * 0.5, T["bug_out"])
    add(fx, chirp(1, 2600), T["eep"])
    add(fx, synthfx.render("whoosh") * 0.12, T["clawd_in"] - 0.25)
    add(fx, synthfx.render("pop") * 0.25, T["found"] - 0.05)
    add(fx, chirp(2, 3000, gap=0.05, dur=0.07), T["found"] + 0.55)
    # --- C: the chase
    add(fx, synthfx.render("whoosh_up") * 0.18, T["bug_jump"])
    for k, tk in enumerate(T["keys"]):
        add(fx, ken("ui-audio", f"switch{(k * 5) % 38 + 1}.ogg", 0.45, 1.0 + 0.05 * (k % 4), -0.2 + 0.08 * k), tk)
    add(fx, lp(scurry(1.6), 6000) * 0.3, T["to_mug"])
    add(fx, ken("impact-sounds", "impactPlate_light_001.ogg", 0.35, 1.2, 0.4), T["under_mug"])
    add(fx, ken("impact-sounds", "impactPlate_light_003.ogg", 0.25, 1.4, 0.4), T["under_mug"] + 0.18)
    for k in range(8):  # Clawd's little footsteps
        add(fx, ken("impact-sounds", f"footstep_wood_00{k % 5}.ogg", 0.12, 1.5, 0.0), T["keys"][0] + k * BEAT)
    add(fx, ken("impact-sounds", "impactPlate_light_002.ogg", 0.3, 1.1, 0.3), T["lift"])
    add(fx, ken("interface-sounds", "question_002.ogg", 0.3), T["lift"] + 0.3)
    add(fx, chirp(1, 2900), T["reveal"] + 0.05)
    # --- D
    add(fx, synthfx.render("boing") * 0.12, T["hop_down"])
    add(fx, ken("interface-sounds", "open_002.ogg", 0.25), T["sign"])
    add(fx, chirp(3, 1900, gap=0.03, dur=0.05, up=False) * 0.6, T["sign"] + 0.2)
    add(fx, chirp(2, 2100, gap=0.12, dur=0.12, up=False), T["nod"])
    add(fx, synthfx.render("hug") * 0.3, T["cup"])
    # --- E: the window
    add(fx, ken("interface-sounds", "maximize_004.ogg", 0.3, 0.8), T["open"])
    add(fx, synthfx.render("whoosh") * 0.2, T["open"])
    add(fx, synthfx.render("sparkle") * 0.4, T["glow"])
    add(fx, flutter(1.3) * 0.5, T["fly"])
    # --- F
    for k, tk in enumerate(T["checks"]):
        add(fx, ken("interface-sounds", "tick_001.ogg" if k % 2 else "tick_002.ogg", 0.12, 1 + 0.04 * k), tk)
    add(fx, synthfx.render("confetti") * 0.35, T["passed"])
    add(fx, ken("interface-sounds", "confirmation_004.ogg", 0.3), T["passed"])
    # --- G
    add(fx, synthfx.render("wink") * 0.2, T["blinks"][1] + 0.3)

    # ambience
    add(amb, rain(T["cut_window"] + 1.5, T["open"]) * 0.9, 0.0)
    cr = crickets(DUR - T["open"])
    cr *= np.clip(np.arange(len(cr)) / (SR * 0.8), 0, 1)[:, None]
    add(amb, cr, T["open"])

    # voices
    for lid in ("found", "lost", "go", "green", "thanks"):
        add(vo, voice(lid) * (0.8 if lid == "thanks" else 1.0), T[lid])
    vo = reverb(vo, "room", 0.06)[:n]

    finish(vo, fx, amb, n)


def finish(vo, fx, amb, n):
    """Score + ducking + soft limiting + two-pass loudnorm to -14 LUFS."""
    sc, sr = sf.read(os.path.join(BUILD, "score.wav"))
    assert sr == SR
    sc = sc[:n]
    mus = np.zeros((n, 2))
    mus[: len(sc)] = sc
    mus *= db(-24) / (np.sqrt((mus ** 2).mean()) + 1e-9)
    duck = 1 - 0.45 * np.clip(env_follow(vo[:, 0]) / db(-24), 0, 1)
    fduck = 1 - 0.35 * np.clip(env_follow(vo[:, 0]) / db(-24), 0, 1)
    mix = vo + mus * duck[:, None] + fx * 0.9 * fduck[:, None] + amb * 0.6
    tail = int(0.7 * SR)
    end = int(DUR * SR)
    mix[end - tail: end] *= np.linspace(1, 0, tail)[:, None] ** 1.5
    mix[end:] = 0
    mix = hp(mix, 25)
    peak = np.abs(mix).max()
    mix = np.tanh(mix / peak * 1.2) / np.tanh(1.2) * 0.95
    raw = os.path.join(BUILD, "mix_raw.wav")
    sf.write(raw, mix[:end].astype(np.float32), SR, subtype="FLOAT")
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True)
    m = json.loads(r.stderr[r.stderr.rindex("{"): r.stderr.rindex("}") + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", af, "-ar", "48000",
                    os.path.join(BUILD, "mix.wav")], check=True)
    print("mix ok, measured", m["input_i"])


if __name__ == "__main__":
    build()
