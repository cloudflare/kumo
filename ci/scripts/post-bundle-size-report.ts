#!/usr/bin/env tsx

/**
 * Post the bundle-size artifact from an untrusted PR workflow.
 *
 * This script must be executed from the trusted default-branch checkout in a
 * workflow_run job. It validates and reformats structured artifact data rather
 * than posting the artifact's untrusted Markdown verbatim.
 */

import { readFileSync } from "node:fs";
import {
  buildBundleSizeMarkdown,
  parseBundleSizeArtifact,
} from "../reporters/bundle-size-report";
import { upsertPRComment } from "../utils/github-api";

const REPORT_PATH = "ci/reports/bundle-size.json";
const COMMENT_MARKER = "<!-- kumo-bundle-size-report -->";

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN ?? "";
  const prNumber = Number(process.env.GITHUB_PR_NUMBER);
  const headSha = process.env.BUNDLE_HEAD_SHA ?? "";

  if (!token || !Number.isInteger(prNumber) || prNumber <= 0 || !headSha) {
    throw new Error(
      "GITHUB_TOKEN, GITHUB_PR_NUMBER, and BUNDLE_HEAD_SHA are required",
    );
  }

  const artifact: unknown = JSON.parse(readFileSync(REPORT_PATH, "utf-8"));
  const data = parseBundleSizeArtifact(artifact);
  const content = [
    "### 📐 Bundle Size",
    "",
    buildBundleSizeMarkdown(data),
    "",
    `Commit: \`${headSha.slice(0, 8)}\``,
  ].join("\n");

  await upsertPRComment(token, prNumber, COMMENT_MARKER, content);
  console.log(`Bundle size report posted to PR #${prNumber}`);
}

main().catch((error) => {
  console.error("Failed to post bundle size report:", error);
  process.exit(1);
});
