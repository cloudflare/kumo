/**
 * Tailwind v4 Theme CSS Parser
 *
 * Parses the Tailwind v4 theme.css file from node_modules to extract
 * default design token values. This allows drift detection tests to
 * verify that hardcoded values in the Figma plugin match Tailwind's
 * actual defaults.
 *
 * Source: node_modules/tailwindcss/theme.css
 */

import { readFileSync } from "fs";
import { join } from "path";

/**
 * Resolve the path to Tailwind's theme.css
 * Works with pnpm's node_modules structure
 * Searches both local package, kumo package, and monorepo root
 */
export function getTailwindThemeCssPath(): string {
  const { readdirSync, existsSync } = require("fs");

  // Possible locations to search
  const searchPaths = [
    // Local package node_modules
    process.cwd(),
    // Kumo package (sibling)
    join(process.cwd(), "../kumo"),
    // Monorepo root (from packages/kumo-figma -> ../..)
    join(process.cwd(), "../.."),
  ];

  for (const basePath of searchPaths) {
    // Try direct path first (standard node_modules)
    const directPath = join(basePath, "node_modules/tailwindcss/theme.css");
    try {
      readFileSync(directPath);
      return directPath;
    } catch {
      // Ignore and try pnpm structure
    }

    // Try pnpm path structure
    const pnpmBasePath = join(basePath, "node_modules/.pnpm");
    if (existsSync(pnpmBasePath)) {
      try {
        const pnpmDirs = readdirSync(pnpmBasePath);
        const tailwindDir = pnpmDirs.find((d: string) =>
          d.startsWith("tailwindcss@"),
        );

        if (tailwindDir) {
          const pnpmThemePath = join(
            pnpmBasePath,
            tailwindDir,
            "node_modules/tailwindcss/theme.css",
          );
          try {
            readFileSync(pnpmThemePath);
            return pnpmThemePath;
          } catch {
            // Continue searching
          }
        }
      } catch {
        // Continue searching
      }
    }
  }

  throw new Error(
    "Could not find tailwindcss/theme.css in node_modules. " +
      "Ensure tailwindcss is installed in kumo package or monorepo root.",
  );
}

/**
 * Read and return the raw content of Tailwind's theme.css
 */
export function readTailwindThemeCss(): string {
  const themePath = getTailwindThemeCssPath();
  return readFileSync(themePath, "utf-8");
}

/**
 * Convert rem value to pixels (assuming 16px base)
 */
export function remToPx(remValue: string): number {
  const num = parseFloat(remValue.replace("rem", ""));
  return Math.round(num * 16);
}

/**
 * Parsed spacing configuration from Tailwind
 */
export type TailwindSpacing = {
  /** Base spacing unit in rem (e.g., 0.25rem = 4px) */
  baseUnit: number;
  /** Base spacing unit in pixels */
  baseUnitPx: number;
};

/**
 * Extract the base spacing unit from theme.css
 * Tailwind v4 uses --spacing: 0.25rem as the base unit
 */
export function parseSpacing(themeCss: string): TailwindSpacing {
  const match = themeCss.match(/--spacing:\s*([\d.]+)rem/);
  if (!match) {
    throw new Error("Could not find --spacing in theme.css");
  }

  const baseUnit = parseFloat(match[1]);
  return {
    baseUnit,
    baseUnitPx: remToPx(`${baseUnit}rem`),
  };
}

/**
 * Calculate spacing value in pixels for a given Tailwind spacing key
 * e.g., "1" -> 4px, "2" -> 8px, "3.5" -> 14px
 */
export function getSpacingPx(key: string, baseUnitPx: number): number {
  const multiplier = parseFloat(key);
  return Math.round(multiplier * baseUnitPx);
}

/**
 * Parsed border radius values from Tailwind
 */
export type TailwindBorderRadius = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
  "4xl": number;
};

/**
 * Extract border radius values from theme.css
 */
export function parseBorderRadius(themeCss: string): TailwindBorderRadius {
  const extractRadius = (name: string): number => {
    const pattern = new RegExp(`--radius-${name}:\\s*([\\d.]+)rem`);
    const match = themeCss.match(pattern);
    if (!match) {
      throw new Error(`Could not find --radius-${name} in theme.css`);
    }
    return remToPx(match[1] + "rem");
  };

  return {
    xs: extractRadius("xs"),
    sm: extractRadius("sm"),
    md: extractRadius("md"),
    lg: extractRadius("lg"),
    xl: extractRadius("xl"),
    "2xl": extractRadius("2xl"),
    "3xl": extractRadius("3xl"),
    "4xl": extractRadius("4xl"),
  };
}

/**
 * Parsed font size values from Tailwind (in pixels)
 */
export type TailwindFontSize = {
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
  "4xl": number;
  "5xl": number;
  "6xl": number;
  "7xl": number;
  "8xl": number;
  "9xl": number;
};

/**
 * Extract font size values from theme.css
 */
export function parseFontSize(themeCss: string): TailwindFontSize {
  const extractFontSize = (name: string): number => {
    const pattern = new RegExp(`--text-${name}:\\s*([\\d.]+)rem`);
    const match = themeCss.match(pattern);
    if (!match) {
      throw new Error(`Could not find --text-${name} in theme.css`);
    }
    return remToPx(match[1] + "rem");
  };

  return {
    xs: extractFontSize("xs"),
    sm: extractFontSize("sm"),
    base: extractFontSize("base"),
    lg: extractFontSize("lg"),
    xl: extractFontSize("xl"),
    "2xl": extractFontSize("2xl"),
    "3xl": extractFontSize("3xl"),
    "4xl": extractFontSize("4xl"),
    "5xl": extractFontSize("5xl"),
    "6xl": extractFontSize("6xl"),
    "7xl": extractFontSize("7xl"),
    "8xl": extractFontSize("8xl"),
    "9xl": extractFontSize("9xl"),
  };
}

/**
 * Parsed font weight values from Tailwind
 */
export type TailwindFontWeight = {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
};

/**
 * Extract font weight values from theme.css
 */
export function parseFontWeight(themeCss: string): TailwindFontWeight {
  const extractWeight = (name: string): number => {
    const pattern = new RegExp(`--font-weight-${name}:\\s*(\\d+)`);
    const match = themeCss.match(pattern);
    if (!match) {
      throw new Error(`Could not find --font-weight-${name} in theme.css`);
    }
    return parseInt(match[1], 10);
  };

  return {
    thin: extractWeight("thin"),
    extralight: extractWeight("extralight"),
    light: extractWeight("light"),
    normal: extractWeight("normal"),
    medium: extractWeight("medium"),
    semibold: extractWeight("semibold"),
    bold: extractWeight("bold"),
    extrabold: extractWeight("extrabold"),
    black: extractWeight("black"),
  };
}

/**
 * Parsed shadow definition
 */
export type ParsedShadow = {
  layers: Array<{
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
    opacity: number;
  }>;
};

/**
 * Parsed shadow values from Tailwind
 */
export type TailwindShadows = {
  "2xs": ParsedShadow;
  xs: ParsedShadow;
  sm: ParsedShadow;
  md: ParsedShadow;
  lg: ParsedShadow;
  xl: ParsedShadow;
  "2xl": ParsedShadow;
};

/**
 * Parse a CSS shadow string into structured layers
 * e.g., "0 1px 2px 0 rgb(0 0 0 / 0.05)" -> { offsetX: 0, offsetY: 1, blur: 2, spread: 0, opacity: 0.05 }
 */
function parseShadowString(shadowStr: string): ParsedShadow {
  const layers: ParsedShadow["layers"] = [];

  // Split by comma (for multi-layer shadows), but be careful with rgb() commas
  // Shadow layers are separated by ", 0" pattern (comma followed by a shadow starting with 0)
  const layerStrings = shadowStr.split(/,\s*(?=\d)/);

  for (const layer of layerStrings) {
    // Match pattern: offsetX offsetY blur spread? rgb(0 0 0 / opacity)
    // Examples:
    // "0 1px 2px 0 rgb(0 0 0 / 0.05)"
    // "0 10px 15px -3px rgb(0 0 0 / 0.1)"
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
 * Extract shadow values from theme.css
 */
export function parseShadows(themeCss: string): TailwindShadows {
  const extractShadow = (name: string): ParsedShadow => {
    const pattern = new RegExp(`--shadow-${name}:\\s*([^;]+);`);
    const match = themeCss.match(pattern);
    if (!match) {
      throw new Error(`Could not find --shadow-${name} in theme.css`);
    }
    return parseShadowString(match[1].trim());
  };

  return {
    "2xs": extractShadow("2xs"),
    xs: extractShadow("xs"),
    sm: extractShadow("sm"),
    md: extractShadow("md"),
    lg: extractShadow("lg"),
    xl: extractShadow("xl"),
    "2xl": extractShadow("2xl"),
  };
}

/**
 * Complete parsed Tailwind theme
 */
export type TailwindTheme = {
  spacing: TailwindSpacing;
  borderRadius: TailwindBorderRadius;
  fontSize: TailwindFontSize;
  fontWeight: TailwindFontWeight;
  shadows: TailwindShadows;
};

/**
 * Parse all theme values from Tailwind's theme.css
 */
export function parseTailwindTheme(): TailwindTheme {
  const themeCss = readTailwindThemeCss();

  return {
    spacing: parseSpacing(themeCss),
    borderRadius: parseBorderRadius(themeCss),
    fontSize: parseFontSize(themeCss),
    fontWeight: parseFontWeight(themeCss),
    shadows: parseShadows(themeCss),
  };
}

/**
 * Generate the expected SPACING_SCALE object based on Tailwind's base unit
 * This can be used to verify the hardcoded values in tailwind-to-figma.ts
 */
export function generateExpectedSpacingScale(
  baseUnitPx: number,
): Record<string, number> {
  // Standard Tailwind spacing keys
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
      scale[key] = getSpacingPx(key, baseUnitPx);
    }
  }

  return scale;
}
