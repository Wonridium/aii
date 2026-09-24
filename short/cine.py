"""Shared compositor for the Clawd shorts.

A film module provides:
  DUR, CUTS, NAME
  camera_at(t) -> (zoom, cx, cy)           framing for 16:9; adapted for 9:16 here
  draw_world(c, t, cam, part)              part = "bg" | "fg"
  light_map(c, t, cam, masks)              ambient + pools (+ white emissive masks)
  glows(c, t, cam, glow)                   additive halos; `glow(x, y, r, col, a)`
  overlays(c, t)                           captions / titles in screen space
Each output frame averages SUB sub-frames (motion blur, never across a cut),
lit bg + separately lit fg, then bloom, vignette, fades and film grain.

Set VERTICAL=1 for a 1080x1920 render (engine.W/H follow the same flag).
"""
import math
import os
import subprocess
from multiprocessing import Pool

import numpy as np
import skia

from engine import H, W, ease_in, ease_out, font, P, paint, prog

FPS = 60
SUB = int(os.environ.get("SUB", 5))
SHUTTER = 0.5
VERTICAL = W < H


def world_cam(c, cam):
    z, cx, cy = cam
    c.translate(W / 2, H / 2)
    c.scale(z, z)
    c.translate(-cx, -cy)


def adapt_cam(cam, vmin=1.15, vk=0.72):
    """Map a 16:9 framing to 9:16: keep ~70% of the width, a little tighter."""
    if not VERTICAL:
        return cam
    z, cx, cy = cam
    return max(vmin, z * vk), cx, cy


class Renderer:
    def __init__(self, film):
        self.f = film
        self.arr = np.zeros((H, W, 4), np.uint8)
        self.surf = skia.Surface(self.arr, colorType=skia.kRGBA_8888_ColorType)
        self.larr = np.zeros((H, W, 4), np.uint8)
        self.lsurf = skia.Surface(self.larr, colorType=skia.kRGBA_8888_ColorType)
        self.farr = np.zeros((H, W, 4), np.uint8)
        self.fsurf = skia.Surface(self.farr, colorType=skia.kRGBA_8888_ColorType)
        self.acc = np.zeros((H, W, 4), np.float32)
        self.sm = skia.Surface(W // 4, H // 4)
        self.sm2 = skia.Surface(W // 4, H // 4)
        rng = np.random.default_rng(3)
        self.grain = [rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(6)]

    def cam(self, t):
        f = self.f
        cam = f.camera_at(t)
        if VERTICAL:
            cam = getattr(f, "camera_v", None)(t) if hasattr(f, "camera_v") else adapt_cam(cam)
        return cam

    def sub(self, t):
        f = self.f
        cam = self.cam(t)
        c = self.surf.getCanvas()
        c.clear(skia.ColorBLACK)
        f.draw_world(c, t, cam, "bg")
        f.light_map(self.lsurf.getCanvas(), t, cam, True)
        limg = skia.Image.fromarray(self.larr, colorType=skia.kRGBA_8888_ColorType, copy=False)
        p = skia.Paint()
        p.setBlendMode(skia.BlendMode.kMultiply)
        c.drawImage(limg, 0, 0, skia.SamplingOptions(), p)
        fc = self.fsurf.getCanvas()
        fc.clear(skia.Color4f(0, 0, 0, 0))
        f.draw_world(fc, t, cam, "fg")
        f.light_map(self.lsurf.getCanvas(), t, cam, False)
        limg = skia.Image.fromarray(self.larr, colorType=skia.kRGBA_8888_ColorType, copy=False)
        pm = skia.Paint()
        pm.setBlendMode(skia.BlendMode.kModulate)
        fc.drawImage(limg, 0, 0, skia.SamplingOptions(), pm)
        c.drawImage(skia.Image.fromarray(self.farr, colorType=skia.kRGBA_8888_ColorType, copy=False), 0, 0)
        c.save()
        world_cam(c, cam)
        f.glows(c, t, cam, lambda *a: _glow(c, *a))
        c.restore()
        return self.arr

    def frame(self, fi):
        f = self.f
        t = fi / FPS
        self.acc[:] = 0
        n = max(1, SUB)
        for k in range(n):
            ts = t + ((k + 0.5) / n - 0.5) * SHUTTER / FPS if n > 1 else t
            ts = no_cross_cut(f.CUTS, t, ts)
            self.acc += self.sub(max(0.0, min(f.DUR - 1e-4, ts)))
        self.arr[:] = (self.acc / n).astype(np.uint8)
        c = self.surf.getCanvas()
        self.bloom(c)
        vignette(c)
        f.overlays(c, t)
        k = min(1 - ease_in(prog(t, f.DUR - 0.7, 0.7)), ease_out(prog(t, 0, 0.5)))
        if k < 1:
            c.drawRect(skia.Rect.MakeWH(W, H), paint((0, 0, 0, 1 - k)))
        g = self.grain[fi % len(self.grain)]
        a = self.arr[:, :, :3].astype(np.float32)
        a += np.repeat(np.repeat(g, 2, 0), 2, 1)[:, :, None] * 3.2
        self.arr[:, :, :3] = np.clip(a, 0, 255).astype(np.uint8)
        return self.arr

    def bloom(self, c):
        img = skia.Image.fromarray(self.arr, colorType=skia.kRGBA_8888_ColorType)
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
        pa = skia.Paint()
        pa.setBlendMode(skia.BlendMode.kPlus)
        pa.setAlphaf(0.55)
        c.drawImageRect(self.sm2.makeImageSnapshot(), skia.Rect.MakeWH(W, H),
                        skia.SamplingOptions(skia.FilterMode.kLinear), pa)


def _glow(c, x, y, r, col, a):
    sh = skia.GradientShader.MakeRadial((x, y), r, [skia.Color4f(*col[:3], a).toColor(),
                                                   skia.Color4f(*col[:3], 0).toColor()])
    pp = skia.Paint(AntiAlias=True)
    pp.setShader(sh)
    pp.setBlendMode(skia.BlendMode.kPlus)
    c.drawCircle(x, y, r, pp)


def pool(c, x, y, r, col, a):
    """Additive light pool for light maps."""
    sh = skia.GradientShader.MakeRadial((x, y), r, [skia.Color4f(*col[:3], a).toColor(),
                                                   skia.Color4f(*col[:3], a * 0.35).toColor(),
                                                   skia.Color4f(*col[:3], 0).toColor()], [0, 0.45, 1])
    p = skia.Paint(AntiAlias=True)
    p.setShader(sh)
    p.setBlendMode(skia.BlendMode.kPlus)
    c.drawCircle(x, y, r, p)


def no_cross_cut(cuts, t, ts):
    for cut in cuts:
        if t >= cut > ts:
            return cut
        if t < cut <= ts:
            return cut - 1e-4
    return ts


def vignette(c):
    sh = skia.GradientShader.MakeRadial((W / 2, H / 2), max(W, H) * 0.72, [
        skia.Color4f(0, 0, 0, 0).toColor(), skia.Color4f(0, 0, 0, 0).toColor(),
        skia.Color4f(0.02, 0.02, 0.06, 0.55).toColor()], [0, 0.5, 1])
    p = skia.Paint()
    p.setShader(sh)
    c.drawPaint(p)


def caption_y():
    """Lower third that stays clear of TikTok's bottom UI in 9:16."""
    return H - 110 if not VERTICAL else int(H * 0.70)


# ---------------------------------------------------------------- entry points
_R = None


def _init(modname):
    global _R
    import importlib
    _R = Renderer(importlib.import_module(modname))


def _chunk(args):
    k, f0, f1, out = args
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for fr in range(f0, f1):
        p.stdin.write(_R.frame(fr).tobytes())
    p.stdin.close()
    p.wait()
    return k


def render_video(film, build, name):
    nfr = int(film.DUR * FPS)
    d = os.path.join(build, "chunks_" + name)
    os.makedirs(d, exist_ok=True)
    n = 12
    step = math.ceil(nfr / n)
    jobs = [(k, k * step, min(nfr, (k + 1) * step), os.path.join(d, f"c{k:02d}.mp4")) for k in range(n)]
    with Pool(os.cpu_count(), initializer=_init, initargs=(film.__name__,)) as pool_:
        for k in pool_.imap_unordered(_chunk, jobs):
            print("chunk", k, flush=True)
    lst = os.path.join(d, "list.txt")
    open(lst, "w").write("".join(f"file '{j[3]}'\n" for j in jobs))
    out = os.path.join(build, name + ".mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out],
                   check=True)
    print("wrote", out)


def stills(film, build, times, tag="sheet"):
    r = Renderer(film)
    d = os.path.join(build, "stills")
    os.makedirs(d, exist_ok=True)
    cols = 3 if not VERTICAL else 5
    tw, th = (640, 360) if not VERTICAL else (324, 576)
    rows = math.ceil(len(times) / cols)
    sheet = np.full((rows * (th + 28), cols * tw, 4), 255, np.uint8)
    cv = skia.Surface(sheet, colorType=skia.kRGBA_8888_ColorType).getCanvas()
    for i, t in enumerate(times):
        img = skia.Image.fromarray(r.frame(int(round(t * FPS))).copy(), colorType=skia.kRGBA_8888_ColorType)
        x, y = (i % cols) * tw, (i // cols) * (th + 28)
        cv.drawImageRect(img, skia.Rect.MakeXYWH(x, y + 28, tw, th), skia.SamplingOptions(skia.FilterMode.kLinear))
        cv.drawString(f"{t:.2f}s", x + 8, y + 21, font(20, wght=600), paint(P["slate"]))
    out = os.path.join(d, f"{tag}.png")
    skia.Image.fromarray(sheet, colorType=skia.kRGBA_8888_ColorType).save(out, skia.kPNG)
    print(out)
