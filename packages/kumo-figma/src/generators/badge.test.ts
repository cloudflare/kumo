/**
 * Tests for badge.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If badge styling changes, these tests
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
  getBadgeVariantConfig,
  getBadgeParsedBaseStyles,
  getBadgeParsedVariantStyles,
  getAllBadgeVariantData,
} from "./badge";
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

const badgeComponent = registry.components.Badge;
const badgeProps = badgeComponent.props;
const variantProp = badgeProps.variant as VariantProp;

/**
 * Base styles from component-registry.json
 */
const BADGE_BASE_STYLES = badgeComponent.baseStyles as string;

describe("Badge Generator - Registry Structure", () => {
  it("should have valid variant prop structure", () => {
    expectValidRegistryProp(variantProp, "variant");
  });

  it("should have a default variant that exists in values", () => {
    expect(variantProp.default).toBeDefined();
    expect(variantProp.values).toContain(variantProp.default);
  });

  it("should have base styles defined", () => {
    expect(BADGE_BASE_STYLES).toBeDefined();
    expect(typeof BADGE_BASE_STYLES).toBe("string");
    expect(BADGE_BASE_STYLES.length).toBeGreaterThan(0);
  });
});

describe("Badge Generator - Config Functions", () => {
  it("getBadgeVariantConfig should return registry data", () => {
    const config = getBadgeVariantConfig();
    expectGetterMatchesRegistry(config, variantProp, "getBadgeVariantConfig");
  });
});

describe("Badge Generator - Parser Integration", () => {
  describe("base styles parsing", () => {
    it("should parse base styles without errors", () => {
      expect(() => parseTailwindClasses(BADGE_BASE_STYLES)).not.toThrow();
    });

    it("should produce valid types from base styles", () => {
      const parsed = parseTailwindClasses(BADGE_BASE_STYLES);
      expectValidParsedTypes(parsed);
    });

    it("should produce positive layout values from base styles", () => {
      const parsed = parseTailwindClasses(BADGE_BASE_STYLES);
      expectPositiveLayoutValues(parsed);
    });

    it("should parse layout properties from base styles", () => {
      const parsed = parseTailwindClasses(BADGE_BASE_STYLES);
      // Base styles should define basic layout - check structure not values
      expect(
        parsed.borderRadius !== undefined ||
          parsed.paddingX !== undefined ||
          parsed.paddingY !== undefined,
      ).toBe(true);
    });

    it("should parse typography properties from base styles", () => {
      const parsed = parseTailwindClasses(BADGE_BASE_STYLES);
      // Base styles should define typography
      expect(
        parsed.fontSize !== undefined || parsed.fontWeight !== undefined,
      ).toBe(true);
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

describe("Badge Generator - Parsed Style Functions", () => {
  it("getBadgeParsedBaseStyles should return valid parsed result", () => {
    const baseStyles = getBadgeParsedBaseStyles();
    expect(baseStyles).toBeDefined();
    expect(typeof baseStyles).toBe("object");
    expectValidParsedTypes(baseStyles);
  });

  it("getBadgeParsedVariantStyles should work for all variants", () => {
    for (const variant of variantProp.values) {
      const result = getBadgeParsedVariantStyles(variant);
      expect(result.variant).toBe(variant);
      expect(result.classes).toBe(variantProp.classes[variant]);
      expect(result.description).toBe(variantProp.descriptions[variant]);
      expect(typeof result.parsed).toBe("object");
      expectValidParsedTypes(result.parsed);
    }
  });
});

describe("Badge Generator - getAllBadgeVariantData", () => {
  it("should return complete data structure", () => {
    const data = getAllBadgeVariantData();

    expect(data.baseStyles).toBeDefined();
    expect(data.baseStyles.raw).toBe(BADGE_BASE_STYLES);
    expect(data.baseStyles.parsed).toBeDefined();

    expect(data.variants).toBeDefined();
    expect(data.variants.length).toBe(variantProp.values.length);
  });

  it("should have complete data for each variant", () => {
    const data = getAllBadgeVariantData();

    for (const variant of data.variants) {
      expect(variant.variant).toBeDefined();
      expect(variantProp.values).toContain(variant.variant);
      expect(variant.classes).toBeDefined();
      expect(variant.description).toBeDefined();
      expect(variant.parsed).toBeDefined();
      expect(variant.layout).toBeDefined();
      expect(variant.text).toBeDefined();
    }
  });
});

describe("Badge Generator - Border Parsing", () => {
  /**
   * Test that border-related properties are correctly parsed.
   * This is behavioral - we test the parser handles borders correctly,
   * not which specific variants have borders.
   */

  it("should parse strokeWeight from border classes", () => {
    const parsed = parseTailwindClasses("border");
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeWeight).toBeDefined();
    expect(typeof parsed.strokeWeight).toBe("number");
  });

  it("should parse strokeWeight from border-2", () => {
    const parsed = parseTailwindClasses("border-2");
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeWeight).toBeDefined();
    expect(typeof parsed.strokeWeight).toBe("number");
  });

  it("should parse dashPattern from border-dashed", () => {
    const parsed = parseTailwindClasses("border border-dashed");
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.borderStyle).toBe("dashed");
    expect(parsed.dashPattern).toBeDefined();
    expect(Array.isArray(parsed.dashPattern)).toBe(true);
  });

  it("should not parse dashPattern for solid borders", () => {
    const parsed = parseTailwindClasses("border");
    expect(parsed.borderStyle).toBeUndefined();
    expect(parsed.dashPattern).toBeUndefined();
  });
});

describe("Badge Generator - Color Parsing", () => {
  /**
   * Test that color-related properties are correctly parsed.
   * This tests parser behavior, not specific colors used in badges.
   */

  it("should parse fill variable from bg-* classes", () => {
    const parsed = parseTailwindClasses("bg-kumo-brand");
    expect(parsed.fillVariable).toBeDefined();
    expect(typeof parsed.fillVariable).toBe("string");
  });

  it("should parse null fill for transparent backgrounds", () => {
    const parsed = parseTailwindClasses("bg-transparent");
    expect(parsed.fillVariable).toBeNull();
  });

  it("should parse text variable from text-* classes", () => {
    const parsed = parseTailwindClasses("text-kumo-default");
    expect(parsed.textVariable).toBeDefined();
    expect(typeof parsed.textVariable).toBe("string");
  });

  it("should detect white text", () => {
    const parsed = parseTailwindClasses("text-white");
    expect(parsed.isWhiteText).toBe(true);
    expect(parsed.textVariable).toBeNull();
  });

  it("should parse stroke variable from border-* color classes", () => {
    const parsed = parseTailwindClasses("border border-kumo-brand");
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeVariable).toBeDefined();
    expect(typeof parsed.strokeVariable).toBe("string");
  });
});
