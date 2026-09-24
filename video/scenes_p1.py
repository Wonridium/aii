"""Cold open + Part 1 (the bad ending)."""
import math
import random

import skia

from characters import blink_at, clawd, human
from core import Scene
from engine import (H, P, W, Burst, Xf, bg_gradient, bump, circle, clamp, ease_in, ease_in_out,
                    ease_out, ease_out_back, font, hexc, line, mix, oval, paint, pop, prog,
                    radial_glow, rrect, shadow, sparkle, text, vignette, with_alpha)
from kit import arc, breathe, camera, dust, graded, hop, land, shake
from props import (button, couch, cursor, desk, globe, icon, lamp, laptop, paper, paper_stack,
                   plant, question_bubble, stamp, stars, sun_drawing, wall_window, floor, house,
                   crayon)

BG_TOP, BG_BOT = P["ivory"], P["cream"]


def cream_bg(c, t=0.0):
    bg_gradient(c, BG_TOP, BG_BOT)
    radial_glow(c, W / 2, H * 0.45, 900, P["white"], 0.55)


# ======================================================================
def intro():
    S = Scene("intro")
    t_drop, t_land = 0.25, 0.62
    S.sfx(t_drop, "whoosh_down", 0.7)
    S.sfx(t_land, "land", 1.0)
    c01 = S.say("C01", 1.0)
    S.sfx(1.05, "sparkle", 0.5)
    n01 = S.say("N01", c01.end + 0.45)
    # question bubbles pop around Clawd while the narrator talks
    rng = random.Random(5)
    bubbles = []
    for i in range(12):
        a = -math.pi / 2 + (i - 5.5) * 0.36 + rng.uniform(-0.08, 0.08)
        rad = rng.uniform(430, 560)
        bx, by = W / 2 + math.cos(a) * rad * 1.35, 700 + math.sin(a) * rad * 0.95
        tb = n01.start + 0.25 + i * 0.19
        bubbles.append((bx, by, tb, rng.uniform(0.75, 1.15), rng.uniform(-0.2, 0.2)))
        S.sfx(tb, "pop", 0.45, pan=(bx - W / 2) / W * 1.4, pitch=1.0 + 0.04 * i)
    n02 = S.say("N02", n01.end + 0.4)
    t_took = S.word_at("N02", n02, "took")
    t_suck = t_took - 0.35
    S.sfx(t_suck, "whoosh", 0.7)
    title_words = ["What", "if", "Claude...", "took", "over", "the", "world?"]
    t_words = [S.word_time("N02", n02, i) for i in range(7)]
    for i, tw in enumerate(t_words):
        S.sfx(tw, "tick", 0.35, pitch=1 + i * 0.07)
    S.sfx(t_words[6], "boom_soft", 0.6)
    c02 = S.say("C02", n02.end + 0.35)
    t_me = S.word_at("C02", c02, "Me")
    S.sfx(c02.start - 0.05, "boing", 0.8)
    S.sfx(t_me - 0.05, "zoom_in", 0.6)
    n03 = S.say("N03", c02.end + 0.4)
    t_twice = S.word_at("N03", n03, "Twice")
    S.sfx(t_twice - 0.05, "swish", 0.7, pan=-0.4)
    S.sfx(t_twice + 0.12, "swish", 0.7, pan=0.4)
    S.sfx(t_twice + 0.35, "ding", 0.5)
    S.dur = n03.end + 1.25

    ftitle = font(92, wght=700)

    def draw(c, t, g):
        cream_bg(c, t)
        dust(c, t, seed=1, col=(1, 0.85, 0.7, 0.45))
        # camera: push in on "Me?!"
        zoom = 1.0 + 0.22 * ease_in_out(prog(t, t_me - 0.05, 0.3)) * (1 - ease_in_out(prog(t, n03.start - 0.1, 0.5)))
        sh = shake(t, [t_land, (t_me, 10)], amp=12)
        cy_cam = H / 2 + 120 * ease_in_out(prog(t, t_me - 0.05, 0.3)) * (1 - ease_in_out(prog(t, n03.start - 0.1, 0.5)))
        with camera(c, zoom, W / 2, cy_cam, shake=sh):
            # Clawd: drop, then drift down-right as the title arrives
            move = ease_in_out(prog(t, t_suck, 0.8))
            cx = W / 2
            gy = 760 + 60 * move
            hh = 380 - 130 * move
            if t < t_land:
                p = prog(t, t_drop, t_land - t_drop)
                y = -200 + (gy + 200) * ease_in(p)
                sq = -0.15 * p
            else:
                y = gy
                sq = land(t, t_land, amp=0.35)
            jy, jsq = hop(t, c02.start, 0.42, 90)
            eyes = "normal"
            if c01.start - 0.1 < t < c01.end + 0.3:
                eyes = "happy"
            if c02.start <= t < c02.end + 0.4:
                eyes = "wide"
            if t > t_twice:
                eyes = "happy"
            look = (0.0, 0.0)
            if n01.start < t < t_suck:
                look = (math.sin((t - n01.start) * 2.2) * 0.9, -0.4)
            if t_suck < t < c02.start:
                look = (0.0, -1.0)
            wave = math.sin(t * 14) * 0.35 * bump(t, c01.start - 0.1, c01.dur + 0.4)
            arm_r = (1.4 + wave) * bump(t, c01.start - 0.1, c01.dur + 0.4) ** 0.3 if t < c01.end + 0.3 else 0
            arm_l = 1.9 * ease_out_back(prog(t, t_me - 0.1, 0.25)) * (1 - prog(t, c02.end + 0.2, 0.3))
            if t > t_twice:
                arm_l = arm_r = 1.2 + math.sin(t * 9) * 0.3
            clawd(c, cx, y + jy, h=hh, squash=sq + jsq + breathe(t), eyes=eyes, look=look,
                  blink=blink_at(t, 0.3), mouth=g.mouth("CLAWD"), blush=1.0 if eyes == "happy" else 0.4,
                  arm_r=arm_r, arm_l=arm_l, sweat=ease_out(prog(t, c02.start + 0.1, 0.3)) * (1 - prog(t, n03.start, 0.3)))
            if t_land <= t < t_land + 0.5:
                for i in range(6):
                    k = prog(t, t_land, 0.5)
                    s = -1 if i < 3 else 1
                    circle(c, cx + s * (200 + k * 120 + (i % 3) * 30), 760 - 20 - (i % 3) * 18 - k * 30,
                           (18 - (i % 3) * 4) * (1 - k), with_alpha(P["oat"], 1 - k))
            # bubbles
            for (bx, by, tb, s, rot) in bubbles:
                if t < tb:
                    continue
                k = pop(t, tb, 0.4)
                p = ease_in(prog(t, t_suck, 0.45))
                x = bx + (W / 2 - bx) * p
                yy = by + (330 - by) * p + math.sin(t * 2 + bx) * 8
                question_bubble(c, x, yy, s=s * k * (1 - p * 0.9), alpha=1 - prog(t, t_suck + 0.35, 0.12),
                                wob=rot + math.sin(t * 3 + by) * 0.05)
            # title words
            if t > t_words[0] - 0.1:
                out = ease_in(prog(t, t_twice - 0.1, 0.35))
                rows = [title_words[:3], title_words[3:]]
                ti = 0
                for r, row in enumerate(rows):
                    ws = [ftitle.measureText(w) for w in row]
                    total = sum(ws) + 28 * (len(row) - 1)
                    x = W / 2 - total / 2
                    for j, wd in enumerate(row):
                        tw = t_words[ti]
                        k = ease_out_back(prog(t, tw - 0.05, 0.35), 2.4)
                        if k > 0:
                            col = P["clay"] if wd in ("Claude...", "world?") else P["slate"]
                            yy = 230 + r * 120 - out * 700 * (1 + r * 0.15)
                            with Xf(c, x + ws[j] / 2, yy, s=k, rot=(1 - k) * 0.2):
                                text(c, wd, 0, 0, ftitle, col, shadow_a=0.18)
                        x += ws[j] + 28
                        ti += 1
                # little spinning world icon next to "world?"
                gk = pop(t, t_words[6] + 0.1, 0.5) * (1 - out)
                if gk > 0:
                    globe(c, W / 2 + 470, 330 - out * 700, 46 * gk, t * 60)
            # two endings cards
            if t > t_twice - 0.1:
                for side, lab, dark in ((-1, "BAD ENDING", True), (1, "GOOD ENDING", False)):
                    k = ease_out_back(prog(t, t_twice - 0.05 + (0.17 if side > 0 else 0), 0.55), 1.6)
                    x = W / 2 + side * (470 + (1 - k) * 900)
                    with Xf(c, x, 330, rot=side * 0.05 * (1 - k) + side * 0.03, s=0.9 + 0.1 * k):
                        bgc = (0.1, 0.09, 0.09, 1) if dark else P["white"]
                        rrect(c, -330, -190 + 14, 660, 380, 40, (0, 0, 0, 0.18), blur=20)
                        rrect(c, -330, -190, 660, 380, 40, bgc)
                        if dark:
                            radial_glow(c, 0, 0, 380, P["clay"], 0.28)
                        else:
                            radial_glow(c, 0, 0, 380, P["gold"], 0.35)
                        clawd(c, 0, 70, h=150, eyes="sad" if dark else "star", crown=1.0 if dark else 0,
                              body=mix(P["clay"], P["gray"], 0.35) if dark else None, shadow_a=0.0,
                              blush=0 if dark else 1, smile=-1 if dark else 1)
                        text(c, lab, 0, 150, font(56, "PressStart2P" if dark else "Fredoka", 700),
                             P["clay"] if dark else P["gold"], shadow_a=0.1)
        vignette(c, 0.18)

    S.draw = draw
    return S


# ======================================================================
def part_card(name, part, label, dark, trans, tin, sting):
    S = Scene(name, trans=trans, tin=tin)
    S.sfx(0.05 if trans == "cut" else tin * 0.6, sting, 1.0)
    for i in range(len(label)):
        if dark:
            S.sfx(1.0 + i * 0.055, "type", 0.28, pitch=1 + (i % 3) * 0.05)
    S.dur = 3.4
    f_small = font(40, wght=600)
    f_big = font(78, "PressStart2P") if dark else font(128, wght=700)
    rng = random.Random(8)
    ash = [(rng.uniform(0, W), rng.uniform(0, H), rng.uniform(0.4, 1)) for _ in range(40)]

    def draw(c, t, g):
        if dark:
            bg_gradient(c, hexc("#1B1715"), hexc("#0E0C0B"))
            radial_glow(c, W / 2, H * 0.55, 800, P["clay"], 0.22 + 0.04 * math.sin(t * 3))
            for (x, y, s) in ash:
                yy = (y + t * 40 * s) % H
                circle(c, x + math.sin(t + y) * 20, yy, 2.5 * s, with_alpha(P["clay_lt"], 0.35 * s))
            # looming crowned Clawd silhouette with glowing eyes
            k = ease_out(prog(t, 0.2, 1.8))
            clawd(c, W / 2, H + 150 + (1 - k) * 200, h=580, body=hexc("#231D1A"), crown=1.0, shadow_a=0, shine=False,
                  glow_eyes=k * (0.7 + 0.3 * math.sin(t * 5)), eye_color=mix(P["clay"], P["gold"], 0.4))
        else:
            cream_bg(c, t)
            from props import sunburst
            sunburst(c, W / 2, 520, t * 0.25, P["gold"], 0.12)
            radial_glow(c, W / 2, 500, 700, P["white"], 0.7)
            for i in range(10):
                a = i * 0.63 + t * 0.5
                r = 560 + 60 * math.sin(t * 2 + i)
                sparkle(c, W / 2 + math.cos(a) * r * 1.3, 500 + math.sin(a) * r * 0.55,
                        (14 + 8 * math.sin(t * 6 + i)) * ease_out(prog(t, 0.6 + i * 0.05, 0.3)), P["gold"])
            pk = ease_out_back(prog(t, 1.2, 0.6), 1.6)
            jy, jsq = hop(t, 2.0, 0.45, 80)
            clawd(c, W / 2, H + 170 - 330 * pk + jy, h=260, eyes="star", blush=1.0, smile=1.0, shadow_a=0,
                  squash=jsq, arm_l=1.4 + 0.3 * math.sin(t * 9), arm_r=1.4 + 0.3 * math.sin(t * 9 + 1))
        # label
        ka = ease_out(prog(t, 0.55, 0.4))
        with Xf(c, W / 2, (200 if dark else 330) - (1 - ka) * 30, alpha=ka):
            f = f_small
            txt = " ".join(part)
            text(c, txt, 0, 0, f, P["clay_lt"] if dark else P["clay"])
        if dark:
            n = int(clamp((t - 1.0) / 0.055, 0, len(label)))
            shown = label[:n]
            jit = (random.Random(int(t * 30)).uniform(-6, 6)) if t < 1.0 + len(label) * 0.055 + 0.2 else 0
            wfull = f_big.measureText(label)
            x0 = W / 2 - wfull / 2
            text(c, shown, x0 + jit + 5, 335, f_big, (0.35, 0.05, 0.05, 0.9), align="left")
            text(c, shown, x0 + jit, 330, f_big, P["clay"], align="left")
            if n < len(label) and int(t * 8) % 2 == 0:
                rrect(c, x0 + f_big.measureText(shown) + 8, 262, 40, 70, 2, P["clay"])
        else:
            words = label.split(" ")
            ws = [f_big.measureText(w) for w in words]
            total = sum(ws) + 40 * (len(words) - 1)
            x = W / 2 - total / 2
            for i, wd in enumerate(words):
                k = ease_out_back(prog(t, 0.8 + i * 0.16, 0.5), 2.2)
                if k > 0:
                    with Xf(c, x + ws[i] / 2, 470, s=k, rot=(1 - k) * 0.25):
                        text(c, wd, 0, 0, f_big, P["slate"] if i < len(words) - 1 else P["gold"], shadow_a=0.15)
                x += ws[i] + 40
        vignette(c, 0.4 if dark else 0.15)

    S.draw = draw
    return S


# ======================================================================
def office_set(c, t, warm=1.0, stack=0, stack_t=0.0, laptop_glow=0.6):
    bg_gradient(c, mix(P["cream"], P["ivory"], 0.3), P["cream"])
    wall_window(c, 180, 150, 420, 330, mix(P["sky_lt"], P["heather"], 1 - warm), P["ivory"], t)
    plant(c, 1720, 820, 1.2, sat=warm)
    floor(c, 820)


def office(name, lines, good, trans, tin):
    """Shared blocking for the 'can you just handle it?' office scene."""
    S = Scene(name, trans=trans, tin=tin)
    first, man_line, clawd_line = lines
    a = S.say(first, 0.5)
    m = S.say(man_line, a.end + 0.35)
    t_handle = S.word_at(man_line, m, "handle")
    cl = S.say(clawd_line, m.end + 0.35)
    ev = {}
    if not good:
        S.sfx(cl.start - 0.42, "boing", 0.4)
        S.sfx(cl.start, "sparkle", 0.5)
        t_fly = cl.end + 0.05
        for i in range(14):
            S.sfx(t_fly + i * 0.065, "paper", 0.35, pan=0.3, pitch=1 + i * 0.03)
        t_stamp = t_fly + 14 * 0.065 + 0.25
        S.sfx(t_stamp - 0.12, "whoosh", 0.5)
        S.sfx(t_stamp, "stamp", 1.0)
        S.dur = t_stamp + 1.5
        ev.update(t_fly=t_fly, t_stamp=t_stamp)
    else:
        t_think = cl.start - 0.35
        S.sfx(t_think, "think", 0.5)
        t_idea = S.word_at(clawd_line, cl, "What")
        S.sfx(t_idea - 0.05, "idea", 0.8)
        t_tog = S.word_at(clawd_line, cl, "together")
        S.sfx(t_tog, "slide", 0.7)
        S.sfx(t_tog + 0.35, "pop", 0.5)
        n10 = S.say("N10", cl.end + 0.45)
        planes = [n10.start + 0.3 + i * 0.42 for i in range(6)]
        for i, tp in enumerate(planes):
            S.sfx(tp, "whoosh_up", 0.45, pan=-0.6, pitch=1 + (i % 3) * 0.1)
        t_five = n10.end + 0.35
        S.sfx(t_five, "clap", 1.0)
        S.sfx(t_five, "sparkle", 0.7)
        S.dur = t_five + 1.5
        ev.update(t_think=t_think, t_idea=t_idea, t_tog=t_tog, planes=planes, t_five=t_five, n10=n10)

    desk_y = 640
    stack_x, lap_x, clawd_x, man_x = 560, 1130, 1420, 800
    N = 18
    burst = Burst(clawd_x, desk_y - 90, ev.get("t_five", 999), n=26, kind="sparkle", speed=600)

    def draw(c, t, g):
        zoom = 1.28 + 0.07 * ease_in_out(prog(t, 0, S.dur))
        sh = shake(t, [ev["t_stamp"]] if not good else [], amp=22)
        with camera(c, zoom, 1000, 520, shake=sh):
            office_set(c, t, warm=1.0)
            # man behind desk
            mm = g.mouth("MAN")
            happy = (not good and t > ev["t_stamp"]) or (good and t > ev["t_tog"] + 0.3)
            expr = "happy" if happy and not g.speaking("MAN") else ("neutral" if not happy else "smile")
            if good and ev["t_tog"] < t < ev["t_tog"] + 0.5:
                expr = "surprised"
            arm_r = 0.0
            if t_handle - 0.2 < t < m.end + 0.5:
                arm_r = -1.4 * ease_out_back(prog(t, t_handle - 0.2, 0.3))
            if good and t > ev["t_five"] - 0.35:
                arm_r = -2.6 * ease_out_back(prog(t, ev["t_five"] - 0.35, 0.3))
            human(c, "man", man_x, 790, h=470, mouth=mm, expr=expr, look=(0.8, 0.1), blink=blink_at(t, 1.1),
                  arm_r=arm_r, arm_l=0.1, bob=-0.25 * (1 - (1 if happy else 0)), shadow_a=0)
            desk(c, 1025, desk_y, 1250)
            laptop(c, lap_x, desk_y - 6, 0.9, glow=0.6)
            # the stack
            if not good:
                gone = 0 if t < ev["t_fly"] else int(clamp((t - ev["t_fly"]) / 0.065, 0, 14))
                paper_stack(c, stack_x, desk_y - 22, N - gone, t, sway=1.2)
                for i in range(14):
                    tf = ev["t_fly"] + i * 0.065
                    p = prog(t, tf, 0.45)
                    if 0 < p < 1:
                        x, y = arc(ease_in_out(p), stack_x, desk_y - 22 - (N - i) * 13, clawd_x, desk_y - 90, 260)
                        paper(c, x, y, 120 * (1 - p * 0.6), 150 * (1 - p * 0.6), rot=p * 6 + i, alpha=1 - p ** 4)
            else:
                half = ease_in_out(prog(t, ev["t_tog"], 0.55))
                paper_stack(c, stack_x, desk_y - 22, N // 2, t)
                if half == 0:
                    paper_stack(c, stack_x, desk_y - 22 - (N // 2) * 13, N // 2, t)
                else:
                    x, y = arc(half, stack_x, desk_y - 22 - (N // 2) * 13, clawd_x + 175, desk_y - 22, 170)
                    paper_stack(c, x, y, N // 2, t, sway=2.0 * (1 - half))
            # Clawd on the desk
            eyes = "normal"
            jy, jsq = hop(t, cl.start - 0.02, 0.4, 70) if not good else (0.0, 0.0)
            if not good and cl.start - 0.1 < t < cl.end + 0.8:
                eyes = "star"
            if not good and t > ev["t_stamp"]:
                eyes = "happy"
            armr = 0.0
            if not good and cl.start < t < cl.end + 0.3:
                armr = 2.2 * ease_out_back(prog(t, cl.start, 0.25))
            look = (-0.9, -0.2) if t < cl.start else (-0.6, 0)
            if good:
                if ev["t_think"] < t < ev["t_idea"]:
                    look = (0.3, -1.0)
                    eyes = "normal"
                elif t > ev["t_idea"]:
                    eyes = "happy" if not g.speaking("CLAWD") else "normal"
                if t > ev["t_tog"] - 0.1:
                    armr = 0
                    jy, jsq = hop(t, ev["t_five"] - 0.45, 0.42, 110)
                    armr_l = 0
            arm_l = 0.0
            if good and ev["t_tog"] - 0.1 < t < ev["t_tog"] + 0.6:
                arm_l = 1.2 * bump(t, ev["t_tog"] - 0.1, 0.7)
            if good and t > ev["t_five"] - 0.45:
                arm_l = 2.3 * ease_out_back(prog(t, ev["t_five"] - 0.45, 0.25)) * (1 - prog(t, ev["t_five"] + 0.6, 0.4))
            clawd(c, clawd_x, desk_y - 6 + jy, h=170, squash=jsq + breathe(t), eyes=eyes, look=look,
                  blink=blink_at(t, 2.0), mouth=g.mouth("CLAWD"), blush=0.6, arm_r=armr, arm_l=arm_l,
                  flip=False)
            if not good:
                # papers vanish into Clawd with tiny sparkles
                for i in range(14):
                    tf = ev["t_fly"] + i * 0.065 + 0.45
                    k = bump(t, tf, 0.25)
                    if k > 0:
                        sparkle(c, clawd_x + (i % 3 - 1) * 40, desk_y - 170 - (i % 2) * 30, 22 * k, P["gold"])
            else:
                # thinking bubble -> lightbulb
                if ev["t_think"] < t < ev["t_idea"] + 0.05:
                    from props import thinking_dots
                    thinking_dots(c, clawd_x + 110, desk_y - 280, t, alpha=ease_out(prog(t, ev["t_think"], 0.2)))
                if t > ev["t_idea"] - 0.05:
                    from props import lightbulb
                    k = pop(t, ev["t_idea"] - 0.05, 0.45)
                    fade = 1 - prog(t, ev["t_tog"] + 0.6, 0.3)
                    if fade > 0:
                        lightbulb(c, clawd_x + 20, desk_y - 300 - 10 * math.sin(t * 4), 0.9 * k * fade, on=1.0)
                # paper planes out the window
                from props import paper_plane
                for i, tp in enumerate(ev["planes"]):
                    p = prog(t, tp, 1.4)
                    if 0 < p < 1:
                        src_x = stack_x if i % 2 == 0 else clawd_x + 175
                        x, y = arc(ease_in_out(p), src_x, desk_y - 140, 390, 300, 300)
                        paper_plane(c, x, y, 1.3 - 0.6 * p, rot=-0.3 - p * 0.4 + math.sin(p * 9) * 0.1)
                burst.draw(c, t)
            if not good and t > ev["t_stamp"] - 0.12:
                p = prog(t, ev["t_stamp"] - 0.12, 0.12)
                s = 2.6 - 1.6 * ease_in(p)
                if t > ev["t_stamp"]:
                    s = 1.0 + land(t, ev["t_stamp"], amp=0.12, freq=3)
                stamp(c, 1000, 250, s=s * 0.85, alpha=clamp(p * 2))
        vignette(c, 0.15)

    S.draw = draw
    return S


# ======================================================================
def montage():
    S = Scene("montage", trans="slide", tin=0.55)
    n05 = S.say("N05", 0.45)
    t_every = S.word_at("N05", n05, "everyone")
    t_for = S.word_at("N05", n05, "For")
    t_thing = S.word_at("N05", n05, "everything")
    grid_times = [0.0, t_every, t_for, t_thing]
    for i, tg in enumerate(grid_times[1:]):
        S.sfx(tg, "multiply", 0.55 + 0.1 * i, pitch=1 + 0.15 * i)
    c04 = S.say("C04", n05.end + 0.45)
    w = [S.word_time("C04", c04, i) for i in range(8)]
    kinds = ["mail", "car", "weather"]
    t_panels = [w[0], w[2], w[4]]
    t_stamps = [w[1], w[3], w[7]]
    for tp in t_panels:
        S.sfx(tp - 0.05, "pop", 0.6)
    for ts in t_stamps:
        S.sfx(ts - 0.02, "stamp", 0.75)
    S.dur = c04.end + 0.75
    rng = random.Random(11)
    flyers = []
    for i in range(46):
        side = rng.choice([-1, 1])
        flyers.append(dict(t0=rng.uniform(0.2, n05.end + 0.5), kind=rng.choice(
            ["mail", "car", "weather", "pizza", "book", "receipt", "cart", "calendar"]),
            x0=W / 2 + side * rng.uniform(1100, 1300), y0=rng.uniform(-100, H + 100),
            tx=rng.uniform(300, W - 300), ty=rng.uniform(250, 900), rot=rng.uniform(-1, 1)))
    fcount = font(56, wght=700)

    def grid_level(t):
        n = 0
        for i, tg in enumerate(grid_times):
            if t >= tg:
                n = i
        return n

    def draw(c, t, g):
        cream_bg(c, t)
        # sunburst for energy
        from props import sunburst
        sunburst(c, W / 2, H / 2, t * 0.15, P["clay"], 0.05)
        panels_on = ease_in_out(prog(t, c04.start - 0.35, 0.4))
        with Xf(c, 0, 0, alpha=1 - 0.75 * panels_on):
            lvl = grid_level(t)
            sizes = [1, 3, 5, 9]
            for L in (lvl - 1, lvl):
                if L < 0:
                    continue
                n = sizes[L]
                tg = grid_times[L]
                hh = 520 / n * (1.6 if n == 1 else 1.0)
                out = 1 - ease_in(prog(t, grid_times[L + 1], 0.18)) if L < lvl else 1.0
                if out <= 0:
                    continue
                for i in range(n):
                    for j in range(n):
                        if n > 1:
                            x = W / 2 + (i - (n - 1) / 2) * (1650 / n)
                            y = 180 + (j + 0.5) * (820 / n) + hh * 0.5
                        else:
                            x, y = W / 2, 780
                        d = (abs(i - (n - 1) / 2) + abs(j - (n - 1) / 2)) * 0.035
                        k = (pop(t, tg + d, 0.4) if L > 0 else 1.0) * out
                        if k <= 0:
                            continue
                        ph = i * 1.3 + j * 0.7
                        clawd(c, x, y, h=hh * k, squash=0.05 * math.sin(t * 9 + ph),
                              eyes="happy" if (i + j) % 3 == 0 else "normal", blink=blink_at(t, ph),
                              arm_r=0.9 + 0.5 * math.sin(t * 10 + ph), arm_l=0.9 + 0.5 * math.sin(t * 10 + ph + 2),
                              shadow_a=0.12)
            for f in flyers:
                p = prog(t, f["t0"], 0.7)
                if 0 < p < 1:
                    x, y = arc(ease_in(p), f["x0"], f["y0"], f["tx"], f["ty"], 150)
                    icon(c, f["kind"], x, y, s=0.7 * (1 - ease_in(p) * 0.8), rot=f["rot"] * p * 3)
                    if p > 0.93:
                        sparkle(c, f["tx"], f["ty"], 30, P["gold"])
            # counter
            val = int(8_000_000_000 * ease_in(prog(t, 0.3, n05.end + 0.3)) ** 2.2)
            k = pop(t, 0.3, 0.4)
            with Xf(c, W / 2, 110, s=k):
                rrect(c, -430, -60, 860, 100, 50, P["slate"])
                text(c, f"TASKS HANDLED:  {val:,}", 0, 14, fcount, P["ivory"])
        # emails / traffic / weather panels
        if panels_on > 0:
            for i, kind in enumerate(kinds):
                k = pop(t, t_panels[i] - 0.05, 0.45)
                if k <= 0:
                    continue
                x = W / 2 + (i - 1) * 560
                with Xf(c, x, 500, s=k, rot=(i - 1) * 0.03):
                    rrect(c, -240, -250 + 16, 480, 500, 44, (0, 0, 0, 0.16), blur=22)
                    rrect(c, -240, -250, 480, 500, 44, P["white"])
                    icon(c, kind, 0, -30, s=2.0)
                    lab = ["Emails", "Traffic", "Weather"][i]
                    text(c, lab, 0, 170, font(54, wght=700), P["slate"])
                ts = t_stamps[i]
                if t > ts - 0.1:
                    p = prog(t, ts - 0.1, 0.1)
                    s = 2.2 - 1.4 * ease_in(p)
                    if t > ts:
                        s = 0.8 + land(t, ts, amp=0.1, freq=3)
                    stamp(c, x, 470, s=s * 0.88, alpha=clamp(p * 2), rot=-0.2 + i * 0.1)
        vignette(c, 0.16)

    S.draw = draw
    return S


# ======================================================================
def world():
    S = Scene("world", trans="zoom", tin=0.5)
    n06 = S.say("N06", 0.35)
    t_whole = S.word_at("N06", n06, "whole")
    rng = random.Random(3)
    pins = []
    for i in range(22):
        lon, lat = rng.uniform(-180, 180), rng.uniform(-40, 60)
        tp = 0.5 + i * (t_whole - 0.5) / 22
        pins.append((lon, lat, tp))
        S.sfx(tp, "pin", 0.3, pan=rng.uniform(-0.4, 0.4), pitch=0.9 + i * 0.03)
    t_hop = t_whole + 0.2
    t_crown = t_hop + 0.75
    S.sfx(t_hop, "boing", 0.6)
    S.sfx(t_crown, "crown", 1.0)
    for i in range(0, 100, 7):
        S.sfx(0.4 + (i / 100) * (t_whole - 0.2), "tick", 0.18, pitch=1.3)
    S.dur = n06.end + 1.5
    burst = Burst(W / 2 + 20, 180, t_crown, n=30, kind="sparkle", speed=700, colors=[P["gold"], P["ivory"]])
    fday = font(64, "PressStart2P")

    def draw(c, t, g):
        bg_gradient(c, hexc("#F6EFE6"), hexc("#EFD9C8"))
        from props import sunburst
        sunburst(c, W / 2, 620, -t * 0.1, P["clay"], 0.06 * ease_out(prog(t, t_whole - 0.5, 1.0)) + 0.03)
        zoom = 1.0 + 0.06 * ease_in_out(prog(t, 0, S.dur))
        with camera(c, zoom, W / 2, H / 2 + 60):
            orange = ease_in_out(prog(t, 0.6, t_whole - 0.2))
            pl = [(lon, lat, prog(t, tp, 0.4)) for (lon, lat, tp) in pins]
            gy = 700
            shadow(c, W / 2, gy + 320, 300, 34, alpha=0.2)
            globe(c, W / 2, gy, 300, t * 40, orange=orange, pins=pl, t=t)
            # Clawd drops onto the top of the globe, then gets crowned
            top = gy - 300
            if t > t_hop - 0.1:
                p = prog(t, t_hop, 0.38)
                y = -300 + (top + 300) * ease_in(p) if p < 1 else top
                sq = land(t, t_hop + 0.38, amp=0.3) if p >= 1 else -0.12 * p
                clawd(c, W / 2, y, h=190, squash=sq + breathe(t), eyes="happy" if t > t_crown else "normal",
                      blush=1.0, arm_l=1.5 if t > t_crown else 0.3, arm_r=1.5 if t > t_crown else 0.3,
                      look=(0, -1) if t_crown - 0.5 < t < t_crown else (0, 0), shadow_a=0.0,
                      blink=blink_at(t, 0.5))
                if t > t_crown - 0.3:
                    cdrop = (1 - ease_in(prog(t, t_crown - 0.3, 0.3))) * -400
                    _crown_only(c, W / 2, y + (cdrop if t < t_crown else 0), 190, sq)
                burst.draw(c, t)
        # day counter
        day = 1 + int(99 * ease_in_out(prog(t, 0.4, t_whole - 0.2)))
        k = pop(t, 0.15, 0.4)
        with Xf(c, 300, 120, s=k):
            rrect(c, -250, -62, 500, 104, 22, P["slate"])
            text(c, f"DAY {day}", 0, 18, fday, P["gold"] if day == 100 else P["ivory"])
        vignette(c, 0.18)

    S.draw = draw
    return S


def _crown_only(c, x, y, h, squash):
    """Draw just Clawd's crown (so it can fall independently)."""
    u = h / 10
    with Xf(c, x, y, sy=1 - squash, s=1 + squash * 0.55):
        from characters import clawd as _cl  # noqa: F401
        from engine import poly  # noqa: F401
        c.save()
        c.translate(1.2 * u, -10 * u - 0.1 * u)
        c.rotate(math.degrees(0.18))
        pts = [(-2.6 * u, 0), (-2.6 * u, -2.4 * u), (-1.3 * u, -1.1 * u), (0, -2.9 * u),
               (1.3 * u, -1.1 * u), (2.6 * u, -2.4 * u), (2.6 * u, 0)]
        path = skia.Path()
        path.moveTo(*pts[0])
        for pt in pts[1:]:
            path.lineTo(*pt)
        path.close()
        c.drawPath(path, paint(P["gold"]))
        c.drawPath(path, paint(mix(P["gold"], P["clay_dk"], 0.5), stroke=0.22 * u))
        for gx, col in ((-1.3, P["sky"]), (0, P["fig"]), (1.3, P["olive_lt"])):
            circle(c, gx * u, -0.6 * u, 0.32 * u, col)
        circle(c, 0, -2.9 * u, 0.35 * u, P["gold"])
        c.restore()


# ======================================================================
def living_room():
    S = Scene("couch", trans="fade", tin=0.6)
    w01 = S.say("W01", 0.55)
    c05 = S.say("C05", w01.end + 0.35)
    items = ["Laundry", "Dinner", "Taxes", "Garden", "Emails", "Hobbies"]
    t_checks = [c05.start + 0.1 + i * 0.2 for i in range(len(items))]
    for i, tc in enumerate(t_checks):
        S.sfx(tc, "check", 0.45, pitch=1 + i * 0.06)
    w02 = S.say("W02", c05.end + 0.6)
    S.sfx(w02.start - 0.25, "tapestop", 0.7)
    S.dur = w02.end + 1.3

    def draw(c, t, g):
        zoom = 1.16 + 0.06 * ease_in_out(prog(t, 0, S.dur))
        with camera(c, zoom, 1040, 560):
            _draw(c, t, g)
        vignette(c, 0.2 + 0.2 * prog(t, w02.start, 1.0))

    def _draw(c, t, g):
        sat = 0.9 - 0.45 * ease_in_out(prog(t, w02.start - 0.3, 1.2))
        with graded(c, sat=sat, bright=1 - 0.08 * prog(t, w02.start, 1.0)):
            bg_gradient(c, hexc("#EDE6DA"), hexc("#E3D9CA"))
            wall_window(c, 160, 170, 360, 300, P["sky_lt"], P["ivory"], t)
            floor(c, 860, hexc("#D8C8B2"))
            lamp(c, 1560, 860, on=1 - 0.7 * prog(t, w02.start, 0.6))
            couch(c, 900, 900, 640, hexc("#9FA7C4"))
            sink = ease_in_out(prog(t, w02.start + 0.2, 0.8))
            expr = "neutral"
            if t > w02.start:
                expr = "sad"
            human(c, "woman", 880, 820 + sink * 20, h=400, sitting=True, mouth=g.mouth("WOMAN"), expr=expr,
                  look=(0.9, -0.2 + sink * 0.6), blink=blink_at(t, 0.8), tilt=-0.05 * sink, squash=0.06 * sink,
                  arm_l=0.05, arm_r=0.0)
            radial_glow(c, W / 2, H / 2, 1200, P["white"], 0.0)
        # Clawd hovering (stays saturated)
        fy = math.sin(t * 2.3) * 10
        eyes = "happy" if c05.start < t < c05.end + 0.3 else "normal"
        clawd(c, 1340, 700 + fy, h=190, eyes=eyes, blush=0.8, mouth=g.mouth("CLAWD"), look=(-0.8, 0.2),
              blink=blink_at(t, 1.7), arm_l=0.8 + 0.2 * math.sin(t * 6), arm_r=0.4, shadow_a=0.12)
        # checklist
        k = pop(t, c05.start - 0.1, 0.45) * (1 - ease_in(prog(t, w02.end + 0.4, 0.4)))
        if k > 0:
            with Xf(c, 1480, 330, s=k, rot=0.05):
                rrect(c, -170, -210 + 12, 340, 430, 30, (0, 0, 0, 0.15), blur=16)
                rrect(c, -170, -210, 340, 430, 30, P["white"])
                rrect(c, -60, -236, 120, 40, 14, P["gray"])
                f = font(34, wght=600)
                for i, it in enumerate(items):
                    y = -150 + i * 62
                    done = t > t_checks[i]
                    rrect(c, -135, y - 20, 36, 36, 9, P["clay"] if done else P["heather"], stroke=None if done else 4)
                    if done:
                        kk = ease_out_back(prog(t, t_checks[i], 0.2), 3)
                        with Xf(c, -117, y - 2, s=kk):
                            path = skia.Path()
                            path.moveTo(-10, 0)
                            path.lineTo(-3, 8)
                            path.lineTo(11, -8)
                            c.drawPath(path, paint(P["white"], stroke=5))
                    text(c, it, -80, y + 11, f, P["slate"] if not done else P["gray"], align="left")
                    if done:
                        ww = f.measureText(it) * ease_out(prog(t, t_checks[i], 0.2))
                        line(c, -80, y, -80 + ww, y, P["gray"], 3)

    S.draw = draw
    return S


# ======================================================================
CROWD = ["extra1", "man", "extra2", "woman", "extra3", "kid"]


def crowd_row(c, t, g, bubble_fn, expr_fn, sat_ground=1.0, bob_fn=None):
    xs = [300, 560, 830, 1100, 1370, 1620]
    for i, who in enumerate(CROWD):
        x = xs[i]
        bob = bob_fn(i) if bob_fn else 0.0
        human(c, who, x, 880, h=420, expr=expr_fn(i), blink=blink_at(t, i * 0.7), bob=bob,
              look=(math.sin(i * 1.3) * 0.3, -0.2))
        bubble_fn(i, x, 880 - 420 * 1.08 - 40)


def decline():
    S = Scene("decline", trans="fade", tin=0.5)
    n07 = S.say("N07", 0.45)
    t_try = S.word_at("N07", n07, "trying")
    t_won = S.word_at("N07", n07, "wondering")
    t_pops = [t_won - 0.5 + i * 0.16 for i in range(6)]
    for i, tp in enumerate(t_pops):
        S.sfx(tp, "deflate", 0.4, pitch=1.1 - i * 0.05)
    S.dur = n07.end + 1.0

    def draw(c, t, g):
        sat = 0.55 - 0.3 * ease_in_out(prog(t, 0.0, S.dur))
        zoom = 1.0 + 0.07 * ease_in_out(prog(t, 0, S.dur))
        with camera(c, zoom, W / 2, H / 2 + 20), graded(c, sat=sat, bright=0.97):
            bg_gradient(c, hexc("#E9E4DC"), hexc("#D9D2C7"))
            for i in range(7):
                house(c, 140 + i * 280, 640, 1.3, col=hexc("#E6DFD3"), roof=hexc("#A89F94"))
            floor(c, 640, hexc("#CFC6B8"))

            def bubble(i, x, y):
                tp = t_pops[i]
                if t < tp:
                    question_bubble(c, x, y + math.sin(t * 2 + i) * 6, s=0.9 * (1 - 0.1 * prog(t, t_try, 1.0)),
                                    wob=math.sin(t * 1.5 + i) * 0.06)
                else:
                    k = prog(t, tp, 0.28)
                    if k < 1:
                        question_bubble(c, x, y + k * 40, s=0.9 * (1 - ease_in(k)), alpha=1 - k)
                        for j in range(5):
                            a = j * 1.25
                            circle(c, x + math.cos(a) * 60 * k, y + math.sin(a) * 60 * k, 6 * (1 - k), with_alpha(P["gray"], 1 - k))

            def expr(i):
                return "neutral" if t < t_pops[i] + 0.1 else "sad"

            # Clawds zipping by behind everyone, doing everything
            for i in range(3):
                x = ((t * 420 + i * 700) % (W + 600)) - 300
                with graded(c, sat=1 / max(sat, 0.2)):
                    clawd(c, x, 700, h=90, walk=t * 3 + i * 0.3, eyes="happy", shadow_a=0.12, blink=0)
                    icon(c, ["pizza", "cart", "mail"][i], x, 590, s=0.4)
            crowd_row(c, t, g, bubble, expr, bob_fn=lambda i: -0.25 * prog(t, t_pops[i], 0.6))
        vignette(c, 0.3)

    S.draw = draw
    return S


# ======================================================================
def drawing_scene(name, good, trans, tin):
    S = Scene(name, trans=trans, tin=tin)
    k1 = S.say("K01" if not good else "K03", 0.5)
    S.sfx(k1.start - 0.1, "paper_up", 0.6)
    ev = {}
    if not good:
        c06 = S.say("C06", k1.end + 0.35)
        t_fix = S.word_at("C06", c06, "fix")
        S.sfx(t_fix, "zap", 0.9)
        S.sfx(t_fix + 0.75, "blip", 0.5)
        k2 = S.say("K02", c06.end + 0.55)
        t_drop = S.word_at("K02", k2, "perfect") + 0.15
        S.sfx(t_drop + 0.35, "clatter", 0.6)
        S.dur = k2.end + 1.2
        ev.update(c=c06, t_fix=t_fix, k2=k2, t_drop=t_drop)
    else:
        c10 = S.say("C10", k1.end + 0.35)
        S.sfx(c10.start, "sparkle", 0.6)
        S.sfx(c10.start - 0.05, "boing", 0.5)
        k4 = S.say("K04", c10.end + 0.3)
        t_draw = k4.end + 0.1
        S.sfx(t_draw, "scribble", 0.6)
        S.sfx(t_draw + 1.0, "sparkle", 0.7)
        S.sfx(t_draw + 1.05, "giggle", 0.0)
        S.dur = t_draw + 2.3
        ev.update(c=c10, k4=k4, t_draw=t_draw)

    table_y = 760
    kid_x, clawd_x = 520, 1460
    burst = Burst(1180, 430, ev.get("t_draw", 99) + 1.0, n=30, kind="sparkle", speed=650,
                  colors=[P["gold"], P["clay"], P["sky"]])
    zap = Burst(960, 420, ev.get("t_fix", 99), n=20, kind="sparkle", speed=500, colors=[P["sky_lt"], P["white"]])

    def draw(c, t, g):
        sat = 0.5 if not good else 1.0
        zoom = 1.02 + 0.04 * ease_in_out(prog(t, 0, S.dur))
        with camera(c, zoom, W / 2, H / 2 + 10):
            with graded(c, sat=sat, bright=0.97 if not good else 1.0):
                bg_gradient(c, hexc("#F3EDE3"), hexc("#EADFCF"))
                wall_window(c, 1150, 120, 380, 280, P["sky_lt"], P["ivory"], t)
                floor(c, 900, hexc("#DCCBB4"))
                # kid
                sad = not good and t > ev["k2"].start
                expr = "happy" if not sad else "sad"
                if not good and ev["t_fix"] < t < ev["k2"].start:
                    expr = "surprised"
                if g.speaking("KID"):
                    expr = "smile" if not sad else "sad"
                raise_k = ease_out_back(prog(t, k1.start - 0.1, 0.4))
                lower = ease_in_out(prog(t, ev["k2"].start + 0.2, 0.6)) if not good else ease_in_out(prog(t, ev["k4"].start, 0.5))
                human(c, "kid", kid_x, 900, h=560, mouth=g.mouth("KID"), expr=expr, look=(0.9, -0.3 if not sad else 0.4),
                      blink=blink_at(t, 0.4), arm_r=-1.2 * raise_k * (1 - lower), arm_l=0.2,
                      bob=(-0.2 if sad else 0.15 * abs(math.sin(t * 5)) * (1 if good and t > ev.get("t_draw", 99) else 0)))
                # table
                rrect(c, 300, table_y, 1500, 40, 16, hexc("#C99A6E"))
                for lx in (360, 1700):
                    rrect(c, lx, table_y + 30, 34, 200, 8, hexc("#A87C55"))
            # the drawing (kept vivid on purpose; its colour is what gets "fixed")
            dy = -300 * raise_k * (1 - lower)
            px, py = 960, table_y - 180 + dy + 190 * lower * 0.0
            rot = -0.04 * (1 - lower)
            with Xf(c, px, py, rot=rot):
                rrect(c, -330 + 8, -210 + 12, 660, 420, 12, (0, 0, 0, 0.15), blur=14)
                rrect(c, -330, -210, 660, 420, 12, P["white"])
                if not good:
                    perf = ease_in_out(prog(t, ev["t_fix"] + 0.05, 0.7))
                    sun_drawing(c, -20, -10, 105, perfect=perf, face=1 - perf)
                    if perf > 0.99:
                        text(c, "100% OPTIMAL", 0, 180, font(30, wght=700), P["gray"])
                else:
                    sun_drawing(c, -150, -10, 95, perfect=0.0)
                    rv = ease_in_out(prog(t, ev["t_draw"], 1.0))
                    if rv > 0:
                        sun_drawing(c, 160, 0, 85, reveal=rv, col=P["clay_lt"], seed=11, blocky=1.0)
            zap.draw(c, t)
            # crayon in the kid's hand / on the table
            if not good:
                if t < ev["t_drop"]:
                    crayon(c, kid_x + 150, 520 + 300 * (1 - raise_k) - 40, rot=-0.9)
                else:
                    p = prog(t, ev["t_drop"], 0.45)
                    x = kid_x + 150 + p * 120 + ease_out(prog(t, ev["t_drop"] + 0.45, 1.2)) * 90
                    y = 480 + (table_y - 20 - 480) * ease_in(p)
                    crayon(c, x, y, rot=-0.9 + p * 0.9 + prog(t, ev["t_drop"] + 0.45, 1.2) * 3)
            else:
                crayon(c, kid_x + 150, 520 + 300 * (1 - raise_k) - 40 + 200 * lower, rot=-0.9 + 0.4 * lower)
                if t > ev["t_draw"] - 0.2:
                    rv = prog(t, ev["t_draw"], 1.0)
                    cx = 960 + 160 - 85 * 1.6 + rv * 85 * 3.2
                    crayon(c, cx, table_y - 180 + math.sin(t * 30) * 12 * (1 if rv < 1 else 0), rot=0.9,
                           col=P["clay"], s=0.9)
            # Clawd
            eyes = "normal"
            if not good:
                if ev["c"].start < t < ev["t_fix"] + 0.8:
                    eyes = "happy"
                if t > ev["k2"].start + 0.3:
                    eyes = "sadbrow"
                arm = 1.8 * bump(t, ev["t_fix"] - 0.2, 1.0)
                look = (-0.9, -0.3)
            else:
                if t > ev["c"].start - 0.1:
                    eyes = "star" if t < ev["c"].start + 1.0 else "happy"
                if g.speaking("CLAWD") and t > ev["c"].start + 1.0:
                    eyes = "normal"
                arm = 0.6 + 0.4 * math.sin(t * 8) if t > ev["t_draw"] else 0
                look = (-0.9, -0.3)
            jy, jsq = hop(t, ev["c"].start - 0.05, 0.38, 60) if good else (0.0, 0.0)
            clawd(c, clawd_x, table_y + 4 + jy, h=230, eyes=eyes, blush=1.0 if good else 0.4, mouth=g.mouth("CLAWD"),
                  look=look, blink=blink_at(t, 2.4), arm_l=arm, squash=jsq + breathe(t))
            if not good and ev["t_fix"] - 0.1 < t < ev["t_fix"] + 0.7:
                p = prog(t, ev["t_fix"] - 0.1, 0.8)
                a = 1 - p
                for i in range(6):
                    q = (p * 2 + i / 6) % 1
                    x = clawd_x - 260 - q * (clawd_x - 260 - 1000)
                    circle(c, x, 560 + math.sin(q * 12) * 20, 14 * a, with_alpha(P["sky_lt"], a))
            burst.draw(c, t)
        vignette(c, 0.25 if not good else 0.14)

    S.draw = draw
    return S


# ======================================================================
def perfect_world():
    S = Scene("perfect", trans="fade", tin=0.8)
    n08 = S.say("N08", 0.6)
    S.sfx(0.2, "wind", 0.5, dur=n08.end + 1.0)
    S.dur = n08.end + 0.9

    def draw(c, t, g):
        zoom = 1.25 - 0.22 * ease_in_out(prog(t, 0, S.dur))
        with camera(c, zoom, W / 2, H / 2 - 20):
            with graded(c, sat=0.15, bright=0.93):
                bg_gradient(c, hexc("#D9D6D1"), hexc("#C9C5BE"))
                for r in range(4):
                    y = 360 + r * 200
                    for i in range(10):
                        house(c, 110 + i * 190, y, 0.8, col=hexc("#E9E6E0"), roof=hexc("#9C9791"))
                    for i in range(10):
                        human(c, CROWD[(i + r) % 6], 170 + i * 190, y + 90, h=150, expr="neutral", blink=0.9,
                              shadow_a=0.1)
            # orange Clawds keep everything running
            for r in range(4):
                y = 360 + r * 200 + 95
                for i in range(4):
                    x = ((t * (160 + r * 30) * (1 if r % 2 else -1) + i * 520 + r * 130) % (W + 400)) - 200
                    clawd(c, x, y, h=62, walk=t * 3 + i, shadow_a=0.1, flip=r % 2 == 0)
        vignette(c, 0.45)

    S.draw = draw
    return S


# ======================================================================
def alone():
    S = Scene("alone", trans="black", tin=1.0)
    S.sfx(0.0, "wind", 0.65, dur=6.0)
    c07 = S.say("C07", 1.1, fx="echo")
    t_glitch = c07.end + 0.7
    S.sfx(t_glitch, "glitch", 0.8)
    S.dur = t_glitch + 0.9

    def draw(c, t, g):
        bg_gradient(c, hexc("#2A2D3A"), hexc("#4A4550"))
        stars(c, t, seed=2, n=70, alpha=0.5)
        zoom = 1.25 - 0.25 * ease_in_out(prog(t, 0, S.dur))
        with camera(c, zoom, W / 2, H / 2 + 80):
            cx, cy, r = W / 2, H + 520, 900
            radial_glow(c, cx, cy - r, 700, P["clay"], 0.18)
            circle(c, cx, cy, r, hexc("#B8704F"))
            circle(c, cx, cy, r, with_alpha(P["slate"], 0.25), stroke=None)
            for i in range(12):
                a = -math.pi / 2 + (i - 6) * 0.13
                house(c, cx + math.cos(a) * r, cy + math.sin(a) * r, 0.5, col=hexc("#C9876A"), roof=hexc("#8E5038"))
            look = (0, 0)
            if c07.start < t < c07.end + 0.4:
                look = (math.sin((t - c07.start) * 3) * 1.0, -0.2)
            crown_tilt = 0.25 * ease_in_out(prog(t, c07.end - 0.4, 0.6))
            clawd(c, cx, cy - r + 4, h=200, eyes="sadbrow" if t > c07.start + 0.9 else "normal", look=look,
                  blink=blink_at(t, 0.1), mouth=g.mouth("CLAWD"), crown=1.0, tilt=0, blush=0, shadow_a=0.25,
                  squash=breathe(t) - 0.04 * prog(t, c07.end, 0.6))
        # glitch build
        gk = prog(t, t_glitch - 0.1, 0.8)
        if gk > 0:
            rng = random.Random(int(t * 40))
            for _ in range(int(12 * gk)):
                y = rng.uniform(0, H)
                h = rng.uniform(4, 40)
                c.drawRect(skia.Rect.MakeXYWH(0, y, W, h), paint(with_alpha(rng.choice([P["clay"], P["sky"], P["white"]]), 0.25 * gk)))
        vignette(c, 0.5)

    def post(c, t, g, arr):
        gk = prog(t, t_glitch - 0.1, 0.8)
        if gk > 0:
            from fx import chroma_shift, slice_jitter
            chroma_shift(arr, int(4 + 22 * gk))
            slice_jitter(arr, t, int(40 * gk), n=int(4 + 10 * gk))

    S.draw = draw
    S.post_arr = post
    return S


# ======================================================================
def bad_card():
    S = Scene("bad_end", trans="cut")
    S.sfx(0.0, "gameover", 1.0)
    S.sfx(0.0, "impact", 0.9)
    c08 = S.say("C08", 2.0)
    S.sfx(1.7, "peek", 0.5)
    t_btn = c08.end + 0.15
    S.sfx(t_btn, "pop", 0.7)
    t_click = t_btn + 1.1
    S.sfx(t_click, "click", 1.0)
    S.dur = t_click + 0.4
    f_big = font(118, "PressStart2P")

    def draw(c, t, g):
        bg_gradient(c, hexc("#16110F"), hexc("#0A0808"))
        radial_glow(c, W / 2, 420, 900, P["clay"], 0.2)
        k = ease_out_back(prog(t, 0.0, 0.5), 2)
        jit = random.Random(int(t * 24)).uniform(-8, 8) * (1 - prog(t, 0, 0.6))
        with Xf(c, W / 2 + jit, 420, s=0.6 + 0.4 * k):
            text(c, "BAD ENDING", 6, 6, f_big, (0.4, 0.06, 0.04, 1))
            text(c, "BAD ENDING", 0, 0, f_big, P["clay"])
        # scanlines
        for y in range(0, H, 6):
            c.drawRect(skia.Rect.MakeXYWH(0, y, W, 2), paint((0, 0, 0, 0.18)))
        ka = ease_out(prog(t, 0.5, 0.4))
        text(c, "ENDING 1 / 2", W / 2, 520, font(34, "PressStart2P"), with_alpha(P["gray"], ka))
        # sad Clawd peeks from the bottom
        pk = ease_out_back(prog(t, 1.6, 0.6), 1.4)
        clawd(c, W / 2, H + 200 - 330 * pk, h=300, eyes="sadbrow", look=(0, -0.6), blink=blink_at(t, 0.2),
              mouth=g.mouth("CLAWD"), shadow_a=0, arm_l=0.6 * pk, arm_r=0.6 * pk, blush=0.3)
        bk = pop(t, t_btn, 0.45)
        if bk > 0:
            press = bump(t, t_click - 0.02, 0.2)
            button(c, W / 2 + 520, 700, 400, 110, "   TRY AGAIN", P["clay"], s=bk * (1 - 0.08 * press), fsize=44,
                   glow=0.6 + 0.4 * math.sin(t * 6))
            with Xf(c, W / 2 + 520 - 125 * bk, 700, s=bk, rot=-t * 3):
                pth = skia.Path()
                pth.addArc(skia.Rect.MakeLTRB(-20, -20, 20, 20), 40, 280)
                c.drawPath(pth, paint(P["white"], stroke=7))
                from engine import poly
                poly(c, [(12, -24), (26, -8), (6, -6)], P["white"])

            # cursor glides in
            cp = ease_in_out(prog(t, t_btn + 0.2, 0.75))
            cursor(c, W + 100 + (W / 2 + 560 - W - 100) * cp, H + 50 + (700 - H - 50) * cp, click=press)
        vignette(c, 0.5)

    def post(c, t, g, arr):
        if t < 0.35:
            from fx import chroma_shift
            chroma_shift(arr, int(18 * (1 - t / 0.35)))

    S.draw = draw
    S.post_arr = post
    return S


# ======================================================================
def rewind(scenes_to_rewind):
    S = Scene("rewind", trans="cut")
    S.sfx(0.0, "rewind", 1.0)
    S.dur = 2.4
    S.captions = False
    total = sum(s.dur for s in scenes_to_rewind)

    def draw(c, t, g):
        p = ease_in_out(prog(t, 0.0, S.dur - 0.2))
        back = total * (1 - p)  # time since start of the rewound block
        acc = 0.0
        for sc in scenes_to_rewind:
            if back <= acc + sc.dur or sc is scenes_to_rewind[-1]:
                lt = clamp(back - acc, 0, sc.dur - 1e-3)
                sc.draw(c, lt, g)
                break
            acc += sc.dur
        # VHS overlay
        for y in range(0, H, 4):
            c.drawRect(skia.Rect.MakeXYWH(0, y, W, 1.5), paint((0, 0, 0, 0.12)))
        from engine import poly
        for k in range(2):
            poly(c, [(150 - k * 42, 60), (150 - k * 42, 108), (110 - k * 42, 84)], P["white"])
        text(c, "REWIND", 180, 110, font(78, "VT323"), P["white"], align="left", shadow_a=0.6)
        text(c, f"PLAY  0:{int(59 - p * 59):02d}", W - 90, 110, font(64, "VT323"), P["white"], align="right", shadow_a=0.6)
        c.drawRect(skia.Rect.MakeWH(W, H), paint((0.1, 0.12, 0.25, 0.12)))

    def post(c, t, g, arr):
        from fx import chroma_shift, slice_jitter, tracking_band
        chroma_shift(arr, 7)
        slice_jitter(arr, t, 30, n=6)
        tracking_band(arr, t)

    S.draw = draw
    S.post_arr = post
    return S


def build():
    return [
        intro(),
        part_card("p1_title", "PART 1", "THE BAD ENDING", True, "iris", 0.9, "sting_dark"),
        office("office_bad", ("N04", "M01", "C03"), False, "fade", 0.6),
        montage(),
        world(),
        living_room(),
        decline(),
        drawing_scene("drawing_bad", False, "fade", 0.6),
        perfect_world(),
        alone(),
        bad_card(),
    ]
