"""Part 2 (the good ending) and the outro."""
import math
import random

import skia

from characters import blink_at, clawd, human
from core import Scene
from engine import (H, P, W, Burst, Xf, bg_gradient, bump, circle, clamp, ease_in, ease_in_out,
                    ease_out, ease_out_back, font, hexc, line, mix, oval, paint, pop, prog,
                    radial_glow, rrect, shadow, sparkle, star_path, text, vignette, with_alpha)
from kit import arc, breathe, camera, dust, hop, land, shake
from props import (button, cursor, flask, floor, globe, house, lightbulb, music_note, piano,
                   question_bubble, sapling, solar, stars, sunburst, tree, turbine)
from scenes_p1 import CROWD, crowd_row, cream_bg, drawing_scene, office, part_card


# ======================================================================
def montage_good():
    S = Scene("montage_good", trans="zoom", tin=0.5)
    n11 = S.say("N11", 0.4)
    t_help = S.word_at("N11", n11, "helped")
    t_care = S.word_at("N11", n11, "care")
    t_panels = [n11.start + 0.05, n11.start + 1.0, t_help - 0.1, t_care - 0.15]
    for i, tp in enumerate(t_panels):
        S.sfx(tp, "pop", 0.65, pan=[-0.5, 0.5, -0.5, 0.5][i], pitch=1 + i * 0.08)
    S.sfx(t_panels[0] + 0.7, "bubble", 0.5)
    S.sfx(t_panels[1] + 0.3, "grow", 0.7)
    S.sfx(t_panels[2] + 0.4, "chime_up", 0.5)
    S.sfx(t_panels[3] + 0.3, "whirr", 0.35)
    S.dur = n11.end + 1.3
    rng = random.Random(9)
    trees = [(rng.uniform(-180, 180), rng.uniform(-40, 60), rng.uniform(0, 1)) for _ in range(26)]
    hearts = Burst(0, 0, t_panels[0] + 1.3, n=12, kind="sparkle", speed=260, colors=[P["fig"], P["gold"]])

    def panel(c, i, x, y, t, k):
        with Xf(c, x, y, s=k, rot=[-0.02, 0.015, 0.02, -0.015][i]):
            pw, ph = 800, 440
            rrect(c, -pw / 2, -ph / 2 + 14, pw, ph, 36, (0, 0, 0, 0.15), blur=20)
            bgc = [hexc("#EAF1F7"), hexc("#EEF3E4"), hexc("#E9EEF6"), hexc("#FBF1DC")][i]
            rrect(c, -pw / 2, -ph / 2, pw, ph, 36, bgc)
            c.save()
            c.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-pw / 2, -ph / 2, pw, ph), 36, 36), doAntiAlias=True)
            lt = t - t_panels[i]
            if i == 0:  # lab
                rrect(c, -400, 110, 800, 200, 0, hexc("#D5DCE4"))
                human(c, "man", -200, 200, h=300, expr="happy" if lt > 1.3 else "smile", blink=blink_at(t, 3),
                      arm_r=-1.0, look=(0.8, 0), shadow_a=0)
                flask(c, 10, 110, 1.1, t=t, liquid=mix(P["fig"], P["olive_lt"], ease_in_out(prog(lt, 0.8, 0.8))))
                clawd(c, 200, 110, h=120, eyes="happy" if lt > 1.3 else "normal", look=(-0.9, 0), blush=1,
                      arm_l=0.6 + 0.4 * math.sin(t * 7), blink=blink_at(t, 1.2), shadow_a=0.1)
                with Xf(c, 10, -60):
                    hearts.draw(c, t)
                    if lt > 1.3:
                        kk = ease_out_back(prog(lt, 1.3, 0.4), 2.5)
                        with Xf(c, 0, -40 - 10 * math.sin(t * 3), s=kk):
                            text(c, "EUREKA!", 0, 0, font(50, wght=700), P["fig"])
            elif i == 1:  # garden
                rrect(c, -400, 130, 800, 200, 0, hexc("#B9CF94"))
                human(c, "woman", -220, 200, h=300, expr="happy" if lt > 1.2 else "smile", blink=blink_at(t, 2),
                      arm_r=-0.8, look=(0.8, 0), shadow_a=0)
                g = ease_out(prog(lt, 0.3, 1.2))
                tree(c, 20, 140, 0.95, grow=g, sway=math.sin(t * 2))
                clawd(c, 220, 140, h=120, eyes="happy", blush=1, arm_l=1.0, blink=blink_at(t, 1), shadow_a=0.1)
                # watering drops
                for j in range(5):
                    q = (t * 1.5 + j / 5) % 1
                    if lt < 1.6:
                        circle(c, 130 - q * 70, 60 + q * 80, 6, with_alpha(P["sky"], 1 - q))
            elif i == 2:  # globe greening
                gr = ease_in_out(prog(lt, 0.2, 1.8))
                trs = [(lon, lat, prog(lt, 0.2 + d * 1.6, 0.4)) for (lon, lat, d) in trees]
                globe(c, 0, 20, 175, t * 30, green=gr, trees=trs, t=t, lights=gr)
                for j in range(3):
                    a = t * 0.8 + j * 2.1
                    clawd(c, math.cos(a) * 280, 20 + math.sin(a) * 60 + 60, h=54, eyes="happy", shadow_a=0,
                          alpha=1 if math.sin(a) > -0.2 else 0.0)
            else:  # clean energy town
                rrect(c, -400, 120, 800, 200, 0, hexc("#E6D3AE"))
                for j, hx in enumerate((-280, -120, 60)):
                    house(c, hx, 130, 0.85, lit=0.8, roof=[P["clay"], P["sky"], P["olive"]][j])
                for j, tx in enumerate((200, 320)):
                    turbine(c, tx, 130, 0.8, rot=t * 3 + j)
                solar(c, -330, 200, 0.7, shine=bump(t, t_panels[3] + 0.6, 0.5))
                clawd(c, 250, 200, h=90, eyes="happy", blush=1, shadow_a=0.1, arm_l=0.8, arm_r=0.8)
            c.restore()

    def draw(c, t, g):
        cream_bg(c, t)
        sunburst(c, W / 2, H / 2, t * 0.12, P["gold"], 0.07)
        zoom = 1.0 + 0.03 * ease_in_out(prog(t, 0, S.dur))
        with camera(c, zoom):
            pos = [(W / 2 - 430, 250), (W / 2 + 430, 250), (W / 2 - 430, 670), (W / 2 + 430, 670)]
            for i, (x, y) in enumerate(pos):
                k = ease_out_back(prog(t, t_panels[i] - 0.05, 0.5), 1.8)
                if k > 0:
                    panel(c, i, x, y, t, k * 0.9)
        vignette(c, 0.14)

    S.draw = draw
    return S


# ======================================================================
MELODY = [(0, 0.0), (2, 0.28), (4, 0.56), (7, 0.84), (4, 1.12), (5, 1.4), (7, 1.68), (9, 1.96), (11, 2.3)]


def piano_scene():
    S = Scene("piano", trans="slide", tin=0.55)
    c11 = S.say("C11", 0.45)
    guide = [c11.start + 0.3 + i * 0.22 for i in range(3)]
    for i, tg in enumerate(guide):
        S.sfx(tg, "guide", 0.25, pitch=1 + i * 0.12)
    w03 = S.say("W03", c11.end + 0.35)
    t_play = w03.end + 0.25
    for (key, dt) in MELODY:
        S.sfx(t_play + dt, "piano", 0.55, note=key)
    S.dur = t_play + 3.1
    burst = Burst(W / 2, 520, t_play + 2.3, n=34, kind="confetti", speed=780)

    def draw(c, t, g):
        bg_gradient(c, hexc("#FBF4EA"), hexc("#F2E3CF"))
        radial_glow(c, W / 2, 380, 900, P["gold"], 0.25 * ease_out(prog(t, t_play, 1.5)))
        floor(c, 900, hexc("#E4CFB2"))
        zoom = 1.3 + 0.08 * ease_in_out(prog(t, 0, S.dur))
        with camera(c, zoom, 980, 610):
            pressed = {}
            for (key, dt) in MELODY:
                k = bump(t, t_play + dt - 0.02, 0.3)
                if k > 0:
                    pressed[key] = max(pressed.get(key, 0), k)
            for i, tg in enumerate(guide):
                k = bump(t, tg, 0.5) * 0.6
                if k > 0:
                    pressed[i * 2] = max(pressed.get(i * 2, 0), k)
            playing = t > t_play and t < t_play + 2.6
            human(c, "woman", 700, 920, h=470, mouth=g.mouth("WOMAN"),
                  expr="happy" if playing else ("smile" if t > w03.start else "neutral"),
                  look=(0.7, 0.4 if playing else -0.1), blink=blink_at(t, 0.5),
                  arm_r=-0.9 - (0.25 * math.sin(t * 16) if playing else 0), arm_l=-0.2,
                  bob=0.12 * abs(math.sin(t * 7)) if playing else 0)
            piano(c, 1060, 860, 640, pressed=pressed, t=t)
            # Clawd on the piano lid, cheering
            jy, jsq = hop(t, t_play + 2.2, 0.4, 70)
            eyes = "happy" if (playing or t > t_play + 2.2) else "normal"
            danc = math.sin(t * 9) * 0.15 if playing else 0
            clawd(c, 1240, 690 + jy, h=170, eyes=eyes, mouth=g.mouth("CLAWD"), blush=1.0, look=(-0.8, 0.3),
                  blink=blink_at(t, 0.9), arm_l=(1.2 if c11.start < t < c11.end else 0.3) + (1.2 if playing else 0),
                  arm_r=1.0 if playing else 0.2, tilt=danc, squash=jsq + breathe(t))
            for i, (key, dt) in enumerate(MELODY):
                p = prog(t, t_play + dt, 1.6)
                if 0 < p < 1:
                    x = 1060 - 320 + key * (640 / 14) + math.sin(p * 8 + i) * 30
                    y = 720 - p * 480
                    music_note(c, x, y, s=1.0 + 0.3 * p, col=[P["clay"], P["sky"], P["fig"], P["olive"], P["gold"]][i % 5],
                               alpha=1 - ease_in(p), rot=math.sin(p * 6 + i) * 0.3)
            burst.draw(c, t)
        vignette(c, 0.14)

    S.draw = draw
    return S


# ======================================================================
def questions():
    S = Scene("questions", trans="fade", tin=0.5)
    n12 = S.say("N12", 0.45)
    t_people = S.word_at("N12", n12, "people")
    t_q = S.word_at("N12", n12, "questions")
    t_bub = [t_people + i * 0.12 for i in range(6)]
    t_bulb = [t_q + 0.25 + i * 0.16 for i in range(6)]
    for i, tb in enumerate(t_bub):
        S.sfx(tb, "pop", 0.4, pitch=1 + i * 0.05)
    for i, tb in enumerate(t_bulb):
        S.sfx(tb, "bulb", 0.5, note=[0, 2, 4, 7, 9, 12][i])
    S.dur = t_bulb[-1] + 1.4

    def draw(c, t, g):
        bg_gradient(c, hexc("#FFF8EC"), hexc("#F6E6CF"))
        sunburst(c, W / 2, 1000, t * 0.1, P["gold"], 0.06)
        for i in range(7):
            house(c, 140 + i * 280, 640, 1.3, col=P["ivory"], roof=[P["clay"], P["sky"], P["olive"], P["fig"]][i % 4],
                  lit=0.4)
            tree(c, 280 + i * 280, 640, 0.6, grow=1.0, sway=math.sin(t * 2 + i))
        floor(c, 640, hexc("#E6D3AE"))

        def bubble(i, x, y):
            if t < t_bub[i]:
                return
            k = pop(t, t_bub[i], 0.4)
            on = ease_out(prog(t, t_bulb[i], 0.25))
            flip = bump(t, t_bulb[i] - 0.1, 0.2)
            question_bubble(c, x, y + math.sin(t * 2 + i) * 6, s=0.95 * k * (1 + 0.15 * flip),
                            content="bulb" if t > t_bulb[i] else "?", on=on, wob=math.sin(t * 1.5 + i) * 0.06)
            if 0 < t - t_bulb[i] < 0.5:
                kk = prog(t, t_bulb[i], 0.5)
                for j in range(6):
                    a = j * 1.047
                    sparkle(c, x + math.cos(a) * 80 * kk, y + math.sin(a) * 80 * kk, 16 * (1 - kk), P["gold"])

        def expr(i):
            return "happy" if t > t_bulb[i] else "smile"

        def bob(i):
            _, sq = 0, 0
            y, _ = hop(t, t_bulb[i] + 0.05, 0.35, 0.5)
            return -y

        crowd_row(c, t, g, bubble, expr, bob_fn=bob)
        vignette(c, 0.12)

    S.draw = draw
    return S


# ======================================================================
CONSTELLATION = [(-6, -5), (6, -5), (6, 3), (8, 1), (6, 3), (6, 5), (-6, 5), (-6, 3), (-8, 1), (-6, 3), (-6, -5)]


def stargazing():
    S = Scene("stars", trans="fade", tin=1.0)
    S.sfx(0.3, "shooting_star", 0.6)
    c12 = S.say("C12", 1.3)
    k05 = S.say("K05", c12.end + 0.45)
    t_hug = k05.start + 0.2
    S.sfx(t_hug, "hug", 0.5)
    t_con = k05.end + 0.2
    for i in range(len(CONSTELLATION)):
        S.sfx(t_con + i * 0.13, "star_ping", 0.35, note=[0, 4, 7, 12, 7, 4, 0, 4, 7, 12, 16][i])
    S.dur = t_con + len(CONSTELLATION) * 0.13 + 2.0

    def draw(c, t, g):
        night = ease_in_out(prog(t, 0, 4.0))
        top = mix(hexc("#F4A86E"), hexc("#1E2448"), night)
        bot = mix(hexc("#FBD9A0"), hexc("#5A4A78"), night)
        bg_gradient(c, top, bot)
        stars(c, t, seed=5, n=110, alpha=night)
        # shooting star
        p = prog(t, 0.3, 0.9)
        if 0 < p < 1:
            x, y = 1500 - p * 900, 90 + p * 260
            line(c, x, y, x + 160 * (1 - p), y - 46 * (1 - p), with_alpha(P["ivory"], 1 - p), 5)
            sparkle(c, x, y, 18, P["ivory"])
        # constellation Clawd
        cx, cy, u = W / 2 + 300, 260, 26
        pts = [(cx + a * u, cy + b * u) for a, b in CONSTELLATION]
        for i in range(len(pts) - 1):
            kp = ease_out(prog(t, t_con + i * 0.13, 0.2))
            if kp > 0:
                x0, y0 = pts[i]
                x1, y1 = pts[i + 1]
                line(c, x0, y0, x0 + (x1 - x0) * kp, y0 + (y1 - y0) * kp, with_alpha(P["gold"], 0.7), 4)
        for i, (x, y) in enumerate(pts):
            kp = pop(t, t_con + i * 0.13, 0.3)
            if kp > 0:
                radial_glow(c, x, y, 40 * kp, P["gold"], 0.6)
                sparkle(c, x, y, 16 * kp, P["ivory"], t)
        if t > t_con + 1.2:
            kk = ease_out(prog(t, t_con + 1.2, 0.5))
            for s in (-1, 1):
                rrect(c, cx + s * 3.5 * u - 0.5 * u, cy - 3 * u, u, 2 * u, 5, with_alpha(P["gold"], 0.9 * kk))
        # fireflies
        rng = random.Random(3)
        for i in range(18):
            fx = rng.uniform(100, W - 100) + math.sin(t * 0.7 + i) * 40
            fy = rng.uniform(560, 900) + math.cos(t * 0.9 + i * 2) * 30
            radial_glow(c, fx, fy, 22, P["gold"], 0.6 * night * (0.5 + 0.5 * math.sin(t * 3 + i)))
        # hill
        hill = skia.Path()
        hill.moveTo(-100, H + 10)
        hill.lineTo(-100, 860)
        hill.cubicTo(500, 700, 1300, 700, W + 100, 850)
        hill.lineTo(W + 100, H + 10)
        hill.close()
        c.drawPath(hill, paint(mix(hexc("#7C9A5E"), hexc("#2E3B3A"), night * 0.8)))
        # the gang, sitting and looking up
        lean = ease_in_out(prog(t, t_hug, 0.4))
        human(c, "man", 560, 900, h=360, sitting=True, look=(0.3, -1), expr="smile", blink=blink_at(t, 2), shadow_a=0)
        human(c, "woman", 780, 880, h=360, sitting=True, look=(0.2, -1), expr="smile", blink=blink_at(t, 1), shadow_a=0)
        clawd(c, 1010, 866, h=170, look=(0.3, -1) if not g.speaking("CLAWD") else (-0.4, -0.2),
              eyes="happy" if t > t_hug else "normal", mouth=g.mouth("CLAWD"), blink=blink_at(t, 0.3),
              blush=0.5 + 0.5 * lean, shadow_a=0, tilt=-0.08 * lean, arm_r=0.8 * lean)
        human(c, "kid", 1200 - 50 * lean, 880, h=380, sitting=True, mouth=g.mouth("KID"),
              expr="happy" if t > k05.end else "smile", look=(-0.6, -0.4), blink=blink_at(t, 0.7),
              tilt=-0.18 * lean, arm_l=-1.2 * lean, shadow_a=0)
        vignette(c, 0.25)

    S.draw = draw
    return S


# ======================================================================
def good_card():
    S = Scene("good_end", trans="white", tin=0.7)
    S.sfx(0.2, "fanfare", 1.0)
    S.sfx(0.4, "confetti", 0.8)
    S.dur = 4.4
    bursts = [Burst(W / 2 + dx, 420, 0.4 + d, n=40, kind="confetti", speed=900, seed=s)
              for dx, d, s in ((-500, 0.0, 1), (500, 0.15, 2), (0, 0.35, 3))]
    f_big = font(150, wght=700)

    def draw(c, t, g):
        bg_gradient(c, hexc("#FFF4D6"), hexc("#FBDFA8"))
        sunburst(c, W / 2, 440, t * 0.2, P["white"], 0.25)
        radial_glow(c, W / 2, 440, 700, P["white"], 0.6)
        words = ["GOOD", "ENDING"]
        ws = [f_big.measureText(w) for w in words]
        x = W / 2 - (sum(ws) + 50) / 2
        for i, wd in enumerate(words):
            k = ease_out_back(prog(t, 0.25 + i * 0.18, 0.55), 2.4)
            if k > 0:
                with Xf(c, x + ws[i] / 2, 470 + math.sin(t * 2.5 + i) * 6, s=k, rot=(1 - k) * 0.3):
                    text(c, wd, 0, 8, f_big, mix(P["gold"], P["clay"], 0.55), shadow_a=0)
                    text(c, wd, 0, 0, f_big, P["gold"] if i else P["clay"], shadow_a=0.2)
            x += ws[i] + 50
        ka = ease_out(prog(t, 0.9, 0.4))
        text(c, "ENDING 2 / 2", W / 2, 570, font(40, wght=700), with_alpha(P["clay_dk"], ka))
        for i in range(8):
            a = t * 0.8 + i * math.pi / 4
            sparkle(c, W / 2 + math.cos(a) * 700, 440 + math.sin(a) * 260, 18 + 10 * math.sin(t * 5 + i),
                    with_alpha(P["white"], 0.9))
        jy, jsq = hop(t, 1.0, 0.45, 110)
        jy2, jsq2 = hop(t, 1.9, 0.45, 110)
        pk = ease_out_back(prog(t, 0.6, 0.6))
        clawd(c, W / 2, H + 150 - 280 * pk + jy + jy2, h=260, eyes="star", blush=1.0, arm_l=1.6 + 0.3 * math.sin(t * 9),
              arm_r=1.6 + 0.3 * math.sin(t * 9 + 1), squash=jsq + jsq2, shadow_a=0, smile=1.0)
        for b in bursts:
            b.draw(c, t)
        vignette(c, 0.12)

    S.draw = draw
    return S


# ======================================================================
def outro():
    S = Scene("outro", trans="slide", tin=0.55)
    c13 = S.say("C13", 0.7)
    t_which = S.word_at("C13", c13, "which")
    S.sfx(t_which, "tick", 0.4)
    t_choose = S.word_at("C13", c13, "choose")
    t_hover = c13.end + 0.5
    S.sfx(t_hover + 0.65, "sparkle", 0.6)
    t_wink = t_hover + 1.1
    S.sfx(t_wink, "wink", 0.7)
    t_end = t_wink + 1.2
    S.dur = t_end + 1.4

    def draw(c, t, g):
        cream_bg(c, t)
        dust(c, t, seed=4, col=(1, 0.85, 0.7, 0.4))
        bk = [pop(t, 0.3, 0.45), pop(t, 0.45, 0.45)]
        glow = ease_out(prog(t, t_hover + 0.6, 0.4))
        fade_end = 1 - ease_in_out(prog(t, t_end, 1.0))
        with Xf(c, 0, 0, alpha=fade_end):
            button(c, W / 2 - 540, 520, 440, 130, "BAD ENDING", hexc("#5A5350"), s=bk[0] * (1 - 0.1 * glow),
                   fsize=46, txt=P["heather"])
            button(c, W / 2 + 540, 520, 440, 130, "GOOD ENDING", P["gold"], s=bk[1] * (1 + 0.08 * glow), fsize=46,
                   glow=glow)
            look = (0, 0)
            if t_which - 0.1 < t < t_choose:
                look = (-1, 0)
            elif t >= t_choose:
                look = (1, 0)
            eyes = "normal"
            if t > t_hover + 0.6:
                eyes = "star"
            clawd(c, W / 2, 760, h=300, look=look, eyes=eyes, mouth=g.mouth("CLAWD"), blink=blink_at(t, 1.0),
                  blush=1.0, arm_r=1.3 * ease_out_back(prog(t, t_hover + 0.6, 0.3)), squash=breathe(t))
            if t > t_wink - 0.05 and t < t_wink + 0.6:
                # wink: redraw left eye closed as a happy arc
                u = 30
                rrect(c, W / 2 - 3.5 * u - 0.7 * u, 760 - 7 * u - 1.4 * u, 1.4 * u, 2.8 * u, 6, P["clay"])
                path = skia.Path()
                path.moveTo(W / 2 - 3.5 * u + look[0] * 0.45 * u - 0.75 * u, 760 - 7 * u + 0.35 * u)
                path.quadTo(W / 2 - 3.5 * u + look[0] * 0.45 * u, 760 - 7 * u - 1.05 * u,
                            W / 2 - 3.5 * u + look[0] * 0.45 * u + 0.75 * u, 760 - 7 * u + 0.35 * u)
                c.drawPath(path, paint(P["slate"], stroke=0.45 * u))
            cp = ease_in_out(prog(t, t_hover, 0.65))
            if cp > 0:
                cursor(c, W + 80 + (W / 2 + 600 - W - 80) * cp, H + 60 + (540 - H - 60) * cp)
        # end title
        ek = ease_out(prog(t, t_end + 0.2, 0.8))
        if ek > 0:
            with Xf(c, W / 2, H / 2 + 20 - (1 - ek) * 20, alpha=ek):
                text(c, "The future isn't taken.", 0, -30, font(74, wght=600), P["slate"])
                text(c, "It's built together.", 0, 60, font(74, wght=700), P["clay"])
        vignette(c, 0.15)

    S.draw = draw
    return S


def build():
    return [
        part_card("p2_title", "PART 2", "The Good Ending", False, "white", 0.6, "sting_bright"),
        office("office_good", ("N09", "M02", "C09"), True, "wipe", 0.8),
        drawing_scene("drawing_good", True, "slide", 0.55),
        montage_good(),
        piano_scene(),
        questions(),
        stargazing(),
        good_card(),
        outro(),
    ]
