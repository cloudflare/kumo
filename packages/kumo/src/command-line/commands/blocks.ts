#!/usr/bin/env node
/**
 * List all Kumo blocks available for CLI installation
 * Usage: kumo blocks
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface Block {
  name: string;
  type: "block";
  description: string;
  category: string;
  files: string[];
  dependencies: string[];
}

interface ComponentRegistry {
  version: string;
  blocks?: Record<string, Block>;
}

/**
 * Get the path to the component registry JSON file
 */
function getRegistryPath(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // When bundled into dist/command-line/cli.js, go up 2 levels to package root then into ai/
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
 * List all blocks grouped by category
 */
export function blocks(): void {
  try {
    const registry = loadRegistry();

    if (!registry.blocks || Object.keys(registry.blocks).length === 0) {
      console.log("No blocks available.");
      return;
    }

    const blockList = Object.values(registry.blocks);

    // Group by category
    const byCategory = new Map<string, Block[]>();
    for (const block of blockList) {
      const category = block.category || "Other";
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(block);
    }

    // Sort categories and blocks
    const sortedCategories = [...byCategory.keys()].sort();

    console.log(`Kumo Blocks (${blockList.length} total)\n`);

    for (const category of sortedCategories) {
      const categoryBlocks = [...byCategory.get(category)!].sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      console.log(`${category}:`);
      for (const block of categoryBlocks) {
        console.log(`  ${block.name} - ${block.description}`);
      }
      console.log();
    }

    console.log("To install a block, run:");
    console.log("  kumo add <block-name>\n");
    console.log("Example:");
    console.log("  kumo add PageHeader");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.error(
        "Error: Component registry not found. Run `pnpm codegen:registry` first.",
      );
      process.exit(1);
    }
    throw error;
  }
}
