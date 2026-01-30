#!/usr/bin/env tsx

/**
 * Write NPM Release Report Artifact
 *
 * Outputs a report artifact for the npm beta release.
 * Called by publish-beta.sh after successful publication.
 *
 * Required environment variables:
 * - PACKAGE_VERSION: Published package version
 * - PACKAGE_NAME: Package name (default: @cloudflare/kumo)
 */

import {
  writeReportArtifact,
  npmReleaseReporter,
  buildContextFromEnv,
} from "../reporters";

async function main() {
  const context = buildContextFromEnv();

  if (!context.packageVersion) {
    console.error("❌ PACKAGE_VERSION environment variable is required");
    process.exit(1);
  }

  const item = await npmReleaseReporter.collect(context);

  if (item) {
    writeReportArtifact(item);
    console.log("✅ NPM release report artifact written");
  } else {
    console.log("ℹ️  No report item generated");
  }
}

main().catch((error) => {
  console.error("❌ Failed to write NPM report:", error);
  process.exit(1);
});
