/**
 * Tests for clipboard-text.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If clipboard-text styling changes, these tests
 * should NOT break - only the Figma output changes.
 *
 * Test philosophy:
 * - Test that the generator correctly reads from the registry
 * - Test that the parser produces valid Figma-compatible output
 * - Test structural invariants, not specific values
 * - DO NOT test specific colors, sizes, or variant names
 */

import { describe, it, expect } from "vitest";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import {
  getClipboardTextSizeConfig,
  getBaseStyles,
  getInputSizeClasses,
  getSizeConfig,
  getAllVariantData,
} from "./clipboard-text";
import {
  expectValidRegistryProp,
  expectAllClassesParsable,
  expectValidParsedTypes,
  expectPositiveLayoutValues,
  expectGetterMatchesRegistry,
  type SizeProp,
} from "./_test-utils";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const clipboardTextComponent = registry.components.ClipboardText;
const clipboardTextProps = clipboardTextComponent.props;
const clipboardTextStyling = (clipboardTextComponent as any).styling;

const sizeProp = clipboardTextProps.size as SizeProp;

describe("ClipboardText Generator - Registry Structure", () => {
  it("should have valid size prop structure", () => {
    expectValidRegistryProp(sizeProp, "size");
  });

  it("should have a default size that exists in values", () => {
    expect(sizeProp.default).toBeDefined();
    expect(sizeProp.values).toContain(sizeProp.default);
  });
});

describe("ClipboardText Generator - Styling Section Structure", () => {
  it("should have inputStyles.base defined", () => {
    expect(clipboardTextStyling.inputStyles.base).toBeDefined();
    expect(typeof clipboardTextStyling.inputStyles.base).toBe("string");
    expect(clipboardTextStyling.inputStyles.base.length).toBeGreaterThan(0);
  });

  it("should have inputStyles.sizes defined for all sizes", () => {
    for (const size of sizeProp.values) {
      expect(clipboardTextStyling.inputStyles.sizes[size]).toBeDefined();
      expect(typeof clipboardTextStyling.inputStyles.sizes[size]).toBe(
        "string",
      );
      expect(
        clipboardTextStyling.inputStyles.sizes[size].length,
      ).toBeGreaterThan(0);
    }
  });

  it("should have sizeVariants defined for all sizes with correct property types", () => {
    for (const size of sizeProp.values) {
      const variant = clipboardTextStyling.sizeVariants[size];
      expect(variant).toBeDefined();

      // Check height is a number
      expect(variant.height).toBeDefined();
      expect(typeof variant.height).toBe("number");

      // Check classes is a string
      expect(variant.classes).toBeDefined();
      expect(typeof variant.classes).toBe("string");

      // Check buttonSize is a string
      expect(variant.buttonSize).toBeDefined();
      expect(typeof variant.buttonSize).toBe("string");

      // Check dimensions exist with numeric values
      expect(variant.dimensions).toBeDefined();
      expect(typeof variant.dimensions.paddingX).toBe("number");
      expect(typeof variant.dimensions.gap).toBe("number");
      expect(typeof variant.dimensions.borderRadius).toBe("number");
      expect(typeof variant.dimensions.fontSize).toBe("number");
    }
  });

  it("should have states defined as non-empty arrays", () => {
    expect(clipboardTextStyling.states.input).toBeDefined();
    expect(Array.isArray(clipboardTextStyling.states.input)).toBe(true);
    expect(clipboardTextStyling.states.input.length).toBeGreaterThan(0);

    expect(clipboardTextStyling.states.text).toBeDefined();
    expect(Array.isArray(clipboardTextStyling.states.text)).toBe(true);
    expect(clipboardTextStyling.states.text.length).toBeGreaterThan(0);

    expect(clipboardTextStyling.states.button).toBeDefined();
    expect(Array.isArray(clipboardTextStyling.states.button)).toBe(true);
    expect(clipboardTextStyling.states.button.length).toBeGreaterThan(0);
  });

  it("should have icons defined with required properties", () => {
    expect(clipboardTextStyling.icons).toBeDefined();
    expect(Array.isArray(clipboardTextStyling.icons)).toBe(true);
    expect(clipboardTextStyling.icons.length).toBeGreaterThan(0);

    // Each icon should have name, state, and size
    for (const icon of clipboardTextStyling.icons) {
      expect(icon.name).toBeDefined();
      expect(typeof icon.name).toBe("string");
      expect(icon.state).toBeDefined();
      expect(typeof icon.state).toBe("string");
      expect(icon.size).toBeDefined();
      expect(typeof icon.size).toBe("number");
      expect(icon.size).toBeGreaterThan(0);
    }
  });
});

describe("ClipboardText Generator - Config Functions", () => {
  it("getClipboardTextSizeConfig should return registry data", () => {
    const config = getClipboardTextSizeConfig();
    expectGetterMatchesRegistry(config, sizeProp, "getClipboardTextSizeConfig");
  });
});

describe("ClipboardText Generator - Parser Integration", () => {
  describe("size classes parsing", () => {
    it("should parse all size classes without errors", () => {
      expectAllClassesParsable(sizeProp, "size");
    });

    it("should produce valid types for all sizes", () => {
      for (const size of sizeProp.values) {
        const classes = sizeProp.classes[size];
        const parsed = parseTailwindClasses(classes);
        expectValidParsedTypes(parsed);
      }
    });

    it("should produce positive layout values for all sizes", () => {
      for (const size of sizeProp.values) {
        const classes = sizeProp.classes[size];
        const parsed = parseTailwindClasses(classes);
        expectPositiveLayoutValues(parsed);
      }
    });
  });

  describe("inputStyles.base parsing", () => {
    it("should parse base styles without errors", () => {
      const baseStyles = clipboardTextStyling.inputStyles.base;
      expect(() => parseTailwindClasses(baseStyles)).not.toThrow();
    });

    it("should produce valid types from base styles", () => {
      const baseStyles = clipboardTextStyling.inputStyles.base;
      const parsed = parseTailwindClasses(baseStyles);
      expectValidParsedTypes(parsed);
    });

    it("should parse color properties from base styles", () => {
      const baseStyles = clipboardTextStyling.inputStyles.base;
      const parsed = parseTailwindClasses(baseStyles);
      // Base styles should define colors - check structure not values
      expect(
        parsed.fillVariable !== undefined ||
          parsed.textVariable !== undefined ||
          parsed.strokeVariable !== undefined,
      ).toBe(true);
    });
  });

  describe("inputStyles.sizes parsing", () => {
    it("should parse all inputStyles.sizes without errors", () => {
      for (const size of sizeProp.values) {
        const classes = clipboardTextStyling.inputStyles.sizes[size];
        expect(() => parseTailwindClasses(classes)).not.toThrow();
      }
    });

    it("should produce valid types for all inputStyles.sizes", () => {
      for (const size of sizeProp.values) {
        const classes = clipboardTextStyling.inputStyles.sizes[size];
        const parsed = parseTailwindClasses(classes);
        expectValidParsedTypes(parsed);
      }
    });

    it("should produce positive layout values for all inputStyles.sizes", () => {
      for (const size of sizeProp.values) {
        const classes = clipboardTextStyling.inputStyles.sizes[size];
        const parsed = parseTailwindClasses(classes);
        expectPositiveLayoutValues(parsed);
      }
    });
  });
});

describe("ClipboardText Generator - getBaseStyles", () => {
  it("should return input base styles with raw and parsed", () => {
    const styles = getBaseStyles();
    expect(styles.input).toBeDefined();
    expect(styles.input.raw).toBeDefined();
    expect(typeof styles.input.raw).toBe("string");
    expect(styles.input.raw.length).toBeGreaterThan(0);
    expect(styles.input.parsed).toBeDefined();
    expect(typeof styles.input.parsed).toBe("object");
  });

  it("should return text tokens as array", () => {
    const styles = getBaseStyles();
    expect(styles.text).toBeDefined();
    expect(Array.isArray(styles.text)).toBe(true);
    expect(styles.text.length).toBeGreaterThan(0);
  });

  it("should produce valid parsed types from input base", () => {
    const styles = getBaseStyles();
    expectValidParsedTypes(styles.input.parsed);
  });
});

describe("ClipboardText Generator - getSizeConfig", () => {
  it("should return complete config for all sizes", () => {
    for (const size of sizeProp.values) {
      const config = getSizeConfig(size);

      // Height should be positive number
      expect(config.height).toBeDefined();
      expect(typeof config.height).toBe("number");
      expect(config.height).toBeGreaterThan(0);

      // Classes should be string
      expect(config.classes).toBeDefined();
      expect(typeof config.classes).toBe("string");

      // ButtonSize should be string
      expect(config.buttonSize).toBeDefined();
      expect(typeof config.buttonSize).toBe("string");

      // Dimensions should have positive values
      expect(config.dimensions).toBeDefined();
      expect(typeof config.dimensions.paddingX).toBe("number");
      expect(config.dimensions.paddingX).toBeGreaterThan(0);
      expect(typeof config.dimensions.gap).toBe("number");
      expect(config.dimensions.gap).toBeGreaterThanOrEqual(0);
      expect(typeof config.dimensions.borderRadius).toBe("number");
      expect(config.dimensions.borderRadius).toBeGreaterThan(0);
      expect(typeof config.dimensions.fontSize).toBe("number");
      expect(config.dimensions.fontSize).toBeGreaterThan(0);
    }
  });
});

describe("ClipboardText Generator - getInputSizeClasses", () => {
  it("should return parsed Tailwind classes for all sizes", () => {
    for (const size of sizeProp.values) {
      const parsed = getInputSizeClasses(size);
      expect(parsed).toBeDefined();
      expect(typeof parsed).toBe("object");
    }
  });

  it("should produce valid types for all sizes", () => {
    for (const size of sizeProp.values) {
      const parsed = getInputSizeClasses(size);
      expectValidParsedTypes(parsed);
    }
  });

  it("should produce positive layout values for all sizes", () => {
    for (const size of sizeProp.values) {
      const parsed = getInputSizeClasses(size);
      expectPositiveLayoutValues(parsed);
    }
  });
});

describe("ClipboardText Generator - getAllVariantData", () => {
  it("should return complete data structure", () => {
    const data = getAllVariantData();

    expect(data.sizeConfig).toBeDefined();
    expect(data.sizeConfig.values).toBeDefined();
    expect(data.sizeConfig.values.length).toBeGreaterThan(0);

    expect(data.baseStyles).toBeDefined();
    expect(data.baseStyles.input).toBeDefined();
    expect(data.baseStyles.text).toBeDefined();

    expect(data.sizes).toBeDefined();
    expect(data.sizes.length).toBe(sizeProp.values.length);

    expect(data.stylingConfig).toBeDefined();
  });

  it("should have complete data for each size", () => {
    const data = getAllVariantData();

    for (const sizeData of data.sizes) {
      expect(sizeData.size).toBeDefined();
      expect(sizeProp.values).toContain(sizeData.size);

      expect(sizeData.height).toBeDefined();
      expect(typeof sizeData.height).toBe("number");
      expect(sizeData.height).toBeGreaterThan(0);

      expect(sizeData.classes).toBeDefined();
      expect(typeof sizeData.classes).toBe("string");

      expect(sizeData.buttonSize).toBeDefined();
      expect(typeof sizeData.buttonSize).toBe("string");

      expect(sizeData.dimensions).toBeDefined();
      expect(typeof sizeData.dimensions).toBe("object");

      expect(sizeData.inputClasses).toBeDefined();
      expect(typeof sizeData.inputClasses).toBe("object");
    }
  });
});
