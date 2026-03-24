import { rgb, type Oklch } from "culori";

/**
 * Figma color format with RGB values in 0-1 range
 */
export type FigmaColor = { r: number; g: number; b: number; a?: number };

/**
 * Converts various color formats to Figma RGB format (0-1 range)
 *
 * @param value - Color value in oklch, hex, or CSS color format
 * @returns Figma RGB color object with values in 0-1 range
 *
 * @example
 * resolveColor("oklch(21% 0.006 285.885)") // OKLCH format
 * resolveColor("oklch(87% 0 0 / 0.8)") // OKLCH with alpha
 * resolveColor("#f6821f") // Hex color
 * resolveColor("transparent") // Special case
 * resolveColor("var(--color-x, #fff)") // CSS variable with fallback
 */
export function resolveColor(value: string): FigmaColor {
  const trimmed = value.trim();

  // Handle transparent
  if (trimmed === "transparent") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // Handle CSS var() with fallback - extract the fallback value
  if (trimmed.startsWith("var(")) {
    const fallback = extractCssVarFallback(trimmed);
    if (!fallback) {
      throw new Error(`Cannot resolve CSS variable without fallback: ${value}`);
    }
    return resolveColor(fallback);
  }

  // Handle OKLCH format
  if (trimmed.startsWith("oklch(")) {
    return convertOklchToFigma(trimmed);
  }

  // Handle hex colors
  if (trimmed.startsWith("#")) {
    return convertHexToFigma(trimmed);
  }

  throw new Error(`Unsupported color format: ${value}`);
}

function extractCssVarFallback(value: string): string | null {
  // CSS syntax: var(--name[, fallback])
  // The fallback can contain nested functions like oklch(...), so regexes that stop
  // at the first ')' will truncate. Parse by tracking parentheses depth.
  const s = value.trim();
  if (!s.startsWith("var(")) return null;

  const end = s.trimEnd();
  if (!end.endsWith(")")) return null;

  let depth = 0;
  let commaIndex = -1;
  for (let i = 0; i < end.length; i++) {
    const ch = end[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 1) {
      commaIndex = i;
      break;
    }
  }

  if (commaIndex === -1) return null;

  const closeIndex = end.length - 1; // last ')'
  return end.slice(commaIndex + 1, closeIndex).trim();
}

/**
 * Converts OKLCH color string to Figma RGB format
 *
 * @param oklchString - OKLCH color string (e.g., "oklch(21% 0.006 285.885)")
 * @returns Figma RGB color object
 */
function convertOklchToFigma(oklchString: string): FigmaColor {
  // Extract values from oklch(L C H / alpha) or oklch(L C H)
  const match = oklchString.match(
    /oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)\s*(?:\/\s*([0-9.]+))?\s*\)/,
  );

  if (!match) {
    throw new Error(`Invalid OKLCH format: ${oklchString}`);
  }

  let [, lightnessStr, chromaStr, hueStr, alphaStr] = match;

  // Parse lightness (handle percentage)
  let lightness = parseFloat(lightnessStr);
  if (lightnessStr.includes("%")) {
    lightness = lightness / 100;
  }

  const chroma = parseFloat(chromaStr);
  const hue = parseFloat(hueStr);
  const alpha = alphaStr ? parseFloat(alphaStr) : undefined;

  // Convert OKLCH to RGB using culori
  const oklchColor: Oklch = { mode: "oklch", l: lightness, c: chroma, h: hue };
  const rgbColor = rgb(oklchColor);

  if (!rgbColor) {
    throw new Error(`Failed to convert OKLCH to RGB: ${oklchString}`);
  }

  // Clamp RGB values to 0-1 range (OKLCH can produce out-of-gamut colors)
  const result: FigmaColor = {
    r: Math.max(0, Math.min(1, rgbColor.r)),
    g: Math.max(0, Math.min(1, rgbColor.g)),
    b: Math.max(0, Math.min(1, rgbColor.b)),
  };

  if (alpha !== undefined) {
    result.a = alpha;
  }

  return result;
}

/**
 * Converts hex color to Figma RGB format
 *
 * @param hex - Hex color string (e.g., "#fff", "#f6821f")
 * @returns Figma RGB color object
 */
function convertHexToFigma(hex: string): FigmaColor {
  // Expand shorthand hex (#fff -> #ffffff)
  let normalized = hex.replace(
    /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i,
    "#$1$1$2$2$3$3",
  );

  const match = normalized.match(/^#([0-9a-f]{6})$/i);
  if (!match) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const hexValue = match[1];
  const r = parseInt(hexValue.substring(0, 2), 16) / 255;
  const g = parseInt(hexValue.substring(2, 4), 16) / 255;
  const b = parseInt(hexValue.substring(4, 6), 16) / 255;

  return { r, g, b };
}
