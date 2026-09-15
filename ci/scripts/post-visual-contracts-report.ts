#!/usr/bin/env tsx

/**
 * Publish the curated visual-contract gallery for a pull request.
 *
 * This runs from the trusted default-branch checkout after the untrusted PR
 * workflow completes. Screenshot paths come from GitHub's tree API, and only
 * PNGs beneath Kumo component screenshot directories are rendered.
 */

import { Octokit } from "@octokit/rest";
import {
  GITHUB_REPO_NAME,
  GITHUB_REPO_OWNER,
  upsertPRComment,
} from "../utils/github-api";

const COMMENT_MARKER = "<!-- kumo-visual-contracts-report -->";
const SCREENSHOT_PATH =
  /^packages\/kumo\/src\/components\/.+\/__screenshots__\/.+\.png$/;

function displayName(path: string): string {
  return (
    path
      .split("/")
      .at(-1)
      ?.replace(/-chromium-(darwin|linux)\.png$/, "")
      .replace(/\.png$/, "")
      .replaceAll("-", " ") ?? path
  );
}

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN ?? "";
  const prNumber = Number(process.env.GITHUB_PR_NUMBER);
  const headSha = process.env.VISUAL_CONTRACTS_HEAD_SHA ?? "";

  if (!token || !Number.isInteger(prNumber) || prNumber <= 0 || !headSha) {
    throw new Error(
      "GITHUB_TOKEN, GITHUB_PR_NUMBER, and VISUAL_CONTRACTS_HEAD_SHA are required",
    );
  }

  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.git.getTree({
    owner: GITHUB_REPO_OWNER,
    repo: GITHUB_REPO_NAME,
    tree_sha: headSha,
    recursive: "true",
  });
  const screenshots = data.tree
    .filter(
      (entry) =>
        entry.type === "blob" && SCREENSHOT_PATH.test(entry.path ?? ""),
    )
    .map((entry) => entry.path as string)
    .filter((path) => path.endsWith("-chromium-linux.png"))
    .sort();

  if (screenshots.length === 0) {
    console.log(
      "No Linux visual-contract screenshots found; skipping PR comment",
    );
    return;
  }

  const gallery = screenshots
    .map((path) => {
      const url = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/blob/${headSha}/${path}?raw=true`;
      return `#### ${displayName(path)}\n\n![${displayName(path)}](${url})`;
    })
    .join("\n\n");
  const content = [
    "## Visual contracts",
    "",
    "Linux Chromium references exercised by the PR's `visual-contracts` job.",
    "",
    "<details>",
    `<summary>${screenshots.length} curated contract${screenshots.length === 1 ? "" : "s"}</summary>`,
    "",
    gallery,
    "",
    "</details>",
  ].join("\n");

  await upsertPRComment(token, prNumber, COMMENT_MARKER, content);
  console.log(`Visual-contract gallery posted to PR #${prNumber}`);
}

main().catch((error) => {
  console.error("Failed to post visual-contract gallery:", error);
  process.exit(1);
});
