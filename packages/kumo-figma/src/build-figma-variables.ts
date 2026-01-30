#!/usr/bin/env npx tsx
/**
 * Build Figma Variables Data
 *
 * Generates figma-variables.json from the theme generator config.
 * This data is used by the Figma plugin to create variable collections at runtime.
 *
 * Source:
 *   packages/kumo/scripts/theme-generator/config.ts
 *
 * Output:
 *   packages/kumo-figma/src/generated/figma-variables.json
 *
 * Usage:
 *   pnpm run build:variables (from packages/kumo-figma)
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { THEME_CONFIG } from "@cloudflare/kumo/scripts/theme-generator/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Color Conversion Utilities
// =============================================================================

/**
 * Convert OKLab to linear sRGB
 */
function oklabToLinearSrgb(
  L: number,
  a: number,
  b: number,
): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/**
 * Convert linear sRGB to sRGB (apply gamma)
 */
function linearToSrgb(x: number): number {
  if (x <= 0.0031308) {
    return 12.92 * x;
  }
  return 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

/**
 * Convert oklch to RGB (proper conversion for Figma)
 */
function oklchToRgb(
  oklch: string,
): { r: number; g: number; b: number; a?: number } | null {
  const match = oklch.match(
    /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/,
  );

  if (!match) return null;

  let L = parseFloat(match[1]);
  const C = parseFloat(match[2]);
  const H = parseFloat(match[3]);
  const alpha = match[4] ? parseFloat(match[4]) : undefined;

  // Normalize L if it's a percentage
  if (L > 1) L = L / 100;

  // Convert oklch to oklab
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // Convert oklab to linear sRGB
  const [linearR, linearG, linearB] = oklabToLinearSrgb(L, a, b);

  // Convert linear sRGB to sRGB and clamp
  const r = Math.max(0, Math.min(1, linearToSrgb(linearR)));
  const g = Math.max(0, Math.min(1, linearToSrgb(linearG)));
  const bl = Math.max(0, Math.min(1, linearToSrgb(linearB)));

  const result: { r: number; g: number; b: number; a?: number } = {
    r,
    g,
    b: bl,
  };
  if (alpha !== undefined) result.a = alpha;
  return result;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shortMatch = hex.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
  if (shortMatch) {
    return {
      r: parseInt(shortMatch[1] + shortMatch[1], 16) / 255,
      g: parseInt(shortMatch[2] + shortMatch[2], 16) / 255,
      b: parseInt(shortMatch[3] + shortMatch[3], 16) / 255,
    };
  }

  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;

  return {
    r: parseInt(match[1], 16) / 255,
    g: parseInt(match[2], 16) / 255,
    b: parseInt(match[3], 16) / 255,
  };
}

/**
 * Parse a CSS color value to Figma RGB
 */
function parseColorToRgb(value: string): {
  r: number;
  g: number;
  b: number;
  a?: number;
} {
  const trimmed = value.trim();

  // Handle hex colors
  if (trimmed.startsWith("#")) {
    return hexToRgb(trimmed) || { r: 0.5, g: 0.5, b: 0.5 };
  }

  // Handle oklch
  if (trimmed.startsWith("oklch")) {
    return oklchToRgb(trimmed) || { r: 0.5, g: 0.5, b: 0.5 };
  }

  // Handle named colors
  if (trimmed === "transparent") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  if (trimmed === "white" || trimmed === "#fff") {
    return { r: 1, g: 1, b: 1 };
  }
  if (trimmed === "black" || trimmed === "#000") {
    return { r: 0, g: 0, b: 0 };
  }

  // Handle var() with fallback - extract the fallback value
  if (trimmed.startsWith("var(")) {
    const fallbackMatch = trimmed.match(/,\s*(.+)\)$/);
    if (fallbackMatch) {
      return parseColorToRgb(fallbackMatch[1]);
    }
  }

  // Default fallback
  return { r: 0.5, g: 0.5, b: 0.5 };
}

// =============================================================================
// Types
// =============================================================================

type FigmaColor = { r: number; g: number; b: number; a?: number };

type ColorVariable = {
  name: string;
  light: FigmaColor;
  dark: FigmaColor;
};

// =============================================================================
// Main
// =============================================================================

function main() {
  console.log("📖 Building Figma variables from theme config...\n");

  const colorVariables: ColorVariable[] = [];

  // Process text color tokens
  console.log("📝 Processing text color tokens...");
  for (const [tokenName, def] of Object.entries(THEME_CONFIG.text)) {
    const kumoTheme = def.theme.kumo;
    if (!kumoTheme) continue;

    colorVariables.push({
      name: `text-color-${tokenName}`,
      light: parseColorToRgb(kumoTheme.light),
      dark: parseColorToRgb(kumoTheme.dark),
    });
  }
  console.log(`   Found ${Object.keys(THEME_CONFIG.text).length} text tokens`);

  // Process color tokens
  console.log("🎨 Processing color tokens...");
  for (const [tokenName, def] of Object.entries(THEME_CONFIG.color)) {
    const kumoTheme = def.theme.kumo;
    if (!kumoTheme) continue;

    colorVariables.push({
      name: `color-${tokenName}`,
      light: parseColorToRgb(kumoTheme.light),
      dark: parseColorToRgb(kumoTheme.dark),
    });
  }
  console.log(
    `   Found ${Object.keys(THEME_CONFIG.color).length} color tokens`,
  );

  console.log(`\n✅ Total: ${colorVariables.length} color variables`);

  // Create a lookup map for quick access by name
  const variablesByName: Record<string, ColorVariable> = {};
  for (const v of colorVariables) {
    variablesByName[v.name] = v;
  }

  // Preview
  console.log("\n📋 Sample variables:");
  for (const v of colorVariables.slice(0, 5)) {
    console.log(
      `   - ${v.name}: light(${v.light.r.toFixed(2)}, ${v.light.g.toFixed(2)}, ${v.light.b.toFixed(2)}) dark(${v.dark.r.toFixed(2)}, ${v.dark.g.toFixed(2)}, ${v.dark.b.toFixed(2)})`,
    );
  }

  // List all variable names for reference
  console.log("\n📋 All variable names:");
  for (const v of colorVariables) {
    console.log(`   - ${v.name}`);
  }

  // Ensure generated directory exists
  const generatedDir = join(__dirname, "generated");
  mkdirSync(generatedDir, { recursive: true });

  // Build output
  const output = {
    _generated: new Date().toISOString(),
    _source: "packages/kumo/scripts/theme-generator/config.ts",
    collectionName: "kumo-colors",
    variables: colorVariables,
    byName: variablesByName,
  };

  const outputPath = join(generatedDir, "figma-variables.json");
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✅ Wrote ${outputPath}`);
}

main();
