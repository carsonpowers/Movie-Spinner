#!/bin/bash
# Build script for optimized production build

set -e

echo "🚀 Starting optimized production build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf build

# Install dependencies with Bun
echo "📦 Installing dependencies..."
bun install --frozen-lockfile

# Type check
echo "🔍 Running type check..."
bun run type-check

# Lint
echo "✨ Running linter..."
bun run lint

# Build Next.js
echo "🏗️  Building Next.js application..."
bun run build

# Optimize images in public directory
echo "🖼️  Optimizing images..."
# Add image optimization script if needed

echo "✅ Build complete!"
echo "📊 Build size:"
du -sh .next

# Display bundle analyzer URL if available
if [ -f ".next/analyze/client.html" ]; then
  echo "📈 Bundle analyzer available at: .next/analyze/client.html"
fi
