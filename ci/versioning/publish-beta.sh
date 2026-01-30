#!/bin/bash
set -euo pipefail

# Beta release script for CI
# Versions, builds, publishes, and outputs report artifact

echo "Starting beta release process..."

# Configure npm registry authentication
cat > ~/.npmrc << EOF
@cloudflare:registry=https://registry.npmjs.org
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
EOF

# Configure git for commits
git config --global user.email "github-actions[bot]@users.noreply.github.com"
git config --global user.name "GitHub Actions"

# Run the versioning step first
echo "Versioning packages..."
pnpm run version:beta

# Build the package before publishing
echo "Building package..."
cd packages/kumo && pnpm run build && cd ../..

# Run the publish step after versioning and building
echo "Publishing to npm..."
pnpm run release:beta

# Get the published version
NEW_VERSION=$(node -p "require('./packages/kumo/package.json').version")
PACKAGE_NAME="${PACKAGE_NAME:-@cloudflare/kumo}"

echo "Published version: $NEW_VERSION"

# Verify the version was published successfully
echo "Verifying publication..."
sleep 45

AVAILABLE_VERSIONS=$(pnpm view ${PACKAGE_NAME} versions --json 2>/dev/null || echo '[]')
echo "Checking for version: $NEW_VERSION"

if echo "$AVAILABLE_VERSIONS" | grep -F "\"$NEW_VERSION\"" > /dev/null; then
  echo "Version $NEW_VERSION successfully published and verified in npm registry"
elif pnpm view ${PACKAGE_NAME}@${NEW_VERSION} version > /dev/null 2>&1; then
  echo "Version $NEW_VERSION successfully published and verified via direct lookup"
else
  echo "Version $NEW_VERSION not found in npm registry after publishing"
  echo "Searched for: $NEW_VERSION"
  echo "Last 10 available versions:"
  echo "$AVAILABLE_VERSIONS" | grep -o '"[^"]*"' | tail -10
  echo ""
  echo "Note: The version might exist but verification failed due to registry propagation delay"
  echo "Manual verification: pnpm view ${PACKAGE_NAME}@${NEW_VERSION}"
  exit 1
fi

# Output report artifact for the PR reporter job
echo "Writing report artifact..."
export PACKAGE_VERSION="$NEW_VERSION"
pnpm tsx ci/scripts/write-npm-report.ts

echo "Beta release complete!"
