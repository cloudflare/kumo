/**
 * Tests for table.ts component generator
 *
 * These tests ensure the Table Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the table
 * generator, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * table.tsx → component-registry.json → table.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getTableComponentConfig,
  getTableLayoutConfig,
  getTableRowVariantConfig,
  getTableCellConfig,
  getTableHeaderConfig,
  getTableBodyCellConfig,
  getTableSelectedRowConfig,
  getTableCheckboxCellConfig,
  getTableCompleteConfig,
  TABLE_CONFIGS_EXPORT,
  TABLE_LAYOUT_VALUES,
  TABLE_VARIANT_VALUES,
} from "./table";
import { FONT_SIZE, FALLBACK_VALUES, BORDER_RADIUS } from "./shared";
import themeData from "../generated/theme-data.json";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

// Use type assertion for Table component
const tableComponent = (registry.components as Record<string, unknown>)
  .Table as {
  name: string;
  description: string;
  props: {
    layout: {
      type: string;
      values: string[];
      default: string;
      descriptions: Record<string, string>;
    };
    variant: {
      type: string;
      values: string[];
      default: string;
      descriptions: Record<string, string>;
    };
  };
  colors: string[];
  subComponents: Record<string, unknown>;
};

describe("Table Generator - Registry Validation", () => {
  it("should have Table component in registry", () => {
    expect(tableComponent).toBeDefined();
    expect(tableComponent.name).toBe("Table");
  });

  it("should have layout prop with expected values", () => {
    const layoutProp = tableComponent.props.layout;
    expect(layoutProp.values).toContain("auto");
    expect(layoutProp.values).toContain("fixed");
    expect(layoutProp.default).toBe("auto");
  });

  it("should have variant prop with expected values", () => {
    const variantProp = tableComponent.props.variant;
    expect(variantProp.values).toContain("default");
    expect(variantProp.values).toContain("selected");
    expect(variantProp.default).toBe("default");
  });

  it("should have colors in registry", () => {
    expect(Array.isArray(tableComponent.colors)).toBe(true);
    expect(tableComponent.colors.length).toBeGreaterThan(0);
    // All colors should use kumo semantic tokens
    for (const color of tableComponent.colors) {
      expect(color).toMatch(/kumo/);
    }
  });

  it("should have expected sub-components", () => {
    const subComponents = Object.keys(tableComponent.subComponents);
    expect(subComponents).toContain("Header");
    expect(subComponents).toContain("Head");
    expect(subComponents).toContain("Row");
    expect(subComponents).toContain("Body");
    expect(subComponents).toContain("Cell");
    expect(subComponents).toContain("Footer");
  });
});

describe("Table Generator - Component Config", () => {
  it("should return valid component config", () => {
    const config = getTableComponentConfig();

    expect(config.name).toBe("Table");
    expect(config.description).toBeDefined();
    expect(config.props).toBeDefined();
    expect(Array.isArray(config.colors)).toBe(true);
    expect(config.colors.length).toBeGreaterThan(0);
    expect(config.subComponents.length).toBeGreaterThan(0);
  });
});

describe("Table Generator - Layout Config", () => {
  it("should return valid layout config from registry", () => {
    const config = getTableLayoutConfig();

    expect(config.values).toContain("auto");
    expect(config.values).toContain("fixed");
    expect(config.default).toBe("auto");
    expect(config.descriptions.auto).toBeDefined();
    expect(config.descriptions.fixed).toBeDefined();
  });

  it("should match registry layout values", () => {
    expect(TABLE_LAYOUT_VALUES).toEqual(tableComponent.props.layout.values);
  });
});

describe("Table Generator - Row Variant Config", () => {
  it("should return valid row variant config from registry", () => {
    const config = getTableRowVariantConfig();

    expect(config.values).toContain("default");
    expect(config.values).toContain("selected");
    expect(config.default).toBe("default");
    expect(config.descriptions.default).toBeDefined();
    expect(config.descriptions.selected).toBeDefined();
  });

  it("should match registry variant values", () => {
    expect(TABLE_VARIANT_VALUES).toEqual(tableComponent.props.variant.values);
  });
});

describe("Table Generator - Cell Config", () => {
  it("should return valid cell config structure", () => {
    const config = getTableCellConfig();

    expect(typeof config.padding).toBe("number");
    expect(typeof config.borderWidth).toBe("number");
    expect(typeof config.borderVariable).toBe("string");
  });

  it("should use numeric values from theme", () => {
    const config = getTableCellConfig();
    expect(config.padding).toBe(themeData.tailwind.spacing.scale["3"]);
    expect(config.borderWidth).toBe(FALLBACK_VALUES.strokeWeight);
  });

  it("should use kumo semantic border variable", () => {
    const config = getTableCellConfig();
    expect(config.borderVariable).toMatch(/^color-kumo-/);
  });
});

describe("Table Generator - Header Config", () => {
  it("should return valid header config structure", () => {
    const config = getTableHeaderConfig();

    expect(config.fontSize).toBe(FONT_SIZE.base);
    expect(config.fontWeight).toBe(FALLBACK_VALUES.fontWeight.semiBold);
    expect(typeof config.textVariable).toBe("string");
    expect(typeof config.bgVariable).toBe("string");
  });

  it("should use kumo semantic color tokens", () => {
    const config = getTableHeaderConfig();
    expect(config.textVariable).toMatch(/^text-color-kumo-/);
    expect(config.bgVariable).toMatch(/^color-kumo-/);
  });
});

describe("Table Generator - Body Cell Config", () => {
  it("should return valid body cell config structure", () => {
    const config = getTableBodyCellConfig();

    expect(config.fontSize).toBe(FONT_SIZE.base);
    expect(config.fontWeight).toBe(FALLBACK_VALUES.fontWeight.normal);
    expect(typeof config.textVariable).toBe("string");
  });

  it("should use kumo semantic text color", () => {
    const config = getTableBodyCellConfig();
    expect(config.textVariable).toMatch(/^text-color-kumo-/);
  });
});

describe("Table Generator - Selected Row Config", () => {
  it("should return valid selected row config", () => {
    const config = getTableSelectedRowConfig();

    expect(typeof config.bgVariable).toBe("string");
    expect(config.bgVariable).toMatch(/^color-kumo-/);
  });
});

describe("Table Generator - Checkbox Cell Config", () => {
  it("should return valid checkbox cell config structure", () => {
    const config = getTableCheckboxCellConfig();

    expect(config.boxSize).toBe(themeData.tailwind.spacing.scale["4"]);
    expect(config.borderRadius).toBe(BORDER_RADIUS.sm);
    expect(typeof config.uncheckedBgVariable).toBe("string");
    expect(typeof config.checkedBgVariable).toBe("string");
    expect(typeof config.borderVariable).toBe("string");
    expect(typeof config.iconName).toBe("string");
    expect(config.iconSize).toBe(FONT_SIZE.xs);
    expect(typeof config.iconColor).toBe("string");
  });

  it("should use kumo semantic color tokens", () => {
    const config = getTableCheckboxCellConfig();
    expect(config.uncheckedBgVariable).toMatch(/^color-kumo-/);
    expect(config.checkedBgVariable).toMatch(/^color-kumo-/);
    expect(config.borderVariable).toMatch(/^color-kumo-/);
  });

  it("should use phosphor icon", () => {
    const config = getTableCheckboxCellConfig();
    expect(config.iconName).toMatch(/^ph-/);
  });

  it("should have different colors for checked vs unchecked state", () => {
    const config = getTableCheckboxCellConfig();
    expect(config.checkedBgVariable).not.toBe(config.uncheckedBgVariable);
  });
});

describe("Table Generator - Complete Config", () => {
  it("should return config for auto layout without selection", () => {
    const config = getTableCompleteConfig({
      layout: "auto",
      hasSelectedRow: false,
    });

    expect(config.layout).toBe("auto");
    expect(config.hasSelectedRow).toBe(false);
    expect(config.cellConfig).toBeDefined();
    expect(config.headerConfig).toBeDefined();
    expect(config.bodyCellConfig).toBeDefined();
    expect(config.selectedRowConfig).toBeNull();
    expect(config.sampleData).toBeDefined();
  });

  it("should return config for auto layout with selection", () => {
    const config = getTableCompleteConfig({
      layout: "auto",
      hasSelectedRow: true,
    });

    expect(config.layout).toBe("auto");
    expect(config.hasSelectedRow).toBe(true);
    expect(config.selectedRowConfig).not.toBeNull();
    expect(typeof config.selectedRowConfig?.bgVariable).toBe("string");
    expect(config.selectedRowConfig?.bgVariable).toMatch(/^color-kumo-/);
  });

  it("should return config for fixed layout without selection", () => {
    const config = getTableCompleteConfig({
      layout: "fixed",
      hasSelectedRow: false,
    });

    expect(config.layout).toBe("fixed");
    expect(config.hasSelectedRow).toBe(false);
    expect(config.selectedRowConfig).toBeNull();
  });

  it("should return config for fixed layout with selection", () => {
    const config = getTableCompleteConfig({
      layout: "fixed",
      hasSelectedRow: true,
    });

    expect(config.layout).toBe("fixed");
    expect(config.hasSelectedRow).toBe(true);
    expect(config.selectedRowConfig).not.toBeNull();
  });

  it("should include sample data with headers and rows", () => {
    const config = getTableCompleteConfig({
      layout: "auto",
      hasSelectedRow: false,
    });

    expect(config.sampleData.headers.length).toBe(3);
    expect(config.sampleData.rows.length).toBe(3);
    expect(config.sampleData.headers).toEqual(["Name", "Status", "Type"]);
  });
});

describe("Table Generator - Variant Configurations", () => {
  it("should have 4 table configurations", () => {
    expect(TABLE_CONFIGS_EXPORT.length).toBe(4);
  });

  it("should have all combinations of layout and hasSelectedRow", () => {
    const configs = TABLE_CONFIGS_EXPORT;

    // auto layout, no selection
    expect(configs).toContainEqual({ layout: "auto", hasSelectedRow: false });

    // auto layout, with selection
    expect(configs).toContainEqual({ layout: "auto", hasSelectedRow: true });

    // fixed layout, no selection
    expect(configs).toContainEqual({ layout: "fixed", hasSelectedRow: false });

    // fixed layout, with selection
    expect(configs).toContainEqual({ layout: "fixed", hasSelectedRow: true });
  });
});
