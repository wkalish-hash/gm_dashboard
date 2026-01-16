#!/bin/bash
set -e

# Navigate to the project directory
PROJECT_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "Installing Node.js 20.x LTS..."

# Install Node.js 20.x LTS (latest production version)
yes Y | curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get update
apt-get install -y nodejs

# Verify Node.js installation
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install project dependencies
echo "Installing dependencies..."
npm install

# Build the production bundle
echo "Building production bundle..."
npm run build

# Verify build output exists
if [ ! -d "dist" ]; then
  echo "ERROR: Build output directory 'dist' not found!"
  exit 1
fi

# Verify index.html exists in dist
if [ ! -f "dist/index.html" ]; then
  echo "ERROR: dist/index.html not found! Build may have failed."
  exit 1
fi

echo "Build output verified. Contents of dist/:"
ls -la dist/ || true
echo ""
echo "Checking for key files:"
ls -la dist/index.html dist/assets/ 2>/dev/null || echo "Warning: Some expected files not found"

# Start the production server
# Use node server.js instead of vite preview for better control and health checks
echo ""
echo "=========================================="
echo "Starting production server..."
echo "Host: 0.0.0.0"
echo "Port: ${PORT:-5173}"
echo "Health check: http://0.0.0.0:${PORT:-5173}/health"
echo "=========================================="
echo ""

# Use exec to replace shell process and ensure proper signal handling
exec node server.js

