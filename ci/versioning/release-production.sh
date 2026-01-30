#!/bin/bash
set -euo pipefail

# Configuration
PACKAGE_NAME="${PACKAGE_NAME:-@cloudflare/kumo}"
PACKAGE_PATH="${PACKAGE_PATH:-packages/kumo}"
DRY_RUN="${DRY_RUN:-false}"

if [ "$DRY_RUN" = "true" ]; then
  echo "DRY RUN MODE - No publishing or pushing will occur"
fi

echo "Starting manual release process for ${PACKAGE_NAME}"

# Create release branch
RELEASE_BRANCH="release/kumo-$(git rev-parse --short HEAD)"
echo "Creating release branch: $RELEASE_BRANCH"
git checkout -b "$RELEASE_BRANCH"

# Run production versioning (removes prerelease tags)
echo "Running changesets version for production release..."
pnpm run version

# Check if there are changes to commit
if git diff --quiet && git diff --cached --quiet; then
  echo "No changes detected. No changesets to release."
  exit 1
fi

# Get the new version for commit message
NEW_VERSION=$(node -p "require('./${PACKAGE_PATH}/package.json').version")
echo "New version will be: $NEW_VERSION"

# Build the package before publishing
echo "Building package..."
cd "${PACKAGE_PATH}" && pnpm run build && cd ../..

# Commit version changes
git add .
git commit -m "chore: release ${PACKAGE_NAME}@${NEW_VERSION} [skip ci]"
echo "Committed version changes"

# Publish to production registry
if [ "$DRY_RUN" = "true" ]; then
  echo "[DRY RUN] Would publish ${PACKAGE_NAME}@${NEW_VERSION} to production"
  echo "[DRY RUN] Skipping: pnpm run release"
else
  echo "Publishing ${PACKAGE_NAME} to production..."
  pnpm run release

  # Verify the version was published successfully
  echo "Verifying that version $NEW_VERSION was published to npm registry..."

  # Wait for npm registry to propagate the new version
  sleep 30

  # Check if the version exists in npm
  AVAILABLE_VERSIONS=$(pnpm view ${PACKAGE_NAME} versions --json 2>/dev/null || echo '[]')

  if echo "$AVAILABLE_VERSIONS" | grep -F "\"$NEW_VERSION\"" > /dev/null; then
    echo "Version $NEW_VERSION successfully published and verified in npm registry"
  elif pnpm view ${PACKAGE_NAME}@${NEW_VERSION} version > /dev/null 2>&1; then
    echo "Version $NEW_VERSION successfully published and verified via direct lookup"
  else
    echo "Version $NEW_VERSION not found in npm registry after publishing"
    echo "Available versions:"
    echo "$AVAILABLE_VERSIONS" | grep -o '"[^"]*"' | tail -10
    exit 1
  fi
fi

# Push release branch and tags
if [ "$DRY_RUN" = "true" ]; then
  echo "[DRY RUN] Would push release branch: $RELEASE_BRANCH"
  echo "[DRY RUN] Would push git tags"
  echo "[DRY RUN] Would create pull request"
  echo ""
  echo "DRY RUN SUMMARY:"
  echo "   - Package: ${PACKAGE_NAME}"
  echo "   - Version: ${NEW_VERSION}"
  echo "   - Branch: ${RELEASE_BRANCH}"
  echo "   - Changes:"
  git diff --stat HEAD~1
  echo ""
  echo "[DRY RUN] Release process completed (no changes published)"
else
  echo "Pushing release branch to GitHub..."
  git push --no-verify origin "$RELEASE_BRANCH"

  # Push any git tags created by changesets
  echo "Pushing git tags..."
  git push --no-verify origin --tags

  # Create pull request back to main using TypeScript script
  echo "Creating pull request for release..."
  npx tsx ci/scripts/create-release-pr.ts \
    --source-branch="$RELEASE_BRANCH" \
    --target-branch="main" \
    --package-name="$PACKAGE_NAME" \
    --version="$NEW_VERSION" \
    --token="$GITHUB_TOKEN"

  echo "Release process completed successfully!"
fi
