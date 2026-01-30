#!/usr/bin/env node
/**
 * Kumo Token Migration Tool
 *
 * Complete migration workflow:
 * 1. Renames Tailwind classes in source files (bg-surface -> bg-kumo-base)
 * 2. Updates config.ts: newName becomes key, newName field becomes ""
 * 3. Regenerates theme CSS with new names
 *
 * Usage:
 *   pnpm migrate:tokens              # Migrate kumo codebase
 *   pnpm migrate:tokens --dry-run    # Preview changes without writing
 *   pnpm migrate:tokens --path /app  # Migrate external project (classes only)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";
import { getTokenRenameMap } from "./generate-css.js";
import { THEME_CONFIG } from "./config.js";
import type { TokenRenameMap } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, "../../../..");
const CONFIG_PATH = path.resolve(__dirname, "config.ts");

interface MigrationOptions {
  rootPath: string;
  include: string[];
  exclude: string[];
  dryRun: boolean;
  verbose: boolean;
  /** If true, also update config.ts after migration */
  updateConfig: boolean;
}

interface FileChange {
  file: string;
  changes: Array<{
    line: number;
    before: string;
    after: string;
  }>;
}

// Tailwind utility prefixes
const COLOR_PREFIXES = [
  "bg",
  "border",
  "border-t",
  "border-r",
  "border-b",
  "border-l",
  "border-x",
  "border-y",
  "ring",
  "ring-offset",
  "outline",
  "divide",
  "shadow",
  "accent",
  "caret",
  "fill",
  "stroke",
  "decoration",
  "from",
  "via",
  "to",
];
const TEXT_PREFIXES = ["text"];

/**
 * Build regex patterns for class replacement
 */
function buildPatterns(renameMap: TokenRenameMap): Array<{
  pattern: RegExp;
  replacement: string;
}> {
  const patterns: Array<{ pattern: RegExp; replacement: string }> = [];

  // Variant prefix: hover:, focus:, sm:, group-hover:, etc.
  const variants = "(?:(?:[a-z0-9-]+:)*)?";
  // Opacity: /50, /[0.5]
  const opacity = "(?:\\/(?:\\d+|\\[[\\.\\d]+\\]))?";

  for (const [oldName, newName] of Object.entries(renameMap.text)) {
    if (!newName) continue; // Skip if no migration planned
    for (const prefix of TEXT_PREFIXES) {
      patterns.push({
        pattern: new RegExp(
          `(${variants})(${prefix}-${escapeRegex(oldName)})(${opacity})(?=\\s|"|'|\`|$|\\))`,
          "g",
        ),
        replacement: `$1${prefix}-${newName}$3`,
      });
    }
  }

  for (const [oldName, newName] of Object.entries(renameMap.color)) {
    if (!newName) continue;
    for (const prefix of COLOR_PREFIXES) {
      patterns.push({
        pattern: new RegExp(
          `(${variants})(${prefix}-${escapeRegex(oldName)})(${opacity})(?=\\s|"|'|\`|$|\\))`,
          "g",
        ),
        replacement: `$1${prefix}-${newName}$3`,
      });
    }
  }

  return patterns;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Migrate a single file's content
 */
function migrateContent(
  content: string,
  patterns: Array<{ pattern: RegExp; replacement: string }>,
): {
  content: string;
  changes: Array<{ line: number; before: string; after: string }>;
} {
  const lines = content.split("\n");
  const changes: Array<{ line: number; before: string; after: string }> = [];

  const updatedLines = lines.map((line, idx) => {
    let updated = line;
    for (const { pattern, replacement } of patterns) {
      pattern.lastIndex = 0;
      updated = updated.replace(pattern, replacement);
    }
    if (updated !== line) {
      changes.push({
        line: idx + 1,
        before: line.trim(),
        after: updated.trim(),
      });
    }
    return updated;
  });

  return { content: updatedLines.join("\n"), changes };
}

/**
 * Simpler approach: rewrite config from scratch based on the data structure
 */
function rewriteConfig(renameMap: TokenRenameMap): string {
  // Read the current config to preserve theme values
  const currentConfig = THEME_CONFIG;

  const lines: string[] = [
    `/**`,
    ` * Kumo Theme Configuration`,
    ` *`,
    ` * Single source of truth for all semantic color tokens.`,
    ` * This config is used to generate:`,
    ` * - theme-kumo.css (base theme)`,
    ` * - theme-fedramp.css (fedramp overrides)`,
    ` * - Any future theme files`,
    ` *`,
    ` * Token naming:`,
    ` * - Key = current token name used in codebase`,
    ` * - newName = future name (empty string = no migration planned)`,
    ` */`,
    ``,
    `import type { ThemeConfig } from "./types.js";`,
    ``,
    `export const THEME_CONFIG: ThemeConfig = {`,
    `  /**`,
    `   * Text color tokens`,
    `   * Used with: text-{token}`,
    `   * CSS variable: --text-color-{token}`,
    `   */`,
    `  text: {`,
  ];

  // Text tokens
  for (const [oldName, def] of Object.entries(currentConfig.text)) {
    const newName = renameMap.text[oldName];
    const finalKey = newName || oldName;

    lines.push(`    "${finalKey}": {`);
    lines.push(`      newName: "",`);
    lines.push(`      theme: {`);

    for (const [themeName, colors] of Object.entries(def.theme)) {
      if (colors) {
        lines.push(`        ${themeName}: {`);
        lines.push(`          light: "${colors.light}",`);
        lines.push(`          dark: "${colors.dark}",`);
        lines.push(`        },`);
      }
    }

    lines.push(`      },`);
    lines.push(`    },`);
  }

  lines.push(`  },`);
  lines.push(``);
  lines.push(`  /**`);
  lines.push(`   * Color tokens`);
  lines.push(`   * Used with: bg-{token}, border-{token}, ring-{token}, etc.`);
  lines.push(`   * CSS variable: --color-{token}`);
  lines.push(`   */`);
  lines.push(`  color: {`);

  // Color tokens
  for (const [oldName, def] of Object.entries(currentConfig.color)) {
    const newName = renameMap.color[oldName];
    const finalKey = newName || oldName;

    lines.push(`    "${finalKey}": {`);
    lines.push(`      newName: "",`);
    lines.push(`      theme: {`);

    for (const [themeName, colors] of Object.entries(def.theme)) {
      if (colors) {
        lines.push(`        ${themeName}: {`);
        lines.push(`          light: "${colors.light}",`);
        lines.push(`          dark: "${colors.dark}",`);
        lines.push(`        },`);
      }
    }

    lines.push(`      },`);
    lines.push(`    },`);
  }

  lines.push(`  },`);
  lines.push(`};`);
  lines.push(``);
  lines.push(`/** List of all available themes */`);
  lines.push(`export const AVAILABLE_THEMES = ["kumo", "fedramp"] as const;`);
  lines.push(`export type AvailableTheme = (typeof AVAILABLE_THEMES)[number];`);
  lines.push(``);

  return lines.join("\n");
}

/**
 * Check if there are any pending migrations
 */
function hasPendingMigrations(renameMap: TokenRenameMap): boolean {
  for (const newName of Object.values(renameMap.text)) {
    if (newName) return true;
  }
  for (const newName of Object.values(renameMap.color)) {
    if (newName) return true;
  }
  return false;
}

/**
 * Run the full migration
 */
async function runMigration(options: MigrationOptions): Promise<{
  fileChanges: FileChange[];
  configUpdated: boolean;
  stats: { files: number; changes: number };
}> {
  const renameMap = getTokenRenameMap(THEME_CONFIG);

  if (!hasPendingMigrations(renameMap)) {
    return {
      fileChanges: [],
      configUpdated: false,
      stats: { files: 0, changes: 0 },
    };
  }

  const patterns = buildPatterns(renameMap);

  // Find files
  const files = await glob(options.include, {
    cwd: options.rootPath,
    ignore: options.exclude,
    absolute: true,
  });

  const fileChanges: FileChange[] = [];
  let totalChanges = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const { content: updated, changes } = migrateContent(content, patterns);

      if (changes.length > 0) {
        fileChanges.push({ file, changes });
        totalChanges += changes.length;

        if (!options.dryRun) {
          fs.writeFileSync(file, updated, "utf-8");
        }
      }
    } catch {
      // Skip files that can't be read (binary, permissions, etc.)
      if (options.verbose) {
        console.warn(`  Skipped: ${file}`);
      }
    }
  }

  // Update config.ts if requested and not dry-run
  let configUpdated = false;
  if (options.updateConfig && !options.dryRun) {
    const newConfig = rewriteConfig(renameMap);
    fs.writeFileSync(CONFIG_PATH, newConfig, "utf-8");
    configUpdated = true;
  }

  return {
    fileChanges,
    configUpdated,
    stats: { files: fileChanges.length, changes: totalChanges },
  };
}

// CLI
function parseArgs(
  args: string[],
): MigrationOptions & { help: boolean; exportMap: boolean } {
  let rootPath = MONOREPO_ROOT;
  let dryRun = false;
  let verbose = false;
  let updateConfig = true;
  let help = false;
  let exportMap = false;
  const include: string[] = [];
  const exclude: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--path" && args[i + 1]) {
      rootPath = path.resolve(args[++i]);
      updateConfig = false; // External projects don't update kumo's config
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--verbose" || arg === "-v") {
      verbose = true;
    } else if (arg === "--no-config") {
      updateConfig = false;
    } else if (arg === "--export-map") {
      exportMap = true;
    } else if (arg === "--help" || arg === "-h") {
      help = true;
    } else if (arg === "--include" && args[i + 1]) {
      include.push(args[++i]);
    } else if (arg === "--exclude" && args[i + 1]) {
      exclude.push(args[++i]);
    }
  }

  const defaultInclude = [
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    "**/*.css",
    "**/*.html",
    "**/*.md",
    "**/*.mdx",
    "**/*.astro",
  ];
  const defaultExclude = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**",
    "**/coverage/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/theme-kumo.css",
    "**/theme-fedramp.css",
    "**/theme-generator/**",
    "**/component-registry.json",
    "**/component-registry.md",
  ];

  return {
    rootPath,
    include: include.length > 0 ? include : defaultInclude,
    exclude: [...defaultExclude, ...exclude],
    dryRun,
    verbose,
    updateConfig,
    help,
    exportMap,
  };
}

function printHelp(): void {
  console.log(`
Kumo Token Migration Tool

Migrates Tailwind classes when token names change. This tool:
1. Updates class names in source files (bg-surface -> bg-kumo-base)
2. Updates config.ts (newName becomes key, newName field cleared)
3. Ready for codegen:themes to regenerate CSS

USAGE:
  pnpm migrate:tokens [options]

OPTIONS:
  --dry-run         Preview changes without writing files
  --verbose, -v     Show detailed change information
  --path <dir>      Migrate external project (won't update config.ts)
  --no-config       Skip config.ts update
  --export-map      Output JSON rename map and exit
  --help, -h        Show this help

WORKFLOW:
  1. Set newName in config.ts for tokens you want to rename
  2. Run: pnpm migrate:tokens --dry-run  (preview)
  3. Run: pnpm migrate:tokens            (apply)
  4. Run: pnpm codegen:themes            (regenerate CSS)
  5. Commit changes

EXAMPLE - Renaming "surface" to "kumo-base":

  Before config.ts:
    surface: { newName: "kumo-base", theme: { ... } }

  After migration:
    "kumo-base": { newName: "", theme: { ... } }

  Class changes:
    bg-surface -> bg-kumo-base
    text-surface -> text-kumo-base
    hover:bg-surface/50 -> hover:bg-kumo-base/50
`);
}

function printExportMap(): void {
  const renameMap = getTokenRenameMap(THEME_CONFIG);
  const classMap: Record<string, string> = {};

  for (const [oldName, newName] of Object.entries(renameMap.text)) {
    if (!newName) continue;
    for (const prefix of TEXT_PREFIXES) {
      classMap[`${prefix}-${oldName}`] = `${prefix}-${newName}`;
    }
  }

  for (const [oldName, newName] of Object.entries(renameMap.color)) {
    if (!newName) continue;
    for (const prefix of COLOR_PREFIXES) {
      classMap[`${prefix}-${oldName}`] = `${prefix}-${newName}`;
    }
  }

  console.log(
    JSON.stringify(
      {
        meta: {
          description: "Kumo token migration map",
          generatedAt: new Date().toISOString(),
        },
        tokens: renameMap,
        classes: classMap,
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (options.exportMap) {
    printExportMap();
    return;
  }

  const renameMap = getTokenRenameMap(THEME_CONFIG);

  if (!hasPendingMigrations(renameMap)) {
    console.log("No pending migrations. All newName fields are empty.");
    console.log("\nTo migrate tokens, set newName in config.ts:");
    console.log('  surface: { newName: "kumo-base", theme: { ... } }');
    return;
  }

  console.log("Kumo Token Migration\n");
  console.log(`Root:        ${options.rootPath}`);
  console.log(`Dry run:     ${options.dryRun}`);
  console.log(`Update config: ${options.updateConfig}`);
  console.log("");

  // Show what will be renamed
  console.log("Pending renames:");
  for (const [old, newName] of Object.entries(renameMap.text)) {
    if (newName) console.log(`  text-${old} -> text-${newName}`);
  }
  for (const [old, newName] of Object.entries(renameMap.color)) {
    if (newName)
      console.log(`  bg-${old} -> bg-${newName} (and border-, ring-, etc.)`);
  }
  console.log("");

  const { fileChanges, configUpdated, stats } = await runMigration(options);

  if (fileChanges.length === 0) {
    console.log("No class usages found to migrate.");
  } else {
    console.log(`\n${"=".repeat(60)}`);
    console.log(options.dryRun ? "PREVIEW (dry run)" : "MIGRATION COMPLETE");
    console.log("=".repeat(60));

    for (const { file, changes } of fileChanges) {
      console.log(`\n${file}`);
      if (options.verbose) {
        for (const c of changes) {
          console.log(`  L${c.line}: ${c.before}`);
          console.log(`      -> ${c.after}`);
        }
      } else {
        console.log(`  ${changes.length} change(s)`);
      }
    }

    console.log(`\n${"-".repeat(60)}`);
    console.log(`Files changed:  ${stats.files}`);
    console.log(`Total changes:  ${stats.changes}`);
    if (configUpdated) {
      console.log(`Config updated: ${CONFIG_PATH}`);
    }
    console.log("-".repeat(60));
  }

  if (options.dryRun) {
    console.log(
      "\nThis was a dry run. Run without --dry-run to apply changes.",
    );
  } else if (configUpdated) {
    console.log("\nNext step: pnpm codegen:themes");
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

export { runMigration, buildPatterns, migrateContent, rewriteConfig };
