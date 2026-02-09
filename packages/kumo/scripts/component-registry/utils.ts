/**
 * Utility functions for component registry generation.
 *
 * Pure functions for string transformations and common operations.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// =============================================================================
// String Transformation Utilities
// =============================================================================

/**
 * Convert kebab-case to PascalCase.
 * Example: "clipboard-text" -> "ClipboardText"
 */
export function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Convert PascalCase to SCREAMING_SNAKE_CASE.
 * Example: "ClipboardText" -> "CLIPBOARD_TEXT"
 */
export function toScreamingSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toUpperCase();
}

// =============================================================================
// Balanced Brace Extraction
// =============================================================================

/**
 * Extract a balanced brace block starting from a position in the string.
 * Returns the content between the outermost braces, or null if unbalanced.
 */
export function extractBalancedBraces(
  content: string,
  startIndex: number,
): string | null {
  let depth = 0;
  let start = -1;

  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (content[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        return content.substring(start, i + 1);
      }
    }
  }
  return null;
}

// =============================================================================
// Semantic Color Parsing
// =============================================================================

let _semanticColorNames: string[] | null = null;

/**
 * Parse theme-kumo.css to extract semantic color names from --color-* and --text-color-* variables.
 * Excludes raw palette colors (e.g., --color-red-650, --color-neutral-50) which have numeric suffixes.
 * Results are cached for performance.
 */
export function parseSemanticColorNames(): string[] {
  if (_semanticColorNames) {
    return _semanticColorNames;
  }

  const themePath = join(__dirname, "../../src/styles/theme-kumo.css");
  const content = readFileSync(themePath, "utf-8");

  const colorNames = new Set<string>();

  // Match semantic color variable declarations that use light-dark()
  // Pattern: "--color-<name>: light-dark(" or "--text-color-<name>: light-dark("
  // This excludes raw palette colors which are defined with direct values like "oklch(...)"
  const semanticColorPattern =
    /--(?:text-)?color-([a-zA-Z][a-zA-Z0-9-]*)\s*:\s*light-dark\(/g;
  let match: RegExpExecArray | null;

  while ((match = semanticColorPattern.exec(content)) !== null) {
    colorNames.add(match[1]);
  }

  _semanticColorNames = [...colorNames].sort();
  return _semanticColorNames;
}

// Utility prefixes that use color tokens
const COLOR_UTILITY_PREFIXES = [
  "text",
  "bg",
  "ring",
  "outline",
  "fill",
  "border",
];

/**
 * Extract semantic color classes used in a source file.
 * Returns array of Tailwind classes like ["bg-kumo-base", "text-kumo-subtle"].
 */
export function extractSemanticColors(sourceFile: string): string[] {
  try {
    const content = readFileSync(sourceFile, "utf-8");
    const matches: string[] = [];
    const semanticColorNames = parseSemanticColorNames();

    // Build regex pattern for each prefix + semantic color combination
    // Match patterns like: text-surface, bg-primary, border-color, ring-kumo-line
    // Also handles variants like: hover:bg-primary, disabled:text-kumo-subtle
    for (const prefix of COLOR_UTILITY_PREFIXES) {
      for (const colorName of semanticColorNames) {
        // Escape hyphens for regex and create pattern
        const pattern = new RegExp(
          `(?:[\\w\\[\\]=_-]+:)*(${prefix}-${colorName})(?![a-zA-Z0-9-])`,
          "g",
        );
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(content)) !== null) {
          matches.push(match[1]);
        }
      }
    }

    return [...new Set(matches)].sort();
  } catch {
    return [];
  }
}

// =============================================================================
// State Class Extraction
// =============================================================================

/**
 * Extract state-specific classes from a class string.
 * Identifies hover:*, focus:*, active:*, disabled:*, not-disabled:* prefixes.
 * Also handles complex selectors like [&:hover>span], [&:focus-within>span].
 */
export function extractStateClasses(
  classString: string,
): Record<string, string> {
  const states: Record<string, string> = {};

  // Split by whitespace to process each class individually
  const classes = classString.split(/\s+/);

  for (const cls of classes) {
    if (!cls) continue;

    // Check for hover states
    if (cls.startsWith("hover:") || cls.match(/^\[&:hover[^\]]*\]:/)) {
      states.hover = states.hover ? `${states.hover} ${cls}` : cls;
    }
    // Check for focus states (focus, focus-visible, focus-within)
    else if (
      cls.match(/^(focus|focus-visible|focus-within):/) ||
      cls.match(/^\[&:focus(-visible|-within)?[^\]]*\]:/)
    ) {
      states.focus = states.focus ? `${states.focus} ${cls}` : cls;
    }
    // Check for active state
    else if (cls.startsWith("active:")) {
      states.active = states.active ? `${states.active} ${cls}` : cls;
    }
    // Check for disabled state
    else if (cls.startsWith("disabled:")) {
      states.disabled = states.disabled ? `${states.disabled} ${cls}` : cls;
    }
    // Check for not-disabled state
    else if (cls.startsWith("not-disabled:")) {
      states["not-disabled"] = states["not-disabled"]
        ? `${states["not-disabled"]} ${cls}`
        : cls;
    }
    // Check for data-state
    else if (cls.match(/^data-\[state=[^\]]+\]:/)) {
      states["data-state"] = states["data-state"]
        ? `${states["data-state"]} ${cls}`
        : cls;
    }
    // Check for data-pressed
    else if (cls.match(/^data-\[pressed\]:/)) {
      states["data-pressed"] = states["data-pressed"]
        ? `${states["data-pressed"]} ${cls}`
        : cls;
    }
  }

  return states;
}

// =============================================================================
// Block Dependency Extraction
// =============================================================================

/**
 * Extract component dependencies from a block file.
 * Returns array of component names imported from "../../components/*"
 * Example: import { Tabs } from "../../components/tabs" -> ["Tabs"]
 */
export function extractBlockDependencies(sourceFile: string): string[] {
  try {
    const content = readFileSync(sourceFile, "utf-8");
    const dependencies = new Set<string>();

    // Match imports from ../../components/* or ../../blocks/*
    // Pattern: import { Foo, Bar } from "../../components/something"
    // Pattern: import { Foo } from "../../blocks/something"
    const importPattern =
      /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']\.\.\/\.\.\/(?:components|blocks)\/[^"']+["']/g;
    let match: RegExpExecArray | null;

    while ((match = importPattern.exec(content)) !== null) {
      const importList = match[1];
      // Split by comma and extract component names
      const items = importList
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      for (const item of items) {
        // Skip type imports
        if (item.startsWith("type ")) {
          continue;
        }
        // Extract name (handle "Foo as Bar" -> "Foo")
        const nameMatch = item.match(/^(\w+)(?:\s+as\s+\w+)?/);
        if (nameMatch) {
          dependencies.add(nameMatch[1]);
        }
      }
    }

    return [...dependencies].sort();
  } catch {
    return [];
  }
}

/**
 * Get all files for a block (main file + stories + tests if they exist)
 * Returns array of file paths relative to the blocks directory
 */
export function getBlockFiles(blockDir: string, dirName: string): string[] {
  const files: string[] = [];

  // Main file (always exists)
  files.push(`${dirName}/${dirName}.tsx`);

  // Check for stories
  const storiesPath = join(blockDir, dirName, `${dirName}.stories.tsx`);
  try {
    readFileSync(storiesPath);
    files.push(`${dirName}/${dirName}.stories.tsx`);
  } catch {
    // Stories file doesn't exist
  }

  // Check for tests
  const testPath = join(blockDir, dirName, `${dirName}.test.tsx`);
  try {
    readFileSync(testPath);
    files.push(`${dirName}/${dirName}.test.tsx`);
  } catch {
    // Test file doesn't exist
  }

  return files;
}
