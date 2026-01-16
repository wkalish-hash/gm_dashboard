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

echo "Build output verified. Contents of dist/:"
ls -la dist/ || true

# Start the production preview server
# Use exec to ensure the process stays in the foreground and receives signals
echo "Starting production server on 0.0.0.0:5173..."
echo "Server will be accessible at http://0.0.0.0:5173"
exec npm run preview -- --host 0.0.0.0 --port 5173

