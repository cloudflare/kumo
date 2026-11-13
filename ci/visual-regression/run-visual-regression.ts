#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  classifyChangedFiles,
  discoverComponents,
  getAffectedComponents,
  getComponentFromFile,
  type DiscoveredComponent,
} from "./page-config";
import { compareImages } from "./image-comparison";
import { getPullRequestFiles } from "./pull-request-files";
import { buildPageRequests, chunkPageRequests } from "./requests";

// The worker URL is not a secret — it is public in the source code. Keeping it
// as a secret in CI provides false security and creates a foot-gun where the
// env override can be hijacked. The real protection is SCREENSHOT_API_KEY.
const WORKER_URL =
  "https://kumo-screenshot-worker.design-engineering.workers.dev";
const SCREENSHOTS_DIR = "ci/visual-regression/screenshots";
const API_KEY = process.env.SCREENSHOT_API_KEY ?? "";

/**
 * Screenshot result returned by the worker.
 *
 * For section-based screenshots (when `captureSections` was true and
 * `[data-vr-demo]` elements were found), each element produces one result with:
 * - `sectionId`: from `data-vr-section` attribute (e.g., "primary-variant")
 * - `sectionTitle`: from `data-vr-title` attribute (e.g., "Primary Variant")
 *
 * These identifiers are used to create stable screenshot filenames that
 * persist across runs, enabling accurate before/after comparisons.
 */
interface ScreenshotResult {
  url: string;
  /** Stable identifier echoed from the page request. */
  captureId?: string;
  /** Base64-encoded PNG image */
  image?: string;
  /** Worker-served URL for the stored PNG */
  imageUrl?: string;
  error?: string;
  /** Unique identifier for this demo section, from data-vr-section attribute */
  sectionId?: string;
  /** Human-readable title for reports, from data-vr-title attribute */
  sectionTitle?: string;
}

interface WorkerResponse {
  results: ScreenshotResult[];
}

interface CapturedScreenshot {
  id: string;
  name: string;
  path: string;
  url: string | null;
}

interface ComparisonResult {
  id: string;
  name: string;
  beforeUrl: string | null;
  afterUrl: string | null;
  diffUrl: string | null;
  kind: "modified" | "added" | "removed";
  changed: boolean;
  diffPixels: number;
  diffPercent: number;
}

async function getChangedFiles(): Promise<string[] | null> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const pullRequestNumber =
      process.env.GITHUB_PR_NUMBER ?? process.env.PR_NUMBER;
    const repository = process.env.GITHUB_REPOSITORY;
    if (token && pullRequestNumber && repository) {
      return getPullRequestFiles({ repository, pullRequestNumber, token });
    }

    const output = execFileSync(
      "git",
      ["diff", "--name-only", "origin/main..HEAD"],
      {
        encoding: "utf-8",
      },
    );
    return output.trim().split("\n").filter(Boolean);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Changed-file lookup failed; running full regression: ${msg}`);
    return null;
  }
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function sanitizeKeyPart(value: string): string {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "visual-regression";
}

function encodeScreenshotKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

function getRunStoragePrefix(): string {
  const prNumber =
    process.env.GITHUB_PR_NUMBER ?? process.env.PR_NUMBER ?? "local";
  const runId = process.env.GITHUB_RUN_ID ?? Date.now().toString();
  const runAttempt = process.env.GITHUB_RUN_ATTEMPT ?? "1";
  const headSha =
    process.env.PR_HEAD_SHA ?? process.env.GITHUB_SHA ?? "unknown";

  return [
    "runs",
    `pr-${sanitizeKeyPart(prNumber)}`,
    `run-${sanitizeKeyPart(runId)}-${sanitizeKeyPart(runAttempt)}`,
    sanitizeKeyPart(headSha.substring(0, 12)),
  ].join("/");
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

  const response = await fetch(
    `${WORKER_URL}/screenshots/${encodeScreenshotKey(key)}`,
    {
      method: "PUT",
      headers,
      body: imageBuffer,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Worker upload failed: ${response.status} - ${await response.text()}`,
    );
  }

  return `${WORKER_URL}/screenshots/${encodeScreenshotKey(key)}`;
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
async function captureScreenshots(
  baseUrl: string,
  components: DiscoveredComponent[],
  outputDir: string,
  prefix: string,
  storagePrefix: string,
): Promise<CapturedScreenshot[]> {
  ensureDir(outputDir);
  const screenshots: CapturedScreenshot[] = [];

  const requests = buildPageRequests(components);

  console.log(`Capturing screenshots from ${baseUrl}...`);
  console.log(`  ${components.length} components, ${requests.length} requests`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const results: ScreenshotResult[] = [];
  for (const batch of chunkPageRequests(requests)) {
    const response = await fetch(`${WORKER_URL}/batch`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        baseUrl,
        pages: batch,
        viewport: { width: 1440, height: 900 },
        hideSidebar: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Worker request failed: ${response.status} - ${text}`);
    }

    const data = (await response.json()) as WorkerResponse;
    results.push(...data.results);
  }

  const captureErrors: string[] = [];
  const sectionedUrls = new Set<string>();
  const unsectionedResults = new Map<string, number>();
  const screenshotIdCounts = new Map<string, number>();
  for (const result of results) {
    if (result.error) {
      captureErrors.push(`${result.url}: ${result.error}`);
      continue;
    }

    if (!result.image) {
      captureErrors.push(`${result.url}: worker returned no image`);
      continue;
    }

    const urlPath = new URL(result.url).pathname.replace(/\/$/, "");
    const componentSlug = urlPath.split("/").pop() || "home";

    const hasOpenRequest = requests.some(
      (r) =>
        r.url === urlPath.replace(/\/$/, "") &&
        r.actions?.some(
          (action) => action.type === "click" || action.type === "hover",
        ),
    );
    const priorUnsectionedResults = unsectionedResults.get(urlPath) ?? 0;
    const isOpenState =
      hasOpenRequest &&
      (sectionedUrls.has(urlPath) || priorUnsectionedResults > 0);

    if (result.sectionId) {
      sectionedUrls.add(urlPath);
    } else {
      unsectionedResults.set(urlPath, priorUnsectionedResults + 1);
    }

    let screenshotId: string;
    let screenshotName: string;

    if (result.sectionId) {
      screenshotId = `${componentSlug}-${result.sectionId}`;
      screenshotName = `${formatName(componentSlug)} / ${result.sectionTitle || result.sectionId}`;
    } else if (result.captureId?.endsWith("-open")) {
      screenshotId = result.captureId;
      screenshotName = `${formatName(result.captureId.slice(0, -5))} (Open)`;
    } else if (result.captureId) {
      screenshotId = result.captureId;
      screenshotName = formatName(result.captureId);
    } else if (isOpenState) {
      screenshotId = `${componentSlug}-open`;
      screenshotName = `${formatName(componentSlug)} (Open)`;
    } else {
      screenshotId = componentSlug;
      screenshotName = formatName(componentSlug);
    }

    const occurrence = (screenshotIdCounts.get(screenshotId) ?? 0) + 1;
    screenshotIdCounts.set(screenshotId, occurrence);
    if (occurrence > 1) {
      screenshotId = `${screenshotId}-${occurrence}`;
      screenshotName = `${screenshotName} (${occurrence})`;
    }

    const filename = `${prefix}-${screenshotId}.png`;
    const filepath = join(outputDir, filename);

    const imageBuffer = Buffer.from(result.image, "base64");
    writeFileSync(filepath, imageBuffer);

    const imageUrl = await uploadScreenshotToWorker(
      imageBuffer,
      `${storagePrefix}/${filename}`,
    );
    console.log(
      imageUrl
        ? `  OK: ${screenshotName} -> ${imageUrl}`
        : `  OK: ${screenshotName} (local only, no worker URL)`,
    );

    screenshots.push({
      id: screenshotId,
      name: screenshotName,
      path: filepath,
      url: imageUrl,
    });
  }

  if (captureErrors.length > 0) {
    throw new Error(
      `Screenshot capture incomplete:\n${captureErrors.join("\n")}`,
    );
  }

  return screenshots;
}

function formatName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
    const percent =
      comp.diffPercent > 0 && comp.diffPercent < 0.01
        ? "<0.01"
        : comp.diffPercent.toFixed(2).replace(/\.00$/, "");
    const diffLabel =
      comp.kind === "modified"
        ? `${comp.diffPixels.toLocaleString()} px (${percent}%) changed`
        : `${comp.kind}`;
    lines.push(`### ${comp.name}`);
    lines.push(diffLabel);
    lines.push("");
    lines.push("| Before | After | Diff |");
    lines.push("|--------|-------|------|");
    const beforeCell = comp.beforeUrl
      ? `![Before](${comp.beforeUrl})`
      : "*not present*";
    const afterCell = comp.afterUrl
      ? `![After](${comp.afterUrl})`
      : "*not present*";
    const diffCell = comp.diffUrl ? `![Diff](${comp.diffUrl})` : "*no diff*";
    lines.push(`| ${beforeCell} | ${afterCell} | ${diffCell} |`);
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

  console.log("Discovering components from docs sites...");
  const [beforeComponents, afterComponents] = await Promise.all([
    discoverComponents(beforeUrl),
    discoverComponents(afterUrl),
  ]);
  const allComponents = Array.from(
    new Map(
      [...beforeComponents, ...afterComponents].map((component) => [
        component.id,
        component,
      ]),
    ).values(),
  );
  console.log(`Found ${allComponents.length} components\n`);

  let components: DiscoveredComponent[];

  if (fullRegression) {
    components = allComponents;
    console.log(
      `Running full visual regression (${components.length} components)...\n`,
    );
  } else {
    const changedFiles = await getChangedFiles();

    // If changed-file lookup failed, run the full regression to be safe.
    if (changedFiles === null) {
      components = allComponents;
      console.log(
        `Running full visual regression (${components.length} components, changed files unavailable)...\n`,
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
        components = allComponents;
        const broadFiles = changedFiles.filter((f) => !getComponentFromFile(f));
        console.log("Broad-impact files changed (running full regression):");
        broadFiles.slice(0, 10).forEach((f) => console.log(`  - ${f}`));
        if (broadFiles.length > 10) {
          console.log(`  ... and ${broadFiles.length - 10} more`);
        }
        console.log(
          `\nRunning full regression on ${components.length} page(s):\n`,
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

  const beforeDir = join(SCREENSHOTS_DIR, "before");
  const afterDir = join(SCREENSHOTS_DIR, "after");
  const storagePrefix = getRunStoragePrefix();

  console.log("=== Capturing BEFORE screenshots ===");
  const selectedIds = new Set(components.map((component) => component.id));
  const beforeCaptureComponents = beforeComponents.filter((component) =>
    selectedIds.has(component.id),
  );
  const afterCaptureComponents = afterComponents.filter((component) =>
    selectedIds.has(component.id),
  );
  const beforeScreenshots = await captureScreenshots(
    beforeUrl,
    beforeCaptureComponents,
    beforeDir,
    "before",
    `${storagePrefix}/before`,
  );

  console.log("\n=== Capturing AFTER screenshots ===");
  const afterScreenshots = await captureScreenshots(
    afterUrl,
    afterCaptureComponents,
    afterDir,
    "after",
    `${storagePrefix}/after`,
  );

  console.log("\n=== Comparing screenshots ===");
  const comparisons: ComparisonResult[] = [];

  const indexScreenshots = (
    screenshots: CapturedScreenshot[],
    label: string,
  ) => {
    const map = new Map<string, CapturedScreenshot>();
    for (const screenshot of screenshots) {
      if (map.has(screenshot.id)) {
        throw new Error(`Duplicate ${label} screenshot id: ${screenshot.id}`);
      }
      map.set(screenshot.id, screenshot);
    }
    return map;
  };
  const beforeMap = indexScreenshots(beforeScreenshots, "before");
  const afterMap = indexScreenshots(afterScreenshots, "after");

  const allIds = Array.from(
    new Set([...Array.from(beforeMap.keys()), ...Array.from(afterMap.keys())]),
  );

  for (const id of allIds) {
    const before = beforeMap.get(id);
    const after = afterMap.get(id);

    if (!before || !after) {
      const screenshot = before ?? after;
      comparisons.push({
        id,
        name: screenshot?.name ?? id,
        beforeUrl: before?.url ?? null,
        afterUrl: after?.url ?? null,
        diffUrl: null,
        kind: before ? "removed" : "added",
        changed: true,
        diffPixels: 0,
        diffPercent: 100,
      });
      console.log(
        `  ${screenshot?.name ?? id}: ${before ? "REMOVED" : "ADDED"}`,
      );
      continue;
    }
    if (!before.url || !after.url) {
      throw new Error(`Screenshot upload missing for ${before.name}`);
    }

    const diff = compareImages(before.path, after.path);

    let diffUrl: string | null = null;
    if (diff.changed && diff.diffImage) {
      const diffFilename = `diff-${id}.png`;
      const diffPath = join(SCREENSHOTS_DIR, "diff", diffFilename);
      ensureDir(join(SCREENSHOTS_DIR, "diff"));
      writeFileSync(diffPath, diff.diffImage);

      try {
        diffUrl = await uploadScreenshotToWorker(
          diff.diffImage,
          `${storagePrefix}/diff/${diffFilename}`,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  Diff upload failed for ${before.name}: ${msg}`);
      }
    }

    comparisons.push({
      id,
      name: before.name,
      beforeUrl: before.url,
      afterUrl: after.url,
      diffUrl,
      kind: "modified",
      changed: diff.changed,
      diffPixels: diff.diffPixels,
      diffPercent: diff.diffPercent,
    });

    if (diff.changed) {
      console.log(
        `  ${before.name}: CHANGED (${diff.diffPixels} px, ${diff.diffPercent}%)`,
      );
    } else {
      console.log(`  ${before.name}: unchanged`);
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
