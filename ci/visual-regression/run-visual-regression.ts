#!/usr/bin/env tsx
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

const WORKER_URL =
  process.env.SCREENSHOT_WORKER_URL ??
  "https://kumo-screenshot-worker.design-engineering.workers.dev";
const SCREENSHOTS_DIR = "ci/visual-regression/screenshots";
const API_KEY = process.env.SCREENSHOT_API_KEY ?? "";

interface ScreenshotResult {
  url: string;
  image: string;
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
  path: string;
  url: string | null;
}

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

function getChangedFiles(): string[] | null {
  try {
    const base = process.env.GITHUB_BASE_REF || "main";
    const output = execSync(`git diff --name-only origin/${base}...HEAD`, {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`git diff failed, falling back to full regression: ${msg}`);
    return null;
  }
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function uploadImageToGitHub(
  imageBuffer: Buffer,
  filename: string,
): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY ?? "cloudflare/kumo";
  const prNumber = process.env.GITHUB_PR_NUMBER ?? process.env.PR_NUMBER;
  const runId = process.env.GITHUB_RUN_ID ?? Date.now().toString();

  if (!token) {
    throw new Error("GITHUB_TOKEN required for image upload");
  }

  const [owner, repoName] = repo.split("/");
  const branch = `vr-screenshots-${prNumber}-${runId}`;
  const path = `screenshots/${filename}`;

  const mainRef = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/main`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );
  if (!mainRef.ok) {
    throw new Error(
      `Failed to get main ref: ${mainRef.status} ${await mainRef.text()}`,
    );
  }
  const mainData = (await mainRef.json()) as { object: { sha: string } };
  const baseSha = mainData.object.sha;

  const refCheck = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );

  if (refCheck.status === 404) {
    const createRef = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/git/refs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${branch}`,
          sha: baseSha,
        }),
      },
    );
    if (!createRef.ok) {
      throw new Error(
        `Failed to create branch ${branch}: ${createRef.status} ${await createRef.text()}`,
      );
    }
  }

  const content = imageBuffer.toString("base64");

  const existingFile = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );

  const existingData = existingFile.ok
    ? ((await existingFile.json()) as { sha?: string })
    : null;

  const upload = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Visual regression: ${filename}`,
        content,
        branch,
        ...(existingData?.sha ? { sha: existingData.sha } : {}),
      }),
    },
  );
  if (!upload.ok) {
    throw new Error(
      `Failed to upload ${filename}: ${upload.status} ${await upload.text()}`,
    );
  }

  return `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${path}`;
}

interface PageRequest {
  url: string;
  captureSections: boolean;
  hideSidebar: boolean;
  actions?: Array<{ type: string; selector: string; waitAfter?: number }>;
}

async function captureScreenshots(
  baseUrl: string,
  components: DiscoveredComponent[],
  outputDir: string,
  prefix: string,
): Promise<CapturedScreenshot[]> {
  ensureDir(outputDir);
  const screenshots: CapturedScreenshot[] = [];

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
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Worker request failed: ${response.status} - ${text}`);
  }

  const data = (await response.json()) as WorkerResponse;

  for (const result of data.results) {
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
      (r) =>
        r.url === urlPath.replace(/\/$/, "") &&
        r.actions &&
        r.actions.length > 0,
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

    const filename = `${prefix}-${screenshotId}.png`;
    const filepath = join(outputDir, filename);

    const imageBuffer = Buffer.from(result.image, "base64");
    writeFileSync(filepath, imageBuffer);

    let imageUrl: string | null = null;
    try {
      imageUrl = await uploadImageToGitHub(imageBuffer, filename);
      console.log(`  OK: ${screenshotName} -> ${imageUrl}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("GITHUB_TOKEN required")) {
        console.log(`  OK: ${screenshotName} (local only, no GITHUB_TOKEN)`);
      } else {
        console.error(`  Upload failed for ${screenshotName}: ${msg}`);
      }
    }

    screenshots.push({
      id: screenshotId,
      name: screenshotName,
      path: filepath,
      url: imageUrl,
    });
  }

  return screenshots;
}

function formatName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface DiffResult {
  changed: boolean;
  diffPixels: number;
  diffPercent: number;
  /** Raw PNG buffer of the diff image, null if images are identical or missing */
  diffImage: Buffer | null;
}

function compareImages(beforePath: string, afterPath: string): DiffResult {
  if (!existsSync(beforePath) || !existsSync(afterPath)) {
    return { changed: true, diffPixels: 0, diffPercent: 100, diffImage: null };
  }

  const beforeBuf = readFileSync(beforePath);
  const afterBuf = readFileSync(afterPath);

  // Fast path: byte-identical images need no pixel comparison
  if (beforeBuf.equals(afterBuf)) {
    return { changed: false, diffPixels: 0, diffPercent: 0, diffImage: null };
  }

  const beforePng = PNG.sync.read(beforeBuf);
  const afterPng = PNG.sync.read(afterBuf);

  // Handle size mismatches by padding the smaller image
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
    {
      threshold: 0.1,
      diffColor: [255, 0, 0],
      alpha: 0.3,
    },
  );

  const totalPixels = width * height;
  const diffPercent = totalPixels > 0 ? (diffPixels / totalPixels) * 100 : 0;

  const diffPng = new PNG({ width, height });
  diffPng.data = Buffer.from(diffData);
  const diffImage = PNG.sync.write(diffPng);

  return {
    changed: true,
    diffPixels,
    diffPercent: Math.round(diffPercent * 100) / 100,
    diffImage,
  };
}

function generateMarkdownReport(comparisons: ComparisonResult[]): string {
  const changed = comparisons.filter((c) => c.changed);
  const unchanged = comparisons.filter((c) => !c.changed);

  const lines: string[] = [
    "<!-- kumo-visual-regression -->",
    "## Visual Regression Report",
    "",
  ];

  if (changed.length === 0) {
    lines.push("No visual changes detected.");
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

  const beforeDir = join(SCREENSHOTS_DIR, "before");
  const afterDir = join(SCREENSHOTS_DIR, "after");

  console.log("=== Capturing BEFORE screenshots ===");
  const beforeScreenshots = await captureScreenshots(
    beforeUrl,
    components,
    beforeDir,
    "before",
  );

  console.log("\n=== Capturing AFTER screenshots ===");
  const afterScreenshots = await captureScreenshots(
    afterUrl,
    components,
    afterDir,
    "after",
  );

  console.log("\n=== Comparing screenshots ===");
  const comparisons: ComparisonResult[] = [];

  const beforeMap = new Map(beforeScreenshots.map((s) => [s.id, s]));
  const afterMap = new Map(afterScreenshots.map((s) => [s.id, s]));

  const allIds = Array.from(
    new Set([...Array.from(beforeMap.keys()), ...Array.from(afterMap.keys())]),
  );

  for (const id of allIds) {
    const before = beforeMap.get(id);
    const after = afterMap.get(id);

    if (!before || !after) continue;
    if (!before.url || !after.url) {
      console.log(
        `  ${before?.name || after?.name || id}: skipped (upload failed)`,
      );
      continue;
    }

    const diff = compareImages(before.path, after.path);

    let diffUrl: string | null = null;
    if (diff.changed && diff.diffImage) {
      const diffFilename = `diff-${id}.png`;
      const diffPath = join(SCREENSHOTS_DIR, "diff", diffFilename);
      ensureDir(join(SCREENSHOTS_DIR, "diff"));
      writeFileSync(diffPath, diff.diffImage);

      try {
        diffUrl = await uploadImageToGitHub(diff.diffImage, diffFilename);
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
