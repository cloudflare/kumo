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

export interface PRCommentSummary {
  readonly id: number;
  readonly body: string | null;
  readonly authorLogin: string | null;
}

export interface PRCommentClient {
  listComments(): Promise<readonly PRCommentSummary[]>;
  createComment(body: string): Promise<void>;
  updateComment(commentId: number, body: string): Promise<void>;
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

/** Create or update a bot comment identified by a stable marker. */
export async function upsertPRCommentWithClient(
  client: PRCommentClient,
  marker: string,
  content: string,
): Promise<void> {
  const body = `${marker}\n${content}`;
  const comments = await client.listComments();
  const existing = comments.find(
    (comment) =>
      comment.authorLogin === "github-actions[bot]" &&
      comment.body?.startsWith(marker),
  );

  if (existing) {
    await client.updateComment(existing.id, body);
    return;
  }

  await client.createComment(body);
}

/** Create or update the GitHub Actions bot comment identified by a marker. */
export async function upsertPRComment(
  token: string,
  prNumber: number,
  marker: string,
  content: string,
): Promise<void> {
  const octokit = new Octokit({ auth: token });
  const client: PRCommentClient = {
    async listComments() {
      const comments = await octokit.paginate(octokit.issues.listComments, {
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
        issue_number: prNumber,
        per_page: 100,
      });
      return comments.map((comment) => ({
        id: comment.id,
        body: comment.body ?? null,
        authorLogin: comment.user?.login ?? null,
      }));
    },
    async createComment(body) {
      await octokit.issues.createComment({
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
        issue_number: prNumber,
        body,
      });
    },
    async updateComment(commentId, body) {
      await octokit.issues.updateComment({
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
        comment_id: commentId,
        body,
      });
    },
  };

  await upsertPRCommentWithClient(client, marker, content);
}
