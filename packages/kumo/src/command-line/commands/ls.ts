#!/usr/bin/env node
/**
 * List all Kumo components
 * Usage: kumo ls
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface ComponentRegistry {
  version: string;
  components: Record<
    string,
    {
      name: string;
      description: string;
      category: string;
    }
  >;
}

/**
 * Get the path to the component registry JSON file
 */
function getRegistryPath(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // When bundled and running from dist/command-line/, go up 2 levels to package root then into ai/
  return join(__dirname, "..", "..", "ai", "component-registry.json");
}

/**
 * Load the component registry
 */
function loadRegistry(): ComponentRegistry {
  const registryPath = getRegistryPath();
  const content = readFileSync(registryPath, "utf-8");
  return JSON.parse(content) as ComponentRegistry;
}

/**
 * List all components grouped by category
 */
export function ls(): void {
  try {
    const registry = loadRegistry();
    const components = Object.values(registry.components);

    // Group by category
    const byCategory = new Map<string, typeof components>();
    for (const component of components) {
      const category = component.category || "Other";
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(component);
    }

    // Sort categories and components
    const sortedCategories = [...byCategory.keys()].toSorted();

    console.log(`Kumo Components (${components.length} total)\n`);

    for (const category of sortedCategories) {
      const categoryComponents = [...byCategory.get(category)!].toSorted(
        (a, b) => a.name.localeCompare(b.name),
      );

      console.log(`${category}:`);
      for (const component of categoryComponents) {
        console.log(`  ${component.name} - ${component.description}`);
      }
      console.log();
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.error(
        "Error: Component registry not found. Run `pnpm build:ai-metadata` first.",
      );
      process.exit(1);
    }
    throw error;
  }
}
