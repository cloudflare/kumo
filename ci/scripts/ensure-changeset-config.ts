#!/usr/bin/env tsx

import { existsSync } from "fs";
import { join } from "path";

const configPath = join(process.cwd(), ".changeset", "config.json");

if (!existsSync(configPath)) {
  console.error("❌ Changesets is not initialized for this repo.");
  console.error("");
  console.error(`Missing required file: ${configPath}`);
  console.error("");
  console.error("To fix:");
  console.error("  1) Restore it from git if it was deleted:");
  console.error("     git checkout -- .changeset/config.json");
  console.error(
    "  2) If this repo truly does not have Changesets set up, run:",
  );
  console.error("     pnpm changeset init");
  console.error("");
  process.exit(1);
}
