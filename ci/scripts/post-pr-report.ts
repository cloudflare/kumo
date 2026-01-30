#!/usr/bin/env tsx

/**
 * Post PR Report
 *
 * Collects report artifacts from upstream CI jobs and posts
 * a consolidated comment to the pull request.
 *
 * This script should run as the final job in the pipeline,
 * after all jobs that produce report artifacts.
 *
 * Usage: pnpm tsx ci/scripts/post-pr-report.ts
 *
 * Required environment variables:
 * - GITHUB_PR_NUMBER: Pull request number (from github.event.pull_request.number)
 * - GITHUB_TOKEN: GitHub API token
 *
 * Report artifacts are read from: ci/reports/*.json
 */

import { readReportArtifacts, buildContextFromEnv } from "../reporters";
import { buildMarkdownComment, postPRComment } from "../utils/pr-reporter";

async function main() {
  console.log("Collecting report artifacts from upstream jobs...");

  const context = buildContextFromEnv();

  if (!context.prNumber) {
    console.log("Not in PR context, skipping report");
    return;
  }

  // Read all report artifacts from upstream jobs
  const { items, failures } = readReportArtifacts();

  console.log(`  Found ${items.length} report artifact(s)`);
  if (failures.length > 0) {
    console.log(`  ${failures.length} artifact(s) failed to load:`);
    failures.forEach((f) => console.log(`    - ${f}`));
  }

  if (items.length === 0) {
    console.log("No report artifacts found, skipping comment");
    return;
  }

  for (const item of items) {
    console.log(`  -> ${item.title} (${item.id})`);
  }

  console.log(`\nBuilding comment with ${items.length} section(s)...`);

  // Build and post the comment
  const comment = buildMarkdownComment(items, failures);
  await postPRComment(context, comment);

  console.log("PR report posted successfully");
}

main().catch((error) => {
  console.error("Failed to post PR report:", error);
  process.exit(1);
});
