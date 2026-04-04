#!/bin/bash

# Clean restart script for CodeSpect
# This clears all build caches and restarts the dev server

echo "🧹 Cleaning build caches..."

# Remove Next.js cache
rm -rf .next
echo "  ✅ Cleared .next/"

# Remove node modules cache
rm -rf node_modules/.cache
echo "  ✅ Cleared node_modules/.cache/"

# Remove turbopack cache if exists
rm -rf .turbo
echo "  ✅ Cleared .turbo/"

echo ""
echo "✨ All caches cleared!"
echo ""
echo "🚀 Now restart your dev server:"
echo "   npm run dev"
echo "   or"
echo "   bun run dev"
echo ""
