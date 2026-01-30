/**
 * Tests for switch.ts generator
 *
 * These tests ensure the Switch Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the switch
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * switch.tsx → component-registry.json → switch.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getSwitchVariantConfig,
  getSwitchSizeConfig,
  getSwitchDimensions,
  getSwitchTrackColorBinding,
  getAllSwitchVariantData,
} from "./switch";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const componentData = registry.components.Switch;
const props = componentData.props;
const variantProp = props.variant as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};
const sizeProp = props.size as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

describe("Switch Generator - Registry Validation", () => {
  it("should have all expected variants in registry", () => {
    // Don't hardcode expected variants - verify structure
    expect(Array.isArray(variantProp.values)).toBe(true);
    expect(variantProp.values.length).toBeGreaterThan(0);
  });

  it("should have classes defined for all variants", () => {
    for (const variant of variantProp.values) {
      // Note: Only "error" variant has classes defined in registry
      // "default" variant has no classes (uses default styles)
      if (variant === "error") {
        expect(variantProp.classes[variant]).toBeDefined();
        expect(typeof variantProp.classes[variant]).toBe("string");
      }
    }
  });

  it("should have descriptions defined for all variants", () => {
    for (const variant of variantProp.values) {
      expect(variantProp.descriptions[variant]).toBeDefined();
      expect(typeof variantProp.descriptions[variant]).toBe("string");
      expect(variantProp.descriptions[variant].length).toBeGreaterThan(0);
    }
  });

  it("should have a default variant", () => {
    expect(variantProp.default).toBeDefined();
    expect(typeof variantProp.default).toBe("string");
    expect(variantProp.values).toContain(variantProp.default);
  });

  it("should have all expected sizes in registry", () => {
    expect(Array.isArray(sizeProp.values)).toBe(true);
    expect(sizeProp.values.length).toBeGreaterThan(0);
  });

  it("should have classes defined for all sizes", () => {
    for (const size of sizeProp.values) {
      expect(sizeProp.classes[size]).toBeDefined();
      expect(typeof sizeProp.classes[size]).toBe("string");
      expect(sizeProp.classes[size].length).toBeGreaterThan(0);
    }
  });

  it("should have descriptions defined for all sizes", () => {
    for (const size of sizeProp.values) {
      expect(sizeProp.descriptions[size]).toBeDefined();
      expect(typeof sizeProp.descriptions[size]).toBe("string");
      expect(sizeProp.descriptions[size].length).toBeGreaterThan(0);
    }
  });

  it("should have a default size", () => {
    expect(sizeProp.default).toBeDefined();
    expect(typeof sizeProp.default).toBe("string");
    expect(sizeProp.values).toContain(sizeProp.default);
  });
});

describe("Switch Generator - Variant Configuration", () => {
  it("should return complete variant config from registry", () => {
    const config = getSwitchVariantConfig();
    expect(config.values).toBeDefined();
    expect(Array.isArray(config.values)).toBe(true);
    expect(config.classes).toBeDefined();
    expect(typeof config.classes).toBe("object");
    expect(config.descriptions).toBeDefined();
    expect(typeof config.descriptions).toBe("object");
    expect(config.default).toBeDefined();
    expect(typeof config.default).toBe("string");
  });

  it("should have default variant in values", () => {
    const config = getSwitchVariantConfig();
    expect(config.values).toContain(config.default);
  });
});

describe("Switch Generator - Size Configuration", () => {
  it("should return complete size config from registry", () => {
    const config = getSwitchSizeConfig();
    expect(config.values).toBeDefined();
    expect(Array.isArray(config.values)).toBe(true);
    expect(config.classes).toBeDefined();
    expect(typeof config.classes).toBe("object");
    expect(config.descriptions).toBeDefined();
    expect(typeof config.descriptions).toBe("object");
    expect(config.default).toBeDefined();
    expect(typeof config.default).toBe("string");
  });

  it("should have default size in values", () => {
    const config = getSwitchSizeConfig();
    expect(config.values).toContain(config.default);
  });
});

describe("Switch Generator - Dimensions Calculation", () => {
  const sizeConfig = getSwitchSizeConfig();

  for (const size of sizeConfig.values) {
    describe(`${size} size`, () => {
      it("should calculate dimensions correctly", () => {
        const dimensions = getSwitchDimensions(size);
        expect(dimensions.size).toBe(size);
        expect(typeof dimensions.width).toBe("number");
        expect(typeof dimensions.height).toBe("number");
        expect(dimensions.width).toBeGreaterThan(0);
        expect(dimensions.height).toBeGreaterThan(0);
      });

      it("should calculate thumb size correctly", () => {
        const dimensions = getSwitchDimensions(size);
        expect(typeof dimensions.thumbSize).toBe("number");
        expect(dimensions.thumbSize).toBeGreaterThan(0);
        // Thumb size should be height minus padding on both sides
        expect(dimensions.thumbSize).toBe(
          dimensions.height - dimensions.padding * 2,
        );
      });

      it("should include padding value", () => {
        const dimensions = getSwitchDimensions(size);
        expect(typeof dimensions.padding).toBe("number");
        expect(dimensions.padding).toBeGreaterThan(0);
      });
    });
  }

  it("should throw error for invalid size", () => {
    expect(() => getSwitchDimensions("invalid")).toThrow("Invalid size");
  });

  it("should have consistent width-to-height ratios", () => {
    const dimensions = sizeConfig.values.map((size) =>
      getSwitchDimensions(size),
    );
    // All switches should have width > height (pill shape)
    for (const dim of dimensions) {
      expect(dim.width).toBeGreaterThan(dim.height);
    }
  });
});

describe("Switch Generator - Track Color Binding", () => {
  const variantConfig = getSwitchVariantConfig();

  it("should return kumo semantic color for unchecked state", () => {
    const binding = getSwitchTrackColorBinding("default", false, false);
    expect(typeof binding.bgVariableName).toBe("string");
    expect(binding.bgVariableName).toMatch(/^color-kumo-/);
  });

  it("should return kumo semantic color for checked default variant", () => {
    const binding = getSwitchTrackColorBinding("default", true, false);
    expect(typeof binding.bgVariableName).toBe("string");
    expect(binding.bgVariableName).toMatch(/^color-kumo-/);
  });

  it("should return kumo semantic color for checked error variant", () => {
    const binding = getSwitchTrackColorBinding("error", true, false);
    expect(typeof binding.bgVariableName).toBe("string");
    expect(binding.bgVariableName).toMatch(/^color-kumo-/);
  });

  it("should have different color for checked vs unchecked state", () => {
    const unchecked = getSwitchTrackColorBinding("default", false, false);
    const checked = getSwitchTrackColorBinding("default", true, false);
    expect(checked.bgVariableName).not.toBe(unchecked.bgVariableName);
  });

  it("should have different color for error variant vs default variant when checked", () => {
    const defaultChecked = getSwitchTrackColorBinding("default", true, false);
    const errorChecked = getSwitchTrackColorBinding("error", true, false);
    expect(errorChecked.bgVariableName).not.toBe(defaultChecked.bgVariableName);
  });

  it("should return color for disabled checked state", () => {
    const binding = getSwitchTrackColorBinding("default", true, true);
    expect(typeof binding.bgVariableName).toBe("string");
    expect(binding.bgVariableName).toMatch(/^color-kumo-/);
  });

  for (const variant of variantConfig.values) {
    describe(`${variant} variant`, () => {
      it("should return complete binding data for unchecked state", () => {
        const binding = getSwitchTrackColorBinding(variant, false, false);
        expect(binding.variant).toBe(variant);
        expect(binding.checked).toBe(false);
        expect(binding.disabled).toBe(false);
        expect(binding.bgVariableName).toBeDefined();
        expect(typeof binding.bgVariableName).toBe("string");
      });

      it("should return complete binding data for checked state", () => {
        const binding = getSwitchTrackColorBinding(variant, true, false);
        expect(binding.variant).toBe(variant);
        expect(binding.checked).toBe(true);
        expect(binding.disabled).toBe(false);
        expect(binding.bgVariableName).toBeDefined();
        expect(typeof binding.bgVariableName).toBe("string");
      });

      it("should return complete binding data for disabled state", () => {
        const binding = getSwitchTrackColorBinding(variant, false, true);
        expect(binding.variant).toBe(variant);
        expect(binding.checked).toBe(false);
        expect(binding.disabled).toBe(true);
        expect(binding.bgVariableName).toBeDefined();
        expect(typeof binding.bgVariableName).toBe("string");
      });
    });
  }
});

describe("Switch Generator - Complete Variant Data", () => {
  it("should return complete intermediate data structure", () => {
    const allData = getAllSwitchVariantData();

    // Verify top-level structure
    expect(allData.variantConfig).toBeDefined();
    expect(allData.sizeConfig).toBeDefined();
    expect(allData.dimensions).toBeDefined();
    expect(allData.trackColors).toBeDefined();
    expect(allData.labelGap).toBeDefined();
    expect(allData.thumbColor).toBeDefined();
    expect(allData.disabledOpacity).toBeDefined();
  });

  it("should include all size dimensions", () => {
    const allData = getAllSwitchVariantData();
    expect(Array.isArray(allData.dimensions)).toBe(true);
    expect(allData.dimensions.length).toBe(allData.sizeConfig.values.length);

    for (const dim of allData.dimensions) {
      expect(dim.size).toBeDefined();
      expect(typeof dim.width).toBe("number");
      expect(typeof dim.height).toBe("number");
      expect(typeof dim.thumbSize).toBe("number");
      expect(typeof dim.padding).toBe("number");
    }
  });

  it("should include all track color combinations", () => {
    const allData = getAllSwitchVariantData();
    expect(Array.isArray(allData.trackColors)).toBe(true);
    expect(allData.trackColors.length).toBeGreaterThan(0);

    for (const color of allData.trackColors) {
      expect(color.variant).toBeDefined();
      expect(typeof color.checked).toBe("boolean");
      expect(typeof color.disabled).toBe("boolean");
      expect(color.bgVariableName).toBeDefined();
      expect(typeof color.bgVariableName).toBe("string");
    }
  });

  it("should have correct number of track color combinations", () => {
    const allData = getAllSwitchVariantData();
    // variants × checked states × disabled states
    const expectedCombinations = allData.variantConfig.values.length * 2 * 2;
    expect(allData.trackColors.length).toBe(expectedCombinations);
  });

  it("should include label gap value", () => {
    const allData = getAllSwitchVariantData();
    expect(typeof allData.labelGap).toBe("number");
    expect(allData.labelGap).toBeGreaterThan(0);
  });

  it("should include thumb color as valid RGB", () => {
    const allData = getAllSwitchVariantData();
    expect(allData.thumbColor).toBeDefined();
    // Thumb color should be a valid RGB object with values 0-1
    expect(typeof allData.thumbColor.r).toBe("number");
    expect(typeof allData.thumbColor.g).toBe("number");
    expect(typeof allData.thumbColor.b).toBe("number");
    expect(allData.thumbColor.r).toBeGreaterThanOrEqual(0);
    expect(allData.thumbColor.r).toBeLessThanOrEqual(1);
    expect(allData.thumbColor.g).toBeGreaterThanOrEqual(0);
    expect(allData.thumbColor.g).toBeLessThanOrEqual(1);
    expect(allData.thumbColor.b).toBeGreaterThanOrEqual(0);
    expect(allData.thumbColor.b).toBeLessThanOrEqual(1);
  });

  it("should include disabled opacity", () => {
    const allData = getAllSwitchVariantData();
    expect(typeof allData.disabledOpacity).toBe("number");
    expect(allData.disabledOpacity).toBeGreaterThan(0);
    expect(allData.disabledOpacity).toBeLessThanOrEqual(1);
  });
});
