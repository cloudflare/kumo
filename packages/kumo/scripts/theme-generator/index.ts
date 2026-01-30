#!/usr/bin/env node
/**
 * Kumo Theme Generator CLI
 *
 * Generates theme CSS files from the centralized configuration.
 *
 * Usage:
 *   pnpm codegen:themes           # Generate all themes
 *   pnpm codegen:themes --list    # List all tokens
 *   pnpm codegen:themes --dry-run # Preview without writing
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateAllThemes,
  listAllTokens,
  getTokenRenameMap,
} from "./generate-css.js";
import { THEME_CONFIG, AVAILABLE_THEMES } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STYLES_DIR = path.resolve(__dirname, "../../src/styles");

function parseArgs(args: string[]) {
  return {
    list: args.includes("--list"),
    dryRun: args.includes("--dry-run"),
    useNewNames: args.includes("--use-new-names"),
    renameMap: args.includes("--rename-map"),
    help: args.includes("--help") || args.includes("-h"),
  };
}

function printHelp() {
  console.log(`
Kumo Theme Generator

Usage:
  tsx scripts/kumo-theme-generator/index.ts [options]

Options:
  --list          List all tokens with their current and new names
  --dry-run       Preview generated CSS without writing files
  --use-new-names Generate CSS using new token names (for migration)
  --rename-map    Output JSON mapping of old names to new names
  --help, -h      Show this help message

Output:
  Generates theme CSS files in src/styles/:
  - theme-kumo.css     Base theme with all tokens
  - theme-fedramp.css  FedRAMP theme overrides
`);
}

function printTokenList() {
  const tokens = listAllTokens(THEME_CONFIG);

  console.log("\n=== Text Tokens ===\n");
  console.log("Current Name".padEnd(25) + "New Name".padEnd(20) + "Themes");
  console.log("-".repeat(60));

  for (const token of tokens.filter((t) => t.type === "text")) {
    console.log(
      token.currentName.padEnd(25) +
        token.newName.padEnd(20) +
        token.themes.join(", "),
    );
  }

  console.log("\n=== Color Tokens ===\n");
  console.log("Current Name".padEnd(25) + "New Name".padEnd(20) + "Themes");
  console.log("-".repeat(60));

  for (const token of tokens.filter((t) => t.type === "color")) {
    console.log(
      token.currentName.padEnd(25) +
        token.newName.padEnd(20) +
        token.themes.join(", "),
    );
  }

  const typographyTokens = tokens.filter((t) => t.type === "typography");
  if (typographyTokens.length > 0) {
    console.log("\n=== Typography Tokens ===\n");
    console.log("Current Name".padEnd(25) + "New Name".padEnd(20) + "Themes");
    console.log("-".repeat(60));

    for (const token of typographyTokens) {
      console.log(
        token.currentName.padEnd(25) +
          token.newName.padEnd(20) +
          token.themes.join(", "),
      );
    }
  }

  console.log(`\nTotal: ${tokens.length} tokens`);
  console.log(`Available themes: ${AVAILABLE_THEMES.join(", ")}`);
}

function printRenameMap() {
  const map = getTokenRenameMap(THEME_CONFIG);
  console.log(JSON.stringify(map, null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.list) {
    printTokenList();
    process.exit(0);
  }

  if (args.renameMap) {
    printRenameMap();
    process.exit(0);
  }

  console.log("Kumo Theme Generator\n");
  console.log(`Output directory: ${STYLES_DIR}`);
  console.log(`Using new names: ${args.useNewNames}`);
  console.log("");

  const files = generateAllThemes({
    outputDir: STYLES_DIR,
    useNewNames: args.useNewNames,
  });

  for (const [filename, content] of files) {
    const filepath = path.join(STYLES_DIR, filename);

    if (args.dryRun) {
      console.log(`\n=== ${filename} ===\n`);
      console.log(content);
    } else {
      fs.writeFileSync(filepath, content, "utf-8");
      console.log(`  Wrote ${filename}`);
    }
  }

  if (!args.dryRun) {
    console.log("\nTheme generation complete!");
    console.log(
      "\nTip: Run with --dry-run to preview changes without writing files",
    );
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
