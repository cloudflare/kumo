import { describe, expect, it } from "vite-plus/test";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgDir = join(__dirname, "../..");
const isBuilt = existsSync(join(pkgDir, "dist/index.js"));

// Runs in a plain Node child process — no bundler, no test-runner module
// transforms — the way Jest, Node SSR, and RSC frameworks consume the
// published package. Catches failure modes bundler-based tests mask, e.g.
// bundled-CJS require() calls of externalized modules.
describe.skipIf(!isBuilt)("Node ESM import smoke (post-build)", () => {
  it("every export entry imports cleanly in plain Node", () => {
    const result = spawnSync(
      process.execPath,
      [join(__dirname, "import-entries.mjs"), pkgDir],
      { timeout: 30_000, encoding: "utf-8" },
    );

    expect(result.status, `entries failed to import:\n${result.stderr}`).toBe(
      0,
    );
  });
});
