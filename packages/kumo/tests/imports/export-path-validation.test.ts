import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = join(__dirname, "../../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

// Check if the main entry point exists (not just dist/ which may contain prebuild artifacts)
// The prebuild script creates dist/color/ but the full build creates dist/index.js
const mainEntryPath = join(__dirname, "../../dist/index.js");
const isBuilt = existsSync(mainEntryPath);

/**
 * This test validates that package.json exports point to files that actually exist
 * in the dist directory after build. This catches mismatches between configured
 * export paths and actual build output.
 *
 * These tests are skipped if the dist directory doesn't exist (i.e., not built yet).
 */
describe.skipIf(!isBuilt)("Export Path Validation (Post-Build)", () => {
  describe("Export paths point to existing files", () => {
    Object.entries(packageJson.exports).forEach(([exportPath, config]) => {
      // Skip wildcard and CSS-only exports
      if (exportPath.includes("*") || typeof config === "string") {
        return;
      }

      describe(`Export: ${exportPath}`, () => {
        const exportConfig = config as { types?: string; import?: string };

        if (exportConfig.import) {
          it("should have import path that exists in dist", () => {
            const importPath = exportConfig.import!.replace(/^\.\//, "");
            const fullPath = join(__dirname, "../../", importPath);

            if (!existsSync(fullPath)) {
              console.error(`\n❌ Import file does not exist: ${importPath}`);
              console.error(`   Expected at: ${fullPath}`);
              console.error(`   Export: ${exportPath}`);
            }

            expect(existsSync(fullPath)).toBe(true);
          });
        }

        if (exportConfig.types) {
          it("should have types path that exists in dist", () => {
            const typesPath = exportConfig.types!.replace(/^\.\//, "");
            const fullPath = join(__dirname, "../../", typesPath);

            if (!existsSync(fullPath)) {
              console.error(`\n❌ Types file does not exist: ${typesPath}`);
              console.error(`   Expected at: ${fullPath}`);
              console.error(`   Export: ${exportPath}`);
            }

            expect(existsSync(fullPath)).toBe(true);
          });
        }
      });
    });
  });

  describe("Build output structure validation", () => {
    it("should have consistent structure between JS and types", () => {
      const exports = packageJson.exports;
      const inconsistencies: string[] = [];

      Object.entries(exports).forEach(([exportPath, config]) => {
        if (typeof config === "string" || exportPath.includes("*")) {
          return;
        }

        const exportConfig = config as { types?: string; import?: string };

        if (exportConfig.import && exportConfig.types) {
          const importPath = exportConfig.import;
          const typesPath = exportConfig.types;

          // Check if paths follow expected patterns
          // JS files should be in dist/[category]/[name].js
          // Type files should be in dist/src/[category]/[name]/index.d.ts

          const jsMatch = importPath.match(/^\.\/dist\/([^/]+)\/(.+)\.js$/);
          const tsMatch = typesPath.match(
            /^\.\/dist\/src\/([^/]+)\/(.+)\/index\.d\.ts$/,
          );

          if (jsMatch && tsMatch) {
            const [, jsCategory, jsName] = jsMatch;
            const [, tsCategory, tsName] = tsMatch;

            if (jsCategory !== tsCategory || jsName !== tsName) {
              inconsistencies.push(
                `${exportPath}: JS (${jsCategory}/${jsName}) doesn't match Types (${tsCategory}/${tsName})`,
              );
            }
          } else if (
            !importPath.includes("index.js") &&
            !typesPath.includes("index.d.ts") &&
            !exportPath.startsWith("./primitives/")
          ) {
            // For non-standard paths, just warn (skip primitives - they use a simpler structure)
            console.warn(`\n⚠️  Non-standard path structure for ${exportPath}`);
            console.warn(`   Import: ${importPath}`);
            console.warn(`   Types:  ${typesPath}`);
          }
        }
      });

      if (inconsistencies.length > 0) {
        console.error("\n❌ Inconsistencies found between JS and Types paths:");
        inconsistencies.forEach((msg) => console.error(`   ${msg}`));
      }

      expect(inconsistencies).toEqual([]);
    });
  });

  describe("Primitives build output validation", () => {
    it("should have all primitive JS files in dist/primitives/", () => {
      const primitivesDir = join(__dirname, "../../dist/primitives");
      const primitiveExports = Object.keys(packageJson.exports).filter((key) =>
        key.startsWith("./primitives/"),
      );

      const missingFiles: string[] = [];
      for (const exportKey of primitiveExports) {
        const primitiveName = exportKey.replace("./primitives/", "");
        const jsPath = join(primitivesDir, `${primitiveName}.js`);

        if (!existsSync(jsPath)) {
          missingFiles.push(`${primitiveName}.js`);
        }
      }

      if (missingFiles.length > 0) {
        console.error("\n❌ Missing primitive JS files in dist/primitives/:");
        missingFiles.forEach((f) => console.error(`   - ${f}`));
      }

      expect(missingFiles).toEqual([]);
    });

    it("should have all primitive .d.ts files in dist/src/primitives/", () => {
      const typesDir = join(__dirname, "../../dist/src/primitives");
      const primitiveExports = Object.keys(packageJson.exports).filter((key) =>
        key.startsWith("./primitives/"),
      );

      const missingFiles: string[] = [];
      for (const exportKey of primitiveExports) {
        const primitiveName = exportKey.replace("./primitives/", "");
        const dtsPath = join(typesDir, `${primitiveName}.d.ts`);

        if (!existsSync(dtsPath)) {
          missingFiles.push(`${primitiveName}.d.ts`);
        }
      }

      if (missingFiles.length > 0) {
        console.error(
          "\n❌ Missing primitive type files in dist/src/primitives/:",
        );
        missingFiles.forEach((f) => console.error(`   - ${f}`));
      }

      expect(missingFiles).toEqual([]);
    });

    it("should have barrel export files", () => {
      const barrelJs = join(__dirname, "../../dist/primitives.js");
      const barrelDts = join(__dirname, "../../dist/src/primitives/index.d.ts");

      expect(existsSync(barrelJs)).toBe(true);
      expect(existsSync(barrelDts)).toBe(true);
    });

    it("should have base-ui bundled in dist (not externalized)", () => {
      // With preserveModules: false, dependencies are bundled into chunk files
      // Check that node_modules directory does NOT exist (proper bundling)
      const nodeModulesDir = join(__dirname, "../../dist/node_modules");

      if (existsSync(nodeModulesDir)) {
        console.error(
          "\n❌ node_modules/ found in dist - dependencies not properly bundled",
        );
        console.error(
          "   This creates nested paths that break Jest in downstream apps",
        );
        console.error("   Check vite.config.ts preserveModules setting");
      }

      // Should NOT have node_modules in dist
      expect(existsSync(nodeModulesDir)).toBe(false);

      // Verify chunk files exist instead (bundled dependencies)
      const distFiles = require("fs").readdirSync(
        join(__dirname, "../../dist"),
      );
      const hasChunkFiles = distFiles.some(
        (file: string) =>
          file.endsWith(".js") &&
          (file.includes(".parts-") || file.startsWith("vendor-")),
      );

      if (!hasChunkFiles) {
        console.error(
          "\n❌ No chunk files found - dependencies may not be bundled",
        );
      }

      expect(hasChunkFiles).toBe(true);
    });

    it("should have source maps for primitives", () => {
      const primitivesDir = join(__dirname, "../../dist/primitives");
      const primitiveExports = Object.keys(packageJson.exports).filter((key) =>
        key.startsWith("./primitives/"),
      );

      const missingMaps: string[] = [];
      for (const exportKey of primitiveExports) {
        const primitiveName = exportKey.replace("./primitives/", "");
        const mapPath = join(primitivesDir, `${primitiveName}.js.map`);

        if (!existsSync(mapPath)) {
          missingMaps.push(`${primitiveName}.js.map`);
        }
      }

      // Source maps are nice-to-have, just warn if missing
      if (missingMaps.length > 0) {
        console.warn(
          `\n⚠️  ${missingMaps.length} primitive source maps missing`,
        );
      }

      // We expect source maps in production builds
      expect(missingMaps.length).toBeLessThan(primitiveExports.length / 2);
    });

    it("primitive JS files should import from bundled chunks", async () => {
      const sliderJs = join(__dirname, "../../dist/primitives/slider.js");
      const content = readFileSync(sliderJs, "utf-8");

      // Should import from bundled chunk files (e.g., index.parts-*.js), not external packages
      expect(content).toMatch(/from\s+["']\.\.\/.+\.js["']/);

      // Should NOT import directly from @base-ui-components (would indicate externalization)
      expect(content).not.toMatch(/from\s+['"]@base-ui-components\/react/);
    });
  });

  describe("Vite build configuration alignment", () => {
    it("should have matching structure between vite config and package.json exports", () => {
      const viteConfigPath = join(__dirname, "../../vite.config.ts");
      const viteConfigContent = readFileSync(viteConfigPath, "utf-8");

      // Check if preserveModules is enabled
      const hasPreserveModules = viteConfigContent.includes(
        "preserveModules: true",
      );

      if (hasPreserveModules) {
        // With preserveModules, build output is flattened
        // JS: dist/components/button.js
        // Types: dist/src/components/button/index.d.ts (from vite-plugin-dts)

        const exports = packageJson.exports;
        const mismatches: string[] = [];

        Object.entries(exports).forEach(([exportPath, config]) => {
          if (
            typeof config === "string" ||
            exportPath.includes("*") ||
            exportPath === "."
          ) {
            return;
          }

          const exportConfig = config as { types?: string; import?: string };

          // Extract component/block/layout name from export path
          const match = exportPath.match(
            /^\.\/(?:components|blocks|layouts)\/(.+)$/,
          );
          if (!match) return;

          const [, name] = match;
          const category = exportPath.split("/")[1]; // components, blocks, or layouts

          // Expected paths with preserveModules
          const expectedImport = `./dist/${category}/${name}.js`;
          const expectedTypes = `./dist/src/${category}/${name}/index.d.ts`;

          if (exportConfig.import !== expectedImport) {
            mismatches.push(
              `${exportPath} import path mismatch:\n` +
                `  Expected: ${expectedImport}\n` +
                `  Actual:   ${exportConfig.import}`,
            );
          }

          if (exportConfig.types !== expectedTypes) {
            mismatches.push(
              `${exportPath} types path mismatch:\n` +
                `  Expected: ${expectedTypes}\n` +
                `  Actual:   ${exportConfig.types}`,
            );
          }
        });

        if (mismatches.length > 0) {
          console.error(
            "\n❌ Export paths do not match vite build configuration:",
          );
          mismatches.forEach((msg) => console.error(`   ${msg}`));
        }

        expect(mismatches).toEqual([]);
      }
    });
  });
});
