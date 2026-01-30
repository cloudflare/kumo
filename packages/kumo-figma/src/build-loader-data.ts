#!/usr/bin/env npx tsx
/**
 * Build Loader Data
 *
 * Parses loader.tsx and generates loader-data.json for the Figma plugin.
 * This runs at BUILD TIME before bundling the plugin.
 *
 * Usage:
 *   pnpm --filter @cloudflare/kumo-figma build:data
 *
 * Output:
 *   packages/kumo-figma/src/generated/loader-data.json
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseLoaderSvg } from "./parsers/loader-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse loader from loader.tsx
console.log("📖 Parsing loader.tsx...");
const loaderData = parseLoaderSvg();

console.log(`✅ Extracted loader SVG`);
console.log(`   - viewBox: ${loaderData.viewBox}`);
console.log(`   - circles: ${loaderData.circles.length}`);
console.log(
  `   - sizes: ${Object.keys(loaderData.sizes).join(", ")} (${Object.values(
    loaderData.sizes,
  )
    .map((s) => s.value + "px")
    .join(", ")})`,
);

// Ensure generated directory exists
const generatedDir = join(__dirname, "generated");
mkdirSync(generatedDir, { recursive: true });

// Write loader data as JSON
const outputPath = join(generatedDir, "loader-data.json");
writeFileSync(outputPath, JSON.stringify(loaderData, null, 2));

console.log(`✅ Wrote ${outputPath}`);
