/**
 * Figma Token Sync - Unidirectional sync from code to Figma
 *
 * This script uses config.ts as the single source of truth for design tokens.
 * It purges all existing variables and recreates them from the config.
 *
 * Usage:
 *   FIGMA_TOKEN="your-token" pnpm --filter @cloudflare/kumo-figma figma:sync
 *   FIGMA_TOKEN="your-token" pnpm --filter @cloudflare/kumo-figma figma:sync get
 *
 * Environment Variables:
 *   FIGMA_TOKEN (required) - Figma personal access token
 *   FIGMA_FILE_KEY (optional) - Target Figma file, defaults to kumo file
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  THEME_CONFIG,
  AVAILABLE_THEMES,
} from "../../kumo/scripts/theme-generator/config.js";
import type { TokenDefinition } from "../../kumo/scripts/theme-generator/types.js";
import { resolveColor } from "./color-utils.js";
import {
  syncAllToFigma,
  getLocalVariables,
  type ResolvedToken,
  type ResolvedTypographyToken,
  type ExtendedMode,
  type FigmaColorInput,
} from "./figma-api.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, ".env");

// Load .env file if it exists
if (existsSync(ENV_PATH)) {
  const envContent = readFileSync(ENV_PATH, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").replace(/^["']|["']$/g, "");
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

// Read environment variables
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || "sKKZc6pC6W1TtzWBLxDGSU";

/**
 * Parse CLI arguments
 */
function parseArgs(): { command: "sync" | "get"; collection?: string } {
  const args = process.argv.slice(2);
  let command: "sync" | "get" = "sync";
  let collection: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "get") {
      command = "get";
    } else if (arg === "--collection" && args[i + 1]) {
      collection = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return { command, collection };
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Figma Token Sync - Unidirectional sync from code to Figma

This script uses config.ts as the SINGLE SOURCE OF TRUTH for design tokens.
Running sync will PURGE all existing variables and recreate them.

Usage:
  npx tsx sync-tokens-to-figma.ts [command] [options]

Commands:
  sync (default)    Purge and recreate all tokens in Figma
  get               Fetch and display existing Figma variables

Options:
  --collection <name>  Filter get results by collection name
  --help, -h           Show this help message

Environment Variables:
  FIGMA_TOKEN (required)   Figma personal access token
  FIGMA_FILE_KEY           Target Figma file key

Examples:
  # Sync all tokens (purges existing, creates fresh)
  FIGMA_TOKEN="..." npx tsx sync-tokens-to-figma.ts

  # Get all Figma variables
  FIGMA_TOKEN="..." npx tsx sync-tokens-to-figma.ts get
`);
}

/**
 * Opacity modifiers used in the codebase (bg-color/opacity patterns)
 * These are scanned from component source files to generate Figma variables.
 *
 * Format: { baseColor: [opacityValues] }
 * Example: { "info": [20], "error": [20, 70, 90] }
 */
const OPACITY_MODIFIERS: Record<string, number[]> = {
  // Banner variants: bg-info/20, bg-alert/20, bg-kumo-danger/20
  info: [20],
  alert: [20],
  error: [20, 70, 90],
  // Button variants: bg-primary/50, bg-primary/70, bg-kumo-control/50
  primary: [50, 70],
  secondary: [50],
};

/**
 * Generate opacity variant tokens from base tokens
 *
 * For each base color token that has opacity modifiers defined,
 * creates additional tokens with the opacity baked into the alpha channel.
 *
 * Example: color-info + opacity 20 -> color-info/20 with alpha 0.2
 */
function generateOpacityVariants(baseTokens: ResolvedToken[]): ResolvedToken[] {
  const opacityTokens: ResolvedToken[] = [];

  for (const token of baseTokens) {
    // Extract base color name from token (e.g., "color-info" -> "info")
    const colorMatch = token.name.match(/^color-([\w-]+)$/);
    if (!colorMatch) continue;

    const colorName = colorMatch[1];
    const opacities = OPACITY_MODIFIERS[colorName];
    if (!opacities) continue;

    // Generate a token for each opacity level
    for (const opacity of opacities) {
      const alpha = opacity / 100;
      opacityTokens.push({
        name: `${token.name}/${opacity}`,
        light: { ...token.light, a: alpha },
        dark: { ...token.dark, a: alpha },
      });
    }
  }

  return opacityTokens;
}

/**
 * Validate that FIGMA_TOKEN is set and return it
 */
function getValidatedToken(): string {
  if (!FIGMA_TOKEN) {
    console.error("Error: FIGMA_TOKEN environment variable is required");
    console.error("");
    console.error("Usage:");
    console.error(
      '  FIGMA_TOKEN="your-token" pnpm --filter @cloudflare/kumo-figma figma:sync',
    );
    console.error("");
    console.error(
      "Get a token at: https://www.figma.com/developers/api#authentication",
    );
    process.exit(1);
  }
  return FIGMA_TOKEN;
}

/**
 * Get command - fetch and display existing Figma variables
 */
async function runGetCommand(collectionFilter?: string): Promise<void> {
  const token = getValidatedToken();

  console.log(`Fetching Figma variables from file: ${FIGMA_FILE_KEY}...`);

  const result = await getLocalVariables(FIGMA_FILE_KEY, token);

  if (!result.success) {
    console.error("Failed to fetch Figma variables:");
    console.error(result.error);
    process.exit(1);
  }

  if (!result.data) {
    console.log("No variables found in file.");
    return;
  }

  const { variables, variableCollections } = result.data;
  const collections = Object.entries(variableCollections);

  console.log(`\nCollections (${collections.length}):`);

  for (const [collectionId, collection] of collections) {
    if (collectionFilter && collection.name !== collectionFilter) {
      continue;
    }

    console.log(`\n  ${collection.name} (${collectionId})`);
    console.log(`    Modes: ${collection.modes.map((m) => m.name).join(", ")}`);

    const collectionVars = Object.entries(variables).filter(
      ([, v]) => v.variableCollectionId === collectionId,
    );

    console.log(`    Variables (${collectionVars.length}):`);

    for (const [, variable] of collectionVars.slice(0, 10)) {
      console.log(`      - ${variable.name}`);
    }

    if (collectionVars.length > 10) {
      console.log(`      ... and ${collectionVars.length - 10} more`);
    }
  }
}

/**
 * Extract color tokens from config.ts
 * Returns resolved tokens with Figma RGB colors
 */
function getColorTokensFromConfig(): {
  baseTokens: ResolvedToken[];
  extendedModes: ExtendedMode[];
} {
  const baseTokens: ResolvedToken[] = [];
  const extendedModeOverrides: Record<
    string,
    Record<string, FigmaColorInput>
  > = {};

  // Initialize override maps for non-kumo themes
  for (const theme of AVAILABLE_THEMES) {
    if (theme !== "kumo") {
      extendedModeOverrides[theme] = {};
    }
  }

  // Process text color tokens
  for (const [tokenName, def] of Object.entries(THEME_CONFIG.text)) {
    const typedDef = def as TokenDefinition;

    // Base kumo theme
    if (typedDef.theme.kumo) {
      baseTokens.push({
        name: `text-color-${tokenName}`,
        light: resolveColor(typedDef.theme.kumo.light),
        dark: resolveColor(typedDef.theme.kumo.dark),
      });
    }

    // Theme overrides
    for (const themeName of AVAILABLE_THEMES) {
      if (themeName !== "kumo" && typedDef.theme[themeName]) {
        const themeColors = typedDef.theme[themeName]!;
        extendedModeOverrides[themeName][`text-color-${tokenName}`] =
          resolveColor(themeColors.light);
      }
    }
  }

  // Process color tokens (bg, border, ring, etc.)
  for (const [tokenName, def] of Object.entries(THEME_CONFIG.color)) {
    const typedDef = def as TokenDefinition;

    // Base kumo theme
    if (typedDef.theme.kumo) {
      baseTokens.push({
        name: `color-${tokenName}`,
        light: resolveColor(typedDef.theme.kumo.light),
        dark: resolveColor(typedDef.theme.kumo.dark),
      });
    }

    // Theme overrides
    for (const themeName of AVAILABLE_THEMES) {
      if (themeName !== "kumo" && typedDef.theme[themeName]) {
        const themeColors = typedDef.theme[themeName]!;
        extendedModeOverrides[themeName][`color-${tokenName}`] = resolveColor(
          themeColors.light,
        );
      }
    }
  }

  // Convert to ExtendedMode array
  const extendedModes: ExtendedMode[] = [];
  for (const [themeName, overrides] of Object.entries(extendedModeOverrides)) {
    if (Object.keys(overrides).length > 0) {
      extendedModes.push({
        name: themeName,
        overrides,
      });
    }
  }

  return { baseTokens, extendedModes };
}

/**
 * Extract typography tokens from config.ts
 * Returns resolved tokens with numeric values
 */
function getTypographyTokensFromConfig(): ResolvedTypographyToken[] {
  const tokens: ResolvedTypographyToken[] = [];

  if (!THEME_CONFIG.typography) {
    return tokens;
  }

  for (const [tokenName, def] of Object.entries(THEME_CONFIG.typography)) {
    const value = def.theme.kumo;
    if (!value) continue;

    // Resolve the value to a number
    const resolved = resolveTypographyValue(value);
    tokens.push({
      name: tokenName,
      value: resolved,
    });
  }

  return tokens;
}

/**
 * Resolve a typography value to a number
 * Handles: px values, rem values (converts to px at 16px base), calc() expressions
 */
function resolveTypographyValue(value: string): number {
  const trimmed = value.trim();

  // Handle px values
  if (trimmed.endsWith("px")) {
    return parseFloat(trimmed);
  }

  // Handle rem values - convert to px (1rem = 16px)
  if (trimmed.endsWith("rem")) {
    return parseFloat(trimmed) * 16;
  }

  // Handle calc() expressions
  if (trimmed.startsWith("calc(")) {
    const expr = trimmed.slice(5, -1).trim();
    try {
      // Simple evaluation for division expressions like "1 / 0.75"
      // eslint-disable-next-line no-eval
      const result = eval(expr);
      if (typeof result === "number" && !isNaN(result)) {
        return result;
      }
    } catch {
      // Fall through to default
    }
  }

  // Handle plain numbers
  const numValue = parseFloat(trimmed);
  if (!isNaN(numValue)) {
    return numValue;
  }

  return 0;
}

/**
 * Sync command - purge and recreate all tokens
 */
async function runSyncCommand(): Promise<void> {
  const figmaToken = getValidatedToken();
  const colorCollectionName = "kumo-colors";
  const typographyCollectionName = "kumo-typography";

  console.log("Reading tokens from config.ts...\n");

  // Step 1: Get color tokens from config
  console.log("Color Tokens:");
  const { baseTokens, extendedModes } = getColorTokensFromConfig();
  console.log(`   Found ${baseTokens.length} base tokens`);

  // Step 2: Generate opacity variants
  console.log("Generating opacity variants...");
  const opacityVariants = generateOpacityVariants(baseTokens);
  console.log(`   Found ${opacityVariants.length} opacity variants`);

  // Combine base tokens with opacity variants
  const resolvedColorTokens = [...baseTokens, ...opacityVariants];
  console.log(`\nTotal color tokens: ${resolvedColorTokens.length}`);

  // Step 3: Get typography tokens from config
  console.log("\nTypography Tokens:");
  const resolvedTypographyTokens = getTypographyTokensFromConfig();
  console.log(`   Found ${resolvedTypographyTokens.length} tokens`);

  if (
    resolvedColorTokens.length === 0 &&
    resolvedTypographyTokens.length === 0
  ) {
    console.log("No tokens found to sync.");
    return;
  }

  // Step 4: Show what we're syncing
  console.log("\nColor tokens to sync:");
  for (const token of resolvedColorTokens.slice(0, 10)) {
    console.log(`   - ${token.name}`);
  }
  if (resolvedColorTokens.length > 10) {
    console.log(`   ... and ${resolvedColorTokens.length - 10} more`);
  }

  console.log("\nTypography tokens to sync:");
  for (const token of resolvedTypographyTokens.slice(0, 10)) {
    console.log(`   - ${token.name}: ${token.value}`);
  }
  if (resolvedTypographyTokens.length > 10) {
    console.log(`   ... and ${resolvedTypographyTokens.length - 10} more`);
  }

  console.log(`\n   Color modes: Light, Dark`);
  console.log(`   Typography mode: Desktop`);
  if (extendedModes.length > 0) {
    console.log(
      `   Extension collections: ${extendedModes.map((m) => m.name).join(", ")}`,
    );
    for (const mode of extendedModes) {
      console.log(
        `     - ${mode.name}: ${Object.keys(mode.overrides).length} overrides`,
      );
    }
  }

  // Step 5: Sync to Figma (purge + create)
  console.log(`\nSyncing to Figma (file: ${FIGMA_FILE_KEY})...`);
  console.log("   This will PURGE all existing variables and recreate them.");

  const result = await syncAllToFigma({
    fileKey: FIGMA_FILE_KEY,
    token: figmaToken,
    colors: {
      collectionName: colorCollectionName,
      tokens: resolvedColorTokens,
      extendedModes,
    },
    typography: {
      collectionName: typographyCollectionName,
      tokens: resolvedTypographyTokens,
      modeName: "Desktop",
    },
  });

  if (!result.success) {
    console.error("Failed to sync tokens to Figma:");
    console.error(result.error);
    process.exit(1);
  }

  const totalTokens =
    resolvedColorTokens.length + resolvedTypographyTokens.length;
  console.log(`\nSuccessfully synced ${totalTokens} tokens to Figma!`);
  console.log(
    `   Collection: "${colorCollectionName}" (Light, Dark) - ${resolvedColorTokens.length} color tokens`,
  );
  console.log(
    `   Collection: "${typographyCollectionName}" (Desktop) - ${resolvedTypographyTokens.length} typography tokens`,
  );
  if (extendedModes.length > 0) {
    console.log(
      `   Extensions: ${extendedModes.map((m) => m.name).join(", ")} (Light, Dark each)`,
    );
  }

  if (result.tempIdToRealId) {
    const mappingCount = Object.keys(result.tempIdToRealId).length;
    console.log(`   Created ${mappingCount} new Figma IDs`);
  }

  // Verify
  console.log("\nVerifying sync...");
  const verification = await getLocalVariables(FIGMA_FILE_KEY, figmaToken);

  if (!verification.success) {
    console.warn("Could not verify sync:", verification.error);
  } else if (verification.data) {
    const collectionCount = Object.keys(
      verification.data.variableCollections,
    ).length;
    const variableCount = Object.keys(verification.data.variables).length;
    console.log(
      `Verified: ${collectionCount} collection(s), ${variableCount} variable(s) in file`,
    );
  }
}

/**
 * Main execution
 */
async function main() {
  const { command, collection } = parseArgs();

  if (command === "get") {
    await runGetCommand(collection);
  } else {
    await runSyncCommand();
  }
}

main();
