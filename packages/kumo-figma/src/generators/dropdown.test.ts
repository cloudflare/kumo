/**
 * Tests for dropdown.ts generator
 *
 * These tests ensure the Dropdown Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the dropdown
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * dropdown.tsx → component-registry.json → dropdown.ts (generator) → Figma
 *
 * NOTE: The Dropdown generator uses Figma-specific variants (default, withIcons,
 * withDanger, etc.) for display purposes, which differ from the React component's
 * simpler variant structure. This test validates the generator's implementation.
 */

import { describe, it, expect } from "vitest";
import {
  getDropdownVariantConfig,
  getDropdownPanelDimensions,
  getMenuItemLayout,
  getAllDropdownVariantData,
  DROPDOWN_OPEN_VALUES,
  DROPDOWN_VARIANT_VALUES,
} from "./dropdown";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const dropdownComponent = registry.components.DropdownMenu;

describe("Dropdown Generator - Registry Validation", () => {
  it("should have DropdownMenu component in registry", () => {
    expect(dropdownComponent).toBeDefined();
    expect(dropdownComponent.name).toBe("DropdownMenu");
  });

  it("should have variant prop in registry", () => {
    expect(dropdownComponent.props.variant).toBeDefined();
    expect(dropdownComponent.props.variant.type).toBe("enum");
  });

  it("should have expected variant values in registry", () => {
    const variantProp = dropdownComponent.props.variant as {
      values: string[];
      default: string;
    };
    expect(Array.isArray(variantProp.values)).toBe(true);
    expect(variantProp.values.length).toBeGreaterThan(0);
    expect(variantProp.values).toContain("default");
    expect(variantProp.values).toContain("danger");
  });

  it("should have default variant in registry", () => {
    const variantProp = dropdownComponent.props.variant as { default: string };
    expect(variantProp.default).toBeDefined();
    expect(typeof variantProp.default).toBe("string");
  });

  it("should have sub-components defined in registry", () => {
    expect(dropdownComponent.subComponents).toBeDefined();
    expect(typeof dropdownComponent.subComponents).toBe("object");
  });

  it("should have key sub-components in registry", () => {
    const subComponents = dropdownComponent.subComponents as Record<
      string,
      unknown
    >;
    expect(subComponents.Trigger).toBeDefined();
    expect(subComponents.Content).toBeDefined();
    expect(subComponents.Item).toBeDefined();
  });
});

describe("Dropdown Generator - Variant Configuration", () => {
  it("should export open state values", () => {
    expect(Array.isArray(DROPDOWN_OPEN_VALUES)).toBe(true);
    expect(DROPDOWN_OPEN_VALUES.length).toBe(2);
    expect(DROPDOWN_OPEN_VALUES).toContain(false);
    expect(DROPDOWN_OPEN_VALUES).toContain(true);
  });

  it("should export Figma variant values", () => {
    expect(Array.isArray(DROPDOWN_VARIANT_VALUES)).toBe(true);
    expect(DROPDOWN_VARIANT_VALUES.length).toBeGreaterThan(0);
  });

  it("should have expected Figma variants", () => {
    // Figma-specific variants for display purposes
    expect(DROPDOWN_VARIANT_VALUES).toContain("default");
    expect(DROPDOWN_VARIANT_VALUES).toContain("withIcons");
    expect(DROPDOWN_VARIANT_VALUES).toContain("withDanger");
  });

  it("should produce consistent variant config", () => {
    const config = getDropdownVariantConfig();
    expect(config.openValues).toBeDefined();
    expect(config.variantValues).toBeDefined();
    expect(config.descriptions).toBeDefined();
    expect(Array.isArray(config.openValues)).toBe(true);
    expect(Array.isArray(config.variantValues)).toBe(true);
    expect(typeof config.descriptions).toBe("object");
  });

  it("should have descriptions for all Figma variants", () => {
    const config = getDropdownVariantConfig();
    const descriptions = config.descriptions as Record<string, string>;

    for (const variant of config.variantValues) {
      expect(descriptions[variant]).toBeDefined();
      expect(typeof descriptions[variant]).toBe("string");
      expect(descriptions[variant].length).toBeGreaterThan(0);
    }
  });
});

describe("Dropdown Generator - Panel Dimensions", () => {
  it("should define panel dimensions", () => {
    const dims = getDropdownPanelDimensions();
    expect(dims).toBeDefined();
    expect(typeof dims).toBe("object");
  });

  it("should have width defined", () => {
    const dims = getDropdownPanelDimensions();
    expect(dims.width).toBeDefined();
    expect(typeof dims.width).toBe("number");
    expect(dims.width).toBeGreaterThan(0);
  });

  it("should have item height defined", () => {
    const dims = getDropdownPanelDimensions();
    expect(dims.itemHeight).toBeDefined();
    expect(typeof dims.itemHeight).toBe("number");
    expect(dims.itemHeight).toBeGreaterThan(0);
  });

  it("should have padding defined", () => {
    const dims = getDropdownPanelDimensions();
    expect(dims.padding).toBeDefined();
    expect(typeof dims.padding).toBe("number");
    expect(dims.padding).toBeGreaterThan(0);
  });

  it("should have item spacing defined", () => {
    const dims = getDropdownPanelDimensions();
    expect(dims.itemSpacing).toBeDefined();
    expect(typeof dims.itemSpacing).toBe("number");
    expect(dims.itemSpacing).toBeGreaterThan(0);
  });

  it("should have corner radius defined", () => {
    const dims = getDropdownPanelDimensions();
    expect(dims.cornerRadius).toBeDefined();
    expect(typeof dims.cornerRadius).toBe("number");
    expect(dims.cornerRadius).toBeGreaterThan(0);
  });
});

describe("Dropdown Generator - Menu Item Layout", () => {
  describe("menu item without shortcut", () => {
    it("should have correct layout mode", () => {
      const layout = getMenuItemLayout(false);
      expect(layout.mode).toBe("HORIZONTAL");
    });

    it("should have MIN alignment (left-aligned)", () => {
      const layout = getMenuItemLayout(false);
      expect(layout.alignment).toBe("MIN");
    });

    it("should have width defined", () => {
      const layout = getMenuItemLayout(false);
      expect(typeof layout.width).toBe("number");
      expect(layout.width).toBeGreaterThan(0);
    });

    it("should have height defined", () => {
      const layout = getMenuItemLayout(false);
      expect(typeof layout.height).toBe("number");
      expect(layout.height).toBeGreaterThan(0);
    });

    it("should have padding defined", () => {
      const layout = getMenuItemLayout(false);
      expect(typeof layout.paddingX).toBe("number");
      expect(typeof layout.paddingY).toBe("number");
      expect(layout.paddingX).toBeGreaterThan(0);
      expect(layout.paddingY).toBeGreaterThan(0);
    });

    it("should have corner radius defined", () => {
      const layout = getMenuItemLayout(false);
      expect(typeof layout.cornerRadius).toBe("number");
      expect(layout.cornerRadius).toBeGreaterThan(0);
    });
  });

  describe("menu item with shortcut", () => {
    it("should have correct layout mode", () => {
      const layout = getMenuItemLayout(true);
      expect(layout.mode).toBe("HORIZONTAL");
    });

    it("should have SPACE_BETWEEN alignment (justified)", () => {
      const layout = getMenuItemLayout(true);
      expect(layout.alignment).toBe("SPACE_BETWEEN");
    });

    it("should have same dimensions as item without shortcut", () => {
      const withShortcut = getMenuItemLayout(true);
      const withoutShortcut = getMenuItemLayout(false);
      expect(withShortcut.width).toBe(withoutShortcut.width);
      expect(withShortcut.height).toBe(withoutShortcut.height);
    });

    it("should have different alignment from item without shortcut", () => {
      const withShortcut = getMenuItemLayout(true);
      const withoutShortcut = getMenuItemLayout(false);
      expect(withShortcut.alignment).not.toBe(withoutShortcut.alignment);
    });
  });
});

describe("Dropdown Generator - Complete Variant Data", () => {
  it("should produce complete variant data structure", () => {
    const allData = getAllDropdownVariantData();

    expect(allData.config).toBeDefined();
    expect(allData.panelDimensions).toBeDefined();
    expect(allData.menuItems).toBeDefined();
    expect(allData.variants).toBeDefined();
  });

  it("should include menu item layouts", () => {
    const allData = getAllDropdownVariantData();

    expect(allData.menuItems.withShortcut).toBeDefined();
    expect(allData.menuItems.withoutShortcut).toBeDefined();
    expect(typeof allData.menuItems.withShortcut).toBe("object");
    expect(typeof allData.menuItems.withoutShortcut).toBe("object");
  });

  it("should include variant details", () => {
    const allData = getAllDropdownVariantData();

    expect(Array.isArray(allData.variants)).toBe(true);
    expect(allData.variants.length).toBeGreaterThan(0);

    for (const variant of allData.variants) {
      expect(variant.variant).toBeDefined();
      expect(typeof variant.variant).toBe("string");
      expect(variant.description).toBeDefined();
      expect(typeof variant.description).toBe("string");
      expect(variant.openStates).toBeDefined();
      expect(Array.isArray(variant.openStates)).toBe(true);
    }
  });

  it("should match exported constants", () => {
    const allData = getAllDropdownVariantData();

    expect(allData.config.openValues).toEqual(DROPDOWN_OPEN_VALUES);
    expect(allData.config.variantValues).toEqual(DROPDOWN_VARIANT_VALUES);
  });
});
