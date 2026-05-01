/**
 * Variant parsing for component registry generation.
 *
 * Extracts KUMO_*_VARIANTS, KUMO_*_DEFAULT_VARIANTS, and KUMO_*_STYLING from component files
 * using regex parsing to avoid import issues with JSX/React dependencies.
 */

import { readFileSync } from "node:fs";
import { extractBalancedBraces, extractStateClasses } from "./utils.js";
import type { ComponentStyling } from "./types.js";

// =============================================================================
// Types
// =============================================================================

export interface ExtractedVariants {
  // biome-ignore lint/suspicious/noExplicitAny: Variants have varying shapes
  variants: Record<string, Record<string, any>>;
  defaults: Record<string, string>;
  baseStyles: string | null;
}

// =============================================================================
// Base Styles Extraction
// =============================================================================

/**
 * Extract KUMO_*_BASE_STYLES from a component file.
 * Returns the base styles string or null if not found.
 */
export function extractBaseStylesFromFile(filePath: string): string | null {
  try {
    const content = readFileSync(filePath, "utf-8");

    // Match: export const KUMO_*_BASE_STYLES = "..." or '...' or `...`
    // Handles multi-line strings with template literals
    const baseStylesMatch = content.match(
      /export\s+const\s+KUMO_\w+_BASE_STYLES\s*=\s*["'`]([^"'`]+)["'`]/,
    );

    if (baseStylesMatch) {
      return baseStylesMatch[1].trim();
    }

    return null;
  } catch {
    return null;
  }
}

// =============================================================================
// Variants Object Parsing
// =============================================================================

/**
 * Parse a variants object string into a structured object.
 * Extracts variant keys and their descriptions.
 */
// biome-ignore lint/suspicious/noExplicitAny: Variants have varying shapes
export function parseVariantsObject(
  objStr: string,
): Record<string, Record<string, any>> {
  // biome-ignore lint/suspicious/noExplicitAny: Variants have varying shapes
  const result: Record<string, Record<string, any>> = {};

  // Find top-level property names (e.g., shape, size, variant)
  // These are identifiers followed by `: {` at the first nesting level
  const topLevelPropPattern = /^\s*(\w+)\s*:\s*\{/gm;
  let propMatch: RegExpExecArray | null;

  while ((propMatch = topLevelPropPattern.exec(objStr)) !== null) {
    const propName = propMatch[1];

    // Skip nested properties like classes, description
    if (["classes", "description"].includes(propName)) continue;

    // Extract the balanced brace block for this property
    const propStartIndex = propMatch.index + propMatch[0].length - 1; // Start at the {
    const propBlock = extractBalancedBraces(objStr, propStartIndex);

    if (!propBlock) continue;

    // Now parse the variant values within this block
    // biome-ignore lint/suspicious/noExplicitAny: Variants have varying shapes
    const variants: Record<string, any> = {};
    // Match variant names including quoted keys like "secondary-destructive"
    const variantPropPattern = /^\s*(?:"([^"]+)"|'([^']+)'|(\w+))\s*:\s*\{/gm;
    let variantMatch: RegExpExecArray | null;

    while ((variantMatch = variantPropPattern.exec(propBlock)) !== null) {
      // Capture group 1 = double-quoted, 2 = single-quoted, 3 = unquoted
      const variantName = variantMatch[1] || variantMatch[2] || variantMatch[3];

      // Skip nested properties
      if (["classes", "description"].includes(variantName)) continue;

      // Extract the balanced brace block for this variant
      const variantStartIndex = variantMatch.index + variantMatch[0].length - 1;
      const variantBlock = extractBalancedBraces(propBlock, variantStartIndex);

      if (!variantBlock) continue;

      // Extract description if present
      const descMatch = variantBlock.match(
        /description\s*:\s*["']([^"']*)["']/,
      );
      // Extract classes if present (for Figma plugin consumption)
      const classesMatch = variantBlock.match(/classes\s*:\s*["']([^"']*)["']/);

      // Extract state classes from the classes string
      const stateClasses = classesMatch
        ? extractStateClasses(classesMatch[1])
        : {};

      variants[variantName] = {
        description: descMatch ? descMatch[1] : undefined,
        ...(classesMatch && { classes: classesMatch[1] }),
        ...(Object.keys(stateClasses).length > 0 && { stateClasses }),
      };
    }

    if (Object.keys(variants).length > 0) {
      result[propName] = variants;
    }
  }

  return result;
}

/**
 * Parse a defaults object string into a key-value map.
 */
export function parseDefaultsObject(objStr: string): Record<string, string> {
  const result: Record<string, string> = {};

  // Match properties like: variant: "primary", size: "base"
  const propPattern = /(\w+)\s*:\s*["']([^"']*)["']/g;
  let match: RegExpExecArray | null;

  while ((match = propPattern.exec(objStr)) !== null) {
    result[match[1]] = match[2];
  }

  return result;
}

// =============================================================================
// Alias-aware brace extraction
// =============================================================================

const MAX_ALIAS_DEPTH = 4;

/**
 * Extract a balanced brace block starting at `position`, following identifier
 * aliases up to a small depth. Supports patterns like:
 *
 *   export const KUMO_FOO_VARIANTS = KUMO_BAR_VARIANTS;
 *
 * which rewires the brace search to the target constant's literal value.
 * Returns null if no object literal is reachable within the depth limit.
 */
function extractBraceBlockWithAliasing(
  content: string,
  position: number,
): string | null {
  // Strip leading whitespace before deciding between identifier vs. object.
  let cursor = position;
  while (cursor < content.length && /\s/.test(content[cursor])) {
    cursor += 1;
  }

  if (content[cursor] === "{") {
    return extractBalancedBraces(content, cursor);
  }

  // Identifier alias path. Walk the chain.
  for (let depth = 0; depth < MAX_ALIAS_DEPTH; depth += 1) {
    const aliasMatch = /^([A-Za-z_$][\w$]*)/.exec(content.slice(cursor));
    if (!aliasMatch) return null;

    const aliasName = aliasMatch[1];
    const aliasTarget = new RegExp(
      `(?:export\\s+)?const\\s+${aliasName}\\s*=\\s*`,
    ).exec(content);
    if (!aliasTarget) return null;

    cursor = aliasTarget.index + aliasTarget[0].length;
    while (cursor < content.length && /\s/.test(content[cursor])) {
      cursor += 1;
    }

    if (content[cursor] === "{") {
      return extractBalancedBraces(content, cursor);
    }
  }

  return null;
}

// =============================================================================
// Main Extraction
// =============================================================================

/**
 * Extract KUMO_*_VARIANTS and KUMO_*_DEFAULT_VARIANTS from a component file.
 * Uses regex parsing to avoid import issues with JSX/React dependencies.
 *
 * When `variantConstName` is provided (e.g. `KUMO_LINK_BUTTON_VARIANTS`), the
 * extractor scopes its search to that exact constant. This allows several
 * components in the same file to declare distinct variant tables. When
 * omitted, the first `KUMO_*_VARIANTS` export wins (legacy behavior).
 */
export function extractVariantsFromFile(
  filePath: string,
  variantConstName?: string,
): ExtractedVariants | null {
  try {
    const content = readFileSync(filePath, "utf-8");

    const variantsRegex = variantConstName
      ? new RegExp(`export\\s+const\\s+${variantConstName}\\s*=\\s*`)
      : /export\s+const\s+KUMO_\w+_VARIANTS\s*=\s*/;
    const defaultsConstName = variantConstName
      ? variantConstName.replace(/_VARIANTS$/, "_DEFAULT_VARIANTS")
      : null;
    const defaultsRegex = defaultsConstName
      ? new RegExp(`export\\s+const\\s+${defaultsConstName}\\s*=\\s*`)
      : /export\s+const\s+KUMO_\w+_DEFAULT_VARIANTS\s*=\s*/;

    // Find KUMO_*_VARIANTS export start position
    const variantsStartMatch = content.match(variantsRegex);
    // Find KUMO_*_DEFAULT_VARIANTS export start position
    const defaultsStartMatch = content.match(defaultsRegex);

    if (!variantsStartMatch || !defaultsStartMatch) {
      return null;
    }

    // Extract balanced brace content for variants. Handle alias chains like
    // `export const KUMO_LINK_BUTTON_VARIANTS = KUMO_BUTTON_VARIANTS` by
    // resolving the identifier and re-extracting from the target.
    const variantsBlock = extractBraceBlockWithAliasing(
      content,
      (variantsStartMatch.index ?? 0) + variantsStartMatch[0].length,
    );

    const defaultsBlock = extractBraceBlockWithAliasing(
      content,
      (defaultsStartMatch.index ?? 0) + defaultsStartMatch[0].length,
    );

    if (!variantsBlock || !defaultsBlock) {
      return null;
    }

    // Parse the variants object (may be empty for components without variants)
    const variants = parseVariantsObject(variantsBlock);
    const defaults = parseDefaultsObject(defaultsBlock);

    // Extract base styles if present
    const baseStyles = extractBaseStylesFromFile(filePath);

    // Return even if variants is empty - component still has props to document
    return { variants, defaults, baseStyles };
  } catch {
    return null;
  }
}

// =============================================================================
// Styling Extraction
// =============================================================================

/**
 * Parse a styling object string into a ComponentStyling object.
 * Handles nested objects like container, title, description, closeButton, etc.
 */
function parseStylingObject(objStr: string): ComponentStyling | null {
  try {
    // Remove 'as const' suffix if present
    const cleanedStr = objStr.replace(/\s*as\s+const\s*$/, "");

    // Use Function constructor to safely evaluate the object literal
    // This is safe because we control the input (it comes from our own source files)
    // biome-ignore lint/security/noGlobalEval: Safe evaluation of known source file content
    const parsed = new Function(`return ${cleanedStr}`)();

    return parsed as ComponentStyling;
  } catch {
    return null;
  }
}

/**
 * Extract KUMO_*_STYLING from a component file.
 * Returns the styling object or null if not found.
 *
 * This allows components to define Figma-specific styling metadata
 * that gets automatically picked up by the registry generator.
 */
export function extractStylingFromFile(
  filePath: string,
): ComponentStyling | null {
  try {
    const content = readFileSync(filePath, "utf-8");

    // Find KUMO_*_STYLING export start position
    const stylingStartMatch = content.match(
      /export\s+const\s+KUMO_\w+_STYLING\s*=\s*/,
    );

    if (!stylingStartMatch) {
      return null;
    }

    // Extract balanced brace content for styling
    const stylingStartIndex =
      (stylingStartMatch.index ?? 0) + stylingStartMatch[0].length;
    const stylingBlock = extractBalancedBraces(content, stylingStartIndex);

    if (!stylingBlock) {
      return null;
    }

    return parseStylingObject(stylingBlock);
  } catch {
    return null;
  }
}
