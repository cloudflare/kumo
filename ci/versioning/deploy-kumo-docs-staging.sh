#!/bin/bash
set -euo pipefail

# Kumo Docs Staging Deployment Script
# Deploys kumo-docs to staging environment on merge to main

echo "📚 Starting kumo-docs staging deployment..."

# Verify Cloudflare credentials
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required"
  exit 1
fi

echo "🔨 Building @cloudflare/kumo library..."
pnpm --filter @cloudflare/kumo build

echo "🔨 Building kumo-docs..."
pnpm --filter @cloudflare/kumo-docs-astro build

echo "🚀 Deploying to staging..."
cd packages/kumo-docs-astro
pnpm exec wrangler deploy --env staging

echo "🎉 Kumo docs staging deployment complete!"
