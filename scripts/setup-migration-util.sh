#!/bin/bash

# ########
#
# This optional script is used to setup the migration utility.
# It will install the dependencies and build the script.
# It assumes you've put this utility at 'bin/migration-util/' within your project.
#
# ########

# Navigate to migration-util directory
cd bin/migration-util || {
  echo "Error: bin/migration-util directory not found!"
  exit 1
}

# Check if pnpm is installed
if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is required. Install it with 'npm install -g pnpm'."
  exit 1
fi

# Install dependencies
echo "Installing dependencies in bin/migration-util..."
pnpm install || {
  echo "Error: Failed to install dependencies!"
  exit 1
}

# Build the script
echo "Building migration utility..."
pnpm run build || {
  echo "Error: Failed to build!"
  exit 1
}

echo "✅ Migration utility setup complete!"
echo "Run it with: pnpm run dev -- [args] from bin/migration-util/"
echo "Or: node dist/copy-migration.js [args] from bin/migration-util/"
