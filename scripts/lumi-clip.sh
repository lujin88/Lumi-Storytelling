#!/usr/bin/env bash
# Turn a generated Lumi clip (green screen mp4) into the two files the page uses:
#   assets/lumi/<pose>.webm  transparent VP9 (Chrome, Edge, Firefox)
#   assets/lumi/<pose>.webp  animated WebP with alpha (Safari, iOS)
# Each must stay under 500 KB (AGENTS.md, Acceptance numbers).
#
# The source mp4 is not committed. FIT places the keyed clip on the still's canvas
# as "<size> <x> <y>": the clip is resized to <size> px square and its top-left goes
# to <x>,<y>. The wave default was found by matching the clip's first frame to
# assets/lumi/source/wave.webp (silhouette overlap 0.989).
#
# The WebM keeps the clip's own frame rate. The WebP drops to WEBP_FPS: alpha in an
# animated WebP is stored per frame, and 12 fps at 480 px was already over 500 KB.
#
# Usage: scripts/lumi-clip.sh <in.mp4> <pose> [fps] [webp quality]
# Needs ffmpeg (libvpx-vp9), cwebp and webpmux (Homebrew "webp") and python3 with
# Pillow and numpy.
set -euo pipefail

IN=${1:?usage: lumi-clip.sh <in.mp4> <pose> [fps] [webp quality]}
POSE=${2:?pose name, e.g. wave}
FPS=${3:-24}
QUALITY=${4:-60}
ALPHA_QUALITY=${ALPHA_QUALITY:-60}
WEBP_FPS=${WEBP_FPS:-10}
FIT=${FIT:-541 -31 -41}
CANVAS=${CANVAS:-480 460}
CRF=${CRF:-30}
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=$HERE/../assets/lumi
LIMIT=${LIMIT:-512000}

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

mkdir "$WORK/raw"
ffmpeg -loglevel error -y -i "$IN" -an -fps_mode passthrough "$WORK/raw/f%04d.png"
# shellcheck disable=SC2086
python3 "$HERE/lumi_key.py" "$WORK/raw" "$WORK/fit" $FIT $CANVAS

ffmpeg -loglevel error -y -framerate "$FPS" -i "$WORK/fit/f%04d.png" \
  -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf "$CRF" -row-mt 1 -auto-alt-ref 0 \
  "$OUT/$POSE.webm"

mkdir "$WORK/webp"
ffmpeg -loglevel error -y -framerate "$FPS" -i "$WORK/fit/f%04d.png" -vf "fps=$WEBP_FPS" "$WORK/webp/f%04d.png"
DELAY=$((1000 / WEBP_FPS))
frames=()
for f in "$WORK"/webp/f*.png; do
  cwebp -quiet -q "$QUALITY" -alpha_q "$ALPHA_QUALITY" -m 6 -sharp_yuv "$f" -o "${f%.png}.webp"
  frames+=(-frame "${f%.png}.webp" "+$DELAY+0+0+1-b")
done
# Plays once and holds the last frame; the page swaps back to the still when the state ends.
webpmux "${frames[@]}" -loop 1 -bgcolor 0,0,0,0 -o "$OUT/$POSE.webp" >/dev/null

for f in "$OUT/$POSE.webm" "$OUT/$POSE.webp"; do
  size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f")
  echo "$f $size bytes"
  if [ "$size" -ge "$LIMIT" ]; then
    echo "over 500 KB: lower fps or quality" >&2
    exit 1
  fi
done
