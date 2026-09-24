"""Score for "First Snow" (D major, 96 bpm), rendered with FluidSynth + GeneralUser GS."""
import os
import subprocess
import sys

import pretty_midi as pm

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "short"))
sys.path.insert(0, os.path.join(HERE, "..", "video"))
from beats import BAR, BEAT, b  # noqa: E402
from snowfilm import T  # noqa: E402

SF2 = os.path.join(HERE, "..", "assets", "gu", "GeneralUser-GS.sf2")
OUT = os.path.join(HERE, "build")
N = pm.note_name_to_number


def inst(program, name, drum=False):
    return pm.Instrument(program=program, is_drum=drum, name=name)


MBOX, CEL, GLK, HARP, STR, PIZZ, CLAR, XYL, PNO, CHOIR, BASS = (
    inst(10, "musicbox"), inst(8, "celesta"), inst(9, "glock"), inst(46, "harp"), inst(48, "strings"),
    inst(45, "pizz"), inst(71, "clarinet"), inst(13, "xylo"), inst(0, "piano"), inst(52, "choir"), inst(32, "bass"))
DR = inst(40, "brush", drum=True)
ALL = [MBOX, CEL, GLK, HARP, STR, PIZZ, CLAR, XYL, PNO, CHOIR, BASS, DR]
KICK, SNARE, HAT, CRASH, JINGLE, TRI = 36, 38, 42, 49, 83, 81


def note(i, p, t0, d, v=80):
    i.notes.append(pm.Note(velocity=int(max(1, min(127, v))), pitch=N(p) if isinstance(p, str) else p, start=t0, end=t0 + d))


def chord(i, ps, t0, d, v=70, strum=0.0):
    for k, p in enumerate(ps):
        note(i, p, t0 + k * strum, d - k * strum, v)


D, Bm, G, A, Fsm, Em = (["D3", "F#3", "A3", "D4"], ["B2", "D3", "F#3", "B3"], ["G2", "B2", "D3", "G3"],
                        ["A2", "C#3", "E3", "A3"], ["F#2", "A2", "C#3", "F#3"], ["E3", "G3", "B3", "E4"])


def pad(c, t0, d, v=48):
    chord(STR, c, t0, d, v)


def build():
    # A: the first flake (bars 1-2)
    for k, c in enumerate([D, Bm, G, A]):
        pad(c, b(1) + k * 2 * BEAT, 2 * BEAT + 0.1, 40)
    mel = [("A5", 1, 1), ("F#5", 1, 2), ("E5", 1, 2.5), ("D5", 1, 3), ("B4", 1, 4), ("D5", 2, 1), ("E5", 2, 1.5),
           ("F#5", 2, 2), ("A5", 2, 3), ("G5", 2, 4)]
    for p, bar, beat in mel:
        note(MBOX, p, b(bar, beat), BEAT, 72)
    for k, p in enumerate(["D5", "F#5", "A5", "D6", "F#6", "A6"]):
        note(HARP, p, T["whoa"] - 0.05 + k * 0.05, 1.0, 55)
    # B: the door (bar 3)
    note(GLK, "D6", T["door"], 0.4, 80)
    note(GLK, "A6", T["door"] + 0.12, 0.4, 70)
    for k, p in enumerate(["D3", "A3", "F#3", "A3"]):
        note(PIZZ, p, b(3, 1) + k * BEAT / 2, 0.2, 70)
    chord(STR, ["D3", "A3", "D4", "F#4"], T["snow"] - 0.02, 1.2, 80)
    chord(GLK, ["D6", "F#6", "A6"], T["snow"], 0.5, 80, strum=0.03)
    note(DR, CRASH, T["snow"], 1.0, 45)
    # C: chasing the flake (bars 4-5, up to the landing)
    ost = ["D3", "A3", "F#3", "A3", "E3", "A3", "G3", "A3"]
    cl = ["F#5", "G5", "A5", "B5", "A5", "F#5", "D5", "E5", "F#5", "E5", "D5", "C#5", "D5", "E5", "F#5", "A5"]
    t, i = b(4), 0
    while t < T["land"] - 0.01:
        note(PIZZ, ost[i % 8], t, 0.18, 68)
        if i % 2 == 0:
            note(CLAR, cl[(i // 2) % len(cl)], t, BEAT / 2 - 0.02, 66)
        note(DR, JINGLE, t, 0.1, 30 + 14 * (i % 2 == 0))
        t += BEAT / 2
        i += 1
    # the flake lands... and melts
    for k, p in enumerate(["A5", "F#5", "D5", "A4"]):
        note(CEL, p, T["land"] + 0.05 + k * 0.16, 0.3, 70 - k * 8)
    chord(STR, ["D3", "F3", "A3"], T["aww"], 1.1, 40)
    # anticipation, then snowfall (bar 6)
    for k in range(14):
        note(HARP, ["D", "E", "F#", "G", "A", "B", "C#"][k % 7] + str(4 + k // 7), T["look_up"] + k * 0.042, 1.0, 50 + k * 2)
    for k in range(10):
        note(DR, 51, T["look_up"] + k * 0.06, 0.1, 20 + k * 5)
    prog6 = [G, A, Fsm, Bm]
    for k, c in enumerate(prog6):
        s = T["snowfall"] + k * 2 * BEAT
        pad(c, s, 2 * BEAT + 0.05, 72)
        note(BASS, c[0][:-1] + "1" if c[0][-1] == "2" else c[0][:-1] + "2", s, 2 * BEAT - 0.1, 70)
        for j in range(4):
            note(CEL, c[(j % 3) + 1][:-1] + str(int(c[(j % 3) + 1][-1]) + 2), s + j * BEAT / 2, 0.4, 70)
    snowmel = [("B5", 0, 1), ("A5", 1, .5), ("F#5", 1.5, .5), ("A5", 2, 1), ("C#6", 3, 1), ("A5", 4, 1.5),
               ("F#5", 5.5, .5), ("D6", 6, 1), ("C#6", 7, 1)]
    for p, bt, d in snowmel:
        note(GLK, p, T["snowfall"] + bt * BEAT, d * BEAT, 72)
    for k in range(8):
        note(DR, KICK if k % 4 == 0 else HAT, T["snowfall"] + k * BEAT / 2, 0.1, 55 if k % 4 == 0 else 30)
        note(DR, JINGLE, T["snowfall"] + k * BEAT / 2, 0.1, 40)
    # D: building a snow-Clawd (bars 7-8)
    for k, c in enumerate([D, G, D, A]):
        pad(c, b(7) + k * 2 * BEAT, 2 * BEAT + 0.05, 44)
        note(BASS, c[0][:-1] + "2", b(7) + k * 2 * BEAT, 2 * BEAT - 0.1, 55)
    note(XYL, "D4", T["body"], 0.3, 85)
    for k, tl in enumerate(T["legs"]):
        note(XYL, ["F#4", "A4", "D5", "F#5"][k], tl, 0.2, 80)
    note(XYL, "A5", T["arms"], 0.3, 85)
    for k, te in enumerate(T["eyes"]):
        note(GLK, ["D6", "F#6"][k], te, 0.3, 75)
    chord(GLK, ["A6", "D7"], T["done"], 0.6, 70, strum=0.06)
    note(MBOX, "A5", T["hi"] + 0.05, 0.6, 55)
    # E: the hat (bar 9)
    pad(G, b(9), 2 * BEAT, 58)
    pad(A, b(9, 3), 2 * BEAT, 62)
    for k, p in enumerate(["G4", "B4", "D5", "G5", "B5", "D6"]):
        note(CEL, p, T["hat_off"] + k * 0.1, 0.5, 60)
    chord(HARP, ["D4", "F#4", "A4", "D5"], T["hat_on"], 1.2, 70, strum=0.03)
    for k, p in enumerate(["A6", "D7", "F#7"]):
        note(GLK, p, T["blink"] + k * 0.06, 0.4, 60)
    # F: lights (bars 10-11)
    pad(D, b(10), BAR, 50)
    penta = ["D5", "E5", "F#5", "A5", "B5", "D6", "E6", "F#6", "A6", "B6", "D7", "E7"]
    for k, tb in enumerate(T["bulbs"]):
        note(GLK, penta[k], tb, 0.25, 70)
    chord(STR, ["D2", "A2", "F#3", "D4", "F#4"], T["lamp"], BAR, 78)
    chord(CHOIR, ["A3", "D4", "F#4"], T["lamp"], BAR, 55)
    chord(PNO, ["D3", "A3", "D4", "F#4", "A4"], T["lamp"], 1.5, 60, strum=0.03)
    note(DR, CRASH, T["lamp"], 1.5, 50)
    lull = [("F#5", 0, 1), ("E5", 1, .5), ("D5", 1.5, .5), ("E5", 2, 1), ("A5", 3, 1)]
    for p, bt, d in lull:
        note(MBOX, p, T["lamp"] + bt * BEAT, d * BEAT, 70)
    for k in range(8):
        note(DR, JINGLE, T["lamp"] + k * BEAT / 2, 0.1, 28)
    # G: first snow (bar 12)
    chord(STR, ["D2", "A2", "E3", "F#3", "C#4"], b(12), BAR, 55)
    chord(HARP, ["D3", "A3", "E4", "F#4", "A4", "C#5", "E5"], b(12), 2.2, 55, strum=0.07)
    chord(GLK, ["F#6", "A6", "D7"], T["title"], 1.2, 60, strum=0.05)
    mid = pm.PrettyMIDI(initial_tempo=96)
    for i in ALL:
        if i.notes:
            mid.instruments.append(i)
    mid.write(os.path.join(OUT, "score.mid"))
    wav = os.path.join(OUT, "score.wav")
    subprocess.run(["fluidsynth", "-ni", "-g", "0.6", "-r", "48000", "-R", "1", "-C", "1", "-F", wav, SF2,
                    os.path.join(OUT, "score.mid")], check=True, capture_output=True)
    print("wrote", wav)


if __name__ == "__main__":
    build()
