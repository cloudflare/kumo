import { defineRule } from "oxlint";

const RULE_NAME = "no-cross-package-imports";

// Known package directory names in this monorepo
const PACKAGE_DIRS = new Set(["kumo", "kumo-docs-astro", "kumo-figma"]);

// Pattern to detect relative imports that traverse up to packages/ level
// and then into a sibling package directory.
// This looks for paths like:
//   ../../kumo/... (from packages/kumo-docs-astro/src/foo.ts)
//   ../../../kumo/... (from packages/kumo-docs-astro/src/deep/foo.ts)
//
// The key insight: we need enough "../" to escape the current package's src/
// directory and land in packages/, then go into another package.
//
// We detect this by looking for patterns where a package name appears
// right after the "../" traversal sequence, which indicates leaving
// the current package and entering a sibling.
const CROSS_PACKAGE_PATTERN = /^((?:\.\.\/)+)([a-z0-9-]+)\//;

/**
 * Check if an import path is a cross-package relative import.
 * Returns the package name if it is, null otherwise.
 *
 * We consider it a cross-package import if:
 * 1. The path starts with "../" (going up from current directory)
 * 2. After the "../" sequence, it immediately enters a known package directory
 * 3. The number of "../" is >= 2 (minimum to escape src/ and reach packages/)
 *
 * This avoids false positives for local directories that happen to be named
 * like packages (e.g., ./kumo/ or ../kumo/ within the same package).
 */
function getCrossPackageImport(importPath) {
  if (!importPath || !importPath.startsWith("..")) {
    return null;
  }

  const match = importPath.match(CROSS_PACKAGE_PATTERN);
  if (!match) {
    return null;
  }

  const traversal = match[1]; // The "../../../" part
  const packageDir = match[2]; // The directory name after traversal

  // Count how many levels we're going up
  const levelsUp = (traversal.match(/\.\.\//g) || []).length;

  // If we're only going up 1 level (../package/), it's likely a local
  // directory within the same package. Cross-package imports typically
  // need at least 2 levels (../../package/) to escape src/ and reach
  // the packages/ directory.
  if (levelsUp < 2) {
    return null;
  }

  // Check if the target directory is a known package
  if (PACKAGE_DIRS.has(packageDir)) {
    return packageDir;
  }

  return null;
}

/**
 * Get the source value from an import declaration or expression.
 */
function getImportSource(node) {
  // Static import: import x from "../kumo/foo"
  if (node.source && node.source.type === "Literal") {
    return node.source.value;
  }
  // Dynamic import: import("../kumo/foo")
  if (
    node.type === "ImportExpression" &&
    node.source &&
    node.source.type === "Literal"
  ) {
    return node.source.value;
  }
  return null;
}

export const noCrossPackageImportsRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow relative imports that reach into sibling packages in the monorepo",
    },
    messages: {
      [RULE_NAME]:
        "Cross-package relative import detected. Import from '{{packageName}}' using its package name (e.g., '@cloudflare/{{packageName}}') instead of relative paths ('{{importPath}}').",
    },
    schema: [],
  },
  defaultOptions: [],
  createOnce(context) {
    function checkImport(node, importPath) {
      const packageName = getCrossPackageImport(importPath);
      if (packageName) {
        context.report({
          node,
          messageId: RULE_NAME,
          data: {
            packageName,
            importPath,
          },
        });
      }
    }

    return {
      // Static imports: import x from "../kumo/foo"
      ImportDeclaration(node) {
        const source = getImportSource(node);
        if (source) {
          checkImport(node, source);
        }
      },

      // Dynamic imports: import("../kumo/foo")
      ImportExpression(node) {
        const source = getImportSource(node);
        if (source) {
          checkImport(node, source);
        }
      },

      // require() calls: require("../kumo/foo")
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "require" &&
          node.arguments.length > 0 &&
          node.arguments[0].type === "Literal" &&
          typeof node.arguments[0].value === "string"
        ) {
          checkImport(node, node.arguments[0].value);
        }
      },

      // export from: export { x } from "../kumo/foo"
      ExportNamedDeclaration(node) {
        if (node.source) {
          const source = getImportSource(node);
          if (source) {
            checkImport(node, source);
          }
        }
      },

      // export * from "../kumo/foo"
      ExportAllDeclaration(node) {
        const source = getImportSource(node);
        if (source) {
          checkImport(node, source);
        }
      },
    };
  },
});
