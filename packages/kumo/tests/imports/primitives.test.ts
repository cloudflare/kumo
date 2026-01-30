import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = join(__dirname, "../../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

const primitivesSourcePath = join(__dirname, "../../src/primitives/index.ts");

// Use require.resolve to find the package regardless of where pnpm hoists it
let baseUiPackagePath: string;
try {
  baseUiPackagePath = require.resolve("@base-ui/react/package.json");
} catch {
  // Fallback to relative path if require.resolve fails
  baseUiPackagePath = join(
    __dirname,
    "../../../../node_modules/@base-ui/react/package.json",
  );
}

// Exports excluded by generate-primitives.ts
const EXCLUDED_EXPORTS = new Set([
  "./package.json",
  "./types",
  "./esm",
  "./unstable-no-ssr",
  "./unstable-use-media-query",
  "./merge-props",
  "./use-render",
]);

describe("Primitives Export", () => {
  describe("Package.json configuration", () => {
    it("should have primitives export in package.json", () => {
      expect(packageJson.exports).toHaveProperty("./primitives");
    });

    it("should have correct primitives export format", () => {
      const primitivesExport = packageJson.exports["./primitives"];
      expect(primitivesExport).toHaveProperty("types");
      expect(primitivesExport).toHaveProperty("import");
      expect(primitivesExport.types).toBe("./dist/src/primitives/index.d.ts");
      expect(primitivesExport.import).toBe("./dist/primitives.js");
    });
  });

  describe("Source file", () => {
    it("should have src/primitives/index.ts file", () => {
      expect(existsSync(primitivesSourcePath)).toBe(true);
    });

    it("should be importable", async () => {
      await expect(
        import("../../src/primitives/index.ts"),
      ).resolves.toBeDefined();
    });
  });

  describe("Sync with base-ui", () => {
    it("should have base-ui package installed", () => {
      expect(existsSync(baseUiPackagePath)).toBe(true);
    });

    it("should export all base-ui primitives from kumo", async () => {
      const baseUiPackage = JSON.parse(
        readFileSync(baseUiPackagePath, "utf-8"),
      );
      const baseUiExports = Object.keys(baseUiPackage.exports || {})
        .filter((key) => key.startsWith("./") && !EXCLUDED_EXPORTS.has(key))
        .map((key) => key.replace("./", ""));

      // Import kumo primitives
      const kumoPrimitives = await import("../../src/primitives/index.ts");
      const kumoExportNames = Object.keys(kumoPrimitives);

      // For each base-ui export, check that kumo re-exports something from it
      // Base-ui components export namespaced objects (e.g., Dialog.Root, Dialog.Trigger)
      const missingExports: string[] = [];

      for (const exportName of baseUiExports) {
        // Convert kebab-case to PascalCase (e.g., "alert-dialog" -> "AlertDialog")
        const pascalName = exportName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("");

        if (!kumoExportNames.includes(pascalName)) {
          missingExports.push(`${exportName} (expected: ${pascalName})`);
        }
      }

      if (missingExports.length > 0) {
        console.error(
          "\n❌ Base-ui primitives missing from @cloudflare/kumo/primitives:",
        );
        missingExports.forEach((name) => {
          console.error(`   - ${name}`);
        });
      }

      expect(missingExports).toEqual([]);
    });

    it("should re-export all non-excluded base-ui exports", () => {
      const baseUiPackage = JSON.parse(
        readFileSync(baseUiPackagePath, "utf-8"),
      );
      const baseUiExports = Object.keys(baseUiPackage.exports || {})
        .filter((key) => key.startsWith("./") && !EXCLUDED_EXPORTS.has(key))
        .map((key) => key.replace("./", ""));

      const primitivesSource = readFileSync(primitivesSourcePath, "utf-8");

      const missingExports: string[] = [];
      for (const exportName of baseUiExports) {
        const expectedImport = `@base-ui/react/${exportName}`;
        if (!primitivesSource.includes(expectedImport)) {
          missingExports.push(exportName);
        }
      }

      if (missingExports.length > 0) {
        console.error("\n❌ Base-ui exports missing from primitives:");
        console.error("   Run `pnpm build:primitives` to regenerate");
        missingExports.forEach((name) => {
          console.error(`   - ${name}`);
        });
      }

      expect(missingExports).toEqual([]);
    });

    it("should not have stale exports (exports removed from base-ui)", () => {
      const baseUiPackage = JSON.parse(
        readFileSync(baseUiPackagePath, "utf-8"),
      );
      const baseUiExports = new Set(
        Object.keys(baseUiPackage.exports || {})
          .filter((key) => key.startsWith("./"))
          .map((key) => key.replace("./", "")),
      );

      const primitivesSource = readFileSync(primitivesSourcePath, "utf-8");

      // Extract export paths from primitives source
      const exportRegex = /export \* from "@base-ui\/react\/([^"]+)"/g;
      const primitivesExports: string[] = [];
      let match;
      while ((match = exportRegex.exec(primitivesSource)) !== null) {
        primitivesExports.push(match[1]);
      }

      const staleExports = primitivesExports.filter(
        (exp) => !baseUiExports.has(exp),
      );

      if (staleExports.length > 0) {
        console.error(
          "\n❌ Stale exports in primitives (no longer in base-ui):",
        );
        console.error("   Run `pnpm build:primitives` to regenerate");
        staleExports.forEach((name) => {
          console.error(`   - ${name}`);
        });
      }

      expect(staleExports).toEqual([]);
    });
  });

  describe("Vite build configuration", () => {
    it("should have primitives entry in vite.config.ts", () => {
      const viteConfigPath = join(__dirname, "../../vite.config.ts");
      const viteConfig = readFileSync(viteConfigPath, "utf-8");

      expect(viteConfig).toContain("primitives");
      expect(viteConfig).toContain("src/primitives/index.ts");
    });

    it("should have getPrimitiveEntries function for dynamic discovery", () => {
      const viteConfigPath = join(__dirname, "../../vite.config.ts");
      const viteConfig = readFileSync(viteConfigPath, "utf-8");

      expect(viteConfig).toContain("getPrimitiveEntries");
      expect(viteConfig).toContain("...getPrimitiveEntries()");
    });
  });

  describe("Granular exports", () => {
    it("should have individual primitive source files", () => {
      const baseUiPackage = JSON.parse(
        readFileSync(baseUiPackagePath, "utf-8"),
      );
      const baseUiExports = Object.keys(baseUiPackage.exports || {})
        .filter((key) => key.startsWith("./") && !EXCLUDED_EXPORTS.has(key))
        .map((key) => key.replace("./", ""));

      const missingFiles: string[] = [];
      for (const exportName of baseUiExports) {
        const primitiveFilePath = join(
          __dirname,
          `../../src/primitives/${exportName}.ts`,
        );
        if (!existsSync(primitiveFilePath)) {
          missingFiles.push(exportName);
        }
      }

      if (missingFiles.length > 0) {
        console.error("\n❌ Missing individual primitive files:");
        console.error("   Run `pnpm build:primitives` to regenerate");
        missingFiles.forEach((name) => {
          console.error(`   - src/primitives/${name}.ts`);
        });
      }

      expect(missingFiles).toEqual([]);
    });

    it("should have granular exports in package.json for each primitive", () => {
      const baseUiPackage = JSON.parse(
        readFileSync(baseUiPackagePath, "utf-8"),
      );
      const baseUiExports = Object.keys(baseUiPackage.exports || {})
        .filter((key) => key.startsWith("./") && !EXCLUDED_EXPORTS.has(key))
        .map((key) => key.replace("./", ""));

      const missingExports: string[] = [];
      for (const exportName of baseUiExports) {
        const exportKey = `./primitives/${exportName}`;
        if (!packageJson.exports[exportKey]) {
          missingExports.push(exportName);
        }
      }

      if (missingExports.length > 0) {
        console.error("\n❌ Missing granular exports in package.json:");
        console.error("   Run `pnpm build:primitives` to regenerate");
        missingExports.forEach((name) => {
          console.error(`   - ./primitives/${name}`);
        });
      }

      expect(missingExports).toEqual([]);
    });

    it("should have correct format for granular exports", () => {
      const baseUiPackage = JSON.parse(
        readFileSync(baseUiPackagePath, "utf-8"),
      );
      const baseUiExports = Object.keys(baseUiPackage.exports || {})
        .filter((key) => key.startsWith("./") && !EXCLUDED_EXPORTS.has(key))
        .map((key) => key.replace("./", ""));

      const invalidExports: string[] = [];
      for (const exportName of baseUiExports) {
        const exportKey = `./primitives/${exportName}`;
        const exportValue = packageJson.exports[exportKey];

        if (!exportValue) continue;

        const expectedTypes = `./dist/src/primitives/${exportName}.d.ts`;
        const expectedImport = `./dist/primitives/${exportName}.js`;

        if (
          exportValue.types !== expectedTypes ||
          exportValue.import !== expectedImport
        ) {
          invalidExports.push(
            `${exportName}: expected types="${expectedTypes}", import="${expectedImport}"`,
          );
        }
      }

      if (invalidExports.length > 0) {
        console.error("\n❌ Invalid granular export formats:");
        invalidExports.forEach((msg) => {
          console.error(`   - ${msg}`);
        });
      }

      expect(invalidExports).toEqual([]);
    });

    it("should be able to import from granular exports", async () => {
      // Test a few representative primitives
      const testPrimitives = ["slider", "popover", "tooltip"];

      for (const primitiveName of testPrimitives) {
        const primitiveFilePath = join(
          __dirname,
          `../../src/primitives/${primitiveName}.ts`,
        );

        if (existsSync(primitiveFilePath)) {
          await expect(
            import(`../../src/primitives/${primitiveName}.ts`),
          ).resolves.toBeDefined();
        }
      }
    });

    it("should have individual primitive files re-export from base-ui", () => {
      const baseUiPackage = JSON.parse(
        readFileSync(baseUiPackagePath, "utf-8"),
      );
      const baseUiExports = Object.keys(baseUiPackage.exports || {})
        .filter((key) => key.startsWith("./") && !EXCLUDED_EXPORTS.has(key))
        .map((key) => key.replace("./", ""));

      const invalidFiles: string[] = [];
      for (const exportName of baseUiExports) {
        const primitiveFilePath = join(
          __dirname,
          `../../src/primitives/${exportName}.ts`,
        );

        if (existsSync(primitiveFilePath)) {
          const content = readFileSync(primitiveFilePath, "utf-8");
          const expectedExport = `export * from "@base-ui/react/${exportName}";`;

          if (!content.includes(expectedExport)) {
            invalidFiles.push(`${exportName}.ts: missing "${expectedExport}"`);
          }
        }
      }

      if (invalidFiles.length > 0) {
        console.error("\n❌ Invalid primitive file contents:");
        invalidFiles.forEach((msg) => {
          console.error(`   - ${msg}`);
        });
      }

      expect(invalidFiles).toEqual([]);
    });
  });
});
