/**
 * Tests for text.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If text styling changes, these tests
 * should NOT break - only the Figma output changes.
 *
 * Test philosophy:
 * - Test that the generator correctly reads from the registry
 * - Test that the parser produces valid Figma-compatible output
 * - Test structural invariants, not specific values
 * - DO NOT test specific colors, sizes, or variant names
 */

import { describe, it, expect } from "vitest";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import {
  TEXT_VARIANTS_EXPORT,
  TEXT_SIZES_EXPORT,
  getBaseStyles,
  getVariantConfig,
  getAllVariantData,
} from "./text";
import {
  expectValidRegistryProp,
  expectAllClassesParsable,
  expectValidParsedTypes,
  expectPositiveLayoutValues,
  type VariantProp,
  type SizeProp,
} from "./_test-utils";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const textComponent = registry.components.Text;
const textProps = textComponent.props;
const variantProp = textProps.variant as VariantProp;
const sizeProp = textProps.size as SizeProp;

/**
 * Base text class applied to all Text components
 */
const TEXT_BASE_CLASS = "text-kumo-default";

describe("Text Generator - Registry Structure", () => {
  /**
   * These tests verify the registry has the required structure
   * for the generator to work. They don't test specific values.
   */

  describe("variant prop", () => {
    it("should have valid variant prop structure", () => {
      expectValidRegistryProp(variantProp, "variant");
    });

    it("should have a default variant that exists in values", () => {
      expect(variantProp.default).toBeDefined();
      expect(variantProp.values).toContain(variantProp.default);
    });
  });

  describe("size prop", () => {
    it("should have valid size prop structure", () => {
      expectValidRegistryProp(sizeProp, "size");
    });

    it("should have a default size that exists in values", () => {
      expect(sizeProp.default).toBeDefined();
      expect(sizeProp.values).toContain(sizeProp.default);
    });
  });
});

describe("Text Generator - Exports Sync", () => {
  /**
   * These tests ensure the generator exports stay in sync with the registry.
   * If someone updates the registry, these catch missing export updates.
   */

  it("should export variants matching registry", () => {
    expect(TEXT_VARIANTS_EXPORT).toEqual(variantProp.values);
  });

  it("should export sizes matching registry", () => {
    expect(TEXT_SIZES_EXPORT).toEqual(sizeProp.values);
  });
});

describe("Text Generator - Config Functions", () => {
  /**
   * These tests verify the config getter functions return
   * the expected structure from the registry.
   */

  it("getVariantConfig should return variant registry data", () => {
    const config = getVariantConfig();
    expect(config.variants).toEqual(variantProp.values);
    expect(config.variantClasses).toEqual(variantProp.classes);
    expect(config.variantDescriptions).toEqual(variantProp.descriptions);
    expect(config.defaultVariant).toEqual(variantProp.default);
  });

  it("getVariantConfig should return size registry data", () => {
    const config = getVariantConfig();
    expect(config.sizes).toEqual(sizeProp.values);
    expect(config.sizeClasses).toEqual(sizeProp.classes);
    expect(config.sizeDescriptions).toEqual(sizeProp.descriptions);
    expect(config.defaultSize).toEqual(sizeProp.default);
  });
});

describe("Text Generator - Parser Integration", () => {
  /**
   * These tests verify the parser produces valid Figma-compatible output
   * for all classes defined in the registry. They don't check specific
   * values, just that the parser handles the classes without errors.
   */

  describe("base styles parsing", () => {
    it("should parse base styles without errors", () => {
      expect(() => parseTailwindClasses(TEXT_BASE_CLASS)).not.toThrow();
    });

    it("should produce valid types from base styles", () => {
      const parsed = parseTailwindClasses(TEXT_BASE_CLASS);
      expectValidParsedTypes(parsed);
    });

    it("should parse text color from base styles", () => {
      const parsed = parseTailwindClasses(TEXT_BASE_CLASS);
      expect(parsed.textVariable).toBeDefined();
      expect(typeof parsed.textVariable).toBe("string");
    });
  });

  describe("variant classes parsing", () => {
    it("should parse all variant classes without errors", () => {
      expectAllClassesParsable(variantProp, "variant");
    });

    it("should produce valid types for all variants", () => {
      for (const variant of variantProp.values) {
        const classes = variantProp.classes[variant];
        const parsed = parseTailwindClasses(classes);
        expectValidParsedTypes(parsed);
      }
    });

    it("should produce positive layout values for all variants", () => {
      for (const variant of variantProp.values) {
        const classes = variantProp.classes[variant];
        const parsed = parseTailwindClasses(classes);
        expectPositiveLayoutValues(parsed);
      }
    });
  });

  describe("size classes parsing", () => {
    it("should parse all size classes without errors", () => {
      expectAllClassesParsable(sizeProp, "size");
    });

    it("should produce valid types for all sizes", () => {
      for (const size of sizeProp.values) {
        const classes = sizeProp.classes[size];
        const parsed = parseTailwindClasses(classes);
        expectValidParsedTypes(parsed);
      }
    });

    it("should produce numeric fontSize for all sizes", () => {
      for (const size of sizeProp.values) {
        const classes = sizeProp.classes[size];
        const parsed = parseTailwindClasses(classes);
        expect(parsed.fontSize).toBeDefined();
        expect(typeof parsed.fontSize).toBe("number");
        expect(parsed.fontSize).toBeGreaterThan(0);
      }
    });
  });
});

describe("Text Generator - Parsed Style Functions", () => {
  /**
   * These tests verify the helper functions produce valid output
   * for all values in the registry.
   */

  it("getBaseStyles should return valid parsed result", () => {
    const baseStyles = getBaseStyles();
    expect(baseStyles).toBeDefined();
    expect(baseStyles.raw).toBeDefined();
    expect(typeof baseStyles.raw).toBe("string");
    expect(baseStyles.parsed).toBeDefined();
    expectValidParsedTypes(baseStyles.parsed);
  });

  it("getBaseStyles should parse text color variable", () => {
    const baseStyles = getBaseStyles();
    expect(baseStyles.parsed.textVariable).toBeDefined();
    expect(typeof baseStyles.parsed.textVariable).toBe("string");
  });
});

describe("Text Generator - getAllVariantData", () => {
  /**
   * This function aggregates all data needed for Figma generation.
   * It should return a complete structure with all variants.
   */

  it("should return complete data structure", () => {
    const data = getAllVariantData();

    expect(data.baseStyles).toBeDefined();
    expect(data.baseStyles.raw).toBeDefined();
    expect(data.baseStyles.parsed).toBeDefined();

    expect(data.variantConfig).toBeDefined();
    expect(data.variantConfig.variants.length).toBeGreaterThan(0);
    expect(data.variantConfig.sizes.length).toBeGreaterThan(0);

    expect(data.variants).toBeDefined();
    expect(data.variants.length).toBeGreaterThan(0);
  });

  it("should have complete data for each variant combination", () => {
    const data = getAllVariantData();

    for (const variant of data.variants) {
      expect(variant.variant).toBeDefined();
      expect(data.variantConfig.variants).toContain(variant.variant);
      expect(variant.variantClasses).toBeDefined();
      expect(variant.combinedClasses).toBeDefined();
      expect(variant.parsed).toBeDefined();
      expect(variant.description).toBeDefined();
      expect(typeof variant.isCopyVariant).toBe("boolean");
      expect(typeof variant.isMonoVariant).toBe("boolean");
    }
  });

  it("should produce valid parsed types for all variant combinations", () => {
    const data = getAllVariantData();

    for (const variant of data.variants) {
      expectValidParsedTypes(variant.parsed);
    }
  });

  it("should produce positive layout values for all variant combinations", () => {
    const data = getAllVariantData();

    for (const variant of data.variants) {
      expectPositiveLayoutValues(variant.parsed);
    }
  });

  it("should have size=null for non-copy, non-mono variants (headings)", () => {
    const data = getAllVariantData();
    const headingVariants = data.variants.filter(
      (v) => !v.isCopyVariant && !v.isMonoVariant,
    );

    // Should have at least some heading variants
    expect(headingVariants.length).toBeGreaterThan(0);

    for (const variant of headingVariants) {
      expect(variant.size).toBeNull();
    }
  });

  it("should have size values for copy variants", () => {
    const data = getAllVariantData();
    const copyVariants = data.variants.filter((v) => v.isCopyVariant);

    // Should have copy variants
    expect(copyVariants.length).toBeGreaterThan(0);

    for (const variant of copyVariants) {
      expect(variant.size).not.toBeNull();
      expect(typeof variant.size).toBe("string");
    }
  });

  it("should have mono variants with appropriate size handling", () => {
    const data = getAllVariantData();
    const monoVariants = data.variants.filter((v) => v.isMonoVariant);

    // Should have mono variants
    expect(monoVariants.length).toBeGreaterThan(0);

    // Each mono variant base should have at least one null size (default)
    // and optionally other sizes
    const monoWithNullSize = monoVariants.filter((v) => v.size === null);
    expect(monoWithNullSize.length).toBeGreaterThan(0);
  });
});

describe("Text Generator - Color Token Parsing", () => {
  /**
   * Test that color-related properties are correctly parsed.
   * This tests parser behavior, not specific colors used in text.
   */

  it("should parse text variable from text-* classes", () => {
    const parsed = parseTailwindClasses("text-kumo-default");
    expect(parsed.textVariable).toBeDefined();
    expect(typeof parsed.textVariable).toBe("string");
  });

  it("should parse text variables for semantic color tokens", () => {
    // Test that the parser handles various semantic text colors
    const semanticColors = [
      "text-kumo-subtle",
      "text-kumo-link",
      "text-kumo-danger",
    ];
    for (const colorClass of semanticColors) {
      const parsed = parseTailwindClasses(colorClass);
      expect(parsed.textVariable).toBeDefined();
      expect(typeof parsed.textVariable).toBe("string");
    }
  });
});

describe("Text Generator - Typography Parsing", () => {
  /**
   * Test that typography-related properties are correctly parsed.
   * This tests parser behavior for font sizes and weights.
   */

  it("should parse fontSize from text-* size classes", () => {
    const sizeClasses = ["text-xs", "text-sm", "text-base", "text-lg"];
    for (const sizeClass of sizeClasses) {
      const parsed = parseTailwindClasses(sizeClass);
      expect(parsed.fontSize).toBeDefined();
      expect(typeof parsed.fontSize).toBe("number");
      expect(parsed.fontSize).toBeGreaterThan(0);
    }
  });

  it("should parse fontWeight from font-* weight classes", () => {
    const weightClasses = ["font-medium", "font-semibold"];
    for (const weightClass of weightClasses) {
      const parsed = parseTailwindClasses(weightClass);
      expect(parsed.fontWeight).toBeDefined();
      expect(typeof parsed.fontWeight).toBe("number");
      expect(parsed.fontWeight).toBeGreaterThan(0);
    }
  });
});
