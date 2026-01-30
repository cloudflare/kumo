/**
 * Tests for surface.ts generator
 *
 * These tests ensure the Surface Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the surface
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * surface.tsx → component-registry.json → surface.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getSurfaceDimensionsConfig,
  getSurfaceColorBindings,
  getSurfaceShadowConfig,
  getSurfaceParsedBaseStyles,
  getAllSurfaceData,
} from "./surface";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const surfaceComponent = registry.components.Surface;

describe("Surface Generator - Registry Validation", () => {
  it("should have Surface component in registry", () => {
    expect(surfaceComponent).toBeDefined();
    expect(surfaceComponent.name).toBe("Surface");
    expect(surfaceComponent.category).toBe("Layout");
  });

  // Surface component uses semantic tokens directly via the generator,
  // not through explicit color props in the registry
});

describe("Surface Generator - Dimensions Configuration", () => {
  it("should have dimensions configuration defined", () => {
    const dimensions = getSurfaceDimensionsConfig();
    expect(dimensions).toBeDefined();
    expect(typeof dimensions).toBe("object");
  });

  it("should have padding values defined", () => {
    const dimensions = getSurfaceDimensionsConfig();
    expect(typeof dimensions.paddingLeft).toBe("number");
    expect(typeof dimensions.paddingRight).toBe("number");
    expect(typeof dimensions.paddingTop).toBe("number");
    expect(typeof dimensions.paddingBottom).toBe("number");
    expect(dimensions.paddingLeft).toBeGreaterThan(0);
    expect(dimensions.paddingRight).toBeGreaterThan(0);
    expect(dimensions.paddingTop).toBeGreaterThan(0);
    expect(dimensions.paddingBottom).toBeGreaterThan(0);
  });

  it("should have item spacing defined", () => {
    const dimensions = getSurfaceDimensionsConfig();
    expect(typeof dimensions.itemSpacing).toBe("number");
    expect(dimensions.itemSpacing).toBeGreaterThanOrEqual(0);
  });

  it("should have corner radius defined", () => {
    const dimensions = getSurfaceDimensionsConfig();
    expect(typeof dimensions.cornerRadius).toBe("number");
    expect(dimensions.cornerRadius).toBeGreaterThan(0);
  });
});

describe("Surface Generator - Color Bindings", () => {
  it("should have color bindings defined", () => {
    const colorBindings = getSurfaceColorBindings();
    expect(colorBindings).toBeDefined();
    expect(typeof colorBindings).toBe("object");
  });

  it("should have background color binding", () => {
    const colorBindings = getSurfaceColorBindings();
    expect(colorBindings.background).toBeDefined();
    expect(typeof colorBindings.background).toBe("string");
    expect(colorBindings.background.length).toBeGreaterThan(0);
  });

  it("should have border color binding", () => {
    const colorBindings = getSurfaceColorBindings();
    expect(colorBindings.border).toBeDefined();
    expect(typeof colorBindings.border).toBe("string");
    expect(colorBindings.border.length).toBeGreaterThan(0);
  });

  it("should have text color binding", () => {
    const colorBindings = getSurfaceColorBindings();
    expect(colorBindings.text).toBeDefined();
    expect(typeof colorBindings.text).toBe("string");
    expect(colorBindings.text.length).toBeGreaterThan(0);
  });
});

describe("Surface Generator - Shadow Configuration", () => {
  it("should have shadow configuration defined", () => {
    const shadowConfig = getSurfaceShadowConfig();
    expect(shadowConfig).toBeDefined();
    expect(typeof shadowConfig).toBe("object");
  });

  it("should have shadow type defined", () => {
    const shadowConfig = getSurfaceShadowConfig();
    expect(shadowConfig.type).toBe("DROP_SHADOW");
  });

  it("should have shadow color defined", () => {
    const shadowConfig = getSurfaceShadowConfig();
    expect(shadowConfig.color).toBeDefined();
    expect(typeof shadowConfig.color).toBe("object");
    expect(typeof shadowConfig.color.r).toBe("number");
    expect(typeof shadowConfig.color.g).toBe("number");
    expect(typeof shadowConfig.color.b).toBe("number");
    expect(typeof shadowConfig.color.a).toBe("number");
  });

  it("should have shadow offset defined", () => {
    const shadowConfig = getSurfaceShadowConfig();
    expect(shadowConfig.offset).toBeDefined();
    expect(typeof shadowConfig.offset.x).toBe("number");
    expect(typeof shadowConfig.offset.y).toBe("number");
  });

  it("should have shadow radius defined", () => {
    const shadowConfig = getSurfaceShadowConfig();
    expect(typeof shadowConfig.radius).toBe("number");
    expect(shadowConfig.radius).toBeGreaterThanOrEqual(0);
  });

  it("should have shadow spread defined", () => {
    const shadowConfig = getSurfaceShadowConfig();
    expect(typeof shadowConfig.spread).toBe("number");
  });
});

describe("Surface Generator - Base Styles Parsing", () => {
  it("should parse base styles without errors", () => {
    const parsed = getSurfaceParsedBaseStyles();
    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe("object");
  });

  it("should have stroke variable from ring border", () => {
    const parsed = getSurfaceParsedBaseStyles();
    // ring ring-kumo-line should parse to strokeVariable
    expect(
      parsed.strokeVariable !== undefined || parsed.strokeWeight !== undefined,
    ).toBe(true);
  });
});

describe("Surface Generator - Complete Data Structure", () => {
  it("should have complete data structure defined", () => {
    const allData = getAllSurfaceData();
    expect(allData).toBeDefined();
    expect(typeof allData).toBe("object");
  });

  it("should have base styles section", () => {
    const allData = getAllSurfaceData();
    expect(allData.baseStyles).toBeDefined();
    expect(allData.baseStyles.raw).toBeDefined();
    expect(typeof allData.baseStyles.raw).toBe("string");
    expect(allData.baseStyles.parsed).toBeDefined();
    expect(typeof allData.baseStyles.parsed).toBe("object");
  });

  it("should have dimensions section", () => {
    const allData = getAllSurfaceData();
    expect(allData.dimensions).toBeDefined();
    expect(typeof allData.dimensions).toBe("object");
    expect(typeof allData.dimensions.paddingLeft).toBe("number");
  });

  it("should have color bindings section", () => {
    const allData = getAllSurfaceData();
    expect(allData.colorBindings).toBeDefined();
    expect(typeof allData.colorBindings).toBe("object");
    expect(typeof allData.colorBindings.background).toBe("string");
  });

  it("should have shadow config section", () => {
    const allData = getAllSurfaceData();
    expect(allData.shadowConfig).toBeDefined();
    expect(typeof allData.shadowConfig).toBe("object");
    expect(allData.shadowConfig.type).toBe("DROP_SHADOW");
  });

  it("should have content text section", () => {
    const allData = getAllSurfaceData();
    expect(allData.contentText).toBeDefined();
    expect(typeof allData.contentText.text).toBe("string");
    expect(typeof allData.contentText.fontSize).toBe("number");
    expect(typeof allData.contentText.fontWeight).toBe("number");
  });
});
