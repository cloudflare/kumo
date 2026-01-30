#!/usr/bin/env tsx

/**
 * Write Kumo Docs Preview Report Artifact
 *
 * Outputs a report artifact for the kumo-docs preview deployment.
 * Called by deploy-kumo-docs-preview.sh after successful deployment.
 *
 * Required environment variables:
 * - KUMO_DOCS_PREVIEW_URL: Deployed preview URL
 * - GITHUB_SHA: Commit SHA (GitHub Actions)
 */

import {
  writeReportArtifact,
  kumoDocsPreviewReporter,
  buildContextFromEnv,
} from "../reporters";

async function main() {
  const context = buildContextFromEnv();

  if (!context.kumoDocsPreviewUrl) {
    console.error("❌ KUMO_DOCS_PREVIEW_URL environment variable is required");
    process.exit(1);
  }

  const item = await kumoDocsPreviewReporter.collect(context);

  if (item) {
    writeReportArtifact(item);
    console.log("✅ Kumo docs preview report artifact written");
  } else {
    console.log("ℹ️  No report item generated");
  }
}

main().catch((error) => {
  console.error("❌ Failed to write Kumo docs report:", error);
  process.exit(1);
});
