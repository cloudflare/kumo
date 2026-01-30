/**
 * Tests for input.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If input styling changes, these tests
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
  INPUT_SIZE_VALUES,
  INPUT_VARIANT_VALUES,
  INPUT_STATE_VALUES,
  getBaseStyles,
  getSizeConfig,
  getAllVariantData,
} from "./input";
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

const inputComponent = registry.components.Input as any;
const inputProps = inputComponent.props;
const inputStyling = inputComponent.styling;

const sizeProp = inputProps.size as SizeProp;
const variantProp = inputProps.variant as VariantProp;

describe("Input Generator - Registry Structure", () => {
  describe("size prop", () => {
    it("should have valid size prop structure", () => {
      expectValidRegistryProp(sizeProp, "size");
    });

    it("should have a default size that exists in values", () => {
      expect(sizeProp.default).toBeDefined();
      expect(sizeProp.values).toContain(sizeProp.default);
    });
  });

  describe("variant prop", () => {
    it("should have valid variant prop structure", () => {
      expectValidRegistryProp(variantProp, "variant");
    });

    it("should have a default variant that exists in values", () => {
      expect(variantProp.default).toBeDefined();
      expect(variantProp.values).toContain(variantProp.default);
    });
  });

  describe("styling metadata", () => {
    it("should have styling metadata defined", () => {
      expect(inputStyling).toBeDefined();
    });

    it("should have dimensions defined", () => {
      expect(inputStyling.dimensions).toBeDefined();
      expect(typeof inputStyling.dimensions).toBe("object");
    });

    it("should have dimensions for each size value", () => {
      for (const size of sizeProp.values) {
        expect(
          inputStyling.dimensions[size],
          `dimensions[${size}] should be defined`,
        ).toBeDefined();
      }
    });

    it("should have numeric dimensions for each size", () => {
      for (const size of sizeProp.values) {
        const sizeDimensions = inputStyling.dimensions[size];
        expect(typeof sizeDimensions.height).toBe("number");
        expect(typeof sizeDimensions.paddingX).toBe("number");
        expect(typeof sizeDimensions.fontSize).toBe("number");
        expect(typeof sizeDimensions.borderRadius).toBe("number");
      }
    });

    it("should have baseTokens defined as an object", () => {
      expect(inputStyling.baseTokens).toBeDefined();
      expect(typeof inputStyling.baseTokens).toBe("object");
    });

    it("should have stateTokens defined", () => {
      expect(inputStyling.stateTokens).toBeDefined();
      expect(typeof inputStyling.stateTokens).toBe("object");
    });
  });
});

describe("Input Generator - Exports Sync", () => {
  it("should export size values matching registry", () => {
    expect(INPUT_SIZE_VALUES).toEqual(sizeProp.values);
  });

  it("should export variant values matching registry", () => {
    expect(INPUT_VARIANT_VALUES).toEqual(variantProp.values);
  });

  it("should export state values array", () => {
    expect(Array.isArray(INPUT_STATE_VALUES)).toBe(true);
    expect(INPUT_STATE_VALUES.length).toBeGreaterThan(0);
  });
});

describe("Input Generator - Parser Integration", () => {
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

    it("should produce positive layout values for all sizes", () => {
      for (const size of sizeProp.values) {
        const classes = sizeProp.classes[size];
        const parsed = parseTailwindClasses(classes);
        expectPositiveLayoutValues(parsed);
      }
    });

    it("should parse layout properties from size classes", () => {
      for (const size of sizeProp.values) {
        const classes = sizeProp.classes[size];
        const parsed = parseTailwindClasses(classes);
        // Size classes should define at least one layout property
        expect(
          parsed.height !== undefined ||
            parsed.paddingX !== undefined ||
            parsed.fontSize !== undefined ||
            parsed.borderRadius !== undefined,
        ).toBe(true);
      }
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
  });
});

describe("Input Generator - getBaseStyles", () => {
  it("should return valid structure", () => {
    const styles = getBaseStyles();
    expect(styles).toBeDefined();
    expect(styles.raw).toBeDefined();
    expect(styles.parsed).toBeDefined();
    expect(styles.styling).toBeDefined();
  });

  it("should return parsed object with expected property types", () => {
    const styles = getBaseStyles();

    // Each property should be string or null
    const {
      backgroundVariable,
      textVariable,
      placeholderVariable,
      ringVariable,
    } = styles.parsed;

    if (backgroundVariable !== null) {
      expect(typeof backgroundVariable).toBe("string");
    }
    if (textVariable !== null) {
      expect(typeof textVariable).toBe("string");
    }
    if (placeholderVariable !== null) {
      expect(typeof placeholderVariable).toBe("string");
    }
    if (ringVariable !== null) {
      expect(typeof ringVariable).toBe("string");
    }
  });

  it("should include styling metadata", () => {
    const styles = getBaseStyles();
    expect(styles.styling.dimensions).toBeDefined();
    expect(styles.styling.baseTokens).toBeDefined();
  });
});

describe("Input Generator - getSizeConfig", () => {
  it("should return config for all registry sizes", () => {
    for (const size of sizeProp.values) {
      const config = getSizeConfig(size);
      expect(config.size).toBe(size);
    }
  });

  it("should return numeric dimensions matching registry", () => {
    for (const size of sizeProp.values) {
      const config = getSizeConfig(size);
      const registryValues = inputStyling.dimensions[size];

      expect(config.height).toBe(registryValues.height);
      expect(config.dimensions.paddingX).toBe(registryValues.paddingX);
      expect(config.dimensions.fontSize).toBe(registryValues.fontSize);
      expect(config.dimensions.borderRadius).toBe(registryValues.borderRadius);
    }
  });

  it("should return positive numeric values", () => {
    for (const size of sizeProp.values) {
      const config = getSizeConfig(size);
      expect(config.height).toBeGreaterThan(0);
      expect(config.dimensions.paddingX).toBeGreaterThanOrEqual(0);
      expect(config.dimensions.fontSize).toBeGreaterThan(0);
      expect(config.dimensions.borderRadius).toBeGreaterThanOrEqual(0);
    }
  });

  it("should throw error for unknown size", () => {
    expect(() => getSizeConfig("unknown")).toThrow();
  });
});

describe("Input Generator - getAllVariantData", () => {
  it("should return complete data structure", () => {
    const allData = getAllVariantData();

    expect(allData.baseStyles).toBeDefined();
    expect(allData.sizes).toBeDefined();
    expect(allData.variants).toBeDefined();
    expect(allData.stateTokens).toBeDefined();
  });

  it("should have sizes matching registry count", () => {
    const allData = getAllVariantData();
    expect(allData.sizes.length).toBe(sizeProp.values.length);
  });

  it("should have variants matching registry count", () => {
    const allData = getAllVariantData();
    expect(allData.variants.length).toBe(variantProp.values.length);
  });

  it("should have complete data for each size", () => {
    const allData = getAllVariantData();

    for (const size of allData.sizes) {
      expect(size.size).toBeDefined();
      expect(sizeProp.values).toContain(size.size);
      expect(size.classes).toBeDefined();
      expect(size.description).toBeDefined();
      expect(size.dimensions).toBeDefined();
      expect(size.parsed).toBeDefined();

      // Dimensions should have numeric values (nested structure from getSizeConfig)
      expect(typeof size.dimensions.height).toBe("number");
      expect(typeof size.dimensions.dimensions.paddingX).toBe("number");
      expect(typeof size.dimensions.dimensions.fontSize).toBe("number");
      expect(typeof size.dimensions.dimensions.borderRadius).toBe("number");
    }
  });

  it("should have complete data for each variant", () => {
    const allData = getAllVariantData();

    for (const variant of allData.variants) {
      expect(variant.variant).toBeDefined();
      expect(variantProp.values).toContain(variant.variant);
      expect(variant.classes).toBeDefined();
      expect(variant.description).toBeDefined();
      expect(variant.parsed).toBeDefined();
    }
  });

  it("should have valid parsed types for all sizes", () => {
    const allData = getAllVariantData();

    for (const size of allData.sizes) {
      expectValidParsedTypes(size.parsed);
    }
  });

  it("should have valid parsed types for all variants", () => {
    const allData = getAllVariantData();

    for (const variant of allData.variants) {
      expectValidParsedTypes(variant.parsed);
    }
  });
});

describe("Input Generator - Color Token Parsing", () => {
  /**
   * Test that color-related properties are correctly parsed.
   * This tests parser behavior, not specific colors used in inputs.
   */

  it("should parse fill variable from bg-* classes", () => {
    const parsed = parseTailwindClasses("bg-kumo-control");
    expect(parsed.fillVariable).toBeDefined();
    expect(typeof parsed.fillVariable).toBe("string");
  });

  it("should parse text variable from text-* classes", () => {
    const parsed = parseTailwindClasses("text-kumo-default");
    expect(parsed.textVariable).toBeDefined();
    expect(typeof parsed.textVariable).toBe("string");
  });

  it("should parse stroke variable from ring-* classes", () => {
    const parsed = parseTailwindClasses("ring ring-kumo-line");
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeVariable).toBeDefined();
    expect(typeof parsed.strokeVariable).toBe("string");
  });
});

describe("Input Generator - Border Parsing", () => {
  /**
   * Test that border-related properties are correctly parsed.
   * This is behavioral - we test the parser handles borders correctly.
   */

  it("should parse ring as border", () => {
    const parsed = parseTailwindClasses("ring");
    expect(parsed.hasBorder).toBe(true);
  });

  it("should not set strokeWeight from ring alone (ring has no width)", () => {
    // ring class doesn't specify width - only hasBorder
    // strokeWeight is only set for border classes like "border" or "border-2"
    const parsed = parseTailwindClasses("ring");
    expect(parsed.strokeWeight).toBeUndefined();
  });

  it("should parse strokeWeight from border classes", () => {
    const parsed = parseTailwindClasses("border");
    expect(parsed.strokeWeight).toBeDefined();
    expect(typeof parsed.strokeWeight).toBe("number");
    expect(parsed.strokeWeight).toBe(1);
  });
});
