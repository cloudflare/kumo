#!/usr/bin/env node
/**
 * Output AI usage guide for @cloudflare/kumo
 * Usage: kumo ai
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Print the AI usage guide to stdout
 */
export function ai(): void {
  // When bundled into dist/command-line/cli.js, go up 2 levels to reach packages/kumo/
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const usagePath = join(__dirname, "..", "..", "ai", "USAGE.md");

  try {
    const content = readFileSync(usagePath, "utf-8");
    console.log(content);
  } catch {
    console.error(
      "Could not read ai/USAGE.md. Make sure you are running this from an installed @cloudflare/kumo package.",
    );
    process.exit(1);
  }
}
