/**
 * Tests for meter.ts generator
 *
 * These tests ensure the Meter Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the meter
 * generator, these tests will catch any unintended changes.
 *
 * Source of truth chain:
 * meter.tsx → component-registry.json → meter.ts (generator) → Figma
 *
 * Note: Meter generator uses fixed fill level variants (0%, 25%, 50%, 75%, 100%)
 * rather than reading variant configuration from the registry. The registry
 * documents the component's props (value, max, min, label) but the generator
 * creates predetermined fill level examples for Figma.
 */

import { describe, it, expect } from "vitest";
import {
  getMeterFillLevelConfig,
  getMeterDimensionsConfig,
  getMeterColorBindings,
  getMeterIndicatorWidth,
  getAllMeterVariantData,
} from "./meter";
import { BORDER_RADIUS } from "./shared";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const meterComponent = registry.components.Meter;
const meterProps = meterComponent.props;

describe("Meter Generator - Registry Validation", () => {
  it("should have Meter component in registry", () => {
    expect(meterComponent).toBeDefined();
    expect(meterComponent.name).toBe("Meter");
    expect(meterComponent.type).toBe("component");
  });

  it("should have expected props in registry", () => {
    expect(meterProps.label).toBeDefined();
    expect(meterProps.label.required).toBe(true);
    expect(meterProps.value).toBeDefined();
    expect(meterProps.value.type).toBe("number");
    expect(meterProps.max).toBeDefined();
    expect(meterProps.max.type).toBe("number");
    expect(meterProps.min).toBeDefined();
    expect(meterProps.min.type).toBe("number");
  });

  it("should have Display category in registry", () => {
    expect(meterComponent.category).toBe("Display");
  });

  it("should have expected colors in registry", () => {
    expect(Array.isArray(meterComponent.colors)).toBe(true);
    expect(meterComponent.colors.length).toBeGreaterThan(0);

    // All colors should be kumo semantic tokens
    for (const color of meterComponent.colors) {
      expect(color).toMatch(/kumo/);
    }
  });
});

describe("Meter Generator - Fill Level Configuration", () => {
  it("should return fill level configuration", () => {
    const config = getMeterFillLevelConfig();
    expect(config).toBeDefined();
    expect(config.fillLevels).toBeDefined();
    expect(config.description).toBeDefined();
  });

  it("should have array of fill levels", () => {
    const config = getMeterFillLevelConfig();
    expect(Array.isArray(config.fillLevels)).toBe(true);
    expect(config.fillLevels.length).toBeGreaterThan(0);
  });

  it("should have fill levels as numbers", () => {
    const config = getMeterFillLevelConfig();
    for (const level of config.fillLevels) {
      expect(typeof level).toBe("number");
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(100);
    }
  });

  it("should have at least 5 fill levels", () => {
    const config = getMeterFillLevelConfig();
    expect(config.fillLevels.length).toBeGreaterThanOrEqual(5);
  });
});

describe("Meter Generator - Dimensions Configuration", () => {
  it("should return dimensions configuration", () => {
    const config = getMeterDimensionsConfig();
    expect(config).toBeDefined();
    expect(config.meterWidth).toBeDefined();
    expect(config.trackHeight).toBeDefined();
    expect(config.gap).toBeDefined();
    expect(config.description).toBeDefined();
  });

  it("should have numeric dimensions", () => {
    const config = getMeterDimensionsConfig();
    expect(typeof config.meterWidth).toBe("number");
    expect(typeof config.trackHeight).toBe("number");
    expect(typeof config.gap).toBe("number");
  });

  it("should have positive dimensions", () => {
    const config = getMeterDimensionsConfig();
    expect(config.meterWidth).toBeGreaterThan(0);
    expect(config.trackHeight).toBeGreaterThan(0);
    expect(config.gap).toBeGreaterThan(0);
  });

  it("should have reasonable meter width", () => {
    const config = getMeterDimensionsConfig();
    // Meter width should be wide enough for useful display (e.g., 200-300px)
    expect(config.meterWidth).toBeGreaterThan(100);
    expect(config.meterWidth).toBeLessThan(500);
  });

  it("should have reasonable track height", () => {
    const config = getMeterDimensionsConfig();
    // Track height should be visible but not too tall (e.g., 4-16px)
    expect(config.trackHeight).toBeGreaterThan(2);
    expect(config.trackHeight).toBeLessThan(32);
  });
});

describe("Meter Generator - Color Bindings", () => {
  it("should return color bindings configuration", () => {
    const bindings = getMeterColorBindings();
    expect(bindings).toBeDefined();
    expect(bindings.label).toBeDefined();
    expect(bindings.value).toBeDefined();
    expect(bindings.track).toBeDefined();
    expect(bindings.indicator).toBeDefined();
    expect(bindings.description).toBeDefined();
  });

  it("should have string values for all bindings", () => {
    const bindings = getMeterColorBindings();
    expect(typeof bindings.label).toBe("string");
    expect(typeof bindings.value).toBe("string");
    expect(typeof bindings.track).toBe("string");
    expect(typeof bindings.indicator).toBe("string");
  });

  it("should have non-empty binding values", () => {
    const bindings = getMeterColorBindings();
    expect(bindings.label.length).toBeGreaterThan(0);
    expect(bindings.value.length).toBeGreaterThan(0);
    expect(bindings.track.length).toBeGreaterThan(0);
    expect(bindings.indicator.length).toBeGreaterThan(0);
  });

  it("should use semantic color tokens", () => {
    const bindings = getMeterColorBindings();

    // Label should use a kumo text color token
    expect(bindings.label).toMatch(/^text-color-kumo-/);

    // Value should use a kumo text color token
    expect(bindings.value).toMatch(/^text-color-kumo-/);

    // Track should use a kumo color token
    expect(bindings.track).toMatch(/^color-kumo-/);

    // Indicator should use a kumo color token
    expect(bindings.indicator).toMatch(/^color-kumo-/);
  });

  it("should use distinct colors for label and value text", () => {
    const bindings = getMeterColorBindings();
    // Label and value should have distinct color treatments for visual hierarchy
    expect(bindings.label).not.toBe(bindings.value);
  });

  it("should use distinct colors for track and indicator", () => {
    const bindings = getMeterColorBindings();
    // Track and indicator should be visually distinct
    expect(bindings.track).not.toBe(bindings.indicator);
  });
});

describe("Meter Generator - Indicator Width Calculation", () => {
  it("should calculate indicator width for 0%", () => {
    const width = getMeterIndicatorWidth(0);
    expect(typeof width).toBe("number");
    expect(width).toBe(0);
  });

  it("should calculate indicator width for 50%", () => {
    const width = getMeterIndicatorWidth(50);
    expect(typeof width).toBe("number");
    expect(width).toBeGreaterThan(0);
  });

  it("should calculate indicator width for 100%", () => {
    const config = getMeterDimensionsConfig();
    const width = getMeterIndicatorWidth(100);
    expect(typeof width).toBe("number");
    expect(width).toBe(config.meterWidth);
  });

  it("should calculate proportional widths", () => {
    const width25 = getMeterIndicatorWidth(25);
    const width50 = getMeterIndicatorWidth(50);
    const width75 = getMeterIndicatorWidth(75);

    // 50% should be exactly 2x 25%
    expect(width50).toBe(width25 * 2);

    // 75% should be exactly 3x 25%
    expect(width75).toBe(width25 * 3);
  });
});

describe("Meter Generator - Complete Variant Data", () => {
  it("should return complete variant data structure", () => {
    const data = getAllMeterVariantData();
    expect(data).toBeDefined();
    expect(data.registry).toBeDefined();
    expect(data.fillLevels).toBeDefined();
    expect(data.dimensions).toBeDefined();
    expect(data.colorBindings).toBeDefined();
    expect(data.layout).toBeDefined();
  });

  it("should have registry metadata", () => {
    const data = getAllMeterVariantData();
    expect(data.registry.name).toBe("Meter");
    expect(data.registry.description).toBeDefined();
    expect(data.registry.category).toBe("Display");
    expect(Array.isArray(data.registry.colors)).toBe(true);
  });

  it("should have fill level variants with computed data", () => {
    const data = getAllMeterVariantData();
    expect(Array.isArray(data.fillLevels)).toBe(true);
    expect(data.fillLevels.length).toBeGreaterThan(0);

    for (const level of data.fillLevels) {
      expect(typeof level.fillPercentage).toBe("number");
      expect(typeof level.indicatorWidth).toBe("number");
      expect(typeof level.label).toBe("string");
      expect(typeof level.valueText).toBe("string");
    }
  });

  it("should have dimensions configuration", () => {
    const data = getAllMeterVariantData();
    expect(typeof data.dimensions.meterWidth).toBe("number");
    expect(typeof data.dimensions.trackHeight).toBe("number");
    expect(typeof data.dimensions.gap).toBe("number");
  });

  it("should have color bindings", () => {
    const data = getAllMeterVariantData();
    expect(typeof data.colorBindings.label).toBe("string");
    expect(typeof data.colorBindings.value).toBe("string");
    expect(typeof data.colorBindings.track).toBe("string");
    expect(typeof data.colorBindings.indicator).toBe("string");
  });

  it("should have layout configuration", () => {
    const data = getAllMeterVariantData();
    expect(data.layout.headerRowMode).toBe("HORIZONTAL");
    expect(data.layout.headerRowAlign).toBe("SPACE_BETWEEN");
    expect(typeof data.layout.trackCornerRadius).toBe("number");
    expect(typeof data.layout.indicatorCornerRadius).toBe("number");
    expect(typeof data.layout.labelFontSize).toBe("number");
    expect(typeof data.layout.labelFontWeight).toBe("number");
    expect(typeof data.layout.valueFontSize).toBe("number");
    expect(typeof data.layout.valueFontWeight).toBe("number");
  });

  it("should have fully rounded corners", () => {
    const data = getAllMeterVariantData();
    // Uses BORDER_RADIUS.full for fully rounded corners
    expect(data.layout.trackCornerRadius).toBe(BORDER_RADIUS.full);
    expect(data.layout.indicatorCornerRadius).toBe(BORDER_RADIUS.full);
  });
});
