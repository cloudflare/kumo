#!/bin/bash
# Build script for Kumo Figma Plugin
# 
# Figma's plugin runtime uses an older JavaScript engine that doesn't support:
# - Nullish coalescing (??)
# - Optional chaining (?.)
# - Some ES2020+ features
#
# We target ES2017 to ensure compatibility.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FIGMA_PKG_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Building Kumo Figma Plugin..."

# Generate theme data from CSS source files (MUST run first)
echo "🎨 Generating theme data from CSS..."
cd "$SCRIPT_DIR"
npx tsx build-theme-data.ts

# Generate icon and loader data from source files
echo "📖 Generating icon data..."
npx tsx build-icon-data.ts 2>/dev/null || echo "⚠️  Icon data generation skipped (may already exist)"

echo "📖 Generating loader data..."
npx tsx build-loader-data.ts 2>/dev/null || echo "⚠️  Loader data generation skipped (may already exist)"

cd "$FIGMA_PKG_DIR"
pnpm exec esbuild "$SCRIPT_DIR/code.ts" \
  --bundle \
  --outfile="$SCRIPT_DIR/code.js" \
  --format=iife \
  --target=es2017 \
  --log-level=info

echo "✅ Build complete: $SCRIPT_DIR/code.js"
