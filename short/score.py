"""Score for "The Bug": MIDI composed against beats.T, rendered with FluidSynth.

A  lo-fi Rhodes groove (F major)           bars 1-2, tape-stops on the failing test
B  sneaky pizzicato creep                  bar 3
C  pizz + xylophone chase (D minor)        bars 4-6, freezes on the empty mug
D  celesta + strings, tender (F major)     bars 7-8
E  harp glissando, strings swell           bar 9
F  groove returns, celesta check cascade   bars 10-11
G  Fmaj9 goodbye                           bar 12
"""
import os
import subprocess

import pretty_midi as pm

from beats import BAR, BEAT, DUR, T, b

HERE = os.path.dirname(os.path.abspath(__file__))
SF2 = os.path.join(HERE, "..", "assets", "gu", "GeneralUser-GS.sf2")
OUT = os.path.join(HERE, "build")

N = pm.note_name_to_number


def inst(program, name, drum=False):
    return pm.Instrument(program=program, is_drum=drum, name=name)


EP, BASS, PIZZ, XYL, CEL, STR, HARP, GLK, CLAR = (
    inst(4, "rhodes"), inst(32, "bass"), inst(45, "pizz"), inst(13, "xylo"), inst(8, "celesta"),
    inst(48, "strings"), inst(46, "harp"), inst(9, "glock"), inst(71, "clarinet"))
DR = inst(40, "brush", drum=True)
ALL = [EP, BASS, PIZZ, XYL, CEL, STR, HARP, GLK, CLAR, DR]


def note(i, pitch, t0, dur, vel=80):
    if isinstance(pitch, str):
        pitch = N(pitch)
    i.notes.append(pm.Note(velocity=int(vel), pitch=pitch, start=t0, end=t0 + dur))


def chord(i, pitches, t0, dur, vel=70, strum=0.0):
    for k, p in enumerate(pitches):
        note(i, p, t0 + k * strum, dur - k * strum, vel)


KICK, SNARE_BRUSH, HAT, RIDE, CRASH, SHAKER = 36, 38, 42, 51, 49, 70


def groove(t0, bars, vel=1.0, busy=False):
    for bar in range(bars):
        s = t0 + bar * BAR
        for k in range(8):
            note(DR, HAT, s + k * BEAT / 2, 0.1, (55 if k % 2 == 0 else 38) * vel)
        note(DR, KICK, s, 0.2, 80 * vel)
        note(DR, KICK, s + 2.5 * BEAT, 0.2, 62 * vel)
        note(DR, SNARE_BRUSH, s + BEAT, 0.2, 60 * vel)
        note(DR, SNARE_BRUSH, s + 3 * BEAT, 0.2, 64 * vel)
        if busy:
            note(DR, KICK, s + 2 * BEAT, 0.2, 70 * vel)


LOFI = [["F3", "A3", "C4", "E4"], ["E3", "G3", "B3", "D4"], ["D3", "F3", "A3", "C4"], ["C3", "E3", "G3", "B3"]]
LOFI_BASS = ["F2", "E2", "D2", "C2"]


def lofi(t0, bars, vel=1.0):
    for k in range(bars * 2):
        s = t0 + k * 2 * BEAT
        c = LOFI[k % 4]
        chord(EP, c, s, 2 * BEAT - 0.05, 58 * vel, strum=0.018)
        note(BASS, LOFI_BASS[k % 4], s, 1.4 * BEAT, 78 * vel)
        note(BASS, LOFI_BASS[k % 4], s + 1.5 * BEAT, 0.4 * BEAT, 55 * vel)


def build():
    # ---- A: bars 1-2 (cut short by the failing test)
    lofi(0.0, 2)
    groove(b(1, 3), 2, 0.8)
    for t, p in zip([0.9, 1.25, 1.55, 3.0], ["C5", "D5", "E5", "A4"]):
        note(EP, p, t, 0.35, 50)
    for t, p in zip(T["ok"], ["C6", "E6", "G6"]):
        note(GLK, p, t, 0.5, 92)
    note(GLK, "C#6", T["fail"], 0.4, 70)
    # ---- B: sneaky pizz (bar 3)
    for k, p in enumerate(["D3", "F3", "G#3", "A3", "D3", "F3", "G#3", "A3"]):
        note(PIZZ, p, b(3, 1) + k * BEAT / 2, 0.2, 60 + k * 4)
    note(CLAR, "A4", b(3, 3) - 0.1, 0.25, 70)
    chord(PIZZ, ["D3", "A3", "D4", "F4"], T["found"] - 0.03, 0.3, 95)
    for k in range(8):  # snare swell into the chase
        note(DR, SNARE_BRUSH, b(3, 3) + k * BEAT / 4, 0.1, 40 + k * 7)
    # ---- C: chase in D minor (bars 4-6), freezes on the lift
    ost = ["D4", "A3", "F4", "A3", "E4", "A3", "F4", "A3"]
    mel = ["A5", "G5", "F5", "E5", "D5", "E5", "F5", "A5", "G5", "F5", "E5", "C#5", "D5", "E5", "F5", "G5",
           "A5", "A#5", "A5", "G5", "F5", "E5", "D5", "C#5"]
    t = b(4, 1)
    i = 0
    while t < T["lift"] - 1e-6:
        note(PIZZ, ost[i % 8], t, 0.18, 72)
        note(XYL, mel[i % len(mel)], t, 0.2, 78 if i % 2 == 0 else 64)
        if i % 4 == 0:
            note(BASS, ["D2", "D2", "A#1", "A1"][(i // 8) % 4], t, 0.5, 80)
        t += BEAT / 2
        i += 1
    groove(b(4, 1), 2, 0.9, busy=True)
    for k in range(4):
        note(DR, KICK if k % 2 == 0 else SNARE_BRUSH, b(6, 1) + k * BEAT / 2, 0.2, 75)
    note(PIZZ, "D5", T["reveal"], 0.3, 70)       # "...?"
    note(PIZZ, "A5", T["reveal"] + BEAT / 2, 0.3, 80)
    # ---- D: tender (bars 7-8)
    prog = [["D3", "F3", "A3"], ["A#2", "D3", "F3"], ["F3", "A3", "C4"], ["C3", "E3", "G3"]]
    for k, c in enumerate(prog):
        s = b(7) + k * 2 * BEAT
        chord(STR, c, s, 2 * BEAT + 0.1, 55)
        note(BASS, c[0][:-1] + "2", s, 2 * BEAT - 0.1, 55)
        for j, p in enumerate(c + [c[1][:-1] + str(int(c[1][-1]) + 1)]):
            note(HARP, p[:-1] + str(int(p[-1]) + 1), s + j * BEAT / 2, 0.8, 50)
    for t, p, d in [(b(7, 1), "A5", 1), (b(7, 2), "F5", .5), (b(7, 2.5), "E5", .5), (b(7, 3), "D5", 1),
                    (b(8, 1), "C5", .5), (b(8, 1.5), "D5", .5), (b(8, 2), "E5", 1), (b(8, 3), "F5", .5),
                    (b(8, 3.5), "E5", .5), (b(8, 4), "C5", 1)]:
        note(CEL, p, t, d * BEAT, 72)
    # ---- E: window, glissando (bar 9)
    scale = ["F", "G", "A", "A#", "C", "D", "E"]
    for k in range(14):
        p = scale[k % 7] + str(4 + k // 7)
        note(HARP, p, T["glow"] - 0.2 + k * 0.045, 1.2, 60 + k * 2)
    chord(STR, ["A#2", "D3", "F3", "A#3"], b(9, 1), 2 * BEAT, 60)
    chord(STR, ["C3", "E3", "G3", "C4"], b(9, 3), 2 * BEAT, 70)
    note(BASS, "A#1", b(9, 1), 2 * BEAT, 60)
    note(BASS, "C2", b(9, 3), 2 * BEAT, 65)
    note(GLK, "C7", T["thanks"] + 0.1, 0.5, 60)
    # ---- F: tests re-run (bars 10-11)
    lofi(b(10), 2, 1.1)
    groove(b(10), 2, 1.0, busy=True)
    for t, p in zip(T["checks"], ["C5", "D5", "F5", "G5", "A5", "C6", "D6", "F6"]):
        note(CEL, p, t, 0.4, 88)
        note(GLK, p, t, 0.3, 50)
    note(DR, CRASH, T["passed"], 1.5, 100)
    chord(STR, ["F3", "A3", "C4", "F4"], T["passed"], 1.8 * BEAT + BEAT, 80)
    for k, p in enumerate(["F5", "A5", "C6", "F6"]):
        note(XYL, p, T["passed"] + k * 0.07, 0.3, 85)
    # ---- G: goodbye (bar 12)
    chord(EP, ["F3", "A3", "C4", "E4", "G4"], b(12), 2.4, 60, strum=0.04)
    chord(STR, ["F2", "C3", "A3", "E4"], b(12), 2.4, 50)
    note(BASS, "F1", b(12), 2.3, 60)
    for t, p in zip(T["blinks"], ["A6", "C7"]):
        note(GLK, p, t, 0.6, 70)

    mid = pm.PrettyMIDI(initial_tempo=96)
    for i in ALL:
        if i.notes:
            mid.instruments.append(i)
    # tape-stop on the failing test: bend everything down over ~0.45 s
    for i in mid.instruments:
        if i.is_drum:
            continue
        for k in range(16):
            tt = T["fail"] + 0.05 + k * 0.03
            i.pitch_bends.append(pm.PitchBend(pitch=int(-8191 * (k / 15) ** 1.5), time=tt))
        i.pitch_bends.append(pm.PitchBend(pitch=0, time=b(3) - 0.02))
    # cut the groove notes that ring past the failure
    cut = T["fail"] + 0.5
    for i in mid.instruments:
        for n in i.notes:
            if n.start < T["fail"] + 0.01 < n.end or (T["fail"] < n.start < b(3) and i.name in ("rhodes", "bass", "brush")):
                n.end = min(n.end, cut)
        i.notes = [n for n in i.notes if not (T["fail"] + 0.02 < n.start < b(3) - 0.01 and i.name in ("rhodes", "bass", "brush"))]
    # freeze the chase on the lift
    for i in mid.instruments:
        i.notes = [n for n in i.notes if not (T["lift"] - 0.01 < n.start < T["reveal"] - 0.01)]
    mid.write(os.path.join(OUT, "score.mid"))
    wav = os.path.join(OUT, "score.wav")
    subprocess.run(["fluidsynth", "-ni", "-g", "0.6", "-r", "48000", "-R", "1", "-C", "1",
                    "-F", wav, SF2, os.path.join(OUT, "score.mid")], check=True,
                   capture_output=True)
    print("wrote", wav)


if __name__ == "__main__":
    build()
