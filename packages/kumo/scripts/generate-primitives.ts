/**
 * Generates src/primitives/index.ts and individual primitive files
 * by reading @base-ui-components/react exports.
 *
 * Also updates package.json with granular primitive exports.
 *
 * Run: pnpm build:primitives
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PRIMITIVES_DIR = join(__dirname, "../src/primitives");
const PRIMITIVES_FILE = join(PRIMITIVES_DIR, "index.ts");
const PACKAGE_JSON = join(__dirname, "../package.json");
const BASE_UI_PACKAGE = join(
  __dirname,
  "../node_modules/@base-ui/react/package.json",
);

// Subpaths to exclude from re-export (internal/utility exports)
const EXCLUDED_EXPORTS = new Set([
  "./package.json",
  "./types",
  "./esm", // Internal ESM build directory
  "./unstable-no-ssr",
  "./unstable-use-media-query", // Unstable API
  "./merge-props", // Utility, not a component
  "./use-render", // Internal hook
]);

function main() {
  // Read base-ui package.json
  if (!existsSync(BASE_UI_PACKAGE)) {
    console.error("❌ @base-ui/react not found. Run pnpm install first.");
    process.exit(1);
  }

  const packageJson = JSON.parse(readFileSync(BASE_UI_PACKAGE, "utf-8"));
  const exports = packageJson.exports || {};

  // Extract and sort component subpaths alphabetically
  const subpaths = Object.keys(exports)
    .filter((key) => key.startsWith("./") && !EXCLUDED_EXPORTS.has(key))
    .sort();

  // Ensure directory exists
  if (!existsSync(PRIMITIVES_DIR)) {
    mkdirSync(PRIMITIVES_DIR, { recursive: true });
  }

  // Generate barrel export (index.ts)
  generateBarrelExport(subpaths);

  // Generate individual primitive files
  generateIndividualPrimitives(subpaths);

  // Update package.json with granular exports
  updatePackageJsonExports(subpaths);

  console.log(`✓ Generated primitives`);
  console.log(`  → ${subpaths.length} base-ui exports`);
  console.log(`  → Barrel export: src/primitives/index.ts`);
  console.log(`  → Individual files: src/primitives/*.ts`);
  console.log(`  → Updated package.json exports`);
}

function generateBarrelExport(subpaths: string[]) {
  const lines: string[] = [
    "/**",
    " * Base UI Primitives - Barrel Export",
    " *",
    " * Auto-generated from @base-ui/react exports.",
    " * Run `pnpm build:primitives` to regenerate.",
    " *",
    " * Re-exports all primitives for convenience.",
    " *",
    " * @example",
    " * ```tsx",
    " * // Import multiple primitives",
    " * import { Popover, Slider, Tooltip } from '@cloudflare/kumo/primitives';",
    " * ```",
    " */",
    "",
  ];

  // Add exports alphabetically
  for (const subpath of subpaths) {
    const modulePath = `@base-ui/react/${subpath.replace("./", "")}`;
    lines.push(`export * from "${modulePath}";`);
  }
  lines.push("");

  writeFileSync(PRIMITIVES_FILE, lines.join("\n"));
}

function generateIndividualPrimitives(subpaths: string[]) {
  for (const subpath of subpaths) {
    const primitiveName = subpath.replace("./", "");
    const primitiveFile = join(PRIMITIVES_DIR, `${primitiveName}.ts`);
    const modulePath = `@base-ui/react/${primitiveName}`;

    const content = [
      "/**",
      ` * ${primitiveName} primitive`,
      " *",
      " * Auto-generated from @base-ui/react.",
      " * Run `pnpm build:primitives` to regenerate.",
      " *",
      " * @example",
      " * ```tsx",
      ` * import { ${toPascalCase(primitiveName)} } from '@cloudflare/kumo/primitives/${primitiveName}';`,
      " * ```",
      " */",
      "",
      `export * from "${modulePath}";`,
      "",
    ].join("\n");

    writeFileSync(primitiveFile, content);
  }
}

function updatePackageJsonExports(subpaths: string[]) {
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8"));

  // Find the "./primitives" export and add granular exports after it
  const primitiveExports: Record<string, any> = {
    "./primitives": {
      types: "./dist/src/primitives/index.d.ts",
      import: "./dist/primitives.js",
    },
  };

  // Add granular exports for each primitive
  for (const subpath of subpaths) {
    const primitiveName = subpath.replace("./", "");
    primitiveExports[`./primitives/${primitiveName}`] = {
      types: `./dist/src/primitives/${primitiveName}.d.ts`,
      import: `./dist/primitives/${primitiveName}.js`,
    };
  }

  // Rebuild exports object with primitives section
  const newExports: Record<string, any> = {};
  let addedPrimitives = false;

  for (const [key, value] of Object.entries(pkg.exports)) {
    newExports[key] = value;

    // Add primitive exports after the main "./primitives" export
    if (key === "./primitives" && !addedPrimitives) {
      // Add all granular primitive exports
      for (const [primKey, primValue] of Object.entries(primitiveExports)) {
        if (primKey !== "./primitives") {
          newExports[primKey] = primValue;
        }
      }
      addedPrimitives = true;
    }
  }

  pkg.exports = newExports;
  writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + "\n");
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

main();
