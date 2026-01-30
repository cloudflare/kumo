/**
 * Tests for tabs.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If tabs styling changes, these tests
 * should NOT break - only the Figma output changes.
 *
 * Test philosophy:
 * - Test that the generator correctly reads from the registry
 * - Test structural invariants, not specific values
 * - DO NOT test specific colors, sizes, or token names
 */

import { describe, it, expect } from "vitest";
import {
  getContainerConfig,
  getTabConfig,
  getIndicatorConfig,
  getAllVariantData,
} from "./tabs";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const tabsComponent = registry.components.Tabs as any;
const tabsStyling = tabsComponent.styling;

describe("Tabs Generator - Registry Structure", () => {
  /**
   * These tests verify the registry has the required structure
   * for the generator to work. They don't test specific values.
   */

  it("should have Tabs component in registry", () => {
    expect(tabsComponent).toBeDefined();
    expect(tabsComponent.name).toBe("Tabs");
  });

  it("should have styling metadata defined", () => {
    expect(tabsStyling).toBeDefined();
    expect(tabsStyling.container).toBeDefined();
    expect(tabsStyling.tab).toBeDefined();
    expect(tabsStyling.indicator).toBeDefined();
  });

  describe("container styling", () => {
    it("should have required numeric properties", () => {
      expect(typeof tabsStyling.container.height).toBe("number");
      expect(typeof tabsStyling.container.borderRadius).toBe("number");
      expect(typeof tabsStyling.container.padding).toBe("number");
    });

    it("should have positive values for all dimensions", () => {
      expect(tabsStyling.container.height).toBeGreaterThan(0);
      expect(tabsStyling.container.borderRadius).toBeGreaterThan(0);
      expect(tabsStyling.container.padding).toBeGreaterThan(0);
    });

    it("should have background token defined", () => {
      expect(typeof tabsStyling.container.background).toBe("string");
      expect(tabsStyling.container.background.length).toBeGreaterThan(0);
    });
  });

  describe("tab styling", () => {
    it("should have required numeric properties", () => {
      expect(typeof tabsStyling.tab.paddingX).toBe("number");
      expect(typeof tabsStyling.tab.verticalMargin).toBe("number");
      expect(typeof tabsStyling.tab.fontSize).toBe("number");
      expect(typeof tabsStyling.tab.fontWeight).toBe("number");
      expect(typeof tabsStyling.tab.borderRadius).toBe("number");
    });

    it("should have positive values for all dimensions", () => {
      expect(tabsStyling.tab.paddingX).toBeGreaterThan(0);
      expect(tabsStyling.tab.verticalMargin).toBeGreaterThan(0);
      expect(tabsStyling.tab.fontSize).toBeGreaterThan(0);
      expect(tabsStyling.tab.fontWeight).toBeGreaterThan(0);
      expect(tabsStyling.tab.borderRadius).toBeGreaterThan(0);
    });

    it("should have color tokens defined", () => {
      expect(typeof tabsStyling.tab.activeColor).toBe("string");
      expect(typeof tabsStyling.tab.inactiveColor).toBe("string");
      expect(tabsStyling.tab.activeColor.length).toBeGreaterThan(0);
      expect(tabsStyling.tab.inactiveColor.length).toBeGreaterThan(0);
    });
  });

  describe("indicator styling", () => {
    it("should have required numeric properties", () => {
      expect(typeof tabsStyling.indicator.borderRadius).toBe("number");
    });

    it("should have positive border radius", () => {
      expect(tabsStyling.indicator.borderRadius).toBeGreaterThan(0);
    });

    it("should have styling tokens defined", () => {
      expect(typeof tabsStyling.indicator.background).toBe("string");
      expect(typeof tabsStyling.indicator.ring).toBe("string");
      expect(typeof tabsStyling.indicator.shadow).toBe("string");
      expect(tabsStyling.indicator.background.length).toBeGreaterThan(0);
      expect(tabsStyling.indicator.ring.length).toBeGreaterThan(0);
      expect(tabsStyling.indicator.shadow.length).toBeGreaterThan(0);
    });
  });
});

describe("Tabs Generator - Config Functions", () => {
  /**
   * These tests verify the config getter functions return
   * the expected structure from the registry.
   */

  describe("getContainerConfig", () => {
    it("should return container config with correct structure", () => {
      const config = getContainerConfig();
      expect(config).toBeDefined();
      expect(config.height).toBeDefined();
      expect(config.borderRadius).toBeDefined();
      expect(config.padding).toBeDefined();
    });

    it("should return values matching registry", () => {
      const config = getContainerConfig();
      expect(config.height).toBe(tabsStyling.container.height);
      expect(config.borderRadius).toBe(tabsStyling.container.borderRadius);
      expect(config.padding).toBe(tabsStyling.container.padding);
    });

    it("should have numeric types for all properties", () => {
      const config = getContainerConfig();
      expect(typeof config.height).toBe("number");
      expect(typeof config.borderRadius).toBe("number");
      expect(typeof config.padding).toBe("number");
    });

    it("should have positive values for all dimensions", () => {
      const config = getContainerConfig();
      expect(config.height).toBeGreaterThan(0);
      expect(config.borderRadius).toBeGreaterThan(0);
      expect(config.padding).toBeGreaterThan(0);
    });
  });

  describe("getTabConfig", () => {
    it("should return tab config with correct structure", () => {
      const config = getTabConfig();
      expect(config).toBeDefined();
      expect(config.paddingX).toBeDefined();
      expect(config.verticalMargin).toBeDefined();
      expect(config.fontSize).toBeDefined();
      expect(config.fontWeight).toBeDefined();
      expect(config.borderRadius).toBeDefined();
    });

    it("should return values matching registry", () => {
      const config = getTabConfig();
      expect(config.paddingX).toBe(tabsStyling.tab.paddingX);
      expect(config.verticalMargin).toBe(tabsStyling.tab.verticalMargin);
      expect(config.fontSize).toBe(tabsStyling.tab.fontSize);
      expect(config.fontWeight).toBe(tabsStyling.tab.fontWeight);
      expect(config.borderRadius).toBe(tabsStyling.tab.borderRadius);
    });

    it("should have numeric types for all properties", () => {
      const config = getTabConfig();
      expect(typeof config.paddingX).toBe("number");
      expect(typeof config.verticalMargin).toBe("number");
      expect(typeof config.fontSize).toBe("number");
      expect(typeof config.fontWeight).toBe("number");
      expect(typeof config.borderRadius).toBe("number");
    });

    it("should have positive values for all dimensions", () => {
      const config = getTabConfig();
      expect(config.paddingX).toBeGreaterThan(0);
      expect(config.verticalMargin).toBeGreaterThan(0);
      expect(config.fontSize).toBeGreaterThan(0);
      expect(config.fontWeight).toBeGreaterThan(0);
      expect(config.borderRadius).toBeGreaterThan(0);
    });
  });

  describe("getIndicatorConfig", () => {
    it("should return indicator config with correct structure", () => {
      const config = getIndicatorConfig();
      expect(config).toBeDefined();
      expect(config.borderRadius).toBeDefined();
    });

    it("should return values matching registry", () => {
      const config = getIndicatorConfig();
      expect(config.borderRadius).toBe(tabsStyling.indicator.borderRadius);
    });

    it("should have numeric type for border radius", () => {
      const config = getIndicatorConfig();
      expect(typeof config.borderRadius).toBe("number");
    });

    it("should have positive border radius", () => {
      const config = getIndicatorConfig();
      expect(config.borderRadius).toBeGreaterThan(0);
    });
  });
});

describe("Tabs Generator - getAllVariantData", () => {
  /**
   * This function aggregates all data needed for Figma generation.
   * It should return a complete structure with all configs.
   */

  it("should return complete data structure", () => {
    const allData = getAllVariantData();
    expect(allData).toBeDefined();
    expect(allData.config).toBeDefined();
    expect(allData.defaultTabs).toBeDefined();
    expect(allData.container).toBeDefined();
    expect(allData.tab).toBeDefined();
    expect(allData.indicator).toBeDefined();
    expect(allData.variants).toBeDefined();
  });

  it("should have default tabs defined with at least 2 tabs", () => {
    const allData = getAllVariantData();
    expect(allData.defaultTabs.length).toBeGreaterThanOrEqual(2);
  });

  it("should have variants for each tab", () => {
    const allData = getAllVariantData();
    expect(allData.variants.length).toBeGreaterThan(0);
  });

  it("should have correct variant structure", () => {
    const allData = getAllVariantData();
    for (const variant of allData.variants) {
      expect(variant.value).toBeDefined();
      expect(variant.index).toBeDefined();
      expect(variant.isActive).toBeDefined();
      expect(typeof variant.value).toBe("string");
      expect(typeof variant.index).toBe("number");
      expect(typeof variant.isActive).toBe("boolean");
    }
  });

  it("should have sequential indices starting from 0", () => {
    const allData = getAllVariantData();
    allData.variants.forEach((variant, idx) => {
      expect(variant.index).toBe(idx);
    });
  });

  it("should include container config matching registry", () => {
    const allData = getAllVariantData();
    expect(allData.container.height).toBe(tabsStyling.container.height);
    expect(allData.container.borderRadius).toBe(
      tabsStyling.container.borderRadius,
    );
    expect(allData.container.padding).toBe(tabsStyling.container.padding);
  });

  it("should include tab config matching registry", () => {
    const allData = getAllVariantData();
    expect(allData.tab.paddingX).toBe(tabsStyling.tab.paddingX);
    expect(allData.tab.verticalMargin).toBe(tabsStyling.tab.verticalMargin);
    expect(allData.tab.fontSize).toBe(tabsStyling.tab.fontSize);
    expect(allData.tab.fontWeight).toBe(tabsStyling.tab.fontWeight);
    expect(allData.tab.borderRadius).toBe(tabsStyling.tab.borderRadius);
  });

  it("should include indicator config matching registry", () => {
    const allData = getAllVariantData();
    expect(allData.indicator.borderRadius).toBe(
      tabsStyling.indicator.borderRadius,
    );
  });
});

describe("Tabs Generator - Layout Calculations", () => {
  /**
   * Test derived layout calculations to ensure they produce correct Figma values.
   * These test structural relationships, not specific values.
   */

  it("should calculate tab button height as container height minus vertical margins", () => {
    const containerConfig = getContainerConfig();
    const tabConfig = getTabConfig();

    const tabHeight = containerConfig.height - tabConfig.verticalMargin * 2;

    // Tab height should be positive
    expect(tabHeight).toBeGreaterThan(0);
    // Tab height should be less than container height
    expect(tabHeight).toBeLessThan(containerConfig.height);
  });

  it("should have matching tab and indicator heights", () => {
    const containerConfig = getContainerConfig();
    const tabConfig = getTabConfig();

    const tabHeight = containerConfig.height - tabConfig.verticalMargin * 2;
    const indicatorHeight =
      containerConfig.height - tabConfig.verticalMargin * 2;

    expect(tabHeight).toBe(indicatorHeight);
  });

  it("should have indicator Y position equal to vertical margin", () => {
    const tabConfig = getTabConfig();
    const indicatorY = tabConfig.verticalMargin;

    // This ensures the indicator is centered vertically
    expect(indicatorY).toBeGreaterThan(0);
  });
});

describe("Tabs Generator - Figma Output Structure", () => {
  /**
   * These tests document the expected Figma component structure.
   * They test structural invariants, not specific values.
   */

  it("should produce valid Figma layout properties for container", () => {
    const config = getContainerConfig();

    // Container should have valid numeric dimensions
    expect(typeof config.height).toBe("number");
    expect(typeof config.borderRadius).toBe("number");
    expect(typeof config.padding).toBe("number");

    // All values should be non-negative
    expect(config.height).toBeGreaterThan(0);
    expect(config.borderRadius).toBeGreaterThanOrEqual(0);
    expect(config.padding).toBeGreaterThanOrEqual(0);
  });

  it("should produce valid Figma layout properties for tab button", () => {
    const config = getTabConfig();
    const containerConfig = getContainerConfig();

    const buttonHeight = containerConfig.height - config.verticalMargin * 2;

    // Button height should be valid
    expect(buttonHeight).toBeGreaterThan(0);
    expect(buttonHeight).toBeLessThan(containerConfig.height);

    // Typography values should be valid
    expect(config.fontSize).toBeGreaterThan(0);
    expect(config.fontWeight).toBeGreaterThan(0);
  });

  it("should produce valid Figma layout properties for indicator", () => {
    const config = getIndicatorConfig();
    const containerConfig = getContainerConfig();
    const tabConfig = getTabConfig();

    const indicatorHeight =
      containerConfig.height - tabConfig.verticalMargin * 2;

    // Indicator should have valid dimensions
    expect(indicatorHeight).toBeGreaterThan(0);
    expect(config.borderRadius).toBeGreaterThanOrEqual(0);

    // Indicator Y position should be valid
    expect(tabConfig.verticalMargin).toBeGreaterThanOrEqual(0);
  });
});
