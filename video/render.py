"""Render the film.

  python render.py stills 1.0 12.5 ...     -> build/stills/*.png (contact sheet too)
  python render.py scene office_bad        -> stills across one scene
  python render.py video [--fps 60]        -> build/video.mp4 (silent)
  python render.py cues                    -> build/cues.json (for audio.py)
"""
import json
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import numpy as np
import skia

import engine
from core import G, Timeline, composite_transition, draw_captions
from engine import FPS, H, W, film_grain

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")


def make_timeline():
    import scenes_p1
    import scenes_p2
    p1 = scenes_p1.build()
    rew = scenes_p1.rewind(p1[2:10])
    return Timeline(p1 + [rew] + scenes_p2.build())


class Renderer:
    def __init__(self):
        self.tl = make_timeline()
        self.g = G(self.tl)
        self.arr = np.zeros((H, W, 4), np.uint8)
        self.surf = skia.Surface(self.arr, colorType=skia.kRGBA_8888_ColorType)
        self.arr_a = np.zeros((H, W, 4), np.uint8)
        self.arr_b = np.zeros((H, W, 4), np.uint8)
        self.surf_a = skia.Surface(self.arr_a, colorType=skia.kRGBA_8888_ColorType)
        self.surf_b = skia.Surface(self.arr_b, colorType=skia.kRGBA_8888_ColorType)

    def _scene_into(self, surf, arr, sc, t):
        c = surf.getCanvas()
        c.clear(skia.ColorWHITE)
        c.save()
        sc.draw(c, t, self.g)
        c.restore()
        if sc.post_arr:
            sc.post_arr(c, t, self.g, arr)

    def frame(self, T, frame_idx=0):
        tl, g = self.tl, self.g
        g.T, g.frame = T, frame_idx
        i = tl.scene_at(T)
        sc = tl.scenes[i]
        t = T - sc.start
        c = self.surf.getCanvas()
        if i > 0 and sc.trans != "cut" and t < sc.tin:
            prev = tl.scenes[i - 1]
            self._scene_into(self.surf_a, self.arr_a, prev, prev.dur + t)
            self._scene_into(self.surf_b, self.arr_b, sc, t)
            ia = skia.Image.fromarray(self.arr_a, colorType=skia.kRGBA_8888_ColorType, copy=False)
            ib = skia.Image.fromarray(self.arr_b, colorType=skia.kRGBA_8888_ColorType, copy=False)
            c.clear(skia.ColorWHITE)
            composite_transition(c, sc.trans, t / sc.tin, ia, ib)
        else:
            c.clear(skia.ColorWHITE)
            c.save()
            sc.draw(c, t, g)
            c.restore()
            if sc.post_arr:
                sc.post_arr(c, t, g, self.arr)
        film_grain(c, frame_idx, 0.06)
        if sc.captions:
            draw_captions(c, tl, T)
        return self.arr


# ------------------------------------------------------------------ workers
_R = None


def _init():
    global _R
    _R = Renderer()


def _chunk(args):
    k, f0, f1, fps, out = args
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba",
           "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
           "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p",
           "-x264-params", "keyint=120", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in range(f0, f1):
        a = _R.frame(f / fps, f)
        p.stdin.write(a.tobytes())
    p.stdin.close()
    p.wait()
    return k


def render_video(fps, t0=0.0, t1=None, name="video"):
    tl = make_timeline()
    t1 = tl.duration if t1 is None else t1
    f0, f1 = int(t0 * fps), int(math.ceil(t1 * fps))
    os.makedirs(os.path.join(BUILD, "chunks"), exist_ok=True)
    n = 16
    step = math.ceil((f1 - f0) / n)
    jobs = []
    for k in range(n):
        a, b = f0 + k * step, min(f1, f0 + (k + 1) * step)
        if a < b:
            jobs.append((k, a, b, fps, os.path.join(BUILD, "chunks", f"{name}_{k:02d}.mp4")))
    with Pool(int(os.environ.get("JOBS", os.cpu_count())), initializer=_init) as pool:
        for k in pool.imap_unordered(_chunk, jobs):
            print(f"chunk {k} done", flush=True)
    lst = os.path.join(BUILD, "chunks", f"{name}.txt")
    with open(lst, "w") as fh:
        for j in jobs:
            fh.write(f"file '{j[4]}'\n")
    out = os.path.join(BUILD, f"{name}.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst,
                    "-c", "copy", out], check=True)
    print("wrote", out, f"{(f1 - f0) / fps:.1f}s")


def stills(times, tag="still"):
    r = Renderer()
    d = os.path.join(BUILD, "stills")
    os.makedirs(d, exist_ok=True)
    paths = []
    for T in times:
        a = r.frame(T, int(T * 60))
        p = os.path.join(d, f"{tag}_{T:07.2f}.png")
        skia.Image.fromarray(a.copy(), colorType=skia.kRGBA_8888_ColorType).save(p, skia.kPNG)
        paths.append(p)
    # contact sheet (3 columns, 640px wide thumbnails)
    cols = 3
    tw, th = 640, 360
    rows = math.ceil(len(paths) / cols)
    sheet = np.full((rows * (th + 30), cols * tw, 4), 255, np.uint8)
    ss = skia.Surface(sheet, colorType=skia.kRGBA_8888_ColorType)
    cv = ss.getCanvas()
    for i, p in enumerate(paths):
        img = skia.Image.open(p)
        x, y = (i % cols) * tw, (i // cols) * (th + 30)
        cv.drawImageRect(img, skia.Rect.MakeXYWH(x, y + 30, tw, th), skia.SamplingOptions(skia.FilterMode.kLinear))
        cv.drawString(f"{times[i]:.2f}s  {r.tl.scenes[r.tl.scene_at(times[i])].name}", x + 8, y + 22,
                      engine.font(20, wght=600), engine.paint(engine.P["slate"]))
    out = os.path.join(d, f"sheet_{tag}.png")
    skia.Image.fromarray(sheet, colorType=skia.kRGBA_8888_ColorType).save(out, skia.kPNG)
    print(out)


def export_cues():
    tl = make_timeline()
    cues = []
    for cue in tl.all_cues():
        kind, T = cue[0], cue[1]
        sc = cue[-1]
        if kind == "voice":
            cues.append(dict(kind="voice", t=T, id=cue[2], fx=sc.voice_fx.get(cue[2])))
        else:
            cues.append(dict(kind="sfx", t=T, name=cue[2], vol=cue[3], pan=cue[4], **cue[5]))
    scenes = [dict(name=s.name, start=s.start, dur=s.dur) for s in tl.scenes]
    json.dump(dict(duration=tl.duration, scenes=scenes, cues=cues), open(os.path.join(BUILD, "cues.json"), "w"), indent=1)
    for s in scenes:
        print(f"{s['start']:7.2f}  {s['dur']:5.2f}  {s['name']}")
    print("total", round(tl.duration, 2))


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "stills":
        stills([float(x) for x in sys.argv[2:]])
    elif cmd == "scene":
        tl = make_timeline()
        sc = next(s for s in tl.scenes if s.name == sys.argv[2])
        n = int(sys.argv[3]) if len(sys.argv) > 3 else 9
        stills([sc.start + sc.dur * (i + 0.5) / n for i in range(n)], tag=sc.name)
    elif cmd == "video":
        fps = int(os.environ.get("FPS", FPS))
        t0 = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
        t1 = float(sys.argv[3]) if len(sys.argv) > 3 else None
        render_video(fps, t0, t1, name=os.environ.get("NAME", "video"))
    elif cmd == "cues":
        export_cues()
