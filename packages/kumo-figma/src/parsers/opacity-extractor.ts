/**
 * Opacity Extractor
 *
 * Parses component source files for Tailwind opacity modifiers.
 * Extracts patterns like `bg-kumo-brand/70`, `text-kumo-danger/50` and generates
 * Figma variable definitions for `opacity-primary-70`, `opacity-error-50`, etc.
 *
 * @example
 * // Input from button.tsx:
 * // "bg-kumo-brand/70 hover:bg-kumo-brand/50"
 *
 * // Output:
 * // [
 * //   { token: "primary", opacity: 70 },
 * //   { token: "primary", opacity: 50 }
 * // ]
 */

/**
 * Opacity modifier extracted from source code
 */
export type OpacityModifier = {
  /** Base token name (e.g., "primary", "error", "secondary") */
  token: string;
  /** Opacity value as percentage (e.g., 70, 50) */
  opacity: number;
  /** Full variable name for Figma (e.g., "opacity-primary-70") */
  variableName: string;
};

/**
 * Regex pattern to match Tailwind opacity modifiers
 * Matches: (bg|text|border|ring)-(\w+)/(\d+)
 *
 * Examples:
 * - bg-kumo-brand/70 → token: "primary", opacity: 70
 * - text-kumo-danger/50 → token: "error", opacity: 50
 * - border-kumo-control/30 → token: "secondary", opacity: 30
 */
const OPACITY_PATTERN = /(bg|text|border|ring)-(\w+)\/(\d+)/g;

/**
 * Extract opacity modifiers from source code
 *
 * @param sourceCode - Component source code (TypeScript/TSX)
 * @returns Array of unique opacity modifiers
 *
 * @example
 * const code = `
 *   primary: "bg-kumo-brand hover:bg-kumo-brand/70 disabled:bg-kumo-brand/50",
 *   error: "bg-kumo-danger text-white hover:bg-kumo-danger/70"
 * `;
 * const modifiers = extractOpacityModifiers(code);
 * // [
 * //   { token: "primary", opacity: 70, variableName: "opacity-primary-70" },
 * //   { token: "primary", opacity: 50, variableName: "opacity-primary-50" },
 * //   { token: "error", opacity: 70, variableName: "opacity-error-70" }
 * // ]
 */
export function extractOpacityModifiers(sourceCode: string): OpacityModifier[] {
  const matches: OpacityModifier[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = OPACITY_PATTERN.exec(sourceCode)) !== null) {
    const [, , token, opacityStr] = match;
    const opacity = parseInt(opacityStr, 10);
    const variableName = `opacity-${token}-${opacity}`;

    // Deduplicate
    if (!seen.has(variableName)) {
      seen.add(variableName);
      matches.push({ token, opacity, variableName });
    }
  }

  return matches;
}

/**
 * Extract opacity modifiers from multiple source code strings
 *
 * Note: In Figma plugin context, network access is not available.
 * Source files must be bundled/embedded at build time.
 * This function accepts pre-loaded source code strings.
 *
 * @param sources - Array of source code strings to scan
 * @returns Array of unique opacity modifiers across all sources
 *
 * @example
 * // At build time, bundle source files as strings:
 * const buttonSource = `...contents of button.tsx...`;
 * const badgeSource = `...contents of badge.tsx...`;
 * const modifiers = extractOpacityModifiersFromSources([buttonSource, badgeSource]);
 */
export function extractOpacityModifiersFromSources(
  sources: string[],
): OpacityModifier[] {
  const allModifiers: OpacityModifier[] = [];
  const seen = new Set<string>();

  for (const sourceCode of sources) {
    const modifiers = extractOpacityModifiers(sourceCode);
    for (const mod of modifiers) {
      if (!seen.has(mod.variableName)) {
        seen.add(mod.variableName);
        allModifiers.push(mod);
      }
    }
  }

  return allModifiers;
}

/**
 * Pre-extracted opacity modifiers from Kumo component source files.
 * These are extracted at build time and bundled with the plugin.
 *
 * To regenerate, run: `pnpm build:ai-metadata` and update this list.
 *
 * Source files scanned:
 * - packages/kumo/src/components/button/button.tsx
 * - packages/kumo/src/components/badge/badge.tsx
 */
export const BUNDLED_OPACITY_MODIFIERS: OpacityModifier[] = [
  // From button.tsx primary variant: hover:bg-primary/70, disabled:bg-kumo-brand/50
  { token: "primary", opacity: 70, variableName: "opacity-primary-70" },
  { token: "primary", opacity: 50, variableName: "opacity-primary-50" },
  // From button.tsx secondary variant: disabled:bg-secondary/50, disabled:!text-kumo-default/70
  { token: "secondary", opacity: 50, variableName: "opacity-secondary-50" },
  { token: "surface", opacity: 70, variableName: "opacity-surface-70" },
  // From button.tsx destructive variant: hover:bg-kumo-danger/70
  { token: "error", opacity: 70, variableName: "opacity-error-70" },
  // From button.tsx secondary-destructive variant: disabled:!text-kumo-danger/70
  { token: "error", opacity: 70, variableName: "opacity-error-70" }, // Deduplicated
];

/**
 * Generate opacity variable name from token and opacity value
 *
 * @param token - Base token name (e.g., "primary")
 * @param opacity - Opacity percentage (e.g., 70)
 * @returns Variable name (e.g., "opacity-primary-70")
 */
export function generateOpacityVariableName(
  token: string,
  opacity: number,
): string {
  return `opacity-${token}-${opacity}`;
}
