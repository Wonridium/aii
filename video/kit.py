"""Shared helpers for scene code: camera, grading, motion snippets."""
import math
import random
from contextlib import contextmanager

import skia

from engine import H, W, clamp, ease_in, ease_out, layer_with_filter, prog, saturation_filter


@contextmanager
def camera(c, zoom=1.0, cx=W / 2, cy=H / 2, rot=0.0, shake=(0.0, 0.0)):
    c.save()
    c.translate(W / 2 + shake[0], H / 2 + shake[1])
    if rot:
        c.rotate(math.degrees(rot))
    c.scale(zoom, zoom)
    c.translate(-cx, -cy)
    try:
        yield c
    finally:
        c.restore()


@contextmanager
def graded(c, sat=1.0, bright=1.0, contrast=1.0, tint=(0, 0, 0)):
    if sat >= 0.999 and abs(bright - 1) < 1e-3 and abs(contrast - 1) < 1e-3 and tint == (0, 0, 0):
        yield c
        return
    layer_with_filter(c, saturation_filter(sat, bright, tint, contrast))
    try:
        yield c
    finally:
        c.restore()


def shake(t, hits, dur=0.45, amp=16):
    """Sum of decaying jitters for each hit time."""
    dx = dy = 0.0
    for h in hits:
        if isinstance(h, tuple):
            h, a = h
        else:
            a = amp
        d = t - h
        if 0 <= d < dur:
            k = (1 - d / dur) ** 2 * a
            dx += math.sin(d * 91 + h * 7) * k
            dy += math.cos(d * 77 + h * 3) * k
    return dx, dy


def land(t, t0, amp=0.28, freq=2.6, damp=7.5):
    """Squash wobble after landing at t0 (positive = squashed)."""
    d = t - t0
    if d < 0:
        return 0.0
    return amp * math.exp(-damp * d) * math.cos(2 * math.pi * freq * d)


def hop(t, t0, dur=0.45, height=80):
    """Parabolic hop; returns (y_offset, squash)."""
    d = t - t0
    if d < -0.12 or d > dur + 0.6:
        return 0.0, 0.0
    if d < 0:  # anticipation crouch
        return 0.0, 0.18 * math.sin((d + 0.12) / 0.12 * math.pi / 2)
    if d < dur:
        p = d / dur
        return -4 * height * p * (1 - p), -0.12 * math.sin(p * math.pi)
    return 0.0, land(t, t0 + dur, amp=0.22)


def breathe(t, seed=0.0):
    return 0.018 * math.sin(t * 2.4 + seed)


def talk_bounce(g, spk):
    return 0.06 * g.mouth(spk)


def arc(p, x0, y0, x1, y1, lift=200):
    """Point along a quadratic arc from (x0,y0) to (x1,y1)."""
    p = clamp(p)
    mx, my = (x0 + x1) / 2, min(y0, y1) - lift
    x = (1 - p) ** 2 * x0 + 2 * (1 - p) * p * mx + p * p * x1
    y = (1 - p) ** 2 * y0 + 2 * (1 - p) * p * my + p * p * y1
    return x, y


def floaty(t, seed, amp=8.0):
    return math.sin(t * 1.6 + seed) * amp, math.cos(t * 1.3 + seed * 1.7) * amp * 0.6


def dust(c, t, seed=0, n=26, col=(1, 1, 1, 0.5), speed=14):
    from engine import circle, with_alpha
    rng = random.Random(seed)
    for i in range(n):
        x0, y0 = rng.uniform(0, W), rng.uniform(0, H)
        s = rng.uniform(0.5, 1.0)
        x = (x0 + math.sin(t * 0.3 + i) * 30) % W
        y = (y0 - t * speed * s) % H
        circle(c, x, y, 2 + 3 * s, with_alpha(col, col[3] * (0.5 + 0.5 * math.sin(t + i))))
