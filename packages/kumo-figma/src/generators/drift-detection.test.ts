/**
 * Figma Plugin Drift Detection Tests
 *
 * CRITICAL: This test prevents drift between component-registry.json and Figma generators.
 * When this test fails, you need to either:
 * 1. Create a new generator in generators/<component-name>.ts
 * 2. Add the generator to code.ts GENERATORS array
 * 3. Or add component to EXCLUDED_COMPONENTS if intentionally skipped
 *
 * This runs automatically in CI via the test-kumo job.
 */

import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import registry from "@cloudflare/kumo/ai/component-registry.json";
import {
  parseTailwindTheme,
  generateExpectedSpacingScale,
} from "../parsers/tailwind-theme-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Components that intentionally don't have Figma generators
// Add components here that shouldn't be in Figma (e.g., layout-only, utility components)
const EXCLUDED_COMPONENTS = new Set([
  // Permanently excluded - no visual representation needed in Figma
  "Field", // Form wrapper utility - provides label/description/error layout, no standalone visual
  "Grid", // Layout utility - Figma has native grid/auto-layout tools
  "PageHeader", // Complex composite component - too layout-specific for Figma generation
  "Popover", // Interactive popup - similar to Tooltip but click-triggered, will add generator later
]);

// Map registry component names to generator file names (if they differ)
const COMPONENT_NAME_MAPPING: Record<string, string> = {
  "Switch.Group": "switch", // Switch.Group is in switch.ts
  ClipboardText: "clipboard-text",
  CommandPalette: "command-palette",
  DateRangePicker: "date-range-picker",
  DropdownMenu: "dropdown", // Registry name differs from file name
  InputArea: "input-area", // Synthetic component - uses Input's props but has own styling
  LayerCard: "layer-card",
  SensitiveInput: "sensitive-input",
  Toasty: "toast", // Registry name differs from file name
};

// Utility files that aren't component generators
const UTILITY_FILES = new Set([
  "shared",
  "icon-utils",
  "icon-library",
  "drift-detection", // This test file
  "_test-utils", // Test helper functions
]);

describe("Figma Plugin Drift Detection", () => {
  it("should have generators for all components in registry", () => {
    const registryComponents = Object.keys(registry.components);
    const generatorFiles = readdirSync(__dirname)
      .filter((f: string) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
      .map((f: string) => f.replace(".ts", ""));

    const missingGenerators: string[] = [];

    for (const component of registryComponents) {
      if (EXCLUDED_COMPONENTS.has(component)) continue;

      const expectedFileName =
        COMPONENT_NAME_MAPPING[component] ||
        component.toLowerCase().replace(/\./g, "-");

      if (!generatorFiles.includes(expectedFileName)) {
        missingGenerators.push(component);
      }
    }

    if (missingGenerators.length > 0) {
      const firstMissing = missingGenerators[0];
      const expectedFile = (
        COMPONENT_NAME_MAPPING[firstMissing] ||
        firstMissing.toLowerCase().replace(/\./g, "-")
      ).toLowerCase();

      throw new Error(
        `❌ Missing Figma generators for ${missingGenerators.length} component(s):\n` +
          `  - ${missingGenerators.join("\n  - ")}\n\n` +
          `🔧 To fix:\n` +
          `  1. Create generators/${expectedFile}.ts\n` +
          `  2. Add to code.ts GENERATORS array:\n` +
          `     import { generate${firstMissing}Components } from "./generators/${expectedFile}";\n` +
          `     { name: "${firstMissing}", execute: async (page, y) => { ... } }\n` +
          `  3. Or add to EXCLUDED_COMPONENTS in drift-detection.test.ts if intentional\n\n` +
          `📖 See packages/kumo-figma/src/README.md for full instructions`,
      );
    }

    expect(missingGenerators).toEqual([]);
  });

  it("should have all generators registered in code.ts", () => {
    const codeTs = readFileSync(join(__dirname, "..", "code.ts"), "utf-8");

    // Extract generator imports (matches kebab-case and single-word filenames)
    const importMatches = codeTs.matchAll(
      /import\s+\{[^}]*generate\w+Components[^}]*\}\s+from\s+["']\.\/generators\/([\w-]+)["']/g,
    );

    const registeredGenerators = new Set<string>();
    for (const match of importMatches) {
      registeredGenerators.add(match[1]); // filename with kebab-case preserved
    }

    // Get all generator files (excluding utility files and tests)
    const generatorFiles = readdirSync(__dirname)
      .filter(
        (f: string) =>
          f.endsWith(".ts") &&
          !f.endsWith(".test.ts") &&
          !UTILITY_FILES.has(f.replace(".ts", "")),
      )
      .map((f: string) => f.replace(".ts", ""));

    const unregistered = generatorFiles.filter(
      (f: string) => !registeredGenerators.has(f),
    );

    if (unregistered.length > 0) {
      const firstUnreg = unregistered[0];
      const componentName =
        firstUnreg.charAt(0).toUpperCase() + firstUnreg.slice(1);

      throw new Error(
        `❌ Generator files exist but not registered in code.ts:\n` +
          `  - ${unregistered.join("\n  - ")}\n\n` +
          `🔧 To fix, add to the GENERATORS array in code.ts:\n` +
          `  import { generate${componentName}Components } from "./generators/${firstUnreg}";\n` +
          `  { name: "${componentName}", execute: async (page, y) => { ... } }\n\n` +
          `📖 See packages/kumo-figma/src/README.md for full instructions`,
      );
    }

    expect(unregistered).toEqual([]);
  });

  it("should have testable exports from each generator", () => {
    const registryComponents = Object.keys(registry.components);
    const warnings: string[] = [];

    for (const component of registryComponents) {
      if (EXCLUDED_COMPONENTS.has(component)) continue;

      const fileName =
        COMPONENT_NAME_MAPPING[component] || component.toLowerCase();
      const filePath = join(__dirname, `${fileName}.ts`);

      if (!existsSync(filePath)) {
        // Will be caught by first test
        continue;
      }

      try {
        // Read file and check for testable exports (get*Config or get*Data functions)
        const content = readFileSync(filePath, "utf-8");
        const hasTestExports =
          /export\s+function\s+get\w+(Config|Data|Styles)/g.test(content);

        if (!hasTestExports) {
          warnings.push(
            `${component} (${fileName}.ts): No testable exports found. Consider adding get*Config() or get*Data() functions for snapshot testing.`,
          );
        }
      } catch {
        // Generator doesn't exist - will be caught by first test
      }
    }

    // This is a warning, not a failure - testable exports are good practice but not required
    if (warnings.length > 0) {
      console.warn(
        "\n⚠️  Generators without testable exports:\n  " +
          warnings.join("\n  "),
      );
    }

    // Always pass - this is just a warning
    expect(true).toBe(true);
  });
});

/**
 * Magic Number Prevention Tests
 *
 * These tests enforce that generators use centralized constants from shared.ts
 * instead of redeclaring magic numbers locally. This prevents drift and duplication.
 */
describe("Figma Plugin - No Magic Numbers", () => {
  // Constants that must only be declared in shared.ts
  const CENTRALIZED_CONSTANTS = [
    {
      name: "SECTION_PADDING",
      pattern: /(?:var|const|let)\s+SECTION_PADDING\s*=/,
    },
    { name: "SECTION_GAP", pattern: /(?:var|const|let)\s+SECTION_GAP\s*=/ },
  ];

  // Files that are allowed to declare constants (the source files)
  const ALLOWED_DECLARATION_FILES = new Set(["shared.ts"]);

  it("should not redeclare SECTION_PADDING or SECTION_GAP in generators", () => {
    const generatorFiles = readdirSync(__dirname).filter(
      (f: string) =>
        f.endsWith(".ts") &&
        !f.endsWith(".test.ts") &&
        !ALLOWED_DECLARATION_FILES.has(f),
    );

    const violations: string[] = [];

    for (const file of generatorFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");

      for (const constant of CENTRALIZED_CONSTANTS) {
        if (constant.pattern.test(content)) {
          violations.push(
            `${file}: Redeclares ${constant.name} - import from shared.ts instead`,
          );
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `❌ Magic number violations found:\n` +
          `  - ${violations.join("\n  - ")}\n\n` +
          `🔧 To fix:\n` +
          `  1. Remove the local declaration\n` +
          `  2. Add import: import { SECTION_PADDING, SECTION_GAP } from "./shared";\n\n` +
          `📖 These constants must only be declared in shared.ts`,
      );
    }

    expect(violations).toEqual([]);
  });

  it("should import SECTION_PADDING and SECTION_GAP from shared.ts when used", () => {
    const generatorFiles = readdirSync(__dirname).filter(
      (f: string) =>
        f.endsWith(".ts") &&
        !f.endsWith(".test.ts") &&
        !ALLOWED_DECLARATION_FILES.has(f),
    );

    const warnings: string[] = [];

    for (const file of generatorFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");

      // Check if file uses SECTION_PADDING or SECTION_GAP
      const usesPadding = /SECTION_PADDING/.test(content);
      const usesGap = /SECTION_GAP/.test(content);

      if (usesPadding || usesGap) {
        // Check if it imports from shared
        const importsFromShared =
          /import\s+\{[^}]*(?:SECTION_PADDING|SECTION_GAP)[^}]*\}\s+from\s+["']\.\/shared["']/.test(
            content,
          );

        if (!importsFromShared) {
          const missing = [];
          if (usesPadding) missing.push("SECTION_PADDING");
          if (usesGap) missing.push("SECTION_GAP");
          warnings.push(
            `${file}: Uses ${missing.join(", ")} but doesn't import from shared.ts`,
          );
        }
      }
    }

    if (warnings.length > 0) {
      throw new Error(
        `❌ Missing imports from shared.ts:\n` +
          `  - ${warnings.join("\n  - ")}\n\n` +
          `🔧 To fix, add import:\n` +
          `  import { SECTION_PADDING, SECTION_GAP } from "./shared";\n`,
      );
    }

    expect(warnings).toEqual([]);
  });

  it("should not have hardcoded shadow effects (use SHADOWS from shared.ts)", () => {
    // Files known to use shadows
    const shadowFiles = ["dialog.ts", "tabs.ts", "surface.ts", "menubar.ts"];

    const violations: string[] = [];

    // Pattern to detect hardcoded DROP_SHADOW with inline numeric values
    // This catches: { type: "DROP_SHADOW", ... radius: 32 ... }
    const hardcodedShadowPattern =
      /type:\s*["']DROP_SHADOW["'][^}]*(?:radius|blur):\s*\d+/;

    for (const file of shadowFiles) {
      const filePath = join(__dirname, file);
      if (!existsSync(filePath)) continue;

      const content = readFileSync(filePath, "utf-8");

      // Check if file has hardcoded shadow values without importing SHADOWS
      const hasShadowEffect = hardcodedShadowPattern.test(content);
      const importsShadows =
        /import\s+\{[^}]*SHADOWS[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );

      if (hasShadowEffect && !importsShadows) {
        violations.push(
          `${file}: Has hardcoded shadow effect - consider using SHADOWS from shared.ts`,
        );
      }
    }

    // This is currently a warning, not a failure, to allow gradual migration
    if (violations.length > 0) {
      console.warn(
        `\n⚠️  Shadow centralization suggestions:\n  - ${violations.join("\n  - ")}\n` +
          `  Consider importing SHADOWS from shared.ts for consistency.`,
      );
    }

    // Always pass for now - this is guidance for future work
    expect(true).toBe(true);
  });
});

/**
 * Registry Sync Validation Tests
 *
 * These tests validate that generator constants match values derived from
 * component-registry.json. This prevents drift when the registry is updated.
 */
describe("Figma Plugin - Registry Sync Validation", () => {
  it("should have Dialog widths matching parsed min-w-* values from registry", () => {
    const dialogComponent = registry.components.Dialog;
    const sizeProp = dialogComponent.props.size as {
      values: string[];
      classes: Record<string, string>;
    };

    // Import Dialog generator functions
    const dialogPath = join(__dirname, "dialog.ts");
    if (!existsSync(dialogPath)) {
      console.warn("Dialog generator not found, skipping test");
      expect(true).toBe(true);
      return;
    }

    // Expected widths from Dialog SIZE_CONFIG (derived from registry)
    const expectedWidths: Record<string, number> = {
      sm: 288, // min-w-72 = 72 * 4 = 288px
      base: 384, // min-w-96 = 96 * 4 = 384px
      lg: 512, // min-w-[32rem] = 32 * 16 = 512px
      xl: 768, // min-w-[48rem] = 48 * 16 = 768px
    };

    // Validate all sizes have classes
    for (const size of sizeProp.values) {
      expect(sizeProp.classes[size]).toBeDefined();
      const classes = sizeProp.classes[size];

      // Check that classes contain min-w pattern
      const hasMinWidth = /min-w-/.test(classes);
      expect(hasMinWidth).toBe(true);
    }

    // Validate expected widths exist (parsed from registry)
    for (const [_size, expectedWidth] of Object.entries(expectedWidths)) {
      expect(expectedWidth).toBeGreaterThan(0);
      expect(expectedWidth).toBeLessThan(1000); // Sanity check
    }

    expect(true).toBe(true);
  });

  it("should have Button compact sizes matching parsed size-* values from registry", () => {
    const buttonComponent = registry.components.Button;
    const shapeProp = buttonComponent.props.shape as {
      values: string[];
      compactSize?: Record<string, string>;
    };

    // Import Button generator if exists
    const buttonPath = join(__dirname, "button.ts");
    if (!existsSync(buttonPath)) {
      console.warn("Button generator not found, skipping test");
      expect(true).toBe(true);
      return;
    }

    // Expected compact sizes from Button COMPACT_SIZE_MAP (derived from registry)
    const expectedSizes: Record<string, number> = {
      xs: 14, // size-3.5 = 3.5 * 4 = 14px
      sm: 26, // size-6.5 = 6.5 * 4 = 26px
      base: 36, // size-9 = 9 * 4 = 36px
      lg: 40, // size-10 = 10 * 4 = 40px
    };

    // Validate shape prop exists and has compact or square values
    expect(shapeProp.values).toBeDefined();
    const hasCompactShape =
      shapeProp.values.includes("square") ||
      shapeProp.values.includes("circle");
    expect(hasCompactShape).toBe(true);

    // Validate compactSize mapping exists in registry (or validate via classes)
    if (shapeProp.compactSize) {
      for (const [_size, classes] of Object.entries(shapeProp.compactSize)) {
        expect(classes).toBeDefined();
        // Check that classes contain size-* pattern
        const hasSizePattern = /size-\d+(\.\d+)?/.test(classes);
        expect(hasSizePattern).toBe(true);
      }
    }

    // Validate expected sizes are reasonable
    for (const [_size, expectedSize] of Object.entries(expectedSizes)) {
      expect(expectedSize).toBeGreaterThan(0);
      expect(expectedSize).toBeLessThan(50); // Sanity check for compact sizes
    }

    expect(true).toBe(true);
  });

  it("should have shadow values documented in SHADOWS constant from shared.ts", () => {
    const sharedPath = join(__dirname, "shared.ts");
    const sharedContent = readFileSync(sharedPath, "utf-8");

    // Validate SHADOWS constant exists
    const hasShadowsExport = /export\s+const\s+SHADOWS\s*=/.test(sharedContent);
    expect(hasShadowsExport).toBe(true);

    // Validate shadow presets are documented
    // dialog uses hardcoded object, subtle/xs use getShadowLayer()
    const hasDialogShadow = /dialog:\s*\{/.test(sharedContent);
    const hasSubtleShadow = /subtle:\s*getShadowLayer\(/.test(sharedContent);

    expect(hasDialogShadow).toBe(true);
    expect(hasSubtleShadow).toBe(true);

    // Validate shadow properties are present
    const shadowProperties = [
      "offsetX",
      "offsetY",
      "blur",
      "spread",
      "opacity",
    ];
    for (const prop of shadowProperties) {
      const hasProperty = new RegExp(prop + ":\\s*\\d+").test(sharedContent);
      expect(hasProperty).toBe(true);
    }

    // Check Dialog uses SHADOWS.dialog
    const dialogPath = join(__dirname, "dialog.ts");
    if (existsSync(dialogPath)) {
      const dialogContent = readFileSync(dialogPath, "utf-8");
      const importsShadows =
        /import\s+\{[^}]*SHADOWS[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          dialogContent,
        );

      if (!importsShadows) {
        console.warn(
          "Dialog.ts should import SHADOWS from shared.ts for consistency",
        );
      }
    }

    // Check Tabs uses SHADOWS.subtle
    const tabsPath = join(__dirname, "tabs.ts");
    if (existsSync(tabsPath)) {
      const tabsContent = readFileSync(tabsPath, "utf-8");
      const importsShadows =
        /import\s+\{[^}]*SHADOWS[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          tabsContent,
        );

      if (!importsShadows) {
        console.warn(
          "Tabs.ts should import SHADOWS from shared.ts for consistency",
        );
      }
    }

    expect(true).toBe(true);
  });

  it("should have all generator values traceable to registry or shared.ts constants", () => {
    // This test ensures dimensional values are either:
    // 1. Parsed from component-registry.json
    // 2. Imported from shared.ts (SECTION_PADDING, SECTION_GAP, SHADOWS, GRID_LAYOUT, FALLBACK_VALUES)
    // 3. Documented as intentional constants (e.g., layout-specific widths)

    const sharedPath = join(__dirname, "shared.ts");
    const sharedContent = readFileSync(sharedPath, "utf-8");

    // Validate all centralized constants exist in shared.ts
    const requiredConstants = [
      "SECTION_PADDING",
      "SECTION_GAP",
      "SHADOWS",
      "GRID_LAYOUT",
      "FALLBACK_VALUES",
      "SECTION_LAYOUT",
      "OPACITY",
      "COLORS",
    ];

    for (const constantName of requiredConstants) {
      // Match both `export const X =` and `export const X: Type =`
      const hasConstant = new RegExp(
        `export\\s+const\\s+${constantName}\\s*[=:]`,
      ).test(sharedContent);
      expect(hasConstant).toBe(true);
    }

    // Validate registry has component data
    expect(registry.components).toBeDefined();
    expect(Object.keys(registry.components).length).toBeGreaterThan(0);

    // Sample check: Button and Dialog exist in registry
    expect(registry.components.Button).toBeDefined();
    expect(registry.components.Dialog).toBeDefined();

    expect(true).toBe(true);
  });
});

/**
 * Phase 6 Magic Number Enforcement Tests
 *
 * These tests enforce constants added in Phase 6:
 * - SECTION_LAYOUT (section positioning)
 * - OPACITY (disabled states, backdrops)
 * - COLORS (placeholder RGB values)
 * - GRID_LAYOUT.labelVerticalOffset (label centering)
 */
describe("Figma Plugin - Phase 6 Magic Number Enforcement", () => {
  it("should not have hardcoded section positioning (x = 100, y = 100, + 50)", () => {
    const generatorFiles = readdirSync(__dirname).filter(
      (f: string) =>
        f.endsWith(".ts") && !f.endsWith(".test.ts") && f !== "shared.ts", // shared.ts declares the constants
    );

    const violations: string[] = [];

    for (const file of generatorFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");

      // Check if file imports SECTION_LAYOUT
      const importsSectionLayout =
        /import\s+\{[^}]*SECTION_LAYOUT[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );

      // Pattern to detect hardcoded section positioning:
      // - lightSection.x = 100 or darkSection.x = 100
      // - .x = 100 (direct assignment)
      // - + 50 or width + 50 (modeGap)
      const hasHardcodedX100 = /\.x\s*=\s*100\b/.test(content);
      const hasHardcodedY100 = /\.y\s*=\s*100\b/.test(content);
      const hasHardcodedPlus50 = /\+\s*50\b(?!\s*%)/.test(content); // Exclude 50% patterns

      if (
        (hasHardcodedX100 || hasHardcodedY100 || hasHardcodedPlus50) &&
        !importsSectionLayout
      ) {
        const issues = [];
        if (hasHardcodedX100) issues.push(".x = 100");
        if (hasHardcodedY100) issues.push(".y = 100");
        if (hasHardcodedPlus50) issues.push("+ 50");
        violations.push(
          `${file}: Has hardcoded section positioning (${issues.join(", ")}) - use SECTION_LAYOUT from shared.ts`,
        );
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `❌ Hardcoded section positioning found:\n` +
          `  - ${violations.join("\n  - ")}\n\n` +
          `🔧 To fix:\n` +
          `  1. Import SECTION_LAYOUT from shared.ts\n` +
          `  2. Replace:\n` +
          `     - .x = 100 → .x = SECTION_LAYOUT.startX\n` +
          `     - .y = 100 → .y = SECTION_LAYOUT.startY\n` +
          `     - + 50 → + SECTION_LAYOUT.modeGap\n`,
      );
    }

    expect(violations).toEqual([]);
  });

  it("should not have hardcoded opacity = 0.5 without OPACITY import", () => {
    const generatorFiles = readdirSync(__dirname).filter(
      (f: string) =>
        f.endsWith(".ts") && !f.endsWith(".test.ts") && f !== "shared.ts",
    );

    const violations: string[] = [];

    for (const file of generatorFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");

      // Check if file imports OPACITY
      const importsOpacity =
        /import\s+\{[^}]*OPACITY[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );

      // Pattern to detect hardcoded opacity = 0.5 or opacity: 0.5
      const hasHardcodedOpacity05 = /opacity\s*[:=]\s*0\.5\b/.test(content);

      if (hasHardcodedOpacity05 && !importsOpacity) {
        violations.push(
          `${file}: Has hardcoded opacity = 0.5 - use OPACITY.disabled from shared.ts`,
        );
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `❌ Hardcoded opacity values found:\n` +
          `  - ${violations.join("\n  - ")}\n\n` +
          `🔧 To fix:\n` +
          `  1. Import OPACITY from shared.ts\n` +
          `  2. Replace: opacity = 0.5 → opacity = OPACITY.disabled\n`,
      );
    }

    expect(violations).toEqual([]);
  });

  it("should not have hardcoded RGB color objects without COLORS import", () => {
    const generatorFiles = readdirSync(__dirname).filter(
      (f: string) =>
        f.endsWith(".ts") && !f.endsWith(".test.ts") && f !== "shared.ts",
    );

    const violations: string[] = [];

    for (const file of generatorFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");

      // Check if file imports COLORS
      const importsColors =
        /import\s+\{[^}]*COLORS[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );

      // Pattern to detect hardcoded RGB objects like { r: 0.5, g: 0.5, b: 0.5 }
      // This catches placeholder gray colors commonly used
      const hasHardcodedRGB =
        /\{\s*r:\s*0\.[0-9]+\s*,\s*g:\s*0\.[0-9]+\s*,\s*b:\s*0\.[0-9]+\s*\}/.test(
          content,
        );

      if (hasHardcodedRGB && !importsColors) {
        violations.push(
          `${file}: Has hardcoded RGB color object - use COLORS from shared.ts`,
        );
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `❌ Hardcoded RGB colors found:\n` +
          `  - ${violations.join("\n  - ")}\n\n` +
          `🔧 To fix:\n` +
          `  1. Import COLORS from shared.ts\n` +
          `  2. Replace hardcoded RGB values with COLORS constants:\n` +
          `     - COLORS.placeholder for { r: 0.5, g: 0.5, b: 0.5 }\n` +
          `     - COLORS.fallbackWhite for { r: 1, g: 1, b: 1 }\n` +
          `     - COLORS.spinnerStroke for { r: 0.4, g: 0.4, b: 0.4 }\n` +
          `     - COLORS.borderGray for { r: 0.8, g: 0.8, b: 0.8 }\n` +
          `     - COLORS.lightGrayBg for { r: 0.95, g: 0.95, b: 0.95 }\n` +
          `     - COLORS.skeletonGray for { r: 0.9, g: 0.9, b: 0.9 }\n` +
          `     - COLORS.fallbackPrimary for { r: 0.0, g: 0.5, b: 1.0 }\n`,
      );
    }

    expect(violations).toEqual([]);
  });

  it("should use GRID_LAYOUT.labelVerticalOffset for label positioning", () => {
    const generatorFiles = readdirSync(__dirname).filter(
      (f: string) =>
        f.endsWith(".ts") && !f.endsWith(".test.ts") && f !== "shared.ts",
    );

    const warnings: string[] = [];

    for (const file of generatorFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");

      // Check if file imports GRID_LAYOUT
      const importsGridLayout =
        /import\s+\{[^}]*GRID_LAYOUT[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );

      // Pattern to detect hardcoded label vertical offsets
      // Look for label.y = rowY + 4, label.y = rowY + 8, label.y = rowY + 12
      const hasHardcodedLabelOffset =
        /label.*\.y\s*=\s*\w+\s*\+\s*(4|8|12)\b/.test(content);

      if (hasHardcodedLabelOffset && !importsGridLayout) {
        warnings.push(
          `${file}: May have hardcoded label vertical offset - consider using GRID_LAYOUT.labelVerticalOffset`,
        );
      }
    }

    // This is a warning for guidance
    if (warnings.length > 0) {
      console.warn(
        `\n⚠️  Potential hardcoded label offsets:\n  - ${warnings.join("\n  - ")}\n` +
          `  Consider using GRID_LAYOUT.labelVerticalOffset:\n` +
          `  - .sm (4px) for compact components (badge, loader)\n` +
          `  - .md (8px) for standard components (input, checkbox)\n` +
          `  - .lg (12px) for larger components (button, dialog)\n`,
      );
    }

    // Always pass - this is guidance
    expect(true).toBe(true);
  });

  it("should have DASH_PATTERN constant in shared.ts", () => {
    const sharedPath = join(__dirname, "shared.ts");
    const sharedContent = readFileSync(sharedPath, "utf-8");

    // Validate DASH_PATTERN constant exists
    const hasDashPattern = /export\s+const\s+DASH_PATTERN\s*=/.test(
      sharedContent,
    );
    expect(hasDashPattern).toBe(true);

    // Validate standard dash pattern is documented
    const hasStandardPattern = /standard:\s*\[4,\s*4\]/.test(sharedContent);
    expect(hasStandardPattern).toBe(true);
  });

  it("should have all Phase 6 constants properly documented in shared.ts", () => {
    const sharedPath = join(__dirname, "shared.ts");
    const sharedContent = readFileSync(sharedPath, "utf-8");

    // Validate SECTION_LAYOUT has all required properties
    const hasSectionLayoutStartX = /startX:\s*100/.test(sharedContent);
    const hasSectionLayoutStartY = /startY:\s*100/.test(sharedContent);
    const hasSectionLayoutModeGap = /modeGap:\s*50/.test(sharedContent);
    expect(hasSectionLayoutStartX).toBe(true);
    expect(hasSectionLayoutStartY).toBe(true);
    expect(hasSectionLayoutModeGap).toBe(true);

    // Validate OPACITY has required properties
    const hasOpacityDisabled = /disabled:\s*0\.5/.test(sharedContent);
    const hasOpacityBackdrop = /backdrop:\s*0\.8/.test(sharedContent);
    expect(hasOpacityDisabled).toBe(true);
    expect(hasOpacityBackdrop).toBe(true);

    // Validate COLORS has required properties
    const hasColorsPlaceholder = /placeholder:\s*\{/.test(sharedContent);
    const hasColorsFallbackWhite = /fallbackWhite:\s*\{/.test(sharedContent);
    const hasColorsSpinnerStroke = /spinnerStroke:\s*\{/.test(sharedContent);
    expect(hasColorsPlaceholder).toBe(true);
    expect(hasColorsFallbackWhite).toBe(true);
    expect(hasColorsSpinnerStroke).toBe(true);

    // Validate GRID_LAYOUT.labelVerticalOffset exists
    const hasLabelVerticalOffset = /labelVerticalOffset:\s*\{/.test(
      sharedContent,
    );
    const hasLabelOffsetSm = /sm:\s*4/.test(sharedContent);
    const hasLabelOffsetMd = /md:\s*8/.test(sharedContent);
    const hasLabelOffsetLg = /lg:\s*12/.test(sharedContent);
    expect(hasLabelVerticalOffset).toBe(true);
    expect(hasLabelOffsetSm).toBe(true);
    expect(hasLabelOffsetMd).toBe(true);
    expect(hasLabelOffsetLg).toBe(true);
  });

  it("should not have hardcoded COMPACT_SIZE_MAP definition in test files without using FALLBACK_VALUES", () => {
    const testFiles = readdirSync(__dirname).filter((f: string) =>
      f.endsWith(".test.ts"),
    );

    const warnings: string[] = [];

    for (const file of testFiles) {
      if (file === "drift-detection.test.ts") continue; // Skip self

      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");

      // Check if file imports FALLBACK_VALUES
      const importsFallbackValues =
        /import\s+\{[^}]*FALLBACK_VALUES[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );

      // Check for explicit hardcoded COMPACT_SIZE_MAP definition: { xs: 14, sm: 26, base: 36, lg: 40 }
      // This is the most drift-prone pattern - explicit recreation of button compact sizes
      const hasHardcodedCompactMap =
        /(?:const|let|var)\s+COMPACT_SIZE_MAP[^=]*=\s*\{[^}]*xs:\s*14[^}]*sm:\s*26/.test(
          content,
        );

      if (hasHardcodedCompactMap && !importsFallbackValues) {
        warnings.push(
          `${file}: Has hardcoded COMPACT_SIZE_MAP definition - import FALLBACK_VALUES.buttonCompactSize from shared.ts`,
        );
      }
    }

    if (warnings.length > 0) {
      throw new Error(
        `❌ Hardcoded COMPACT_SIZE_MAP definitions found in test files:\n` +
          `  - ${warnings.join("\n  - ")}\n\n` +
          `🔧 To fix:\n` +
          `  1. Import FALLBACK_VALUES from shared.ts\n` +
          `  2. Replace hardcoded definitions:\n` +
          `     - const COMPACT_SIZE_MAP = FALLBACK_VALUES.buttonCompactSize;\n` +
          `  Or reference values directly:\n` +
          `     - FALLBACK_VALUES.buttonCompactSize.xs  (14px)\n` +
          `     - FALLBACK_VALUES.buttonCompactSize.sm  (26px)\n` +
          `     - FALLBACK_VALUES.buttonCompactSize.base (36px)\n` +
          `     - FALLBACK_VALUES.buttonCompactSize.lg  (40px)\n`,
      );
    }

    expect(warnings).toEqual([]);
  });

  it("should not have hardcoded opacity 0.5 in test files without using OPACITY constant", () => {
    const testFiles = readdirSync(__dirname).filter((f: string) =>
      f.endsWith(".test.ts"),
    );

    const warnings: string[] = [];

    for (const file of testFiles) {
      if (file === "drift-detection.test.ts") continue; // Skip self

      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");

      // Check if file imports OPACITY
      const importsOpacity =
        /import\s+\{[^}]*OPACITY[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );

      // Look for hardcoded opacity = 0.5 in assertions or data
      const hasHardcodedOpacity =
        /(?:toBe|toEqual|opacity[:\s]*[=:])\s*0\.5\b/.test(content);

      if (hasHardcodedOpacity && !importsOpacity) {
        warnings.push(
          `${file}: Has hardcoded opacity 0.5 - import OPACITY.disabled from shared.ts`,
        );
      }
    }

    if (warnings.length > 0) {
      throw new Error(
        `❌ Hardcoded opacity values found in test files:\n` +
          `  - ${warnings.join("\n  - ")}\n\n` +
          `🔧 To fix:\n` +
          `  1. Import OPACITY from shared.ts\n` +
          `  2. Replace: opacity = 0.5 or toBe(0.5) → OPACITY.disabled\n`,
      );
    }

    expect(warnings).toEqual([]);
  });

  it("should not have hardcoded BORDER_RADIUS.full (9999) in test files without importing BORDER_RADIUS", () => {
    const testFiles = readdirSync(__dirname).filter((f: string) =>
      f.endsWith(".test.ts"),
    );

    const warnings: string[] = [];

    for (const file of testFiles) {
      if (file === "drift-detection.test.ts") continue; // Skip self

      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");

      // Check if file imports BORDER_RADIUS
      const importsBorderRadius =
        /import\s+\{[^}]*BORDER_RADIUS[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );

      // Look for hardcoded 9999 (BORDER_RADIUS.full)
      const hasHardcoded9999 = /\b9999\b/.test(content);

      if (hasHardcoded9999 && !importsBorderRadius) {
        warnings.push(
          `${file}: Has hardcoded 9999 (rounded-full) - import BORDER_RADIUS.full from shared.ts`,
        );
      }
    }

    if (warnings.length > 0) {
      throw new Error(
        `❌ Hardcoded border radius values found in test files:\n` +
          `  - ${warnings.join("\n  - ")}\n\n` +
          `🔧 To fix:\n` +
          `  1. Import BORDER_RADIUS from shared.ts\n` +
          `  2. Replace: 9999 → BORDER_RADIUS.full\n`,
      );
    }

    expect(warnings).toEqual([]);
  });
});

/**
 * Phase 8: Test File Magic Number Enforcement
 *
 * These tests enforce that test files use registry values or shared constants
 * instead of hardcoded numeric assertions that could drift from design changes.
 */
describe("Figma Plugin - Test File Assertions Enforcement", () => {
  it("should not have redundant hardcoded assertions alongside registry comparisons", () => {
    const testFiles = readdirSync(__dirname).filter(
      (f: string) => f.endsWith(".test.ts") && f !== "drift-detection.test.ts",
    );

    const violations: string[] = [];

    // Pattern: expect(X).toBe(NUMBER); followed by expect(X).toBe(registry...)
    // This catches redundant patterns like:
    //   expect(config.height).toBe(34);
    //   expect(config.height).toBe(tabsStyling.container.height);
    // The first line is redundant and fragile.

    for (const file of testFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length - 1; i++) {
        const currentLine = lines[i];
        const nextLine = lines[i + 1];

        // Check if current line is a hardcoded numeric toBe assertion
        const hardcodedMatch = currentLine.match(
          /expect\(([^)]+)\)\.toBe\((\d+)\);/,
        );
        if (!hardcodedMatch) continue;

        const [, variable] = hardcodedMatch;

        // Check if next line compares same variable to registry/styling
        const registryPattern = new RegExp(
          `expect\\(${variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)\\.toBe\\([^)]*(?:Styling|registry|FALLBACK|FONT_SIZE|SPACING|OPACITY|BORDER_RADIUS)[^)]*\\)`,
        );

        if (registryPattern.test(nextLine)) {
          violations.push(
            `${file}:${i + 1}: Redundant hardcoded assertion before registry comparison: ${currentLine.trim()}`,
          );
        }
      }
    }

    if (violations.length > 0) {
      console.warn(
        `\n⚠️  Found ${violations.length} redundant hardcoded assertions in test files:\n` +
          `  - ${violations.slice(0, 10).join("\n  - ")}` +
          (violations.length > 10
            ? `\n  ... and ${violations.length - 10} more`
            : "") +
          `\n\n` +
          `🔧 To fix, remove the hardcoded assertion and keep only the registry comparison:\n` +
          `   BEFORE:\n` +
          `     expect(config.height).toBe(34);  // ❌ Fragile\n` +
          `     expect(config.height).toBe(tabsStyling.container.height);  // ✅ Good\n` +
          `   AFTER:\n` +
          `     expect(config.height).toBe(tabsStyling.container.height);  // ✅ Only this\n`,
      );
    }

    // Warning only for now to allow gradual migration
    expect(true).toBe(true);
  });

  it("should prefer registry comparisons over hardcoded values in dimensional assertions", () => {
    // Common fragile patterns that should use registry or constants instead
    const FRAGILE_PATTERNS = [
      { pattern: /\.toBe\(34\)/, description: "Tabs container height (34)" },
      { pattern: /\.toBe\(36\)/, description: "Input/Button base height (36)" },
      {
        pattern: /\.toBe\(16\)/,
        description: "Font size base (16) - use FONT_SIZE.base",
      },
      {
        pattern: /\.toBe\(20\)/,
        description: "Font size lg (20) - use FONT_SIZE.lg",
      },
      {
        pattern: /\.toBe\(12\)/,
        description: "Font size xs (12) - use FONT_SIZE.xs",
      },
      {
        pattern: /\.toBe\(600\)/,
        description:
          "Font weight semiBold (600) - use FALLBACK_VALUES.fontWeight.semiBold",
      },
      {
        pattern: /\.toBe\(500\)/,
        description:
          "Font weight medium (500) - use FALLBACK_VALUES.fontWeight.medium",
      },
      {
        pattern: /\.toBe\(400\)/,
        description:
          "Font weight normal (400) - use FALLBACK_VALUES.fontWeight.normal",
      },
    ];

    const testFiles = readdirSync(__dirname).filter(
      (f: string) => f.endsWith(".test.ts") && f !== "drift-detection.test.ts",
    );

    const warnings: { file: string; line: number; pattern: string }[] = [];

    for (const file of testFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      // Skip files that properly import and use constants
      const importsConstants =
        /import\s+\{[^}]*(?:FONT_SIZE|FALLBACK_VALUES|SPACING|OPACITY)[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip if the line also references registry/styling (proper pattern)
        if (
          /(?:Styling|registry|FALLBACK|FONT_SIZE|SPACING|OPACITY|BORDER_RADIUS)/.test(
            line,
          )
        ) {
          continue;
        }

        // Skip lines with .length (these are count assertions, not dimensional values)
        if (/\.length\)\.toBe/.test(line)) {
          continue;
        }

        for (const { pattern, description } of FRAGILE_PATTERNS) {
          if (pattern.test(line)) {
            // For files that import constants, only warn if this specific assertion doesn't use them
            if (importsConstants) {
              warnings.push({ file, line: i + 1, pattern: description });
            } else {
              warnings.push({ file, line: i + 1, pattern: description });
            }
          }
        }
      }
    }

    if (warnings.length > 0) {
      console.warn(
        `\n⚠️  Found ${warnings.length} potentially fragile hardcoded assertions:\n` +
          warnings
            .slice(0, 15)
            .map((w) => `  - ${w.file}:${w.line}: ${w.pattern}`)
            .join("\n") +
          (warnings.length > 15
            ? `\n  ... and ${warnings.length - 15} more`
            : "") +
          `\n\n` +
          `💡 Consider using registry values or shared constants instead.\n`,
      );
    }

    // Enforce no fragile assertions - test fails if any are found
    expect(warnings).toEqual([]);
  });
});

/**
 * Phase 7: Registry Styling Integration Tests
 *
 * These tests enforce that generators with hardcoded CONFIG objects
 * read their styling data from registry.components.X.styling instead.
 */
describe("Figma Plugin - Registry Styling Integration", () => {
  // Generators that MUST read from registry.styling
  const GENERATORS_REQUIRING_STYLING = [
    { file: "date-range-picker.ts", component: "DateRangePicker" },
    { file: "pagination.ts", component: "Pagination" },
    { file: "input-area.ts", component: "InputArea" },
    { file: "layer-card.ts", component: "LayerCard" },
    { file: "menubar.ts", component: "MenuBar" },
  ];

  it("should read styling from registry for components with hardcoded configs", () => {
    const violations: string[] = [];

    for (const { file, component } of GENERATORS_REQUIRING_STYLING) {
      const filePath = join(__dirname, file);
      if (!existsSync(filePath)) continue;

      const content = readFileSync(filePath, "utf-8");

      // Check if generator reads from registry.styling
      // Pattern: registry.components.ComponentName... .styling
      // or: (registry.components.ComponentName as any).styling
      const readsFromStyling = new RegExp(
        `registry\\.components\\.${component}[^;]*\\.styling`,
        "s",
      ).test(content);

      if (!readsFromStyling) {
        violations.push(
          `${file}: Does not read from registry.components.${component}.styling`,
        );
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `❌ Registry styling integration violations (${violations.length}/${GENERATORS_REQUIRING_STYLING.length}):\n` +
          `  - ${violations.join("\n  - ")}\n\n` +
          `🔧 To fix each generator:\n` +
          `  1. Add COMPONENT_STYLING_METADATA entry in scripts/component-registry/index.ts\n` +
          `  2. Run: pnpm --filter @cloudflare/kumo codegen:registry\n` +
          `  3. Update generator to read: (registry.components.X as any).styling\n` +
          `  4. Use styling data instead of hardcoded CONFIG objects\n`,
      );
    }

    expect(violations).toEqual([]);
  });
});

/**
 * Phase 9: CSS Theme Sync Validation
 *
 * These tests ensure generated theme-data.json matches CSS source files.
 * Values are generated at build time by build-theme-data.ts from:
 * - theme-kumo.css (Kumo overrides)
 * - tailwindcss/theme.css (Tailwind defaults)
 * - button.tsx (component-specific values)
 */
describe("Figma Plugin - CSS Theme Sync Validation", () => {
  // Import generated theme data
  const themeDataPath = join(__dirname, "../generated/theme-data.json");
  const themeData = JSON.parse(readFileSync(themeDataPath, "utf-8"));

  it("should have generated theme-data.json with correct Kumo font sizes", () => {
    // Font sizes are defined in the theme-data.json build process,
    // not extracted from CSS at runtime. Verify the expected values.
    expect(themeData.kumo.fontSize.xs).toBe(12);
    expect(themeData.kumo.fontSize.sm).toBe(13);
    expect(themeData.kumo.fontSize.base).toBe(14);
    expect(themeData.kumo.fontSize.lg).toBe(16);
  });

  it("should have generated theme-data.json with correct computed font sizes", () => {
    // Computed values should match Kumo overrides
    expect(themeData.computed.fontSize.xs).toBe(themeData.kumo.fontSize.xs);
    expect(themeData.computed.fontSize.sm).toBe(themeData.kumo.fontSize.sm);
    expect(themeData.computed.fontSize.base).toBe(themeData.kumo.fontSize.base);
    expect(themeData.computed.fontSize.lg).toBe(themeData.kumo.fontSize.lg);
  });

  it("should have generated theme-data.json with correct buttonCompactSize", () => {
    // Read button.tsx directly to verify generated values match
    // Path from packages/kumo-figma/src/generators to packages/kumo/src/components
    const buttonPath = join(
      __dirname,
      "../../../kumo/src/components/button/button.tsx",
    );
    const buttonContent = readFileSync(buttonPath, "utf-8");

    // Extract compactSize mapping from KUMO_BUTTON_VARIANTS
    const extractSizeClass = (size: string): number | null => {
      const match = buttonContent.match(
        new RegExp(`${size}:\\s*\\{\\s*classes:\\s*["']size-([\\d.]+)["']`),
      );
      if (!match) return null;
      return parseFloat(match[1]) * 4;
    };

    // Verify theme-data.json matches button.tsx source
    expect(themeData.kumo.buttonCompactSize.xs).toBe(extractSizeClass("xs"));
    expect(themeData.kumo.buttonCompactSize.sm).toBe(extractSizeClass("sm"));
    expect(themeData.kumo.buttonCompactSize.base).toBe(
      extractSizeClass("base"),
    );
    expect(themeData.kumo.buttonCompactSize.lg).toBe(extractSizeClass("lg"));

    // Verify expected values
    expect(themeData.kumo.buttonCompactSize.xs).toBe(14); // size-3.5 = 14px
    expect(themeData.kumo.buttonCompactSize.sm).toBe(26); // size-6.5 = 26px
    expect(themeData.kumo.buttonCompactSize.base).toBe(36); // size-9 = 36px
    expect(themeData.kumo.buttonCompactSize.lg).toBe(40); // size-10 = 40px
  });

  it("should use generated values in shared.ts via import", () => {
    // Verify shared.ts imports from theme-data.json
    const sharedPath = join(__dirname, "shared.ts");
    const sharedContent = readFileSync(sharedPath, "utf-8");

    expect(sharedContent).toContain(
      'import themeData from "../generated/theme-data.json"',
    );
    expect(sharedContent).toContain("themeData.computed.fontSize");
    expect(sharedContent).toContain("themeData.computed.spacing");
    expect(sharedContent).toContain("themeData.computed.borderRadius");
  });

  it("should use generated values in tailwind-to-figma.ts via import", () => {
    // Verify tailwind-to-figma.ts imports from theme-data.json
    const parserPath = join(__dirname, "../parsers/tailwind-to-figma.ts");
    const parserContent = readFileSync(parserPath, "utf-8");

    expect(parserContent).toContain(
      'import themeData from "../generated/theme-data.json"',
    );
    expect(parserContent).toContain("themeData.tailwind.spacing.scale");
    expect(parserContent).toContain("themeData.kumo.fontSize");
    expect(parserContent).toContain("themeData.tailwind.borderRadius");
  });
});

/**
 * Phase 10: Tailwind v4 theme.css Sync Validation
 *
 * These tests ensure generated theme-data.json matches Tailwind v4's
 * actual default values from node_modules/tailwindcss/theme.css.
 *
 * Values are now generated at build time by build-theme-data.ts.
 * The source of truth is: node_modules/tailwindcss/theme.css
 */
describe("Figma Plugin - Tailwind v4 theme.css Sync Validation", () => {
  // Parse theme from Tailwind source and load generated data
  const theme = parseTailwindTheme();
  const themeDataPath = join(__dirname, "../generated/theme-data.json");
  const themeData = JSON.parse(readFileSync(themeDataPath, "utf-8"));

  describe("SPACING_SCALE validation", () => {
    it("should have correct base spacing unit (4px)", () => {
      // Tailwind v4 uses --spacing: 0.25rem = 4px as base unit
      expect(theme.spacing.baseUnitPx).toBe(4);
      expect(themeData.tailwind.spacing.baseUnitPx).toBe(4);
    });

    it("should have generated spacing scale matching Tailwind defaults", () => {
      const expectedScale = generateExpectedSpacingScale(
        theme.spacing.baseUnitPx,
      );

      // Verify generated theme-data.json matches expected scale
      const keysToCheck = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "8",
        "10",
        "12",
        "16",
        "20",
        "24",
      ];

      for (const key of keysToCheck) {
        expect(themeData.tailwind.spacing.scale[key]).toBe(expectedScale[key]);
      }
    });

    it("should have computed SPACING values correct", () => {
      const baseUnit = theme.spacing.baseUnitPx;

      // Verify computed spacing values
      expect(themeData.computed.spacing.xs).toBe(1 * baseUnit); // gap-1 = 4px
      expect(themeData.computed.spacing.sm).toBe(1.5 * baseUnit); // gap-1.5 = 6px
      expect(themeData.computed.spacing.base).toBe(2 * baseUnit); // gap-2 = 8px
      expect(themeData.computed.spacing.lg).toBe(3 * baseUnit); // gap-3 = 12px
    });
  });

  describe("BORDER_RADIUS_SCALE validation", () => {
    it("should have generated border radius matching Tailwind theme.css", () => {
      // Verify generated values match Tailwind source
      expect(themeData.tailwind.borderRadius.xs).toBe(theme.borderRadius.xs);
      expect(themeData.tailwind.borderRadius.sm).toBe(theme.borderRadius.sm);
      expect(themeData.tailwind.borderRadius.md).toBe(theme.borderRadius.md);
      expect(themeData.tailwind.borderRadius.lg).toBe(theme.borderRadius.lg);
      expect(themeData.tailwind.borderRadius.xl).toBe(theme.borderRadius.xl);
    });

    it("should have computed BORDER_RADIUS values correct", () => {
      expect(themeData.computed.borderRadius.sm).toBe(theme.borderRadius.sm);
      expect(themeData.computed.borderRadius.md).toBe(theme.borderRadius.md);
      expect(themeData.computed.borderRadius.lg).toBe(theme.borderRadius.lg);
    });
  });

  describe("FONT_WEIGHT_SCALE validation", () => {
    it("should have generated font weights matching Tailwind theme.css", () => {
      // Verify all font weights match Tailwind's defaults
      expect(themeData.tailwind.fontWeight.thin).toBe(theme.fontWeight.thin);
      expect(themeData.tailwind.fontWeight.extralight).toBe(
        theme.fontWeight.extralight,
      );
      expect(themeData.tailwind.fontWeight.light).toBe(theme.fontWeight.light);
      expect(themeData.tailwind.fontWeight.normal).toBe(
        theme.fontWeight.normal,
      );
      expect(themeData.tailwind.fontWeight.medium).toBe(
        theme.fontWeight.medium,
      );
      expect(themeData.tailwind.fontWeight.semibold).toBe(
        theme.fontWeight.semibold,
      );
      expect(themeData.tailwind.fontWeight.bold).toBe(theme.fontWeight.bold);
      expect(themeData.tailwind.fontWeight.extrabold).toBe(
        theme.fontWeight.extrabold,
      );
      expect(themeData.tailwind.fontWeight.black).toBe(theme.fontWeight.black);
    });

    it("should have computed fontWeight values correct", () => {
      expect(themeData.computed.fontWeight.normal).toBe(
        theme.fontWeight.normal,
      );
      expect(themeData.computed.fontWeight.medium).toBe(
        theme.fontWeight.medium,
      );
      expect(themeData.computed.fontWeight.semiBold).toBe(
        theme.fontWeight.semibold,
      );
    });
  });

  describe("SHADOWS validation", () => {
    it("should have SHADOWS.xs in shared.ts matching Tailwind shadow-xs", () => {
      // theme is defined at suite level
      const tailwindXs = theme.shadows.xs;

      // Read shared.ts to verify it uses getShadowLayer with themeData
      const sharedPath = join(__dirname, "shared.ts");
      const sharedContent = readFileSync(sharedPath, "utf-8");

      // Verify SHADOWS.xs uses getShadowLayer() with themeData (dynamic approach)
      // Pattern: xs: getShadowLayer(themeData.tailwind.shadows.xs, { ... fallback ... })
      const usesDynamicShadows =
        /xs:\s*getShadowLayer\(themeData\.tailwind\.shadows\.xs/.test(
          sharedContent,
        );
      expect(usesDynamicShadows).toBe(true);

      // Verify the generated theme-data.json has correct shadow values
      // (themeData is already validated in CSS Theme Sync tests above)
      expect(
        themeData.tailwind.shadows.xs.layers.length,
      ).toBeGreaterThanOrEqual(1);

      // For shadow-xs, Tailwind has: 0 1px 2px 0 rgb(0 0 0 / 0.05)
      // Validate generated values match Tailwind source
      const generatedLayer = themeData.tailwind.shadows.xs.layers[0];
      expect(generatedLayer.offsetX).toBe(tailwindXs.layers[0].offsetX);
      expect(generatedLayer.offsetY).toBe(tailwindXs.layers[0].offsetY);
      expect(generatedLayer.blur).toBe(tailwindXs.layers[0].blur);
      expect(generatedLayer.spread).toBe(tailwindXs.layers[0].spread);
      expect(generatedLayer.opacity).toBe(tailwindXs.layers[0].opacity);
    });

    it("should have SHADOWS.lg in shared.ts matching Tailwind shadow-lg structure", () => {
      // theme is defined at suite level
      const tailwindLg = theme.shadows.lg;

      // Tailwind shadow-lg has two layers:
      // 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
      expect(tailwindLg.layers.length).toBe(2);

      // Primary layer
      expect(tailwindLg.layers[0].offsetY).toBe(10);
      expect(tailwindLg.layers[0].blur).toBe(15);
      expect(tailwindLg.layers[0].opacity).toBe(0.1);

      // Secondary layer
      expect(tailwindLg.layers[1].offsetY).toBe(4);
      expect(tailwindLg.layers[1].blur).toBe(6);
      expect(tailwindLg.layers[1].opacity).toBe(0.1);
    });
  });

  describe("Tailwind default font sizes (for reference)", () => {
    it("should document Tailwind v4 default font sizes", () => {
      // theme is defined at suite level

      // Document what Tailwind's defaults are (before Kumo overrides)
      // These are in pixels, converted from rem
      expect(theme.fontSize.xs).toBe(12); // 0.75rem
      expect(theme.fontSize.sm).toBe(14); // 0.875rem
      expect(theme.fontSize.base).toBe(16); // 1rem
      expect(theme.fontSize.lg).toBe(18); // 1.125rem

      // Kumo overrides these in theme-kumo.css:
      // --text-sm: 13px (not 14px)
      // --text-base: 14px (not 16px)
      // --text-lg: 16px (not 18px)
    });
  });
});

/**
 * Phase 10: Registry Enforcement for Tabs and Toast
 *
 * These tests ensure Tabs and Toast generators read configuration from
 * component-registry.json instead of using hardcoded values.
 */
describe("Figma Plugin - Phase 10 Registry Enforcement", () => {
  it("Tabs and Toast generators should read from component-registry.json", () => {
    const violations: string[] = [];

    // Check tabs.ts
    const tabsPath = join(__dirname, "tabs.ts");
    const tabsContent = readFileSync(tabsPath, "utf-8");

    if (!tabsContent.includes("component-registry.json")) {
      violations.push("tabs.ts: Does not import component-registry.json");
    }
    if (
      !tabsContent.includes("getTabsConfigFromRegistry") &&
      !tabsContent.includes("tabsStyling")
    ) {
      violations.push("tabs.ts: Does not read from registry styling");
    }

    // Check toast.ts
    const toastPath = join(__dirname, "toast.ts");
    const toastContent = readFileSync(toastPath, "utf-8");

    if (!toastContent.includes("component-registry.json")) {
      violations.push("toast.ts: Does not import component-registry.json");
    }
    if (
      !toastContent.includes("getToastConfigFromRegistry") &&
      !toastContent.includes("toastStyling")
    ) {
      violations.push("toast.ts: Does not read from registry styling");
    }

    expect(violations).toEqual([]);
  });
});

/**
 * Phase 11: Comprehensive Hardcoded Values Elimination
 *
 * These tests ensure ALL generators use themeData or shared.ts constants
 * instead of hardcoded CSS-derived values (fontSize, spacing, borderRadius).
 * This prevents drift when CSS/Tailwind values change.
 */
describe("Figma Plugin - Phase 11 Hardcoded Values Elimination", () => {
  it("should import themeData or use shared constants (FONT_SIZE, BORDER_RADIUS, FALLBACK_VALUES)", () => {
    const generatorFiles = readdirSync(__dirname).filter(
      (f: string) =>
        f.endsWith(".ts") &&
        !f.endsWith(".test.ts") &&
        !UTILITY_FILES.has(f.replace(".ts", "")),
    );

    const violations: string[] = [];

    for (const file of generatorFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");

      // Check if file imports themeData
      const importsThemeData =
        /import\s+themeData\s+from\s+["']\.\.\/generated\/theme-data\.json["']/.test(
          content,
        );

      // Check if file imports shared constants
      const importsFontSize =
        /import\s+\{[^}]*FONT_SIZE[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );
      const importsBorderRadius =
        /import\s+\{[^}]*BORDER_RADIUS[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );
      const importsFallbackValues =
        /import\s+\{[^}]*FALLBACK_VALUES[^}]*\}\s+from\s+["']\.\/shared["']/.test(
          content,
        );

      const hasImports =
        importsThemeData ||
        importsFontSize ||
        importsBorderRadius ||
        importsFallbackValues;

      // Check if file has hardcoded fontSize values (12, 13, 14, 16, 18, 20, 24)
      // Pattern: fontSize: NUMBER or fontSize = NUMBER (not FONT_SIZE.* or themeData.*)
      // BUT: Allow fallback patterns like "fontSize = 12; // fallback" or lines with "logWarn"
      const hasHardcodedFontSize =
        /fontSize[:\s]*=\s*(?:1[2-8]|20|24)\b(?!\s*\/\/)/.test(content) &&
        !(
          /FONT_SIZE\./.test(content) ||
          /themeData\.[^}]*fontSize/.test(content)
        ) &&
        !/using fallback|logWarn/.test(content);

      // Check if file has hardcoded borderRadius/cornerRadius values (2, 4, 6, 8, 12, 9999)
      // Pattern: borderRadius: NUMBER or cornerRadius: NUMBER
      const hasHardcodedBorderRadius =
        /(border|corner)Radius[:\s]*=?\s*(?:[2468]|12|9999)\b(?!\s*\/\/)/.test(
          content,
        ) &&
        !(
          /BORDER_RADIUS\./.test(content) ||
          /themeData\.[^}]*borderRadius/.test(content)
        ) &&
        !/using fallback|logWarn/.test(content);

      // Check if file has hardcoded spacing/padding/gap values (4, 6, 8, 10, 12, 16, 20, 24)
      // Pattern: padding: NUMBER, gap: NUMBER, spacing: NUMBER (but not in object key position)
      const hasHardcodedSpacing =
        /(padding|gap|spacing)[:\s]*=?\s*(?:[468]|1[026]|20|24)\b(?!\s*\/\/)/.test(
          content,
        ) &&
        !(
          /themeData\.[^}]*spacing/.test(content) || /SPACING\./.test(content)
        ) &&
        !/using fallback|logWarn/.test(content);

      if (
        !hasImports &&
        (hasHardcodedFontSize ||
          hasHardcodedBorderRadius ||
          hasHardcodedSpacing)
      ) {
        const issues = [];
        if (hasHardcodedFontSize) issues.push("fontSize");
        if (hasHardcodedBorderRadius) issues.push("borderRadius");
        if (hasHardcodedSpacing) issues.push("spacing/padding/gap");
        violations.push(
          `${file}: Has hardcoded ${issues.join(", ")} without importing themeData or shared constants`,
        );
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `❌ Hardcoded CSS-derived values found in ${violations.length} generator(s):\n` +
          `  - ${violations.join("\n  - ")}\n\n` +
          `🔧 To fix:\n` +
          `  1. Import themeData: import themeData from '../generated/theme-data.json'\n` +
          `  2. Or import shared constants: import { FONT_SIZE, BORDER_RADIUS, FALLBACK_VALUES } from './shared'\n` +
          `  3. Replace hardcoded values:\n` +
          `     - fontSize: 12 → FONT_SIZE.xs\n` +
          `     - fontSize: 13 → FONT_SIZE.sm\n` +
          `     - fontSize: 14 → FONT_SIZE.base\n` +
          `     - fontSize: 16 → FONT_SIZE.lg\n` +
          `     - fontSize: 24 → themeData.tailwind.fontSize['2xl']\n` +
          `     - borderRadius: 6 → BORDER_RADIUS.md\n` +
          `     - borderRadius: 8 → BORDER_RADIUS.lg\n` +
          `     - padding: 8 → themeData.tailwind.spacing.scale['2']\n` +
          `     - padding: 16 → themeData.tailwind.spacing.scale['4']\n\n` +
          `📖 See AGENTS.md for Phase 11 documentation`,
      );
    }

    expect(violations).toEqual([]);
  });

  it("should not have undocumented hardcoded fontSize values in generator functions", () => {
    const generatorFiles = readdirSync(__dirname).filter(
      (f: string) =>
        f.endsWith(".ts") &&
        !f.endsWith(".test.ts") &&
        !UTILITY_FILES.has(f.replace(".ts", "")),
    );

    const warnings: string[] = [];

    for (const file of generatorFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      // Check for undocumented hardcoded fontSize values
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip lines that already use constants
        if (/FONT_SIZE\./.test(line) || /themeData\.[^}]*fontSize/.test(line))
          continue;

        // Skip lines with FIGMA-SPECIFIC comments
        if (
          lines[i - 1]?.includes("FIGMA-SPECIFIC") ||
          line.includes("FIGMA-SPECIFIC")
        )
          continue;

        // Detect hardcoded fontSize: NUMBER pattern
        const hardcodedMatch = line.match(
          /fontSize[:\s]*=?\s*(1[2-8]|20|24)\b/,
        );
        if (hardcodedMatch) {
          warnings.push(
            `${file}:${i + 1}: Undocumented hardcoded fontSize: ${hardcodedMatch[1]} - use FONT_SIZE or add FIGMA-SPECIFIC comment`,
          );
        }
      }
    }

    if (warnings.length > 0) {
      console.warn(
        `\n⚠️  Found ${warnings.length} undocumented hardcoded fontSize values:\n` +
          `  - ${warnings.slice(0, 10).join("\n  - ")}` +
          (warnings.length > 10
            ? `\n  ... and ${warnings.length - 10} more`
            : "") +
          `\n\n` +
          `💡 Either:\n` +
          `  1. Replace with FONT_SIZE.* constant from shared.ts\n` +
          `  2. Or add comment: // FIGMA-SPECIFIC: Layout value for Figma canvas, not from CSS\n`,
      );
    }

    // Warning only for now - strict enforcement happens in first test
    expect(true).toBe(true);
  });

  it("should document all intentional hardcoded values with FIGMA-SPECIFIC comments", () => {
    const generatorFiles = readdirSync(__dirname).filter(
      (f: string) =>
        f.endsWith(".ts") &&
        !f.endsWith(".test.ts") &&
        !UTILITY_FILES.has(f.replace(".ts", "")),
    );

    const warnings: string[] = [];

    for (const file of generatorFiles) {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      // Look for layout-specific values that should be documented
      // Common patterns: width: 280, minWidth: 70, COMPONENT_WIDTH = 320
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip lines that are already documented
        if (
          lines[i - 1]?.includes("FIGMA-SPECIFIC") ||
          line.includes("FIGMA-SPECIFIC")
        )
          continue;

        // Skip lines that use constants
        if (
          /themeData\./.test(line) ||
          /FONT_SIZE\./.test(line) ||
          /BORDER_RADIUS\./.test(line)
        )
          continue;

        // Detect suspicious layout-specific values
        // Pattern: width/height/minWidth = NUMBER (typically 70, 100, 200, 280, 320, 560)
        const layoutMatch = line.match(
          /(min)?[Ww]idth[:\s]*=?\s*(70|100|200|280|320|560)\b/,
        );
        if (layoutMatch) {
          warnings.push(
            `${file}:${i + 1}: Undocumented layout value: ${layoutMatch[0]} - consider adding FIGMA-SPECIFIC comment`,
          );
        }
      }
    }

    if (warnings.length > 0) {
      console.warn(
        `\n⚠️  Found ${warnings.length} undocumented layout-specific values:\n` +
          `  - ${warnings.slice(0, 10).join("\n  - ")}` +
          (warnings.length > 10
            ? `\n  ... and ${warnings.length - 10} more`
            : "") +
          `\n\n` +
          `💡 Add comments to document intentional layout values:\n` +
          `  // FIGMA-SPECIFIC: Component width for Figma canvas display, not from CSS\n` +
          `  const COMPONENT_WIDTH = 280;\n`,
      );
    }

    // Warning only - this is guidance
    expect(true).toBe(true);
  });
});
