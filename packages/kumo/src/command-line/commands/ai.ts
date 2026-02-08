#!/usr/bin/env node
/**
 * Output AI usage guide for @cloudflare/kumo
 * Usage: kumo ai
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Print the AI usage guide to stdout
 */
export function ai(): void {
  // Resolve from commands/ -> command-line/ -> src/ -> packages/kumo/
  const packageRoot = join(__dirname, "../../..");
  const usagePath = join(packageRoot, "ai", "USAGE.md");

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
