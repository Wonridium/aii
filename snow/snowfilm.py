""""First Snow": a 30-second Clawd short (same compositor as "The Bug").

  python snowfilm.py stills 3 6.5 12 ...    [VERTICAL=1 for 9:16]
  python snowfilm.py video
"""
import json
import math
import os
import random
import sys

import numpy as np
import skia
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "video"))
sys.path.insert(0, os.path.join(HERE, "..", "short"))

from characters import blink_at, clawd  # noqa: E402
from engine import (H, P, W, Burst, Xf, bump, circle, clamp, ease_in, ease_in_out, ease_out,  # noqa: E402
                    ease_out_back, font, hexc, line, mix, oval, paint, poly, pop, prog, rrect,
                    sparkle, text, with_alpha)
from kit import arc, breathe, hop, land  # noqa: E402

import cine  # noqa: E402
from beats import BEAT, DUR, b  # noqa: E402

BUILD = os.path.join(HERE, "build")
NAME = "first_snow"

T = dict(
    flake0=0.3, whoa=b(2, 1), leave=b(2, 3.5),
    cut_door=b(3, 1), door=b(3, 1), out=b(3, 1.4), snow=b(3, 2.6),
    cut_chase=b(4, 1), land=b(5, 2), aww=b(5, 2.7), look_up=b(5, 4), snowfall=b(6, 1),
    cut_build=b(7, 1), body=b(7, 1.5), legs=[b(7, 2) + k * BEAT / 2 for k in range(4)], arms=b(7, 4),
    eyes=[b(8, 1), b(8, 1.5)], done=b(8, 2), hi=b(8, 3),
    cut_hat=b(9, 1), hat_off=b(9, 1.5), hat_on=b(9, 2.5), blink=b(9, 3.5),
    cut_night=b(10, 1), bulbs=[b(10, 2) + k * BEAT / 4 for k in range(12)], lamp=b(11, 1), lean=b(11, 3),
    cut_sky=b(12, 1), title=b(12, 2.5),
)
CUTS = [T["cut_door"], T["cut_chase"], T["cut_build"], T["cut_hat"], T["cut_night"]]

GROUND = 820
HOUSE = (120, 330, 640, 490)          # x, y, w, h  (walls)
WIN = (470, 420, 220, 190)
DOOR = (200, 600, 130, 220)
LAMP_X = 1560
SNOWMAN_X = 1180
CLAWD_H = 190
LAND_X = 900


def lerp(a, b_, k):
    return a + (b_ - a) * k


def acc(t):
    """Snow accumulation 0..1."""
    return ease_in_out(prog(t, T["snowfall"] - 0.3, 8.5))


def night(t):
    return ease_in_out(prog(t, T["snowfall"], T["cut_night"] - T["snowfall"] + 1.0))


# ---------------------------------------------------------------- props
def hat(c, x, y, u, rot=0.0, s=1.0):
    """Knit beanie; (x, y) = bottom-centre of the cuff."""
    with Xf(c, x, y, s=s, rot=rot):
        dome = skia.Path()
        dome.moveTo(-3.3 * u, 0)
        dome.cubicTo(-3.3 * u, -3.6 * u, 3.3 * u, -3.6 * u, 3.3 * u, 0)
        dome.close()
        c.drawPath(dome, paint(P["fig"]))
        c.save()
        c.clipPath(dome, doAntiAlias=True)
        for k in range(-4, 5):
            rrect(c, k * 0.8 * u - 0.15 * u, -4 * u, 0.3 * u, 4 * u, 0.15 * u, with_alpha(mix(P["fig"], P["slate"], 0.25), 0.6))
        c.restore()
        rrect(c, -3.6 * u, -0.9 * u, 7.2 * u, 1.3 * u, 0.6 * u, P["ivory"])
        for k in range(-3, 4):
            line(c, k * u, -0.8 * u, k * u, 0.2 * u, with_alpha(P["heather"], 0.9), 0.18 * u)
        circle(c, 0, -2.9 * u, 1.05 * u, P["ivory"])
        circle(c, -0.3 * u, -3.2 * u, 0.4 * u, P["white"])


def snowman(c, x, y, h, body=1.0, legs=(1, 1, 1, 1), arms=1.0, eyes=(1, 1), blink=0.0, happy=False, t=0.0):
    """A Clawd made of snow, assembled part by part (each k in 0..1 pops in)."""
    u = h / 10
    white, shade, ink = hexc("#F4F7FB"), hexc("#C9D6E6"), hexc("#3A3F4C")
    if body > 0 or any(legs):
        oval(c, x, y + 4, 7 * u, 1.1 * u, (0.1, 0.12, 0.25, 0.22), blur=6)
    for i, lx in enumerate((-5, -3, 2, 4)):
        k = ease_out_back(clamp(legs[i]), 2.5)
        if k > 0:
            with Xf(c, x + (lx + 0.5) * u, y, s=k):
                rrect(c, -0.55 * u, -2.2 * u, 1.1 * u, 2.3 * u, 0.45 * u, shade)
    k = ease_out_back(clamp(arms), 2.5)
    if k > 0:
        for side in (-1, 1):
            with Xf(c, x + side * 6.7 * u, y - 5 * u, s=k):
                rrect(c, -1.2 * u, -0.9 * u, 2.4 * u, 1.9 * u, 0.7 * u, white)
    k = ease_out_back(clamp(body), 1.8)
    if k > 0:
        with Xf(c, x, y - 2 * u, sy=k, s=1.0):
            rrect(c, -6.1 * u, -8.2 * u, 12.2 * u, 8.2 * u, 1.6 * u, white)
            rrect(c, -6.1 * u, -2.2 * u, 12.2 * u, 2.2 * u, 1.2 * u, with_alpha(shade, 0.7))
            for (sx, sy_, r) in ((-3.5, -6.6, 0.35), (2.2, -3.2, 0.3), (4.4, -6.9, 0.25)):
                circle(c, sx * u, sy_ * u, r * u, with_alpha(shade, 0.8))
    for i, side in enumerate((-1, 1)):
        k = ease_out_back(clamp(eyes[i]), 3)
        if k > 0:
            cx, cy = x + side * 3.5 * u, y - 7 * u
            with Xf(c, cx, cy, s=k):
                if happy:
                    pth = skia.Path()
                    pth.moveTo(-0.75 * u, 0.35 * u)
                    pth.quadTo(0, -1.05 * u, 0.75 * u, 0.35 * u)
                    c.drawPath(pth, paint(ink, stroke=0.45 * u))
                else:
                    eh = 1.8 * u * (1 - 0.9 * blink)
                    rrect(c, -0.5 * u, -eh / 2, u, eh, 0.35 * u, ink)


def pine(c, x, y, s, col, snow_k):
    with Xf(c, x, y, s=s):
        rrect(c, -8, -30, 16, 30, 4, mix(col, P["slate"], 0.4))
        for k in range(4):
            w = 110 - k * 24
            yy = -30 - k * 55
            poly(c, [(-w, yy), (w, yy), (0, yy - 95)], col)
            if snow_k > 0:
                poly(c, [(-w * 0.55, yy - 95 * 0.45), (w * 0.55, yy - 95 * 0.45), (0, yy - 95)],
                     with_alpha(hexc("#F1F5FA"), snow_k))
                rrect(c, -w, yy - 8 * snow_k, 2 * w, 10 * snow_k, 5, with_alpha(hexc("#F1F5FA"), snow_k))


def lamp_post(c, t, on, snow_k):
    x = LAMP_X
    rrect(c, x - 9, 380, 18, GROUND - 380, 6, hexc("#2B2E3F"))
    rrect(c, x - 30, GROUND - 20, 60, 22, 8, hexc("#2B2E3F"))
    rrect(c, x - 34, 330, 68, 70, 12, hexc("#2B2E3F"))
    rrect(c, x - 24, 340, 48, 50, 8, mix(hexc("#5A5A70"), hexc("#FFE3A3"), on))
    poly(c, [(x - 44, 332), (x + 44, 332), (x, 300)], hexc("#2B2E3F"))
    if snow_k > 0:
        rrect(c, x - 40, 322 - 12 * snow_k, 80, 14 * snow_k, 7, hexc("#F1F5FA"))


BULBS = [(150 + k * 52, 318 + 18 * math.sin(k / 11 * math.pi), [P["gold"], P["clay_lt"], hexc("#9FD8FF"), hexc("#B7F09A")][k % 4])
         for k in range(12)]


def house(c, t, door_k, snow_k, bulbs_on):
    x, y, w, h = HOUSE
    wall = hexc("#B8735A")
    rrect(c, x, y, w, h, 6, wall)
    for k in range(9):  # log lines
        line(c, x, y + 30 + k * 52, x + w, y + 30 + k * 52, with_alpha(mix(wall, P["slate"], 0.35), 0.5), 4)
    # chimney + smoke
    rrect(c, x + 470, y - 190, 70, 150, 4, hexc("#8A4E3C"))
    for k in range(5):
        ph = (t * 0.25 + k / 5) % 1
        circle(c, x + 505 + math.sin(ph * 6 + k) * 20 + ph * 60, y - 200 - ph * 260, 18 + ph * 30,
               with_alpha(hexc("#D9DDEA"), 0.35 * (1 - ph)), blur=8)
    # roof
    poly(c, [(x - 60, y + 10), (x + w / 2, y - 170), (x + w + 60, y + 10)], hexc("#4A3942"))
    if snow_k > 0:
        th = 22 * snow_k
        path = skia.Path()
        path.moveTo(x - 64, y + 10)
        path.lineTo(x + w / 2, y - 172)
        path.lineTo(x + w + 64, y + 10)
        path.lineTo(x + w + 64, y + 10 - th * 0.6)
        path.lineTo(x + w / 2, y - 172 - th)
        path.lineTo(x - 64, y + 10 - th * 0.6)
        path.close()
        c.drawPath(path, paint(hexc("#F1F5FA")))
        for k in range(8):  # icicles-ish drips
            ix = x - 40 + k * 95
            rrect(c, ix, y + 6, 12, 10 + 16 * snow_k * (0.5 + 0.5 * math.sin(k * 2.3)), 6, hexc("#F1F5FA"))
    # window: warm interior (emissive)
    wx, wy, ww, wh = WIN
    rrect(c, wx - 14, wy - 14, ww + 28, wh + 28, 8, hexc("#5B3A30"))
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(wx, wy, ww, wh))
    sh = skia.GradientShader.MakeLinear([(0, wy), (0, wy + wh)], [skia.Color4f(*hexc("#FFD9A0")).toColor(),
                                                                   skia.Color4f(*hexc("#F2A76B")).toColor()])
    p = skia.Paint()
    p.setShader(sh)
    c.drawRect(skia.Rect.MakeXYWH(wx, wy, ww, wh), p)
    # a tiny shelf + plant inside
    rrect(c, wx + 20, wy + 140, 90, 10, 3, hexc("#8A5A3C"))
    circle(c, wx + 60, wy + 120, 22, hexc("#6B8F4E"))
    c.restore()
    if snow_k > 0:
        rrect(c, wx - 18, wy + wh + 10 - 12 * snow_k, ww + 36, 14 * snow_k + 4, 6, hexc("#F1F5FA"))
    # door
    dx, dy, dw, dh = DOOR
    rrect(c, dx - 10, dy - 10, dw + 20, dh + 10, 8, hexc("#5B3A30"))
    rrect(c, dx, dy, dw, dh, 4, hexc("#FFD39A"))  # lit doorway behind the door
    with Xf(c, dx, dy):
        c.scale(1 - 0.85 * door_k, 1)
        rrect(c, 0, 0, dw, dh, 4, hexc("#7A4B35"))
        rrect(c, 14, 16, dw - 28, 70, 6, hexc("#6A3F2C"))
        rrect(c, 14, 100, dw - 28, 100, 6, hexc("#6A3F2C"))
        circle(c, dw - 18, 120, 7, P["gold"])
    # string lights along the eaves
    for (bx, by, col) in BULBS:
        pass
    path = skia.Path()
    path.moveTo(BULBS[0][0] - 30, BULBS[0][1] - 8)
    for (bx, by, col) in BULBS:
        path.lineTo(bx, by - 8)
    c.drawPath(path, paint(hexc("#1E2030"), stroke=3))
    for i, (bx, by, col) in enumerate(BULBS):
        k = bulbs_on[i]
        circle(c, bx, by, 9, mix(hexc("#4A4A5A"), col, k))


def snow_ground(c, t, snow_k):
    # distant hills
    for k, (yy, col) in enumerate(((650, hexc("#6C7DA8")), (720, hexc("#55668F")))):
        path = skia.Path()
        path.moveTo(-600, 1200)
        for i in range(0, 29):
            x = -600 + i * 120
            path.lineTo(x, yy - 60 * math.sin(i * 0.7 + k) ** 2 - 20 * k)
        path.lineTo(2800, 1200)
        path.close()
        c.drawPath(path, paint(mix(col, hexc("#E6ECF6"), snow_k * 0.7)))
    for i, (px, s) in enumerate(((1300, 1.0), (1450, 1.3), (1750, 1.1), (1900, 1.45), (2100, 1.0), (-200, 1.2),
                                 (-380, 1.0), (980, 0.8))):
        pine(c, px, GROUND - 10, s, hexc("#2F5B55") if i % 2 else hexc("#274C4A"), snow_k)
    # the ground: autumn earth that turns white
    earth = hexc("#5E5A3E")
    c.drawRect(skia.Rect.MakeLTRB(-1000, GROUND, 3000, 3000), paint(mix(earth, hexc("#E9EFF7"), snow_k)))
    rng = random.Random(6)
    for i in range(60):
        px, py = rng.uniform(-600, 2600), GROUND + rng.uniform(10, 600)
        r = rng.uniform(30, 90)
        k = clamp(snow_k * 2.2 - rng.random())
        if k > 0:
            oval(c, px, py, r * k, r * 0.3 * k, hexc("#F4F7FB"))
    th = 6 + 22 * snow_k
    c.drawRect(skia.Rect.MakeLTRB(-1000, GROUND - th * snow_k, 3000, GROUND + 8), paint(with_alpha(hexc("#F4F7FB"), snow_k)))


# ---------------------------------------------------------------- snow particles
_rng = random.Random(21)
FLAKES = [dict(x=_rng.uniform(-500, 2500), y=_rng.uniform(-700, 1500), v=_rng.uniform(50, 110),
               sw=_rng.uniform(10, 40), ph=_rng.uniform(0, 6.28), z=_rng.random()) for _ in range(900)]


def snow_count(t):
    if t < T["look_up"]:
        return 0
    return int(len(FLAKES) * ease_in(prog(t, T["look_up"], T["snowfall"] + 1.5 - T["look_up"])) ** 0.8)


def snowfall(c, t, layer):
    n = snow_count(t)
    if n == 0:
        return
    for f in FLAKES[:n]:
        near = f["z"] > 0.85
        far = f["z"] < 0.35
        if (layer == "far") != far or (layer == "near") != near:
            continue
        v = f["v"] * (0.6 + f["z"] * 0.9)
        y = (f["y"] + t * v) % 2200 - 700
        x = f["x"] + math.sin(t * 0.9 + f["ph"]) * f["sw"] + t * 12
        r = 2 + f["z"] * 4 if not near else 7 + f["z"] * 6
        a = 0.85 if not far else 0.6
        circle(c, x, y, r, with_alpha(hexc("#F6F9FF"), a), blur=(r * 0.5 if near else 0))


def crystal(c, x, y, r, rot, a=1.0):
    col = with_alpha(hexc("#F6FAFF"), a)
    with Xf(c, x, y, rot=rot):
        for k in range(6):
            with Xf(c, 0, 0, rot=k * math.pi / 3):
                line(c, 0, 0, 0, -r, col, r * 0.14)
                line(c, 0, -r * 0.55, r * 0.28, -r * 0.8, col, r * 0.1)
                line(c, 0, -r * 0.55, -r * 0.28, -r * 0.8, col, r * 0.1)
        circle(c, 0, 0, r * 0.18, col)


# ---------------------------------------------------------------- motion script
def hero_flake(t):
    """The first snowflake: window -> garden -> lands on Clawd and melts."""
    wx, wy, ww, wh = WIN
    if t < T["cut_door"]:
        p = prog(t, T["flake0"], T["cut_door"] - T["flake0"])
        return dict(x=wx + 110 + math.sin(t * 1.6) * 60, y=lerp(wy - 180, wy + wh + 60, p), r=16, rot=t * 0.8)
    if t < T["cut_chase"]:
        p = prog(t, T["cut_door"], 2.5)
        return dict(x=820 + math.sin(t * 1.5) * 50, y=lerp(300, 380, p), r=14, rot=t * 0.8)
    if t < T["land"]:
        p = prog(t, T["cut_chase"], T["land"] - T["cut_chase"])
        x = lerp(820, LAND_X, ease_in_out(p)) + math.sin(t * 2.1) * 180 * (1 - p)
        y = lerp(380, GROUND - CLAWD_H - 34, ease_in(p))
        return dict(x=x, y=y, r=14, rot=t * 0.8)
    if t < T["land"] + 0.8:
        m = prog(t, T["land"], 0.6)
        return dict(x=LAND_X, y=GROUND - CLAWD_H - 34 + 8 * m, r=14 * (1 - m), rot=t * 0.8, melt=m)
    return None


def clawd_state(t):
    st = dict(x=560, y=GROUND, h=CLAWD_H, look=(0, 0), eyes="normal", arm_l=0.0, arm_r=0.0, squash=0.0,
              blush=0.6, tilt=0.0, walk=None, hat=True, visible=True, mouth_spk=True, smile=0.0)
    if t < T["cut_door"]:
        # inside, at the window (drawn by the window pass)
        f = hero_flake(t)
        st.update(x=WIN[0] + 110, y=WIN[1] + WIN[3] + 40, h=150, look=((f["x"] - 580) / 80 if f else 0, clamp((f["y"] - 440) / 120, -1, 1) if f else 0),
                  eyes="wide" if t > T["whoa"] - 0.1 else "normal")
        if t > T["leave"]:
            y, sq = hop(t, T["leave"], 0.3, 40)
            st["y"] += y
            st["squash"] = sq
            st["x"] -= 400 * ease_in(prog(t, T["leave"] + 0.25, 0.4))
        return st
    if t < T["cut_chase"]:
        p = prog(t, T["out"], 0.45)
        x, y = arc(ease_out(p), DOOR[0] + 65, GROUND - 40, 560, GROUND, 120)
        if t < T["out"]:
            st["visible"] = False
        st.update(x=x, y=y if p < 1 else GROUND, squash=land(t, T["out"] + 0.45, 0.3) if p >= 1 else -0.1,
                  look=(0.6, -1) if t > T["snow"] - 0.3 else (0.8, -0.2), eyes="happy" if T["snow"] - 0.1 < t < T["snow"] + 0.9 else "normal",
                  arm_l=1.8 * bump(t, T["snow"] - 0.1, 1.1), arm_r=1.8 * bump(t, T["snow"] - 0.1, 1.1))
        return st
    if t < T["cut_build"]:
        f = hero_flake(t)
        if t < T["land"]:
            # scurry under the drifting flake, hopping on the beat
            tx = f["x"] - 10
            lag = hero_flake(max(T["cut_chase"], t - 0.35))
            x = lerp(560, lag["x"] - 10, clamp((t - T["cut_chase"]) / 0.6))
            y, sq = hop(t, T["cut_chase"] + BEAT * math.floor((t - T["cut_chase"]) / BEAT), 0.3, 26)
            st.update(x=x, y=GROUND + y, squash=sq, walk=t * 3, look=(clamp((f["x"] - x) / 100, -1, 1), -1),
                      arm_l=0.6, arm_r=0.6)
        else:
            st.update(x=LAND_X - 10, look=(0, -1), eyes="wide")
            if t > T["aww"] - 0.1:
                st.update(eyes="sad", smile=-1, look=(0, 0.3))
            if t > T["look_up"]:
                st.update(eyes="wide", smile=0, look=(0, -1))
            if t > T["snowfall"]:
                spin = prog(t, T["snowfall"] + 0.1, 1.2)
                st.update(eyes="star", blush=1.0, arm_l=1.9 + 0.3 * math.sin(t * 9), arm_r=1.9 + 0.3 * math.sin(t * 9 + 1),
                          flip=int(spin * 4) % 2 == 1 if 0 < spin < 1 else False)
                y, sq = hop(t, T["snowfall"] + BEAT * math.floor((t - T["snowfall"]) / BEAT), 0.35, 45)
                st.update(y=GROUND + y, squash=sq)
        return st
    if t < T["cut_hat"]:
        st.update(x=SNOWMAN_X - 300, look=(1, 0), eyes="happy" if t > T["done"] else "normal", blush=1.0)
        # a little hop + reach for every part added
        beats = [T["body"]] + T["legs"] + [T["arms"]] + T["eyes"]
        for tb in beats:
            if tb - 0.2 < t < tb + 0.1:
                st["arm_r"] = 1.4 * bump(t, tb - 0.2, 0.3)
        y, sq = hop(t, T["done"], 0.35, 50)
        st.update(y=GROUND + y, squash=sq + breathe(t))
        if t > T["hi"] - 0.1:
            st.update(eyes="normal", arm_r=1.5 + 0.3 * math.sin(t * 12))
        return st
    if t < T["cut_night"]:
        st.update(x=SNOWMAN_X - 280, look=(1, -0.2), eyes="normal", blush=1.0, hat=t < T["hat_off"])
        if t > T["blink"]:
            st.update(eyes="wide")
        if t > T["blink"] + 0.35:
            st.update(eyes="happy", arm_l=1.4, arm_r=1.4)
        return st
    # night: sitting together
    lean = ease_in_out(prog(t, T["lean"], 0.6))
    st.update(x=SNOWMAN_X - 230 + 20 * lean, look=(0.5, -0.4), eyes="happy" if t > T["lamp"] else "normal", hat=False,
              tilt=0.1 * lean, blush=1.0)
    return st


def snowman_state(t):
    if t < T["cut_build"]:
        return None
    return dict(body=prog(t, T["body"], 0.35), legs=[prog(t, tl, 0.3) for tl in T["legs"]],
                arms=prog(t, T["arms"], 0.3), eyes=[prog(t, te, 0.25) for te in T["eyes"]],
                blink=bump(t, T["blink"], 0.22), happy=t > T["lean"] + 0.2,
                hat=prog(t, T["hat_on"], 0.001) if t > T["cut_hat"] else 0.0)


# ---------------------------------------------------------------- cameras
def camera_at(t):
    if t < T["cut_door"]:
        return 2.3 + 0.15 * prog(t, 0, 5), 590, 500
    if t < T["cut_chase"]:
        return 1.45, 520, 620
    if t < T["cut_build"]:
        cs = clawd_state(t)
        k = ease_in_out(prog(t, T["snowfall"] - 0.2, 1.4))
        z = lerp(1.5, 1.05, k)
        cx = lerp(clamp(cs["x"], 700, 1300), 980, k)
        return z, cx, lerp(600, 520, k)
    if t < T["cut_hat"]:
        return 2.0 + 0.1 * prog(t, T["cut_build"], 5), (SNOWMAN_X - 300 + SNOWMAN_X) / 2, 660
    if t < T["cut_night"]:
        return 2.4 + 0.1 * prog(t, T["cut_hat"], 2.5), SNOWMAN_X - 140, 650
    if t < T["cut_sky"]:
        return 1.0 + 0.05 * prog(t, T["cut_night"], 5), 900, 520
    k = ease_in_out(prog(t, T["cut_sky"], 2.2))
    return 1.05, 900, lerp(520, 200, k)


def camera_v(t):
    """9:16 framing: keep the ground around 60% of the frame height, clear of captions."""
    def cy_for(z, ground_frac=0.60):
        return GROUND - (ground_frac * H - H / 2) / z
    if t < T["cut_door"]:
        return 2.0, 590, 520
    if t < T["cut_chase"]:
        return 1.6, 420, cy_for(1.6)
    if t < T["cut_build"]:
        cs = clawd_state(t)
        k = ease_in_out(prog(t, T["snowfall"] - 0.2, 1.4))
        z = lerp(1.7, 1.25, k)
        return z, lerp(clamp(cs["x"], 560, 1400), 1000, k), cy_for(z)
    if t < T["cut_hat"]:
        return 1.8, SNOWMAN_X - 150, cy_for(1.8, 0.58)
    if t < T["cut_night"]:
        return 2.2, SNOWMAN_X - 140, cy_for(2.2, 0.58)
    if t < T["cut_sky"]:
        return 1.25, 950, cy_for(1.25)
    k = ease_in_out(prog(t, T["cut_sky"], 2.2))
    return 1.25, 950, lerp(cy_for(1.25), 150, k)


# ---------------------------------------------------------------- lighting
def ambient(t):
    n = night(t)
    return mix((0.86, 0.82, 0.92, 1), (0.50, 0.55, 0.80, 1), n)[:3]


def lamp_on(t):
    return ease_out(prog(t, T["lamp"], 0.15))


def bulbs_on(t):
    return [ease_out(prog(t, tb, 0.12)) for tb in T["bulbs"]]


def light_map(c, t, cam, masks):
    c.clear(skia.Color4f(*ambient(t), 1.0))
    c.save()
    cine.world_cam(c, cam)
    wx, wy, ww, wh = WIN
    cine.pool(c, wx + ww / 2, wy + wh + 120, 520, (0.55, 0.38, 0.2), 0.9)
    door_k = ease_out(prog(t, T["door"], 0.35))
    if door_k > 0:
        cine.pool(c, DOOR[0] + 65, GROUND, 460, (0.55, 0.38, 0.18), door_k)
    lo = lamp_on(t)
    if lo > 0:
        cine.pool(c, LAMP_X, 600, 700, (0.62, 0.48, 0.25), lo)
    for i, k in enumerate(bulbs_on(t)):
        if k > 0:
            bx, by, col = BULBS[i]
            cine.pool(c, bx, by + 40, 170, col[:3], 0.35 * k)
    if masks:
        white = paint((1, 1, 1, 1))
        c.drawRect(skia.Rect.MakeXYWH(wx, wy, ww, wh), white)
        if lo > 0:
            rrect(c, LAMP_X - 24, 340, 48, 50, 8, (lo, lo, lo * 0.9, 1))
        for i, k in enumerate(bulbs_on(t)):
            if k > 0:
                circle(c, BULBS[i][0], BULBS[i][1], 10, (1, 1, 1, k))
        dx, dy, dw, dh = DOOR
        if door_k > 0:
            c.drawRect(skia.Rect.MakeXYWH(dx, dy, dw, dh), white)
    c.restore()


def glows(c, t, cam, glow):
    wx, wy, ww, wh = WIN
    glow(wx + ww / 2, wy + wh / 2, 260, hexc("#FFC98A"), 0.25)
    lo = lamp_on(t)
    if lo > 0:
        glow(LAMP_X, 365, 220, hexc("#FFE3A3"), 0.5 * lo)
    for i, k in enumerate(bulbs_on(t)):
        if k > 0:
            glow(BULBS[i][0], BULBS[i][1], 50, BULBS[i][2], 0.5 * k)
    f = hero_flake(t)
    if f and not f.get("melt"):
        glow(f["x"], f["y"], 60, hexc("#DDEBFF"), 0.35)
    if T["blink"] - 0.05 < t < T["blink"] + 0.8:
        glow(SNOWMAN_X, GROUND - 130, 200, hexc("#CFE6FF"), 0.5 * bump(t, T["blink"] - 0.05, 0.85))


# ---------------------------------------------------------------- the frame
def sky(c, t):
    n = night(t)
    top = mix(hexc("#394A86"), hexc("#0F1433"), n)
    bot = mix(hexc("#E8A88F"), hexc("#3B3E6E"), n)
    sh = skia.GradientShader.MakeLinear([(0, -900), (0, GROUND)], [skia.Color4f(*top).toColor(), skia.Color4f(*bot).toColor()])
    p = skia.Paint()
    p.setShader(sh)
    c.drawRect(skia.Rect.MakeLTRB(-2000, -2000, 4000, GROUND + 5), p)
    if n > 0:
        rng = random.Random(2)
        for i in range(160):
            sx, sy = rng.uniform(-600, 2600), rng.uniform(-1200, 500)
            tw = 0.5 + 0.5 * math.sin(t * rng.uniform(1.5, 3.2) + i)
            circle(c, sx, sy, rng.uniform(1.2, 3.0), with_alpha(P["ivory"], n * tw * 0.9))
        circle(c, 1650, -60, 60, with_alpha(hexc("#F4EBD3"), n))
        circle(c, 1650, -60, 140, with_alpha(hexc("#F4EBD3"), 0.12 * n), blur=30)


def draw_world(c, t, cam, part):
    c.save()
    cine.world_cam(c, cam)
    a = acc(t)
    door_k = ease_out(prog(t, T["door"], 0.35))
    if part == "bg":
        close = T["cut_build"] <= t < T["cut_night"]
        if close:  # shallow depth of field on the close-ups
            pb = skia.Paint()
            pb.setImageFilter(skia.ImageFilters.Blur(10, 10))
            c.saveLayer(None, pb)
        sky(c, t)
        snowfall(c, t, "far")
        snow_ground(c, t, a)
        house(c, t, door_k, a, bulbs_on(t))
        lamp_post(c, t, lamp_on(t), a)
        if close:
            c.restore()
            # the ground under the actors stays sharp
            c.drawRect(skia.Rect.MakeLTRB(-1000, GROUND - 6 - 22 * a * a, 3000, 3000),
                       paint(mix(hexc("#5E5A3E"), hexc("#E9EFF7"), a)))
        # Clawd at the window (seen through the glass, part of the house)
        if t < T["cut_door"]:
            cs = clawd_state(t)
            wx, wy, ww, wh = WIN
            c.save()
            c.clipRect(skia.Rect.MakeXYWH(wx, wy, ww, wh))
            clawd(c, cs["x"], cs["y"], h=cs["h"], look=cs["look"], eyes=cs["eyes"], squash=cs["squash"] + breathe(t),
                  blink=blink_at(t, 0.4) if cs["eyes"] == "normal" else 0, mouth=MOUTH(t), blush=0.8,
                  shadow_a=0, shine=False)
            hat(c, cs["x"], cs["y"] - cs["h"] * 0.93, cs["h"] / 10)
            # breath fog on the glass
            fog = bump(t, T["whoa"] - 0.1, 1.6)
            if fog > 0:
                oval(c, cs["x"] + 5, cs["y"] - cs["h"] * 0.5, 70, 40, with_alpha(P["white"], 0.35 * fog), blur=14)
            c.restore()
        c.restore()
        return
    # ---- foreground
    sm = snowman_state(t)
    if sm:
        snowman(c, SNOWMAN_X, GROUND, 170, sm["body"], sm["legs"], sm["arms"], sm["eyes"], sm["blink"], sm["happy"], t)
        if sm["hat"] > 0:
            hat(c, SNOWMAN_X, GROUND - 170 * 0.93, 17)
    cs = clawd_state(t)
    if t >= T["cut_door"] and cs["visible"]:
        clawd(c, cs["x"], cs["y"], h=cs["h"], look=cs["look"], eyes=cs["eyes"], arm_l=cs["arm_l"], arm_r=cs["arm_r"],
              squash=cs["squash"] + breathe(t), tilt=cs["tilt"], walk=cs["walk"], blush=cs["blush"], smile=cs["smile"],
              blink=blink_at(t, 0.4) if cs["eyes"] in ("normal", "wide") else 0, mouth=MOUTH(t),
              flip=cs.get("flip", False), shadow_a=0.3, shine=False)
        u = cs["h"] / 10
        if cs["hat"]:
            hat(c, cs["x"] + math.sin(cs["tilt"]) * 10 * u, cs["y"] - cs["h"] * 0.93 * (1 - cs["squash"]), u, rot=cs["tilt"])
        # settled flakes on Clawd once it's snowing
        if a > 0:
            rng = random.Random(1)
            for i in range(9):
                if rng.random() < a * 1.3:
                    circle(c, cs["x"] + rng.uniform(-5.5, 5.5) * u, cs["y"] - rng.uniform(2.5, 9.5) * u, rng.uniform(0.2, 0.35) * u,
                           with_alpha(hexc("#F6FAFF"), 0.9))
    # the hat's journey from Clawd to the snowman
    if T["hat_off"] <= t < T["hat_on"] + 0.001 and T["cut_hat"] <= t < T["cut_night"]:
        p = prog(t, T["hat_off"], T["hat_on"] - T["hat_off"])
        x0, y0 = cs["x"], cs["y"] - CLAWD_H * 0.93
        x1, y1 = SNOWMAN_X, GROUND - 170 * 0.93
        x, y = arc(ease_in_out(p), x0, y0, x1, y1, 120)
        hat(c, x, y, lerp(CLAWD_H, 170, p) / 10, rot=math.sin(p * math.pi) * 0.5)
    if T["cut_night"] <= t and sm:
        pass
    f = hero_flake(t)
    if f and T["cut_door"] <= t:
        if f.get("melt"):
            m = f["melt"]
            crystal(c, f["x"], f["y"], max(0.1, f["r"]), f["rot"], 1 - m)
            if m > 0.3:
                oval(c, f["x"], f["y"] + 6 + 30 * ease_in(prog(m, 0.3, 0.7)), 5, 7, with_alpha(hexc("#BFE0FF"), 0.9))
        else:
            crystal(c, f["x"], f["y"], f["r"], f["rot"])
    if f and t < T["cut_door"]:
        crystal(c, f["x"], f["y"], f["r"] * 1.2, f["rot"])
    snowfall(c, t, "mid")
    snowfall(c, t, "near")
    SPARK.draw(c, t)
    BLINKS.draw(c, t)
    c.restore()


SPARK = Burst(SNOWMAN_X, GROUND - 100, T["done"], n=26, kind="sparkle", speed=520, colors=[hexc("#DDEBFF"), P["white"], P["gold"]])
BLINKS = Burst(SNOWMAN_X, GROUND - 130, T["blink"], n=18, kind="sparkle", speed=380, colors=[hexc("#CFE6FF"), P["white"]])


# ---------------------------------------------------------------- voice / captions / title
VOICE_DIR = os.path.join(BUILD, "voice")
VOICE_CUES = [("whoa", T["whoa"]), ("snow", T["snow"]), ("aww", T["aww"]), ("hi", T["hi"])]
CAPTIONS = {"whoa": "Whoa...", "snow": "Snow!", "aww": "Oh no...", "hi": "Hi, friend."}
_ENVS = {}


def _env(lid):
    if lid not in _ENVS:
        a, sr = sf.read(os.path.join(VOICE_DIR, f"{lid}.wav"))
        hop_ = sr // 120
        n = len(a) // hop_
        r = np.sqrt((a[: n * hop_].reshape(n, hop_) ** 2).mean(1))
        v = np.clip((20 * np.log10(r + 1e-9) + 42) / 26, 0, 1)
        out, s = np.zeros_like(v), 0.0
        for i, x in enumerate(v):
            s += (x - s) * (0.55 if x > s else 0.25)
            out[i] = s
        _ENVS[lid] = out
    return _ENVS[lid]


def MOUTH(t):
    for lid, t0 in VOICE_CUES:
        e = _env(lid)
        i = int((t - t0) * 120)
        if 0 <= i < len(e):
            return e[i] * (0.75 + 0.25 * math.sin(t * 38))
    return 0.0


def overlays(c, t):
    dur = json.load(open(os.path.join(VOICE_DIR, "durations.json")))
    f = font(44, wght=600)
    for lid, t0 in VOICE_CUES:
        d = dur[lid]
        if not (t0 - 0.05 <= t <= t0 + d + 0.35):
            continue
        a = ease_out(prog(t, t0 - 0.05, 0.15)) * (1 - prog(t, t0 + d + 0.15, 0.2))
        s = CAPTIONS[lid]
        w = f.measureText(s) + 64
        with Xf(c, W / 2, cine.caption_y() + (1 - a) * 14, alpha=a):
            rrect(c, -w / 2, -38, w, 76, 38, (0.05, 0.05, 0.12, 0.5))
            text(c, s, 0, 15, f, P["ivory"])
    k = ease_out(prog(t, T["title"], 0.7))
    if k > 0:
        y = H * 0.44 if W > H else H * 0.40
        with Xf(c, W / 2, y - (1 - k) * 16, alpha=k):
            text(c, "first snow.", 0, 0, font(84 if W > H else 92, wght=600), P["ivory"], shadow_a=0.45)


if __name__ == "__main__":
    import snowfilm as me
    tag = "_vertical" if cine.VERTICAL else ""
    if sys.argv[1] == "stills":
        cine.stills(me, BUILD, [float(x) for x in sys.argv[2:]], tag="sheet" + tag)
    elif sys.argv[1] == "video":
        cine.render_video(me, BUILD, "video" + tag)
