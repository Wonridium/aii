"""Scene model, lip-sync envelopes, captions and transitions."""
import json
import math
import os

import numpy as np
import skia
import soundfile as sf

from engine import (FPS, H, HERE, P, W, Xf, clamp, ease_in_out, ease_out, ease_out_back,
                    font, mix, paint, prog, rrect, text, with_alpha)

VOICE_DIR = os.path.join(HERE, "build", "voice")
DUR = json.load(open(os.path.join(VOICE_DIR, "durations.json")))
WORDS = json.load(open(os.path.join(VOICE_DIR, "words.json")))

from script import LINES  # noqa: E402


class Span:
    def __init__(self, a, b):
        self.start, self.end = a, b

    @property
    def dur(self):
        return self.end - self.start

    def __repr__(self):
        return f"Span({self.start:.2f},{self.end:.2f})"


class Scene:
    """A shot. `draw(c, t, g)` paints it at local time t (may exceed dur)."""

    def __init__(self, name, trans="cut", tin=0.0):
        self.name = name
        self.trans, self.tin = trans, tin
        self.cues = []  # (kind, t, payload...)
        self.dur = 0.0
        self.start = 0.0
        self.draw = None
        self.post = None  # optional fx(c, t, g) on top of everything but captions
        self.captions = True
        self.voice_fx = {}
        self.post_arr = None  # optional fx(c, t, g, rgba_array)

    def say(self, lid, at, fx=None):
        self.cues.append(("voice", at, lid))
        if fx:
            self.voice_fx[lid] = fx
        return Span(at, at + DUR[lid])

    def sfx(self, at, name, vol=1.0, pan=0.0, **kw):
        self.cues.append(("sfx", at, name, vol, pan, kw))

    def word_time(self, lid, span, idx):
        """Absolute (scene-local) start time of word #idx of a line."""
        w = WORDS[lid]
        idx = max(0, min(idx, len(w) - 1))
        return span.start + w[idx][1]

    def word_at(self, lid, span, needle, nth=0):
        n = 0
        for i, (wd, a, b) in enumerate(WORDS[lid]):
            if needle.lower() in wd.lower():
                if n == nth:
                    return span.start + a
                n += 1
        raise KeyError(f"{needle} not in {lid}")


# ---------------------------------------------------------------- lip sync
_ENV = {}


def envelope(lid):
    if lid not in _ENV:
        a, sr = sf.read(os.path.join(VOICE_DIR, f"{lid}.wav"))
        hop = sr // 120
        n = len(a) // hop
        rms = np.sqrt(np.mean(a[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
        db = 20 * np.log10(rms + 1e-9)
        v = np.clip((db + 42) / 26, 0, 1)
        # smooth attack/release so the mouth doesn't flicker
        out = np.zeros_like(v)
        s = 0.0
        for i, x in enumerate(v):
            k = 0.55 if x > s else 0.25
            s += (x - s) * k
            out[i] = s
        _ENV[lid] = out
    return _ENV[lid]


class G:
    """Per-frame global context handed to scene draw functions."""

    def __init__(self, timeline):
        self.tl = timeline
        self.T = 0.0
        self.frame = 0

    def mouth(self, speaker, T=None):
        T = self.T if T is None else T
        best = 0.0
        for (t0, lid, spk) in self.tl.voice_index:
            if spk != speaker or T < t0 or T > t0 + DUR[lid] + 0.05:
                continue
            env = envelope(lid)
            i = int((T - t0) * 120)
            if 0 <= i < len(env):
                # add a little flutter so vowels read as speech
                best = max(best, env[i] * (0.75 + 0.25 * math.sin(T * 38)))
        return best

    def speaking(self, speaker, T=None):
        T = self.T if T is None else T
        for (t0, lid, spk) in self.tl.voice_index:
            if spk == speaker and t0 <= T <= t0 + DUR[lid]:
                return True
        return False


class Timeline:
    def __init__(self, scenes):
        self.scenes = scenes
        t = 0.0
        for s in scenes:
            s.start = t
            t += s.dur
        self.duration = t
        self.voice_index = []
        for s in scenes:
            for cue in s.cues:
                if cue[0] == "voice":
                    lid = cue[2]
                    self.voice_index.append((s.start + cue[1], lid, LINES[lid][0]))
        self.voice_index.sort()

    def scene_at(self, T):
        for i, s in enumerate(self.scenes):
            if T < s.start + s.dur:
                return i
        return len(self.scenes) - 1

    def all_cues(self):
        out = []
        for s in self.scenes:
            for cue in s.cues:
                out.append((cue[0], s.start + cue[1]) + tuple(cue[2:]) + (s,))
        return sorted(out, key=lambda x: x[1])


# ---------------------------------------------------------------- captions
SPEAKER_TAG = {
    "CLAWD": ("Claude", P["clay"]),
    "KID": ("Mia", P["fig"]),
    "MAN": ("Sam", P["sky"]),
    "WOMAN": ("Nora", P["olive"]),
    "NARR": (None, None),
}


def _lines_of(words, f, maxw):
    rows, cur, w = [], [], 0.0
    sp = f.measureText(" ")
    for i, wd in enumerate(words):
        ww = f.measureText(wd)
        if cur and w + sp + ww > maxw:
            rows.append(cur)
            cur, w = [], 0.0
        cur.append(i)
        w += (sp if len(cur) > 1 else 0) + ww
    if cur:
        rows.append(cur)
    return rows


def draw_captions(c, tl, T, dim=0.0):
    f = font(46, wght=600)
    ftag = font(28, wght=700)
    vi = tl.voice_index
    for n, (t0, lid, spk) in enumerate(vi):
        d = DUR[lid]
        nxt = vi[n + 1][0] - t0 if n + 1 < len(vi) else 99.0
        hold = min(d + 0.45, nxt)
        if not (t0 - 0.05 <= T <= t0 + hold):
            continue
        local = T - t0
        a_in = ease_out(prog(local, -0.05, 0.18))
        a_out = 1 - prog(local, hold - 0.2, 0.2)
        alpha = a_in * a_out
        if alpha <= 0:
            continue
        words = [w[0] for w in WORDS[lid]]
        rows = _lines_of(words, f, 1300)
        sp = f.measureText(" ")
        row_h = 58
        total_h = row_h * len(rows)
        widths = [sum(f.measureText(words[i]) for i in r) + sp * (len(r) - 1) for r in rows]
        bw = max(widths) + 70
        bh = total_h + 34
        by = H - 70 - bh
        bx = W / 2 - bw / 2
        lift = (1 - a_in) * 18
        narr = spk == "NARR"
        with Xf(c, 0, lift, alpha=alpha):
            rrect(c, bx, by + 10, bw, bh, 30, (0.1, 0.06, 0.03, 0.22), blur=16)
            rrect(c, bx, by, bw, bh, 30, with_alpha(P["ivory"], 0.94) if not narr else (0.13, 0.12, 0.11, 0.86))
            tag, tcol = SPEAKER_TAG[spk]
            if tag:
                tw = ftag.measureText(tag) + 34
                rrect(c, bx + 26, by - 22, tw, 42, 21, tcol)
                text(c, tag, bx + 26 + tw / 2, by + 8, ftag, P["white"])
            base = P["slate"] if not narr else P["ivory"]
            hl = P["clay"] if not narr else P["gold"]
            for ri, r in enumerate(rows):
                x = W / 2 - widths[ri] / 2
                y = by + 17 + row_h * ri + 44
                for i in r:
                    wd, ws, we = WORDS[lid][i]
                    ww = f.measureText(wd)
                    # word reveal: pop from 0.6 opacity as it's spoken
                    k = ease_out_back(prog(local, ws - 0.04, 0.16), 2.0)
                    on = local >= ws - 0.04
                    speaking = ws - 0.04 <= local <= we + 0.08
                    col = hl if speaking else base
                    a = 1.0 if on else 0.32
                    s = 1.0 + (0.1 * (1 - k) if on and k < 1 else 0)
                    with Xf(c, x + ww / 2, y - 14, s=s, alpha=a):
                        text(c, wd, 0, 14, f, col)
                    x += ww + sp


# ---------------------------------------------------------------- transitions
def clawd_silhouette(cx, cy, h):
    u = h / 10.0
    path = skia.Path()
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(cx - 6 * u, cy - 5 * u, 12 * u, 8 * u), 0.7 * u, 0.7 * u)
    path.addRRect(rr)
    path.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(cx - 8 * u, cy - 1 * u, 16 * u, 2 * u), 0.4 * u, 0.4 * u))
    for lx in (-5, -3, 2, 4):
        path.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(cx + lx * u, cy + 2.8 * u, u, 2.2 * u), 0.3 * u, 0.3 * u))
    path.setFillType(skia.PathFillType.kWinding)
    return path


def composite_transition(c, kind, p, img_prev, img_next):
    """Paint the blend of two full frames at progress p (0..1)."""
    samp = skia.SamplingOptions(skia.FilterMode.kLinear)
    if kind == "fade":
        c.drawImage(img_prev, 0, 0)
        pt = skia.Paint()
        pt.setAlphaf(ease_in_out(p))
        c.drawImage(img_next, 0, 0, samp, pt)
    elif kind == "iris":  # next scene grows out of a Clawd-shaped hole
        c.drawImage(img_prev, 0, 0)
        e = ease_in_out(p)
        h = 1 + e * 4200
        c.save()
        c.clipPath(clawd_silhouette(W / 2, H / 2, h), doAntiAlias=True)
        c.drawImage(img_next, 0, 0)
        c.restore()
    elif kind in ("slide", "slide_l"):
        e = ease_in_out(p)
        d = 1 if kind == "slide" else -1
        c.drawImage(img_prev, -d * e * W, 0)
        c.drawImage(img_next, d * (1 - e) * W, 0)
        # soft seam shadow
        x = d * (1 - e) * W + (0 if d > 0 else W)
        rrect(c, x - 30, -50, 60, H + 100, 30, (0, 0, 0, 0.15 * math.sin(p * math.pi)), blur=24)
    elif kind == "wipe":  # clay band sweeps diagonally
        e = ease_in_out(p)
        band = 520
        x = -band - 400 + e * (W + 2 * band + 800)
        c.drawImage(img_next, 0, 0)
        c.save()
        path = skia.Path()
        path.moveTo(x - 300, -10)
        path.lineTo(W + 800, -10)
        path.lineTo(W + 800, H + 10)
        path.lineTo(x - 300 - 400, H + 10)
        path.close()
        c.clipPath(path, doAntiAlias=True)
        c.drawImage(img_prev, 0, 0)
        c.restore()
        for off, col in ((0, P["clay"]), (-150, P["gold"]), (-260, P["ivory"])):
            pth = skia.Path()
            pth.moveTo(x + off - 300, -10)
            pth.lineTo(x + off - 300 + 140, -10)
            pth.lineTo(x + off - 700 + 140, H + 10)
            pth.lineTo(x + off - 700, H + 10)
            pth.close()
            c.drawPath(pth, paint(col))
    elif kind == "white":
        if p < 0.5:
            c.drawImage(img_prev, 0, 0)
        else:
            c.drawImage(img_next, 0, 0)
        a = 1 - abs(p - 0.5) * 2
        c.drawRect(skia.Rect.MakeWH(W, H), paint((1, 0.99, 0.96, ease_out(a))))
    elif kind == "black":
        if p < 0.5:
            c.drawImage(img_prev, 0, 0)
        else:
            c.drawImage(img_next, 0, 0)
        a = 1 - abs(p - 0.5) * 2
        c.drawRect(skia.Rect.MakeWH(W, H), paint((0.03, 0.03, 0.03, clamp(a * 1.4))))
    elif kind == "zoom":  # punch into next
        e = ease_in_out(p)
        c.save()
        s = 1 + e * 0.35
        c.translate(W / 2, H / 2)
        c.scale(s, s)
        c.translate(-W / 2, -H / 2)
        c.drawImage(img_prev, 0, 0)
        c.restore()
        pt = skia.Paint()
        pt.setAlphaf(ease_in_out(clamp(p * 1.6 - 0.3)))
        c.save()
        s2 = 0.85 + 0.15 * e
        c.translate(W / 2, H / 2)
        c.scale(s2, s2)
        c.translate(-W / 2, -H / 2)
        c.drawImage(img_next, 0, 0, samp, pt)
        c.restore()
    else:
        c.drawImage(img_next, 0, 0)
