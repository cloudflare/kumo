/**
 * Kumo Catalog - Runtime validation and AI prompt generation.
 *
 * Creates a catalog from the auto-generated schemas that:
 * - Validates AI-generated UI trees
 * - Generates prompts for AI describing available components
 * - Provides type-safe component lookup
 */

import type {
  KumoCatalog,
  CatalogConfig,
  ActionDefinition,
  ValidationResult,
  UITree,
  UIElement,
} from "./types";

// Schema types - will be populated from generated schemas
interface SchemasModule {
  KUMO_COMPONENT_NAMES: readonly string[];
  UIElementBaseSchema: {
    safeParse: (data: unknown) => {
      success: boolean;
      data?: unknown;
      error?: { issues: Array<{ message: string; path: (string | number)[] }> };
    };
  };
  validateElementProps: (element: UIElement) => {
    success: boolean;
    error?: { issues: Array<{ message: string; path: (string | number)[] }> };
  };
  validateUITree: (tree: unknown) => {
    success: boolean;
    data?: unknown;
    error?: { issues: Array<{ message: string; path: (string | number)[] }> };
  };
}

// Schemas module reference - loaded asynchronously
let schemasModule: SchemasModule | null = null;
let schemasLoadPromise: Promise<SchemasModule> | null = null;

/**
 * Load the generated schemas module.
 * This is called automatically when needed.
 */
export async function loadSchemas(): Promise<SchemasModule> {
  if (schemasModule) return schemasModule;
  if (schemasLoadPromise) return schemasLoadPromise;

  schemasLoadPromise = import("../../ai/schemas").then((mod: unknown) => {
    schemasModule = mod as unknown as SchemasModule;
    return schemasModule;
  });

  return schemasLoadPromise;
}

/**
 * Get schemas synchronously (throws if not loaded).
 */
function getSchemas(): SchemasModule {
  if (!schemasModule) {
    throw new Error(
      "Schemas not loaded. Call initCatalog(catalog) first or use async validation.",
    );
  }
  return schemasModule;
}

/**
 * Create a Kumo catalog for runtime validation.
 *
 * The catalog:
 * - Uses auto-generated Zod schemas from component-registry.json
 * - Validates UI elements and trees at runtime
 * - Generates AI prompts describing available components
 *
 * @example
 * import { createKumoCatalog, initCatalog } from '@cloudflare/kumo/catalog';
 *
 * const catalog = createKumoCatalog({
 *   actions: {
 *     submit_form: { description: 'Submit the form' },
 *     delete_item: { description: 'Delete selected item' },
 *   },
 * });
 *
 * // Initialize schemas (required before sync validation)
 * await initCatalog(catalog);
 *
 * // Validate AI-generated tree
 * const result = catalog.validateTree(aiGeneratedJson);
 * if (result.success) {
 *   // Render the tree
 * }
 */
export function createKumoCatalog(config: CatalogConfig = {}): KumoCatalog {
  const { actions = {} } = config;
  const actionNames = Object.keys(actions);

  return {
    get componentNames(): readonly string[] {
      const schemas = getSchemas();
      return schemas.KUMO_COMPONENT_NAMES;
    },

    get actionNames(): readonly string[] {
      return actionNames;
    },

    hasComponent(type: string): boolean {
      try {
        const schemas = getSchemas();
        return schemas.KUMO_COMPONENT_NAMES.includes(type as never);
      } catch {
        return false;
      }
    },

    hasAction(name: string): boolean {
      return name in actions;
    },

    validateElement(element: unknown): ValidationResult {
      try {
        const schemas = getSchemas();
        const result = schemas.UIElementBaseSchema.safeParse(element);

        if (result.success) {
          // Also validate props against component-specific schema
          const propsResult = schemas.validateElementProps(
            result.data as UIElement,
          );
          if (!propsResult.success) {
            return {
              success: false,
              error: (
                propsResult.error as {
                  issues: Array<{ message: string; path: (string | number)[] }>;
                }
              ).issues.map((issue) => ({
                message: issue.message,
                path: ["props", ...issue.path],
              })),
            };
          }
          return { success: true, data: result.data };
        }

        return {
          success: false,
          error: result.error?.issues.map((issue) => ({
            message: issue.message,
            path: issue.path,
          })) ?? [{ message: "Validation failed", path: [] }],
        };
      } catch (err) {
        return {
          success: false,
          error: [
            {
              message: err instanceof Error ? err.message : "Validation failed",
              path: [],
            },
          ],
        };
      }
    },

    validateTree(tree: unknown): ValidationResult<UITree> {
      try {
        const schemas = getSchemas();
        const result = schemas.validateUITree(tree);

        if (result.success) {
          return { success: true, data: result.data as UITree };
        }

        return {
          success: false,
          error: (
            result.error as {
              issues: Array<{ message: string; path: (string | number)[] }>;
            }
          ).issues.map((issue) => ({
            message: issue.message,
            path: issue.path,
          })),
        };
      } catch (err) {
        return {
          success: false,
          error: [
            {
              message: err instanceof Error ? err.message : "Validation failed",
              path: [],
            },
          ],
        };
      }
    },

    generatePrompt(): string {
      const schemas = getSchemas();
      const lines: string[] = [
        "# Kumo Component Catalog",
        "",
        "You are generating UI using Kumo components. Output must be valid JSON matching the UITree schema.",
        "",
        "## Available Components",
        "",
      ];

      // List all components
      for (const name of schemas.KUMO_COMPONENT_NAMES) {
        lines.push(`- \`${name}\``);
      }

      // Actions section
      if (actionNames.length > 0) {
        lines.push("");
        lines.push("## Available Actions");
        lines.push("");
        for (const [name, def] of Object.entries(actions)) {
          lines.push(`- \`${name}\`: ${(def as ActionDefinition).description}`);
        }
      }

      // Output format
      lines.push("");
      lines.push("## Output Format");
      lines.push("");
      lines.push("```json");
      lines.push("{");
      lines.push('  "root": "element-1",');
      lines.push('  "elements": {');
      lines.push('    "element-1": {');
      lines.push('      "key": "element-1",');
      lines.push('      "type": "ComponentName",');
      lines.push('      "props": { ... },');
      lines.push('      "children": ["element-2"],');
      lines.push(
        '      "visible": true | { "path": "/data/path" } | { "auth": "signedIn" }',
      );
      lines.push("    }");
      lines.push("  }");
      lines.push("}");
      lines.push("```");
      lines.push("");

      // Dynamic values
      lines.push("## Dynamic Values");
      lines.push("");
      lines.push(
        'Props can reference data model values using `{ path: "/data/path" }`:',
      );
      lines.push("");
      lines.push("```json");
      lines.push("{");
      lines.push('  "type": "Text",');
      lines.push('  "props": {');
      lines.push('    "children": { "path": "/user/name" }');
      lines.push("  }");
      lines.push("}");
      lines.push("```");
      lines.push("");

      return lines.join("\n");
    },
  };
}

/**
 * Initialize the catalog by loading schemas.
 * Call this before using synchronous validation methods.
 */
export async function initCatalog(catalog: KumoCatalog): Promise<void> {
  // Trigger a validation to load schemas
  catalog.validateTree({});
}
