#!/usr/bin/env bash
# Full pipeline: voices -> captions timing -> cues -> audio mix -> frames -> final mp4
set -euo pipefail
cd "$(dirname "$0")"
[ -f build/voice/durations.json ] || python3 tts.py
[ -f build/voice/words.json ] || python3 align.py
python3 render.py cues
python3 mix.py
FPS=${FPS:-60} python3 render.py video
ffmpeg -y -loglevel error -i build/video.mp4 -i build/mix.wav \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 256k -shortest ../what_if_claude_took_over_the_world.mp4
echo "done -> what_if_claude_took_over_the_world.mp4"
