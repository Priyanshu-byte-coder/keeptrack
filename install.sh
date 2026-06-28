#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "  KeepTrack Installer"
echo "  ==================="
echo ""

# Detect OS
OS=$(uname -s)
case "$OS" in
  MINGW*|MSYS*|CYGWIN*)
    echo "Windows detected. Use PowerShell instead:"
    echo "  irm https://raw.githubusercontent.com/Priyanshu-byte-coder/keeptrack/gh-pages/install.ps1 | iex"
    echo ""
    echo "Or download manually:"
    echo "  https://github.com/Priyanshu-byte-coder/keeptrack/releases/latest"
    exit 0
    ;;
esac

# Check tools
for cmd in curl unzip; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: '$cmd' is required but not installed."
    exit 1
  fi
done

# Get latest version via redirect (no API, no rate limit)
echo "Fetching latest version..."
REDIRECT_URL=$(curl -fsSI -o /dev/null -w '%{url_effective}' -L https://github.com/Priyanshu-byte-coder/keeptrack/releases/latest)
LATEST=$(echo "$REDIRECT_URL" | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+$' | sed 's/^v//')

if [ -z "$LATEST" ]; then
  echo "Error: Could not determine latest version."
  exit 1
fi

URL="https://github.com/Priyanshu-byte-coder/keeptrack/releases/download/v${LATEST}/keeptrack-v${LATEST}.zip"
INSTALL_DIR="$HOME/keeptrack"

echo "Downloading KeepTrack v${LATEST}..."
curl -fSL -o /tmp/keeptrack.zip "$URL"

echo "Installing to ${INSTALL_DIR}..."
mkdir -p "$INSTALL_DIR"
unzip -o /tmp/keeptrack.zip -d "$INSTALL_DIR"
rm /tmp/keeptrack.zip

echo ""
echo "  KeepTrack v${LATEST} installed to ${INSTALL_DIR}"
echo ""
echo "  Load in Chrome:"
echo "    1. Open chrome://extensions"
echo "    2. Enable Developer Mode (top right)"
echo "    3. Click Load unpacked"
echo "    4. Select: ${INSTALL_DIR}"
echo "    5. Done!"
echo ""
