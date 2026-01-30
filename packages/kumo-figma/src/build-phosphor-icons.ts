#!/usr/bin/env npx tsx
/**
 * Build Phosphor Icons Data
 *
 * Extracts specific Phosphor icons needed by Figma component generators.
 * This runs at BUILD TIME before bundling the plugin.
 *
 * Usage:
 *   pnpm --filter @cloudflare/kumo-figma build:data
 *
 * Output:
 *   packages/kumo-figma/src/generated/phosphor-icons.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Icons used by Figma component generators.
 * Maps our icon IDs (ph-*) to Phosphor icon names.
 */
const REQUIRED_ICONS: Record<string, string> = {
  // DEFAULT_ICONS from icon-utils.ts
  "ph-plus": "plus",
  "ph-arrows-clockwise": "arrows-clockwise",
  "ph-check": "check",
  "ph-minus": "minus",
  "ph-arrow-right": "arrow-right",

  // Navigation icons
  "ph-caret-down": "caret-down",
  "ph-caret-up": "caret-up",
  "ph-caret-left": "caret-left",
  "ph-caret-right": "caret-right",
  "ph-caret-double-left": "caret-double-left",
  "ph-caret-double-right": "caret-double-right",
  "ph-caret-up-down": "caret-up-down",

  // UI icons
  "ph-x": "x",
  "ph-eye": "eye",
  "ph-eye-slash": "eye-slash",
  "ph-clipboard": "clipboard",
  "ph-copy": "copy",
  "ph-trash": "trash",
  "ph-pencil": "pencil",
  "ph-download": "download",
  "ph-share": "share",
  "ph-sign-out": "sign-out",
  "ph-user": "user",
  "ph-gear": "gear",
  "ph-info": "info",
  "ph-warning": "warning",
  "ph-magnifying-glass": "magnifying-glass",
  "ph-house": "house",
  "ph-bell": "bell",
  "ph-database": "database",
  "ph-globe-hemisphere-west": "globe-hemisphere-west",
};

/**
 * Icon data structure for Figma generator
 */
type IconData = {
  id: string;
  viewBox: string;
  content: string;
};

/**
 * Find the @phosphor-icons/core package in node_modules
 */
function findPhosphorCore(): string {
  // Try common locations
  const possiblePaths = [
    // pnpm structure
    join(
      __dirname,
      "../../../node_modules/.pnpm/@phosphor-icons+core@2.1.1/node_modules/@phosphor-icons/core",
    ),
    // Standard node_modules
    join(__dirname, "../../node_modules/@phosphor-icons/core"),
    join(__dirname, "../node_modules/@phosphor-icons/core"),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  throw new Error(
    "@phosphor-icons/core not found. Run: pnpm add -D @phosphor-icons/core --filter @cloudflare/kumo-figma",
  );
}

/**
 * Parse SVG content to extract viewBox and inner content
 */
function parseSvg(
  svgContent: string,
): { viewBox: string; content: string } | null {
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const contentMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);

  if (!viewBoxMatch || !contentMatch) {
    return null;
  }

  return {
    viewBox: viewBoxMatch[1],
    content: contentMatch[1].trim(),
  };
}

// Main execution
console.log("📖 Building Phosphor icons data...");

const phosphorPath = findPhosphorCore();
const assetsPath = join(phosphorPath, "assets/regular");

console.log(`✅ Found @phosphor-icons/core at ${phosphorPath}`);

const icons: IconData[] = [];
const missingIcons: string[] = [];

for (const [iconId, phosphorName] of Object.entries(REQUIRED_ICONS)) {
  const svgPath = join(assetsPath, `${phosphorName}.svg`);

  if (!existsSync(svgPath)) {
    console.warn(`⚠️  Missing icon: ${phosphorName} (${iconId})`);
    missingIcons.push(iconId);
    continue;
  }

  const svgContent = readFileSync(svgPath, "utf-8");
  const parsed = parseSvg(svgContent);

  if (!parsed) {
    console.warn(`⚠️  Failed to parse: ${phosphorName}`);
    missingIcons.push(iconId);
    continue;
  }

  icons.push({
    id: iconId,
    viewBox: parsed.viewBox,
    content: parsed.content,
  });
}

console.log(`✅ Extracted ${icons.length} icons`);

if (missingIcons.length > 0) {
  console.warn(`⚠️  Missing icons: ${missingIcons.join(", ")}`);
}

// Ensure generated directory exists
const generatedDir = join(__dirname, "generated");
mkdirSync(generatedDir, { recursive: true });

// Write icon data as JSON
const outputPath = join(generatedDir, "phosphor-icons.json");
writeFileSync(outputPath, JSON.stringify(icons, null, 2));

console.log(`✅ Wrote ${outputPath}`);
