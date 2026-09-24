# What if Claude took over the world?

Court métrage animé (~2 min 25, 1080p60, anglais, sous-titres incrustés) avec Clawd,
la mascotte de Claude Code. Deux parties : **Bad Ending** puis **Good Ending**.

Tout est généré par code, sans aucun asset externe à part les polices :

| Fichier | Rôle |
|---|---|
| `script.py` | Le scénario (toutes les répliques + le choix des voix) |
| `tts.py` | Voix via Kokoro-82M (ONNX), pitch/EQ/compression via ffmpeg |
| `align.py` | Timing mot à mot (Whisper) pour les sous-titres karaoké |
| `engine.py`, `kit.py` | Mini-moteur 2D (Skia) : easing, ressorts, caméra, grading, grain |
| `characters.py` | Clawd (sur la grille du logo terminal) et les personnages |
| `props.py` | Décors et accessoires |
| `scenes_p1.py`, `scenes_p2.py` | Les 21 plans, avec leurs repères son |
| `core.py` | Scènes, transitions (iris en forme de Clawd, wipe…), sous-titres, lip-sync |
| `synth.py`, `sfx.py`, `music.py` | Synthé maison, ~50 bruitages, musique originale (un leitmotiv décliné) |
| `mix.py` | Mixage, ducking sous les voix, rembobinage, normalisation -14 LUFS |
| `render.py` | Rendu parallèle ; `render.py stills 12.5 40` / `render.py scene intro` pour prévisualiser |

## Construire

```bash
apt-get install ffmpeg espeak-ng libegl1
pip install numpy scipy skia-python soundfile kokoro-onnx faster-whisper fonttools
# modèles Kokoro dans ../assets/models/ (kokoro-v1.0.onnx, voices-v1.0.bin)
./build.sh
```
