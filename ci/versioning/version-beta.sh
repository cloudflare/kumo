#!/bin/bash
set -euo pipefail

# Note: Ensure "jq" is installed - sudo apt-get update && sudo apt-get install -y jq
# Note: Ensure Git is configured - git config --global user.email "you@example.com" && git config --global user.name "Your Name"
# Note: Use CI vars where possible: `commitHash=${GITHUB_SHA:0:7:-$(git rev-parse --short HEAD)}`
# - This line first tries to use the GITHUB_SHA environment variable (GitHub Actions) and falls back to the Git command if it's not set.

# Run changeset version to version all packages
pnpm run version

# Ensure changes are staged for the commit hash to reflect all changes including version bumps
git add .

# Get the current short Git commit hash
# GitHub Actions provides GITHUB_SHA (full), so we truncate it
commitHash=${GITHUB_SHA:+${GITHUB_SHA:0:7}}
commitHash=${commitHash:-$(git rev-parse --short HEAD)}

# Find all modified package.json files and append "-beta" and the commit hash to their version
git diff --cached --name-only | grep 'package.json$' | while read -r file ; do
    echo "Updating $file with \"-beta\" and commit hash $commitHash"

    # Use jq to safely read and modify the JSON data, appending "-beta" and the commit hash to the version
    jq --arg hash "$commitHash" '
      if .version then
        .version += ("-beta." + $hash)
      else
        .
      end' "$file" > temp.json && mv temp.json "$file"

    # Stage the modified package.json for commit
    git add "$file"
done
