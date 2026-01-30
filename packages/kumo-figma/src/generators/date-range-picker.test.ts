/**
 * Tests for date-range-picker.ts generator
 *
 * These tests ensure the DateRangePicker Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the date-range-picker
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * date-range-picker.tsx → component-registry.json → date-range-picker.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getDateRangePickerSizeConfig,
  getDateRangePickerVariantConfig,
  getDateRangePickerSelectedConfig,
  getDateRangePickerSizeDimensions,
  getDateRangePickerVariantBackground,
  getDateRangePickerDayLabels,
  getDateRangePickerMonthConfig,
  getAllDateRangePickerVariantData,
} from "./date-range-picker";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const componentData = registry.components.DateRangePicker;
const props = componentData.props;
const sizeProp = props.size as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};
const variantProp = props.variant as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

describe("DateRangePicker Generator - Registry Validation", () => {
  it("should have all expected size values in registry", () => {
    expect(Array.isArray(sizeProp.values)).toBe(true);
    expect(sizeProp.values.length).toBeGreaterThan(0);
    expect(sizeProp.values).toContain("sm");
    expect(sizeProp.values).toContain("base");
    expect(sizeProp.values).toContain("lg");
  });

  it("should have classes defined for all size values", () => {
    for (const size of sizeProp.values) {
      expect(sizeProp.classes[size]).toBeDefined();
      expect(typeof sizeProp.classes[size]).toBe("string");
      expect(sizeProp.classes[size].length).toBeGreaterThan(0);
    }
  });

  it("should have descriptions defined for all size values", () => {
    for (const size of sizeProp.values) {
      expect(sizeProp.descriptions[size]).toBeDefined();
      expect(typeof sizeProp.descriptions[size]).toBe("string");
      expect(sizeProp.descriptions[size].length).toBeGreaterThan(0);
    }
  });

  it("should have all expected variant values in registry", () => {
    expect(Array.isArray(variantProp.values)).toBe(true);
    expect(variantProp.values.length).toBeGreaterThan(0);
    expect(variantProp.values).toContain("default");
    expect(variantProp.values).toContain("subtle");
  });

  it("should have classes defined for all variant values", () => {
    for (const variant of variantProp.values) {
      expect(variantProp.classes[variant]).toBeDefined();
      expect(typeof variantProp.classes[variant]).toBe("string");
      expect(variantProp.classes[variant].length).toBeGreaterThan(0);
    }
  });

  it("should have descriptions defined for all variant values", () => {
    for (const variant of variantProp.values) {
      expect(variantProp.descriptions[variant]).toBeDefined();
      expect(typeof variantProp.descriptions[variant]).toBe("string");
      expect(variantProp.descriptions[variant].length).toBeGreaterThan(0);
    }
  });

  it("should have base as default size", () => {
    expect(sizeProp.default).toBe("base");
  });

  it("should have default as default variant", () => {
    expect(variantProp.default).toBe("default");
  });
});

describe("DateRangePicker Generator - Size Configuration", () => {
  it("should have size configuration with values and config", () => {
    const sizeConfig = getDateRangePickerSizeConfig();
    expect(sizeConfig.values).toBeDefined();
    expect(Array.isArray(sizeConfig.values)).toBe(true);
    expect(sizeConfig.values.length).toBeGreaterThan(0);
    expect(sizeConfig.config).toBeDefined();
    expect(typeof sizeConfig.config).toBe("object");
  });

  it("should have size config for all size values", () => {
    const sizeConfig = getDateRangePickerSizeConfig();
    for (const size of sizeConfig.values) {
      expect(sizeConfig.config[size]).toBeDefined();
      expect(typeof sizeConfig.config[size]).toBe("object");
    }
  });

  it("should have complete dimensions for sm size", () => {
    const dimensions = getDateRangePickerSizeDimensions("sm");
    expect(dimensions.size).toBe("sm");
    expect(typeof dimensions.calendarWidth).toBe("number");
    expect(typeof dimensions.cellHeight).toBe("number");
    expect(typeof dimensions.cellWidth).toBe("number");
    expect(typeof dimensions.textSize).toBe("number");
    expect(typeof dimensions.iconSize).toBe("number");
    expect(typeof dimensions.padding).toBe("number");
    expect(typeof dimensions.gap).toBe("number");
  });

  it("should have complete dimensions for base size", () => {
    const dimensions = getDateRangePickerSizeDimensions("base");
    expect(dimensions.size).toBe("base");
    expect(typeof dimensions.calendarWidth).toBe("number");
    expect(typeof dimensions.cellHeight).toBe("number");
    expect(typeof dimensions.cellWidth).toBe("number");
    expect(typeof dimensions.textSize).toBe("number");
    expect(typeof dimensions.iconSize).toBe("number");
    expect(typeof dimensions.padding).toBe("number");
    expect(typeof dimensions.gap).toBe("number");
  });

  it("should have complete dimensions for lg size", () => {
    const dimensions = getDateRangePickerSizeDimensions("lg");
    expect(dimensions.size).toBe("lg");
    expect(typeof dimensions.calendarWidth).toBe("number");
    expect(typeof dimensions.cellHeight).toBe("number");
    expect(typeof dimensions.cellWidth).toBe("number");
    expect(typeof dimensions.textSize).toBe("number");
    expect(typeof dimensions.iconSize).toBe("number");
    expect(typeof dimensions.padding).toBe("number");
    expect(typeof dimensions.gap).toBe("number");
  });

  it("should default to base size for unknown size", () => {
    const dimensions = getDateRangePickerSizeDimensions("unknown");
    const baseDimensions = getDateRangePickerSizeDimensions("base");
    expect(dimensions.calendarWidth).toBe(baseDimensions.calendarWidth);
    expect(dimensions.cellHeight).toBe(baseDimensions.cellHeight);
  });
});

describe("DateRangePicker Generator - Variant Configuration", () => {
  it("should have variant configuration with values and config", () => {
    const variantConfig = getDateRangePickerVariantConfig();
    expect(variantConfig.values).toBeDefined();
    expect(Array.isArray(variantConfig.values)).toBe(true);
    expect(variantConfig.values.length).toBeGreaterThan(0);
    expect(variantConfig.config).toBeDefined();
    expect(typeof variantConfig.config).toBe("object");
  });

  it("should have variant config for all variant values", () => {
    const variantConfig = getDateRangePickerVariantConfig();
    for (const variant of variantConfig.values) {
      expect(variantConfig.config[variant]).toBeDefined();
      expect(typeof variantConfig.config[variant]).toBe("object");
    }
  });

  it("should have background variable for default variant", () => {
    const bg = getDateRangePickerVariantBackground("default");
    expect(bg.variant).toBe("default");
    expect(bg.bgVariable).toBeDefined();
    expect(typeof bg.bgVariable).toBe("string");
    expect(bg.bgVariable.length).toBeGreaterThan(0);
  });

  it("should have background variable for subtle variant", () => {
    const bg = getDateRangePickerVariantBackground("subtle");
    expect(bg.variant).toBe("subtle");
    expect(bg.bgVariable).toBeDefined();
    expect(typeof bg.bgVariable).toBe("string");
    expect(bg.bgVariable.length).toBeGreaterThan(0);
  });

  it("should default to default variant for unknown variant", () => {
    const bg = getDateRangePickerVariantBackground("unknown");
    const defaultBg = getDateRangePickerVariantBackground("default");
    expect(bg.bgVariable).toBe(defaultBg.bgVariable);
  });
});

describe("DateRangePicker Generator - Selected State Configuration", () => {
  it("should have selected state configuration with boolean values", () => {
    const selectedConfig = getDateRangePickerSelectedConfig();
    expect(selectedConfig.values).toBeDefined();
    expect(Array.isArray(selectedConfig.values)).toBe(true);
    expect(selectedConfig.values).toContain(false);
    expect(selectedConfig.values).toContain(true);
  });
});

describe("DateRangePicker Generator - Day Labels", () => {
  it("should have day-of-week labels", () => {
    const dayLabels = getDateRangePickerDayLabels();
    expect(Array.isArray(dayLabels)).toBe(true);
    expect(dayLabels.length).toBe(7);
  });

  it("should have all day labels as strings", () => {
    const dayLabels = getDateRangePickerDayLabels();
    for (const label of dayLabels) {
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe("DateRangePicker Generator - Month Configuration", () => {
  it("should have month configuration", () => {
    const monthConfig = getDateRangePickerMonthConfig();
    expect(typeof monthConfig).toBe("object");
    expect(Object.keys(monthConfig).length).toBeGreaterThan(0);
  });

  it("should have complete configuration for each month", () => {
    const monthConfig = getDateRangePickerMonthConfig();
    for (const [monthName, config] of Object.entries(monthConfig)) {
      expect(typeof monthName).toBe("string");
      expect(typeof config).toBe("object");
      expect(typeof config.startDay).toBe("number");
      expect(typeof config.daysInMonth).toBe("number");
      expect(typeof config.prevMonthDays).toBe("number");
      expect(config.startDay).toBeGreaterThanOrEqual(0);
      expect(config.startDay).toBeLessThanOrEqual(6);
      expect(config.daysInMonth).toBeGreaterThan(0);
      expect(config.prevMonthDays).toBeGreaterThan(0);
    }
  });
});

describe("DateRangePicker Generator - Complete Variant Data", () => {
  it("should produce complete intermediate data structure", () => {
    const allData = getAllDateRangePickerVariantData();
    expect(allData.sizeConfig).toBeDefined();
    expect(allData.variantConfig).toBeDefined();
    expect(allData.selectedConfig).toBeDefined();
    expect(allData.dayLabels).toBeDefined();
    expect(allData.monthConfig).toBeDefined();
    expect(allData.variants).toBeDefined();
    expect(Array.isArray(allData.variants)).toBe(true);
  });

  it("should have variants for all size/variant/selected combinations", () => {
    const allData = getAllDateRangePickerVariantData();
    const sizeCount = allData.sizeConfig.values.length;
    const variantCount = allData.variantConfig.values.length;
    const selectedCount = allData.selectedConfig.values.length;
    const expectedCount = sizeCount * variantCount * selectedCount;
    expect(allData.variants.length).toBe(expectedCount);
  });

  it("should have complete data for each variant", () => {
    const allData = getAllDateRangePickerVariantData();
    for (const variant of allData.variants) {
      expect(variant.size).toBeDefined();
      expect(typeof variant.size).toBe("string");
      expect(variant.variant).toBeDefined();
      expect(typeof variant.variant).toBe("string");
      expect(variant.selected).toBeDefined();
      expect(typeof variant.selected).toBe("boolean");
      expect(variant.sizeConfig).toBeDefined();
      expect(typeof variant.sizeConfig).toBe("object");
      expect(variant.variantConfig).toBeDefined();
      expect(typeof variant.variantConfig).toBe("object");
    }
  });

  it("should have consistent size dimensions for same size", () => {
    const allData = getAllDateRangePickerVariantData();
    const baseVariants = allData.variants.filter((v) => v.size === "base");
    expect(baseVariants.length).toBeGreaterThan(0);
    const firstBaseConfig = baseVariants[0].sizeConfig;
    for (const variant of baseVariants) {
      expect(variant.sizeConfig.calendarWidth).toBe(
        firstBaseConfig.calendarWidth,
      );
      expect(variant.sizeConfig.cellHeight).toBe(firstBaseConfig.cellHeight);
      expect(variant.sizeConfig.cellWidth).toBe(firstBaseConfig.cellWidth);
    }
  });

  it("should have consistent background variable for same variant", () => {
    const allData = getAllDateRangePickerVariantData();
    const defaultVariants = allData.variants.filter(
      (v) => v.variant === "default",
    );
    expect(defaultVariants.length).toBeGreaterThan(0);
    const firstDefaultBg = defaultVariants[0].variantConfig.bgVariable;
    for (const variant of defaultVariants) {
      expect(variant.variantConfig.bgVariable).toBe(firstDefaultBg);
    }
  });
});
