/**
 * Tests for banner.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If banner styling changes, these tests
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
  getBannerVariantConfig,
  getBannerParsedBaseStyles,
  getBannerParsedVariantStyles,
  getAllBannerVariantData,
} from "./banner";
import {
  expectValidRegistryProp,
  expectAllClassesParsable,
  expectValidParsedTypes,
  expectPositiveLayoutValues,
  expectGetterMatchesRegistry,
  type VariantProp,
} from "./_test-utils";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const bannerComponent = registry.components
  .Banner as typeof registry.components.Banner & {
  baseStyles?: string;
};
const bannerProps = bannerComponent.props;
const variantProp = bannerProps.variant as VariantProp;

/**
 * Base styles from component-registry.json
 */
const BANNER_BASE_STYLES =
  bannerComponent.baseStyles ||
  "flex w-full items-center gap-2 rounded-lg border px-4 py-1.5 text-base";

describe("Banner Generator - Registry Structure", () => {
  it("should have valid variant prop structure", () => {
    expectValidRegistryProp(variantProp, "variant");
  });

  it("should have a default variant that exists in values", () => {
    expect(variantProp.default).toBeDefined();
    expect(variantProp.values).toContain(variantProp.default);
  });

  it("should have base styles defined or fallback", () => {
    expect(BANNER_BASE_STYLES).toBeDefined();
    expect(typeof BANNER_BASE_STYLES).toBe("string");
    expect(BANNER_BASE_STYLES.length).toBeGreaterThan(0);
  });
});

describe("Banner Generator - Config Functions", () => {
  it("getBannerVariantConfig should return registry data", () => {
    const config = getBannerVariantConfig();
    expectGetterMatchesRegistry(config, variantProp, "getBannerVariantConfig");
  });
});

describe("Banner Generator - Parser Integration", () => {
  describe("base styles parsing", () => {
    it("should parse base styles without errors", () => {
      expect(() => parseTailwindClasses(BANNER_BASE_STYLES)).not.toThrow();
    });

    it("should produce valid types from base styles", () => {
      const parsed = parseTailwindClasses(BANNER_BASE_STYLES);
      expectValidParsedTypes(parsed);
    });

    it("should produce positive layout values from base styles", () => {
      const parsed = parseTailwindClasses(BANNER_BASE_STYLES);
      expectPositiveLayoutValues(parsed);
    });

    it("should parse layout properties from base styles", () => {
      const parsed = parseTailwindClasses(BANNER_BASE_STYLES);
      // Base styles should define basic layout
      expect(
        parsed.borderRadius !== undefined ||
          parsed.paddingX !== undefined ||
          parsed.paddingY !== undefined ||
          parsed.gap !== undefined,
      ).toBe(true);
    });

    it("should detect border presence from base styles", () => {
      const parsed = parseTailwindClasses(BANNER_BASE_STYLES);
      // Banner has border in base styles
      expect(parsed.hasBorder).toBe(true);
    });
  });

  describe("variant classes parsing", () => {
    it("should parse all variant classes without errors", () => {
      expectAllClassesParsable(variantProp, "variant");
    });

    it("should produce valid types for all variants", () => {
      for (const variant of variantProp.values) {
        const classes = variantProp.classes[variant];
        const parsed = parseTailwindClasses(classes);
        expectValidParsedTypes(parsed);
      }
    });

    it("should produce positive layout values for all variants", () => {
      for (const variant of variantProp.values) {
        const classes = variantProp.classes[variant];
        const parsed = parseTailwindClasses(classes);
        expectPositiveLayoutValues(parsed);
      }
    });
  });
});

describe("Banner Generator - Parsed Style Functions", () => {
  it("getBannerParsedBaseStyles should return valid parsed result", () => {
    const baseStyles = getBannerParsedBaseStyles();
    expect(baseStyles).toBeDefined();
    expect(typeof baseStyles).toBe("object");
    expectValidParsedTypes(baseStyles);
  });

  it("getBannerParsedVariantStyles should work for all variants", () => {
    for (const variant of variantProp.values) {
      const result = getBannerParsedVariantStyles(variant);
      expect(result.variant).toBe(variant);
      expect(result.classes).toBe(variantProp.classes[variant]);
      expect(result.description).toBe(variantProp.descriptions[variant]);
      expect(typeof result.parsed).toBe("object");
      expectValidParsedTypes(result.parsed);
    }
  });
});

describe("Banner Generator - getAllBannerVariantData", () => {
  it("should return complete data structure", () => {
    const data = getAllBannerVariantData();

    expect(data.baseStyles).toBeDefined();
    expect(data.baseStyles.raw).toBeDefined();
    expect(data.baseStyles.parsed).toBeDefined();

    expect(data.variants).toBeDefined();
    expect(data.variants.length).toBe(variantProp.values.length);
  });

  it("should have complete data for each variant", () => {
    const data = getAllBannerVariantData();

    for (const variant of data.variants) {
      expect(variant.variant).toBeDefined();
      expect(variantProp.values).toContain(variant.variant);
      expect(variant.classes).toBeDefined();
      expect(variant.description).toBeDefined();
      expect(variant.parsed).toBeDefined();
      expect(variant.layout).toBeDefined();
      expect(variant.icon).toBeDefined();
      expect(variant.text).toBeDefined();
    }
  });

  it("should have icon data for each variant", () => {
    const data = getAllBannerVariantData();

    for (const variant of data.variants) {
      expect(variant.icon.iconId).toBeDefined();
      expect(typeof variant.icon.iconId).toBe("string");
      expect(variant.icon.iconSize).toBeDefined();
      expect(typeof variant.icon.iconSize).toBe("number");
      expect(variant.icon.iconSize).toBeGreaterThan(0);
    }
  });

  it("should have text data for each variant", () => {
    const data = getAllBannerVariantData();

    for (const variant of data.variants) {
      expect(variant.text.fontSize).toBeDefined();
      expect(typeof variant.text.fontSize).toBe("number");
      expect(variant.text.fontSize).toBeGreaterThan(0);
      expect(variant.text.fontWeight).toBeDefined();
      expect(typeof variant.text.fontWeight).toBe("number");
    }
  });
});

describe("Banner Generator - Color Parsing", () => {
  /**
   * Test that color-related properties are correctly parsed.
   * This tests parser behavior, not specific colors used in banners.
   */

  it("should parse fill variable with opacity modifier", () => {
    const parsed = parseTailwindClasses("bg-kumo-info/20");
    expect(parsed.fillVariable).toBeDefined();
    expect(typeof parsed.fillVariable).toBe("string");
    expect(parsed.fillVariable).toContain("/20");
  });

  it("should parse text variable from text-* classes", () => {
    const parsed = parseTailwindClasses("text-kumo-link");
    expect(parsed.textVariable).toBeDefined();
    expect(typeof parsed.textVariable).toBe("string");
  });

  it("should parse stroke variable from border-* color classes", () => {
    const parsed = parseTailwindClasses("border border-kumo-info");
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeVariable).toBeDefined();
    expect(typeof parsed.strokeVariable).toBe("string");
  });
});
