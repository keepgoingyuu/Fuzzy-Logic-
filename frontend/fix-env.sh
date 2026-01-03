#!/bin/bash

# Quick fix script for frontend-backend connection issue
# This creates a local .env.local file with correct API URL

set -e

echo "🔧 Frontend Environment Fix Script"
echo "=================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📂 Working directory: $SCRIPT_DIR"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists:"
    cat .env.local
    echo ""
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. No changes made."
        exit 0
    fi
fi

# Create .env.local
echo "📝 Creating .env.local with correct configuration..."
cat > .env.local << 'EOF'
# Frontend Local Environment Variables
# This file is created to fix the frontend-backend connection issue
# Priority: .env.local > .env > .env.production

VITE_API_URL=http://localhost:8200
VITE_APP_PORT=5178
EOF

echo "✅ Created .env.local:"
cat .env.local
echo ""

# Verify parent .env exists
PARENT_ENV="../.env"
if [ -f "$PARENT_ENV" ]; then
    echo "ℹ️  Parent .env configuration:"
    grep VITE_ "$PARENT_ENV" || echo "  (no VITE_ variables)"
else
    echo "⚠️  Warning: Parent .env not found at $PARENT_ENV"
fi
echo ""

echo "🎯 Next steps:"
echo "  1. Stop the current dev server (Ctrl+C)"
echo "  2. Run: pnpm dev"
echo "  3. Open browser console and check for:"
echo "     🔍 API Configuration:"
echo "       - API_BASE_URL: http://localhost:8200"
echo ""
echo "  4. Verify you see:"
echo "     🚀 Axios Request:"
echo "       method: POST"
echo "       fullURL: http://localhost:8200/fuzzy/visualize"
echo ""
echo "✨ If you see the above logs, the fix is working!"
echo ""
echo "📖 For detailed diagnostics, see ROOT_CAUSE_ANALYSIS.md"
