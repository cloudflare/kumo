import { appendFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const WORKER_CHECK_NAME = "Workers Builds: kumo-docs";
const WORKER_APP_SLUG = "cloudflare-workers-and-pages";
const PREVIEW_COMMENT_MARKER = "<!-- kumo-docs-preview -->";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, name: string): JsonRecord {
  if (!isRecord(value)) {
    throw new Error(`${name} must be an object.`);
  }
  return value;
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${name} must be a non-empty string.`);
  }
  return value;
}

function requireNumber(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new Error(`${name} must be an integer.`);
  }
  return value;
}

function requireArray(value: unknown, name: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${name} must be an array.`);
  }
  return value;
}

function requireEnv(name: string): string {
  return requireString(process.env[name], name);
}

function parseJson(raw: string, name: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${name} must contain valid JSON.`);
  }
}

function readEvent(): JsonRecord {
  const eventPath = requireEnv("GITHUB_EVENT_PATH");
  return requireRecord(
    parseJson(readFileSync(eventPath, "utf8"), "GitHub event"),
    "GitHub event",
  );
}

function writeOutputs(outputs: Readonly<Record<string, string>>): void {
  const outputPath = requireEnv("GITHUB_OUTPUT");
  for (const [name, value] of Object.entries(outputs)) {
    appendFileSync(outputPath, `${name}=${value}\n`);
  }
}

function getRepository(): { owner: string; repo: string } {
  const [owner, repo, extra] = requireEnv("GITHUB_REPOSITORY").split("/");
  if (!owner || !repo || extra) {
    throw new Error("GITHUB_REPOSITORY must have the form owner/repo.");
  }
  return { owner, repo };
}

async function githubRequest(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${requireEnv("GITHUB_TOKEN")}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned HTTP ${response.status} for ${path}.`);
  }
  return response.json();
}

function getPullMetadata(value: unknown, name: string) {
  const pull = requireRecord(value, name);
  const head = requireRecord(pull.head, `${name}.head`);
  return {
    number: requireNumber(pull.number, `${name}.number`),
    headSha: requireString(head.sha, `${name}.head.sha`),
  };
}

function getPullState(value: unknown, name: string): string {
  return requireString(requireRecord(value, name).state, `${name}.state`);
}

export function getWorkerPreviewUrl(detailsUrl: string): string {
  const url = new URL(detailsUrl);
  const match = url.pathname.match(
    /^\/[^/]+\/workers\/services\/view\/kumo-docs\/production\/previews\/([a-z0-9-]+)$/,
  );
  if (url.hostname !== "dash.cloudflare.com" || !match) {
    throw new Error(`Unexpected Worker Builds URL: ${detailsUrl}`);
  }
  return `https://${match[1]}-kumo-docs.design-engineering.workers.dev`;
}

export function parsePreviewCommit(raw: string): string {
  const value = requireRecord(
    parseJson(raw, "Version metadata"),
    "Version metadata",
  );
  const commit = requireString(value.commit, "Version metadata commit");
  if (!/^[a-f0-9]{7,40}$/.test(commit)) {
    throw new Error("Version metadata commit is invalid.");
  }
  return commit;
}

export function commitsMatch(expected: string, actual: string): boolean {
  return expected.startsWith(actual) || actual.startsWith(expected);
}

function validatePreviewUrl(previewUrl: string): string {
  const url = new URL(previewUrl);
  const allowedHost =
    /^[a-z0-9-]+-kumo-docs\.design-engineering\.workers\.dev$/;
  if (url.protocol !== "https:" || !allowedHost.test(url.hostname)) {
    throw new Error(`Unexpected preview URL: ${previewUrl}`);
  }
  return previewUrl;
}

export function getWranglerPreviewUrl(output: string): string {
  const previewUrl = output.match(
    /Version Preview URL:\s+(https:\/\/\S+)/,
  )?.[1];
  if (previewUrl) {
    return validatePreviewUrl(previewUrl);
  }

  const versionId = output.match(/Worker Version ID:\s+([a-f0-9-]+)/)?.[1];
  if (!versionId || versionId.length < 8) {
    throw new Error("Wrangler did not return a docs preview URL.");
  }
  return validatePreviewUrl(
    `https://${versionId.substring(0, 8)}-kumo-docs.design-engineering.workers.dev`,
  );
}

async function resolveInternalPreview(): Promise<void> {
  const event = readEvent();
  const checkRun = requireRecord(event.check_run, "check_run");
  const app = requireRecord(checkRun.app, "check_run.app");
  const name = requireString(checkRun.name, "check_run.name");
  const appSlug = requireString(app.slug, "check_run.app.slug");
  const conclusion = requireString(checkRun.conclusion, "check_run.conclusion");

  if (
    name !== WORKER_CHECK_NAME ||
    appSlug !== WORKER_APP_SLUG ||
    conclusion !== "success"
  ) {
    throw new Error("The event is not a successful Kumo Worker Build check.");
  }

  const pulls = requireArray(checkRun.pull_requests, "check_run.pull_requests");
  const pull = getPullMetadata(pulls[0], "check_run.pull_requests[0]");
  const headSha = requireString(checkRun.head_sha, "check_run.head_sha");
  if (pull.headSha !== headSha) {
    throw new Error("The check run and pull request head SHAs differ.");
  }

  const { owner, repo } = getRepository();
  const currentPullResponse = await githubRequest(
    `/repos/${owner}/${repo}/pulls/${pull.number}`,
  );
  const currentPull = getPullMetadata(currentPullResponse, "pull request");
  if (
    getPullState(currentPullResponse, "pull request") !== "open" ||
    currentPull.headSha !== headSha
  ) {
    console.log(`Skipping stale preview check for ${headSha}.`);
    writeOutputs({ current: "false" });
    return;
  }

  const detailsUrl = requireString(
    checkRun.details_url,
    "check_run.details_url",
  );
  writeOutputs({
    current: "true",
    preview_url: getWorkerPreviewUrl(detailsUrl),
    pr_number: pull.number.toString(),
    head_sha: headSha,
  });
}

async function resolveForkPreview(): Promise<void> {
  const event = readEvent();
  const workflowRun = requireRecord(event.workflow_run, "workflow_run");
  const pulls = requireArray(
    workflowRun.pull_requests,
    "workflow_run.pull_requests",
  );

  if (pulls.length > 0) {
    const pull = getPullMetadata(pulls[0], "workflow_run.pull_requests[0]");
    writeOutputs({
      pr_number: pull.number.toString(),
      head_sha: pull.headSha,
    });
    return;
  }

  const headSha = requireString(workflowRun.head_sha, "workflow_run.head_sha");
  const headBranch = requireString(
    workflowRun.head_branch,
    "workflow_run.head_branch",
  );
  const headRepository = requireRecord(
    workflowRun.head_repository,
    "workflow_run.head_repository",
  );
  const fullName = requireString(
    headRepository.full_name,
    "workflow_run.head_repository.full_name",
  );
  const [headOwner] = fullName.split("/");
  if (!headOwner) {
    throw new Error("Fork repository owner is missing.");
  }

  const { owner, repo } = getRepository();
  const query = new URLSearchParams({
    state: "open",
    head: `${headOwner}:${headBranch}`,
  });
  const candidates = requireArray(
    await githubRequest(`/repos/${owner}/${repo}/pulls?${query}`),
    "pull requests",
  );
  const pullsByMetadata = candidates.map((candidate, index) =>
    getPullMetadata(candidate, `pull requests[${index}]`),
  );
  const pull = pullsByMetadata.find(
    (candidate) => candidate.headSha === headSha,
  );
  if (!pull) {
    throw new Error(`No open pull request found for ${headSha}.`);
  }

  writeOutputs({
    pr_number: pull.number.toString(),
    head_sha: pull.headSha,
  });
}

function readArtifactCommit(): void {
  const versionPath =
    process.env.DOCS_VERSION_PATH ??
    "packages/kumo-docs-astro/dist/api/version";
  writeOutputs({
    preview_commit: parsePreviewCommit(readFileSync(versionPath, "utf8")),
  });
}

function deployDocsPreview(): void {
  const headSha = requireEnv("HEAD_SHA");
  if (!/^[a-f0-9]{7,40}$/.test(headSha)) {
    throw new Error("HEAD_SHA must be a Git commit SHA.");
  }
  const prNumber = requireEnv("PR_NUMBER");
  if (!/^[1-9]\d*$/.test(prNumber)) {
    throw new Error("PR_NUMBER must be a positive integer.");
  }

  const result = spawnSync(
    "wrangler",
    [
      "versions",
      "upload",
      "--env=",
      "--message",
      `PR #${prNumber} (${headSha.substring(0, 7)})`,
    ],
    {
      cwd: process.env.DOCS_PROJECT_PATH ?? "packages/kumo-docs-astro",
      encoding: "utf8",
      env: process.env,
    },
  );
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  process.stdout.write(output);

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `Wrangler exited with status ${result.status ?? "unknown"}.`,
    );
  }
  writeOutputs({ preview_url: getWranglerPreviewUrl(output) });
}

async function verifyPreview(): Promise<void> {
  const previewUrl = requireEnv("PREVIEW_URL");
  const expectedCommit = requireEnv("PREVIEW_COMMIT");
  validatePreviewUrl(previewUrl);
  if (!/^[a-f0-9]{7,40}$/.test(expectedCommit)) {
    throw new Error(`Invalid preview commit: ${expectedCommit}`);
  }

  let lastError = "Preview verification did not run.";
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(
        `${previewUrl}/api/version?sha=${expectedCommit}`,
        { headers: { "Cache-Control": "no-cache" } },
      );
      if (!response.ok) {
        lastError = `Preview returned HTTP ${response.status}.`;
      } else {
        const actualCommit = parsePreviewCommit(await response.text());
        if (commitsMatch(expectedCommit, actualCommit)) {
          return;
        }
        lastError = `Preview serves ${actualCommit}, expected ${expectedCommit}.`;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    if (attempt < 6) {
      await new Promise((resolve) => setTimeout(resolve, 5_000));
    }
  }
  throw new Error(`Could not verify Worker preview: ${lastError}`);
}

async function commentOnPreview(): Promise<void> {
  const previewUrl = requireEnv("PREVIEW_URL");
  const headSha = requireEnv("HEAD_SHA");
  const prNumber = Number(requireEnv("PR_NUMBER"));
  if (!Number.isSafeInteger(prNumber) || prNumber <= 0) {
    throw new Error("PR_NUMBER must be a positive integer.");
  }

  const { owner, repo } = getRepository();
  const comments = requireArray(
    await githubRequest(
      `/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`,
    ),
    "pull request comments",
  );
  const existing = comments.find((value) => {
    if (!isRecord(value)) return false;
    const user = isRecord(value.user) ? value.user : undefined;
    return (
      user?.login === "github-actions[bot]" &&
      typeof value.body === "string" &&
      value.body.startsWith(PREVIEW_COMMENT_MARKER)
    );
  });
  const body = [
    PREVIEW_COMMENT_MARKER,
    "### Docs Preview",
    "",
    `[View docs preview](${previewUrl})`,
    "",
    `Commit: \`${headSha.substring(0, 7)}\``,
  ].join("\n");

  if (existing) {
    const comment = requireRecord(existing, "preview comment");
    const commentId = requireNumber(comment.id, "comment id");
    await githubRequest(
      `/repos/${owner}/${repo}/issues/comments/${commentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      },
    );
    return;
  }

  await githubRequest(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
}

async function main(): Promise<void> {
  const command = process.argv[2];
  switch (command) {
    case "resolve-internal":
      await resolveInternalPreview();
      return;
    case "resolve-fork":
      await resolveForkPreview();
      return;
    case "read-artifact":
      readArtifactCommit();
      return;
    case "deploy":
      deployDocsPreview();
      return;
    case "verify":
      await verifyPreview();
      return;
    case "comment":
      await commentOnPreview();
      return;
    default:
      throw new Error(`Unknown preview command: ${command ?? "missing"}`);
  }
}

const entryPath = process.argv[1];
if (entryPath && import.meta.url === pathToFileURL(entryPath).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
