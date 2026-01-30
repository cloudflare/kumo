/**
 * Tests for select.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If select styling changes, these tests
 * should NOT break - only the Figma output changes.
 *
 * Test philosophy:
 * - Test that the generator correctly reads from the registry
 * - Test that the parser produces valid Figma-compatible output
 * - Test structural invariants, not specific values
 * - DO NOT test specific colors, sizes, or variant names
 */

import { describe, it, expect } from "vitest";
import {
  getTriggerConfig,
  getPopupConfig,
  getOptionConfig,
  getAllVariantData,
  SELECT_VARIANT_VALUES,
  SELECT_OPEN_VALUES,
  SELECT_STATE_VALUES,
} from "./select";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const selectStyling = (registry.components.Select as any).styling;

describe("Select Generator - Registry Structure", () => {
  /**
   * These tests verify the registry has the required structure
   * for the generator to work. They don't test specific values.
   */

  it("should have Select component in registry", () => {
    expect(registry.components.Select).toBeDefined();
  });

  it("should have styling metadata defined", () => {
    expect(selectStyling).toBeDefined();
  });

  describe("trigger styling", () => {
    it("should have trigger styling defined", () => {
      expect(selectStyling.trigger).toBeDefined();
    });

    it("should have required numeric properties", () => {
      if (selectStyling.trigger.height !== undefined) {
        expect(typeof selectStyling.trigger.height).toBe("number");
        expect(selectStyling.trigger.height).toBeGreaterThan(0);
      }
      if (selectStyling.trigger.paddingX !== undefined) {
        expect(typeof selectStyling.trigger.paddingX).toBe("number");
        expect(selectStyling.trigger.paddingX).toBeGreaterThanOrEqual(0);
      }
      if (selectStyling.trigger.borderRadius !== undefined) {
        expect(typeof selectStyling.trigger.borderRadius).toBe("number");
        expect(selectStyling.trigger.borderRadius).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("popup styling", () => {
    it("should have popup styling defined", () => {
      expect(selectStyling.popup).toBeDefined();
    });

    it("should have required numeric properties", () => {
      if (selectStyling.popup.borderRadius !== undefined) {
        expect(typeof selectStyling.popup.borderRadius).toBe("number");
        expect(selectStyling.popup.borderRadius).toBeGreaterThanOrEqual(0);
      }
      if (selectStyling.popup.padding !== undefined) {
        expect(typeof selectStyling.popup.padding).toBe("number");
        expect(selectStyling.popup.padding).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("option styling", () => {
    it("should have option styling defined", () => {
      expect(selectStyling.option).toBeDefined();
    });

    it("should have required numeric properties", () => {
      if (selectStyling.option.paddingX !== undefined) {
        expect(typeof selectStyling.option.paddingX).toBe("number");
        expect(selectStyling.option.paddingX).toBeGreaterThanOrEqual(0);
      }
      if (selectStyling.option.paddingY !== undefined) {
        expect(typeof selectStyling.option.paddingY).toBe("number");
        expect(selectStyling.option.paddingY).toBeGreaterThanOrEqual(0);
      }
      if (selectStyling.option.borderRadius !== undefined) {
        expect(typeof selectStyling.option.borderRadius).toBe("number");
        expect(selectStyling.option.borderRadius).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

describe("Select Generator - Exports Sync", () => {
  /**
   * These tests ensure the generator exports are valid arrays.
   */

  it("should export variant values as non-empty array", () => {
    expect(Array.isArray(SELECT_VARIANT_VALUES)).toBe(true);
    expect(SELECT_VARIANT_VALUES.length).toBeGreaterThan(0);
  });

  it("should export open values as array with boolean values", () => {
    expect(Array.isArray(SELECT_OPEN_VALUES)).toBe(true);
    expect(SELECT_OPEN_VALUES.length).toBeGreaterThan(0);
    for (const open of SELECT_OPEN_VALUES) {
      expect(typeof open).toBe("boolean");
    }
  });

  it("should export state values as non-empty array", () => {
    expect(Array.isArray(SELECT_STATE_VALUES)).toBe(true);
    expect(SELECT_STATE_VALUES.length).toBeGreaterThan(0);
  });
});

describe("Select Generator - Config Functions", () => {
  /**
   * These tests verify the config getter functions return
   * valid structures with correct types.
   */

  describe("getTriggerConfig", () => {
    it("should return trigger config with all required properties", () => {
      const config = getTriggerConfig();

      expect(config).toHaveProperty("height");
      expect(config).toHaveProperty("paddingX");
      expect(config).toHaveProperty("paddingY");
      expect(config).toHaveProperty("borderRadius");
      expect(config).toHaveProperty("fontSize");
      expect(config).toHaveProperty("fontWeight");
      expect(config).toHaveProperty("background");
      expect(config).toHaveProperty("text");
      expect(config).toHaveProperty("ring");
    });

    it("should have valid numeric types for dimensions", () => {
      const config = getTriggerConfig();

      expect(typeof config.height).toBe("number");
      expect(config.height).toBeGreaterThan(0);

      expect(typeof config.paddingX).toBe("number");
      expect(config.paddingX).toBeGreaterThanOrEqual(0);

      expect(typeof config.paddingY).toBe("number");
      expect(config.paddingY).toBeGreaterThanOrEqual(0);

      expect(typeof config.borderRadius).toBe("number");
      expect(config.borderRadius).toBeGreaterThanOrEqual(0);
    });

    it("should have valid numeric types for typography", () => {
      const config = getTriggerConfig();

      expect(typeof config.fontSize).toBe("number");
      expect(config.fontSize).toBeGreaterThan(0);

      expect(typeof config.fontWeight).toBe("number");
      expect(config.fontWeight).toBeGreaterThan(0);
    });

    it("should have valid string types for color tokens", () => {
      const config = getTriggerConfig();

      expect(typeof config.background).toBe("string");
      expect(config.background.length).toBeGreaterThan(0);

      expect(typeof config.text).toBe("string");
      expect(config.text.length).toBeGreaterThan(0);

      expect(typeof config.ring).toBe("string");
      expect(config.ring.length).toBeGreaterThan(0);
    });
  });

  describe("getPopupConfig", () => {
    it("should return popup config with all required properties", () => {
      const config = getPopupConfig();

      expect(config).toHaveProperty("background");
      expect(config).toHaveProperty("ring");
      expect(config).toHaveProperty("borderRadius");
      expect(config).toHaveProperty("padding");
      expect(config).toHaveProperty("width");
    });

    it("should have valid numeric types for dimensions", () => {
      const config = getPopupConfig();

      expect(typeof config.width).toBe("number");
      expect(config.width).toBeGreaterThan(0);

      expect(typeof config.padding).toBe("number");
      expect(config.padding).toBeGreaterThanOrEqual(0);

      expect(typeof config.borderRadius).toBe("number");
      expect(config.borderRadius).toBeGreaterThanOrEqual(0);
    });

    it("should have valid string types for color tokens", () => {
      const config = getPopupConfig();

      expect(typeof config.background).toBe("string");
      expect(config.background.length).toBeGreaterThan(0);

      expect(typeof config.ring).toBe("string");
      expect(config.ring.length).toBeGreaterThan(0);
    });
  });

  describe("getOptionConfig", () => {
    it("should return option config with all required properties", () => {
      const config = getOptionConfig();

      expect(config).toHaveProperty("paddingX");
      expect(config).toHaveProperty("paddingY");
      expect(config).toHaveProperty("borderRadius");
      expect(config).toHaveProperty("fontSize");
      expect(config).toHaveProperty("fontWeight");
      expect(config).toHaveProperty("text");
      expect(config).toHaveProperty("highlightBackground");
    });

    it("should have valid numeric types for dimensions", () => {
      const config = getOptionConfig();

      expect(typeof config.paddingX).toBe("number");
      expect(config.paddingX).toBeGreaterThanOrEqual(0);

      expect(typeof config.paddingY).toBe("number");
      expect(config.paddingY).toBeGreaterThanOrEqual(0);

      expect(typeof config.borderRadius).toBe("number");
      expect(config.borderRadius).toBeGreaterThanOrEqual(0);
    });

    it("should have valid numeric types for typography", () => {
      const config = getOptionConfig();

      expect(typeof config.fontSize).toBe("number");
      expect(config.fontSize).toBeGreaterThan(0);

      expect(typeof config.fontWeight).toBe("number");
      expect(config.fontWeight).toBeGreaterThanOrEqual(0);
    });

    it("should have valid string types for color tokens", () => {
      const config = getOptionConfig();

      expect(typeof config.text).toBe("string");
      expect(config.text.length).toBeGreaterThan(0);

      expect(typeof config.highlightBackground).toBe("string");
      expect(config.highlightBackground.length).toBeGreaterThan(0);
    });
  });
});

describe("Select Generator - getAllVariantData", () => {
  /**
   * This function aggregates all data needed for Figma generation.
   * It should return a complete structure with all variant combinations.
   */

  it("should return complete data structure", () => {
    const allData = getAllVariantData();

    expect(allData).toBeDefined();
    expect(allData.triggerConfig).toBeDefined();
    expect(allData.popupConfig).toBeDefined();
    expect(allData.optionConfig).toBeDefined();
    expect(allData.variants).toBeDefined();
    expect(allData.variantCount).toBeDefined();
  });

  it("should have variants as non-empty array", () => {
    const allData = getAllVariantData();
    expect(Array.isArray(allData.variants)).toBe(true);
    expect(allData.variants.length).toBeGreaterThan(0);
  });

  it("should have variantCount matching variants array length", () => {
    const allData = getAllVariantData();
    expect(allData.variantCount).toBe(allData.variants.length);
  });

  it("should have correct total variant count based on combinations", () => {
    const allData = getAllVariantData();
    const expectedCount =
      SELECT_VARIANT_VALUES.length *
      SELECT_OPEN_VALUES.length *
      SELECT_STATE_VALUES.length;
    expect(allData.variantCount).toBe(expectedCount);
  });

  it("should have complete data for each variant", () => {
    const allData = getAllVariantData();

    for (const variant of allData.variants) {
      expect(variant).toHaveProperty("variant");
      expect(variant).toHaveProperty("open");
      expect(variant).toHaveProperty("state");
      expect(variant).toHaveProperty("stateStyle");
      expect(variant).toHaveProperty("useErrorRing");

      expect(typeof variant.variant).toBe("string");
      expect(typeof variant.open).toBe("boolean");
      expect(typeof variant.state).toBe("string");
      expect(typeof variant.useErrorRing).toBe("boolean");
    }
  });

  it("should have stateStyle with valid structure for each variant", () => {
    const allData = getAllVariantData();

    for (const variant of allData.variants) {
      expect(variant.stateStyle).toBeDefined();
      expect(typeof variant.stateStyle).toBe("object");

      // ringVariable should be a string if defined
      if (variant.stateStyle.ringVariable !== undefined) {
        expect(typeof variant.stateStyle.ringVariable).toBe("string");
      }

      // opacity should be a number between 0 and 1 if defined
      if (variant.stateStyle.opacity !== undefined) {
        expect(typeof variant.stateStyle.opacity).toBe("number");
        expect(variant.stateStyle.opacity).toBeGreaterThan(0);
        expect(variant.stateStyle.opacity).toBeLessThanOrEqual(1);
      }
    }
  });

  it("should include all variant values in the variants array", () => {
    const allData = getAllVariantData();
    const variantValues = [...new Set(allData.variants.map((v) => v.variant))];

    for (const value of SELECT_VARIANT_VALUES) {
      expect(variantValues).toContain(value);
    }
  });

  it("should include all open values in the variants array", () => {
    const allData = getAllVariantData();
    const openValues = [...new Set(allData.variants.map((v) => v.open))];

    for (const value of SELECT_OPEN_VALUES) {
      expect(openValues).toContain(value);
    }
  });

  it("should include all state values in the variants array", () => {
    const allData = getAllVariantData();
    const stateValues = [...new Set(allData.variants.map((v) => v.state))];

    for (const value of SELECT_STATE_VALUES) {
      expect(stateValues).toContain(value);
    }
  });
});

describe("Select Generator - Variant Structure", () => {
  /**
   * These tests verify structural invariants about variants
   * without testing specific values.
   */

  it("should have equal number of open and closed variants", () => {
    const allData = getAllVariantData();
    const openVariants = allData.variants.filter((v) => v.open === true);
    const closedVariants = allData.variants.filter((v) => v.open === false);

    expect(openVariants.length).toBe(closedVariants.length);
  });

  it("should have all state combinations for each variant type", () => {
    const allData = getAllVariantData();

    for (const variantValue of SELECT_VARIANT_VALUES) {
      const variantsOfType = allData.variants.filter(
        (v) => v.variant === variantValue,
      );

      // Each variant type should have all state combinations
      const statesForVariant = [...new Set(variantsOfType.map((v) => v.state))];
      expect(statesForVariant.length).toBe(SELECT_STATE_VALUES.length);
    }
  });

  it("should have label defined only for variants that need it", () => {
    const allData = getAllVariantData();

    for (const variant of allData.variants) {
      // Label can be string or undefined
      if (variant.label !== undefined) {
        expect(typeof variant.label).toBe("string");
      }
    }
  });

  it("should have errorMessage defined only for error variants", () => {
    const allData = getAllVariantData();

    for (const variant of allData.variants) {
      // If useErrorRing is true, errorMessage should be defined
      if (variant.useErrorRing) {
        expect(variant.errorMessage).toBeDefined();
        expect(typeof variant.errorMessage).toBe("string");
      }
    }
  });
});

describe("Select Generator - Figma Output Structure", () => {
  /**
   * These tests document the expected Figma component properties.
   * They test structural invariants, not specific values.
   */

  it("should produce valid Figma layout properties for trigger", () => {
    const trigger = getTriggerConfig();

    // Verify all properties are valid for Figma
    expect(typeof trigger.height).toBe("number");
    expect(trigger.height).toBeGreaterThan(0);

    expect(typeof trigger.paddingX).toBe("number");
    expect(trigger.paddingX).toBeGreaterThanOrEqual(0);

    expect(typeof trigger.borderRadius).toBe("number");
    expect(trigger.borderRadius).toBeGreaterThanOrEqual(0);

    expect(typeof trigger.fontSize).toBe("number");
    expect(trigger.fontSize).toBeGreaterThan(0);
  });

  it("should produce valid Figma layout properties for popup", () => {
    const popup = getPopupConfig();

    expect(typeof popup.width).toBe("number");
    expect(popup.width).toBeGreaterThan(0);

    expect(typeof popup.padding).toBe("number");
    expect(popup.padding).toBeGreaterThanOrEqual(0);

    expect(typeof popup.borderRadius).toBe("number");
    expect(popup.borderRadius).toBeGreaterThanOrEqual(0);
  });

  it("should produce valid Figma layout properties for option", () => {
    const option = getOptionConfig();

    expect(typeof option.paddingX).toBe("number");
    expect(option.paddingX).toBeGreaterThanOrEqual(0);

    expect(typeof option.paddingY).toBe("number");
    expect(option.paddingY).toBeGreaterThanOrEqual(0);

    expect(typeof option.borderRadius).toBe("number");
    expect(option.borderRadius).toBeGreaterThanOrEqual(0);

    expect(typeof option.fontSize).toBe("number");
    expect(option.fontSize).toBeGreaterThan(0);
  });
});
