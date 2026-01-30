#!/usr/bin/env node
/**
 * Add a Kumo block to the project
 * Usage: kumo add <block-name>
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { readConfig } from "../utils/config.js";
import { transformImports } from "../utils/transformer.js";
import { createInterface } from "node:readline/promises";

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
 * Tries multiple possible locations to handle different build configurations
 */
function getRegistryPath(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Try multiple possible locations to handle different build configurations
  const possiblePaths = [
    join(__dirname, "..", "..", "ai", "component-registry.json"),
    join(__dirname, "..", "ai", "component-registry.json"),
    join(__dirname, "ai", "component-registry.json"),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  throw new Error(
    "component-registry.json not found. Please regenerate with: pnpm codegen:registry",
  );
}

/**
 * Get the path to the blocks source directory
 * Tries multiple possible locations to handle different build configurations
 */
function getBlocksSourcePath(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Try multiple possible locations to handle different build configurations
  const possiblePaths = [
    join(__dirname, "..", "..", "src", "blocks"),
    join(__dirname, "..", "src", "blocks"),
    join(__dirname, "src", "blocks"),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  throw new Error(
    "Blocks source directory not found. The package may be corrupted.",
  );
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
 * Prompt user for confirmation
 */
async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question(`${message} (y/n): `);
  rl.close();

  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

/**
 * Add a block to the project
 */
export async function add(blockName: string | undefined): Promise<void> {
  // Validate block name provided
  if (!blockName) {
    console.error("Error: Block name is required.");
    console.log("\nUsage: kumo add <block-name>");
    console.log("\nRun 'kumo blocks' to see available blocks.");
    process.exit(1);
  }

  // Load config
  const config = readConfig();
  if (!config) {
    console.error(
      "Error: kumo.json not found. Run 'kumo init' first to initialize the configuration.",
    );
    process.exit(1);
  }

  // Load registry
  let registry: ComponentRegistry;
  try {
    registry = loadRegistry();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Component registry not found. Run `pnpm codegen:registry` first.";
    console.error(`Error: ${message}`);
    process.exit(1);
  }

  // Find the block
  const block = registry.blocks?.[blockName];
  if (!block) {
    console.error(`Error: Block '${blockName}' not found.`);
    console.log("\nRun 'kumo blocks' to see available blocks.");
    process.exit(1);
  }

  // Get source and destination paths
  let blocksSourcePath: string;
  try {
    blocksSourcePath = getBlocksSourcePath();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Blocks source directory not found.";
    console.error(`Error: ${message}`);
    process.exit(1);
  }
  const projectRoot = process.cwd();
  const targetDir = join(projectRoot, config.blocksDir);

  // Create target directory if it doesn't exist
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    console.log(`📁 Created directory: ${config.blocksDir}`);
  }

  // Check if block already exists
  const blockExists = block.files.some((file) => {
    const targetPath = join(targetDir, file);
    return existsSync(targetPath);
  });

  if (blockExists) {
    console.log(
      `⚠️  Block '${blockName}' already exists in ${config.blocksDir}`,
    );
    const shouldOverwrite = await confirm("Do you want to overwrite it?");
    if (!shouldOverwrite) {
      console.log("Installation cancelled.");
      return;
    }
  }

  // Copy and transform files
  console.log(`📦 Installing block: ${blockName}`);

  for (const file of block.files) {
    // Resolve and validate paths to prevent path traversal attacks
    const sourcePath = resolve(blocksSourcePath, file);
    const targetPath = resolve(targetDir, file);

    // Ensure source is within blocksSourcePath (prevent reading arbitrary files)
    // Check for ".." (parent traversal), absolute paths starting with "/", and
    // Windows cross-drive paths (isAbsolute catches drive letters like "C:\")
    const relativeSource = relative(blocksSourcePath, sourcePath);
    if (
      relativeSource.startsWith("..") ||
      relativeSource.startsWith("/") ||
      isAbsolute(relativeSource)
    ) {
      console.error(`Error: Invalid source path for file: ${file}`);
      process.exit(1);
    }

    // Ensure target is within targetDir (prevent writing outside target directory)
    const relativeTarget = relative(targetDir, targetPath);
    if (
      relativeTarget.startsWith("..") ||
      relativeTarget.startsWith("/") ||
      isAbsolute(relativeTarget)
    ) {
      console.error(`Error: Invalid target path for file: ${file}`);
      process.exit(1);
    }

    // Create subdirectories if needed
    const targetSubdir = dirname(targetPath);
    if (!existsSync(targetSubdir)) {
      mkdirSync(targetSubdir, { recursive: true });
    }

    // Read source file
    const content = readFileSync(sourcePath, "utf-8");

    // Transform imports
    const transformed = transformImports(content);

    // Write to target
    writeFileSync(targetPath, transformed, "utf-8");

    console.log(`  ✅ ${file}`);
  }

  // Show dependencies
  if (block.dependencies.length > 0) {
    console.log(`\n📚 This block depends on the following Kumo components:\n`);
    for (const dep of block.dependencies) {
      console.log(`  - ${dep} (from @cloudflare/kumo)`);
    }
    console.log("\nMake sure @cloudflare/kumo is installed in your project:");
    console.log("  pnpm add @cloudflare/kumo");
  }

  // Show import path
  console.log(`\n🎉 Successfully installed ${blockName}!`);
  console.log(`\nYou can now import it in your project:\n`);

  // Calculate the relative import path from the block file
  const blockFile = block.files[0].replace(/\.tsx?$/, "");
  const importPath = join(config.blocksDir, blockFile).replace(/\\/g, "/");

  console.log(`  import { ${blockName} } from "${importPath}";`);
}
