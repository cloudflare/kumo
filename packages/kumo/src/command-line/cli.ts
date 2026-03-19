#!/usr/bin/env node
/**
 * Kumo CLI - Component registry and blocks distribution
 *
 * Usage:
 *   kumo init                 Initialize kumo.json configuration
 *   kumo ls                   List all components
 *   kumo doc <name>           Get documentation for a component
 *   kumo docs                 Get documentation for all components
 *   kumo help                 Show this help message
 */

import { ls } from "./commands/ls.js";
import { doc } from "./commands/doc.js";
import { init } from "./commands/init.js";
import { blocks } from "./commands/blocks.js";
import { add } from "./commands/add.js";
import { migrate } from "./commands/migrate.js";
import { ai } from "./commands/ai.js";

const HELP = `
Kumo CLI - Component registry and blocks distribution

BLOCKS:
  kumo init            Initialize kumo.json configuration file
  kumo blocks          List all available blocks for CLI installation
  kumo add <block>     Install a block to your project

COMPONENT REGISTRY:
  kumo ls              List all Kumo components with categories
  kumo doc <name>      Get detailed documentation for a component
  kumo docs            Get documentation for all components

MIGRATION:
  kumo migrate         Export token rename map for codebase migration
  kumo migrate --classes  Show class-level mappings (bg-kumo-base -> bg-kumo-base)
  kumo migrate --help     Show migration help

AI:
  kumo ai              Print the AI usage guide (component API reference)

GENERAL:
  kumo help            Show this help message

Examples:
  kumo init
  kumo blocks
  kumo add PageHeader
  kumo ls
  kumo doc Button
  kumo docs
  kumo migrate --json > rename-map.json
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  switch (command) {
    case "init":
      // Initialize kumo.json configuration
      await init();
      break;

    case "blocks":
      // List available blocks
      blocks();
      break;

    case "add":
      // Add a block to the project
      await add(args[1]);
      break;

    case "ls":
      // List components
      ls();
      break;

    case "doc":
    case "docs":
      // If no component name, show all docs; otherwise show specific component
      doc(args[1]);
      break;

    case "migrate":
      // Export token rename map for migration
      migrate(args.slice(1));
      break;

    case "ai":
      // Print AI usage guide
      ai();
      break;

    case "help":
    case "--help":
    case "-h":
    case undefined:
      console.log(HELP.trim());
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.log(HELP.trim());
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
