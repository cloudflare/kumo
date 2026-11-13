/**
 * Tests for migrate command
 * Runs the real CLI entrypoint so stdout and stderr are the streams users see.
 * These assume PENDING_MIGRATIONS is empty, its normal state.
 */

import { describe, it, expect } from "vite-plus/test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const cliPath = resolve(__dirname, "../cli.ts");

function runMigrate(...args: string[]) {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", cliPath, "migrate", ...args],
    { encoding: "utf-8" },
  );
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

describe("migrate command", () => {
  it("keeps stdout valid JSON when no migrations are pending", () => {
    const { status, stdout, stderr } = runMigrate();

    expect(status).toBe(0);
    const output = JSON.parse(stdout);
    expect(output.classes).toEqual({});
    expect(output.meta.direction).toBe("to-new");
    expect(stderr).toContain("No pending token migrations.");
  });

  it("prints the status text to stdout for --classes", () => {
    const { status, stdout, stderr } = runMigrate("--classes");

    expect(status).toBe(0);
    expect(stdout).toContain("No pending token migrations.");
    expect(stderr).not.toContain("No pending token migrations.");
  });
});
