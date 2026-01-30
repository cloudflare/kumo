import { defineRule } from "oxlint";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const RULE_NAME = "no-primitive-colors";
const INVALID_TOKEN_RULE = "invalid-color-token";

// We want to enforce use of Kumo semantic color tokens `--color-kumo-*`.
// Any Tailwind color utility (e.g. `bg-blue-500`) or legacy semantic
// utility (e.g. `bg-kumo-ring`, `text-kumo-default`) in class strings should be
// replaced by semantic tokens / component APIs.

// Matches Tailwind-like color utilities in class strings.
// Example matches: bg-blue-500, text-surface, border-primary/50, hover:bg-sky-100

export const TOKEN_RE =
  /(?:^|[^a-zA-Z0-9-])(((?:[a-z-]+:)*)?(?:bg|border|text|ring(?:-offset)?|fill|stroke|placeholder|caret|accent|decoration|divide|outline|from|via|to)-([a-z][a-z0-9-]*)(?:-\d{2,3})?(?:\/[0-9]{1,3})?)/gim;

export const TAILWIND_COLOR_FAMILIES = new Set([
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
  // Note: "black", "white", and "transparent" are intentionally excluded
  // so utilities like bg-white, text-black, ring-transparent are allowed.
]);

// Tailwind's built-in color names that are always valid
const BUILTIN_COLORS = new Set(["white", "black"]);

// Non-color utilities that look like color tokens but aren't
const NON_COLOR_UTILITIES = new Set([
  // Text utilities (not colors)
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
  // Special color values (valid for all prefixes)
  "transparent",
  "current",
  "inherit",
  "none",
  // Border utilities (not colors)
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
  // Ring utilities (not colors)
  "1",
  "inset",
  // Shadow utilities (not colors)
  "inner",
  // Divide utilities (not colors)
]);

// Patterns that look like color tokens but are actually other utilities
// These use regex patterns for more flexible matching
const NON_COLOR_PATTERNS = [
  // Gradient directions: bg-linear-to-r, bg-linear-to-bl, etc.
  /^linear-to-[trbl]{1,2}$/,
  // Border directional + size: border-l-2, border-t-4, etc.
  /^[trblxy]-\d+$/,
  // Outline/ring offset utilities: outline-offset-3, ring-offset-2, etc.
  /^offset-\d+$/,
  // Generic numeric utilities
  /^\d+$/,
  // Background clip utilities: bg-clip-padding, bg-clip-content, etc.
  /^clip-.+$/,
];

// Parse theme CSS files to extract valid semantic color tokens.
// This ensures the allowlist stays in sync with the theme files.
function parseKumoSemanticColors() {
  const themeFiles = [
    resolve(__dirname, "../src/styles/theme-kumo.css"),
    resolve(__dirname, "../src/styles/theme-fedramp.css"),
  ];

  const colorTokens = new Set();
  const textColorTokens = new Set();

  for (const themePath of themeFiles) {
    try {
      const css = readFileSync(themePath, "utf-8");

      // Match --color-<name> custom properties (excluding --text-color-*)
      const colorPropRe = /--color-([a-z][a-z0-9-]*)(?=\s*:)/gi;
      let match;
      while ((match = colorPropRe.exec(css))) {
        const name = match[1];
        // Skip Tailwind primitive color definitions (e.g. red-650, blue-400, neutral-50)
        // These have 2-3 digit shade values. Single digit suffixes like green-2 are valid semantic tokens.
        if (/^[a-z]+-\d{2,3}$/.test(name)) continue;
        colorTokens.add(name);
      }

      // Match --text-color-<name> custom properties separately
      const textColorPropRe = /--text-color-([a-z][a-z0-9-]*)(?=\s*:)/gi;
      while ((match = textColorPropRe.exec(css))) {
        textColorTokens.add(match[1]);
      }
    } catch {
      // File doesn't exist, skip
    }
  }

  // Add built-in colors to both sets
  for (const color of BUILTIN_COLORS) {
    colorTokens.add(color);
    textColorTokens.add(color);
  }

  return { colorTokens, textColorTokens };
}

// Valid Kumo semantic color tokens derived from theme CSS files.
// colorTokens: map to --color-* (used by bg-*, border-*, ring-*, etc.)
// textColorTokens: map to --text-color-* (used by text-*)
const {
  colorTokens: VALID_COLOR_TOKENS,
  textColorTokens: VALID_TEXT_COLOR_TOKENS,
} = parseKumoSemanticColors();

// Legacy export for backwards compatibility
export const VALID_KUMO_SEMANTIC_COLORS = new Set([
  ...VALID_COLOR_TOKENS,
  ...VALID_TEXT_COLOR_TOKENS,
]);

function extractStrings(node) {
  if (!node) return [];
  const out = [];

  switch (node.type) {
    case "Literal": {
      if (typeof node.value === "string") out.push(node.value);
      break;
    }
    case "TemplateLiteral": {
      for (const q of node.quasis) {
        if (typeof q.value.cooked === "string") out.push(q.value.cooked);
      }
      break;
    }
    case "BinaryExpression": {
      if (node.operator === "+") {
        out.push(...extractStrings(node.left));
        out.push(...extractStrings(node.right));
      }
      break;
    }
    case "ArrayExpression": {
      for (const el of node.elements) {
        if (el) {
          out.push(...extractStrings(el));
        }
      }
      break;
    }
    case "ObjectExpression": {
      for (const prop of node.properties) {
        if (prop.type === "Property") {
          out.push(...extractStrings(prop.key));
          out.push(...extractStrings(prop.value));
        }
      }
      break;
    }
    case "CallExpression": {
      for (const arg of node.arguments) {
        if (arg.type === "SpreadElement") continue;
        out.push(...extractStrings(arg));
      }
      break;
    }
    case "ConditionalExpression": {
      out.push(...extractStrings(node.consequent));
      out.push(...extractStrings(node.alternate));
      out.push(...extractStrings(node.test));
      break;
    }
    case "UnaryExpression": {
      out.push(...extractStrings(node.argument));
      break;
    }
    case "LogicalExpression": {
      out.push(...extractStrings(node.left));
      out.push(...extractStrings(node.right));
      break;
    }
    case "JSXText": {
      out.push(node.value);
      break;
    }
    case "JSXExpressionContainer": {
      out.push(...extractStrings(node.expression));
      break;
    }
  }

  return out;
}

// Prefixes that use --color-* tokens
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

// Prefixes that use --text-color-* tokens
const TEXT_COLOR_PREFIXES = new Set(["text"]);

/**
 * Check if a string contains primitive Tailwind colors.
 * Returns the first invalid token found, or null if all are valid.
 */
function findPrimitiveColor(str) {
  if (!str) return null;

  TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = TOKEN_RE.exec(str))) {
    const fullToken = match[1];
    const colorFamily = match[3];

    if (!fullToken || !colorFamily) continue;

    // Skip valid Kumo semantic color tokens (e.g. bg-surface, text-secondary,
    // border-kumo-fill). These are backed by theme-kumo.css custom properties.
    if (VALID_KUMO_SEMANTIC_COLORS.has(colorFamily)) continue;

    // Flag kumo- prefixed classes (e.g. text-kumo-surface).
    // These are invalid; use semantic tokens directly (e.g. text-kumo-default).
    if (colorFamily.startsWith("kumo-"))
      return { type: "primitive", token: fullToken };

    // Flag Tailwind primitive color families (e.g. blue, slate, red).
    // Tailwind utilities often use a numeric shade suffix (e.g. neutral-500).
    // The regex captures the color name which may include a trailing numeric
    // segment (e.g. "green-2" from text-green-2). Strip trailing -N segments
    // to get the base family name for checking against Tailwind primitives.
    const primitiveFamily = colorFamily.replace(/-\d+$/, "");

    // Only flag if it's a Tailwind primitive AND not a valid Kumo semantic token.
    // This handles cases like "green-2" where "green" is a Tailwind primitive
    // but "green-2" is a valid Kumo semantic token.
    if (
      TAILWIND_COLOR_FAMILIES.has(primitiveFamily) &&
      !VALID_KUMO_SEMANTIC_COLORS.has(colorFamily)
    )
      return { type: "primitive", token: fullToken };
  }

  return null;
}

/**
 * Check if a token name matches any non-color pattern
 */
function isNonColorUtility(tokenName) {
  if (NON_COLOR_UTILITIES.has(tokenName)) return true;
  return NON_COLOR_PATTERNS.some((pattern) => pattern.test(tokenName));
}

/**
 * Check if a string contains invalid/unknown color tokens.
 * Returns the first invalid token found, or null if all are valid.
 */
function findInvalidToken(str) {
  if (!str) return null;

  TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = TOKEN_RE.exec(str))) {
    const fullToken = match[1];
    const colorFamily = match[3];

    if (!fullToken || !colorFamily) continue;

    // Skip non-color utilities (both exact matches and patterns)
    if (isNonColorUtility(colorFamily)) continue;

    // Skip arbitrary values (e.g., bg-[#fff])
    if (colorFamily.startsWith("[")) continue;

    // Determine the prefix to check which token set to validate against
    const prefixMatch = fullToken.match(
      /^(?:[a-z-]+:)*(bg|border|text|ring(?:-offset)?|fill|stroke|placeholder|caret|accent|decoration|divide|outline|from|via|to)-/i,
    );
    if (!prefixMatch) continue;

    const prefix = prefixMatch[1].toLowerCase();

    // Remove opacity modifier for token lookup (e.g., "surface/50" -> "surface")
    const tokenName = colorFamily.replace(/\/\d+$/, "");

    // Skip if the token name (without opacity) is a non-color utility
    if (isNonColorUtility(tokenName)) continue;

    // Check if it's a text-* utility
    if (TEXT_COLOR_PREFIXES.has(prefix)) {
      // text-* maps to --text-color-* tokens
      if (
        !VALID_TEXT_COLOR_TOKENS.has(tokenName) &&
        !BUILTIN_COLORS.has(tokenName)
      ) {
        // Not a Tailwind primitive (already caught by findPrimitiveColor)
        const primitiveFamily = tokenName.replace(/-\d+$/, "");
        if (!TAILWIND_COLOR_FAMILIES.has(primitiveFamily)) {
          return { type: "invalid", token: fullToken, tokenName };
        }
      }
    } else if (COLOR_PREFIXES.has(prefix)) {
      // Other prefixes map to --color-* tokens
      if (
        !VALID_COLOR_TOKENS.has(tokenName) &&
        !BUILTIN_COLORS.has(tokenName)
      ) {
        // Not a Tailwind primitive (already caught by findPrimitiveColor)
        const primitiveFamily = tokenName.replace(/-\d+$/, "");
        if (!TAILWIND_COLOR_FAMILIES.has(primitiveFamily)) {
          return { type: "invalid", token: fullToken, tokenName };
        }
      }
    }
  }

  return null;
}

export const noPrimitiveColorsRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow Tailwind primitive colors and invalid/unknown semantic color tokens.",
    },
    messages: {
      [RULE_NAME]:
        "Avoid Tailwind color utilities (e.g. `bg-blue-500`, `border-red-500`). Use Kumo semantic tokens instead.",
      [INVALID_TOKEN_RULE]:
        "Invalid color token '{{token}}'. Token '{{tokenName}}' is not defined in theme-kumo.css or theme-fedramp.css.",
    },
    schema: [],
  },
  defaultOptions: [],
  createOnce(context) {
    function reportColorIssues(node, collected) {
      for (const s of collected) {
        // First check for primitive Tailwind colors
        const primitive = findPrimitiveColor(s);
        if (primitive) {
          context.report({ node, messageId: RULE_NAME });
          return;
        }

        // Then check for invalid/unknown semantic tokens
        const invalid = findInvalidToken(s);
        if (invalid) {
          context.report({
            node,
            messageId: INVALID_TOKEN_RULE,
            data: { token: invalid.token, tokenName: invalid.tokenName },
          });
          return;
        }
      }
    }

    return {
      JSXAttribute(node) {
        const name =
          node.name.type === "JSXIdentifier" ? node.name.name : undefined;
        if (name !== "className" && name !== "class") return;

        if (node.value) {
          const strings = extractStrings(node.value);
          reportColorIssues(node, strings);
        }
      },
    };
  },
});
