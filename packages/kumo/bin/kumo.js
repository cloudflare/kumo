#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const distCliPath = path.resolve(__dirname, "../dist/command-line/cli.js");
  if (existsSync(distCliPath)) {
    await import(pathToFileURL(distCliPath).href);
    return;
  }

  // In a repo checkout, the CLI may not be built yet. If `tsx` is available,
  // run the TypeScript entrypoint directly.
  const srcCliPath = path.resolve(__dirname, "../src/command-line/cli.ts");
  if (existsSync(srcCliPath)) {
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", srcCliPath, ...process.argv.slice(2)],
      { stdio: "inherit" },
    );

    process.exit(result.status ?? 1);
  }

  console.error(
    "Kumo CLI entrypoint not found. If you're in the repo, run: pnpm --filter @cloudflare/kumo build",
  );
  process.exit(1);
}

main();
