#!/bin/bash

# Get absolute repo base directory (two levels up from script location)
REPO_BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "[macOS] ***Building backend***"
cd "$REPO_BASE/backend"
go build -o "$REPO_BASE/build/macos/release/homelib-go"

echo "[macOS] ***Building frontend***"
cd "$REPO_BASE/frontend"
npm install
npx tauri build

cp -r "$REPO_BASE/frontend/src-tauri/target/release/bundle/" "$REPO_BASE/build/macos/release/bundle"

echo "[macOS] Done. Please check $REPO_BASE/build/macos/release"
