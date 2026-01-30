/**
 * Tests for button.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If button styling changes, these tests
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
  BUTTON_VARIANTS_EXPORT,
  BUTTON_SIZES_EXPORT,
  BUTTON_SHAPES_EXPORT,
  BUTTON_DISABLED_OPTIONS,
  BUTTON_LOADING_OPTIONS,
  BUTTON_STATE_OPTIONS,
  getButtonVariantConfig,
  getButtonSizeConfig,
  getButtonShapeConfig,
  getButtonParsedBaseStyles,
  getButtonParsedVariantStyles,
  getButtonParsedSizeStyles,
  getButtonParsedShapeStyles,
  getCompactSizeMap,
  getStateStylesMap,
  getAllButtonVariantData,
} from "./button";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const buttonComponent = registry.components.Button;
const buttonProps = buttonComponent.props;
const variantProp = buttonProps.variant as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};
const sizeProp = buttonProps.size as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};
const shapeProp = buttonProps.shape as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

describe("Button Generator - Registry Structure", () => {
  /**
   * These tests verify the registry has the required structure
   * for the generator to work. They don't test specific values.
   */

  describe("variant prop", () => {
    it("should have at least one variant defined", () => {
      expect(variantProp.values.length).toBeGreaterThan(0);
    });

    it("should have a default variant that exists in values", () => {
      expect(variantProp.default).toBeDefined();
      expect(variantProp.values).toContain(variantProp.default);
    });

    it("should have classes defined for every variant", () => {
      for (const variant of variantProp.values) {
        expect(variantProp.classes[variant]).toBeDefined();
        expect(typeof variantProp.classes[variant]).toBe("string");
      }
    });

    it("should have descriptions defined for every variant", () => {
      for (const variant of variantProp.values) {
        expect(variantProp.descriptions[variant]).toBeDefined();
        expect(typeof variantProp.descriptions[variant]).toBe("string");
      }
    });
  });

  describe("size prop", () => {
    it("should have at least one size defined", () => {
      expect(sizeProp.values.length).toBeGreaterThan(0);
    });

    it("should have a default size that exists in values", () => {
      expect(sizeProp.default).toBeDefined();
      expect(sizeProp.values).toContain(sizeProp.default);
    });

    it("should have classes defined for every size", () => {
      for (const size of sizeProp.values) {
        expect(sizeProp.classes[size]).toBeDefined();
        expect(typeof sizeProp.classes[size]).toBe("string");
      }
    });

    it("should have descriptions defined for every size", () => {
      for (const size of sizeProp.values) {
        expect(sizeProp.descriptions[size]).toBeDefined();
        expect(typeof sizeProp.descriptions[size]).toBe("string");
      }
    });
  });

  describe("shape prop", () => {
    it("should have at least one shape defined", () => {
      expect(shapeProp.values.length).toBeGreaterThan(0);
    });

    it("should have a default shape that exists in values", () => {
      expect(shapeProp.default).toBeDefined();
      expect(shapeProp.values).toContain(shapeProp.default);
    });

    it("should have descriptions defined for every shape", () => {
      for (const shape of shapeProp.values) {
        expect(shapeProp.descriptions[shape]).toBeDefined();
        expect(typeof shapeProp.descriptions[shape]).toBe("string");
      }
    });
  });
});

describe("Button Generator - Exports Sync", () => {
  /**
   * These tests ensure the generator exports stay in sync with the registry.
   * If someone updates the registry, these catch missing export updates.
   */

  it("should export variants matching registry", () => {
    expect(BUTTON_VARIANTS_EXPORT).toEqual(variantProp.values);
  });

  it("should export sizes matching registry", () => {
    expect(BUTTON_SIZES_EXPORT).toEqual(sizeProp.values);
  });

  it("should export shapes matching registry", () => {
    expect(BUTTON_SHAPES_EXPORT).toEqual(shapeProp.values);
  });

  it("should export boolean options for disabled", () => {
    expect(BUTTON_DISABLED_OPTIONS).toContain(true);
    expect(BUTTON_DISABLED_OPTIONS).toContain(false);
    expect(BUTTON_DISABLED_OPTIONS.length).toBe(2);
  });

  it("should export boolean options for loading", () => {
    expect(BUTTON_LOADING_OPTIONS).toContain(true);
    expect(BUTTON_LOADING_OPTIONS).toContain(false);
    expect(BUTTON_LOADING_OPTIONS.length).toBe(2);
  });

  it("should export state options including default", () => {
    expect(BUTTON_STATE_OPTIONS).toContain("default");
    expect(BUTTON_STATE_OPTIONS.length).toBeGreaterThan(0);
  });
});

describe("Button Generator - Config Functions", () => {
  /**
   * These tests verify the config getter functions return
   * the expected structure from the registry.
   */

  it("getButtonVariantConfig should return registry data", () => {
    const config = getButtonVariantConfig();
    expect(config.values).toEqual(variantProp.values);
    expect(config.classes).toEqual(variantProp.classes);
    expect(config.descriptions).toEqual(variantProp.descriptions);
    expect(config.default).toEqual(variantProp.default);
  });

  it("getButtonSizeConfig should return registry data", () => {
    const config = getButtonSizeConfig();
    expect(config.values).toEqual(sizeProp.values);
    expect(config.classes).toEqual(sizeProp.classes);
    expect(config.descriptions).toEqual(sizeProp.descriptions);
    expect(config.default).toEqual(sizeProp.default);
  });

  it("getButtonShapeConfig should return registry data", () => {
    const config = getButtonShapeConfig();
    expect(config.values).toEqual(shapeProp.values);
    expect(config.classes).toEqual(shapeProp.classes);
    expect(config.descriptions).toEqual(shapeProp.descriptions);
    expect(config.default).toEqual(shapeProp.default);
  });
});

describe("Button Generator - Parser Integration", () => {
  /**
   * These tests verify the parser produces valid Figma-compatible output
   * for all classes defined in the registry. They don't check specific
   * values, just that the parser handles the classes without errors.
   */

  describe("variant classes parsing", () => {
    it("should parse all variant classes without errors", () => {
      for (const variant of variantProp.values) {
        const classes = variantProp.classes[variant];
        expect(() => parseTailwindClasses(classes)).not.toThrow();
      }
    });

    it("should produce objects with valid types for all variants", () => {
      for (const variant of variantProp.values) {
        const classes = variantProp.classes[variant];
        const parsed = parseTailwindClasses(classes);

        // Type checks - these properties should be correct types if present
        if (parsed.fillVariable !== undefined) {
          expect(
            parsed.fillVariable === null ||
              typeof parsed.fillVariable === "string",
          ).toBe(true);
        }
        if (parsed.textVariable !== undefined) {
          expect(
            parsed.textVariable === null ||
              typeof parsed.textVariable === "string",
          ).toBe(true);
        }
        if (parsed.strokeVariable !== undefined) {
          expect(
            parsed.strokeVariable === null ||
              typeof parsed.strokeVariable === "string",
          ).toBe(true);
        }
        if (parsed.isWhiteText !== undefined) {
          expect(typeof parsed.isWhiteText).toBe("boolean");
        }
        if (parsed.hasBorder !== undefined) {
          expect(typeof parsed.hasBorder).toBe("boolean");
        }
      }
    });
  });

  describe("size classes parsing", () => {
    it("should parse all size classes without errors", () => {
      for (const size of sizeProp.values) {
        const classes = sizeProp.classes[size];
        expect(() => parseTailwindClasses(classes)).not.toThrow();
      }
    });

    it("should produce numeric values for layout properties", () => {
      for (const size of sizeProp.values) {
        const classes = sizeProp.classes[size];
        const parsed = parseTailwindClasses(classes);

        // Size classes should produce numeric layout values
        if (parsed.height !== undefined) {
          expect(typeof parsed.height).toBe("number");
          expect(parsed.height).toBeGreaterThan(0);
        }
        if (parsed.paddingX !== undefined) {
          expect(typeof parsed.paddingX).toBe("number");
          expect(parsed.paddingX).toBeGreaterThanOrEqual(0);
        }
        if (parsed.gap !== undefined) {
          expect(typeof parsed.gap).toBe("number");
          expect(parsed.gap).toBeGreaterThanOrEqual(0);
        }
        if (parsed.fontSize !== undefined) {
          expect(typeof parsed.fontSize).toBe("number");
          expect(parsed.fontSize).toBeGreaterThan(0);
        }
        if (parsed.borderRadius !== undefined) {
          expect(typeof parsed.borderRadius).toBe("number");
          expect(parsed.borderRadius).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe("shape classes parsing", () => {
    it("should parse all shape classes without errors", () => {
      for (const shape of shapeProp.values) {
        const classes = shapeProp.classes[shape];
        if (classes) {
          expect(() => parseTailwindClasses(classes)).not.toThrow();
        }
      }
    });
  });
});

describe("Button Generator - Parsed Style Functions", () => {
  /**
   * These tests verify the helper functions produce valid output
   * for all values in the registry.
   */

  it("getButtonParsedBaseStyles should return an object", () => {
    const baseStyles = getButtonParsedBaseStyles();
    expect(typeof baseStyles).toBe("object");
  });

  it("getButtonParsedVariantStyles should work for all variants", () => {
    for (const variant of variantProp.values) {
      const result = getButtonParsedVariantStyles(variant);
      expect(result.variant).toBe(variant);
      expect(result.classes).toBe(variantProp.classes[variant]);
      expect(result.description).toBe(variantProp.descriptions[variant]);
      expect(typeof result.parsed).toBe("object");
    }
  });

  it("getButtonParsedSizeStyles should work for all sizes", () => {
    for (const size of sizeProp.values) {
      const result = getButtonParsedSizeStyles(size);
      expect(result.size).toBe(size);
      expect(result.classes).toBe(sizeProp.classes[size]);
      expect(result.description).toBe(sizeProp.descriptions[size]);
      expect(typeof result.parsed).toBe("object");
    }
  });

  it("getButtonParsedShapeStyles should work for all shapes", () => {
    for (const shape of shapeProp.values) {
      const result = getButtonParsedShapeStyles(shape);
      expect(result.shape).toBe(shape);
      expect(typeof result.parsed).toBe("object");
    }
  });
});

describe("Button Generator - Compact Size Map", () => {
  /**
   * Compact sizes are used for square/circle shapes.
   * The map should have positive numeric values for all sizes.
   */

  it("should return an object with all sizes", () => {
    const compactSizeMap = getCompactSizeMap();
    for (const size of sizeProp.values) {
      expect(compactSizeMap[size]).toBeDefined();
    }
  });

  it("should have positive numeric values for all sizes", () => {
    const compactSizeMap = getCompactSizeMap();
    for (const size of sizeProp.values) {
      expect(typeof compactSizeMap[size]).toBe("number");
      expect(compactSizeMap[size]).toBeGreaterThan(0);
    }
  });
});

describe("Button Generator - State Styles Map", () => {
  /**
   * State styles define hover/focus/pressed appearances.
   * The map should have entries for all variants.
   */

  it("should have state styles for all variants", () => {
    const stateStyles = getStateStylesMap();
    for (const variant of variantProp.values) {
      expect(stateStyles[variant]).toBeDefined();
    }
  });

  it("should have standard states for each variant", () => {
    const stateStyles = getStateStylesMap();
    const expectedStates = ["hover", "focus", "pressed"];

    for (const variant of variantProp.values) {
      for (const state of expectedStates) {
        expect(stateStyles[variant][state]).toBeDefined();
      }
    }
  });

  it("should have focus state with addRing for accessibility", () => {
    const stateStyles = getStateStylesMap();
    for (const variant of variantProp.values) {
      expect(stateStyles[variant].focus.addRing).toBe(true);
    }
  });
});

describe("Button Generator - getAllButtonVariantData", () => {
  /**
   * This function aggregates all data needed for Figma generation.
   * It should return a complete structure with all variants.
   */

  it("should return complete data structure", () => {
    const data = getAllButtonVariantData();

    expect(data.baseStyles).toBeDefined();
    expect(data.baseStyles.raw).toBeDefined();
    expect(data.baseStyles.parsed).toBeDefined();

    expect(data.variants).toBeDefined();
    expect(data.variants.length).toBe(variantProp.values.length);

    expect(data.sizes).toBeDefined();
    expect(data.sizes.length).toBe(sizeProp.values.length);

    expect(data.shapes).toBeDefined();
    expect(data.shapes.length).toBe(shapeProp.values.length);

    expect(data.compactSizeMap).toBeDefined();
    expect(data.stateStyles).toBeDefined();
  });

  it("should have complete data for each variant", () => {
    const data = getAllButtonVariantData();

    for (const variant of data.variants) {
      expect(variant.variant).toBeDefined();
      expect(variant.classes).toBeDefined();
      expect(variant.description).toBeDefined();
      expect(variant.parsed).toBeDefined();
      expect(variant.stateStyles).toBeDefined();
    }
  });

  it("should have complete data for each size", () => {
    const data = getAllButtonVariantData();

    for (const size of data.sizes) {
      expect(size.size).toBeDefined();
      expect(size.classes).toBeDefined();
      expect(size.description).toBeDefined();
      expect(size.parsed).toBeDefined();
      expect(size.compactSize).toBeDefined();
      expect(typeof size.compactSize).toBe("number");
    }
  });

  it("should have complete data for each shape", () => {
    const data = getAllButtonVariantData();

    for (const shape of data.shapes) {
      expect(shape.shape).toBeDefined();
      expect(shape.parsed).toBeDefined();
    }
  });
});
