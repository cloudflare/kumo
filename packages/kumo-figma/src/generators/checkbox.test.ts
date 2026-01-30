/**
 * Tests for checkbox.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If checkbox styling changes, these tests
 * should NOT break - only the Figma output changes.
 *
 * Test philosophy:
 * - Test that the generator correctly reads from the registry
 * - Test that the parser produces valid Figma-compatible output
 * - Test structural invariants, not specific values
 * - DO NOT test specific colors, sizes, or variant names
 *
 * NOTE: Unlike Button, Checkbox has a `styling` section in the registry that
 * provides Figma-specific metadata (dimensions, icons, state tokens).
 */

import { describe, it, expect } from "vitest";
import {
  CHECKBOX_VARIANTS_EXPORT,
  CHECKBOX_STATES_EXPORT,
  CHECKBOX_DISABLED_OPTIONS,
  getCheckboxVariantConfig,
  getCheckboxStylingConfig,
  getCheckboxBoxSize,
  getCheckboxIconSize,
  getCheckboxLabelGap,
  getCheckboxBorderRadius,
  getCheckboxBgVariable,
  getCheckboxRingVariable,
  getCheckboxIconName,
  getCheckboxBoxConfig,
  getCheckboxLayoutConfig,
  getCheckboxTextConfig,
  getCheckboxCompleteConfig,
  getAllCheckboxVariantData,
} from "./checkbox";
import {
  expectValidRegistryProp,
  expectGetterMatchesRegistry,
  type VariantProp,
} from "./_test-utils";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const checkboxComponent = registry.components.Checkbox;
const checkboxProps = checkboxComponent.props;
const checkboxStyling = checkboxComponent.styling;

const variantProp = checkboxProps.variant as VariantProp;

describe("Checkbox Generator - Registry Structure", () => {
  it("should have valid variant prop structure", () => {
    expectValidRegistryProp(variantProp, "variant");
  });

  it("should have a default variant that exists in values", () => {
    expect(variantProp.default).toBeDefined();
    expect(variantProp.values).toContain(variantProp.default);
  });
});

describe("Checkbox Generator - Styling Section Structure", () => {
  /**
   * Checkbox has a unique `styling` section with Figma-specific metadata.
   * Test that required fields exist with correct types, not specific values.
   */

  it("should have dimensions defined as string", () => {
    expect(checkboxStyling.dimensions).toBeDefined();
    expect(typeof checkboxStyling.dimensions).toBe("string");
    expect(checkboxStyling.dimensions.length).toBeGreaterThan(0);
  });

  it("should have borderRadius defined as string", () => {
    expect(checkboxStyling.borderRadius).toBeDefined();
    expect(typeof checkboxStyling.borderRadius).toBe("string");
    expect(checkboxStyling.borderRadius.length).toBeGreaterThan(0);
  });

  it("should have baseTokens defined as non-empty array", () => {
    expect(checkboxStyling.baseTokens).toBeDefined();
    expect(Array.isArray(checkboxStyling.baseTokens)).toBe(true);
    expect(checkboxStyling.baseTokens.length).toBeGreaterThan(0);
  });

  it("should have states object with array values", () => {
    expect(checkboxStyling.states).toBeDefined();
    expect(typeof checkboxStyling.states).toBe("object");

    // Each state should be an array
    const states = checkboxStyling.states as Record<string, string[]>;
    for (const stateName of Object.keys(states)) {
      expect(
        Array.isArray(states[stateName]),
        `states.${stateName} should be an array`,
      ).toBe(true);
    }
  });

  it("should have icons array with valid structure", () => {
    expect(checkboxStyling.icons).toBeDefined();
    expect(Array.isArray(checkboxStyling.icons)).toBe(true);
    expect(checkboxStyling.icons.length).toBeGreaterThan(0);

    // Each icon should have required fields
    for (const icon of checkboxStyling.icons) {
      expect(icon.name).toBeDefined();
      expect(typeof icon.name).toBe("string");
      expect(icon.state).toBeDefined();
      expect(typeof icon.state).toBe("string");
      expect(icon.size).toBeDefined();
      expect(typeof icon.size).toBe("number");
      expect(icon.size).toBeGreaterThan(0);
    }
  });
});

describe("Checkbox Generator - Exports Sync", () => {
  /**
   * These tests ensure the generator exports stay in sync with the registry.
   */

  it("should export variants matching registry", () => {
    expect(CHECKBOX_VARIANTS_EXPORT).toEqual(variantProp.values);
  });

  it("should export states as non-empty array", () => {
    expect(Array.isArray(CHECKBOX_STATES_EXPORT)).toBe(true);
    expect(CHECKBOX_STATES_EXPORT.length).toBeGreaterThan(0);
  });

  it("should export boolean options for disabled", () => {
    expect(CHECKBOX_DISABLED_OPTIONS).toContain(true);
    expect(CHECKBOX_DISABLED_OPTIONS).toContain(false);
    expect(CHECKBOX_DISABLED_OPTIONS.length).toBe(2);
  });
});

describe("Checkbox Generator - Config Functions", () => {
  /**
   * These tests verify the config getter functions return
   * the expected structure from the registry.
   */

  it("getCheckboxVariantConfig should return registry data", () => {
    const config = getCheckboxVariantConfig();
    expectGetterMatchesRegistry(
      config,
      variantProp,
      "getCheckboxVariantConfig",
    );
  });

  it("getCheckboxStylingConfig should return valid structure", () => {
    const config = getCheckboxStylingConfig();

    expect(config.dimensions).toBeDefined();
    expect(typeof config.dimensions).toBe("string");

    expect(config.borderRadius).toBeDefined();
    expect(typeof config.borderRadius).toBe("string");

    expect(config.baseTokens).toBeDefined();
    expect(Array.isArray(config.baseTokens)).toBe(true);

    expect(config.states).toBeDefined();
    expect(typeof config.states).toBe("object");

    expect(config.icons).toBeDefined();
    expect(Array.isArray(config.icons)).toBe(true);
  });
});

describe("Checkbox Generator - Dimension Functions", () => {
  /**
   * Test that dimension functions return valid positive numbers.
   */

  it("getCheckboxBoxSize should return positive number", () => {
    const size = getCheckboxBoxSize();
    expect(typeof size).toBe("number");
    expect(size).toBeGreaterThan(0);
  });

  it("getCheckboxIconSize should return positive number", () => {
    const size = getCheckboxIconSize();
    expect(typeof size).toBe("number");
    expect(size).toBeGreaterThan(0);
  });

  it("getCheckboxLabelGap should return positive number", () => {
    const gap = getCheckboxLabelGap();
    expect(typeof gap).toBe("number");
    expect(gap).toBeGreaterThan(0);
  });

  it("getCheckboxBorderRadius should return positive number", () => {
    const radius = getCheckboxBorderRadius();
    expect(typeof radius).toBe("number");
    expect(radius).toBeGreaterThan(0);
  });
});

describe("Checkbox Generator - Variable Functions", () => {
  /**
   * Test that variable functions return non-empty strings for all states/variants.
   */

  it("getCheckboxBgVariable should return string for all states", () => {
    for (const state of CHECKBOX_STATES_EXPORT) {
      const variable = getCheckboxBgVariable(state);
      expect(typeof variable).toBe("string");
      expect(variable.length).toBeGreaterThan(0);
    }
  });

  it("getCheckboxRingVariable should return string for all variants", () => {
    for (const variant of variantProp.values) {
      const variable = getCheckboxRingVariable(variant);
      expect(typeof variable).toBe("string");
      expect(variable.length).toBeGreaterThan(0);
    }
  });

  it("getCheckboxIconName should return string or null for all states", () => {
    for (const state of CHECKBOX_STATES_EXPORT) {
      const iconName = getCheckboxIconName(state);
      expect(iconName === null || typeof iconName === "string").toBe(true);
    }
  });
});

describe("Checkbox Generator - Box Configuration", () => {
  /**
   * Test that box config produces valid structures for all combinations.
   */

  it("should produce valid config for all state/variant/disabled combinations", () => {
    for (const state of CHECKBOX_STATES_EXPORT) {
      for (const variant of variantProp.values) {
        for (const disabled of CHECKBOX_DISABLED_OPTIONS) {
          const config = getCheckboxBoxConfig(state, variant, disabled);

          // Required fields should exist
          expect(config.state).toBe(state);
          expect(config.variant).toBe(variant);
          expect(config.disabled).toBe(disabled);

          // Numeric fields should be positive numbers
          expect(typeof config.size).toBe("number");
          expect(config.size).toBeGreaterThan(0);

          expect(typeof config.borderRadius).toBe("number");
          expect(config.borderRadius).toBeGreaterThan(0);

          // Variables should be non-empty strings
          expect(typeof config.bgVariable).toBe("string");
          expect(config.bgVariable.length).toBeGreaterThan(0);

          expect(typeof config.ringVariable).toBe("string");
          expect(config.ringVariable.length).toBeGreaterThan(0);

          // Icon can be string or null
          expect(config.icon === null || typeof config.icon === "string").toBe(
            true,
          );

          // Opacity should be valid number between 0 and 1
          expect(typeof config.opacity).toBe("number");
          expect(config.opacity).toBeGreaterThan(0);
          expect(config.opacity).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("should have lower opacity when disabled", () => {
    const enabledConfig = getCheckboxBoxConfig(
      CHECKBOX_STATES_EXPORT[0],
      variantProp.values[0],
      false,
    );
    const disabledConfig = getCheckboxBoxConfig(
      CHECKBOX_STATES_EXPORT[0],
      variantProp.values[0],
      true,
    );

    expect(disabledConfig.opacity).toBeLessThan(enabledConfig.opacity);
  });
});

describe("Checkbox Generator - Layout Configuration", () => {
  it("getCheckboxLayoutConfig should return valid Figma layout properties", () => {
    const config = getCheckboxLayoutConfig();

    expect(config.layoutMode).toBeDefined();
    expect(typeof config.layoutMode).toBe("string");

    expect(config.primaryAxisAlignItems).toBeDefined();
    expect(typeof config.primaryAxisAlignItems).toBe("string");

    expect(config.counterAxisAlignItems).toBeDefined();
    expect(typeof config.counterAxisAlignItems).toBe("string");

    expect(config.primaryAxisSizingMode).toBeDefined();
    expect(typeof config.primaryAxisSizingMode).toBe("string");

    expect(config.counterAxisSizingMode).toBeDefined();
    expect(typeof config.counterAxisSizingMode).toBe("string");

    expect(typeof config.itemSpacing).toBe("number");
    expect(config.itemSpacing).toBeGreaterThan(0);
  });
});

describe("Checkbox Generator - Text Configuration", () => {
  it("getCheckboxTextConfig should return valid text properties", () => {
    const config = getCheckboxTextConfig();

    expect(typeof config.fontSize).toBe("number");
    expect(config.fontSize).toBeGreaterThan(0);

    expect(typeof config.fontWeight).toBe("number");
    expect(config.fontWeight).toBeGreaterThan(0);

    expect(typeof config.textVariable).toBe("string");
    expect(config.textVariable.length).toBeGreaterThan(0);
  });
});

describe("Checkbox Generator - Complete Configuration", () => {
  it("should produce complete config for all combinations", () => {
    for (const state of CHECKBOX_STATES_EXPORT) {
      for (const variant of variantProp.values) {
        for (const disabled of CHECKBOX_DISABLED_OPTIONS) {
          const config = getCheckboxCompleteConfig(state, variant, disabled);

          // Should contain all sub-configs
          expect(config.state).toBe(state);
          expect(config.variant).toBe(variant);
          expect(config.disabled).toBe(disabled);
          expect(config.boxConfig).toBeDefined();
          expect(config.layoutConfig).toBeDefined();
          expect(config.textConfig).toBeDefined();
          expect(config.stylingConfig).toBeDefined();

          // Opacity should be valid
          expect(typeof config.opacity).toBe("number");
          expect(config.opacity).toBeGreaterThan(0);
          expect(config.opacity).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

describe("Checkbox Generator - getAllCheckboxVariantData", () => {
  it("should return complete data structure", () => {
    const data = getAllCheckboxVariantData();

    expect(data.variantConfig).toBeDefined();
    expect(data.variantConfig.values.length).toBeGreaterThan(0);

    expect(data.stylingConfig).toBeDefined();
    expect(data.layoutConfig).toBeDefined();
    expect(data.textConfig).toBeDefined();

    expect(data.states).toBeDefined();
    expect(data.states.length).toBeGreaterThan(0);

    expect(data.boxConfigs).toBeDefined();
    expect(data.boxConfigs.length).toBeGreaterThan(0);

    expect(data.constants).toBeDefined();
  });

  it("should have valid constants", () => {
    const data = getAllCheckboxVariantData();

    expect(typeof data.constants.boxSize).toBe("number");
    expect(data.constants.boxSize).toBeGreaterThan(0);

    expect(typeof data.constants.iconSize).toBe("number");
    expect(data.constants.iconSize).toBeGreaterThan(0);

    expect(typeof data.constants.labelGap).toBe("number");
    expect(data.constants.labelGap).toBeGreaterThan(0);

    expect(typeof data.constants.borderRadius).toBe("number");
    expect(data.constants.borderRadius).toBeGreaterThan(0);
  });

  it("should have complete box config for each combination", () => {
    const data = getAllCheckboxVariantData();

    // Calculate expected count: states × variants × disabled options
    const expectedCount =
      data.states.length * data.variantConfig.values.length * 2;
    expect(data.boxConfigs.length).toBe(expectedCount);

    for (const boxConfig of data.boxConfigs) {
      expect(boxConfig.state).toBeDefined();
      expect(boxConfig.variant).toBeDefined();
      expect(typeof boxConfig.disabled).toBe("boolean");
      expect(boxConfig.bgVariable).toBeDefined();
      expect(boxConfig.ringVariable).toBeDefined();
    }
  });
});
