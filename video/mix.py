"""Mix voices + sfx + score into build/mix.wav, loudness-normalised."""
import json
import os
import subprocess

import numpy as np
import soundfile as sf
from scipy import signal

import music
import sfx
from synth import SR, add, hp, lp, reverb, stereo

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")

VOICE_RMS_DB = -19.0
MUSIC_RMS_DB = -26.5
SFX_GAIN = 0.42


def db(x):
    return 10 ** (x / 20)


def rms_active(x, thr=0.02):
    m = np.abs(x) > thr
    if m.sum() < 100:
        return np.sqrt(np.mean(x ** 2) + 1e-12)
    return np.sqrt(np.mean(x[m] ** 2))


def load_voice(lid, fx=None):
    a, sr = sf.read(os.path.join(BUILD, "voice", f"{lid}.wav"))
    assert sr == SR
    a = a * (db(VOICE_RMS_DB) / rms_active(a))
    x = stereo(a, 0.0)
    if fx == "echo":
        d = int(0.28 * SR)
        y = np.zeros((len(x) + 4 * d, 2))
        for k in range(4):
            y[k * d: k * d + len(x)] += x * (0.45 ** k) * (1 if k == 0 else 0.8)
        x = reverb(y, "big", 0.35)
    return x


def env_follow(x, att=0.03, rel=0.35):
    """Smoothed amplitude envelope of a mono signal."""
    hop = SR // 200
    n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1))
    out = np.zeros(n)
    s = 0.0
    ka, kr = 1 - np.exp(-1 / (att * 200)), 1 - np.exp(-1 / (rel * 200))
    for i, v in enumerate(r):
        s += (v - s) * (ka if v > s else kr)
        out[i] = s
    full = np.repeat(out, hop)
    if len(full) < len(x):
        full = np.concatenate([full, np.full(len(x) - len(full), full[-1] if len(full) else 0.0)])
    return full[: len(x)]


def music_plan(scenes, cues, total):
    S = {s["name"]: s["start"] for s in scenes}
    t_tape = next(c["t"] for c in cues if c.get("name") == "tapestop")
    t_montage, t_couch = S["montage"], S["couch"]

    def busy_density(T):
        g = S["office_bad"] + T
        if g < t_montage - 0.3:
            return 0.45
        if g < t_couch:
            return 1.0
        return 0.42

    def warm_density(T):
        g = S["office_good"] + T
        return 0.35 if g < S["drawing_good"] else 0.6

    return [
        # (style, start, end, gain_db, fade_in, fade_out, kwargs)
        ("playful", 0.0, S["p1_title"] + 0.5, 0.0, 0.2, 0.9, {}),
        ("busy", S["office_bad"] - 0.1, t_tape + 0.15, 0.0, 0.3, 0.0, {"density": busy_density, "tapestop": True}),
        ("sad", t_tape + 1.0, S["alone"] + 1.2, -1.0, 1.5, 1.5, {}),
        ("drone", S["alone"] - 0.5, S["bad_end"] + 0.3, -3.0, 1.2, 0.3, {}),
        ("sad_tail", S["bad_end"] + 1.9, S["rewind"], -3.0, 0.05, 0.3, {}),
        ("warm", S["office_good"], S["montage_good"] + 0.4, -0.5, 0.6, 0.5, {"density": warm_density}),
        ("uplift", S["montage_good"] - 0.05, S["piano"] + 0.6, 0.5, 0.15, 0.7, {}),
        ("bed", S["piano"] + 0.2, S["questions"] + 0.4, -2.0, 0.8, 0.5, {}),
        ("uplift", S["questions"] - 0.05, S["stars"] + 1.0, 0.0, 0.2, 1.2, {}),
        ("night", S["stars"] + 0.4, S["good_end"] + 0.3, -1.0, 1.8, 0.4, {}),
        ("finale", S["good_end"] + 2.1, S["outro"] + 0.9, -0.5, 0.3, 0.9, {}),
        ("outro", S["outro"] + 0.1, total, -1.5, 0.3, 3.0, {}),
    ]


def build_music(scenes, cues, total, n):
    bus = np.zeros((n, 2))
    for style, t0, t1, gdb, fi, fo, kw in music_plan(scenes, cues, total):
        dur = t1 - t0
        kwargs = {k: v for k, v in kw.items() if k != "tapestop"}
        x = music.segment(style, dur, **kwargs)
        x = x[: int(dur * SR)]
        if style not in ("drone", "sad_tail", "bed"):
            x = x * (db(MUSIC_RMS_DB) / (np.sqrt(np.mean(x ** 2)) + 1e-9))
        else:
            x = x * (db(MUSIC_RMS_DB - 2) / (np.sqrt(np.mean(x ** 2)) + 1e-9))
        x = x * db(gdb)
        if kw.get("tapestop"):
            x = music.tape_stop(x, 0.75)
        nfi = int(fi * SR)
        if nfi > 1:
            x[:nfi] *= np.linspace(0, 1, nfi)[:, None]
        nfo = int(fo * SR)
        if nfo > 1:
            x[-nfo:] *= np.linspace(1, 0, nfo)[:, None] ** 1.5
        add(bus, x, t0)
    return bus


def build():
    data = json.load(open(os.path.join(BUILD, "cues.json")))
    total, scenes, cues = data["duration"], data["scenes"], data["cues"]
    n = int((total + 0.5) * SR)
    voice = np.zeros((n, 2))
    fx = np.zeros((n, 2))
    for c in cues:
        if c["kind"] == "voice":
            add(voice, load_voice(c["id"], c.get("fx")), c["t"])
        else:
            kw = {k: v for k, v in c.items() if k not in ("kind", "t", "name", "vol", "pan")}
            x = sfx.render(c["name"], **kw) * c["vol"] * SFX_GAIN
            p = c.get("pan", 0.0)
            if p:
                x = x * np.array([min(1, 1 - p), min(1, 1 + p)])
            add(fx, x, c["t"])
    # light shared room on the dialogue so it sits in the same space as the sfx
    voice = reverb(voice, "room", 0.07)[:n]
    voice = hp(voice, 70)
    mus = build_music(scenes, cues, total, n)

    # sidechain: duck music (and a little sfx) under dialogue
    venv = env_follow(voice[:, 0], 0.03, 0.4)
    duck = 1 - 0.5 * np.clip(venv / db(VOICE_RMS_DB - 6), 0, 1)
    mus *= duck[:, None]

    mixb = voice + mus + fx * (1 - 0.15 * (1 - duck))[:, None]

    # tape rewind: part 1 played backwards, sped up, under the whirr
    S = {s["name"]: s for s in scenes}
    r0, r1 = S["montage"]["start"], S["bad_end"]["start"]
    seg = lp(mixb[int(r0 * SR): int(r1 * SR)][::-1], 1400)  # pre-filter against aliasing
    rw = S["rewind"]
    out_len = int((rw["dur"] - 0.15) * SR)
    pos = np.linspace(0, 1, out_len) ** 1.6 * (len(seg) - 2)
    i0 = pos.astype(int)
    fr = (pos - i0)[:, None]
    rev = lp(seg[i0] * (1 - fr) + seg[i0 + 1] * fr, 3200) * 0.5
    rev *= np.minimum(1, np.linspace(0, rw["dur"], out_len) / 0.08)[:, None]
    add(mixb, rev, rw["start"])

    mixb = hp(mixb, 25)
    # gentle glue compression + soft limiting
    env = env_follow(mixb.mean(1), 0.01, 0.2)
    thr = db(-14)
    gain = np.where(env > thr, (thr / (env + 1e-9)) ** (1 - 1 / 2.0), 1.0)
    mixb *= gain[:, None]
    peak = np.max(np.abs(mixb))
    mixb = np.tanh(mixb / peak * 1.3) / np.tanh(1.3) * 0.95
    raw = os.path.join(BUILD, "mix_raw.wav")
    sf.write(raw, mixb.astype(np.float32), SR, subtype="FLOAT")
    # stems for QA
    sf.write(os.path.join(BUILD, "stem_voice.wav"), voice.astype(np.float32), SR, subtype="FLOAT")

    # two-pass EBU R128 to -14 LUFS / -1.5 dBTP (YouTube-friendly)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af",
                        "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    js = r.stderr[r.stderr.rindex("{"): r.stderr.rindex("}") + 1]
    m = json.loads(js)
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    out = os.path.join(BUILD, "mix.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", af, "-ar", "48000", out], check=True)
    print("measured", m["input_i"], "LUFS ->", out)


if __name__ == "__main__":
    build()
