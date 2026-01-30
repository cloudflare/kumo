#!/usr/bin/env npx tsx
/**
 * Build Theme Data
 *
 * Generates theme-data.json from CSS source files at BUILD TIME.
 * This eliminates hardcoded numeric values in the Figma plugin.
 *
 * Sources:
 *   - packages/kumo/src/styles/theme-kumo.css (Kumo overrides)
 *   - node_modules/tailwindcss/theme.css (Tailwind v4 defaults)
 *   - packages/kumo/src/components/button/button.tsx (compactSize)
 *
 * Output:
 *   packages/kumo-figma/src/generated/theme-data.json
 *
 * Usage:
 *   pnpm run build:data (from packages/kumo-figma)
 */

import { writeFileSync, readFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths - reference sibling kumo package
const KUMO_PKG = join(__dirname, "../../kumo");
const KUMO_THEME_CSS = join(KUMO_PKG, "src/styles/theme-kumo.css");
const BUTTON_TSX = join(KUMO_PKG, "src/components/button/button.tsx");

/**
 * Find Tailwind's theme.css (handles pnpm structure)
 * Searches both kumo package and monorepo root node_modules
 */
function getTailwindThemeCssPath(): string {
  // Try kumo package's node_modules first
  const kumoDirectPath = join(KUMO_PKG, "node_modules/tailwindcss/theme.css");
  try {
    readFileSync(kumoDirectPath);
    return kumoDirectPath;
  } catch {
    // Ignore and try next location
  }

  // Try monorepo root node_modules
  const monorepoRoot = join(__dirname, "../../..");
  const rootDirectPath = join(
    monorepoRoot,
    "node_modules/tailwindcss/theme.css",
  );
  try {
    readFileSync(rootDirectPath);
    return rootDirectPath;
  } catch {
    // Ignore and try pnpm structure
  }

  // Try pnpm structure in kumo package
  try {
    const pnpmBasePath = join(KUMO_PKG, "node_modules/.pnpm");
    const pnpmDirs = readdirSync(pnpmBasePath);
    const tailwindDir = pnpmDirs.find((d: string) =>
      d.startsWith("tailwindcss@"),
    );

    if (tailwindDir) {
      return join(
        pnpmBasePath,
        tailwindDir,
        "node_modules/tailwindcss/theme.css",
      );
    }
  } catch {
    // Ignore and try monorepo pnpm
  }

  // Try pnpm structure in monorepo root
  try {
    const pnpmBasePath = join(monorepoRoot, "node_modules/.pnpm");
    const pnpmDirs = readdirSync(pnpmBasePath);
    const tailwindDir = pnpmDirs.find((d: string) =>
      d.startsWith("tailwindcss@"),
    );

    if (tailwindDir) {
      return join(
        pnpmBasePath,
        tailwindDir,
        "node_modules/tailwindcss/theme.css",
      );
    }
  } catch {
    // Final fallback failed
  }

  throw new Error(
    "Could not find tailwindcss/theme.css in kumo package or monorepo root",
  );
}

/**
 * Convert rem to pixels (16px base)
 */
function remToPx(remValue: string): number {
  const num = parseFloat(remValue.replace("rem", ""));
  return Math.round(num * 16);
}

/**
 * Parse Kumo's theme-kumo.css for font sizes
 * Kumo overrides Tailwind defaults: xs=12, sm=13, base=14, lg=16
 */
function parseKumoFontSizes(css: string): Record<string, number> {
  const sizes: Record<string, number> = {};

  // Match: --text-xs: 12px; or --text-sm: 13px;
  const pxMatches = css.matchAll(/--text-(\w+):\s*(\d+)px/g);
  for (const match of pxMatches) {
    sizes[match[1]] = parseInt(match[2], 10);
  }

  // Match rem values: --text-xl: 1.25rem;
  const remMatches = css.matchAll(/--text-(\w+):\s*([\d.]+)rem/g);
  for (const match of remMatches) {
    if (!sizes[match[1]]) {
      sizes[match[1]] = remToPx(match[2] + "rem");
    }
  }

  return sizes;
}

/**
 * Parse Tailwind v4 theme.css for spacing base unit
 */
function parseTailwindSpacing(css: string): { baseUnitPx: number } {
  // Tailwind v4: --spacing: 0.25rem = 4px
  const match = css.match(/--spacing:\s*([\d.]+)rem/);
  if (!match) {
    throw new Error("Could not find --spacing in tailwind theme.css");
  }
  return { baseUnitPx: remToPx(match[1] + "rem") };
}

/**
 * Parse Tailwind v4 theme.css for border radius values
 */
function parseTailwindBorderRadius(css: string): Record<string, number> {
  const radii: Record<string, number> = {};
  const names = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"];

  for (const name of names) {
    const pattern = new RegExp(`--radius-${name}:\\s*([\\d.]+)rem`);
    const match = css.match(pattern);
    if (match) {
      radii[name] = remToPx(match[1] + "rem");
    }
  }

  return radii;
}

/**
 * Parse Tailwind v4 theme.css for font sizes (defaults, may be overridden by Kumo)
 */
function parseTailwindFontSizes(css: string): Record<string, number> {
  const sizes: Record<string, number> = {};
  const names = [
    "xs",
    "sm",
    "base",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "4xl",
    "5xl",
    "6xl",
    "7xl",
    "8xl",
    "9xl",
  ];

  for (const name of names) {
    const pattern = new RegExp(`--text-${name}:\\s*([\\d.]+)rem`);
    const match = css.match(pattern);
    if (match) {
      sizes[name] = remToPx(match[1] + "rem");
    }
  }

  return sizes;
}

/**
 * Parse Tailwind v4 theme.css for font weights
 */
function parseTailwindFontWeights(css: string): Record<string, number> {
  const weights: Record<string, number> = {};
  const names = [
    "thin",
    "extralight",
    "light",
    "normal",
    "medium",
    "semibold",
    "bold",
    "extrabold",
    "black",
  ];

  for (const name of names) {
    const pattern = new RegExp(`--font-weight-${name}:\\s*(\\d+)`);
    const match = css.match(pattern);
    if (match) {
      weights[name] = parseInt(match[1], 10);
    }
  }

  return weights;
}

/**
 * Parse Tailwind v4 theme.css for shadow definitions
 */
function parseTailwindShadows(css: string): Record<
  string,
  {
    layers: Array<{
      offsetX: number;
      offsetY: number;
      blur: number;
      spread: number;
      opacity: number;
    }>;
  }
> {
  const shadows: Record<
    string,
    {
      layers: Array<{
        offsetX: number;
        offsetY: number;
        blur: number;
        spread: number;
        opacity: number;
      }>;
    }
  > = {};
  const names = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];

  for (const name of names) {
    const pattern = new RegExp(`--shadow-${name}:\\s*([^;]+);`);
    const match = css.match(pattern);
    if (match) {
      shadows[name] = parseShadowString(match[1].trim());
    }
  }

  return shadows;
}

/**
 * Parse CSS shadow string into structured layers
 */
function parseShadowString(shadowStr: string): {
  layers: Array<{
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
    opacity: number;
  }>;
} {
  const layers: Array<{
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
    opacity: number;
  }> = [];

  // Split by comma for multi-layer shadows
  const layerStrings = shadowStr.split(/,\s*(?=\d)/);

  for (const layer of layerStrings) {
    const match = layer.match(
      /(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?(?:\s+(-?[\d.]+)(?:px)?)?\s+rgb\([^/]+\/\s*([\d.]+)\)/,
    );

    if (match) {
      layers.push({
        offsetX: parseFloat(match[1]),
        offsetY: parseFloat(match[2]),
        blur: parseFloat(match[3]),
        spread: match[4] ? parseFloat(match[4]) : 0,
        opacity: parseFloat(match[5]),
      });
    }
  }

  return { layers };
}

/**
 * Generate full spacing scale from base unit
 */
function generateSpacingScale(baseUnitPx: number): Record<string, number> {
  const keys = [
    "0",
    "px",
    "0.5",
    "1",
    "1.5",
    "2",
    "2.5",
    "3",
    "3.5",
    "4",
    "4.5",
    "5",
    "6",
    "6.5", // Kumo custom
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "14",
    "16",
    "20",
    "24",
    "28",
    "32",
    "36",
    "40",
    "44",
    "48",
    "52",
    "56",
    "60",
    "64",
    "72",
    "80",
    "96",
  ];

  const scale: Record<string, number> = {};

  for (const key of keys) {
    if (key === "0") {
      scale[key] = 0;
    } else if (key === "px") {
      scale[key] = 1;
    } else {
      scale[key] = Math.round(parseFloat(key) * baseUnitPx);
    }
  }

  return scale;
}

/**
 * Parse button.tsx for compactSize values
 */
function parseButtonCompactSizes(tsx: string): Record<string, number> {
  const sizes: Record<string, number> = {};
  const sizeNames = ["xs", "sm", "base", "lg"];

  for (const name of sizeNames) {
    // Match: xs: { classes: "size-3.5" }
    const pattern = new RegExp(
      `${name}:\\s*\\{\\s*classes:\\s*["']size-([\\d.]+)["']`,
    );
    const match = tsx.match(pattern);
    if (match) {
      // Convert Tailwind size to pixels: size-X = X * 4
      sizes[name] = Math.round(parseFloat(match[1]) * 4);
    }
  }

  return sizes;
}

// Main execution
console.log("📖 Parsing CSS source files for Figma plugin...\n");

// Read source files
const kumoThemeCss = readFileSync(KUMO_THEME_CSS, "utf-8");
const tailwindThemeCss = readFileSync(getTailwindThemeCssPath(), "utf-8");
const buttonTsx = readFileSync(BUTTON_TSX, "utf-8");

// Parse Tailwind v4 defaults
console.log("📦 Parsing Tailwind v4 theme.css...");
const tailwindSpacing = parseTailwindSpacing(tailwindThemeCss);
const tailwindBorderRadius = parseTailwindBorderRadius(tailwindThemeCss);
const tailwindFontSizes = parseTailwindFontSizes(tailwindThemeCss);
const tailwindFontWeights = parseTailwindFontWeights(tailwindThemeCss);
const tailwindShadows = parseTailwindShadows(tailwindThemeCss);

console.log(`   - Base spacing unit: ${tailwindSpacing.baseUnitPx}px`);
console.log(
  `   - Border radii: ${Object.keys(tailwindBorderRadius).length} values`,
);
console.log(`   - Font sizes: ${Object.keys(tailwindFontSizes).length} values`);
console.log(
  `   - Font weights: ${Object.keys(tailwindFontWeights).length} values`,
);
console.log(`   - Shadows: ${Object.keys(tailwindShadows).length} values`);

// Parse Kumo overrides (typography is now in theme-kumo.css, generated by codegen:themes)
console.log("\n🎨 Parsing Kumo theme-kumo.css overrides...");
const kumoFontSizes = parseKumoFontSizes(kumoThemeCss);
console.log(
  `   - Font size overrides: xs=${kumoFontSizes.xs}px, sm=${kumoFontSizes.sm}px, base=${kumoFontSizes.base}px, lg=${kumoFontSizes.lg}px`,
);

// Parse button compact sizes
console.log("\n🔘 Parsing button.tsx compact sizes...");
const buttonCompactSizes = parseButtonCompactSizes(buttonTsx);
console.log(
  `   - Compact sizes: xs=${buttonCompactSizes.xs}px, sm=${buttonCompactSizes.sm}px, base=${buttonCompactSizes.base}px, lg=${buttonCompactSizes.lg}px`,
);

// Generate full spacing scale
const spacingScale = generateSpacingScale(tailwindSpacing.baseUnitPx);

// Build final theme data
const themeData = {
  _generated: new Date().toISOString(),
  _sources: [
    "packages/kumo/src/styles/theme-kumo.css",
    "node_modules/tailwindcss/theme.css",
    "packages/kumo/src/components/button/button.tsx",
  ],

  // Tailwind v4 base values
  tailwind: {
    spacing: {
      baseUnitPx: tailwindSpacing.baseUnitPx,
      scale: spacingScale,
    },
    borderRadius: {
      ...tailwindBorderRadius,
      full: 9999,
      none: 0,
    },
    fontSize: tailwindFontSizes,
    fontWeight: tailwindFontWeights,
    shadows: tailwindShadows,
  },

  // Kumo-specific overrides
  kumo: {
    fontSize: kumoFontSizes,
    buttonCompactSize: buttonCompactSizes,
  },

  // Pre-computed values for direct import in generators
  // These are the "final" values combining Tailwind defaults + Kumo overrides
  computed: {
    // For shared.ts SPACING constant
    spacing: {
      xs: spacingScale["1"], // gap-1 = 4px
      sm: spacingScale["1.5"], // gap-1.5 = 6px
      base: spacingScale["2"], // gap-2 = 8px
      lg: spacingScale["3"], // gap-3 = 12px
    },

    // For shared.ts BORDER_RADIUS constant (from Tailwind v4)
    borderRadius: {
      xs: tailwindBorderRadius.xs, // 2px
      sm: tailwindBorderRadius.sm, // 4px
      md: tailwindBorderRadius.md, // 6px
      lg: tailwindBorderRadius.lg, // 8px
      xl: tailwindBorderRadius.xl, // 12px
      full: 9999,
    },

    // For shared.ts FONT_SIZE constant (Kumo overrides)
    fontSize: {
      xs: kumoFontSizes.xs, // 12px
      sm: kumoFontSizes.sm, // 13px (Kumo override)
      base: kumoFontSizes.base, // 14px (Kumo override)
      lg: kumoFontSizes.lg, // 16px (Kumo override)
    },

    // For shared.ts FALLBACK_VALUES.fontWeight
    fontWeight: {
      normal: tailwindFontWeights.normal, // 400
      medium: tailwindFontWeights.medium, // 500
      semiBold: tailwindFontWeights.semibold, // 600
    },

    // For shared.ts FALLBACK_VALUES.buttonCompactSize
    buttonCompactSize: buttonCompactSizes,

    // For shared.ts SHADOWS (computed from Tailwind)
    shadows: {
      xs: tailwindShadows.xs,
      lg: tailwindShadows.lg,
    },
  },
};

// Ensure generated directory exists
const generatedDir = join(__dirname, "generated");
mkdirSync(generatedDir, { recursive: true });

// Write theme data
const outputPath = join(generatedDir, "theme-data.json");
writeFileSync(outputPath, JSON.stringify(themeData, null, 2));

console.log(`\n✅ Wrote ${outputPath}`);
console.log("\n📋 Summary:");
console.log(`   - Spacing scale: ${Object.keys(spacingScale).length} values`);
console.log(
  `   - Border radius: ${Object.keys(themeData.computed.borderRadius).length} values`,
);
console.log(
  `   - Font sizes: ${Object.keys(themeData.computed.fontSize).length} values (Kumo overrides)`,
);
console.log(
  `   - Font weights: ${Object.keys(themeData.computed.fontWeight).length} values`,
);
console.log(
  `   - Button compact sizes: ${Object.keys(buttonCompactSizes).length} values`,
);
