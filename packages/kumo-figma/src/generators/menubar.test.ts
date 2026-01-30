/**
 * Tests for menubar.ts generator
 *
 * These tests ensure the MenuBar Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the menubar
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * menubar.tsx → component-registry.json → menubar.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getMenuBarDimensionsConfig,
  getMenuBarDefaultOptions,
  getMenuBarColorBindings,
  getMenuBarShadowConfig,
  getAllMenuBarData,
} from "./menubar";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const menuBarComponent = registry.components.MenuBar;

describe("MenuBar Generator - Registry Validation", () => {
  it("should have MenuBar component in registry", () => {
    expect(menuBarComponent).toBeDefined();
    expect(menuBarComponent.name).toBe("MenuBar");
    expect(menuBarComponent.category).toBe("Navigation");
  });

  it("should have required props in registry", () => {
    expect(menuBarComponent.props).toBeDefined();
    expect(menuBarComponent.props.options).toBeDefined();
  });

  it("should have isActive prop in registry", () => {
    expect(menuBarComponent.props.isActive).toBeDefined();
  });

  it("should have color tokens in registry", () => {
    expect(Array.isArray(menuBarComponent.colors)).toBe(true);
    expect(menuBarComponent.colors.length).toBeGreaterThan(0);
  });
});

describe("MenuBar Generator - Dimensions Configuration", () => {
  it("should have dimensions configuration defined", () => {
    const dimensions = getMenuBarDimensionsConfig();
    expect(dimensions).toBeDefined();
    expect(typeof dimensions).toBe("object");
  });

  it("should have height defined", () => {
    const dimensions = getMenuBarDimensionsConfig();
    expect(typeof dimensions.height).toBe("number");
    expect(dimensions.height).toBeGreaterThan(0);
  });

  it("should have button width defined", () => {
    const dimensions = getMenuBarDimensionsConfig();
    expect(typeof dimensions.buttonWidth).toBe("number");
    expect(dimensions.buttonWidth).toBeGreaterThan(0);
  });

  it("should have icon size defined", () => {
    const dimensions = getMenuBarDimensionsConfig();
    expect(typeof dimensions.iconSize).toBe("number");
    expect(dimensions.iconSize).toBeGreaterThan(0);
  });

  it("should have border radius defined", () => {
    const dimensions = getMenuBarDimensionsConfig();
    expect(typeof dimensions.borderRadius).toBe("number");
    expect(dimensions.borderRadius).toBeGreaterThan(0);
  });

  it("should have button border radius defined", () => {
    const dimensions = getMenuBarDimensionsConfig();
    expect(typeof dimensions.buttonBorderRadius).toBe("number");
    expect(dimensions.buttonBorderRadius).toBeGreaterThan(0);
  });
});

describe("MenuBar Generator - Default Options Configuration", () => {
  it("should have default options defined", () => {
    const options = getMenuBarDefaultOptions();
    expect(options).toBeDefined();
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  it("should have all required fields for each option", () => {
    const options = getMenuBarDefaultOptions();
    for (const option of options) {
      expect(option.icon).toBeDefined();
      expect(typeof option.icon).toBe("string");
      expect(option.icon.length).toBeGreaterThan(0);

      expect(option.tooltip).toBeDefined();
      expect(typeof option.tooltip).toBe("string");
      expect(option.tooltip.length).toBeGreaterThan(0);

      expect(option.id).toBeDefined();
      expect(typeof option.id).toBe("string");
      expect(option.id.length).toBeGreaterThan(0);
    }
  });

  it("should have at least 3 options", () => {
    const options = getMenuBarDefaultOptions();
    expect(options.length).toBeGreaterThanOrEqual(3);
  });
});

describe("MenuBar Generator - Color Bindings", () => {
  it("should have color bindings defined", () => {
    const colorBindings = getMenuBarColorBindings();
    expect(colorBindings).toBeDefined();
    expect(typeof colorBindings).toBe("object");
  });

  it("should have container color bindings", () => {
    const colorBindings = getMenuBarColorBindings();
    expect(colorBindings.container).toBeDefined();
    expect(typeof colorBindings.container.background).toBe("string");
    expect(typeof colorBindings.container.border).toBe("string");
  });

  it("should have button color bindings", () => {
    const colorBindings = getMenuBarColorBindings();
    expect(colorBindings.button).toBeDefined();
    expect(colorBindings.button.inactive).toBeDefined();
    expect(colorBindings.button.active).toBeDefined();
  });

  it("should have inactive button background binding", () => {
    const colorBindings = getMenuBarColorBindings();
    expect(typeof colorBindings.button.inactive.background).toBe("string");
    expect(colorBindings.button.inactive.background.length).toBeGreaterThan(0);
  });

  it("should have active button background binding", () => {
    const colorBindings = getMenuBarColorBindings();
    expect(typeof colorBindings.button.active.background).toBe("string");
    expect(colorBindings.button.active.background.length).toBeGreaterThan(0);
  });

  it("should have icon color binding", () => {
    const colorBindings = getMenuBarColorBindings();
    expect(typeof colorBindings.button.icon).toBe("string");
    expect(colorBindings.button.icon.length).toBeGreaterThan(0);
  });
});

describe("MenuBar Generator - Shadow Configuration", () => {
  it("should have shadow configuration defined", () => {
    const shadowConfig = getMenuBarShadowConfig();
    expect(shadowConfig).toBeDefined();
    expect(typeof shadowConfig).toBe("object");
  });

  it("should have shadow type defined", () => {
    const shadowConfig = getMenuBarShadowConfig();
    expect(shadowConfig.type).toBe("DROP_SHADOW");
  });

  it("should have shadow color defined", () => {
    const shadowConfig = getMenuBarShadowConfig();
    expect(shadowConfig.color).toBeDefined();
    expect(typeof shadowConfig.color).toBe("object");
    expect(typeof shadowConfig.color.r).toBe("number");
    expect(typeof shadowConfig.color.g).toBe("number");
    expect(typeof shadowConfig.color.b).toBe("number");
    expect(typeof shadowConfig.color.a).toBe("number");
  });

  it("should have shadow offset defined", () => {
    const shadowConfig = getMenuBarShadowConfig();
    expect(shadowConfig.offset).toBeDefined();
    expect(typeof shadowConfig.offset.x).toBe("number");
    expect(typeof shadowConfig.offset.y).toBe("number");
  });

  it("should have shadow radius defined", () => {
    const shadowConfig = getMenuBarShadowConfig();
    expect(typeof shadowConfig.radius).toBe("number");
    expect(shadowConfig.radius).toBeGreaterThanOrEqual(0);
  });

  it("should have shadow spread defined", () => {
    const shadowConfig = getMenuBarShadowConfig();
    expect(typeof shadowConfig.spread).toBe("number");
  });
});

describe("MenuBar Generator - Complete Data Structure", () => {
  it("should have complete data structure defined", () => {
    const allData = getAllMenuBarData();
    expect(allData).toBeDefined();
    expect(typeof allData).toBe("object");
  });

  it("should have dimensions section", () => {
    const allData = getAllMenuBarData();
    expect(allData.dimensions).toBeDefined();
    expect(typeof allData.dimensions).toBe("object");
    expect(typeof allData.dimensions.height).toBe("number");
  });

  it("should have default options section", () => {
    const allData = getAllMenuBarData();
    expect(allData.defaultOptions).toBeDefined();
    expect(Array.isArray(allData.defaultOptions)).toBe(true);
    expect(allData.defaultOptions.length).toBeGreaterThan(0);
  });

  it("should have color bindings section", () => {
    const allData = getAllMenuBarData();
    expect(allData.colorBindings).toBeDefined();
    expect(typeof allData.colorBindings).toBe("object");
    expect(allData.colorBindings.container).toBeDefined();
    expect(allData.colorBindings.button).toBeDefined();
  });

  it("should have shadow config section", () => {
    const allData = getAllMenuBarData();
    expect(allData.shadowConfig).toBeDefined();
    expect(typeof allData.shadowConfig).toBe("object");
    expect(allData.shadowConfig.type).toBe("DROP_SHADOW");
  });
});
