/**
 * GitHub API utilities for pull request operations
 *
 * NOTE: Requires @octokit/rest package to be installed:
 *   pnpm add -D @octokit/rest
 */

import { Octokit } from "@octokit/rest";

export const GITHUB_API_URL = "https://api.github.com";
export const GITHUB_REPO_OWNER = "cloudflare";
export const GITHUB_REPO_NAME = "kumo";

/**
 * Interface for pull request creation parameters
 */
export interface CreatePullRequestOptions {
  sourceBranch: string;
  targetBranch: string;
  title: string;
  description: string;
}

/**
 * Create a pull request using GitHub API
 */
export async function createPullRequest(
  token: string,
  options: CreatePullRequestOptions,
): Promise<{ number: number; html_url: string }> {
  const octokit = new Octokit({ auth: token });

  const pullRequest = await octokit.pulls.create({
    owner: GITHUB_REPO_OWNER,
    repo: GITHUB_REPO_NAME,
    head: options.sourceBranch,
    base: options.targetBranch,
    title: options.title,
    body: options.description,
  });

  return {
    number: pullRequest.data.number,
    html_url: pullRequest.data.html_url,
  };
}

/**
 * Post a comment to a pull request
 */
export async function postPRComment(
  token: string,
  prNumber: number,
  body: string,
): Promise<void> {
  const octokit = new Octokit({ auth: token });

  await octokit.issues.createComment({
    owner: GITHUB_REPO_OWNER,
    repo: GITHUB_REPO_NAME,
    issue_number: prNumber,
    body,
  });
}
