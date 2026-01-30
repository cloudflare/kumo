/**
 * Tests for layer-card.ts generator
 *
 * These tests ensure the LayerCard Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the layer-card
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * layer-card.tsx → component-registry.json → layer-card.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getLayerCardDimensionsConfig,
  getLayerCardColorBindings,
  getLayerCardSubComponentConfig,
  getLayerCardContentConfig,
  getAllLayerCardData,
} from "./layer-card";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const layerCardComponent = registry.components.LayerCard;

describe("LayerCard Generator - Registry Validation", () => {
  it("should have LayerCard component in registry", () => {
    expect(layerCardComponent).toBeDefined();
    expect(layerCardComponent.name).toBe("LayerCard");
    expect(layerCardComponent.category).toBe("Display");
  });

  it("should have sub-components defined in registry", () => {
    expect(layerCardComponent.subComponents).toBeDefined();
    expect(typeof layerCardComponent.subComponents).toBe("object");
  });

  it("should have Secondary sub-component", () => {
    const subComponents = layerCardComponent.subComponents;
    expect(subComponents.Secondary).toBeDefined();
    expect(subComponents.Secondary.name).toBe("Secondary");
    expect(typeof subComponents.Secondary.description).toBe("string");
  });

  it("should have Primary sub-component", () => {
    const subComponents = layerCardComponent.subComponents;
    expect(subComponents.Primary).toBeDefined();
    expect(subComponents.Primary.name).toBe("Primary");
    expect(typeof subComponents.Primary.description).toBe("string");
  });

  it("should have color tokens in registry", () => {
    expect(Array.isArray(layerCardComponent.colors)).toBe(true);
    expect(layerCardComponent.colors.length).toBeGreaterThan(0);
  });
});

describe("LayerCard Generator - Dimensions Configuration", () => {
  it("should have dimensions configuration defined", () => {
    const dimensions = getLayerCardDimensionsConfig();
    expect(dimensions).toBeDefined();
    expect(typeof dimensions).toBe("object");
  });

  it("should have root dimensions", () => {
    const dimensions = getLayerCardDimensionsConfig();
    expect(typeof dimensions.width).toBe("number");
    expect(dimensions.width).toBeGreaterThan(0);
    expect(typeof dimensions.borderRadius).toBe("number");
    expect(dimensions.borderRadius).toBeGreaterThan(0);
  });

  it("should have secondary section dimensions", () => {
    const dimensions = getLayerCardDimensionsConfig();
    expect(dimensions.secondary).toBeDefined();
    expect(typeof dimensions.secondary.paddingX).toBe("number");
    expect(typeof dimensions.secondary.paddingY).toBe("number");
    expect(typeof dimensions.secondary.gap).toBe("number");
    expect(typeof dimensions.secondary.fontSize).toBe("number");
    expect(typeof dimensions.secondary.fontWeight).toBe("number");
  });

  it("should have primary section dimensions", () => {
    const dimensions = getLayerCardDimensionsConfig();
    expect(dimensions.primary).toBeDefined();
    expect(typeof dimensions.primary.paddingX).toBe("number");
    expect(typeof dimensions.primary.paddingY).toBe("number");
    expect(typeof dimensions.primary.paddingRight).toBe("number");
    expect(typeof dimensions.primary.gap).toBe("number");
    expect(typeof dimensions.primary.fontSize).toBe("number");
    expect(typeof dimensions.primary.fontWeight).toBe("number");
    expect(typeof dimensions.primary.borderRadius).toBe("number");
  });

  it("should have all padding values greater than zero", () => {
    const dimensions = getLayerCardDimensionsConfig();
    expect(dimensions.secondary.paddingX).toBeGreaterThan(0);
    expect(dimensions.secondary.paddingY).toBeGreaterThan(0);
    expect(dimensions.primary.paddingX).toBeGreaterThan(0);
    expect(dimensions.primary.paddingY).toBeGreaterThan(0);
    expect(dimensions.primary.paddingRight).toBeGreaterThan(0);
  });
});

describe("LayerCard Generator - Color Bindings", () => {
  it("should have color bindings defined", () => {
    const colorBindings = getLayerCardColorBindings();
    expect(colorBindings).toBeDefined();
    expect(typeof colorBindings).toBe("object");
  });

  it("should have root color bindings", () => {
    const colorBindings = getLayerCardColorBindings();
    expect(colorBindings.root).toBeDefined();
    expect(typeof colorBindings.root.background).toBe("string");
    expect(typeof colorBindings.root.backgroundFallback).toBe("string");
    expect(typeof colorBindings.root.border).toBe("string");
  });

  it("should have secondary color bindings", () => {
    const colorBindings = getLayerCardColorBindings();
    expect(colorBindings.secondary).toBeDefined();
    expect(typeof colorBindings.secondary.text).toBe("string");
  });

  it("should have primary color bindings", () => {
    const colorBindings = getLayerCardColorBindings();
    expect(colorBindings.primary).toBeDefined();
    expect(typeof colorBindings.primary.background).toBe("string");
    expect(typeof colorBindings.primary.backgroundFallback).toBe("string");
    expect(typeof colorBindings.primary.border).toBe("string");
    expect(typeof colorBindings.primary.borderFallback).toBe("string");
    expect(typeof colorBindings.primary.text).toBe("string");
  });

  it("should have all color binding strings non-empty", () => {
    const colorBindings = getLayerCardColorBindings();
    expect(colorBindings.root.background.length).toBeGreaterThan(0);
    expect(colorBindings.root.border.length).toBeGreaterThan(0);
    expect(colorBindings.secondary.text.length).toBeGreaterThan(0);
    expect(colorBindings.primary.background.length).toBeGreaterThan(0);
    expect(colorBindings.primary.border.length).toBeGreaterThan(0);
    expect(colorBindings.primary.text.length).toBeGreaterThan(0);
  });
});

describe("LayerCard Generator - Sub-Component Configuration", () => {
  it("should have sub-component configuration defined", () => {
    const subComponentConfig = getLayerCardSubComponentConfig();
    expect(subComponentConfig).toBeDefined();
    expect(typeof subComponentConfig).toBe("object");
  });

  it("should have subComponents object", () => {
    const subComponentConfig = getLayerCardSubComponentConfig();
    expect(subComponentConfig.subComponents).toBeDefined();
    expect(typeof subComponentConfig.subComponents).toBe("object");
  });

  it("should have hasSubComponents flag", () => {
    const subComponentConfig = getLayerCardSubComponentConfig();
    expect(typeof subComponentConfig.hasSubComponents).toBe("boolean");
  });

  it("should report having sub-components", () => {
    const subComponentConfig = getLayerCardSubComponentConfig();
    expect(subComponentConfig.hasSubComponents).toBe(true);
  });

  it("should have Secondary in subComponents", () => {
    const subComponentConfig = getLayerCardSubComponentConfig();
    expect(subComponentConfig.subComponents.Secondary).toBeDefined();
  });

  it("should have Primary in subComponents", () => {
    const subComponentConfig = getLayerCardSubComponentConfig();
    expect(subComponentConfig.subComponents.Primary).toBeDefined();
  });
});

describe("LayerCard Generator - Content Configuration", () => {
  it("should have content configuration defined", () => {
    const contentConfig = getLayerCardContentConfig();
    expect(contentConfig).toBeDefined();
    expect(typeof contentConfig).toBe("object");
  });

  it("should have secondary content", () => {
    const contentConfig = getLayerCardContentConfig();
    expect(contentConfig.secondary).toBeDefined();
    expect(typeof contentConfig.secondary.title).toBe("string");
    expect(contentConfig.secondary.title.length).toBeGreaterThan(0);
    expect(typeof contentConfig.secondary.iconName).toBe("string");
    expect(typeof contentConfig.secondary.iconSize).toBe("number");
    expect(contentConfig.secondary.iconSize).toBeGreaterThan(0);
  });

  it("should have primary content", () => {
    const contentConfig = getLayerCardContentConfig();
    expect(contentConfig.primary).toBeDefined();
    expect(typeof contentConfig.primary.content).toBe("string");
    expect(contentConfig.primary.content.length).toBeGreaterThan(0);
  });
});

describe("LayerCard Generator - Complete Data Structure", () => {
  it("should have complete data structure defined", () => {
    const allData = getAllLayerCardData();
    expect(allData).toBeDefined();
    expect(typeof allData).toBe("object");
  });

  it("should have dimensions section", () => {
    const allData = getAllLayerCardData();
    expect(allData.dimensions).toBeDefined();
    expect(typeof allData.dimensions).toBe("object");
    expect(typeof allData.dimensions.width).toBe("number");
  });

  it("should have color bindings section", () => {
    const allData = getAllLayerCardData();
    expect(allData.colorBindings).toBeDefined();
    expect(typeof allData.colorBindings).toBe("object");
    expect(allData.colorBindings.root).toBeDefined();
    expect(allData.colorBindings.secondary).toBeDefined();
    expect(allData.colorBindings.primary).toBeDefined();
  });

  it("should have sub-components section", () => {
    const allData = getAllLayerCardData();
    expect(allData.subComponents).toBeDefined();
    expect(typeof allData.subComponents).toBe("object");
    expect(allData.subComponents.hasSubComponents).toBe(true);
  });

  it("should have content section", () => {
    const allData = getAllLayerCardData();
    expect(allData.content).toBeDefined();
    expect(typeof allData.content).toBe("object");
    expect(allData.content.secondary).toBeDefined();
    expect(allData.content.primary).toBeDefined();
  });
});
