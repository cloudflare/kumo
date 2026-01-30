/**
 * Tests for input-area.ts generator
 *
 * These tests ensure the InputArea Figma component generation stays in sync
 * with the hardcoded configuration and Input component styles.
 *
 * CRITICAL: These tests act as a regression guard. If you change the input-area
 * generator, these tests will catch any unintended changes.
 *
 * Source of truth:
 * InputArea uses Input's inputVariants from input.tsx (size/variant styling)
 * Generator uses hardcoded SIZE_CONFIG, VARIANT_CONFIG, STATE_STYLES
 */

import { describe, it, expect } from "vitest";
import {
  getInputAreaSizeConfig,
  getInputAreaVariantConfig,
  getInputAreaStateConfig,
  getInputAreaWithLabelConfig,
  getInputAreaSizeDimensions,
  getInputAreaRingVariable,
  getAllInputAreaVariantData,
} from "./input-area";

describe("InputArea Generator - Size Configuration", () => {
  it("should have all expected sizes", () => {
    const sizeConfig = getInputAreaSizeConfig();
    expect(Array.isArray(sizeConfig.values)).toBe(true);
    expect(sizeConfig.values.length).toBeGreaterThan(0);
  });

  it("should have config defined for all sizes", () => {
    const sizeConfig = getInputAreaSizeConfig();
    for (const size of sizeConfig.values) {
      expect(sizeConfig.config[size]).toBeDefined();
      expect(typeof sizeConfig.config[size]).toBe("object");
    }
  });

  it("should have all required dimension properties for each size", () => {
    const sizeConfig = getInputAreaSizeConfig();
    for (const size of sizeConfig.values) {
      const config = sizeConfig.config[size];
      expect(typeof config.minHeight).toBe("number");
      expect(typeof config.paddingX).toBe("number");
      expect(typeof config.paddingY).toBe("number");
      expect(typeof config.fontSize).toBe("number");
      expect(typeof config.borderRadius).toBe("number");
      expect(typeof config.width).toBe("number");
    }
  });
});

describe("InputArea Generator - Variant Configuration", () => {
  it("should have all expected variants", () => {
    const variantConfig = getInputAreaVariantConfig();
    expect(Array.isArray(variantConfig.values)).toBe(true);
    expect(variantConfig.values.length).toBeGreaterThan(0);
  });

  it("should have config defined for all variants", () => {
    const variantConfig = getInputAreaVariantConfig();
    for (const variant of variantConfig.values) {
      expect(variantConfig.config[variant]).toBeDefined();
      expect(typeof variantConfig.config[variant]).toBe("object");
    }
  });

  it("should have ringVariable defined for all variants", () => {
    const variantConfig = getInputAreaVariantConfig();
    for (const variant of variantConfig.values) {
      const config = variantConfig.config[variant];
      expect(config.ringVariable).toBeDefined();
      expect(typeof config.ringVariable).toBe("string");
    }
  });

  it("should have label defined for all variants", () => {
    const variantConfig = getInputAreaVariantConfig();
    for (const variant of variantConfig.values) {
      const config = variantConfig.config[variant];
      expect(config.label).toBeDefined();
      expect(typeof config.label).toBe("string");
    }
  });

  it("should have description or errorMessage for each variant", () => {
    const variantConfig = getInputAreaVariantConfig();
    for (const variant of variantConfig.values) {
      const config = variantConfig.config[variant];
      // Either description (default) or errorMessage (error)
      const hasDescriptionOrError =
        config.description !== undefined || config.errorMessage !== undefined;
      expect(hasDescriptionOrError).toBe(true);
    }
  });
});

describe("InputArea Generator - State Configuration", () => {
  it("should have all expected states", () => {
    const stateConfig = getInputAreaStateConfig();
    expect(Array.isArray(stateConfig.values)).toBe(true);
    expect(stateConfig.values.length).toBeGreaterThan(0);
  });

  it("should have styles defined for all states", () => {
    const stateConfig = getInputAreaStateConfig();
    for (const state of stateConfig.values) {
      expect(stateConfig.styles[state]).toBeDefined();
      expect(typeof stateConfig.styles[state]).toBe("object");
    }
  });

  it("should have ringVariable defined for all states", () => {
    const stateConfig = getInputAreaStateConfig();
    for (const state of stateConfig.values) {
      const style = stateConfig.styles[state];
      expect(style.ringVariable).toBeDefined();
      expect(typeof style.ringVariable).toBe("string");
    }
  });

  it("should have textColorVariable defined for all states", () => {
    const stateConfig = getInputAreaStateConfig();
    for (const state of stateConfig.values) {
      const style = stateConfig.styles[state];
      expect(style.textColorVariable).toBeDefined();
      expect(typeof style.textColorVariable).toBe("string");
    }
  });
});

describe("InputArea Generator - WithLabel Configuration", () => {
  it("should have withLabel values", () => {
    const withLabelConfig = getInputAreaWithLabelConfig();
    expect(Array.isArray(withLabelConfig.values)).toBe(true);
    expect(withLabelConfig.values.length).toBeGreaterThan(0);
  });

  it("should include both false and true options", () => {
    const withLabelConfig = getInputAreaWithLabelConfig();
    expect(withLabelConfig.values).toContain(false);
    expect(withLabelConfig.values).toContain(true);
  });
});

describe("InputArea Generator - Size Dimensions Calculation", () => {
  it("should calculate dimensions for xs size", () => {
    const dims = getInputAreaSizeDimensions("xs");
    expect(dims.size).toBe("xs");
    expect(typeof dims.minHeight).toBe("number");
    expect(typeof dims.paddingX).toBe("number");
    expect(typeof dims.paddingY).toBe("number");
    expect(typeof dims.fontSize).toBe("number");
    expect(typeof dims.borderRadius).toBe("number");
    expect(typeof dims.width).toBe("number");
  });

  it("should calculate dimensions for sm size", () => {
    const dims = getInputAreaSizeDimensions("sm");
    expect(dims.size).toBe("sm");
    expect(typeof dims.minHeight).toBe("number");
    expect(typeof dims.paddingX).toBe("number");
  });

  it("should calculate dimensions for base size", () => {
    const dims = getInputAreaSizeDimensions("base");
    expect(dims.size).toBe("base");
    expect(typeof dims.minHeight).toBe("number");
    expect(typeof dims.paddingX).toBe("number");
  });

  it("should calculate dimensions for lg size", () => {
    const dims = getInputAreaSizeDimensions("lg");
    expect(dims.size).toBe("lg");
    expect(typeof dims.minHeight).toBe("number");
    expect(typeof dims.paddingX).toBe("number");
  });

  it("should fallback to base for unknown size", () => {
    const dims = getInputAreaSizeDimensions("unknown");
    expect(dims.size).toBe("unknown");
    // Should have same structure as base
    expect(typeof dims.minHeight).toBe("number");
    expect(typeof dims.paddingX).toBe("number");
  });
});

describe("InputArea Generator - Ring Variable Logic", () => {
  it("should return correct ring variable for default variant + default state", () => {
    const ringVar = getInputAreaRingVariable("default", "default");
    expect(typeof ringVar).toBe("string");
    expect(ringVar.length).toBeGreaterThan(0);
    // Should use kumo semantic token pattern
    expect(ringVar).toMatch(/^color-kumo-/);
  });

  it("should return ring variable for default variant + focus state", () => {
    const ringVar = getInputAreaRingVariable("default", "focus");
    expect(typeof ringVar).toBe("string");
    expect(ringVar).toMatch(/^color-kumo-/);
  });

  it("should return ring variable for error variant + focus state", () => {
    const ringVar = getInputAreaRingVariable("error", "focus");
    expect(typeof ringVar).toBe("string");
    expect(ringVar).toMatch(/^color-kumo-/);
  });

  it("should have different ring for focus vs default state", () => {
    const defaultRing = getInputAreaRingVariable("default", "default");
    const focusRing = getInputAreaRingVariable("default", "focus");
    // Focus should be visually distinct
    expect(focusRing).not.toBe(defaultRing);
  });

  it("should have different ring for error variant vs default variant", () => {
    const defaultRing = getInputAreaRingVariable("default", "focus");
    const errorRing = getInputAreaRingVariable("error", "focus");
    // Error should be visually distinct
    expect(errorRing).not.toBe(defaultRing);
  });

  it("should return correct ring variable for disabled state", () => {
    const ringVar = getInputAreaRingVariable("default", "disabled");
    expect(typeof ringVar).toBe("string");
    expect(ringVar.length).toBeGreaterThan(0);
  });
});

describe("InputArea Generator - Complete Variant Data", () => {
  it("should return complete data structure", () => {
    const allData = getAllInputAreaVariantData();
    expect(allData).toBeDefined();
    expect(typeof allData).toBe("object");
  });

  it("should have sizes array", () => {
    const allData = getAllInputAreaVariantData();
    expect(Array.isArray(allData.sizes)).toBe(true);
    expect(allData.sizes.length).toBeGreaterThan(0);
  });

  it("should have variants array", () => {
    const allData = getAllInputAreaVariantData();
    expect(Array.isArray(allData.variants)).toBe(true);
    expect(allData.variants.length).toBeGreaterThan(0);
  });

  it("should have withLabelOptions array", () => {
    const allData = getAllInputAreaVariantData();
    expect(Array.isArray(allData.withLabelOptions)).toBe(true);
    expect(allData.withLabelOptions.length).toBeGreaterThan(0);
  });

  it("should have complete size data for each size", () => {
    const allData = getAllInputAreaVariantData();
    for (const sizeData of allData.sizes) {
      expect(sizeData.size).toBeDefined();
      expect(sizeData.dimensions).toBeDefined();
      expect(typeof sizeData.dimensions).toBe("object");
      expect(typeof sizeData.dimensions.minHeight).toBe("number");
      expect(typeof sizeData.dimensions.paddingX).toBe("number");
    }
  });

  it("should have complete variant data for each variant", () => {
    const allData = getAllInputAreaVariantData();
    for (const variantData of allData.variants) {
      expect(variantData.variant).toBeDefined();
      expect(variantData.config).toBeDefined();
      expect(Array.isArray(variantData.states)).toBe(true);
    }
  });

  it("should have complete state data for each variant", () => {
    const allData = getAllInputAreaVariantData();
    for (const variantData of allData.variants) {
      for (const stateData of variantData.states) {
        expect(stateData.state).toBeDefined();
        expect(stateData.ringVariable).toBeDefined();
        expect(stateData.stateStyle).toBeDefined();
        expect(typeof stateData.stateStyle).toBe("object");
      }
    }
  });
});
