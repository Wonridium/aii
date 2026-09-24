"""Tiny 2D animation engine on top of skia: easing, paint helpers, text, fx."""
import math
import os
import random

import numpy as np
import skia

W, H = 1920, 1080
FPS = int(os.environ.get("FPS", 60))
HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- palette
def hexc(h, a=1.0):
    h = h.lstrip("#")
    return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255, a)


P = {
    "ivory": hexc("#FAF9F5"),
    "cream": hexc("#F0EEE6"),
    "oat": hexc("#E3DACC"),
    "slate": hexc("#141413"),
    "ink": hexc("#262624"),
    "clay": hexc("#D97757"),
    "clay_lt": hexc("#E8987C"),
    "clay_dk": hexc("#B85F42"),
    "olive": hexc("#788C5D"),
    "olive_lt": hexc("#9DB27F"),
    "sky": hexc("#6A9BCC"),
    "sky_lt": hexc("#A8C8E6"),
    "heather": hexc("#CBCADB"),
    "fig": hexc("#C46686"),
    "gold": hexc("#F2C14E"),
    "blush": hexc("#F2A3A0"),
    "white": (1, 1, 1, 1),
    "gray": hexc("#9A9893"),
}


def mix(a, b, t):
    t = clamp(t)
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(4))


def with_alpha(c, a):
    return (c[0], c[1], c[2], c[3] * a)


def c4(c):
    return skia.Color4f(*c)


# ---------------------------------------------------------------- math
def clamp(x, lo=0.0, hi=1.0):
    return lo if x < lo else hi if x > hi else x


def lerp(a, b, t):
    return a + (b - a) * t


def prog(t, start, dur):
    """0..1 progress of t across [start, start+dur]."""
    if dur <= 0:
        return 1.0 if t >= start else 0.0
    return clamp((t - start) / dur)


def ease_in_out(x):
    x = clamp(x)
    return 4 * x * x * x if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_in(x):
    x = clamp(x)
    return x * x * x


def ease_out_back(x, s=1.70158):
    x = clamp(x)
    c3 = s + 1
    return 1 + c3 * (x - 1) ** 3 + s * (x - 1) ** 2


def ease_out_elastic(x):
    x = clamp(x)
    if x in (0.0, 1.0):
        return x
    return 2 ** (-10 * x) * math.sin((x * 10 - 0.75) * (2 * math.pi) / 3) + 1


def spring(t, freq=3.2, damp=5.0):
    """Damped spring from 0 to 1 over time t (seconds). Overshoots a bit."""
    if t <= 0:
        return 0.0
    return 1 - math.exp(-damp * t) * math.cos(2 * math.pi * freq * t)


def pop(t, start, dur=0.45):
    """Scale-in with overshoot, 0 before start."""
    if t < start:
        return 0.0
    return ease_out_back(prog(t, start, dur), 2.2)


def wobble(t, speed=1.0, seed=0):
    """Smooth pseudo-noise in [-1,1]."""
    return (math.sin(t * 1.7 * speed + seed * 12.9) * 0.6
            + math.sin(t * 2.9 * speed + seed * 4.1) * 0.3
            + math.sin(t * 5.3 * speed + seed * 7.7) * 0.1)


def bump(t, start, dur):
    """0 -> 1 -> 0 sine bump."""
    p = prog(t, start, dur)
    return math.sin(p * math.pi) if 0 < p < 1 else 0.0


def fade_io(t, start, end, fin=0.3, fout=0.3):
    return min(prog(t, start, fin), 1 - prog(t, end - fout, fout))


# ---------------------------------------------------------------- paints
def paint(color, stroke=None, blur=0.0, cap_round=True):
    p = skia.Paint(AntiAlias=True)
    p.setColor4f(c4(color))
    if stroke:
        p.setStyle(skia.Paint.kStroke_Style)
        p.setStrokeWidth(stroke)
        if cap_round:
            p.setStrokeCap(skia.Paint.kRound_Cap)
            p.setStrokeJoin(skia.Paint.kRound_Join)
    if blur > 0:
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    return p


def rrect(c, x, y, w, h, r, color, **kw):
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), r, r), paint(color, **kw))


def circle(c, x, y, r, color, **kw):
    c.drawCircle(x, y, r, paint(color, **kw))


def oval(c, x, y, rx, ry, color, **kw):
    c.drawOval(skia.Rect.MakeLTRB(x - rx, y - ry, x + rx, y + ry), paint(color, **kw))


def line(c, x0, y0, x1, y1, color, width):
    c.drawLine(x0, y0, x1, y1, paint(color, stroke=width))


def poly(c, pts, color, closed=True, **kw):
    path = skia.Path()
    path.moveTo(*pts[0])
    for p in pts[1:]:
        path.lineTo(*p)
    if closed:
        path.close()
    c.drawPath(path, paint(color, **kw))


def shadow(c, x, y, rx, ry=None, alpha=0.18):
    ry = ry if ry is not None else rx * 0.22
    oval(c, x, y, rx, ry, (0.08, 0.06, 0.04, alpha), blur=max(2.0, ry * 0.35))


def star_path(cx, cy, r_out, r_in, n=5, rot=-math.pi / 2):
    path = skia.Path()
    for i in range(n * 2):
        r = r_out if i % 2 == 0 else r_in
        a = rot + i * math.pi / n
        pt = (cx + math.cos(a) * r, cy + math.sin(a) * r)
        path.moveTo(*pt) if i == 0 else path.lineTo(*pt)
    path.close()
    return path


def sparkle_path(cx, cy, r, thin=0.28):
    """Four-point twinkle."""
    path = skia.Path()
    k = r * thin
    path.moveTo(cx, cy - r)
    path.quadTo(cx + k * 0.3, cy - k * 0.3, cx + r, cy)
    path.quadTo(cx + k * 0.3, cy + k * 0.3, cx, cy + r)
    path.quadTo(cx - k * 0.3, cy + k * 0.3, cx - r, cy)
    path.quadTo(cx - k * 0.3, cy - k * 0.3, cx, cy - r)
    path.close()
    return path


def sparkle(c, x, y, r, color, rot=0.0):
    c.save()
    c.translate(x, y)
    c.rotate(math.degrees(rot))
    c.drawPath(sparkle_path(0, 0, r), paint(color))
    c.restore()


# ---------------------------------------------------------------- text
_TF = {}


def typeface(name="Fredoka", wght=None):
    key = (name, wght)
    if key not in _TF:
        fn = f"{name}-{wght}.ttf" if wght else f"{name}.ttf"
        _TF[key] = skia.Typeface.MakeFromFile(os.path.join(HERE, "fonts", fn))
    return _TF[key]


def font(size, name="Fredoka", wght=600):
    f = skia.Font(typeface(name, wght if name in ("Fredoka", "Nunito") else None), size)
    f.setEdging(skia.Font.Edging.kAntiAlias)
    f.setSubpixel(True)
    return f


def text_width(s, f):
    return f.measureText(s)


def text(c, s, x, y, f, color, align="center", outline=None, outline_w=0.0, shadow_a=0.0):
    w = f.measureText(s)
    if align == "center":
        x -= w / 2
    elif align == "right":
        x -= w
    if shadow_a > 0:
        c.drawString(s, x + 0, y + f.getSize() * 0.07, f, paint((0.1, 0.07, 0.05, shadow_a), blur=f.getSize() * 0.06))
    if outline:
        p = paint(outline, stroke=outline_w)
        c.drawString(s, x, y, f, p)
    c.drawString(s, x, y, f, paint(color))
    return w


# ---------------------------------------------------------------- canvas helpers
class Xf:
    """Context manager for save/translate/rotate/scale/restore."""

    def __init__(self, c, x=0, y=0, s=1.0, sy=None, rot=0.0, alpha=None):
        self.c, self.x, self.y, self.s, self.sy, self.rot, self.alpha = c, x, y, s, sy, rot, alpha

    def __enter__(self):
        c = self.c
        if self.alpha is not None and self.alpha < 0.999:
            c.saveLayerAlpha(None, int(clamp(self.alpha) * 255))
        else:
            c.save()
        c.translate(self.x, self.y)
        if self.rot:
            c.rotate(math.degrees(self.rot))
        sy = self.s if self.sy is None else self.sy
        if self.s != 1.0 or sy != 1.0:
            c.scale(self.s, sy)
        return c

    def __exit__(self, *a):
        self.c.restore()


def saturation_filter(sat, bright=1.0, tint=(0, 0, 0), contrast=1.0):
    lr, lg, lb = 0.2126, 0.7152, 0.0722
    s = sat
    m = [
        (lr * (1 - s) + s), lg * (1 - s), lb * (1 - s),
        lr * (1 - s), (lg * (1 - s) + s), lb * (1 - s),
        lr * (1 - s), lg * (1 - s), (lb * (1 - s) + s),
    ]
    k = bright * contrast
    off = (1 - contrast) * 0.5
    return skia.ColorFilters.Matrix([
        m[0] * k, m[1] * k, m[2] * k, 0, tint[0] + off,
        m[3] * k, m[4] * k, m[5] * k, 0, tint[1] + off,
        m[6] * k, m[7] * k, m[8] * k, 0, tint[2] + off,
        0, 0, 0, 1, 0,
    ])


def layer_with_filter(c, cf):
    p = skia.Paint()
    p.setColorFilter(cf)
    c.saveLayer(None, p)


def vignette(c, strength=0.35, color=(0.1, 0.06, 0.03)):
    shader = skia.GradientShader.MakeRadial(
        (W / 2, H / 2), W * 0.75,
        [skia.Color4f(*color, 0.0).toColor(), skia.Color4f(*color, 0.0).toColor(),
         skia.Color4f(*color, strength).toColor()],
        [0.0, 0.55, 1.0])
    p = skia.Paint(AntiAlias=True)
    p.setShader(shader)
    c.drawPaint(p)


def bg_gradient(c, top, bottom):
    shader = skia.GradientShader.MakeLinear(
        [(0, 0), (0, H)], [c4(top).toColor(), c4(bottom).toColor()])
    p = skia.Paint()
    p.setShader(shader)
    c.drawPaint(p)


def radial_glow(c, x, y, r, color, alpha=0.5):
    shader = skia.GradientShader.MakeRadial(
        (x, y), r, [c4(with_alpha(color, alpha)).toColor(), c4(with_alpha(color, 0)).toColor()])
    p = skia.Paint(AntiAlias=True)
    p.setShader(shader)
    c.drawCircle(x, y, r, p)


# ---------------------------------------------------------------- grain
_GRAIN = []


def grain_images():
    if not _GRAIN:
        rng = np.random.default_rng(7)
        for _ in range(8):
            n = rng.normal(0.5, 0.22, (H // 2, W // 2))
            a = np.clip(n * 255, 0, 255).astype(np.uint8)
            rgba = np.dstack([a, a, a, np.full_like(a, 255)])
            _GRAIN.append(skia.Image.fromarray(np.ascontiguousarray(rgba), colorType=skia.kRGBA_8888_ColorType))
    return _GRAIN


def film_grain(c, frame, alpha=0.05):
    imgs = grain_images()
    img = imgs[frame % len(imgs)]
    p = skia.Paint()
    p.setAlphaf(alpha)
    p.setBlendMode(skia.BlendMode.kOverlay)
    c.drawImageRect(img, skia.Rect.MakeWH(W, H), skia.SamplingOptions(skia.FilterMode.kLinear), p)


# ---------------------------------------------------------------- particles
class Burst:
    """Deterministic radial burst of confetti/sparkles."""

    def __init__(self, x, y, t0, n=18, speed=520, colors=None, seed=1, kind="confetti",
                 gravity=900, life=1.4, size=12):
        rng = random.Random(seed)
        self.t0, self.life, self.kind, self.gravity = t0, life, kind, gravity
        self.parts = []
        colors = colors or [P["clay"], P["gold"], P["sky"], P["olive_lt"], P["fig"]]
        for i in range(n):
            a = rng.uniform(0, 2 * math.pi) if kind != "fountain" else rng.uniform(-math.pi * 0.85, -math.pi * 0.15)
            v = speed * rng.uniform(0.45, 1.0)
            self.parts.append(dict(
                x=x, y=y, vx=math.cos(a) * v, vy=math.sin(a) * v,
                col=rng.choice(colors), rot=rng.uniform(0, 6.28), vr=rng.uniform(-9, 9),
                size=size * rng.uniform(0.6, 1.3), shape=rng.randint(0, 2)))

    def draw(self, c, t):
        dt = t - self.t0
        if dt < 0 or dt > self.life:
            return
        fade = 1 - ease_in(dt / self.life)
        drag = 1 - math.exp(-2.2 * dt)
        for p in self.parts:
            x = p["x"] + p["vx"] * drag / 2.2
            y = p["y"] + p["vy"] * drag / 2.2 + 0.5 * self.gravity * dt * dt * 0.6
            col = with_alpha(p["col"], fade)
            s = p["size"]
            if self.kind == "sparkle":
                sparkle(c, x, y, s * (0.6 + 0.4 * math.sin(dt * 12 + p["rot"])), col, p["rot"])
            else:
                with Xf(c, x, y, rot=p["rot"] + p["vr"] * dt):
                    if p["shape"] == 0:
                        rrect(c, -s / 2, -s / 4, s, s / 2, s / 6, col)
                    elif p["shape"] == 1:
                        circle(c, 0, 0, s / 2.6, col)
                    else:
                        c.drawPath(star_path(0, 0, s / 1.8, s / 4), paint(col))
