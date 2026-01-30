/**
 * Tailwind to Figma Parser
 *
 * Parses Tailwind CSS classes from component variant definitions
 * and converts them to Figma-compatible values.
 *
 * This allows the Figma plugin to stay in sync with the component
 * source of truth (the KUMO_*_VARIANTS objects).
 *
 * IMPORTANT: Scale constants are generated from CSS sources.
 * Run `npx tsx build-theme-data.ts` to regenerate theme-data.json.
 */

import themeData from "../generated/theme-data.json";

/**
 * Helper to get value from scale with fallback
 * (Figma plugin runtime doesn't support ?? operator)
 */
function getOrDefault(
  scale: Record<string, number>,
  key: string,
  fallback: number,
): number {
  const value = scale[key];
  return value !== undefined ? value : fallback;
}

/**
 * Tailwind spacing scale (in pixels)
 * Generated from: Tailwind v4 theme.css --spacing base unit
 */
const SPACING_SCALE: Record<string, number> = themeData.tailwind.spacing.scale;

/**
 * Kumo font size scale (in pixels)
 * Generated from: theme-kumo.css @theme definitions (Kumo overrides Tailwind defaults)
 */
const FONT_SIZE_SCALE: Record<string, number> = {
  ...themeData.kumo.fontSize,
  // Extended sizes from Tailwind defaults
  xl: themeData.tailwind.fontSize.xl,
  "2xl": themeData.tailwind.fontSize["2xl"],
  "3xl": themeData.tailwind.fontSize["3xl"],
};

/**
 * Tailwind border radius scale (in pixels)
 * Generated from: Tailwind v4 theme.css --radius-* values
 */
const BORDER_RADIUS_SCALE: Record<string, number> = {
  none: themeData.tailwind.borderRadius.none,
  xs: themeData.tailwind.borderRadius.xs,
  sm: themeData.tailwind.borderRadius.sm,
  DEFAULT: themeData.tailwind.borderRadius.sm, // Same as sm
  md: themeData.tailwind.borderRadius.md,
  lg: themeData.tailwind.borderRadius.lg,
  xl: themeData.tailwind.borderRadius.xl,
  "2xl": themeData.tailwind.borderRadius["2xl"],
  "3xl": themeData.tailwind.borderRadius["3xl"],
  "4xl": themeData.tailwind.borderRadius["4xl"],
  full: themeData.tailwind.borderRadius.full,
};

/**
 * Tailwind font weight scale
 * Generated from: Tailwind v4 theme.css --font-weight-* values
 */
const FONT_WEIGHT_SCALE: Record<string, number> = themeData.tailwind.fontWeight;

/**
 * Map Kumo semantic color classes to Figma variable names
 * These must match the kumo-colors collection in Figma (generated from theme-kumo.css)
 *
 * Variable names follow the pattern from theme-kumo.css:
 * - Background/fill colors: "color-kumo-{name}" (e.g., "color-kumo-brand", "color-kumo-base")
 * - Text colors: "text-color-kumo-{name}" (e.g., "text-color-kumo-default", "text-color-kumo-subtle")
 */
const COLOR_TO_VARIABLE: Record<string, string> = {
  // Background colors (--color-kumo-* tokens from theme-kumo.css)
  "bg-kumo-base": "color-kumo-base",
  "bg-kumo-elevated": "color-kumo-elevated",
  "bg-kumo-recessed": "color-kumo-recessed",
  "bg-kumo-overlay": "color-kumo-overlay",
  "bg-kumo-contrast": "color-kumo-contrast",
  "bg-kumo-control": "color-kumo-control",
  "bg-kumo-tint": "color-kumo-tint",
  "bg-kumo-interact": "color-kumo-interact",
  "bg-kumo-fill": "color-kumo-fill",
  "bg-kumo-brand": "color-kumo-brand",
  "bg-kumo-brand-hover": "color-kumo-brand-hover",
  "bg-kumo-line": "color-kumo-line",
  "bg-kumo-ring": "color-kumo-ring",
  "bg-kumo-info": "color-kumo-info",
  "bg-kumo-info-tint": "color-kumo-info-tint",
  "bg-kumo-warning": "color-kumo-warning",
  "bg-kumo-warning-tint": "color-kumo-warning-tint",
  "bg-kumo-danger": "color-kumo-danger",
  "bg-kumo-danger-tint": "color-kumo-danger-tint",
  "bg-transparent": null!, // No fill
  "bg-inherit": null!, // No fill

  // Text colors (--text-color-kumo-* tokens from theme-kumo.css)
  "text-white": null!, // Hardcoded white
  "text-kumo-default": "text-color-kumo-default",
  "text-kumo-inverse": "text-color-kumo-inverse",
  "text-kumo-strong": "text-color-kumo-strong",
  "text-kumo-subtle": "text-color-kumo-subtle",
  "text-kumo-inactive": "text-color-kumo-inactive",
  "text-kumo-brand": "text-color-kumo-brand",
  "text-kumo-link": "text-color-kumo-link",
  "text-kumo-success": "text-color-kumo-success",
  "text-kumo-danger": "text-color-kumo-danger",
  "text-kumo-warning": "text-color-kumo-warning",
  "!text-white": null!, // Hardcoded white (important)
  "!text-kumo-default": "text-color-kumo-default",
  "!text-kumo-danger": "text-color-kumo-danger",

  // Border colors (use --color-kumo-* tokens)
  "border-kumo-line": "color-kumo-line",
  "border-kumo-ring": "color-kumo-ring",
  "border-kumo-brand": "color-kumo-brand",
  "border-kumo-fill": "color-kumo-fill",
  "border-kumo-info": "color-kumo-info",
  "border-kumo-warning": "color-kumo-warning",
  "border-kumo-danger": "color-kumo-danger",
  "ring-kumo-line": "color-kumo-line",
  "ring-kumo-ring": "color-kumo-ring",
  "ring-kumo-danger": "color-kumo-danger",
};

/**
 * Parsed style information from Tailwind classes
 */
export type ParsedStyles = {
  // Layout
  height?: number;
  width?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  paddingX?: number;
  paddingY?: number;
  gap?: number;
  borderRadius?: number;

  // Typography
  fontSize?: number;
  fontWeight?: number;

  // Colors (Figma variable names)
  fillVariable?: string | null;
  fillOpacity?: number;
  textVariable?: string | null;
  textOpacity?: number;
  strokeVariable?: string | null;
  strokeOpacity?: number;

  // Special flags
  isWhiteText?: boolean;
  hasBorder?: boolean;
  borderStyle?: "solid" | "dashed";

  // Border properties
  strokeWeight?: number;
  dashPattern?: number[];

  // State variants (hover, focus, active, disabled, pressed)
  states?: {
    hover?: ParsedStyles;
    focus?: ParsedStyles;
    active?: ParsedStyles;
    disabled?: ParsedStyles;
    pressed?: ParsedStyles;
  };
};

/**
 * Parse a Tailwind class string and extract Figma-compatible values
 */
export function parseTailwindClasses(classes: string): ParsedStyles {
  const result: ParsedStyles = {};
  const classList = classes.split(/\s+/).filter(Boolean);

  for (const cls of classList) {
    // Parse state variants (hover:, focus:, active:, disabled:, pressed:)
    // Pattern: state:class-name
    const stateMatch = cls.match(
      /^(hover|focus|active|disabled|pressed):(.+)$/,
    );
    if (stateMatch) {
      const state = stateMatch[1] as
        | "hover"
        | "focus"
        | "active"
        | "disabled"
        | "pressed";
      const stateClass = stateMatch[2];

      // Parse the state class recursively
      const stateParsed = parseTailwindClasses(stateClass);

      // Add to states object if anything was parsed
      if (Object.keys(stateParsed).length > 0) {
        if (!result.states) {
          result.states = {};
        }
        result.states[state] = stateParsed;
      }
      continue;
    }

    // Skip other colon-prefixed classes (except ! important)
    if (cls.includes(":") && !cls.startsWith("!")) {
      continue;
    }

    // Arbitrary value patterns: w-[350px], h-[2.5rem], min-w-[32rem], max-h-[100px]
    const arbitraryMatch = cls.match(
      /^(w|h|min-w|min-h|max-w|max-h)-\[(\d+(?:\.\d+)?)(px|rem|em)?\]$/,
    );
    if (arbitraryMatch) {
      const property = arbitraryMatch[1];
      const value = parseFloat(arbitraryMatch[2]);
      const unit = arbitraryMatch[3] || "px";

      // Convert rem and em to px (rem/em * 16 = px)
      const pxValue = unit === "px" ? value : value * 16;

      // Map property to result key
      if (property === "w") {
        result.width = pxValue;
      } else if (property === "h") {
        result.height = pxValue;
      } else if (property === "min-w") {
        result.minWidth = pxValue;
      } else if (property === "min-h") {
        result.minHeight = pxValue;
      } else if (property === "max-w") {
        result.maxWidth = pxValue;
      } else if (property === "max-h") {
        result.maxHeight = pxValue;
      }
      continue;
    }

    // Min-width: min-w-72, min-w-96 (Tailwind spacing scale)
    const minWidthMatch = cls.match(/^min-w-(\d+\.?\d*)$/);
    if (minWidthMatch) {
      result.minWidth = getOrDefault(
        SPACING_SCALE,
        minWidthMatch[1],
        parseFloat(minWidthMatch[1]) * 4,
      );
      continue;
    }

    // Height: h-5, h-6.5, h-9, h-10
    const heightMatch = cls.match(/^h-(\d+\.?\d*)$/);
    if (heightMatch) {
      result.height = getOrDefault(
        SPACING_SCALE,
        heightMatch[1],
        parseFloat(heightMatch[1]) * 4,
      );
      continue;
    }

    // Size (width and height): size-3.5, size-6.5, size-9, size-10
    const sizeMatch = cls.match(/^size-(\d+\.?\d*)$/);
    if (sizeMatch) {
      const size = getOrDefault(
        SPACING_SCALE,
        sizeMatch[1],
        parseFloat(sizeMatch[1]) * 4,
      );
      result.width = size;
      result.height = size;
      continue;
    }

    // Padding X: px-1.5, px-2, px-3, px-4
    const pxMatch = cls.match(/^px-(\d+\.?\d*)$/);
    if (pxMatch) {
      result.paddingX = getOrDefault(
        SPACING_SCALE,
        pxMatch[1],
        parseFloat(pxMatch[1]) * 4,
      );
      continue;
    }

    // Padding Y: py-0.5, py-1, py-2
    const pyMatch = cls.match(/^py-(\d+\.?\d*)$/);
    if (pyMatch) {
      result.paddingY = getOrDefault(
        SPACING_SCALE,
        pyMatch[1],
        parseFloat(pyMatch[1]) * 4,
      );
      continue;
    }

    // Gap: gap-1, gap-1.5, gap-2
    const gapMatch = cls.match(/^gap-(\d+\.?\d*)$/);
    if (gapMatch) {
      result.gap = getOrDefault(
        SPACING_SCALE,
        gapMatch[1],
        parseFloat(gapMatch[1]) * 4,
      );
      continue;
    }

    // Border radius: rounded-sm, rounded-md, rounded-lg, rounded-full
    const radiusMatch = cls.match(/^rounded-?(\w*)$/);
    if (radiusMatch) {
      const key = radiusMatch[1] || "DEFAULT";
      result.borderRadius = getOrDefault(
        BORDER_RADIUS_SCALE,
        key,
        BORDER_RADIUS_SCALE.DEFAULT,
      );
      continue;
    }

    // Font size: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
    const fontMatch = cls.match(/^text-(xs|sm|base|lg|xl|2xl|3xl)$/);
    if (fontMatch) {
      result.fontSize = FONT_SIZE_SCALE[fontMatch[1]];
      continue;
    }

    // Font weight: font-thin, font-light, font-normal, font-medium, font-semibold, font-bold
    const fontWeightMatch = cls.match(
      /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    );
    if (fontWeightMatch) {
      result.fontWeight = FONT_WEIGHT_SCALE[fontWeightMatch[1]];
      continue;
    }

    // Background colors (with optional opacity: bg-kumo-info/20)
    if (cls.startsWith("bg-")) {
      // Check for opacity modifier (e.g., bg-kumo-info/20)
      const opacityMatch = cls.match(/^(bg-[^/]+)\/([0-9]+)$/);
      if (opacityMatch) {
        const baseClass = opacityMatch[1];
        const opacityValue = opacityMatch[2];
        const varName = COLOR_TO_VARIABLE[baseClass];
        if (varName !== undefined) {
          // Use opacity variant variable directly (e.g., "color-info/20")
          // These are generated by sync-tokens-to-figma.ts
          result.fillVariable = `${varName}/${opacityValue}`;
          // ALSO extract numeric opacity for generator flexibility
          result.fillOpacity = parseInt(opacityValue, 10) / 100;
        }
      } else {
        const varName = COLOR_TO_VARIABLE[cls];
        if (varName !== undefined) {
          result.fillVariable = varName;
        }
      }
      continue;
    }

    // Text colors (including !important variants and opacity modifiers)
    if (cls.startsWith("text-") || cls.startsWith("!text-")) {
      // Check for opacity modifier (e.g., text-surface/50, !text-error/80, text-white/90)
      const opacityMatch = cls.match(/^(!?text-[^/]+)\/([0-9]+)$/);
      if (opacityMatch) {
        const baseClass = opacityMatch[1];
        const opacityValue = opacityMatch[2];
        const varName = COLOR_TO_VARIABLE[baseClass];
        // Extract numeric opacity
        result.textOpacity = parseInt(opacityValue, 10) / 100;
        // Set variable (null for white)
        if (varName !== undefined) {
          result.textVariable =
            varName !== null ? `${varName}/${opacityValue}` : null;
        }
        // Check for white text flag
        if (baseClass === "text-white" || baseClass === "!text-white") {
          result.isWhiteText = true;
        }
      } else {
        const varName = COLOR_TO_VARIABLE[cls];
        if (varName !== undefined) {
          result.textVariable = varName;
          if (cls === "text-white" || cls === "!text-white") {
            result.isWhiteText = true;
          }
        }
      }
      continue;
    }

    // Border
    if (cls === "border" || cls.startsWith("border-")) {
      result.hasBorder = true;

      // Parse border width: border (1px default), etc.
      if (cls === "border") {
        result.strokeWeight = 1;
      } else {
        const widthMatch = cls.match(/^border-(\d+)$/);
        if (widthMatch) {
          result.strokeWeight = parseInt(widthMatch[1], 10);
          continue;
        }
      }

      // Parse border style
      if (cls === "border-dashed") {
        result.borderStyle = "dashed";
        result.dashPattern = [4, 4];
      } else if (cls.startsWith("border-") && !cls.includes("dashed")) {
        // Check for opacity modifier (e.g., border-kumo-danger/50)
        const opacityMatch = cls.match(/^(border-[^/]+)\/([0-9]+)$/);
        if (opacityMatch) {
          const baseClass = opacityMatch[1];
          const opacityValue = opacityMatch[2];
          const varName = COLOR_TO_VARIABLE[baseClass];
          if (varName) {
            result.strokeVariable = `${varName}/${opacityValue}`;
            result.strokeOpacity = parseInt(opacityValue, 10) / 100;
          }
        } else {
          const varName = COLOR_TO_VARIABLE[cls];
          if (varName) {
            result.strokeVariable = varName;
          }
        }
      }
      continue;
    }

    // Ring (used as border in some variants)
    if (cls === "ring" || cls.startsWith("ring-")) {
      result.hasBorder = true;
      // Check for opacity modifier (e.g., ring-kumo-ring/50)
      const opacityMatch = cls.match(/^(ring-[^/]+)\/([0-9]+)$/);
      if (opacityMatch) {
        const baseClass = opacityMatch[1];
        const opacityValue = opacityMatch[2];
        const varName = COLOR_TO_VARIABLE[baseClass];
        if (varName) {
          result.strokeVariable = `${varName}/${opacityValue}`;
          result.strokeOpacity = parseInt(opacityValue, 10) / 100;
        }
      } else {
        const varName = COLOR_TO_VARIABLE[cls];
        if (varName) {
          result.strokeVariable = varName;
        }
      }
      continue;
    }
  }

  return result;
}

/**
 * Parse base styles string (like from badgeVariants or buttonVariants)
 */
export function parseBaseStyles(baseStylesString: string): ParsedStyles {
  return parseTailwindClasses(baseStylesString);
}
