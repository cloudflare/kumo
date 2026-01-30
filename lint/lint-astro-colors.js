#!/usr/bin/env node
/**
 * Lint .astro template sections for invalid color tokens.
 *
 * Oxlint only processes <script> blocks in .astro files, not the template HTML.
 * This script fills that gap by checking class attributes in the template section.
 *
 * Checks for:
 * 1. Tailwind primitive colors (e.g., bg-blue-500, text-gray-900)
 * 2. Invalid/unknown semantic tokens not defined in theme-kumo.css
 *
 * Usage:
 *   node lint/lint-astro-colors.js [directory]
 *   node lint/lint-astro-colors.js packages/kumo-docs-astro/src
 *
 * Exit codes:
 *   0 - No issues found
 *   1 - Issues found
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve, relative, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================================
// Token validation logic (synced with no-primitive-colors.js)
// ============================================================================

const TOKEN_RE =
  /(?:^|[^a-zA-Z0-9-])(((?:[a-z-]+:)*)?(?:bg|border|text|ring(?:-offset)?|fill|stroke|placeholder|caret|accent|decoration|divide|outline|from|via|to)-([a-z][a-z0-9-]*)(?:-\d{2,3})?(?:\/[0-9]{1,3})?)/gim;

const TAILWIND_COLOR_FAMILIES = new Set([
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
]);

const BUILTIN_COLORS = new Set(["white", "black"]);

const NON_COLOR_UTILITIES = new Set([
  "xs",
  "sm",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "left",
  "center",
  "right",
  "justify",
  "wrap",
  "nowrap",
  "balance",
  "pretty",
  "ellipsis",
  "clip",
  "transparent",
  "current",
  "inherit",
  "none",
  "0",
  "2",
  "4",
  "8",
  "t",
  "r",
  "b",
  "l",
  "x",
  "y",
  "solid",
  "dashed",
  "dotted",
  "double",
  "hidden",
  "collapse",
  "separate",
  "1",
  "inset",
  "inner",
]);

const NON_COLOR_PATTERNS = [
  /^linear-to-[trbl]{1,2}$/,
  /^[trblxy]-\d+$/,
  /^offset-\d+$/,
  /^\d+$/,
  /^clip-.+$/,
];

const COLOR_PREFIXES = new Set([
  "bg",
  "border",
  "ring",
  "ring-offset",
  "fill",
  "stroke",
  "placeholder",
  "caret",
  "accent",
  "decoration",
  "divide",
  "outline",
  "from",
  "via",
  "to",
]);

const TEXT_COLOR_PREFIXES = new Set(["text"]);

function parseKumoSemanticColors() {
  const themeFiles = [
    resolve(__dirname, "../packages/kumo/src/styles/theme-kumo.css"),
    resolve(__dirname, "../packages/kumo/src/styles/theme-fedramp.css"),
  ];

  const colorTokens = new Set();
  const textColorTokens = new Set();

  for (const themePath of themeFiles) {
    try {
      const css = readFileSync(themePath, "utf-8");

      const colorPropRe = /--color-([a-z][a-z0-9-]*)(?=\s*:)/gi;
      let match;
      while ((match = colorPropRe.exec(css))) {
        const name = match[1];
        if (/^[a-z]+-\d{2,3}$/.test(name)) continue;
        colorTokens.add(name);
      }

      const textColorPropRe = /--text-color-([a-z][a-z0-9-]*)(?=\s*:)/gi;
      while ((match = textColorPropRe.exec(css))) {
        textColorTokens.add(match[1]);
      }
    } catch {
      // File doesn't exist, skip
    }
  }

  for (const color of BUILTIN_COLORS) {
    colorTokens.add(color);
    textColorTokens.add(color);
  }

  return { colorTokens, textColorTokens };
}

const {
  colorTokens: VALID_COLOR_TOKENS,
  textColorTokens: VALID_TEXT_COLOR_TOKENS,
} = parseKumoSemanticColors();

const VALID_KUMO_SEMANTIC_COLORS = new Set([
  ...VALID_COLOR_TOKENS,
  ...VALID_TEXT_COLOR_TOKENS,
]);

function isNonColorUtility(tokenName) {
  if (NON_COLOR_UTILITIES.has(tokenName)) return true;
  return NON_COLOR_PATTERNS.some((pattern) => pattern.test(tokenName));
}

function findPrimitiveColor(str) {
  if (!str) return null;

  TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = TOKEN_RE.exec(str))) {
    const fullToken = match[1];
    const colorFamily = match[3];

    if (!fullToken || !colorFamily) continue;
    if (VALID_KUMO_SEMANTIC_COLORS.has(colorFamily)) continue;
    if (colorFamily.startsWith("kumo-"))
      return { type: "primitive", token: fullToken };

    const primitiveFamily = colorFamily.replace(/-\d+$/, "");
    if (
      TAILWIND_COLOR_FAMILIES.has(primitiveFamily) &&
      !VALID_KUMO_SEMANTIC_COLORS.has(colorFamily)
    ) {
      return { type: "primitive", token: fullToken };
    }
  }

  return null;
}

function findInvalidToken(str) {
  if (!str) return null;

  TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = TOKEN_RE.exec(str))) {
    const fullToken = match[1];
    const colorFamily = match[3];

    if (!fullToken || !colorFamily) continue;
    if (isNonColorUtility(colorFamily)) continue;
    if (colorFamily.startsWith("[")) continue;

    const prefixMatch = fullToken.match(
      /^(?:[a-z-]+:)*(bg|border|text|ring(?:-offset)?|fill|stroke|placeholder|caret|accent|decoration|divide|outline|from|via|to)-/i,
    );
    if (!prefixMatch) continue;

    const prefix = prefixMatch[1].toLowerCase();
    const tokenName = colorFamily.replace(/\/\d+$/, "");

    if (isNonColorUtility(tokenName)) continue;

    if (TEXT_COLOR_PREFIXES.has(prefix)) {
      if (
        !VALID_TEXT_COLOR_TOKENS.has(tokenName) &&
        !BUILTIN_COLORS.has(tokenName)
      ) {
        const primitiveFamily = tokenName.replace(/-\d+$/, "");
        if (!TAILWIND_COLOR_FAMILIES.has(primitiveFamily)) {
          return { type: "invalid", token: fullToken, tokenName };
        }
      }
    } else if (COLOR_PREFIXES.has(prefix)) {
      if (
        !VALID_COLOR_TOKENS.has(tokenName) &&
        !BUILTIN_COLORS.has(tokenName)
      ) {
        const primitiveFamily = tokenName.replace(/-\d+$/, "");
        if (!TAILWIND_COLOR_FAMILIES.has(primitiveFamily)) {
          return { type: "invalid", token: fullToken, tokenName };
        }
      }
    }
  }

  return null;
}

// ============================================================================
// Astro file processing
// ============================================================================

/**
 * Extract template section from astro file (everything after the --- frontmatter)
 */
function extractTemplateSection(content) {
  // Astro frontmatter is between --- markers at the start
  const frontmatterEnd = content.indexOf("---", 3);
  if (frontmatterEnd === -1) return { template: content, offset: 0 };

  const templateStart = frontmatterEnd + 3;
  return {
    template: content.slice(templateStart),
    offset: content.slice(0, templateStart).split("\n").length - 1,
  };
}

/**
 * Extract class attribute values from template content
 */
function extractClassAttributes(template, lineOffset) {
  const results = [];
  const classAttrRe = /(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match;

  while ((match = classAttrRe.exec(template))) {
    const value = match[1] || match[2];
    if (value) {
      const beforeMatch = template.slice(0, match.index);
      const lineNumber =
        (beforeMatch.match(/\n/g) || []).length + 1 + lineOffset;
      results.push({ value, line: lineNumber });
    }
  }

  return results;
}

/**
 * Lint a single file for color token issues
 */
function lintFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const { template, offset } = extractTemplateSection(content);
  const classAttrs = extractClassAttributes(template, offset);
  const issues = [];

  for (const { value, line } of classAttrs) {
    const primitive = findPrimitiveColor(value);
    if (primitive) {
      issues.push({
        line,
        type: "primitive",
        token: primitive.token,
        message: `Avoid Tailwind primitive color '${primitive.token}'. Use Kumo semantic tokens instead.`,
      });
      continue;
    }

    const invalid = findInvalidToken(value);
    if (invalid) {
      issues.push({
        line,
        type: "invalid",
        token: invalid.token,
        tokenName: invalid.tokenName,
        message: `Invalid color token '${invalid.token}'. Token '${invalid.tokenName}' is not defined in theme-kumo.css.`,
      });
    }
  }

  return issues;
}

/**
 * Recursively find all .astro files in a directory
 */
function findAstroFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        if (!entry.startsWith(".") && entry !== "node_modules") {
          walk(fullPath);
        }
      } else if (entry.endsWith(".astro")) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const targetDir = args[0] || "packages/kumo-docs-astro/src";
  const rootDir = resolve(__dirname, "..");
  // Resolve relative to cwd if provided, otherwise relative to repo root
  const absoluteTarget = args[0]
    ? resolve(process.cwd(), targetDir)
    : resolve(rootDir, targetDir);

  console.log(`\nLinting .astro template sections in: ${targetDir}\n`);

  const astroFiles = findAstroFiles(absoluteTarget);

  if (astroFiles.length === 0) {
    console.log("No .astro files found.");
    process.exit(0);
  }

  let totalIssues = 0;
  const fileIssues = [];

  for (const filePath of astroFiles) {
    const issues = lintFile(filePath);
    if (issues.length > 0) {
      const relPath = relative(rootDir, filePath);
      fileIssues.push({ path: relPath, issues });
      totalIssues += issues.length;
    }
  }

  if (totalIssues === 0) {
    console.log(
      `✓ ${astroFiles.length} .astro files checked. No color token issues found.\n`,
    );
    process.exit(0);
  }

  // Print issues in oxlint-like format
  for (const { path, issues } of fileIssues) {
    for (const issue of issues) {
      const symbol = issue.type === "primitive" ? "×" : "×";
      console.log(
        `  ${symbol} kumo/${issue.type === "primitive" ? "no-primitive-colors" : "invalid-color-token"}: ${issue.message}`,
      );
      console.log(`   ╭─[${path}:${issue.line}]`);
      console.log(`   ╰────`);
      console.log();
    }
  }

  console.log(
    `Found ${totalIssues} issue${totalIssues === 1 ? "" : "s"} in ${fileIssues.length} file${fileIssues.length === 1 ? "" : "s"}.\n`,
  );

  process.exit(1);
}

main();
