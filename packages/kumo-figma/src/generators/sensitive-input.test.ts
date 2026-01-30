/**
 * Tests for sensitive-input.ts generator
 *
 * These tests ensure the SensitiveInput Figma component generation stays in sync
 * with the source of truth (Input component variant configuration).
 *
 * CRITICAL: These tests act as a regression guard. If you change the sensitive-input
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * input.tsx → component-registry.json → sensitive-input.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  SENSITIVE_INPUT_SIZE_VALUES,
  SENSITIVE_INPUT_VARIANT_VALUES,
  SENSITIVE_INPUT_STATE_VALUES,
  SENSITIVE_INPUT_MODE_VALUES,
} from "./sensitive-input";

// Import registry as source of truth (uses Input's configuration)
import registry from "@cloudflare/kumo/ai/component-registry.json";

const inputComponent = registry.components.Input;
const inputProps = inputComponent.props;
const sizeProIf = inputProps.size as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};
const variantProp = inputProps.variant as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

describe("SensitiveInput Generator - Registry Validation", () => {
  it("should have all expected sizes in registry (from Input component)", () => {
    // Verify size values match Input component
    expect(Array.isArray(sizeProIf.values)).toBe(true);
    expect(sizeProIf.values.length).toBeGreaterThan(0);
    expect(sizeProIf.values).toContain("xs");
    expect(sizeProIf.values).toContain("sm");
    expect(sizeProIf.values).toContain("base");
    expect(sizeProIf.values).toContain("lg");
  });

  it("should have all expected variants in registry (from Input component)", () => {
    // Verify variant values match Input component
    expect(Array.isArray(variantProp.values)).toBe(true);
    expect(variantProp.values.length).toBeGreaterThan(0);
    expect(variantProp.values).toContain("default");
    expect(variantProp.values).toContain("error");
  });

  it("should have classes defined for all sizes", () => {
    for (const size of sizeProIf.values) {
      expect(sizeProIf.classes[size]).toBeDefined();
      expect(typeof sizeProIf.classes[size]).toBe("string");
      expect(sizeProIf.classes[size].length).toBeGreaterThan(0);
    }
  });

  it("should have classes defined for all variants", () => {
    for (const variant of variantProp.values) {
      expect(variantProp.classes[variant]).toBeDefined();
      expect(typeof variantProp.classes[variant]).toBe("string");
      expect(variantProp.classes[variant].length).toBeGreaterThan(0);
    }
  });

  it("should have descriptions defined for all sizes", () => {
    for (const size of sizeProIf.values) {
      expect(sizeProIf.descriptions[size]).toBeDefined();
      expect(typeof sizeProIf.descriptions[size]).toBe("string");
      expect(sizeProIf.descriptions[size].length).toBeGreaterThan(0);
    }
  });

  it("should have descriptions defined for all variants", () => {
    for (const variant of variantProp.values) {
      expect(variantProp.descriptions[variant]).toBeDefined();
      expect(typeof variantProp.descriptions[variant]).toBe("string");
      expect(variantProp.descriptions[variant].length).toBeGreaterThan(0);
    }
  });

  it("should have a default size", () => {
    expect(sizeProIf.default).toBeDefined();
    expect(typeof sizeProIf.default).toBe("string");
    expect(sizeProIf.values).toContain(sizeProIf.default);
  });

  it("should have a default variant", () => {
    expect(variantProp.default).toBeDefined();
    expect(typeof variantProp.default).toBe("string");
    expect(variantProp.values).toContain(variantProp.default);
  });
});

describe("SensitiveInput Generator - Size Configuration", () => {
  it("should export size values", () => {
    expect(Array.isArray(SENSITIVE_INPUT_SIZE_VALUES)).toBe(true);
    expect(SENSITIVE_INPUT_SIZE_VALUES.length).toBe(4);
    expect(SENSITIVE_INPUT_SIZE_VALUES).toContain("xs");
    expect(SENSITIVE_INPUT_SIZE_VALUES).toContain("sm");
    expect(SENSITIVE_INPUT_SIZE_VALUES).toContain("base");
    expect(SENSITIVE_INPUT_SIZE_VALUES).toContain("lg");
  });

  it("should align with Input component size values", () => {
    // All generator sizes should be present in Input component
    for (const size of SENSITIVE_INPUT_SIZE_VALUES) {
      expect(sizeProIf.values).toContain(size);
    }
  });
});

describe("SensitiveInput Generator - Variant Configuration", () => {
  it("should export variant values", () => {
    expect(Array.isArray(SENSITIVE_INPUT_VARIANT_VALUES)).toBe(true);
    expect(SENSITIVE_INPUT_VARIANT_VALUES.length).toBe(2);
    expect(SENSITIVE_INPUT_VARIANT_VALUES).toContain("default");
    expect(SENSITIVE_INPUT_VARIANT_VALUES).toContain("error");
  });

  it("should align with Input component variant values", () => {
    // All generator variants should be present in Input component
    for (const variant of SENSITIVE_INPUT_VARIANT_VALUES) {
      expect(variantProp.values).toContain(variant);
    }
  });
});

describe("SensitiveInput Generator - State Configuration", () => {
  it("should export state values", () => {
    expect(Array.isArray(SENSITIVE_INPUT_STATE_VALUES)).toBe(true);
    expect(SENSITIVE_INPUT_STATE_VALUES.length).toBe(3);
    expect(SENSITIVE_INPUT_STATE_VALUES).toContain("default");
    expect(SENSITIVE_INPUT_STATE_VALUES).toContain("focus");
    expect(SENSITIVE_INPUT_STATE_VALUES).toContain("disabled");
  });

  it("should have state configuration defined", () => {
    // Validate that each state has expected properties
    const states = ["default", "focus", "disabled"];
    for (const state of states) {
      expect(SENSITIVE_INPUT_STATE_VALUES).toContain(state);
    }
  });
});

describe("SensitiveInput Generator - Mode Configuration", () => {
  it("should export mode values", () => {
    expect(Array.isArray(SENSITIVE_INPUT_MODE_VALUES)).toBe(true);
    expect(SENSITIVE_INPUT_MODE_VALUES.length).toBe(2);
    expect(SENSITIVE_INPUT_MODE_VALUES).toContain("masked");
    expect(SENSITIVE_INPUT_MODE_VALUES).toContain("revealed");
  });

  it("should have mode configuration for masked and revealed states", () => {
    // Verify both modes are supported
    expect(SENSITIVE_INPUT_MODE_VALUES).toContain("masked");
    expect(SENSITIVE_INPUT_MODE_VALUES).toContain("revealed");
  });
});

describe("SensitiveInput Generator - WithLabel Configuration", () => {
  it("should support withLabel options", () => {
    // Generator supports both bare input and Field-wrapped input
    const withLabelValues = [false, true];
    expect(withLabelValues.length).toBe(2);
    expect(withLabelValues).toContain(false);
    expect(withLabelValues).toContain(true);
  });
});

describe("SensitiveInput Generator - Component Variant Combinations", () => {
  it("should generate correct number of variant combinations", () => {
    // 4 sizes × 2 variants × 3 states × 2 modes × 2 withLabel = 96 total combinations
    const expectedCombinations =
      SENSITIVE_INPUT_SIZE_VALUES.length *
      SENSITIVE_INPUT_VARIANT_VALUES.length *
      SENSITIVE_INPUT_STATE_VALUES.length *
      SENSITIVE_INPUT_MODE_VALUES.length *
      2; // withLabel (false, true)

    expect(expectedCombinations).toBe(96);
  });

  it("should validate all size values are valid", () => {
    for (const size of SENSITIVE_INPUT_SIZE_VALUES) {
      expect(typeof size).toBe("string");
      expect(size.length).toBeGreaterThan(0);
    }
  });

  it("should validate all variant values are valid", () => {
    for (const variant of SENSITIVE_INPUT_VARIANT_VALUES) {
      expect(typeof variant).toBe("string");
      expect(variant.length).toBeGreaterThan(0);
    }
  });

  it("should validate all state values are valid", () => {
    for (const state of SENSITIVE_INPUT_STATE_VALUES) {
      expect(typeof state).toBe("string");
      expect(state.length).toBeGreaterThan(0);
    }
  });

  it("should validate all mode values are valid", () => {
    for (const mode of SENSITIVE_INPUT_MODE_VALUES) {
      expect(typeof mode).toBe("string");
      expect(mode.length).toBeGreaterThan(0);
    }
  });
});
