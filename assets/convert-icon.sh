#!/bin/bash

# Convert SVG to ICNS for macOS
# This script converts the SVG icon to PNG at various sizes and then to ICNS format

echo "Converting icon.svg to icon.icns..."

# Create iconset directory
ICONSET_DIR="icon.iconset"
rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

# Check if rsvg-convert or inkscape is available
if command -v rsvg-convert &> /dev/null; then
    CONVERT_CMD="rsvg-convert"
elif command -v inkscape &> /dev/null; then
    CONVERT_CMD="inkscape"
else
    echo "Error: Neither rsvg-convert nor inkscape found."
    echo "Please install one of them:"
    echo "  - rsvg-convert: brew install librsvg"
    echo "  - inkscape: brew install inkscape"
    exit 1
fi

# Convert SVG to PNG at various sizes required for ICNS
if [ "$CONVERT_CMD" = "rsvg-convert" ]; then
    rsvg-convert -w 16 -h 16 icon.svg -o "$ICONSET_DIR/icon_16x16.png"
    rsvg-convert -w 32 -h 32 icon.svg -o "$ICONSET_DIR/icon_16x16@2x.png"
    rsvg-convert -w 32 -h 32 icon.svg -o "$ICONSET_DIR/icon_32x32.png"
    rsvg-convert -w 64 -h 64 icon.svg -o "$ICONSET_DIR/icon_32x32@2x.png"
    rsvg-convert -w 128 -h 128 icon.svg -o "$ICONSET_DIR/icon_128x128.png"
    rsvg-convert -w 256 -h 256 icon.svg -o "$ICONSET_DIR/icon_128x128@2x.png"
    rsvg-convert -w 256 -h 256 icon.svg -o "$ICONSET_DIR/icon_256x256.png"
    rsvg-convert -w 512 -h 512 icon.svg -o "$ICONSET_DIR/icon_256x256@2x.png"
    rsvg-convert -w 512 -h 512 icon.svg -o "$ICONSET_DIR/icon_512x512.png"
    rsvg-convert -w 1024 -h 1024 icon.svg -o "$ICONSET_DIR/icon_512x512@2x.png"
elif [ "$CONVERT_CMD" = "inkscape" ]; then
    inkscape icon.svg -w 16 -h 16 -o "$ICONSET_DIR/icon_16x16.png"
    inkscape icon.svg -w 32 -h 32 -o "$ICONSET_DIR/icon_16x16@2x.png"
    inkscape icon.svg -w 32 -h 32 -o "$ICONSET_DIR/icon_32x32.png"
    inkscape icon.svg -w 64 -h 64 -o "$ICONSET_DIR/icon_32x32@2x.png"
    inkscape icon.svg -w 128 -h 128 -o "$ICONSET_DIR/icon_128x128.png"
    inkscape icon.svg -w 256 -h 256 -o "$ICONSET_DIR/icon_128x128@2x.png"
    inkscape icon.svg -w 256 -h 256 -o "$ICONSET_DIR/icon_256x256.png"
    inkscape icon.svg -w 512 -h 512 -o "$ICONSET_DIR/icon_256x256@2x.png"
    inkscape icon.svg -w 512 -h 512 -o "$ICONSET_DIR/icon_512x512.png"
    inkscape icon.svg -w 1024 -h 1024 -o "$ICONSET_DIR/icon_512x512@2x.png"
fi

# Convert iconset to ICNS using iconutil (macOS built-in tool)
if command -v iconutil &> /dev/null; then
    iconutil -c icns "$ICONSET_DIR" -o icon.icns
    echo "✓ Successfully created icon.icns"
    rm -rf "$ICONSET_DIR"
else
    echo "Error: iconutil not found. This script requires macOS."
    exit 1
fi

