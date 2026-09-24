"""Clawd (the Claude Code mascot) and the little human cast."""
import math

import skia

from engine import (P, Xf, circle, clamp, hexc, line, mix, oval, paint, rrect, shadow,
                    star_path, with_alpha)


# ======================================================================
# Clawd: the blocky terracotta critter from Claude Code's welcome screen.
# Built on the same grid as the terminal glyph: 12x8 body, 1x2 eyes,
# 2x2 arm stubs, four 1x2 legs. `h` is the full height in pixels.
# ======================================================================
def clawd(c, x, y, h=300, squash=0.0, tilt=0.0, look=(0.0, 0.0), blink=0.0,
          eyes="normal", mouth=0.0, smile=0.0, blush=0.0, arm_l=0.0, arm_r=0.0,
          walk=None, crown=0.0, body=None, alpha=1.0, flip=False, shadow_a=0.2,
          sweat=0.0, glow_eyes=0.0, eye_color=None, shine=True):
    u = h / 10.0
    body = body or P["clay"]
    hi = mix(body, P["white"], 0.22)
    lo = mix(body, (0.3, 0.12, 0.05, 1), 0.28)
    ink = eye_color or P["slate"]

    if shadow_a > 0:
        shadow(c, x, y, 7.2 * u * (1 + squash * 0.6), 1.25 * u, alpha=shadow_a * alpha)

    sx = 1 + squash * 0.55
    sy = 1 - squash
    with Xf(c, x, y, alpha=alpha):
        c.rotate(math.degrees(tilt))
        c.scale(sx * (-1 if flip else 1), sy)

        # ---- legs (walk: two diagonal pairs lift alternately)
        lifts = [0, 0, 0, 0]
        if walk is not None:
            a = max(0.0, math.sin(walk * 2 * math.pi))
            b = max(0.0, -math.sin(walk * 2 * math.pi))
            lifts = [a, b, a, b]
        for i, lx in enumerate((-5, -3, 2, 4)):
            ly = -2 * u - lifts[i] * 0.7 * u
            rrect(c, lx * u, ly, u, 2 * u + 0.2 * u - lifts[i] * 0.3 * u, u * 0.28, lo)

        # ---- arms (rotate about the shoulder)
        for side, ang in ((-1, arm_l), (1, arm_r)):
            with Xf(c, side * 6 * u, -5 * u, rot=-side * ang):
                ax = -2 * u if side < 0 else 0
                rrect(c, ax - (0.2 * u if side > 0 else -0.2 * u), -u, 2.2 * u, 2 * u, u * 0.4, body)
                rrect(c, ax - (0.2 * u if side > 0 else -0.2 * u), -u + 1.4 * u, 2.2 * u, 0.6 * u, u * 0.3,
                      with_alpha(lo, 0.55))

        # ---- body
        bx, by, bw, bh = -6 * u, -10 * u, 12 * u, 8 * u
        rrect(c, bx, by, bw, bh, u * 0.7, body)
        # bottom shade + top highlight: soft, "clay toy" feel
        c.save()
        c.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(bx, by, bw, bh), u * 0.7, u * 0.7), doAntiAlias=True)
        rrect(c, bx - u, by + bh - 1.3 * u, bw + 2 * u, 3 * u, u, with_alpha(lo, 0.55), blur=u * 0.5)
        rrect(c, bx + 0.9 * u, by + 0.55 * u, bw - 1.8 * u, 0.9 * u, u * 0.45, with_alpha(hi, 0.65), blur=u * 0.25)
        c.restore()
        # little pixel shine
        if shine:
            rrect(c, bx + 0.7 * u, by + 0.7 * u, 0.9 * u, 0.9 * u, u * 0.2, with_alpha(P["white"], 0.55))

        # ---- face
        lx, ly = look
        ex, ey = lx * 0.45 * u, ly * 0.35 * u
        eye_cy = -7 * u + ey
        for side in (-1, 1):
            cx = side * 3.5 * u + ex
            if glow_eyes > 0:
                oval(c, cx, eye_cy, 1.4 * u, 1.9 * u, with_alpha(P["gold"], 0.55 * glow_eyes), blur=u * 0.8)
            if eyes == "happy":
                path = skia.Path()
                path.moveTo(cx - 0.75 * u, eye_cy + 0.35 * u)
                path.quadTo(cx, eye_cy - 1.05 * u, cx + 0.75 * u, eye_cy + 0.35 * u)
                c.drawPath(path, paint(ink, stroke=0.45 * u))
            elif eyes == "sad":
                path = skia.Path()
                path.moveTo(cx - 0.7 * u, eye_cy - 0.1 * u)
                path.quadTo(cx, eye_cy + 0.75 * u, cx + 0.7 * u, eye_cy - 0.1 * u)
                c.drawPath(path, paint(ink, stroke=0.42 * u))
            elif eyes == "star":
                c.drawPath(star_path(cx, eye_cy, 1.0 * u, 0.45 * u), paint(P["gold"]))
            else:
                eh = 2 * u * (1 - 0.9 * clamp(blink))
                ew = u
                if eyes == "wide":
                    eh *= 1.25
                    ew *= 1.2
                rrect(c, cx - ew / 2, eye_cy - eh / 2, ew, eh, min(ew, eh) * 0.35, ink)
                if blink < 0.5:
                    circle(c, cx - ew * 0.12, eye_cy - eh * 0.22, ew * 0.2, with_alpha(P["white"], 0.9))
                if eyes == "sadbrow":
                    # worried brows: inner ends raised
                    line(c, cx - 0.6 * u, eye_cy - 1.45 * u - side * 0.3 * u,
                         cx + 0.6 * u, eye_cy - 1.45 * u + side * 0.3 * u, ink, 0.3 * u)

        if blush > 0:
            for side in (-1, 1):
                oval(c, side * 3.5 * u + ex * 0.6, -5.4 * u, 0.9 * u, 0.45 * u,
                     with_alpha(P["blush"], 0.8 * blush), blur=u * 0.18)

        # mouth: tiny, only appears when talking or smiling
        mo = clamp(mouth)
        my = -5.6 * u + ey * 0.7
        if mo > 0.04:
            mw, mh = 1.25 * u, 0.25 * u + mo * 1.05 * u
            rrect(c, ex * 0.6 - mw / 2, my - mh * 0.3, mw, mh, min(mw, mh) * 0.5, ink)
            rrect(c, ex * 0.6 - mw * 0.3, my + mh * 0.3, mw * 0.6, mh * 0.45, mh * 0.2, with_alpha(P["fig"], 0.9))
        elif smile > 0.02:
            path = skia.Path()
            path.moveTo(ex * 0.6 - 0.7 * u, my)
            path.quadTo(ex * 0.6, my + 0.75 * u * smile, ex * 0.6 + 0.7 * u, my)
            c.drawPath(path, paint(ink, stroke=0.3 * u))
        elif smile < -0.02:
            path = skia.Path()
            path.moveTo(ex * 0.6 - 0.6 * u, my + 0.3 * u)
            path.quadTo(ex * 0.6, my + 0.3 * u + 0.6 * u * smile, ex * 0.6 + 0.6 * u, my + 0.3 * u)
            c.drawPath(path, paint(ink, stroke=0.28 * u))

        if sweat > 0:
            sxp, syp = 5.2 * u, -9.2 * u + (1 - sweat) * 0.6 * u
            path = skia.Path()
            path.moveTo(sxp, syp - 0.9 * u)
            path.quadTo(sxp + 0.7 * u, syp + 0.1 * u, sxp, syp + 0.35 * u)
            path.quadTo(sxp - 0.7 * u, syp + 0.1 * u, sxp, syp - 0.9 * u)
            c.drawPath(path, paint(with_alpha(P["sky_lt"], sweat)))

        # crown
        if crown > 0:
            k = crown
            with Xf(c, 1.2 * u, -10 * u - 0.1 * u, s=k, rot=0.18):
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


def blink_at(t, seed=0.0, period=3.1):
    """Natural-looking blink curve: quick close/open every few seconds."""
    ph = (t + seed * 1.37) % period
    if ph < 0.14:
        return math.sin(ph / 0.14 * math.pi)
    return 0.0


# ======================================================================
# Humans: soft round "bean" folks.
# ======================================================================
CAST = {
    "kid": dict(skin=hexc("#E0A67E"), shirt=P["gold"], hair=hexc("#6B3E26"), size=0.72, style="pigtails"),
    "man": dict(skin=hexc("#9A6446"), shirt=P["sky"], hair=hexc("#2B2320"), size=1.0, style="short", glasses=True),
    "woman": dict(skin=hexc("#F2C9A8"), shirt=P["olive"], hair=hexc("#8C4B2F"), size=0.95, style="bun"),
    "extra1": dict(skin=hexc("#C88A64"), shirt=P["fig"], hair=hexc("#3A2A22"), size=0.9, style="short"),
    "extra2": dict(skin=hexc("#F0CDB0"), shirt=P["heather"], hair=hexc("#D9A441"), size=0.92, style="bun"),
    "extra3": dict(skin=hexc("#7A4B33"), shirt=P["clay_lt"], hair=hexc("#1E1A18"), size=0.97, style="afro"),
}


def human(c, who, x, y, h=360, look=(0.0, 0.0), blink=0.0, mouth=0.0, expr="smile",
          arm_l=0.0, arm_r=0.0, bob=0.0, tilt=0.0, alpha=1.0, flip=False, squash=0.0,
          sitting=False, shadow_a=0.2, blush=0.4):
    d = CAST[who]
    h = h * d["size"]
    u = h / 10.0
    skin, shirt, hair = d["skin"], d["shirt"], d["hair"]
    shirt_dk = mix(shirt, (0.1, 0.08, 0.1, 1), 0.2)
    ink = P["slate"]
    if shadow_a > 0 and not sitting:
        shadow(c, x, y, 3.3 * u, 0.7 * u, alpha=shadow_a * alpha)
    with Xf(c, x, y - bob * u, alpha=alpha):
        c.rotate(math.degrees(tilt))
        c.scale((1 + squash * 0.5) * (-1 if flip else 1), 1 - squash)
        # legs
        if not sitting:
            for lx in (-1.3, 0.35):
                rrect(c, lx * u, -1.6 * u, 0.95 * u, 1.7 * u, 0.45 * u, mix(ink, shirt, 0.25))
        # arms behind body
        for side, ang in ((-1, arm_l), (1, arm_r)):
            with Xf(c, side * 2.0 * u, -5.0 * u, rot=side * (0.25 + ang)):
                rrect(c, -0.5 * u, 0, u, 2.8 * u, 0.5 * u, shirt_dk)
                circle(c, 0, 2.8 * u, 0.55 * u, skin)
        # torso: soft trapezoid
        path = skia.Path()
        path.moveTo(-2.1 * u, -5.6 * u)
        path.cubicTo(-2.8 * u, -3.5 * u, -2.9 * u, -1.8 * u, -2.6 * u, -1.2 * u)
        path.lineTo(2.6 * u, -1.2 * u)
        path.cubicTo(2.9 * u, -1.8 * u, 2.8 * u, -3.5 * u, 2.1 * u, -5.6 * u)
        path.cubicTo(1.2 * u, -6.3 * u, -1.2 * u, -6.3 * u, -2.1 * u, -5.6 * u)
        path.close()
        c.drawPath(path, paint(shirt))
        # head
        hx, hy, hr = 0, -8.0 * u, 2.45 * u
        style = d["style"]
        if style == "pigtails":
            for s in (-1, 1):
                circle(c, s * 2.5 * u, hy - 0.6 * u, 1.0 * u, hair)
        if style == "bun":
            circle(c, 0, hy - 2.5 * u, 1.1 * u, hair)
        if style == "afro":
            circle(c, 0, hy - 0.5 * u, 3.1 * u, hair)
        circle(c, hx, hy, hr, skin)
        # hair cap
        c.save()
        c.clipPath(_circle_path(hx, hy, hr), doAntiAlias=True)
        cap = skia.Path()
        cap.moveTo(-3 * u, hy - 0.5 * u)
        cap.cubicTo(-1.5 * u, hy - 1.4 * u, 0.5 * u, hy - 0.4 * u, 3 * u, hy - 1.2 * u)
        cap.lineTo(3 * u, hy - 4 * u)
        cap.lineTo(-3 * u, hy - 4 * u)
        cap.close()
        c.drawPath(cap, paint(hair))
        c.restore()
        # face
        lx, ly = look
        fx, fy = lx * 0.5 * u, ly * 0.35 * u
        ey = hy + 0.25 * u + fy
        for s in (-1, 1):
            exx = fx + s * 0.95 * u
            if expr == "happy":
                pth = skia.Path()
                pth.moveTo(exx - 0.4 * u, ey + 0.15 * u)
                pth.quadTo(exx, ey - 0.5 * u, exx + 0.4 * u, ey + 0.15 * u)
                c.drawPath(pth, paint(ink, stroke=0.26 * u))
            else:
                eh = 0.95 * u * (1 - 0.9 * clamp(blink))
                if expr == "surprised":
                    eh *= 1.2
                oval(c, exx, ey, 0.34 * u, eh / 2, ink)
                if blink < 0.5:
                    circle(c, exx - 0.1 * u, ey - eh * 0.2, 0.11 * u, P["white"])
                if expr == "sad":
                    line(c, exx - 0.45 * u, ey - 0.85 * u - s * 0.12 * u, exx + 0.45 * u,
                         ey - 0.85 * u + s * 0.12 * u, ink, 0.18 * u)
        if d.get("glasses"):
            for s in (-1, 1):
                circle(c, fx + s * 0.95 * u, ey, 0.72 * u, ink, stroke=0.16 * u)
            line(c, fx - 0.25 * u, ey, fx + 0.25 * u, ey, ink, 0.14 * u)
        if blush > 0:
            for s in (-1, 1):
                oval(c, fx + s * 1.55 * u, ey + 0.75 * u, 0.45 * u, 0.25 * u, with_alpha(P["blush"], blush), blur=u * 0.1)
        my = ey + 1.15 * u
        if mouth > 0.05:
            oval(c, fx, my + 0.1 * u, 0.42 * u, 0.12 * u + mouth * 0.42 * u, ink)
        elif expr in ("smile", "happy"):
            pth = skia.Path()
            pth.moveTo(fx - 0.5 * u, my - 0.05 * u)
            pth.quadTo(fx, my + 0.55 * u, fx + 0.5 * u, my - 0.05 * u)
            c.drawPath(pth, paint(ink, stroke=0.2 * u))
        elif expr == "sad":
            pth = skia.Path()
            pth.moveTo(fx - 0.45 * u, my + 0.3 * u)
            pth.quadTo(fx, my - 0.15 * u, fx + 0.45 * u, my + 0.3 * u)
            c.drawPath(pth, paint(ink, stroke=0.2 * u))
        elif expr == "surprised":
            oval(c, fx, my + 0.1 * u, 0.28 * u, 0.35 * u, ink)
        else:
            line(c, fx - 0.35 * u, my + 0.1 * u, fx + 0.35 * u, my + 0.1 * u, ink, 0.2 * u)


def _circle_path(x, y, r):
    p = skia.Path()
    p.addCircle(x, y, r)
    return p
