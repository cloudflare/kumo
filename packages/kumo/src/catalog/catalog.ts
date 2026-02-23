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
  GeneratePromptOptions,
  ValidationResult,
  UITree,
  UIElement,
} from "./types";
import { buildSystemPrompt } from "./system-prompt";
import { buildComponentDocs } from "./prompt-builder";

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

// Component registry JSON — loaded once, cached for prompt generation
let registryJson: unknown = null;
let registryLoadPromise: Promise<unknown> | null = null;

/**
 * Load the generated schemas module.
 * This is called automatically when needed.
 */
export async function loadSchemas(): Promise<SchemasModule> {
  if (schemasModule) return schemasModule;
  if (schemasLoadPromise) return schemasLoadPromise;

  schemasLoadPromise = import("../../ai/schemas.js").then((mod: unknown) => {
    schemasModule = mod as unknown as SchemasModule;
    return schemasModule;
  });

  return schemasLoadPromise;
}

/**
 * Load the component registry JSON.
 * Called automatically when {@link KumoCatalog.generatePrompt} needs it.
 */
export async function loadRegistry(): Promise<unknown> {
  if (registryJson !== null) return registryJson;
  if (registryLoadPromise) return registryLoadPromise;

  registryLoadPromise = import("../../ai/component-registry.json").then(
    (mod: { default?: unknown }) => {
      registryJson = mod.default ?? mod;
      return registryJson;
    },
  );

  return registryLoadPromise;
}

/**
 * Get registry JSON synchronously (throws if not loaded).
 */
function getRegistryJson(): unknown {
  if (registryJson === null) {
    throw new Error(
      "Registry not loaded. Call initCatalog(catalog) first or use loadRegistry().",
    );
  }
  return registryJson;
}

/**
 * Remove the example sections from a prompt string.
 * Keeps all content before the first `## Example (` heading and from
 * `## Important` onward.
 */
function stripExampleSections(prompt: string): string {
  const exampleStart = prompt.indexOf("\n## Example (");
  if (exampleStart === -1) return prompt;

  const importantStart = prompt.indexOf("\n## Important", exampleStart);
  if (importantStart === -1) {
    // No closing section — just remove everything from examples onward
    return prompt.slice(0, exampleStart).trimEnd();
  }

  return (
    prompt.slice(0, exampleStart) + prompt.slice(importantStart)
  ).trimEnd();
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
  const { actions = {}, customComponents } = config;
  const actionNames = Object.keys(actions);
  const customComponentNames: readonly string[] = customComponents
    ? Object.keys(customComponents).toSorted((a, b) => a.localeCompare(b))
    : [];

  return {
    get componentNames(): readonly string[] {
      const schemas = getSchemas();
      if (customComponentNames.length === 0) {
        return schemas.KUMO_COMPONENT_NAMES;
      }
      // Merge built-in + custom, deduplicate, sort
      const merged = new Set<string>([
        ...schemas.KUMO_COMPONENT_NAMES,
        ...customComponentNames,
      ]);
      return Array.from(merged).toSorted((a, b) => a.localeCompare(b));
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

    generatePrompt(options: GeneratePromptOptions = {}): string {
      const {
        components: componentFilter,
        maxPropsPerComponent,
        includeExamples = true,
      } = options;

      // Build component docs from registry JSON (requires prior initCatalog)
      const registry = getRegistryJson();
      const componentsSection = buildComponentDocs(registry, {
        maxPropsPerComponent,
        components: componentFilter,
        customComponents,
      });

      // Build system prompt with all sections
      const prompt = buildSystemPrompt({ componentsSection });

      if (!includeExamples) {
        // Strip example sections (everything between first "## Example ("
        // and "## Important")
        return stripExampleSections(prompt);
      }

      return prompt;
    },
  };
}

/**
 * Initialize the catalog by loading schemas and registry data.
 * Call this before using synchronous validation or prompt generation methods.
 */
export async function initCatalog(catalog: KumoCatalog): Promise<void> {
  await Promise.all([loadSchemas(), loadRegistry()]);
  // Touch validation to ensure schemas are wired up
  catalog.validateTree({});
}
