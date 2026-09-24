"""Pixel-level effects applied on the raw RGBA frame (numpy, in place)."""
import math
import random

import numpy as np


def chroma_shift(arr, px):
    if px <= 0:
        return
    r = arr[:, :, 0].copy()
    b = arr[:, :, 2].copy()
    arr[:, px:, 0] = r[:, :-px]
    arr[:, :-px, 2] = b[:, px:]


def slice_jitter(arr, t, amp, n=6):
    rng = random.Random(int(t * 30))
    H = arr.shape[0]
    for _ in range(n):
        y = rng.randrange(0, H - 10)
        h = rng.randrange(6, 60)
        dx = rng.randint(-amp, amp)
        if dx:
            arr[y:y + h] = np.roll(arr[y:y + h], dx, axis=1)


def tracking_band(arr, t):
    H = arr.shape[0]
    y = int((t * 900) % (H + 200)) - 100
    y0, y1 = max(0, y), min(H, y + 70)
    if y1 <= y0:
        return
    band = arr[y0:y1].astype(np.int16)
    noise = np.random.default_rng(int(t * 60)).integers(-60, 80, band.shape[:2])[:, :, None]
    band[:, :, :3] = np.clip(band[:, :, :3] * 0.7 + 60 + noise, 0, 255)
    arr[y0:y1] = np.roll(band.astype(np.uint8), 25, axis=1)
