import { execSync, execFileSync } from "child_process";

/**
 * Git operations utility for CI scripts
 * Provides reusable functions for working with Git refs and file changes
 */

export interface GitRefs {
  baseRef: string | undefined;
  headRef: string;
}

export interface ChangedFilesOptions {
  /** Base directory to filter files by (e.g., 'packages/kumo') */
  filterPath?: string;
  /** Working directory for git commands */
  cwd?: string;
}

/**
 * Gets the base and head refs for the current CI context
 * Uses GitHub Actions variables with fallback for shallow clones
 */
export function getGitRefs(): GitRefs {
  // GitHub Actions provides these environment variables
  const baseRef = process.env.GITHUB_BASE_REF;
  const headRef = process.env.GITHUB_HEAD_REF || process.env.GITHUB_SHA || "HEAD";

  // If baseRef exists (PR context), verify it's available
  if (baseRef) {
    try {
      // Fetch the base branch for comparison
      execSync(`git fetch origin ${baseRef}:refs/remotes/origin/${baseRef}`, {
        encoding: "utf8",
        stdio: "pipe",
      });
      const fallbackRef = `origin/${baseRef}`;
      console.log(`Using base ref: ${fallbackRef}`);
      return { baseRef: fallbackRef, headRef };
    } catch (error) {
      console.warn(
        `  Could not fetch base branch ${baseRef}: ${error}`,
      );
    }
  }

  // Local development fallback: use merge-base with origin/main
  // This ensures we only see changes introduced by the branch, not changes on main
  if (!process.env.CI && !process.env.GITHUB_ACTIONS) {
    // First verify origin/main exists
    try {
      execSync("git rev-parse --verify origin/main", {
        encoding: "utf8",
        stdio: "pipe",
      });
    } catch {
      console.error(
        "  Error: origin/main ref not found. Please fetch the main branch:",
      );
      console.error("   git fetch origin main");
      return { baseRef: undefined, headRef: "HEAD" };
    }

    // Try to find merge-base
    try {
      const mergeBase = execSync("git merge-base origin/main HEAD", {
        encoding: "utf8",
        stdio: "pipe",
      }).trim();
      console.log(
        `Using local fallback ref (merge-base): ${mergeBase.slice(0, 8)}`,
      );
      return { baseRef: mergeBase, headRef: "HEAD" };
    } catch {
      // Merge-base failed (e.g., no common ancestor), use origin/main directly
      console.log("Using local fallback ref: origin/main");
      return { baseRef: "origin/main", headRef: "HEAD" };
    }
  }

  return { baseRef, headRef };
}

/**
 * Gets the list of changed files between base and head refs
 * Returns an array of file paths, or null if no changes found
 */
export function getChangedFiles(
  options: ChangedFilesOptions = {},
): string[] | null {
  try {
    const { baseRef, headRef } = getGitRefs();

    if (!baseRef) {
      console.warn(
        "  Warning: Could not determine base ref for file changes",
      );
      return null;
    }

    // Use two-dot diff for shallow clones (no merge base needed)
    // Two dots compares the tips directly: baseRef..headRef
    const changedFiles = execSync(
      `git diff --name-only ${baseRef}..${headRef}`,
      {
        encoding: "utf8",
        cwd: options.cwd || process.cwd(),
      },
    ).trim();

    if (!changedFiles) {
      return [];
    }

    const files = changedFiles.split("\n");

    // Apply path filter if specified
    if (options.filterPath) {
      return files.filter((file) => file.startsWith(`${options.filterPath}/`));
    }

    return files;
  } catch (error) {
    console.warn("  Warning: Could not get changed files");
    console.warn(`Error: ${error}`);
    return null;
  }
}

/**
 * Checks if any files have changed in a specific directory path
 * Returns true if changes exist, false if no changes, null if unable to determine
 */
export function hasChangesInPath(
  path: string,
  options: Omit<ChangedFilesOptions, "filterPath"> = {},
): boolean | null {
  const changedFiles = getChangedFiles({ ...options, filterPath: path });

  if (changedFiles === null) {
    return null; // Unable to determine
  }

  return changedFiles.length > 0;
}

/**
 * Gets newly added files in a specific directory between base and head refs
 * Returns file paths with their status (A = Added, M = Modified, D = Deleted, etc.)
 */
export function getNewlyAddedFiles(
  directory: string,
  options: ChangedFilesOptions = {},
): Array<{ status: string; path: string }> {
  try {
    const { baseRef, headRef } = getGitRefs();

    if (!baseRef) {
      console.warn(
        "Warning: Could not determine base ref for newly added files",
      );
      return [];
    }

    // Use execFileSync with array arguments to prevent command injection
    // This passes arguments directly to git without shell interpretation
    // Use two-dot diff for shallow clones (no merge base needed)
    const newFiles = execFileSync(
      "git",
      ["diff", "--name-status", `${baseRef}..${headRef}`, "--", directory],
      {
        encoding: "utf8",
        cwd: options.cwd || process.cwd(),
      },
    ).trim();

    if (!newFiles) {
      return [];
    }

    const files: Array<{ status: string; path: string }> = [];
    const lines = newFiles.split("\n");

    for (const line of lines) {
      const [status, filePath] = line.split("\t");
      if (status && filePath) {
        files.push({ status, path: filePath });
      }
    }

    return files;
  } catch (error) {
    console.warn("Warning: Could not get newly added files");
    console.warn(`Error: ${error}`);
    return [];
  }
}

/**
 * Checks if we're running in a pull request context
 * Supports multiple detection methods for different CI scenarios
 */
export function isPullRequestContext(): boolean {
  // Check if we're in a pull request context
  // GitHub Actions detection:
  // 1. GITHUB_EVENT_NAME === 'pull_request' or 'pull_request_target'
  // 2. GITHUB_PR_NUMBER is set
  // 3. Manual override: CI_FORCE_PR_VALIDATION === 'true'
  return (
    process.env.GITHUB_EVENT_NAME === "pull_request" ||
    process.env.GITHUB_EVENT_NAME === "pull_request_target" ||
    process.env.GITHUB_PR_NUMBER !== undefined ||
    process.env.CI_FORCE_PR_VALIDATION === "true"
  );
}

/**
 * Logs the detected pull request context for transparency
 */
export function logPullRequestContext(): void {
  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    console.log("Detected PR context: Pull request event");
  } else if (process.env.GITHUB_EVENT_NAME === "pull_request_target") {
    console.log("Detected PR context: Pull request target event");
  } else if (process.env.GITHUB_PR_NUMBER) {
    console.log(
      `Detected PR context: PR #${process.env.GITHUB_PR_NUMBER}`,
    );
  } else if (process.env.CI_FORCE_PR_VALIDATION === "true") {
    console.log("Detected PR context: Manual validation override");
  }
}


