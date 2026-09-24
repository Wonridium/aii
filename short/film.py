""""The Bug": a 30-second Clawd short.

Everything is a pure function of time t, so each output frame is the average
of several sub-frames (real motion blur). Each sub-frame is lit with a 2D
light map (ambient night + lamp + monitor), then emissive glows are added and
the final frame gets bloom, vignette and grain.

  python film.py stills 3 6.5 12 ...   -> build/stills/sheet.png
  python film.py video                 -> build/video.mp4 (silent)
"""
import math
import os
import random
import subprocess
import sys
from multiprocessing import Pool

import numpy as np
import skia

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "video"))

from characters import blink_at, clawd  # noqa: E402
from engine import (H, P, W, Burst, Xf, bump, circle, clamp, ease_in, ease_in_out, ease_out,  # noqa: E402
                    ease_out_back, font, hexc, line, mix, oval, paint, poly, pop, prog, rrect,
                    sparkle, text, with_alpha)
from kit import arc, breathe, hop, land, shake  # noqa: E402

from beats import BEAT, DUR, T, b  # noqa: E402

FPS = 60
SUB = int(os.environ.get("SUB", 5))  # motion-blur sub-frames
SHUTTER = 0.5                         # fraction of a frame the shutter is open
BUILD = os.path.join(HERE, "build")

# ---------------------------------------------------------------- layout (world coords)
DESK_Y = 720
SCREEN = (560, 200, 600, 400)                # x, y, w, h
WINDOW = (110, 110, 410, 390)
KB = (650, 690, 420, 46)                     # keyboard slab
KEYS_X = [680 + i * 30 for i in range(14)]  # hop targets along the top row
MUG = (1560, DESK_Y)
LAMP_HEAD = (1650, 330)
HOME = 1150                                  # Clawd's spot beside the keyboard

WALL_TOP, WALL_BOT = hexc("#232842"), hexc("#2E3350")
DESK_COL = hexc("#6B4A36")


# ---------------------------------------------------------------- the bug (a firefly in disguise)
def bug(c, x, y, s=1.0, face=1, t=0.0, run=0.0, fly=0.0, glow=0.0, tremble=0.0, look=(0, 0),
        sign=0.0, blink=0.0, happy=False):
    """Tiny firefly. (x, y) = feet. `face` = +1 looks right, -1 left."""
    jx = math.sin(t * 90) * 2.2 * tremble
    with Xf(c, x + jx, y, s=s):
        c.scale(face, 1)
        by = -22 - 3 * abs(math.sin(t * 22)) * run - 4 * fly
        # legs
        if fly < 0.5:
            for i, lx in enumerate((-10, -2, 6)):
                ph = t * 26 + i * 2.1
                lift = max(0, math.sin(ph)) * 5 * run
                line(c, lx, by + 6, lx - 3 + math.cos(ph) * 3 * run, -lift, P["slate"], 3)
        # wings
        if fly > 0:
            flap = math.sin(t * 60) * 0.5 + 0.5
            for k, (wx, rot) in enumerate(((-6, -0.6), (4, -0.25))):
                with Xf(c, wx, by - 10, rot=rot - flap * 0.5 * fly):
                    oval(c, 0, -14, 9, 17 * (0.4 + 0.6 * flap), with_alpha(P["sky_lt"], 0.55 * fly))
        # abdomen (the lantern)
        tail = mix(hexc("#8C7A4A"), hexc("#FFE08A"), glow)
        oval(c, -16, by + 2, 14, 11, tail)
        if glow > 0:
            oval(c, -16, by + 2, 26, 22, with_alpha(hexc("#FFE08A"), 0.35 * glow), blur=10)
        # body + head
        oval(c, -2, by, 15, 12, hexc("#2F2C40"))
        circle(c, 12, by - 6, 11, hexc("#35324A"))
        # antennae
        for k, dx in enumerate((-2, 5)):
            wig = math.sin(t * 8 + k) * 2
            path = skia.Path()
            path.moveTo(10 + dx, by - 15)
            path.quadTo(12 + dx + wig, by - 28, 18 + dx + wig, by - 32)
            c.drawPath(path, paint(P["slate"], stroke=2.2))
            circle(c, 18 + dx + wig, by - 32, 3, P["clay_lt"])
        # big eyes
        lx, ly = look
        for ex in (9, 18):
            eh = 7 * (1 - 0.85 * blink)
            if happy:
                pth = skia.Path()
                pth.moveTo(ex - 4, by - 5)
                pth.quadTo(ex, by - 11, ex + 4, by - 5)
                c.drawPath(pth, paint(P["white"], stroke=2.2))
            else:
                oval(c, ex, by - 7, 5.2, eh, P["white"])
                oval(c, ex + 1.3 + lx * 1.2, by - 6 + ly * 1.2, 2.8, max(0.5, eh * 0.55), P["slate"])
                circle(c, ex + 0.3, by - 9, 1.1, P["white"])
        oval(c, 14, by + 1, 3, 1.6, with_alpha(P["blush"], 0.8))
    if sign > 0:
        k = ease_out_back(clamp(sign), 2.0)
        with Xf(c, x + 26 * face + jx, y - 34, s=s * k, rot=0.08 * face + math.sin(t * 40) * 0.02 * tremble):
            line(c, 0, 0, 0, -36, hexc("#8C5A3C"), 3)
            rrect(c, -34, -76, 68, 40, 6, P["ivory"])
            text(c, "lost :(", 0, -49, font(17, wght=700), P["slate"])


# ---------------------------------------------------------------- the set
def rain_window(c, t, open_k):
    x, y, w, h = WINDOW
    # the night outside (drawn "unlit"; the light map leaves the pane bright)
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(x, y, w, h))
    sh = skia.GradientShader.MakeLinear([(0, y), (0, y + h)], [skia.Color4f(*hexc("#0E1430")).toColor(),
                                                                 skia.Color4f(*hexc("#3A3160")).toColor()])
    p = skia.Paint()
    p.setShader(sh)
    c.drawRect(skia.Rect.MakeXYWH(x, y, w, h), p)
    circle(c, x + w * 0.75, y + 70, 30, hexc("#F4EBD3"))
    circle(c, x + w * 0.75, y + 70, 60, with_alpha(hexc("#F4EBD3"), 0.12), blur=16)
    rng = random.Random(3)
    for i in range(34):  # city bokeh
        bx, byy = x + rng.uniform(0, w), y + h * rng.uniform(0.55, 1.0)
        col = rng.choice([P["gold"], P["clay_lt"], P["sky_lt"], hexc("#FFB27A")])
        circle(c, bx, byy, rng.uniform(6, 16), with_alpha(col, rng.uniform(0.25, 0.6)), blur=4)
    for i in range(9):  # skyline
        bw = rng.uniform(30, 70)
        bh = rng.uniform(40, 150)
        bx = x + i * 48 - 10
        rrect(c, bx, y + h - bh, bw, bh + 10, 3, hexc("#141833"))
        for j in range(int(bh // 24)):
            if rng.random() < 0.45:
                rrect(c, bx + 8, y + h - bh + 10 + j * 24, 6, 8, 1, with_alpha(P["gold"], 0.7))
    # rain streaks (stops once the window is open... it's a clear night by then)
    rain_a = 1 - open_k
    for i in range(70):
        rx = x + ((i * 53.7 + t * 90) % w)
        ry = y + ((i * 97.3 + t * 900) % (h + 60)) - 60
        line(c, rx, ry, rx - 4, ry + 26, with_alpha(P["sky_lt"], 0.35 * rain_a), 1.6)
    c.restore()
    # frame + sash (lower sash slides up when opened)
    fr = hexc("#D9CFC0")
    rrect(c, x - 16, y - 16, w + 32, h + 32, 10, fr, stroke=18)
    sash_y = y + h / 2 - open_k * (h / 2 - 12)
    rrect(c, x, sash_y - 8, w, 16, 4, fr)
    line(c, x + w / 2, y, x + w / 2, y + h / 2, fr, 10)
    if open_k < 0.99:
        line(c, x + w / 2, sash_y, x + w / 2, y + h, fr, 10)
    rrect(c, x - 30, y + h + 10, w + 60, 20, 6, fr)  # sill


def keyboard(c, t, pressed):
    x, y, w, h = KB
    rrect(c, x - 6, y + 4, w + 12, h + 8, 12, hexc("#15161F"))
    rrect(c, x, y, w, h, 10, hexc("#2A2C3B"))
    for r in range(2):
        for i in range(14):
            kx = x + 12 + i * 29
            ky = y + 7 + r * 18
            k = pressed.get((r, i), 0.0)
            col = mix(hexc("#3C3F52"), P["gold"], k)
            rrect(c, kx, ky + 2 * k, 24, 13, 3, col)


def monitor(c):
    x, y, w, h = SCREEN
    rrect(c, 820, y + h + 10, 80, 90, 6, hexc("#1B1C26"))
    rrect(c, 740, DESK_Y - 16, 240, 18, 8, hexc("#1B1C26"))
    rrect(c, x - 18, y - 18, w + 36, h + 36, 18, hexc("#14151D"))
    # sticky notes on the bezel
    for (sx, sy, col, rot) in ((x + w - 6, y + 20, P["gold"], 0.12), (x + w + 4, y + 86, P["blush"], -0.08)):
        with Xf(c, sx, sy, rot=rot):
            rrect(c, 0, 0, 58, 54, 3, col)
            for k in range(2):
                line(c, 9, 17 + k * 13, 46 - k * 12, 17 + k * 13, with_alpha(P["slate"], 0.5), 3)


CODE = [
    [("def ", "kw"), ("find_the_bug", "fn"), ("(code):", "tx")],
    [("    for ", "kw"), ("line ", "tx"), ("in ", "kw"), ("code:", "tx")],
    [("    if ", "kw"), ("line.", "tx"), ("looks_weird", "fn"), ("():", "tx")],
    [("            return ", "kw"), ("line", "tx")],
    [("    # be gentle with it", "cm")],
    [("    return ", "kw"), ("None", "kw")],
]
TOK = {"kw": P["clay_lt"], "fn": P["sky_lt"], "tx": P["ivory"], "cm": P["gray"]}
TESTS1 = ["test_login", "test_search", "test_render", "test_night_mode"]
TESTS2 = ["test_login", "test_search", "test_render", "test_night_mode", "test_fireflies", "test_kindness",
          "test_coffee", "test_everything"]


def checkmark(c, x, y, s, col, k=1.0):
    with Xf(c, x, y, s=s * ease_out_back(clamp(k), 3)):
        path = skia.Path()
        path.moveTo(-8, 0)
        path.lineTo(-2, 7)
        path.lineTo(9, -7)
        c.drawPath(path, paint(col, stroke=4))


def cross(c, x, y, s, col, k=1.0):
    with Xf(c, x, y, s=s * ease_out_back(clamp(k), 3)):
        line(c, -7, -7, 7, 7, col, 4)
        line(c, 7, -7, -7, 7, col, 4)


def screen_content(c, t):
    """Editor + test panel, drawn in world coords inside SCREEN (emissive)."""
    x, y, w, h = SCREEN
    c.save()
    c.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), 6, 6), doAntiAlias=True)
    rrect(c, x, y, w, h, 6, hexc("#1A1C2B"))
    rrect(c, x, y, w, 30, 0, hexc("#232638"))
    for k, col in enumerate((P["clay"], P["gold"], P["olive_lt"])):
        circle(c, x + 20 + k * 20, y + 15, 6, col)
    text(c, "bug_hunt.py", x + 100, y + 22, font(20, "VT323"), P["gray"], align="left")
    f = font(27, "VT323")
    # typing reveal in the intro; fully typed afterwards
    total_chars = sum(len(s) for ln in CODE for s, _ in ln)
    shown = total_chars if t > T["typing_end"] else int(total_chars * clamp((t - 0.2) / (T["typing_end"] - 0.2)))
    n = 0
    cy = y + 62
    for li, ln in enumerate(CODE):
        cx = x + 20
        text(c, f"{li + 1}", cx, cy, f, with_alpha(P["gray"], 0.6), align="left")
        cx += 34
        for s, kind in ln:
            vis = s[: max(0, shown - n)]
            n += len(s)
            if vis:
                cx += text(c, vis, cx, cy, f, TOK[kind], align="left")
        if n <= shown < n + 1 or (li == len(CODE) - 1 and shown >= total_chars):
            if int(t * 3) % 2 == 0:
                rrect(c, cx + 2, cy - 20, 11, 24, 1, P["ivory"])
        cy += 31
    # test panel
    py = y + 250
    rrect(c, x, py - 8, w, h - 242, 0, hexc("#141522"))
    ft = font(26, "VT323")
    if t < T["cut_tests"]:
        if t > T["run"]:
            text(c, "$ pytest", x + 18, py + 20, ft, P["gray"], align="left")
        for i, name in enumerate(TESTS1):
            ti = T["ok"][i] if i < 3 else T["fail"]
            if t < ti:
                continue
            ly = py + 50 + i * 28
            bad = i == 3
            k = prog(t, ti, 0.25)
            if bad:
                flash = bump(t, ti, 0.5)
                rrect(c, x, ly - 20, w, 27, 0, with_alpha(P["clay"], 0.25 + 0.3 * flash))
                cross(c, x + 30, ly - 7, 1.0, hexc("#FF7A6B"), k)
            else:
                checkmark(c, x + 30, ly - 7, 1.0, hexc("#8FD694"), k)
            text(c, name, x + 52, ly, ft, hexc("#FF9A8E") if bad else P["ivory"], align="left")
    else:
        text(c, "$ pytest --again", x + 18, py + 20, ft, P["gray"], align="left")
        for i, name in enumerate(TESTS2):
            ti = T["checks"][i]
            if t < ti:
                continue
            col_i, row = divmod(i, 4)
            lx, ly = x + 18 + col_i * 290, py + 50 + row * 28
            checkmark(c, lx + 12, ly - 7, 1.0, hexc("#8FD694"), prog(t, ti, 0.25))
            text(c, name, lx + 34, ly, ft, P["ivory"], align="left")
        if t > T["passed"]:
            k = ease_out_back(prog(t, T["passed"], 0.4), 2.5)
            with Xf(c, x + w / 2, y + 150, s=k):
                rrect(c, -230, -48, 460, 96, 20, hexc("#2F7A45"))
                rrect(c, -230, -48, 460, 96, 20, hexc("#8FD694"), stroke=4)
                text(c, "ALL TESTS PASSED", 0, 14, font(52, "VT323"), P["white"])
    # scanline sheen
    for yy in range(int(y), int(y + h), 4):
        c.drawRect(skia.Rect.MakeXYWH(x, yy, w, 1), paint((0, 0, 0, 0.12)))
    c.restore()


def lamp(c):
    bx = 1790
    rrect(c, bx - 70, DESK_Y - 22, 140, 24, 10, hexc("#2B2D3A"))
    line(c, bx, DESK_Y - 20, 1760, 470, hexc("#2B2D3A"), 12)
    line(c, 1760, 470, LAMP_HEAD[0] + 30, LAMP_HEAD[1] + 10, hexc("#2B2D3A"), 12)
    with Xf(c, LAMP_HEAD[0], LAMP_HEAD[1], rot=-0.35):
        poly(c, [(-70, 40), (70, 40), (40, -30), (-40, -30)], hexc("#C9573A"))
        oval(c, 0, 42, 60, 12, hexc("#FFF1C9"))


def mug(c, x, y, s=1.0, rot=0.0, t=0.0, steam=1.0):
    with Xf(c, x, y, s=s, rot=rot):
        rrect(c, 40, -100, 46, 64, 22, hexc("#E7E1D6"), stroke=12)
        rrect(c, -55, -130, 110, 130, 18, hexc("#EEE8DD"))
        rrect(c, -55, -130, 110, 20, 10, hexc("#D5CEC2"))
        # little clay asterisk-ish doodle
        for k in range(4):
            with Xf(c, 0, -62, rot=k * math.pi / 4):
                rrect(c, -3, -18, 6, 36, 3, P["clay"])
        if steam > 0:
            for k in range(3):
                ph = (t * 0.6 + k / 3) % 1
                path = skia.Path()
                sx = -25 + k * 25
                path.moveTo(sx, -140 - ph * 70)
                path.cubicTo(sx + 12, -160 - ph * 70, sx - 12, -180 - ph * 70, sx, -200 - ph * 70)
                c.drawPath(path, paint(with_alpha(P["white"], 0.25 * (1 - ph) * steam), stroke=5))


def desk_and_wall(c, t):
    sh = skia.GradientShader.MakeLinear([(0, 0), (0, DESK_Y)], [skia.Color4f(*WALL_TOP).toColor(),
                                                                 skia.Color4f(*WALL_BOT).toColor()])
    p = skia.Paint()
    p.setShader(sh)
    c.drawRect(skia.Rect.MakeLTRB(-2000, -1000, 4000, DESK_Y + 2), p)
    # a framed doodle + shelf for depth
    rrect(c, 1300, 150, 190, 150, 8, hexc("#3A3F5E"))
    rrect(c, 1314, 164, 162, 122, 4, hexc("#E8E0D2"))
    for k, (dx, col) in enumerate(((-30, P["gold"]), (20, P["clay_lt"]))):
        circle(c, 1395 + dx, 225 + k * 10, 26, with_alpha(col, 0.8))
    rrect(c, 560, 90, 400, 16, 6, hexc("#4A3A33"))
    for k, (bx, bh, col) in enumerate(((600, 70, P["sky"]), (630, 60, P["olive"]), (655, 76, P["fig"]),
                                       (690, 50, P["gold"]))):
        rrect(c, bx, 90 - bh, 24, bh, 3, col)
    circle(c, 880, 62, 26, P["olive_lt"])
    rrect(c, 862, 62, 36, 28, 5, P["clay"])
    # desk
    c.drawRect(skia.Rect.MakeLTRB(-2000, DESK_Y, 4000, 3000), paint(DESK_COL))
    c.drawRect(skia.Rect.MakeLTRB(-2000, DESK_Y, 4000, DESK_Y + 10), paint(mix(DESK_COL, P["white"], 0.15)))
    for k in range(6):
        yy = DESK_Y + 40 + k * 70
        line(c, -2000, yy, 4000, yy, with_alpha(mix(DESK_COL, P["slate"], 0.3), 0.35), 3)


# ---------------------------------------------------------------- motion script
KEY_ROW = [(0, 1), (0, 3), (1, 4), (0, 6), (1, 7), (0, 9), (1, 10), (0, 12)]


def key_pos(i):
    r, k = KEY_ROW[i]
    return KB[0] + 12 + k * 29 + 12, KB[1] + 7 + r * 18 + 2


def bug_state(t):
    """Position & pose of the bug. Returns dict."""
    st = dict(x=0, y=0, s=1.0, face=-1, run=0.0, fly=0.0, glow=0.0, tremble=0.0, look=(0, 0), sign=0.0,
              visible=True, happy=False)
    sx, sy, sw, sh = SCREEN
    exit_x, exit_y = sx + 150, sy + 250 + 50 + 3 * 28 - 4   # the red line
    if t < T["bug_out"]:
        st["visible"] = False
    elif t < T["cut_chase"]:
        p = ease_out(prog(t, T["bug_out"], 0.6))
        st.update(x=exit_x + 220 * p, y=exit_y, run=1 - prog(t, T["bug_out"] + 0.6, 0.2), face=1, s=0.9,
                  look=(1, 0) if t < T["clawd_in"] else (1, -0.3))
        if t > T["found"]:
            st["tremble"] = 1.0
            st["look"] = (1, -0.5)
    elif t < T["keys"][0]:
        p = prog(t, T["bug_jump"], T["keys"][0] - T["bug_jump"])
        x, y = arc(ease_in_out(p), exit_x + 220, exit_y, *key_pos(0), 120)
        st.update(x=x, y=y, face=1, fly=0.6 * math.sin(p * math.pi))
    elif t < T["to_mug"]:
        i = min(7, int((t - T["keys"][0]) / (BEAT / 2)))
        t0 = T["keys"][i]
        if i < 7:
            p = prog(t, t0, BEAT / 2)
            x, y = arc(p, *key_pos(i), *key_pos(i + 1), 40)
        else:
            p = prog(t, t0, BEAT / 2)
            x, y = arc(p, *key_pos(7), KB[0] + KB[2] + 60, DESK_Y + 20, 40)
        st.update(x=x, y=y, face=1, run=0.5)
    elif t < T["under_mug"]:
        p = prog(t, T["to_mug"], T["under_mug"] - T["to_mug"])
        x = lerp(KB[0] + KB[2] + 60, MUG[0] - 20, ease_in_out(p))
        st.update(x=x, y=DESK_Y + 20, face=1, run=1.0)
        if p > 0.85:
            st["s"] = 1 - (p - 0.85) / 0.15 * 0.4
    elif t < T["reveal"] - 0.25:
        st["visible"] = False
    else:
        st["visible"] = False  # rides on Clawd from here on (see clawd_state)
    if t >= T["cut_window"] + 0.9 and t < T["cut_tests"]:
        pass
    return st


def lerp(a, b_, k):
    return a + (b_ - a) * k


def clawd_state(t):
    """Clawd's pose; also where the bug rides when it's on Clawd."""
    st = dict(x=HOME, y=DESK_Y, h=210, look=(-0.8, -0.3), eyes="normal", arm_l=0.0, arm_r=0.0, squash=0.0,
              blush=0.5, tilt=0.0, walk=None, mug=None, rider=None, smile=0.0, sweat=0.0)
    # A: typing
    if t < T["fail"]:
        typing = t < T["typing_end"]
        st["arm_l"] = 0.5 + 0.35 * abs(math.sin(t * 17)) if typing else 0.4
        st["look"] = (-0.9, -0.4)
        if T["run"] < t:
            st["eyes"] = "happy" if t > T["ok"][0] else "normal"
            y, sq = hop(t, T["ok"][2] - 0.02, 0.3, 26)
            st["squash"] = sq
            st["y"] += y
    elif t < T["cut_close"]:
        st["eyes"] = "wide"
        st["look"] = (-1, -0.5)
        st["squash"] = land(t, T["fail"], 0.2)
    elif t < T["cut_chase"]:
        # close-up: Clawd leans in from the right
        k = ease_out(prog(t, T["clawd_in"] - 0.3, 0.45))
        st.update(x=1320 - 150 * k, look=(-1, 0), eyes="normal")
        if t > T["found"] - 0.1:
            st.update(eyes="happy", arm_r=1.6 * ease_out_back(prog(t, T["found"] - 0.1, 0.25)), blush=1)
    elif t < T["lift"]:
        # chase: trail the bug along the desk front
        bs = bug_state(t)
        target = bs["x"] + 170 if bs["visible"] else MUG[0] - 170
        if t < T["keys"][0] + 0.1:
            target = HOME
        lag = 0.18
        bs2 = bug_state(max(T["cut_chase"], t - lag))
        tx = (bs2["x"] + 170) if bs2["visible"] and t > T["keys"][1] else target
        if t > T["keys"][1]:
            tx = max(HOME - 380, min(tx, MUG[0] - 170)) if t < T["to_mug"] else lerp(
                KB[0] + KB[2] + 60 - 170, MUG[0] - 170, ease_in_out(prog(t, T["to_mug"] + 0.1, T["under_mug"] - T["to_mug"])))
            if t < T["to_mug"]:
                tx = key_pos(min(7, int((t - lag - T["keys"][0]) / (BEAT / 2))))[0] - 170
        else:
            tx = HOME
        st.update(x=tx, y=DESK_Y + 26, walk=t * 3.2, look=(-1, 0) if t > T["keys"][0] else (-1, -0.4),
                  eyes="normal", h=190)
        if t < T["keys"][0]:
            st["x"] = HOME - 20
        # hop every beat for bounce
        yy, sq = hop(t, T["keys"][0] + BEAT * math.floor((t - T["keys"][0]) / BEAT), 0.3, 22) if t > T["keys"][0] else (0, 0)
        st["y"] += yy
        st["squash"] = sq
        if t > T["under_mug"] - 0.2:
            st.update(walk=None, look=(1, 0.2), x=MUG[0] - 170)
    elif t < T["cut_tender"]:
        st.update(x=MUG[0] - 170, y=DESK_Y + 26, h=190, look=(1, 0.4), mug="held")
        if t > T["reveal"] - 0.05:
            st.update(look=(0, -1), eyes="wide", mug="held", sweat=0.0)
            st["rider"] = "head"
    elif t < T["cut_window"]:
        st.update(x=1400, y=DESK_Y + 26, h=260, look=(0, -1), eyes="normal", blush=0.6)
        if t > T["hop_down"] - 0.05:
            st["look"] = (-0.9, 0.35)
            st["rider"] = "hand"
        if t > T["lost"] - 0.1:
            st.update(eyes="sadbrow" if t < T["nod"] else "happy", blush=1.0)
        if t > T["cup"] - 0.1:
            st.update(arm_l=1.1 * ease_out(prog(t, T["cup"] - 0.1, 0.3)), arm_r=0.3)
        if t < T["hop_down"]:
            st["rider"] = "head"
    elif t < T["cut_tests"]:
        st.update(x=330, y=DESK_Y, h=200, look=(0, -1), eyes="normal", blush=0.8, rider="head")
        if t > T["fly"] - 0.05:
            st["rider"] = None
            st.update(eyes="happy", arm_r=1.5 + 0.35 * math.sin(t * 12), look=(-0.5, -1))
        if t > T["thanks"]:
            st["blush"] = 1.0
    elif t < T["cut_end"]:
        st.update(x=HOME, look=(-0.9, -0.4))
        if t > T["passed"] - 0.1:
            st.update(eyes="star", blush=1.0, arm_l=1.6 + 0.4 * math.sin(t * 14), arm_r=1.6 + 0.4 * math.sin(t * 14 + 1),
                      look=(0, 0))
            y, sq = hop(t, T["passed"] + BEAT * math.floor((t - T["passed"]) / BEAT), 0.35, 60)
            st.update(y=DESK_Y + y, squash=sq, tilt=0.08 * math.sin(t * math.pi / BEAT))
        if t > T["green"]:
            st["eyes"] = "happy" if int((t - T["green"]) / BEAT) % 2 else "star"
    else:
        st.update(x=330, y=DESK_Y, h=190, look=(-1, -0.6), eyes="happy", blush=1.0,
                  arm_l=1.5 + 0.4 * math.sin(t * 10))
    return st


# ---------------------------------------------------------------- cameras (cuts on downbeats)
def camera_at(t):
    """(zoom, cx, cy) in world coords."""
    if t < T["cut_close"]:
        return 1.0 + 0.1 * ease_in_out(prog(t, 0, T["cut_close"])) + 0.15 * ease_in_out(prog(t, T["fail"], 0.5)), \
            lerp(960, 900, prog(t, T["fail"], 0.5)), lerp(520, 470, prog(t, T["fail"], 0.5))
    if t < T["cut_chase"]:
        return 2.3 + 0.12 * prog(t, T["cut_close"], 2.5), 870, 470
    if t < T["cut_tender"]:
        bs = bug_state(t)
        fx = bs["x"] if bs["visible"] else MUG[0] - 80
        if t < T["keys"][0]:
            fx = 900
        cx = min(1480, max(820, fx - 60))
        zoom = 1.55
        if t > T["lift"] - 0.2:
            zoom = 1.55 + 0.45 * ease_in_out(prog(t, T["lift"] - 0.2, 0.9))
            cx = lerp(cx, MUG[0] - 170, ease_in_out(prog(t, T["lift"] - 0.2, 0.9)))
        return zoom, cx, 560 - (60 if t > T["lift"] else 0) * ease_in_out(prog(t, T["lift"], 0.6))
    if t < T["cut_window"]:
        return 2.15 + 0.12 * prog(t, T["cut_tender"], 5), 1300, 560
    if t < T["cut_tests"]:
        return 1.75 - 0.12 * ease_in_out(prog(t, T["cut_window"], 2.5)), 360, 400
    if t < T["cut_end"]:
        k = ease_in_out(prog(t, T["passed"] - 0.1, 0.8))
        return lerp(1.85, 1.2, k), lerp(870, 960, k), lerp(400, 480, k)
    return 1.35 - 0.08 * prog(t, T["cut_end"], 2.5), 560, 470


# ---------------------------------------------------------------- lighting
AMBIENT = (0.40, 0.44, 0.62)


def light_map(c, t, cam, masks=True):
    c.clear(skia.Color4f(*AMBIENT, 1.0))

    def pool(x, y, r, col, a):
        sh = skia.GradientShader.MakeRadial((x, y), r, [skia.Color4f(*col, a).toColor(),
                                                       skia.Color4f(*col, a * 0.35).toColor(),
                                                       skia.Color4f(*col, 0).toColor()], [0, 0.45, 1])
        p = skia.Paint(AntiAlias=True)
        p.setShader(sh)
        p.setBlendMode(skia.BlendMode.kPlus)
        c.drawCircle(x, y, r, p)

    z, cx, cy = cam
    c.save()
    c.translate(W / 2, H / 2)
    c.scale(z, z)
    c.translate(-cx, -cy)
    pool(1560, 760, 620, (0.62, 0.44, 0.22), 1.0)      # lamp: warm pool
    pool(LAMP_HEAD[0], LAMP_HEAD[1] + 40, 260, (0.5, 0.4, 0.25), 0.8)
    mon = 0.65 + 0.35 * bump(t, T["passed"], 1.5)
    green = bump(t, T["passed"], 2.0)
    pool(860, 430, 720, mix((0.35, 0.42, 0.6, 1), (0.25, 0.6, 0.35, 1), green)[:3], mon)
    if T["fail"] < t < T["cut_close"] + 0.5:
        pool(760, 470, 500, (0.55, 0.15, 0.1), bump(t, T["fail"], 1.2))
    wx, wy, ww, wh = WINDOW
    pool(wx + ww / 2, wy + wh, 520, (0.22, 0.25, 0.4), 1.0)
    # the firefly's own light
    fs = firefly_world(t)
    if fs and fs["glow"] > 0:
        pool(fs["x"], fs["y"] - 20, 260, (0.6, 0.5, 0.2), fs["glow"])
    if not masks:
        c.restore()
        return
    # emissive regions stay unlit
    white = paint((1, 1, 1, 1))
    sx, sy, sw, sh = SCREEN
    c.drawRect(skia.Rect.MakeXYWH(sx, sy, sw, sh), white)
    c.drawRect(skia.Rect.MakeXYWH(wx, wy, ww, wh), white)
    oval(c, LAMP_HEAD[0] + 14, LAMP_HEAD[1] + 38, 60, 16, (1, 1, 1, 1))
    c.restore()


def firefly_world(t):
    """Where the (glowing) bug is while it's a light source."""
    if T["cut_window"] <= t < T["cut_tests"]:
        cs = clawd_state(t)
        glow = ease_out(prog(t, T["glow"], 0.4))
        if t < T["fly"]:
            return dict(x=cs["x"] + 10, y=cs["y"] - cs["h"] - 2, glow=glow)
        p = prog(t, T["fly"], 1.3)
        x, y = arc(ease_in_out(p), cs["x"] + 10, cs["y"] - cs["h"] - 2, 250 + 60 * math.sin(p * 9), 210, 160)
        return dict(x=x, y=y, glow=glow, fly=1.0, s=1.0 - 0.45 * p)
    return None


# ---------------------------------------------------------------- frame
def draw_world(c, t, cam, part="bg"):
    z, cx, cy = cam
    c.save()
    c.translate(W / 2, H / 2)
    c.scale(z, z)
    c.translate(-cx, -cy)
    tender = T["cut_tender"] <= t < T["cut_window"]
    if tender and part == "bg":  # depth of field: soft background in the close two-shot
        pb = skia.Paint()
        pb.setImageFilter(skia.ImageFilters.Blur(7 / z * 2, 7 / z * 2))
        c.saveLayer(None, pb)
    if part == "bg":
        desk_and_wall(c, t)
    open_k = ease_in_out(prog(t, T["open"], 0.6)) if t > T["cut_window"] else 0.0
    if t > T["cut_end"]:
        open_k = 1.0
    if part == "fg":
        tender = False
    else:
        rain_window(c, t, open_k)
    monitor(c) if part == "bg" else None
    if part == "bg":
        screen_content(c, t)
        lamp(c)
    if tender:
        c.restore()
    if part == "bg":
        c.restore()
        return
    # keyboard with the bug's footprints lighting keys
    pressed = {}
    for i, tk in enumerate(T["keys"]):
        k = bump(t, tk - 0.02, 0.35)
        if k > 0:
            pressed[KEY_ROW[i]] = k
    if t < T["typing_end"]:
        rng = random.Random(int(t * 14))
        pressed[(rng.randint(0, 1), rng.randint(6, 13))] = 0.8
    keyboard(c, t, pressed)
    # mug (lifted by Clawd during the reveal)
    cs = clawd_state(t)
    if cs["mug"] != "held":
        wob = bump(t, T["under_mug"], 0.4) * 0.05
        mug(c, MUG[0], MUG[1] + 22, 1.0, rot=wob * math.sin(t * 40), t=t)
    # Clawd
    clawd(c, cs["x"], cs["y"], h=cs["h"], look=cs["look"], eyes=cs["eyes"], arm_l=cs["arm_l"],
          arm_r=cs["arm_r"], squash=cs["squash"] + breathe(t), blush=cs["blush"], tilt=cs["tilt"],
          walk=cs["walk"], blink=blink_at(t, 0.7) if cs["eyes"] in ("normal", "wide", "sadbrow") else 0,
          mouth=mouth(t), smile=cs["smile"], shadow_a=0.35, shine=False)
    if cs["mug"] == "held":
        k = ease_in_out(prog(t, T["lift"], 0.35))
        mx = lerp(MUG[0], cs["x"] + 190, k)
        my = lerp(MUG[1] + 22, cs["y"] - cs["h"] * 0.55, k)
        mug(c, mx, my, 0.9, rot=math.pi * 0.75 * k, t=t, steam=1 - k)
        if t > T["lift"] + 0.3:  # "...where did it go?"
            qa = ease_out_back(prog(t, T["lift"] + 0.3, 0.3), 2.5) * (1 - prog(t, T["reveal"], 0.2))
            if qa > 0:
                text(c, "?", cs["x"] - 150, cs["y"] - cs["h"] - 10, font(90 * qa, wght=700), P["gold"])
    # the bug
    bs = bug_state(t)
    if bs["visible"]:
        bug(c, bs["x"], bs["y"], s=bs["s"] * (1.9 if t < T["cut_chase"] else 1.6), face=bs["face"], t=t, run=bs["run"], fly=bs["fly"],
            tremble=bs["tremble"], look=bs["look"], blink=blink_at(t, 2.2))
    rider(c, t, cs)
    # confetti
    CONF.draw(c, t)
    CONF2.draw(c, t)
    c.restore()


CONF = Burst(860, 350, T["passed"], n=46, kind="confetti", speed=900, seed=4, life=2.2)
CONF2 = Burst(860, 350, T["passed"] + 0.12, n=24, kind="sparkle", speed=700, seed=5, life=1.6,
              colors=[P["gold"], P["white"], hexc("#8FD694")])


def rider(c, t, cs):
    """The bug when it's on Clawd (head / hand), and its flight out of the window."""
    u = cs["h"] / 10
    s = 1.5 * cs["h"] / 210
    if cs["rider"] == "head":
        ph = prog(t, T["reveal"] - 0.1, 0.3) if t < T["cut_tender"] else 1.0
        x, y = cs["x"] + 1.5 * u, cs["y"] - cs["h"] + (1 - ease_out_back(ph, 2)) * 40
        glow = ease_out(prog(t, T["glow"], 0.4)) if t > T["cut_window"] else 0
        happy = T["cut_tender"] > t > T["reveal"] + 0.3
        bug(c, x, y, s=s, face=-1, t=t, look=(-0.5, 0.6), happy=happy, glow=glow, blink=blink_at(t, 1.3))
        if t < T["cut_tender"] and t > T["reveal"]:
            # tiny wave
            pass
    elif cs["rider"] == "hand":
        p = prog(t, T["hop_down"], 0.4)
        x0, y0 = cs["x"] + 1.5 * u, cs["y"] - cs["h"]
        x1, y1 = cs["x"] - 9.5 * u, cs["y"]
        x, y = arc(ease_in_out(p), x0, y0, x1, y1, 60)
        sign = prog(t, T["sign"], 0.3) * (1 - prog(t, T["nod"] + 0.2, 0.3))
        nod = bump(t, T["nod"], 0.25) + bump(t, T["nod"] + 0.25, 0.25)
        happy = t > T["nod"] + 0.1
        bug(c, x, y + nod * 5, s=s, face=1, t=t, look=(1, -0.8), tremble=1.0 if T["sign"] < t < T["lost"] + 0.6 else 0,
            sign=sign, happy=happy, blink=blink_at(t, 0.9))
        if t > T["cup"] + 0.25:
            # hop back up onto Clawd's head for the walk to the window
            pass
    fs = firefly_world(t)
    if fs and t >= T["fly"]:
        bug(c, fs["x"], fs["y"], s=s * fs.get("s", 1.0), face=-1, t=t, fly=1.0, glow=fs["glow"], look=(-1, -0.5),
            happy=t > T["thanks"])
    # other fireflies waiting outside
    if t > T["cut_window"]:
        rng = random.Random(9)
        wx, wy, ww, wh = WINDOW
        for i in range(8):
            fx = wx + rng.uniform(30, ww - 30) + math.sin(t * 1.1 + i) * 14
            fy = wy + rng.uniform(40, wh * 0.6) + math.cos(t * 1.3 + i * 2) * 10
            a = 0.5 + 0.5 * math.sin(t * 2.5 + i * 1.7)
            if t > T["cut_end"] and i == 3:
                a = max(a * 0.3, max(bump(t, T["blinks"][0], 0.35), bump(t, T["blinks"][1], 0.35)))
            circle(c, fx, fy, 4, with_alpha(hexc("#FFE08A"), a))
            circle(c, fx, fy, 16, with_alpha(hexc("#FFE08A"), 0.25 * a), blur=6)


def mouth(t):
    return MOUTH(t)


# lip-sync from the voice files
import json  # noqa: E402

import soundfile as sf  # noqa: E402

VOICE_DIR = os.path.join(BUILD, "voice")
VOICE_CUES = [("found", T["found"]), ("lost", T["lost"]), ("go", T["go"]), ("green", T["green"])]
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


CAPTIONS = {"found": "Found you!", "lost": "Oh... you're just lost?", "go": "There you go.",
            "green": "All green!", "thanks": "Thank you!"}


def captions(c, t):
    dur = json.load(open(os.path.join(VOICE_DIR, "durations.json")))
    cues = VOICE_CUES + [("thanks", T["thanks"])]
    f = font(44, wght=600)
    for lid, t0 in cues:
        d = dur[lid]
        if not (t0 - 0.05 <= t <= t0 + d + 0.35):
            continue
        a = ease_out(prog(t, t0 - 0.05, 0.15)) * (1 - prog(t, t0 + d + 0.15, 0.2))
        s = CAPTIONS[lid]
        w = f.measureText(s) + 64
        with Xf(c, W / 2, H - 110 + (1 - a) * 14, alpha=a):
            rrect(c, -w / 2, -38, w, 76, 38, (0.05, 0.05, 0.1, 0.55))
            text(c, s, 0, 15, f, P["ivory"] if lid != "thanks" else hexc("#FFE08A"))


def title_card(c, t):
    k = ease_out(prog(t, T["title"], 0.6))
    if k <= 0:
        return
    with Xf(c, W / 2, 1010 - (1 - k) * 16, alpha=k):
        text(c, "debugging, gently.", 0, 0, font(66, wght=600), P["ivory"], shadow_a=0.4)


# ---------------------------------------------------------------- compositor
class Renderer:
    def __init__(self):
        self.arr = np.zeros((H, W, 4), np.uint8)
        self.surf = skia.Surface(self.arr, colorType=skia.kRGBA_8888_ColorType)
        self.larr = np.zeros((H, W, 4), np.uint8)
        self.lsurf = skia.Surface(self.larr, colorType=skia.kRGBA_8888_ColorType)
        self.acc = np.zeros((H, W, 4), np.float32)
        self.farr = np.zeros((H, W, 4), np.uint8)
        self.fsurf = skia.Surface(self.farr, colorType=skia.kRGBA_8888_ColorType)
        self.sm = skia.Surface(W // 4, H // 4)
        self.sm2 = skia.Surface(W // 4, H // 4)
        rng = np.random.default_rng(3)
        self.grain = [rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(6)]

    def sub(self, t):
        cam = camera_at(t)
        c = self.surf.getCanvas()
        c.clear(skia.ColorBLACK)
        draw_world(c, t, cam, "bg")
        # background: lit, with emissive regions (screen, window, bulb) left bright
        light_map(self.lsurf.getCanvas(), t, cam, masks=True)
        limg = skia.Image.fromarray(self.larr, colorType=skia.kRGBA_8888_ColorType, copy=False)
        p = skia.Paint()
        p.setBlendMode(skia.BlendMode.kMultiply)
        c.drawImage(limg, 0, 0, skia.SamplingOptions(), p)
        # foreground (characters & props): its own layer, lit without the masks
        fc = self.fsurf.getCanvas()
        fc.clear(skia.Color4f(0, 0, 0, 0))
        draw_world(fc, t, cam, "fg")
        light_map(self.lsurf.getCanvas(), t, cam, masks=False)
        limg = skia.Image.fromarray(self.larr, colorType=skia.kRGBA_8888_ColorType, copy=False)
        pm_ = skia.Paint()
        pm_.setBlendMode(skia.BlendMode.kModulate)
        fc.drawImage(limg, 0, 0, skia.SamplingOptions(), pm_)
        c.drawImage(skia.Image.fromarray(self.farr, colorType=skia.kRGBA_8888_ColorType, copy=False), 0, 0)
        # additive glows on top of the lit frame
        self.glows(c, t, cam)
        return self.arr

    def glows(self, c, t, cam):
        z, cx, cy = cam
        c.save()
        c.translate(W / 2, H / 2)
        c.scale(z, z)
        c.translate(-cx, -cy)

        def glow(x, y, r, col, a):
            sh = skia.GradientShader.MakeRadial((x, y), r, [skia.Color4f(*col[:3], a).toColor(),
                                                           skia.Color4f(*col[:3], 0).toColor()])
            pp = skia.Paint(AntiAlias=True)
            pp.setShader(sh)
            pp.setBlendMode(skia.BlendMode.kPlus)
            c.drawCircle(x, y, r, pp)

        sx, sy, sw, sh_ = SCREEN
        glow(sx + sw / 2, sy + sh_ / 2, 520, hexc("#6F8FD0"), 0.10)
        glow(LAMP_HEAD[0] + 10, LAMP_HEAD[1] + 50, 200, hexc("#FFD9A0"), 0.28)
        fs = firefly_world(t)
        if fs and fs["glow"] > 0:
            glow(fs["x"] - 18, fs["y"] - 24, 90, hexc("#FFE08A"), 0.55 * fs["glow"])
        c.restore()

    def frame(self, fi):
        t = fi / FPS
        self.acc[:] = 0
        n = SUB if SUB > 1 else 1
        for k in range(n):
            ts = t + ((k + 0.5) / n - 0.5) * SHUTTER / FPS if n > 1 else t
            # never blur across a hard cut
            ts = no_cross_cut(t, ts)
            self.acc += self.sub(max(0.0, min(DUR - 1e-4, ts)))
        out = (self.acc / n).astype(np.uint8)
        self.arr[:] = out
        c = self.surf.getCanvas()
        self.bloom(c)
        # screen-space overlays
        vignette(c)
        captions(c, t)
        title_card(c, t)
        fade = 1 - ease_in(prog(t, DUR - 0.7, 0.7))
        fade_in = ease_out(prog(t, 0, 0.5))
        k = min(fade, fade_in)
        if k < 1:
            c.drawRect(skia.Rect.MakeWH(W, H), paint((0, 0, 0, 1 - k)))
        g = self.grain[fi % len(self.grain)]
        g2 = np.repeat(np.repeat(g, 2, 0), 2, 1)
        a = self.arr[:, :, :3].astype(np.float32)
        a += g2[:, :, None] * 3.2
        self.arr[:, :, :3] = np.clip(a, 0, 255).astype(np.uint8)
        return self.arr

    def bloom(self, c):
        img = skia.Image.fromarray(self.arr, colorType=skia.kRGBA_8888_ColorType)
        # bright-pass at quarter res
        sc = self.sm.getCanvas()
        sc.clear(skia.ColorBLACK)
        p = skia.Paint()
        k, off = 2.4, -0.7 * 2.4
        p.setColorFilter(skia.ColorFilters.Matrix([k, 0, 0, 0, off, 0, k, 0, 0, off, 0, 0, k, 0, off, 0, 0, 0, 1, 0]))
        sc.drawImageRect(img, skia.Rect.MakeWH(W // 4, H // 4), skia.SamplingOptions(skia.FilterMode.kLinear), p)
        small = self.sm.makeImageSnapshot()
        s2 = self.sm2.getCanvas()
        s2.clear(skia.ColorBLACK)
        pb = skia.Paint()
        pb.setImageFilter(skia.ImageFilters.Blur(6, 6))
        s2.drawImage(small, 0, 0, skia.SamplingOptions(), pb)
        bl = self.sm2.makeImageSnapshot()
        pa = skia.Paint()
        pa.setBlendMode(skia.BlendMode.kPlus)
        pa.setAlphaf(0.55)
        c.drawImageRect(bl, skia.Rect.MakeWH(W, H), skia.SamplingOptions(skia.FilterMode.kLinear), pa)


CUTS = [T["cut_close"], T["cut_chase"], T["cut_tender"], T["cut_window"], T["cut_tests"], T["cut_end"]]


def no_cross_cut(t, ts):
    for cut in CUTS:
        if t >= cut > ts:
            return cut
        if t < cut <= ts:
            return cut - 1e-4
    return ts


def vignette(c):
    sh = skia.GradientShader.MakeRadial((W / 2, H / 2), W * 0.72, [
        skia.Color4f(0, 0, 0, 0).toColor(), skia.Color4f(0, 0, 0, 0).toColor(), skia.Color4f(0.02, 0.02, 0.06, 0.55).toColor()],
        [0, 0.5, 1])
    p = skia.Paint()
    p.setShader(sh)
    c.drawPaint(p)


# ---------------------------------------------------------------- entry points
_R = None


def _init():
    global _R
    _R = Renderer()


def _chunk(args):
    k, f0, f1, out = args
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in range(f0, f1):
        p.stdin.write(_R.frame(f).tobytes())
    p.stdin.close()
    p.wait()
    return k


def render_video():
    nfr = int(DUR * FPS)
    os.makedirs(os.path.join(BUILD, "chunks"), exist_ok=True)
    n = 12
    step = math.ceil(nfr / n)
    jobs = [(k, k * step, min(nfr, (k + 1) * step), os.path.join(BUILD, "chunks", f"c{k:02d}.mp4")) for k in range(n)]
    with Pool(os.cpu_count(), initializer=_init) as pool:
        for k in pool.imap_unordered(_chunk, jobs):
            print("chunk", k, flush=True)
    lst = os.path.join(BUILD, "chunks", "list.txt")
    open(lst, "w").write("".join(f"file '{j[3]}'\n" for j in jobs))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy",
                    os.path.join(BUILD, "video.mp4")], check=True)


def stills(times):
    r = Renderer()
    d = os.path.join(BUILD, "stills")
    os.makedirs(d, exist_ok=True)
    cols, tw, th = 3, 640, 360
    rows = math.ceil(len(times) / cols)
    sheet = np.full((rows * (th + 28), cols * tw, 4), 255, np.uint8)
    ss = skia.Surface(sheet, colorType=skia.kRGBA_8888_ColorType)
    cv = ss.getCanvas()
    for i, t in enumerate(times):
        a = r.frame(int(round(t * FPS))).copy()
        img = skia.Image.fromarray(a, colorType=skia.kRGBA_8888_ColorType)
        img.save(os.path.join(d, f"f_{t:05.2f}.png"), skia.kPNG)
        x, y = (i % cols) * tw, (i // cols) * (th + 28)
        cv.drawImageRect(img, skia.Rect.MakeXYWH(x, y + 28, tw, th), skia.SamplingOptions(skia.FilterMode.kLinear))
        cv.drawString(f"{t:.2f}s", x + 8, y + 21, font(20, wght=600), paint(P["slate"]))
    skia.Image.fromarray(sheet, colorType=skia.kRGBA_8888_ColorType).save(os.path.join(d, "sheet.png"), skia.kPNG)
    print(os.path.join(d, "sheet.png"))


if __name__ == "__main__":
    if sys.argv[1] == "stills":
        stills([float(x) for x in sys.argv[2:]])
    elif sys.argv[1] == "video":
        render_video()
