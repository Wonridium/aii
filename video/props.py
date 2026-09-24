"""Set pieces and props, all flat/soft to match the characters."""
import math
import random

import skia

from engine import (H, P, W, Xf, circle, clamp, ease_out, ease_out_back, font, hexc, line,
                    mix, oval, paint, poly, prog, radial_glow, rrect, shadow, sparkle,
                    star_path, text, with_alpha)


# ------------------------------------------------------------------ room bits
def floor(c, y, col=None, top=None):
    col = col or P["oat"]
    c.drawRect(skia.Rect.MakeLTRB(-200, y, W + 200, H + 200), paint(col))
    c.drawRect(skia.Rect.MakeLTRB(-200, y, W + 200, y + 6), paint(mix(col, P["slate"], 0.08)))


def wall_window(c, x, y, w, h, sky_top, sky_bot, t=0.0, sun=True):
    rrect(c, x - 14, y - 14, w + 28, h + 28, 22, P["ivory"])
    c.save()
    c.clipRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), 12, 12), doAntiAlias=True)
    shader = skia.GradientShader.MakeLinear([(0, y), (0, y + h)], [skia.Color4f(*sky_top).toColor(), skia.Color4f(*sky_bot).toColor()])
    p = skia.Paint(AntiAlias=True)
    p.setShader(shader)
    c.drawRect(skia.Rect.MakeXYWH(x, y, w, h), p)
    if sun:
        circle(c, x + w * 0.72, y + h * 0.35, h * 0.14, with_alpha(P["gold"], 0.9))
    for i in range(2):
        cx = x + ((t * 18 + i * w * 0.6) % (w + 200)) - 100
        cloud(c, cx, y + h * (0.3 + 0.35 * i), h * 0.1, with_alpha(P["white"], 0.85))
    c.restore()
    line(c, x + w / 2, y, x + w / 2, y + h, P["ivory"], 12)
    line(c, x, y + h / 2, x + w, y + h / 2, P["ivory"], 12)


def desk(c, x, y, w, col=None):
    col = col or hexc("#C99A6E")
    dk = mix(col, P["slate"], 0.25)
    for lx in (x - w / 2 + 30, x + w / 2 - 60):
        rrect(c, lx, y + 10, 30, 230, 8, dk)
    # modesty panel so whoever sits behind reads as "seated"
    rrect(c, x - w / 2 + 70, y + 20, w - 140, 150, 10, mix(col, P["slate"], 0.12))
    rrect(c, x - w / 2, y - 6, w, 34, 12, col)
    rrect(c, x - w / 2, y + 18, w, 10, 5, dk)


def laptop(c, x, y, s=1.0, glow=0.0, screen=None):
    screen = screen or P["sky_lt"]
    with Xf(c, x, y, s=s):
        rrect(c, -150, -190, 300, 190, 16, P["ink"])
        rrect(c, -136, -176, 272, 162, 8, screen)
        if glow > 0:
            radial_glow(c, 0, -95, 260, P["sky_lt"], 0.35 * glow)
        for i in range(4):
            rrect(c, -110, -150 + i * 30, 120 + (i * 53 % 90), 12, 6, with_alpha(P["white"], 0.7))
        rrect(c, -180, -6, 360, 18, 9, mix(P["heather"], P["slate"], 0.3))


def paper(c, x, y, w=120, h=150, rot=0.0, col=None, lines=True, alpha=1.0):
    col = col or P["white"]
    with Xf(c, x, y, rot=rot, alpha=alpha):
        rrect(c, -w / 2 + 4, -h / 2 + 6, w, h, 8, (0, 0, 0, 0.12), blur=6)
        rrect(c, -w / 2, -h / 2, w, h, 8, col)
        if lines:
            for i in range(4):
                rrect(c, -w / 2 + 16, -h / 2 + 24 + i * 26, w - 32 - (i % 2) * 24, 8, 4, with_alpha(P["heather"], 0.9))


def paper_stack(c, x, y, n, t=0.0, sway=1.0):
    for i in range(n):
        dx = math.sin(i * 1.7) * 8 + math.sin(t * 2.2 + i * 0.3) * i * 0.35 * sway
        paper(c, x + dx, y - i * 13, 170, 26, rot=math.sin(i * 2.3) * 0.03, lines=False,
              col=mix(P["white"], P["oat"], (i % 3) * 0.25))


def stamp(c, x, y, s=1.0, label="HANDLED", col=None, rot=-0.12, alpha=1.0):
    col = col or P["clay"]
    f = font(64, wght=700)
    w = f.measureText(label) + 150
    with Xf(c, x, y, s=s, rot=rot, alpha=alpha):
        rrect(c, -w / 2, -58, w, 116, 26, with_alpha(col, 0.14))
        rrect(c, -w / 2, -58, w, 116, 26, col, stroke=10)
        # check mark
        path = skia.Path()
        path.moveTo(-w / 2 + 34, 0)
        path.lineTo(-w / 2 + 56, 24)
        path.lineTo(-w / 2 + 98, -24)
        c.drawPath(path, paint(col, stroke=13))
        text(c, label, 50, 23, f, col)


# ------------------------------------------------------------------ icons
def cloud(c, x, y, r, col):
    for dx, dy, rr in ((-1.1, 0.2, 0.75), (0, -0.25, 1.0), (1.1, 0.2, 0.75), (0.5, 0.35, 0.7), (-0.5, 0.35, 0.7)):
        circle(c, x + dx * r, y + dy * r, rr * r, col)


def icon(c, kind, x, y, s=1.0, rot=0.0, alpha=1.0):
    with Xf(c, x, y, s=s, rot=rot, alpha=alpha):
        oval(c, 4, 60, 50, 10, (0, 0, 0, 0.0))
        if kind == "mail":
            rrect(c, -62, -42, 124, 84, 14, P["white"])
            poly(c, [(-60, -38), (0, 8), (60, -38)], mix(P["heather"], P["white"], 0.3), closed=False, stroke=8)
            rrect(c, -62, -42, 124, 84, 14, P["sky"], stroke=7)
            circle(c, 50, -40, 18, P["clay"])
            text(c, "1", 50, -32, font(24, wght=700), P["white"])
        elif kind == "car":
            rrect(c, -70, -20, 140, 44, 16, P["sky"])
            rrect(c, -40, -52, 84, 40, 16, P["sky"])
            rrect(c, -30, -44, 30, 26, 6, P["sky_lt"])
            rrect(c, 6, -44, 30, 26, 6, P["sky_lt"])
            for wx in (-40, 40):
                circle(c, wx, 26, 17, P["ink"])
                circle(c, wx, 26, 7, P["heather"])
        elif kind == "weather":
            circle(c, 20, -20, 34, P["gold"])
            cloud(c, -12, 12, 30, P["white"])
            cloud(c, -12, 12, 30, with_alpha(P["heather"], 0.25))
        elif kind == "pizza":
            poly(c, [(-50, -40), (50, -40), (0, 55)], P["gold"])
            rrect(c, -56, -52, 112, 20, 10, hexc("#D9A060"))
            for px, py in ((-18, -18), (14, -10), (0, 18)):
                circle(c, px, py, 9, P["clay"])
        elif kind == "book":
            rrect(c, -55, -45, 110, 90, 10, P["olive"])
            rrect(c, -45, -38, 90, 76, 6, P["ivory"])
            line(c, 0, -38, 0, 38, P["olive"], 5)
            for i in range(3):
                line(c, -36, -20 + i * 18, -10, -20 + i * 18, P["heather"], 5)
                line(c, 10, -20 + i * 18, 36, -20 + i * 18, P["heather"], 5)
        elif kind == "receipt":
            rrect(c, -40, -55, 80, 110, 6, P["white"])
            for i in range(5):
                line(c, -26, -35 + i * 16, 26 - (i % 2) * 20, -35 + i * 16, P["heather"], 5)
            text(c, "$", 0, 58, font(40, wght=700), P["olive"])
        elif kind == "cart":
            poly(c, [(-55, -35), (50, -35), (38, 15), (-40, 15)], P["olive_lt"])
            line(c, -70, -48, -55, -35, P["ink"], 7)
            for wx in (-30, 28):
                circle(c, wx, 32, 10, P["ink"])
        elif kind == "calendar":
            rrect(c, -55, -50, 110, 100, 12, P["white"])
            rrect(c, -55, -50, 110, 28, 12, P["fig"])
            for i in range(3):
                for j in range(3):
                    rrect(c, -40 + i * 28, -12 + j * 20, 18, 12, 3, P["heather"])


def question_bubble(c, x, y, s=1.0, alpha=1.0, content="?", on=0.0, wob=0.0):
    with Xf(c, x, y, s=s, alpha=alpha, rot=wob):
        rrect(c, -44, -44 + 6, 88, 88, 30, (0, 0, 0, 0.14), blur=8)
        rrect(c, -44, -44, 88, 88, 30, P["white"])
        poly(c, [(-12, 40), (8, 40), (-18, 62)], P["white"])
        if content == "?":
            text(c, "?", 0, 26, font(70, wght=700), P["clay"])
        elif content == "bulb":
            lightbulb(c, 0, 4, 0.62, on)


def lightbulb(c, x, y, s=1.0, on=1.0):
    with Xf(c, x, y, s=s):
        if on > 0:
            radial_glow(c, 0, -14, 120, P["gold"], 0.55 * on)
            for i in range(8):
                a = i * math.pi / 4
                r0, r1 = 62, 62 + 22 * on
                line(c, math.cos(a) * r0, -14 + math.sin(a) * r0, math.cos(a) * r1, -14 + math.sin(a) * r1,
                     with_alpha(P["gold"], on), 7)
        circle(c, 0, -14, 42, mix(P["heather"], P["gold"], on))
        rrect(c, -20, 22, 40, 26, 8, P["gray"])
        line(c, -16, 34, 16, 34, mix(P["gray"], P["slate"], 0.3), 4)


def thinking_dots(c, x, y, t, alpha=1.0):
    with Xf(c, x, y, alpha=alpha):
        rrect(c, -80, -40, 160, 80, 40, P["white"])
        circle(c, -70, 50, 12, P["white"])
        circle(c, -92, 72, 7, P["white"])
        for i in range(3):
            k = max(0.0, math.sin(t * 7 - i * 0.9))
            circle(c, -38 + i * 38, -k * 10, 12, mix(P["heather"], P["slate"], 0.3 + 0.5 * k))


def crayon(c, x, y, rot=0.0, col=None, s=1.0):
    col = col or P["gold"]
    with Xf(c, x, y, rot=rot, s=s):
        rrect(c, -60, -11, 100, 22, 6, col)
        rrect(c, -40, -11, 46, 22, 2, mix(col, P["slate"], 0.25))
        poly(c, [(40, -11), (66, 0), (40, 11)], mix(col, P["white"], 0.2))


# ------------------------------------------------------------------ drawing of the sun
def _sun_pts(n, r, wob, seed, cx, cy):
    rng = random.Random(seed)
    return [(cx + math.cos(a) * r * (1 + wob * rng.uniform(-0.12, 0.12)),
             cy + math.sin(a) * r * (1 + wob * rng.uniform(-0.12, 0.12)))
            for a in (i * 2 * math.pi / n for i in range(n))]


def sun_drawing(c, cx, cy, r, perfect=0.0, reveal=1.0, face=1.0, col=None, seed=3, smile_col=None,
                blocky=0.0):
    """Hand-drawn wobbly sun that can morph into a sterile perfect one."""
    col = col or P["gold"]
    ink = mix(hexc("#E08A2E"), P["gray"], perfect)
    fill = mix(with_alpha(col, 0.75), with_alpha(mix(col, P["white"], 0.1), 1.0), perfect)
    wob = 1 - perfect
    pts = _sun_pts(28, r, wob, seed, cx, cy)
    if reveal < 1:
        c.save()
        c.clipRect(skia.Rect.MakeLTRB(cx - r * 3, cy - r * 3, cx - r * 3 + reveal * r * 6, cy + r * 3))
    path = skia.Path()
    path.moveTo(*pts[0])
    for i in range(1, len(pts) + 1):
        p0 = pts[i % len(pts)]
        path.lineTo(*p0)
    path.close()
    c.drawPath(path, paint(fill))
    c.drawPath(path, paint(ink, stroke=7 + 2 * wob))
    rng = random.Random(seed + 9)
    for i in range(12):
        a = i * math.pi / 6 + wob * rng.uniform(-0.15, 0.15)
        r0 = r * (1.25 + wob * rng.uniform(-0.1, 0.1))
        r1 = r * (1.65 + wob * rng.uniform(-0.2, 0.25))
        line(c, cx + math.cos(a) * r0, cy + math.sin(a) * r0, cx + math.cos(a) * r1, cy + math.sin(a) * r1, ink, 8)
    if face > 0:
        fc = with_alpha(smile_col or hexc("#7A4A1E"), face)
        if blocky > 0:
            for s in (-1, 1):
                rrect(c, cx + s * r * 0.35 - 6, cy - r * 0.3, 12, 26, 4, fc)
        else:
            for s in (-1, 1):
                circle(c, cx + s * r * 0.33, cy - r * 0.18, 7, fc)
        path = skia.Path()
        path.moveTo(cx - r * 0.38, cy + r * 0.2)
        path.quadTo(cx, cy + r * 0.62, cx + r * 0.38, cy + r * 0.2)
        c.drawPath(path, paint(fc, stroke=7))
    if reveal < 1:
        c.restore()


# ------------------------------------------------------------------ globe
CONTINENTS = [
    # (lon, lat, radius) blobs, degrees
    [(-100, 45, 22), (-90, 30, 16), (-80, 50, 14), (-115, 55, 15), (-75, 15, 8)],          # N America
    [(-60, -10, 16), (-55, -25, 13), (-65, -40, 8)],                                       # S America
    [(10, 50, 12), (25, 55, 10), (0, 45, 8)],                                             # Europe
    [(20, 5, 18), (25, -15, 14), (15, 20, 14), (35, 10, 10)],                              # Africa
    [(80, 50, 22), (100, 40, 20), (120, 55, 16), (75, 25, 12), (105, 20, 10)],             # Asia
    [(135, -25, 14), (145, -30, 9)],                                                       # Australia
]


def globe_xy(lon, lat, rot, r):
    lo = math.radians(lon - rot)
    la = math.radians(lat)
    x = math.sin(lo) * math.cos(la) * r
    y = -math.sin(la) * r
    z = math.cos(lo) * math.cos(la)
    return x, y, z


def globe(c, x, y, r, rot, orange=0.0, green=0.0, gray=0.0, pins=None, trees=None, t=0.0, lights=0.0):
    ocean = mix(mix(P["sky"], P["heather"], gray), hexc("#F2BE9E"), orange * 0.85)
    land = mix(mix(P["olive_lt"], P["gray"], gray), P["clay"], orange)
    land = mix(land, hexc("#6FAF5A"), green)
    with Xf(c, x, y):
        circle(c, 0, 0, r * 1.08, with_alpha(ocean, 0.18), blur=r * 0.08)
        circle(c, 0, 0, r, ocean)
        c.save()
        cp = skia.Path()
        cp.addCircle(0, 0, r)
        c.clipPath(cp, doAntiAlias=True)
        for cont in CONTINENTS:
            for lon, lat, rad in cont:
                px, py, pz = globe_xy(lon, lat, rot, r)
                if pz <= -0.1:
                    continue
                rr = rad / 90 * r
                k = clamp(pz * 1.2)
                oval(c, px, py, rr * (0.35 + 0.65 * k), rr, land)
        if lights > 0:
            rng = random.Random(4)
            for i in range(60):
                lon, lat = rng.uniform(-180, 180), rng.uniform(-50, 60)
                px, py, pz = globe_xy(lon, lat, rot, r * 0.98)
                if pz > 0.1:
                    tw = 0.6 + 0.4 * math.sin(t * 4 + i)
                    circle(c, px, py, 3 + 3 * lights, with_alpha(P["gold"], lights * tw * pz))
        # soft terminator shading & rim light
        shader = skia.GradientShader.MakeRadial((-r * 0.35, -r * 0.4), r * 1.6,
                                                [skia.Color4f(1, 1, 1, 0.22).toColor(), skia.Color4f(1, 1, 1, 0).toColor(),
                                                 skia.Color4f(0.05, 0.03, 0.08, 0.28).toColor()], [0, 0.45, 1])
        p = skia.Paint(AntiAlias=True)
        p.setShader(shader)
        c.drawCircle(0, 0, r, p)
        c.restore()
        for items, kind in ((pins or [], "pin"), (trees or [], "tree")):
            for (lon, lat, k) in items:
                if k <= 0:
                    continue
                px, py, pz = globe_xy(lon, lat, rot, r)
                if pz <= 0.05:
                    continue
                s = ease_out_back(k, 2.5) * (0.5 + 0.5 * pz)
                if kind == "pin":
                    with Xf(c, px, py, s=s * r / 300):
                        line(c, 0, 0, 0, -60, P["ink"], 5)
                        poly(c, [(0, -60), (46, -46), (0, -32)], P["clay"])
                        # tiny clawd face on flag
                        rrect(c, 12, -52, 4, 8, 2, P["slate"])
                        rrect(c, 26, -50, 4, 8, 2, P["slate"])
                else:
                    with Xf(c, px, py, s=s * r / 300):
                        rrect(c, -5, -30, 10, 30, 4, hexc("#8C5A3C"))
                        circle(c, 0, -46, 26, hexc("#5FA052"))
                        circle(c, -12, -38, 16, hexc("#6FB861"))


# ------------------------------------------------------------------ living room
def couch(c, x, y, w=560, col=None):
    col = col or P["heather"]
    dk = mix(col, P["slate"], 0.18)
    rrect(c, x - w / 2, y - 250, w, 180, 50, dk)
    rrect(c, x - w / 2 + 20, y - 120, w - 40, 90, 30, col)
    for s in (-1, 1):
        rrect(c, x + s * (w / 2 - 40) - 45, y - 170, 90, 150, 40, mix(col, P["white"], 0.08))
    for s in (-1, 1):
        rrect(c, x + s * (w / 2 - 70) - 12, y - 30, 24, 34, 8, P["ink"])


def lamp(c, x, y, on=1.0):
    line(c, x, y, x, y - 330, P["ink"], 10)
    rrect(c, x - 50, y - 10, 100, 16, 8, P["ink"])
    if on > 0:
        radial_glow(c, x, y - 360, 280, P["gold"], 0.35 * on)
    poly(c, [(x - 70, y - 320), (x + 70, y - 320), (x + 45, y - 420), (x - 45, y - 420)], mix(P["oat"], P["gold"], 0.35 * on))


def plant(c, x, y, s=1.0, sat=1.0):
    with Xf(c, x, y, s=s):
        leaf = mix(P["gray"], P["olive"], sat)
        for a in (-0.7, -0.25, 0.2, 0.65):
            with Xf(c, 0, -70, rot=a):
                oval(c, 0, -55, 20, 55, leaf)
        rrect(c, -45, -80, 90, 80, 16, mix(P["gray"], P["clay_lt"], sat))


# ------------------------------------------------------------------ outdoors
def house(c, x, y, s=1.0, col=None, roof=None, lit=0.0):
    col = col or P["ivory"]
    roof = roof or P["clay_dk"]
    with Xf(c, x, y, s=s):
        rrect(c, -60, -100, 120, 100, 8, col)
        poly(c, [(-76, -96), (0, -160), (76, -96)], roof)
        rrect(c, -16, -50, 32, 50, 6, mix(roof, P["slate"], 0.3))
        for wx in (-40, 26):
            rrect(c, wx, -82, 16, 18, 3, mix(P["sky_lt"], P["gold"], lit))


def stars(c, t, seed=1, n=80, alpha=1.0, y_max=H * 0.7):
    rng = random.Random(seed)
    for i in range(n):
        x, y = rng.uniform(0, W), rng.uniform(0, y_max)
        r = rng.uniform(1.2, 3.4)
        tw = 0.55 + 0.45 * math.sin(t * rng.uniform(1.5, 3.5) + i)
        circle(c, x, y, r, with_alpha(P["ivory"], alpha * tw))
        if r > 3.0:
            sparkle(c, x, y, r * 3.2 * tw, with_alpha(P["ivory"], alpha * 0.6 * tw))


def tree(c, x, y, s=1.0, grow=1.0, col=None, sway=0.0):
    g = ease_out_back(clamp(grow), 1.6)
    if g <= 0:
        return
    col = col or hexc("#5FA052")
    with Xf(c, x, y, s=s):
        th = 140 * clamp(grow * 1.4)
        rrect(c, -12, -th, 24, th, 8, hexc("#8C5A3C"))
        k = ease_out_back(clamp((grow - 0.25) / 0.75), 2.0)
        if k > 0:
            with Xf(c, sway * 6, -th - 40, s=k, rot=sway * 0.04):
                circle(c, 0, 0, 80, col)
                circle(c, -55, 25, 55, mix(col, P["white"], 0.08))
                circle(c, 55, 25, 55, mix(col, P["slate"], 0.08))
                circle(c, 20, -40, 45, mix(col, P["white"], 0.14))


def sapling(c, x, y, grow, s=1.0):
    with Xf(c, x, y, s=s):
        h = 90 * ease_out(grow)
        line(c, 0, 0, 0, -h, hexc("#6FAF5A"), 9)
        for side in (-1, 1):
            k = ease_out_back(prog(grow, 0.3, 0.6), 2.2)
            if k > 0:
                with Xf(c, 0, -h * 0.75, rot=side * 0.8, s=k):
                    oval(c, side * 22, 0, 24, 12, hexc("#6FB861"))


def flask(c, x, y, s=1.0, liquid=None, t=0.0, bubbles=1.0):
    liquid = liquid or P["fig"]
    with Xf(c, x, y, s=s):
        path = skia.Path()
        path.moveTo(-22, -140)
        path.lineTo(22, -140)
        path.lineTo(22, -80)
        path.lineTo(80, 10)
        path.quadTo(90, 30, 66, 30)
        path.lineTo(-66, 30)
        path.quadTo(-90, 30, -80, 10)
        path.lineTo(-22, -80)
        path.close()
        c.drawPath(path, paint(with_alpha(P["white"], 0.7)))
        c.save()
        c.clipPath(path, doAntiAlias=True)
        wl = -40 + math.sin(t * 5) * 4
        c.drawRect(skia.Rect.MakeLTRB(-100, wl, 100, 40), paint(liquid))
        rng = random.Random(2)
        for i in range(10):
            by = 30 - ((t * rng.uniform(60, 120) + i * 23) % 90)
            circle(c, rng.uniform(-50, 50), by, rng.uniform(4, 9) * bubbles, with_alpha(P["white"], 0.6 * bubbles))
        c.restore()
        c.drawPath(path, paint(mix(P["heather"], P["slate"], 0.3), stroke=6))


def piano(c, x, y, w=620, pressed=None, t=0.0):
    pressed = pressed or {}
    with Xf(c, x, y):
        rrect(c, -w / 2 - 30, -170, w + 60, 200, 26, P["ink"])
        rrect(c, -w / 2 - 30, -170, w + 60, 40, 20, mix(P["ink"], P["white"], 0.1))
        n = 14
        kw = w / n
        for i in range(n):
            k = pressed.get(i, 0.0)
            col = mix(P["white"], P["gold"], k * 0.6)
            rrect(c, -w / 2 + i * kw + 2, -120 + k * 6, kw - 4, 140, 6, col)
        for i in range(n - 1):
            if i % 7 in (2, 6):
                continue
            rrect(c, -w / 2 + (i + 1) * kw - kw * 0.28, -120, kw * 0.56, 84, 5, P["slate"])


def music_note(c, x, y, s=1.0, col=None, alpha=1.0, rot=0.0):
    col = col or P["clay"]
    with Xf(c, x, y, s=s, alpha=alpha, rot=rot):
        oval(c, 0, 0, 16, 12, col)
        line(c, 14, 0, 14, -52, col, 6)
        path = skia.Path()
        path.moveTo(14, -52)
        path.quadTo(34, -42, 30, -24)
        c.drawPath(path, paint(col, stroke=6))


def turbine(c, x, y, s=1.0, rot=0.0):
    with Xf(c, x, y, s=s):
        poly(c, [(-8, 0), (8, 0), (4, -220), (-4, -220)], P["ivory"])
        with Xf(c, 0, -220, rot=rot):
            for i in range(3):
                with Xf(c, 0, 0, rot=i * 2.094):
                    oval(c, 0, -60, 10, 60, P["ivory"])
            circle(c, 0, 0, 12, P["heather"])


def solar(c, x, y, s=1.0, shine=0.0):
    with Xf(c, x, y, s=s, rot=0.0):
        line(c, 0, 0, 0, -40, P["gray"], 8)
        poly(c, [(-70, -40), (70, -40), (54, -100), (-54, -100)], P["sky"])
        for i in range(1, 4):
            line(c, -70 + i * 35, -40, -54 + i * 27, -100, P["sky_lt"], 3)
        if shine > 0:
            sparkle(c, 30, -80, 22 * shine, with_alpha(P["white"], shine))


# ------------------------------------------------------------------ UI
def button(c, x, y, w, h, label, col, s=1.0, alpha=1.0, fsize=40, txt=None, glow=0.0):
    with Xf(c, x, y, s=s, alpha=alpha):
        if glow > 0:
            radial_glow(c, 0, 0, w * 0.8, col, 0.4 * glow)
        rrect(c, -w / 2, -h / 2 + 10, w, h, h / 2, mix(col, P["slate"], 0.35))
        rrect(c, -w / 2, -h / 2, w, h, h / 2, col)
        rrect(c, -w / 2 + 14, -h / 2 + 8, w - 28, h * 0.32, h * 0.16, with_alpha(P["white"], 0.25))
        text(c, label, 0, fsize * 0.36, font(fsize, wght=700), txt or P["white"])


def cursor(c, x, y, click=0.0, s=1.0):
    with Xf(c, x, y, s=s * (1 - 0.15 * click)):
        pts = [(0, 0), (0, 56), (14, 44), (24, 66), (34, 61), (24, 40), (42, 40)]
        poly(c, [(px + 3, py + 4) for px, py in pts], (0, 0, 0, 0.25), blur=3)
        poly(c, pts, P["white"])
        poly(c, pts, P["slate"], stroke=4)


def sunburst(c, cx, cy, rot, col, alpha=0.2, n=16):
    for i in range(n):
        a0 = rot + i * 2 * math.pi / n
        a1 = a0 + math.pi / n
        R = 2400
        poly(c, [(cx, cy), (cx + math.cos(a0) * R, cy + math.sin(a0) * R), (cx + math.cos(a1) * R, cy + math.sin(a1) * R)],
             with_alpha(col, alpha))


def paper_plane(c, x, y, s=1.0, rot=0.0, col=None):
    col = col or P["white"]
    with Xf(c, x, y, s=s, rot=rot):
        poly(c, [(-40, 0), (40, -14), (-20, 18)], col)
        poly(c, [(-40, 0), (40, -14), (-10, 4)], mix(col, P["heather"], 0.5))
