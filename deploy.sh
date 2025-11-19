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

# Start the Vite development server
echo "Starting Vite development server..."
npm run dev

