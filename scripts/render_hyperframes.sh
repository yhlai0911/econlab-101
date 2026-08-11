#!/usr/bin/env bash
set -euo pipefail
lesson="${1:?lesson directory required}"
output="${2:-$lesson/renders/$(basename "$lesson").mp4}"
mkdir -p "$(dirname "$output")"
cmd=${HYPERFRAMES_CMD:-"npx hyperframes@latest"}
(
  cd "$lesson/composition"
  eval "$cmd lint"
  eval "$cmd render --output '$output' --fps 30 --quality high"
)
if [[ -f "$lesson/audio/mixed.m4a" ]]; then
  ffmpeg -y -i "$output" -i "$lesson/audio/mixed.m4a" -map 0:v -map 1:a -c:v copy -c:a aac -shortest "${output%.mp4}.with-audio.mp4"
fi
