import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, it } from "node:test";
import { getChangedFiles, getNewlyAddedFiles } from "./git-operations";

const temporaryDirectories: string[] = [];

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function writeFile(repository: string, path: string, content: string): void {
  const absolutePath = join(repository, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
}

function createRepositoryWithStaleMergeRef(): {
  repository: string;
  mergeRef: string;
} {
  const directory = mkdtempSync(join(tmpdir(), "kumo-git-operations-"));
  temporaryDirectories.push(directory);

  const remote = join(directory, "remote.git");
  const repository = join(directory, "repository");
  mkdirSync(repository);
  git(directory, "init", "--bare", remote);
  git(repository, "init", "--initial-branch=main");
  git(repository, "config", "user.email", "test@example.com");
  git(repository, "config", "user.name", "Test User");
  git(repository, "remote", "add", "origin", remote);

  writeFile(repository, "README.md", "initial\n");
  git(repository, "add", "README.md");
  git(repository, "commit", "-m", "initial");
  git(repository, "push", "-u", "origin", "main");

  git(repository, "checkout", "-b", "fork-feature");
  writeFile(repository, "ci/pr-change.ts", "export {};\n");
  git(repository, "add", "ci/pr-change.ts");
  git(repository, "commit", "-m", "PR change");

  git(repository, "checkout", "-b", "pull-request-merge", "main");
  git(repository, "merge", "--no-ff", "fork-feature", "-m", "PR merge");
  const mergeRef = git(repository, "rev-parse", "HEAD");

  git(repository, "checkout", "main");
  writeFile(repository, "packages/kumo/src/new-on-main.ts", "export {};\n");
  writeFile(
    repository,
    ".changeset/new-on-main.md",
    '---\n"@cloudflare/kumo": patch\n---\n\nMain change.\n',
  );
  git(repository, "add", "packages/kumo/src/new-on-main.ts");
  git(repository, "add", ".changeset/new-on-main.md");
  git(repository, "commit", "-m", "new main change");
  git(repository, "push", "origin", "main");

  return { repository, mergeRef };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("pull request diffs", () => {
  it("does not attribute newer base-branch changes to a stale merge ref", () => {
    const { repository, mergeRef } = createRepositoryWithStaleMergeRef();
    const previousEnvironment = {
      CI: process.env.CI,
      GITHUB_ACTIONS: process.env.GITHUB_ACTIONS,
      GITHUB_BASE_REF: process.env.GITHUB_BASE_REF,
      GITHUB_HEAD_REF: process.env.GITHUB_HEAD_REF,
      GITHUB_SHA: process.env.GITHUB_SHA,
    };

    Object.assign(process.env, {
      CI: "true",
      GITHUB_ACTIONS: "true",
      GITHUB_BASE_REF: "main",
      GITHUB_HEAD_REF: "fork-feature-not-locally-available",
      GITHUB_SHA: mergeRef,
    });

    try {
      assert.deepEqual(getChangedFiles({ cwd: repository }), [
        "ci/pr-change.ts",
      ]);
      assert.deepEqual(
        getChangedFiles({ cwd: repository, filterPath: "packages/kumo" }),
        [],
      );
      assert.deepEqual(
        getNewlyAddedFiles(".changeset", { cwd: repository }),
        [],
      );
    } finally {
      for (const [name, value] of Object.entries(previousEnvironment)) {
        if (value === undefined) {
          delete process.env[name];
        } else {
          process.env[name] = value;
        }
      }
    }
  });
});
