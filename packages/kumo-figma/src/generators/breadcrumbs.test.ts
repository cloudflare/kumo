/**
 * Breadcrumbs Generator Tests
 *
 * Tests the Breadcrumbs generator configuration and data structure.
 * Follows the structural + snapshot testing pattern from badge.test.ts.
 */

import { describe, it, expect } from "vitest";
import {
  getBreadcrumbsSizeConfig,
  getBreadcrumbsParsedSizeStyles,
  getBreadcrumbsColorBindings,
  getBreadcrumbsSeparatorConfig,
  getAllBreadcrumbsData,
} from "./breadcrumbs";
import registry from "@cloudflare/kumo/ai/component-registry.json";

describe("Breadcrumbs Generator - Registry Validation", () => {
  it("should exist in registry", () => {
    expect(registry.components.Breadcrumbs).toBeDefined();
  });

  it("should have size prop in registry", () => {
    const breadcrumbsComponent = registry.components.Breadcrumbs;
    expect(breadcrumbsComponent.props.size).toBeDefined();
  });

  it("should have size values in registry", () => {
    const breadcrumbsComponent = registry.components.Breadcrumbs;
    const sizeProp = breadcrumbsComponent.props.size as { values?: string[] };
    expect(sizeProp.values).toBeDefined();
    if (sizeProp.values) {
      expect(Array.isArray(sizeProp.values)).toBe(true);
      expect(sizeProp.values.length).toBeGreaterThan(0);
    }
  });

  it("should have size classes in registry", () => {
    const breadcrumbsComponent = registry.components.Breadcrumbs;
    const sizeProp = breadcrumbsComponent.props.size as {
      classes?: Record<string, string>;
    };
    expect(sizeProp.classes).toBeDefined();
    expect(typeof sizeProp.classes).toBe("object");
  });

  it("should have subComponents in registry", () => {
    const breadcrumbsComponent = registry.components.Breadcrumbs;
    expect(breadcrumbsComponent.subComponents).toBeDefined();
    expect(breadcrumbsComponent.subComponents.Link).toBeDefined();
    expect(breadcrumbsComponent.subComponents.Current).toBeDefined();
    expect(breadcrumbsComponent.subComponents.Separator).toBeDefined();
  });
});

describe("Breadcrumbs Generator - Size Configuration", () => {
  it("should have size config defined", () => {
    const config = getBreadcrumbsSizeConfig();
    expect(config).toBeDefined();
    expect(config.values).toBeDefined();
    expect(config.classes).toBeDefined();
    expect(config.descriptions).toBeDefined();
    expect(config.default).toBeDefined();
  });

  it("should have all sizes with classes", () => {
    const config = getBreadcrumbsSizeConfig();
    config.values.forEach((size) => {
      expect(config.classes[size]).toBeDefined();
      expect(typeof config.classes[size]).toBe("string");
      expect(config.classes[size].length).toBeGreaterThan(0);
    });
  });

  it("should have all sizes with descriptions", () => {
    const config = getBreadcrumbsSizeConfig();
    config.values.forEach((size) => {
      expect(config.descriptions[size]).toBeDefined();
      expect(typeof config.descriptions[size]).toBe("string");
    });
  });
});

describe("Breadcrumbs Generator - Parsed Size Styles", () => {
  it("should parse sm size styles", () => {
    const parsed = getBreadcrumbsParsedSizeStyles("sm");
    expect(parsed).toBeDefined();
    expect(parsed.size).toBe("sm");
    expect(parsed.classes).toBeDefined();
    expect(parsed.parsed).toBeDefined();
  });

  it("should parse base size styles", () => {
    const parsed = getBreadcrumbsParsedSizeStyles("base");
    expect(parsed).toBeDefined();
    expect(parsed.size).toBe("base");
    expect(parsed.classes).toBeDefined();
    expect(parsed.parsed).toBeDefined();
  });

  it("should have height in parsed styles", () => {
    const smParsed = getBreadcrumbsParsedSizeStyles("sm");
    const baseParsed = getBreadcrumbsParsedSizeStyles("base");

    // Parser should extract height from h-10 (40px) and h-12 (48px)
    expect(smParsed.parsed.height).toBeDefined();
    expect(baseParsed.parsed.height).toBeDefined();
  });

  it("should have gap in parsed styles", () => {
    const smParsed = getBreadcrumbsParsedSizeStyles("sm");
    const baseParsed = getBreadcrumbsParsedSizeStyles("base");

    // Parser should extract gap from gap-0.5 and gap-1
    expect(smParsed.parsed.gap).toBeDefined();
    expect(baseParsed.parsed.gap).toBeDefined();
  });

  it("should have fontSize in parsed styles", () => {
    const smParsed = getBreadcrumbsParsedSizeStyles("sm");
    const baseParsed = getBreadcrumbsParsedSizeStyles("base");

    // Parser should extract fontSize from text-sm and text-base
    expect(smParsed.parsed.fontSize).toBeDefined();
    expect(baseParsed.parsed.fontSize).toBeDefined();
  });
});

describe("Breadcrumbs Generator - Color Bindings", () => {
  it("should have color bindings defined", () => {
    const bindings = getBreadcrumbsColorBindings();
    expect(bindings).toBeDefined();
    expect(bindings.link).toBeDefined();
    expect(bindings.current).toBeDefined();
    expect(bindings.separator).toBeDefined();
  });

  it("should have string values for all color bindings", () => {
    const bindings = getBreadcrumbsColorBindings();
    expect(typeof bindings.link).toBe("string");
    expect(typeof bindings.current).toBe("string");
    expect(typeof bindings.separator).toBe("string");
  });

  it("should use semantic kumo color tokens", () => {
    const bindings = getBreadcrumbsColorBindings();
    // Verify tokens follow the kumo semantic pattern without hardcoding exact values
    expect(bindings.link).toMatch(/^text-color-kumo-/);
    expect(bindings.current).toMatch(/^text-color-kumo-/);
    expect(bindings.separator).toMatch(/^text-color-kumo-/);
  });

  it("should have different colors for link and current states", () => {
    const bindings = getBreadcrumbsColorBindings();
    // Current item should be visually distinct from link items
    expect(bindings.link).not.toBe(bindings.current);
  });
});

describe("Breadcrumbs Generator - Separator Configuration", () => {
  it("should have separator config defined", () => {
    const config = getBreadcrumbsSeparatorConfig();
    expect(config).toBeDefined();
    expect(config.iconName).toBeDefined();
    expect(config.size).toBeDefined();
  });

  it("should use a phosphor icon", () => {
    const config = getBreadcrumbsSeparatorConfig();
    // Verify icon follows phosphor naming convention
    expect(config.iconName).toMatch(/^ph-/);
  });

  it("should have numeric size", () => {
    const config = getBreadcrumbsSeparatorConfig();
    expect(typeof config.size).toBe("number");
    expect(config.size).toBeGreaterThan(0);
  });
});

describe("Breadcrumbs Generator - Complete Data Structure", () => {
  it("should have all data defined", () => {
    const allData = getAllBreadcrumbsData();
    expect(allData).toBeDefined();
    expect(allData.sizeConfig).toBeDefined();
    expect(allData.sizes).toBeDefined();
    expect(allData.colorBindings).toBeDefined();
    expect(allData.separatorConfig).toBeDefined();
  });

  it("should have sizes array matching size config", () => {
    const allData = getAllBreadcrumbsData();
    expect(allData.sizes.length).toBe(allData.sizeConfig.values.length);
  });

  it("should have layout data for each size", () => {
    const allData = getAllBreadcrumbsData();
    allData.sizes.forEach((size) => {
      expect(size.layout).toBeDefined();
      expect(size.layout.height).toBeDefined();
      expect(size.layout.gap).toBeDefined();
      expect(size.layout.fontSize).toBeDefined();
      expect(size.layout.itemGap).toBeDefined();
    });
  });

  it("should have numeric layout dimensions", () => {
    const allData = getAllBreadcrumbsData();
    allData.sizes.forEach((size) => {
      expect(typeof size.layout.height).toBe("number");
      expect(typeof size.layout.gap).toBe("number");
      expect(typeof size.layout.fontSize).toBe("number");
      expect(typeof size.layout.itemGap).toBe("number");
    });
  });

  it("should have sm size smaller than base size", () => {
    const allData = getAllBreadcrumbsData();
    const smSize = allData.sizes.find((s) => s.size === "sm");
    const baseSize = allData.sizes.find((s) => s.size === "base");

    if (smSize && baseSize) {
      expect(smSize.layout.height).toBeLessThan(baseSize.layout.height);
      expect(smSize.layout.fontSize).toBeLessThanOrEqual(
        baseSize.layout.fontSize,
      );
    }
  });
});
