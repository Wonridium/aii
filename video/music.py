"""Original score, generated from a single leitmotif in several moods.

Theme: a bouncy 8-bar melody over I-vi-IV-V in C. Part 1 plays it bright and
busy, then bends it into C minor on a music box. Part 2 brings it back warm
(piano), then triumphant.
"""
import math

import numpy as np

from synth import (SR, bass, clap, fade_out, glock, kick, marimba, mtof, musicbox, pad, piano,
                   pluck, reverb, shaker, snare_soft, stereo)

# (start_beat, midi, dur_beats) over 8 bars of 4/4
MELODY = [
    (0, 76, .5), (.5, 79, .5), (1, 84, 1), (2, 83, .5), (2.5, 79, .5), (3, 76, 1),
    (4, 76, .5), (4.5, 77, .5), (5, 76, .5), (5.5, 74, .5), (6, 72, 1), (7, 69, 1),
    (8, 72, .5), (8.5, 74, .5), (9, 77, 1), (10, 76, .5), (10.5, 74, .5), (11, 72, 1),
    (12, 74, .5), (12.5, 76, .5), (13, 79, 1.5), (14.5, 77, .5), (15, 74, 1),
    (16, 79, .5), (16.5, 81, .5), (17, 79, .5), (17.5, 76, .5), (18, 72, 1), (19, 76, 1),
    (20, 76, .5), (20.5, 77, .5), (21, 76, .5), (21.5, 72, .5), (22, 69, 1.5), (23.5, 72, .5),
    (24, 77, .5), (24.5, 76, .5), (25, 74, .5), (25.5, 72, .5), (26, 74, 1), (27, 77, 1),
    (28, 79, 1), (29, 77, .5), (29.5, 76, .5), (30, 74, 1), (31, 71, 1),
]
# chord per bar: (root midi, intervals)
MAJ, MIN = (0, 4, 7), (0, 3, 7)
PROG = [(48, MAJ), (45, MIN), (41, MAJ), (43, MAJ)] * 2
PROG_MINOR = [(48, MIN), (44, MAJ), (41, MIN), (43, MAJ)] * 2


def to_minor(m):
    pc = m % 12
    return m - 1 if pc in (4, 9) else m


class Song:
    def __init__(self, bpm, bars, minor=False, tail=3.0):
        self.bpm = bpm
        self.beat = 60.0 / bpm
        self.bars = bars
        self.minor = minor
        self.len = bars * 4 * self.beat
        self.buses = {k: np.zeros((int((self.len + tail) * SR), 2)) for k in ("dry", "verb")}

    def put(self, x, beat, pan=0.0, verb=0.3, gain=1.0):
        if x.ndim == 1:
            x = stereo(x, pan)
        i = int(beat * self.beat * SR)
        if i >= len(self.buses["dry"]):
            return
        for bus, g in (("dry", 1 - verb * 0.5), ("verb", verb)):
            b = self.buses[bus]
            n = min(len(x), len(b) - i)
            b[i: i + n] += x[:n] * g * gain

    def chord(self, bar):
        p = PROG_MINOR if self.minor else PROG
        return p[bar % len(p)]

    def render(self, room="hall"):
        wet = reverb(self.buses["verb"], room, 1.0)
        out = self.buses["dry"].copy()
        n = min(len(out), len(wet))
        out[:n] += wet[:n] * 0.9
        return out


def arrange(song, density, lead="marimba", octave=0, humanize=0.0, drums=True, sparkle=False):
    """Lay the theme down. `density(bar)` in 0..1 controls how many layers play."""
    rng = np.random.default_rng(7)
    b = song.beat
    for bar in range(song.bars):
        d = density(bar)
        root, iv = song.chord(bar)
        beat0 = bar * 4
        # pad
        if d > 0.05:
            freqs = [mtof(root + 12 + i) for i in iv] + [mtof(root + 24)]
            cutoff = 900 if song.minor else 1700 + 900 * d
            song.put(pad(freqs, 4 * b, vel=0.8 + 0.4 * d, cutoff=cutoff, att=0.35, rel=0.9), beat0, verb=0.45,
                     gain=0.8)
        # lead melody
        if d > 0.25:
            mel_bar = bar % 8
            for (st, m, du) in MELODY:
                if mel_bar * 4 <= st < mel_bar * 4 + 4:
                    mm = to_minor(m) if song.minor else m
                    mm += octave
                    at = beat0 + (st - mel_bar * 4) + rng.uniform(-humanize, humanize)
                    v = 0.85 + 0.15 * (st % 1 == 0)
                    if lead == "marimba":
                        song.put(marimba(mtof(mm), du * b, v), at, pan=0.1, verb=0.25)
                    elif lead == "musicbox":
                        song.put(musicbox(mtof(mm + 12), du * b, v * 0.9), at, pan=0.15, verb=0.55)
                    elif lead == "piano":
                        song.put(piano(mtof(mm), du * b * 1.1, v * 0.9), at, pan=0.05, verb=0.35)
                    elif lead == "glock":
                        song.put(glock(mtof(mm + 12), du * b, v * 0.8), at, pan=0.2, verb=0.4)
        # arpeggio
        if d > 0.4:
            tones = [root + 24 + iv[0], root + 24 + iv[1], root + 24 + iv[2], root + 36]
            order = [0, 1, 2, 3, 2, 1, 2, 1]
            for k in range(8):
                song.put(pluck(mtof(tones[order[k]]), 0.45 * b, 0.55 + 0.1 * (k % 2 == 0)), beat0 + k * 0.5,
                         pan=-0.35, verb=0.3, gain=0.7)
        # piano left hand in warm mode
        if lead == "piano" and d > 0.05:
            for k, off in enumerate((0, 1.5, 2, 3)):
                m = root + 12 + iv[k % 3]
                song.put(piano(mtof(m), 0.9 * b, 0.45), beat0 + off, pan=-0.2, verb=0.35, gain=0.8)
        # bass
        if d > 0.45:
            song.put(bass(mtof(root - 12 if root > 44 else root), 1.4 * b, 0.9), beat0, verb=0.05)
            song.put(bass(mtof(root - 12 + iv[2] if root > 44 else root + iv[2]), 0.9 * b, 0.8), beat0 + 2, verb=0.05)
            if d > 0.8:
                song.put(bass(mtof(root - 12 if root > 44 else root), 0.4 * b, 0.6), beat0 + 3.5, verb=0.05)
        # glock counter line
        if d > 0.85 or sparkle:
            song.put(glock(mtof(root + 48 + iv[2]), b, 0.45), beat0, pan=0.45, verb=0.5)
            song.put(glock(mtof(root + 48 + iv[1]), b, 0.4), beat0 + 2, pan=0.45, verb=0.5)
        # drums
        if drums:
            if d > 0.4:
                for k in range(16):
                    song.put(shaker(0.6 + 0.4 * (k % 2 == 0)), beat0 + k * 0.25, pan=0.3, verb=0.1,
                             gain=0.7 * min(1, d * 1.2))
            if d > 0.65:
                for k in (0, 2):
                    song.put(kick(0.9), beat0 + k, verb=0.02)
                if bar % 2 == 1:
                    song.put(kick(0.7), beat0 + 2.5, verb=0.02)
            if d > 0.8:
                for k in (1, 3):
                    song.put(clap(0.8), beat0 + k, pan=-0.05, verb=0.2)
            elif d > 0.5:
                for k in (1, 3):
                    song.put(snare_soft(0.5), beat0 + k, verb=0.2, gain=0.6)


def tape_stop(x, dur=0.7):
    """Slow the last `dur` seconds down to a halt (pitch + speed)."""
    n = int(dur * SR)
    if len(x) < n:
        return x
    head, tail = x[:-n], x[-n:]
    # read position advances with a decreasing rate
    rate = np.linspace(1.0, 0.0, n) ** 1.3
    pos = np.cumsum(rate)
    pos = pos[pos < n - 1]
    out = np.zeros((n, 2))
    i0 = pos.astype(int)
    fr = (pos - i0)[:, None]
    out[: len(pos)] = tail[i0] * (1 - fr) + tail[i0 + 1] * fr
    out[: len(pos)] *= np.linspace(1, 0.0, len(pos))[:, None] ** 0.7
    return np.vstack([head, out])


def segment(style, dur, **kw):
    """Render one music cue of length `dur` seconds."""
    if style == "playful":
        s = Song(112, math.ceil(dur / (4 * 60 / 112)) + 1)
        arrange(s, lambda bar: [0.3, 0.3, 0.45, 0.5, 0.5, 0.5, 0.55, 0.55][bar % 8] if bar < 8 else 0.55)
    elif style == "busy":
        s = Song(112, math.ceil(dur / (4 * 60 / 112)) + 1)
        dens = kw["density"]
        arrange(s, lambda bar: dens(bar * 4 * s.beat))
    elif style == "sad":
        s = Song(76, math.ceil(dur / (4 * 60 / 76)) + 1, minor=True)
        arrange(s, lambda bar: 0.3 if bar > 0 else 0.3, lead="musicbox", drums=False)
    elif style == "drone":
        t = np.arange(int(dur * SR)) / SR
        x = np.zeros((len(t), 2))
        for f, a in ((mtof(36), 0.5), (mtof(43), 0.25), (mtof(48), 0.18), (mtof(51), 0.1)):
            for ch in range(2):
                x[:, ch] += a * np.sin(2 * np.pi * f * (1 + 0.002 * ch) * t) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.1 * t + ch))
        x *= np.minimum(1, t / 2.0)[:, None] * 0.25
        return x
    elif style == "sad_tail":
        s = Song(60, 3, minor=True)
        for i, m in enumerate([72, 67, 63, 60]):
            s.put(musicbox(mtof(m + 12), 1.0, 0.6), i * 1.5, verb=0.6)
        return s.render("big")
    elif style == "warm":
        s = Song(96, math.ceil(dur / (4 * 60 / 96)) + 1)
        dens = kw.get("density", lambda T: 0.35)
        arrange(s, lambda bar: dens(bar * 4 * s.beat), lead="piano", drums=True, humanize=0.015)
    elif style == "uplift":
        s = Song(112, math.ceil(dur / (4 * 60 / 112)) + 1)
        arrange(s, lambda bar: 1.0 if bar > 0 else 0.7, lead="marimba", sparkle=True)
        # doubled melody on glock for lift
        arrange_lead_double(s)
    elif style == "bed":
        s = Song(80, math.ceil(dur / (4 * 60 / 80)) + 1)
        for bar in range(s.bars):
            root, iv = [(48, MAJ), (48, MAJ), (45, MIN), (41, MAJ)][bar % 4]
            freqs = [mtof(root + 12 + i) for i in iv] + [mtof(root + 24 + 2)]
            s.put(pad(freqs, 4 * s.beat, vel=0.8, cutoff=1400, att=0.6, rel=1.0), bar * 4, verb=0.5, gain=0.7)
    elif style == "night":
        s = Song(72, math.ceil(dur / (4 * 60 / 72)) + 1)
        arrange(s, lambda bar: 0.3, lead="musicbox", drums=False)
    elif style == "finale":
        s = Song(120, math.ceil(dur / (4 * 60 / 120)) + 1)
        arrange(s, lambda bar: 1.0, lead="marimba", sparkle=True)
        arrange_lead_double(s)
    elif style == "outro":
        s = Song(104, math.ceil(dur / (4 * 60 / 104)) + 1)
        arrange(s, lambda bar: 0.5 if bar < 2 else 0.35, lead="marimba", drums=True)
        # final C chord
        s.put(pad([mtof(60), mtof(64), mtof(67), mtof(72)], 3.0, vel=1.0, cutoff=2500, att=0.05, rel=2.0),
              math.floor(dur / s.beat), verb=0.5)
    else:
        raise ValueError(style)
    return s.render()


def arrange_lead_double(s):
    for (st, m, du) in MELODY:
        for rep in range(0, s.bars, 8):
            s.put(glock(mtof(m + 12), du * s.beat, 0.35), rep * 4 + st, pan=-0.3, verb=0.45)
