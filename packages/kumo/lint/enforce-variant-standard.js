import { defineRule } from "oxlint";

/**
 * Enforces the Kumo variant export standard for components:
 * - KUMO_{COMPONENT}_VARIANTS (required)
 * - KUMO_{COMPONENT}_DEFAULT_VARIANTS (required)
 * - KUMO_{COMPONENT}_BASE_STYLES (optional, but must have KUMO_ prefix)
 *
 * Only applies to files in src/components/**\/*.tsx
 */

/**
 * Components that don't require KUMO_*_VARIANTS exports.
 * These are typically wrapper components around third-party libraries.
 */
const VARIANT_EXEMPT_COMPONENTS = ["DATE_PICKER"];

/**
 * Extract component name from file path.
 * Example: "src/components/button/button.tsx" -> "BUTTON"
 */
function getComponentNameFromPath(filename) {
  const match = filename.match(/src\/components\/([^/]+)\/\1\.tsx$/);
  if (!match) return null;
  return match[1].toUpperCase().replace(/-/g, "_");
}

/**
 * Convert PascalCase to SCREAMING_SNAKE_CASE.
 * "LinkButton" -> "LINK_BUTTON"
 */
function toScreamingSnakeCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toUpperCase();
}

/**
 * Check if export name matches expected pattern. Accepts the directory name
 * plus any extra component names in `extraComponentNames` (so files that host
 * multiple sibling components can pass lint).
 *
 * Returns { valid: boolean, expectedName?: string, exportType?: string }
 */
function validateExportName(exportName, componentName, extraComponentNames) {
  const allowed = [componentName, ...extraComponentNames];

  for (const name of allowed) {
    if (exportName === `KUMO_${name}_VARIANTS`) {
      return { valid: true, exportType: "VARIANTS" };
    }
    if (exportName === `KUMO_${name}_DEFAULT_VARIANTS`) {
      return { valid: true, exportType: "DEFAULT_VARIANTS" };
    }
    if (exportName === `KUMO_${name}_BASE_STYLES`) {
      return { valid: true, exportType: "BASE_STYLES" };
    }
  }

  // Default expected names use the directory-based component name.
  const variantsPattern = `KUMO_${componentName}_VARIANTS`;
  const defaultVariantsPattern = `KUMO_${componentName}_DEFAULT_VARIANTS`;
  const baseStylesPattern = `KUMO_${componentName}_BASE_STYLES`;

  // Check for incorrect naming patterns
  if (exportName.endsWith("_VARIANTS") && exportName.startsWith("KUMO_")) {
    return {
      valid: false,
      expectedName: variantsPattern,
      exportType: "VARIANTS",
    };
  }
  if (
    exportName.endsWith("_DEFAULT_VARIANTS") &&
    exportName.startsWith("KUMO_")
  ) {
    return {
      valid: false,
      expectedName: defaultVariantsPattern,
      exportType: "DEFAULT_VARIANTS",
    };
  }
  if (exportName.endsWith("_BASE_STYLES")) {
    // BASE_STYLES must have KUMO_ prefix
    if (!exportName.startsWith("KUMO_")) {
      return {
        valid: false,
        expectedName: baseStylesPattern,
        exportType: "BASE_STYLES",
      };
    }
    // Wrong component name
    return {
      valid: false,
      expectedName: baseStylesPattern,
      exportType: "BASE_STYLES",
    };
  }

  return { valid: true }; // Not a variant-related export
}

export const enforceVariantStandardRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce Kumo variant standard: KUMO_{COMPONENT}_VARIANTS, KUMO_{COMPONENT}_DEFAULT_VARIANTS, and optionally KUMO_{COMPONENT}_BASE_STYLES",
    },
    messages: {
      incorrectName:
        "Export name '{{actual}}' should be '{{expected}}' to follow Kumo variant naming convention",
      missingVariants:
        "Component must export KUMO_{{component}}_VARIANTS. Found: {{found}}",
      missingDefaultVariants:
        "Component must export KUMO_{{component}}_DEFAULT_VARIANTS. Found: {{found}}",
    },
    schema: [],
  },
  defaultOptions: [],
  createOnce(context) {
    let foundExports = new Set();
    /** @type {Array<{ exportName: string, node: object }>} */
    let variantExports = [];
    /** Set of PascalCase component-shaped names exported from this file. */
    let exportedComponentNames = new Set();
    let programNode = null;
    let filename = null;
    let componentName = null;
    let shouldCheck = false;

    return {
      Program(node) {
        programNode = node;
        filename = context.filename;

        // Reset per-file state. `createOnce` shares closure state across the
        // run, so we must clear collections at the start of each file.
        foundExports = new Set();
        variantExports = [];
        exportedComponentNames = new Set();

        // Only apply to component files in src/components/**/*.tsx
        if (!filename.match(/src\/components\/[^/]+\/[^/]+\.tsx$/)) {
          shouldCheck = false;
          return;
        }

        componentName = getComponentNameFromPath(filename);
        shouldCheck = componentName !== null;
      },
      ExportNamedDeclaration(node) {
        if (!shouldCheck) return;

        // Check for named const exports
        if (
          node.declaration &&
          node.declaration.type === "VariableDeclaration"
        ) {
          for (const decl of node.declaration.declarations) {
            if (decl.id && decl.id.type === "Identifier") {
              const exportName = decl.id.name;
              foundExports.add(exportName);

              // Collect PascalCase identifiers as candidate component names.
              if (/^[A-Z][a-zA-Z0-9]*$/.test(exportName)) {
                exportedComponentNames.add(exportName);
              }

              // Defer KUMO_*_VARIANTS validation until we've seen all exports
              // (multi-component files declare components and constants in
              // arbitrary order).
              if (
                exportName.startsWith("KUMO_") &&
                (exportName.endsWith("_VARIANTS") ||
                  exportName.endsWith("_DEFAULT_VARIANTS") ||
                  exportName.endsWith("_BASE_STYLES"))
              ) {
                variantExports.push({ exportName, node: decl.id });
              }
            }
          }
        }
      },
      "Program:exit"() {
        if (!shouldCheck) return;

        // Build extra-allowed names from exported PascalCase identifiers in
        // this file (excluding the directory-derived primary component, which
        // is already in the allow-list).
        const extraComponentNames = [];
        for (const exported of exportedComponentNames) {
          const screaming = toScreamingSnakeCase(exported);
          if (screaming !== componentName) {
            extraComponentNames.push(screaming);
          }
        }

        for (const { exportName, node } of variantExports) {
          const validation = validateExportName(
            exportName,
            componentName,
            extraComponentNames,
          );
          if (!validation.valid && validation.expectedName) {
            context.report({
              node,
              messageId: "incorrectName",
              data: {
                actual: exportName,
                expected: validation.expectedName,
              },
            });
          }
        }

        // Skip variant requirement check for exempt components
        if (VARIANT_EXEMPT_COMPONENTS.includes(componentName)) {
          return;
        }

        const expectedVariants = `KUMO_${componentName}_VARIANTS`;
        const expectedDefaultVariants = `KUMO_${componentName}_DEFAULT_VARIANTS`;

        // Check for required exports at end of file
        const hasVariants = foundExports.has(expectedVariants);
        const hasDefaultVariants = foundExports.has(expectedDefaultVariants);

        if (!hasVariants) {
          context.report({
            node: programNode,
            messageId: "missingVariants",
            data: {
              component: componentName,
              found:
                Array.from(foundExports)
                  .filter((e) => e.includes("VARIANT"))
                  .join(", ") || "none",
            },
          });
        }

        if (!hasDefaultVariants) {
          context.report({
            node: programNode,
            messageId: "missingDefaultVariants",
            data: {
              component: componentName,
              found:
                Array.from(foundExports)
                  .filter((e) => e.includes("VARIANT"))
                  .join(", ") || "none",
            },
          });
        }
      },
    };
  },
});
