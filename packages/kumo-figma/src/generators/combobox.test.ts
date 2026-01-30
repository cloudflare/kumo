/**
 * Tests for combobox.ts generator
 *
 * These tests ensure the Combobox Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the combobox
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * combobox.tsx → component-registry.json → combobox.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getComboboxVariantConfig,
  getComboboxParsedTriggerStyles,
  getComboboxParsedDropdownStyles,
  getComboboxLayoutData,
  getAllComboboxVariantData,
} from "./combobox";

describe("Combobox Generator - Variant Configuration", () => {
  const config = getComboboxVariantConfig();

  it("should have variants defined", () => {
    expect(Array.isArray(config.variants)).toBe(true);
    expect(config.variants.length).toBeGreaterThan(0);
  });

  it("should have expected variant values", () => {
    expect(config.variants).toContain("default");
    expect(config.variants).toContain("withLabel");
    expect(config.variants).toContain("withError");
  });

  it("should have open states defined", () => {
    expect(Array.isArray(config.openStates)).toBe(true);
    expect(config.openStates).toContain(false);
    expect(config.openStates).toContain(true);
  });

  it("should have interaction states defined", () => {
    expect(Array.isArray(config.interactionStates)).toBe(true);
    expect(config.interactionStates).toContain("default");
    expect(config.interactionStates).toContain("focus");
    expect(config.interactionStates).toContain("disabled");
  });

  it("should have variant configuration object", () => {
    expect(typeof config.variantConfig).toBe("object");
    expect(config.variantConfig).toBeDefined();
  });

  it("should have state styles object", () => {
    expect(typeof config.stateStyles).toBe("object");
    expect(config.stateStyles).toBeDefined();
  });

  it("should have configuration for each variant", () => {
    for (const variant of config.variants) {
      expect(config.variantConfig[variant]).toBeDefined();
      expect(typeof config.variantConfig[variant]).toBe("object");
    }
  });

  it("should have state styles for each interaction state", () => {
    for (const state of config.interactionStates) {
      expect(config.stateStyles[state]).toBeDefined();
      expect(typeof config.stateStyles[state]).toBe("object");
    }
  });
});

describe("Combobox Generator - Trigger Styles Parsing", () => {
  const triggerStyles = getComboboxParsedTriggerStyles();

  it("should have raw trigger styles defined", () => {
    expect(triggerStyles.raw).toBeDefined();
    expect(typeof triggerStyles.raw).toBe("string");
    expect(triggerStyles.raw.length).toBeGreaterThan(0);
  });

  it("should parse trigger styles", () => {
    expect(triggerStyles.parsed).toBeDefined();
    expect(typeof triggerStyles.parsed).toBe("object");
  });

  it("should parse background color variable from trigger styles", () => {
    const parsed = triggerStyles.parsed;
    expect(parsed.fillVariable).toBeDefined();
    expect(typeof parsed.fillVariable).toBe("string");
  });

  it("should parse stroke variable (ring) from trigger styles", () => {
    const parsed = triggerStyles.parsed;
    expect(parsed.strokeVariable).toBeDefined();
    expect(typeof parsed.strokeVariable).toBe("string");
  });

  it("should parse border radius from trigger styles", () => {
    const parsed = triggerStyles.parsed;
    expect(parsed.borderRadius).toBeDefined();
    expect(typeof parsed.borderRadius).toBe("number");
    expect(parsed.borderRadius).toBeGreaterThan(0);
  });
});

describe("Combobox Generator - Dropdown Styles Parsing", () => {
  const dropdownStyles = getComboboxParsedDropdownStyles();

  it("should have raw dropdown styles defined", () => {
    expect(dropdownStyles.raw).toBeDefined();
    expect(typeof dropdownStyles.raw).toBe("string");
    expect(dropdownStyles.raw.length).toBeGreaterThan(0);
  });

  it("should parse dropdown styles", () => {
    expect(dropdownStyles.parsed).toBeDefined();
    expect(typeof dropdownStyles.parsed).toBe("object");
  });

  it("should parse background color variable from dropdown styles", () => {
    const parsed = dropdownStyles.parsed;
    expect(parsed.fillVariable).toBeDefined();
    expect(typeof parsed.fillVariable).toBe("string");
  });

  it("should parse border from dropdown styles", () => {
    const parsed = dropdownStyles.parsed;
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeVariable).toBeDefined();
    expect(typeof parsed.strokeVariable).toBe("string");
  });
});

describe("Combobox Generator - Layout Data", () => {
  describe("default variant", () => {
    it("should compute layout data for closed default state", () => {
      const layout = getComboboxLayoutData("default", false, "default");
      expect(layout.variant).toBe("default");
      expect(layout.open).toBe(false);
      expect(layout.state).toBe("default");
      expect(layout.hasLabel).toBe(false);
      expect(layout.hasDescription).toBe(false);
      expect(layout.hasError).toBe(false);
    });

    it("should compute layout data for open default state", () => {
      const layout = getComboboxLayoutData("default", true, "default");
      expect(layout.variant).toBe("default");
      expect(layout.open).toBe(true);
      expect(layout.state).toBe("default");
      expect(layout.dropdown).toBeDefined();
      expect(typeof layout.dropdown).toBe("object");
    });

    it("should have trigger dimensions", () => {
      const layout = getComboboxLayoutData("default", false, "default");
      expect(layout.trigger).toBeDefined();
      expect(typeof layout.trigger.width).toBe("number");
      expect(typeof layout.trigger.height).toBe("number");
      expect(typeof layout.trigger.borderRadius).toBe("number");
      expect(typeof layout.trigger.paddingX).toBe("number");
    });

    it("should not have dropdown when closed", () => {
      const layout = getComboboxLayoutData("default", false, "default");
      expect(layout.dropdown).toBeNull();
    });

    it("should have dropdown dimensions when open", () => {
      const layout = getComboboxLayoutData("default", true, "default");
      expect(layout.dropdown).not.toBeNull();
      if (layout.dropdown) {
        expect(typeof layout.dropdown.width).toBe("number");
        expect(typeof layout.dropdown.height).toBe("number");
        expect(typeof layout.dropdown.borderRadius).toBe("number");
      }
    });
  });

  describe("withLabel variant", () => {
    it("should have label flag set", () => {
      const layout = getComboboxLayoutData("withLabel", false, "default");
      expect(layout.hasLabel).toBe(true);
      expect(layout.hasDescription).toBe(true);
      expect(layout.hasError).toBe(false);
    });
  });

  describe("withError variant", () => {
    it("should have error flag set", () => {
      const layout = getComboboxLayoutData("withError", false, "default");
      expect(layout.hasLabel).toBe(true);
      expect(layout.hasError).toBe(true);
    });

    it("should have ring variable for error state", () => {
      const layout = getComboboxLayoutData("withError", false, "default");
      expect(typeof layout.ringVariable).toBe("string");
      // Error state should use a kumo semantic color token
      expect(layout.ringVariable).toMatch(/^color-kumo-/);
    });
  });

  describe("focus state", () => {
    it("should have ring variable for focus state", () => {
      const layout = getComboboxLayoutData("default", false, "focus");
      expect(typeof layout.ringVariable).toBe("string");
      // Focus state should use a kumo semantic color token
      expect(layout.ringVariable).toMatch(/^color-kumo-/);
    });

    it("should have different ring variable than default state", () => {
      const defaultLayout = getComboboxLayoutData("default", false, "default");
      const focusLayout = getComboboxLayoutData("default", false, "focus");
      // Focus state should be visually distinct from default
      expect(focusLayout.ringVariable).not.toBe(defaultLayout.ringVariable);
    });
  });

  describe("disabled state", () => {
    it("should have opacity set", () => {
      const layout = getComboboxLayoutData("default", false, "disabled");
      expect(layout.opacity).toBeDefined();
      expect(typeof layout.opacity).toBe("number");
      expect(layout.opacity).toBeLessThan(1);
    });
  });
});

describe("Combobox Generator - Complete Variant Data", () => {
  const allData = getAllComboboxVariantData();

  it("should have trigger styles", () => {
    expect(allData.triggerStyles).toBeDefined();
    expect(allData.triggerStyles.raw).toBeDefined();
    expect(allData.triggerStyles.parsed).toBeDefined();
  });

  it("should have dropdown styles", () => {
    expect(allData.dropdownStyles).toBeDefined();
    expect(allData.dropdownStyles.raw).toBeDefined();
    expect(allData.dropdownStyles.parsed).toBeDefined();
  });

  it("should have configuration", () => {
    expect(allData.config).toBeDefined();
    expect(Array.isArray(allData.config.variants)).toBe(true);
    expect(Array.isArray(allData.config.openStates)).toBe(true);
    expect(Array.isArray(allData.config.interactionStates)).toBe(true);
  });

  it("should have variants array", () => {
    expect(Array.isArray(allData.variants)).toBe(true);
    expect(allData.variants.length).toBeGreaterThan(0);
  });

  it("should have correct number of variants", () => {
    const expectedCount =
      allData.config.variants.length *
      allData.config.openStates.length *
      allData.config.interactionStates.length;
    expect(allData.variants.length).toBe(expectedCount);
  });

  it("should have complete data for each variant", () => {
    for (const variant of allData.variants) {
      expect(variant.variant).toBeDefined();
      expect(typeof variant.open).toBe("boolean");
      expect(variant.state).toBeDefined();
      expect(variant.trigger).toBeDefined();
      expect(typeof variant.hasLabel).toBe("boolean");
      expect(typeof variant.hasDescription).toBe("boolean");
      expect(typeof variant.hasError).toBe("boolean");
    }
  });
});
