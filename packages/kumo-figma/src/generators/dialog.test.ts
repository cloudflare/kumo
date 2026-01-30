/**
 * Tests for dialog.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If dialog styling changes, these tests
 * should NOT break - only the Figma output changes.
 *
 * Test philosophy:
 * - Test that the generator correctly reads from the registry
 * - Test that the parser produces valid Figma-compatible output
 * - Test structural invariants, not specific values
 * - DO NOT test specific colors, sizes, or variant names
 */

import { describe, it, expect } from "vitest";
import {
  getSizeConfig,
  getBaseConfig,
  getAllVariantData,
  DIALOG_SIZE_VALUES,
} from "./dialog";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import {
  expectValidRegistryProp,
  expectAllClassesParsable,
  type SizeProp,
} from "./_test-utils";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const dialogComponent = registry.components.Dialog;
const dialogProps = dialogComponent.props;
const sizeProp = dialogProps.size as SizeProp;

describe("Dialog Generator - Registry Structure", () => {
  /**
   * These tests verify the registry has the required structure
   * for the generator to work. They don't test specific values.
   */

  describe("size prop", () => {
    it("should have valid size prop structure", () => {
      expectValidRegistryProp(sizeProp, "size");
    });

    it("should have at least one size defined", () => {
      expect(sizeProp.values.length).toBeGreaterThan(0);
    });

    it("should have a default size that exists in values", () => {
      expect(sizeProp.default).toBeDefined();
      expect(sizeProp.values).toContain(sizeProp.default);
    });

    it("should have classes defined for every size", () => {
      for (const size of sizeProp.values) {
        expect(sizeProp.classes[size]).toBeDefined();
        expect(typeof sizeProp.classes[size]).toBe("string");
        expect(sizeProp.classes[size].length).toBeGreaterThan(0);
      }
    });

    it("should have descriptions defined for every size", () => {
      for (const size of sizeProp.values) {
        expect(sizeProp.descriptions[size]).toBeDefined();
        expect(typeof sizeProp.descriptions[size]).toBe("string");
        expect(sizeProp.descriptions[size].length).toBeGreaterThan(0);
      }
    });
  });
});

describe("Dialog Generator - Exports Sync", () => {
  /**
   * These tests ensure the generator exports stay in sync with the registry.
   */

  it("should export DIALOG_SIZE_VALUES matching registry", () => {
    expect(DIALOG_SIZE_VALUES).toEqual(sizeProp.values);
  });

  it("should have at least one size value", () => {
    expect(DIALOG_SIZE_VALUES.length).toBeGreaterThan(0);
  });
});

describe("Dialog Generator - Parser Integration", () => {
  /**
   * These tests verify the parser produces valid Figma-compatible output
   * for all classes defined in the registry.
   */

  describe("size classes parsing", () => {
    it("should parse all size classes without errors", () => {
      expectAllClassesParsable(sizeProp, "size");
    });

    it("should produce valid types for all sizes", () => {
      for (const size of sizeProp.values) {
        const classes = sizeProp.classes[size];
        const parsed = parseTailwindClasses(classes);

        // Check that parsed output is an object
        expect(typeof parsed).toBe("object");

        // If minWidth is parsed, it should be a positive number
        if (parsed.minWidth !== undefined) {
          expect(typeof parsed.minWidth).toBe("number");
          expect(parsed.minWidth).toBeGreaterThan(0);
        }
      }
    });
  });
});

describe("Dialog Generator - getSizeConfig", () => {
  /**
   * These tests verify the getSizeConfig function returns
   * valid configuration for all sizes in the registry.
   */

  it("should return config for all registry sizes", () => {
    for (const size of sizeProp.values) {
      const config = getSizeConfig(size);
      expect(config).toBeDefined();
      expect(typeof config).toBe("object");
    }
  });

  it("should return fallback config for unknown size", () => {
    const unknownConfig = getSizeConfig("unknown-size");
    const defaultConfig = getSizeConfig(sizeProp.default);
    expect(unknownConfig).toEqual(defaultConfig);
  });

  it("should have required properties in config", () => {
    for (const size of sizeProp.values) {
      const config = getSizeConfig(size);

      expect(config).toHaveProperty("width");
      expect(config).toHaveProperty("titleSize");
      expect(config).toHaveProperty("titleWeight");
      expect(config).toHaveProperty("descSize");
      expect(config).toHaveProperty("padding");
      expect(config).toHaveProperty("gap");
      expect(config).toHaveProperty("buttonSize");
    }
  });

  it("should have positive numeric values for dimensions", () => {
    for (const size of sizeProp.values) {
      const config = getSizeConfig(size);

      expect(typeof config.width).toBe("number");
      expect(config.width).toBeGreaterThan(0);

      expect(typeof config.titleSize).toBe("number");
      expect(config.titleSize).toBeGreaterThan(0);

      expect(typeof config.titleWeight).toBe("number");
      expect(config.titleWeight).toBeGreaterThan(0);

      expect(typeof config.descSize).toBe("number");
      expect(config.descSize).toBeGreaterThan(0);

      expect(typeof config.padding).toBe("number");
      expect(config.padding).toBeGreaterThan(0);

      expect(typeof config.gap).toBe("number");
      expect(config.gap).toBeGreaterThan(0);
    }
  });

  it("should have valid buttonSize value", () => {
    for (const size of sizeProp.values) {
      const config = getSizeConfig(size);
      expect(["sm", "base"]).toContain(config.buttonSize);
    }
  });

  it("should have all sizes with positive widths", () => {
    for (const size of sizeProp.values) {
      const config = getSizeConfig(size);
      expect(config.width).toBeGreaterThan(0);
    }
  });

  it("should have different widths for different sizes when multiple sizes exist", () => {
    if (sizeProp.values.length > 1) {
      const widths = sizeProp.values.map((size) => getSizeConfig(size).width);
      const uniqueWidths = [...new Set(widths)];
      // At least some sizes should have different widths
      expect(uniqueWidths.length).toBeGreaterThan(1);
    }
  });
});

describe("Dialog Generator - getBaseConfig", () => {
  /**
   * These tests verify the getBaseConfig function returns
   * valid base configuration with required properties.
   */

  it("should return valid structure", () => {
    const config = getBaseConfig();
    expect(config).toBeDefined();
    expect(typeof config).toBe("object");
  });

  it("should have required top-level properties", () => {
    const config = getBaseConfig();

    expect(config).toHaveProperty("background");
    expect(config).toHaveProperty("text");
    expect(config).toHaveProperty("borderRadius");
    expect(config).toHaveProperty("shadow");
    expect(config).toHaveProperty("backdrop");
    expect(config).toHaveProperty("header");
    expect(config).toHaveProperty("description");
    expect(config).toHaveProperty("buttons");
  });

  it("should have valid types for top-level properties", () => {
    const config = getBaseConfig();

    expect(typeof config.background).toBe("string");
    expect(config.background.length).toBeGreaterThan(0);

    expect(typeof config.text).toBe("string");
    expect(config.text.length).toBeGreaterThan(0);

    expect(typeof config.borderRadius).toBe("number");
    expect(config.borderRadius).toBeGreaterThan(0);

    expect(typeof config.shadow).toBe("string");
    expect(config.shadow.length).toBeGreaterThan(0);
  });

  it("should have valid backdrop configuration", () => {
    const config = getBaseConfig();

    expect(config.backdrop).toHaveProperty("background");
    expect(config.backdrop).toHaveProperty("opacity");

    expect(typeof config.backdrop.background).toBe("string");
    expect(config.backdrop.background.length).toBeGreaterThan(0);

    expect(typeof config.backdrop.opacity).toBe("number");
    expect(config.backdrop.opacity).toBeGreaterThan(0);
    expect(config.backdrop.opacity).toBeLessThanOrEqual(1);
  });

  it("should have valid header configuration", () => {
    const config = getBaseConfig();

    expect(config.header).toHaveProperty("title");
    expect(config.header).toHaveProperty("closeIcon");

    // Title config
    expect(config.header.title).toHaveProperty("fontWeight");
    expect(config.header.title).toHaveProperty("color");
    expect(typeof config.header.title.fontWeight).toBe("number");
    expect(config.header.title.fontWeight).toBeGreaterThan(0);
    expect(typeof config.header.title.color).toBe("string");

    // Close icon config
    expect(config.header.closeIcon).toHaveProperty("name");
    expect(config.header.closeIcon).toHaveProperty("size");
    expect(config.header.closeIcon).toHaveProperty("color");
    expect(typeof config.header.closeIcon.name).toBe("string");
    expect(typeof config.header.closeIcon.size).toBe("number");
    expect(config.header.closeIcon.size).toBeGreaterThan(0);
    expect(typeof config.header.closeIcon.color).toBe("string");
  });

  it("should have valid description configuration", () => {
    const config = getBaseConfig();

    expect(config.description).toHaveProperty("fontWeight");
    expect(config.description).toHaveProperty("color");

    expect(typeof config.description.fontWeight).toBe("number");
    expect(config.description.fontWeight).toBeGreaterThanOrEqual(0);
    expect(typeof config.description.color).toBe("string");
    expect(config.description.color.length).toBeGreaterThan(0);
  });

  it("should have valid buttons configuration", () => {
    const config = getBaseConfig();

    expect(config.buttons).toHaveProperty("primary");
    expect(config.buttons).toHaveProperty("secondary");

    // Primary button
    expect(config.buttons.primary).toHaveProperty("background");
    expect(config.buttons.primary).toHaveProperty("text");
    expect(typeof config.buttons.primary.background).toBe("string");
    expect(typeof config.buttons.primary.text).toBe("string");

    // Secondary button
    expect(config.buttons.secondary).toHaveProperty("ring");
    expect(config.buttons.secondary).toHaveProperty("text");
    expect(typeof config.buttons.secondary.ring).toBe("string");
    expect(typeof config.buttons.secondary.text).toBe("string");
  });
});

describe("Dialog Generator - getAllVariantData", () => {
  /**
   * This function aggregates all data needed for Figma generation.
   * It should return a complete structure with all sizes.
   */

  it("should return complete data structure", () => {
    const allData = getAllVariantData();

    expect(allData).toBeDefined();
    expect(allData.baseConfig).toBeDefined();
    expect(allData.sizeConfig).toBeDefined();
    expect(allData.variants).toBeDefined();
    expect(allData.sizeValues).toBeDefined();
  });

  it("should have sizeValues matching registry", () => {
    const allData = getAllVariantData();
    expect(allData.sizeValues).toEqual(sizeProp.values);
  });

  it("should have variants count matching registry sizes", () => {
    const allData = getAllVariantData();
    expect(allData.variants.length).toBe(sizeProp.values.length);
  });

  it("should have complete data for each variant", () => {
    const allData = getAllVariantData();

    for (const variant of allData.variants) {
      expect(variant).toHaveProperty("size");
      expect(variant).toHaveProperty("description");
      expect(variant).toHaveProperty("config");
      expect(variant).toHaveProperty("classes");

      expect(sizeProp.values).toContain(variant.size);
      expect(typeof variant.description).toBe("string");
      expect(typeof variant.config).toBe("object");
      expect(typeof variant.classes).toBe("string");
    }
  });

  it("should have config for each size in sizeConfig", () => {
    const allData = getAllVariantData();

    for (const size of sizeProp.values) {
      expect(allData.sizeConfig[size]).toBeDefined();
      expect(allData.sizeConfig[size]).toHaveProperty("width");
      expect(allData.sizeConfig[size]).toHaveProperty("padding");
    }
  });

  it("should include base config with valid structure", () => {
    const allData = getAllVariantData();

    expect(allData.baseConfig).toHaveProperty("background");
    expect(allData.baseConfig).toHaveProperty("text");
    expect(allData.baseConfig).toHaveProperty("borderRadius");
    expect(allData.baseConfig).toHaveProperty("shadow");

    expect(typeof allData.baseConfig.background).toBe("string");
    expect(typeof allData.baseConfig.text).toBe("string");
    expect(typeof allData.baseConfig.borderRadius).toBe("number");
    expect(typeof allData.baseConfig.shadow).toBe("string");
  });
});

describe("Dialog Generator - Figma Output Structure", () => {
  /**
   * These tests document the expected Figma component structure.
   * They test structural invariants, not specific values.
   */

  it("should produce valid Figma layout properties for all sizes", () => {
    for (const size of sizeProp.values) {
      const sizeConfig = getSizeConfig(size);
      const baseConfig = getBaseConfig();

      // Verify all properties are valid for Figma
      expect(typeof sizeConfig.width).toBe("number");
      expect(sizeConfig.width).toBeGreaterThan(0);

      expect(typeof sizeConfig.padding).toBe("number");
      expect(sizeConfig.padding).toBeGreaterThan(0);

      expect(typeof sizeConfig.gap).toBe("number");
      expect(sizeConfig.gap).toBeGreaterThan(0);

      expect(typeof baseConfig.borderRadius).toBe("number");
      expect(baseConfig.borderRadius).toBeGreaterThan(0);
    }
  });

  it("should have consistent typography values across sizes", () => {
    const configs = sizeProp.values.map((size) => getSizeConfig(size));

    // All sizes should have valid typography values
    for (const config of configs) {
      expect(config.titleSize).toBeGreaterThan(0);
      expect(config.titleWeight).toBeGreaterThan(0);
      expect(config.descSize).toBeGreaterThan(0);
    }
  });
});
