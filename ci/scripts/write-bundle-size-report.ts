#!/usr/bin/env tsx

/**
 * Write Bundle Size Report Artifact
 *
 * Bundles consumer fixtures against the built Kumo package and writes a
 * report artifact with size measurements and the npm tarball inventory.
 * Requires packages/kumo/dist to exist (run after `vp run build:kumo`).
 *
 * Report-only: the script fails only when measurement itself fails.
 */

import { appendFileSync } from "node:fs";
import {
  writeReportArtifact,
  bundleSizeReporter,
  buildContextFromEnv,
} from "../reporters";

async function main() {
  const context = buildContextFromEnv();
  const item = await bundleSizeReporter.collect(context);

  if (!item) {
    console.log("No bundle size report generated");
    return;
  }

  writeReportArtifact(item);
  console.log(`\n${item.content}\n`);

  // Surface the report in the GitHub Actions job summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## ${item.title}\n\n${item.content}\n`,
    );
  }
}

main().catch((error) => {
  console.error("Failed to write bundle size report:", error);
  process.exit(1);
});
