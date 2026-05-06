#!/usr/bin/env tsx
import { execSync } from "node:child_process";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import {
  CANARY_COMPONENTS,
  COMPONENT_ACTIONS,
  classifyChangedFiles,
  discoverComponents,
  getAffectedComponents,
  getComponentFromFile,
  type DiscoveredComponent,
} from "./page-config";

// The worker URL is not a secret — it is public in the source code. Keeping it
// as a secret in CI provides false security and creates a foot-gun where the
// env override can be hijacked. The real protection is SCREENSHOT_API_KEY.
const WORKER_URL =
  "https://kumo-screenshot-worker.design-engineering.workers.dev";
const API_KEY = process.env.SCREENSHOT_API_KEY ?? "";

interface ComparisonResult {
  id: string;
  name: string;
  beforeUrl: string;
  afterUrl: string;
  diffUrl: string | null;
  changed: boolean;
  diffPixels: number;
  diffPercent: number;
}

interface ScreenshotResult {
  url: string;
  image?: string;
  imageUrl?: string;
  error?: string;
  sectionId?: string;
  sectionTitle?: string;
}

interface WorkerResponse {
  results: ScreenshotResult[];
}

interface CapturedScreenshot {
  id: string;
  name: string;
  image: Buffer;
  url: string | null;
}

interface DiffResult {
  changed: boolean;
  diffPixels: number;
  diffPercent: number;
  diffImage: Buffer | null;
}

function getChangedFiles(): string[] | null {
  try {
    const base = process.env.GITHUB_BASE_REF || "main";
    // Use PR_HEAD_SHA when provided. CI checks out main for security (to avoid
    // running untrusted PR code with secrets), so HEAD points to main. The PR's
    // head commit is fetched separately and passed via PR_HEAD_SHA.
    const head = process.env.PR_HEAD_SHA || "HEAD";
    // Use two-dot diff (A..B) instead of three-dot (A...B) because shallow
    // clones don't have enough history to compute merge-base.
    const output = execSync(`git diff --name-only origin/${base}..${head}`, {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`git diff failed, falling back to full regression: ${msg}`);
    return null;
  }
}

function sanitizeKeyPart(value: string): string {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "visual-regression";
}

function getRunStoragePrefix(): string {
  const prNumber =
    process.env.GITHUB_PR_NUMBER ?? process.env.PR_NUMBER ?? "local";
  const runId = process.env.GITHUB_RUN_ID ?? Date.now().toString();
  const headSha = process.env.PR_HEAD_SHA ?? process.env.GITHUB_SHA ?? "unknown";

  return [
    "runs",
    `pr-${sanitizeKeyPart(prNumber)}`,
    `run-${sanitizeKeyPart(runId)}`,
    sanitizeKeyPart(headSha.substring(0, 12)),
  ].join("/");
}

function encodeScreenshotKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseWorkerResponse(value: unknown): WorkerResponse {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw new Error("Invalid worker response");
  }

  const results: ScreenshotResult[] = [];

  for (const item of value.results) {
    if (!isRecord(item) || typeof item.url !== "string") {
      throw new Error("Invalid screenshot result");
    }

    const result: ScreenshotResult = { url: item.url };
    if (typeof item.image === "string") result.image = item.image;
    if (typeof item.imageUrl === "string") result.imageUrl = item.imageUrl;
    if (typeof item.error === "string") result.error = item.error;
    if (typeof item.sectionId === "string") result.sectionId = item.sectionId;
    if (typeof item.sectionTitle === "string") {
      result.sectionTitle = item.sectionTitle;
    }
    results.push(result);
  }

  return { results };
}

/**
 * Request sent to the screenshot worker for each page.
 *
 * When `captureSections` is true, the worker should:
 * 1. Query `document.querySelectorAll('[data-vr-demo]')` to find all demo sections
 * 2. For each demo element:
 *    - Scroll it into view (with margin for context)
 *    - Take an element-level screenshot (not full page)
 *    - Return a ScreenshotResult with:
 *      - `sectionId` from `data-vr-section` attribute
 *      - `sectionTitle` from `data-vr-title` attribute
 * 3. If no `[data-vr-demo]` elements exist, fall back to full-page screenshot
 *
 * This ensures stable, per-component screenshots that don't shift based on
 * scroll position or page layout changes.
 */
interface PageRequest {
  url: string;
  captureSections: boolean;
  hideSidebar: boolean;
  actions?: Array<{ type: string; selector: string; waitAfter?: number }>;
}

function getPageRequests(components: DiscoveredComponent[]): PageRequest[] {
  const requests: PageRequest[] = [];

  for (const component of components) {
    requests.push({
      url: component.url,
      captureSections: true,
      hideSidebar: true,
    });

    const action = COMPONENT_ACTIONS[component.id];
    if (action) {
      requests.push({
        url: component.url,
        captureSections: false,
        hideSidebar: true,
        actions: [action],
      });
    }
  }

  return requests;
}

function formatName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getCapturedScreenshots(
  results: ScreenshotResult[],
  requests: PageRequest[],
): CapturedScreenshot[] {
  const screenshots: CapturedScreenshot[] = [];

  for (const result of results) {
    if (result.error) {
      console.warn(`  Error: ${result.url}: ${result.error}`);
      continue;
    }

    if (!result.image) {
      console.warn(`  Empty: ${result.url}`);
      continue;
    }

    const urlPath = new URL(result.url).pathname.replace(/\/$/, "");
    const componentSlug = urlPath.split("/").pop() || "unknown";
    const isOpenState = requests.some(
      (request) =>
        request.url === urlPath.replace(/\/$/, "") &&
        request.actions &&
        request.actions.length > 0,
    );

    let screenshotId: string;
    let screenshotName: string;

    if (result.sectionId) {
      screenshotId = `${componentSlug}-${result.sectionId}`;
      screenshotName = `${formatName(componentSlug)} / ${result.sectionTitle || result.sectionId}`;
    } else if (isOpenState) {
      screenshotId = `${componentSlug}-open`;
      screenshotName = `${formatName(componentSlug)} (Open)`;
    } else {
      screenshotId = componentSlug;
      screenshotName = formatName(componentSlug);
    }

    screenshots.push({
      id: screenshotId,
      name: screenshotName,
      image: Buffer.from(result.image, "base64"),
      url: result.imageUrl ?? null,
    });
  }

  return screenshots;
}

async function captureScreenshots(
  baseUrl: string,
  components: DiscoveredComponent[],
  storagePrefix: string,
): Promise<CapturedScreenshot[]> {
  const requests = getPageRequests(components);
  const start = Date.now();

  console.log(`Capturing screenshots from ${baseUrl}...`);
  console.log(`  ${components.length} components, ${requests.length} requests`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const response = await fetch(`${WORKER_URL}/batch`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      baseUrl,
      pages: requests,
      viewport: { width: 1440, height: 900 },
      hideSidebar: true,
      storage: {
        prefix: storagePrefix,
        includeImage: true,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Worker request failed: ${response.status} - ${text}`);
  }

  const screenshots = getCapturedScreenshots(
    parseWorkerResponse(await response.json()).results,
    requests,
  );
  const elapsedSeconds = Math.round((Date.now() - start) / 100) / 10;
  console.log(`Captured ${screenshots.length} screenshot(s) in ${elapsedSeconds}s`);

  return screenshots;
}

function compareImages(beforeBuf: Buffer, afterBuf: Buffer): DiffResult {
  if (beforeBuf.equals(afterBuf)) {
    return { changed: false, diffPixels: 0, diffPercent: 0, diffImage: null };
  }

  const beforePng = PNG.sync.read(beforeBuf);
  const afterPng = PNG.sync.read(afterBuf);
  const width = Math.max(beforePng.width, afterPng.width);
  const height = Math.max(beforePng.height, afterPng.height);
  const padToSize = (png: PNG, w: number, h: number): Uint8Array => {
    if (png.width === w && png.height === h) {
      return new Uint8Array(
        png.data.buffer,
        png.data.byteOffset,
        png.data.byteLength,
      );
    }

    const padded = new Uint8Array(w * h * 4);
    for (let y = 0; y < png.height; y++) {
      const srcOffset = y * png.width * 4;
      const dstOffset = y * w * 4;
      padded.set(
        png.data.subarray(srcOffset, srcOffset + png.width * 4),
        dstOffset,
      );
    }
    return padded;
  };

  const beforeData = padToSize(beforePng, width, height);
  const afterData = padToSize(afterPng, width, height);
  const diffData = new Uint8Array(width * height * 4);
  const diffPixels = pixelmatch(
    beforeData,
    afterData,
    diffData,
    width,
    height,
    { threshold: 0.1, diffColor: [255, 0, 0], alpha: 0.3 },
  );
  const totalPixels = width * height;
  const diffPercent = totalPixels > 0 ? (diffPixels / totalPixels) * 100 : 0;
  const diffPng = new PNG({ width, height });
  diffPng.data = Buffer.from(diffData);

  return {
    changed: true,
    diffPixels,
    diffPercent: Math.round(diffPercent * 100) / 100,
    diffImage: PNG.sync.write(diffPng),
  };
}

async function uploadScreenshotToWorker(
  imageBuffer: Buffer,
  key: string,
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "image/png",
  };
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const encodedKey = encodeScreenshotKey(key);
  const response = await fetch(`${WORKER_URL}/screenshots/${encodedKey}`, {
    method: "PUT",
    headers,
    body: imageBuffer,
  });

  if (!response.ok) {
    throw new Error(
      `Worker upload failed: ${response.status} - ${await response.text()}`,
    );
  }

  return `${WORKER_URL}/screenshots/${encodedKey}`;
}

function generateMarkdownReport(comparisons: ComparisonResult[]): string {
  const changed = comparisons.filter((c) => c.changed);
  const unchanged = comparisons.filter((c) => !c.changed);

  const lines: string[] = [
    "<!-- kumo-visual-regression -->",
    "<details>",
    `<summary><b>Visual Regression Report</b> — ${changed.length} changed, ${unchanged.length} unchanged</summary>`,
    "",
  ];

  if (changed.length === 0) {
    lines.push("No visual changes detected.");
    lines.push("</details>");
    return lines.join("\n");
  }

  lines.push(`**${changed.length} screenshot(s) with visual changes:**`);
  lines.push("");

  for (const comp of changed) {
    const diffLabel = `${comp.diffPixels.toLocaleString()} px (${comp.diffPercent}%)`;
    lines.push(`### ${comp.name}`);
    lines.push(`${diffLabel} changed`);
    lines.push("");
    lines.push("| Before | After | Diff |");
    lines.push("|--------|-------|------|");
    const diffCell = comp.diffUrl ? `![Diff](${comp.diffUrl})` : "*no diff*";
    lines.push(
      `| ![Before](${comp.beforeUrl}) | ![After](${comp.afterUrl}) | ${diffCell} |`,
    );
    lines.push("");
  }

  if (unchanged.length > 0) {
    lines.push("<details>");
    lines.push(
      `<summary>${unchanged.length} screenshot(s) unchanged</summary>`,
    );
    lines.push("");
    unchanged.forEach((c) => lines.push(`- ${c.name}`));
    lines.push("</details>");
  }

  lines.push("");
  lines.push("---");
  lines.push("*Generated by Kumo Visual Regression*");
  lines.push("</details>");

  return lines.join("\n");
}

async function postPRComment(body: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const prNumber = process.env.GITHUB_PR_NUMBER ?? process.env.PR_NUMBER;
  const repo = process.env.GITHUB_REPOSITORY ?? "cloudflare/kumo";

  if (!token || !prNumber) {
    console.log("Missing GITHUB_TOKEN or PR_NUMBER, skipping PR comment");
    console.log("\n--- Report ---\n");
    console.log(body);
    return;
  }

  const [owner, repoName] = repo.split("/");
  const marker = "<!-- kumo-visual-regression -->";

  const commentsResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/issues/${prNumber}/comments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );

  const comments = (await commentsResponse.json()) as Array<{
    id: number;
    body?: string;
  }>;
  const existingComment = comments.find((c) => c.body?.startsWith(marker));

  const url = existingComment
    ? `https://api.github.com/repos/${owner}/${repoName}/issues/comments/${existingComment.id}`
    : `https://api.github.com/repos/${owner}/${repoName}/issues/${prNumber}/comments`;

  const method = existingComment ? "PATCH" : "POST";

  await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body }),
  });

  console.log(`PR comment ${existingComment ? "updated" : "created"}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const fullRegression = args.includes("--full");

  const beforeUrl = process.env.BEFORE_URL ?? "https://kumo-ui.com";
  const afterUrl =
    process.env.AFTER_URL ?? process.env.PREVIEW_URL ?? beforeUrl;

  console.log("Discovering components from docs site...");
  const allComponents = await discoverComponents(beforeUrl);
  console.log(`Found ${allComponents.length} components\n`);

  let components: DiscoveredComponent[];

  if (fullRegression) {
    components = allComponents;
    console.log(
      `Running full visual regression (${components.length} components)...\n`,
    );
  } else {
    const changedFiles = getChangedFiles();

    // If git diff failed, we don't know what changed — run full regression to be safe
    if (changedFiles === null) {
      components = allComponents;
      console.log(
        `Running full visual regression (${components.length} components, git diff unavailable)...\n`,
      );
    } else {
      const classification = classifyChangedFiles(changedFiles);

      if (classification.allSkippable) {
        console.log(
          "No visually relevant file changes detected. Skipping visual regression.",
        );
        return;
      }

      if (classification.requiresFullRegression) {
        components = allComponents.filter((c) =>
          CANARY_COMPONENTS.includes(c.id),
        );
        const broadFiles = changedFiles.filter((f) => !getComponentFromFile(f));
        console.log("Broad-impact files changed (running canary regression):");
        broadFiles.slice(0, 10).forEach((f) => console.log(`  - ${f}`));
        if (broadFiles.length > 10) {
          console.log(`  ... and ${broadFiles.length - 10} more`);
        }
        console.log(
          `\nRunning canary regression on ${components.length} representative component(s):\n`,
        );
        components.forEach((c) => console.log(`  - ${c.name} (${c.url})`));
      } else {
        components = getAffectedComponents(changedFiles, allComponents);

        if (components.length === 0) {
          console.log(
            "Changed components not found in docs site. Skipping visual regression.",
          );
          return;
        }

        console.log(`Found ${components.length} affected component(s):`);
        components.forEach((c) => console.log(`  - ${c.name} (${c.url})`));
        console.log("");
      }
    }
  }

  const storagePrefix = getRunStoragePrefix();
  const beforeScreenshots = await captureScreenshots(
    beforeUrl,
    components,
    `${storagePrefix}/before`,
  );
  const afterScreenshots = await captureScreenshots(
    afterUrl,
    components,
    `${storagePrefix}/after`,
  );
  const beforeMap = new Map(beforeScreenshots.map((s) => [s.id, s]));
  const afterMap = new Map(afterScreenshots.map((s) => [s.id, s]));
  const allIds = [...new Set([...beforeMap.keys(), ...afterMap.keys()])];
  const comparisons: ComparisonResult[] = [];

  console.log("Comparing screenshots in CI...");

  for (const id of allIds) {
    const before = beforeMap.get(id);
    const after = afterMap.get(id);

    if (!before || !after) continue;
    if (!before.url || !after.url) {
      console.log(`${before.name}: skipped (upload failed)`);
      continue;
    }

    const diff = compareImages(before.image, after.image);
    let diffUrl: string | null = null;
    if (diff.changed && diff.diffImage) {
      try {
        diffUrl = await uploadScreenshotToWorker(
          diff.diffImage,
          `${storagePrefix}/diff/diff-${sanitizeKeyPart(id)}.png`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Diff upload failed for ${before.name}: ${message}`);
      }
    }

    comparisons.push({
      id,
      name: before.name,
      beforeUrl: before.url,
      afterUrl: after.url,
      diffUrl,
      changed: diff.changed,
      diffPixels: diff.diffPixels,
      diffPercent: diff.diffPercent,
    });
  }

  for (const comparison of comparisons) {
    if (comparison.changed) {
      console.log(
        `  ${comparison.name}: CHANGED (${comparison.diffPixels} px, ${comparison.diffPercent}%)`,
      );
    } else {
      console.log(`  ${comparison.name}: unchanged`);
    }
  }

  console.log("\n=== Generating report ===");
  const report = generateMarkdownReport(comparisons);
  await postPRComment(report);
}

main().catch((error) => {
  console.error("Visual regression failed:", error);
  process.exit(1);
});
