#!/bin/bash
# Convert demo recording from WebM to MP4
# Also creates a 2x speed version for social media
#
# Usage: bash scripts/convert-demo-video.sh

set -e

VIDEO_DIR="videos"
mkdir -p "$VIDEO_DIR"

# Find the latest Playwright video
RAW_VIDEO=$(find test-results -name "*.webm" -type f 2>/dev/null | sort -t/ -k3 | tail -1)

if [ -z "$RAW_VIDEO" ]; then
  echo "No WebM video found in test-results/. Run the recording first:"
  echo "  npx playwright test e2e/record-demo.spec.ts --headed"
  exit 1
fi

echo "Found raw video: $RAW_VIDEO"

# Copy raw to videos/
cp "$RAW_VIDEO" "$VIDEO_DIR/demo-raw.webm"
echo "Copied to $VIDEO_DIR/demo-raw.webm"

# Convert to MP4 (normal speed)
echo "Converting to MP4..."
ffmpeg -y -i "$VIDEO_DIR/demo-raw.webm" \
  -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$VIDEO_DIR/demo-1x.mp4"
echo "Created $VIDEO_DIR/demo-1x.mp4"

# Create 2x speed version
echo "Creating 2x speed version..."
ffmpeg -y -i "$VIDEO_DIR/demo-1x.mp4" \
  -filter:v "setpts=0.5*PTS" -an \
  -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$VIDEO_DIR/demo-2x.mp4"
echo "Created $VIDEO_DIR/demo-2x.mp4"

# Create 3x speed version (for ~90s target)
echo "Creating 3x speed version..."
ffmpeg -y -i "$VIDEO_DIR/demo-1x.mp4" \
  -filter:v "setpts=0.33*PTS" -an \
  -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$VIDEO_DIR/demo-3x.mp4"
echo "Created $VIDEO_DIR/demo-3x.mp4"

echo ""
echo "Done! Videos in $VIDEO_DIR/:"
ls -lh "$VIDEO_DIR/"*.mp4 2>/dev/null
echo ""
echo "Timeline:"
echo "  demo-1x.mp4 — real-time recording"
echo "  demo-2x.mp4 — 2x speed (good for Twitter)"
echo "  demo-3x.mp4 — 3x speed (~90s target for storyboard)"
