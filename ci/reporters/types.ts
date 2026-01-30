/**
 * Types for the PR comment reporter system
 *
 * This system collects report items from multiple CI jobs and consolidates
 * them into a single PR comment. Each job outputs a report artifact that
 * is collected by the final reporter job.
 */

import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";

/** Directory where report artifacts are stored */
export const REPORTS_DIR = "ci/reports";

/**
 * A single item to be included in the PR comment
 */
export interface ReportItem {
  /** Unique identifier for this report type (e.g., "npm-release", "kumo-docs-preview") */
  id: string;
  /** Section title displayed in the comment */
  title: string;
  /**
   * Sort order - lower numbers appear first in comment
   * 10-19: release info (npm)
   * 20-29: previews (docs)
   */
  priority: number;
  /** Markdown content for this section */
  content: string;
  /** Whether this item represents a successful operation */
  success: boolean;
}

/**
 * Context available to reporters from CI environment
 */
export interface CIContext {
  /** Full commit SHA */
  commitSha: string;
  /** Short commit SHA (first 8 characters) */
  shortSha: string;
  /** Pull request number */
  prNumber: string;
  /** Repository name (owner/repo) */
  repository: string;
  /** GitHub API token */
  apiToken: string;
  /** Package name being released */
  packageName: string;
  /** Package version being released */
  packageVersion: string;
  /** Kumo docs preview URL (if deployed) */
  kumoDocsPreviewUrl?: string;
  /** Allow additional context to be passed */
  [key: string]: string | undefined;
}

/**
 * Interface for reporter implementations
 */
export interface Reporter {
  /** Unique identifier matching ReportItem.id */
  id: string;
  /** Human-readable name for logging */
  name: string;
  /**
   * Collect report data from the CI context
   * Return null if this reporter should be skipped
   */
  collect(context: CIContext): Promise<ReportItem | null>;
}

/**
 * Build CI context from environment variables
 * Uses GitHub Actions environment variables
 */
export function buildContextFromEnv(): CIContext {
  const commitSha = process.env.GITHUB_SHA ?? "";
  return {
    commitSha,
    shortSha: commitSha.substring(0, 8),
    prNumber: process.env.GITHUB_PR_NUMBER ?? process.env.PR_NUMBER ?? "",
    repository: process.env.GITHUB_REPOSITORY ?? "cloudflare/kumo",
    apiToken: process.env.GITHUB_TOKEN ?? "",
    packageName: process.env.PACKAGE_NAME ?? "@cloudflare/kumo",
    packageVersion: process.env.PACKAGE_VERSION ?? "",
    kumoDocsPreviewUrl: process.env.KUMO_DOCS_PREVIEW_URL,
  };
}

/**
 * Write a report item to the artifacts directory
 * Called by individual CI jobs to output their report data
 */
export function writeReportArtifact(item: ReportItem): void {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }
  const filePath = join(REPORTS_DIR, `${item.id}.json`);
  writeFileSync(filePath, JSON.stringify(item, null, 2));
  console.log(`Report artifact written: ${filePath}`);
}

/**
 * Result of reading report artifacts
 */
export interface ReadReportResult {
  items: ReportItem[];
  failures: string[];
}

/**
 * Read all report artifacts from the artifacts directory
 * Called by the final reporter job to collect all reports
 */
export function readReportArtifacts(): ReadReportResult {
  if (!existsSync(REPORTS_DIR)) {
    return { items: [], failures: [] };
  }

  const files = readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".json"));
  const items: ReportItem[] = [];
  const failures: string[] = [];

  for (const file of files) {
    try {
      const content = readFileSync(join(REPORTS_DIR, file), "utf-8");
      items.push(JSON.parse(content) as ReportItem);
    } catch (error) {
      console.warn(`  Failed to read report artifact: ${file}`, error);
      failures.push(file);
    }
  }

  return { items, failures };
}
