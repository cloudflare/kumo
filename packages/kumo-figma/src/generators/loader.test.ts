/**
 * Tests for loader.ts generator
 *
 * These tests ensure the Loader Figma component generation stays in sync
 * with the source of truth (loader-data.json and component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the loader
 * generator, loader-data.json, or the parser, these tests will catch any
 * unintended changes.
 *
 * Source of truth chain:
 * loader.tsx → loader-data.json → loader.ts (generator) → Figma
 * loader.tsx → component-registry.json → (validation)
 */

import { describe, it, expect } from "vitest";
import {
  getLoaderSizeConfig,
  getLoaderSvgData,
  getLoaderSizeDimensions,
  getLoaderColorBinding,
  getAllLoaderData,
} from "./loader";

// Import registry as source of truth for size prop
import registry from "@cloudflare/kumo/ai/component-registry.json";

const loaderComponent = registry.components.Loader;
const loaderProps = loaderComponent.props;
const sizeProp = loaderProps.size as {
  values: string[];
  descriptions: Record<string, string>;
  default: string;
};

describe("Loader Generator - Registry Validation", () => {
  it("should have all expected sizes in registry", () => {
    expect(Array.isArray(sizeProp.values)).toBe(true);
    expect(sizeProp.values.length).toBeGreaterThan(0);
  });

  it("should have descriptions defined for all sizes", () => {
    for (const size of sizeProp.values) {
      expect(sizeProp.descriptions[size]).toBeDefined();
      expect(typeof sizeProp.descriptions[size]).toBe("string");
      expect(sizeProp.descriptions[size].length).toBeGreaterThan(0);
    }
  });

  it("should have a default size", () => {
    expect(sizeProp.default).toBeDefined();
    expect(typeof sizeProp.default).toBe("string");
    expect(sizeProp.values).toContain(sizeProp.default);
  });

  it("should have a valid default size from the defined values", () => {
    // Default size should be one of the defined sizes
    expect(sizeProp.values).toContain(sizeProp.default);
  });
});

describe("Loader Generator - Size Configuration", () => {
  it("should return size configuration from loader-data.json", () => {
    const config = getLoaderSizeConfig();
    expect(config.values).toBeDefined();
    expect(Array.isArray(config.values)).toBe(true);
    expect(config.sizes).toBeDefined();
    expect(typeof config.sizes).toBe("object");
  });

  it("should have same sizes in loader-data as in registry", () => {
    const config = getLoaderSizeConfig();
    expect(config.values).toEqual(sizeProp.values);
  });

  it("should have size configs for all sizes", () => {
    const config = getLoaderSizeConfig();
    for (const size of config.values) {
      const sizeConfig = config.sizes[size as keyof typeof config.sizes];
      expect(sizeConfig).toBeDefined();
      expect(sizeConfig.value).toBeDefined();
      expect(typeof sizeConfig.value).toBe("number");
      expect(sizeConfig.description).toBeDefined();
      expect(typeof sizeConfig.description).toBe("string");
    }
  });
});

describe("Loader Generator - SVG Data", () => {
  it("should return SVG data from loader-data.json", () => {
    const svgData = getLoaderSvgData();
    expect(svgData.svgString).toBeDefined();
    expect(typeof svgData.svgString).toBe("string");
    expect(svgData.svgString.length).toBeGreaterThan(0);
  });

  it("should have viewBox defined", () => {
    const svgData = getLoaderSvgData();
    expect(svgData.viewBox).toBeDefined();
    expect(typeof svgData.viewBox).toBe("string");
  });

  it("should have width and height dimensions", () => {
    const svgData = getLoaderSvgData();
    expect(svgData.width).toBeDefined();
    expect(typeof svgData.width).toBe("number");
    expect(svgData.height).toBeDefined();
    expect(typeof svgData.height).toBe("number");
  });

  it("should have circles data", () => {
    const svgData = getLoaderSvgData();
    expect(svgData.circles).toBeDefined();
    expect(Array.isArray(svgData.circles)).toBe(true);
    expect(svgData.circles.length).toBeGreaterThan(0);
  });

  it("should have valid SVG string format", () => {
    const svgData = getLoaderSvgData();
    expect(svgData.svgString).toContain("<svg");
    expect(svgData.svgString).toContain("viewBox");
  });
});

describe("Loader Generator - Size Dimensions", () => {
  const sizes = ["sm", "base", "lg"];

  for (const size of sizes) {
    describe(`${size} size`, () => {
      it("should return dimensions for size", () => {
        const dimensions = getLoaderSizeDimensions(size);
        expect(dimensions.size).toBe(size);
        expect(dimensions.value).toBeDefined();
        expect(typeof dimensions.value).toBe("number");
        expect(dimensions.value).toBeGreaterThan(0);
      });

      it("should have description", () => {
        const dimensions = getLoaderSizeDimensions(size);
        expect(dimensions.description).toBeDefined();
        expect(typeof dimensions.description).toBe("string");
        expect(dimensions.description.length).toBeGreaterThan(0);
      });

      it("should match description in registry", () => {
        const dimensions = getLoaderSizeDimensions(size);
        expect(dimensions.description).toBe(sizeProp.descriptions[size]);
      });
    });
  }

  it("should throw error for invalid size", () => {
    expect(() => getLoaderSizeDimensions("invalid")).toThrow("Invalid size");
  });
});

describe("Loader Generator - Color Binding", () => {
  it("should return stroke variable binding", () => {
    const colorBinding = getLoaderColorBinding();
    expect(colorBinding.strokeVariable).toBeDefined();
    expect(typeof colorBinding.strokeVariable).toBe("string");
  });

  it("should use kumo semantic token for stroke", () => {
    const colorBinding = getLoaderColorBinding();
    // Stroke should use a kumo text color token for theming support
    expect(colorBinding.strokeVariable).toMatch(/^text-color-kumo-/);
  });
});

describe("Loader Generator - Complete Data Structure", () => {
  it("should return all loader data", () => {
    const allData = getAllLoaderData();
    expect(allData.sizeConfig).toBeDefined();
    expect(allData.svgData).toBeDefined();
    expect(allData.colorBinding).toBeDefined();
    expect(allData.sizes).toBeDefined();
  });

  it("should have size data for all sizes", () => {
    const allData = getAllLoaderData();
    expect(Array.isArray(allData.sizes)).toBe(true);
    expect(allData.sizes.length).toBe(sizeProp.values.length);

    for (const sizeData of allData.sizes) {
      expect(sizeData.size).toBeDefined();
      expect(sizeData.value).toBeDefined();
      expect(typeof sizeData.value).toBe("number");
      expect(sizeData.description).toBeDefined();
      expect(typeof sizeData.description).toBe("string");
    }
  });

  it("should have consistent structure", () => {
    const allData = getAllLoaderData();
    expect(allData.sizeConfig.values).toEqual(sizeProp.values);
    expect(allData.sizes.length).toBe(allData.sizeConfig.values.length);
  });
});
