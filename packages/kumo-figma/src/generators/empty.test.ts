/**
 * Tests for empty.ts generator
 * Source of truth chain: empty.tsx → component-registry.json → empty.ts → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getEmptySizeConfig,
  getEmptyParsedBaseStyles,
  getEmptyParsedSizeStyles,
  getEmptyIconConfig,
  getEmptyTextConfig,
  getAllEmptyData,
} from "./empty";
import registry from "@cloudflare/kumo/ai/component-registry.json";

describe("Empty Generator - Registry Validation", () => {
  it("should have Empty component in registry", () => {
    expect(registry.components.Empty).toBeDefined();
  });

  it("should have size prop in registry", () => {
    const emptyComponent = registry.components.Empty;
    expect(emptyComponent.props.size).toBeDefined();
  });

  it("should have size values defined", () => {
    const config = getEmptySizeConfig();
    expect(config.values.length).toBeGreaterThan(0);
  });

  it("should have classes defined for all sizes", () => {
    const config = getEmptySizeConfig();
    for (const size of config.values) {
      expect(config.classes[size]).toBeDefined();
    }
  });

  it("should include required size variants", () => {
    const config = getEmptySizeConfig();
    // At minimum, should have a default size
    expect(config.default).toBeDefined();
    expect(config.values).toContain(config.default);
  });
});

describe("Empty Generator - Configuration", () => {
  it("should return size config from registry", () => {
    const config = getEmptySizeConfig();
    expect(config.values).toBeDefined();
    expect(config.classes).toBeDefined();
    expect(config.descriptions).toBeDefined();
    expect(config.default).toBeDefined();
  });

  it("should return icon config", () => {
    const config = getEmptyIconConfig();
    expect(config.iconName).toBeDefined();
    expect(config.iconSize).toBeGreaterThan(0);
    expect(config.iconColorToken).toBeDefined();
  });

  it("should return text config with title and description", () => {
    const config = getEmptyTextConfig();
    expect(config.title).toBeDefined();
    expect(config.title.text).toBeDefined();
    expect(config.title.fontSize).toBeGreaterThan(0);
    expect(config.description).toBeDefined();
    expect(config.description.text).toBeDefined();
    expect(config.description.maxWidth).toBeGreaterThan(0);
  });
});

describe("Empty Generator - Structural Validation", () => {
  it("should parse base styles correctly", () => {
    const parsed = getEmptyParsedBaseStyles();
    // Base styles should have border and fill
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.fillVariable).toBeDefined();
  });

  it("should parse size styles for each size", () => {
    const config = getEmptySizeConfig();
    for (const size of config.values) {
      const sizeData = getEmptyParsedSizeStyles(size);
      expect(sizeData.size).toBe(size);
      expect(sizeData.classes).toBeDefined();
      expect(sizeData.parsed).toBeDefined();
    }
  });

  it("should have layout data for all sizes", () => {
    const allData = getAllEmptyData();
    expect(allData.sizes.length).toBeGreaterThan(0);
    for (const sizeData of allData.sizes) {
      expect(sizeData.layout).toBeDefined();
      expect(sizeData.layout.layoutMode).toBe("VERTICAL");
      expect(sizeData.layout.primaryAxisAlignItems).toBe("CENTER");
    }
  });

  it("should have color bindings for all sizes", () => {
    const allData = getAllEmptyData();
    for (const sizeData of allData.sizes) {
      expect(sizeData.colors).toBeDefined();
      expect(sizeData.colors.fill).toBeDefined();
      expect(sizeData.colors.stroke).toBeDefined();
    }
  });
});
