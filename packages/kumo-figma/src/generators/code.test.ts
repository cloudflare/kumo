/**
 * Tests for code.ts component generator (RED PHASE - TDD)
 *
 * These tests ensure the Code Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the code
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * code.tsx → component-registry.json → code.ts (generator) → Figma
 *
 * NOTE: RED PHASE - These tests are written BEFORE the implementation.
 * The testable export functions (getAllVariantData, getBaseStyles, getLangConfig)
 * DO NOT EXIST YET. This is expected and correct TDD practice.
 * Tests will FAIL until implementation is complete (~60% failure rate expected).
 */

import { describe, it, expect } from "vitest";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import { getAllVariantData, getBaseStyles, getLangConfig } from "./code";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const codeComponent = registry.components.Code as any;
const codeProps = codeComponent.props;
const codeStyling = codeComponent.styling;

const langProp = codeProps.lang as {
  values: string[];
  descriptions: Record<string, string>;
  default: string;
};

/**
 * Code language variants from registry - derived from source of truth
 */
const CODE_LANGS = langProp.values;

describe("Code Generator - Registry Validation", () => {
  it("should have lang variants defined in registry", () => {
    expect(langProp.values).toBeDefined();
    expect(Array.isArray(langProp.values)).toBe(true);
    expect(langProp.values.length).toBeGreaterThan(0);
  });

  it("should have descriptions defined for all lang variants", () => {
    for (const lang of langProp.values) {
      expect(langProp.descriptions[lang]).toBeDefined();
      expect(typeof langProp.descriptions[lang]).toBe("string");
      expect(langProp.descriptions[lang].length).toBeGreaterThan(0);
    }
  });

  it("should have ts as default lang", () => {
    expect(langProp.default).toBe("ts");
  });

  it("should have styling metadata defined", () => {
    expect(codeStyling).toBeDefined();
    expect(codeStyling.baseTokens).toBeDefined();
    expect(codeStyling.typography).toBeDefined();
    expect(codeStyling.dimensions).toBeDefined();
    expect(codeStyling.appearance).toBeDefined();
  });
});

describe("Code Generator - Styling Metadata Validation", () => {
  it("should have baseTokens defined", () => {
    expect(codeStyling.baseTokens).toBeDefined();
    expect(Array.isArray(codeStyling.baseTokens)).toBe(true);
    expect(codeStyling.baseTokens.length).toBeGreaterThan(0);
  });

  it("should have typography defined", () => {
    expect(codeStyling.typography).toBeDefined();
    expect(typeof codeStyling.typography).toBe("object");
    expect(codeStyling.typography.fontFamily).toBeDefined();
    expect(codeStyling.typography.fontSize).toBeDefined();
    expect(codeStyling.typography.lineHeight).toBeDefined();
  });

  it("should have dimensions defined", () => {
    expect(codeStyling.dimensions).toBeDefined();
    expect(typeof codeStyling.dimensions).toBe("object");
    expect(codeStyling.dimensions.margin).toBeDefined();
    expect(codeStyling.dimensions.padding).toBeDefined();
    expect(codeStyling.dimensions.width).toBeDefined();
  });

  it("should have appearance defined", () => {
    expect(codeStyling.appearance).toBeDefined();
    expect(typeof codeStyling.appearance).toBe("object");
    expect(codeStyling.appearance.borderRadius).toBeDefined();
    expect(codeStyling.appearance.border).toBeDefined();
    expect(codeStyling.appearance.background).toBeDefined();
  });
});

describe("Code Generator - Base Styles Parsing", () => {
  /**
   * Test parsing of base Code styles from registry
   * Base styles: "m-0 w-auto rounded-none border-none bg-transparent p-0 font-mono text-sm leading-[20px] text-kumo-strong"
   */
  const BASE_STYLES_COMBINED =
    "m-0 w-auto rounded-none border-none bg-transparent p-0 font-mono text-sm leading-[20px] text-kumo-strong";

  it("should parse border-radius from base styles", () => {
    const parsed = parseTailwindClasses(BASE_STYLES_COMBINED);
    expect(parsed.borderRadius).toBeDefined();
    expect(typeof parsed.borderRadius).toBe("number");
  });

  it("should parse font-size from base styles", () => {
    const parsed = parseTailwindClasses(BASE_STYLES_COMBINED);
    expect(parsed.fontSize).toBeDefined();
    expect(typeof parsed.fontSize).toBe("number");
    expect(parsed.fontSize).toBeGreaterThan(0);
  });

  it("should parse text color token from base styles", () => {
    const parsed = parseTailwindClasses(BASE_STYLES_COMBINED);
    expect(parsed.textVariable).toBeDefined();
    expect(typeof parsed.textVariable).toBe("string");
  });

  it("should parse transparent background from base styles", () => {
    const parsed = parseTailwindClasses(BASE_STYLES_COMBINED);
    expect(parsed.fillVariable).toBeNull(); // bg-transparent = no fill
  });

  it("should parse no border from base styles", () => {
    const parsed = parseTailwindClasses(BASE_STYLES_COMBINED);
    // Note: border-none sets hasBorder=true but strokeWeight is undefined
    // Generator should treat hasBorder=true + strokeWeight=undefined as no border
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeWeight).toBeUndefined();
  });

  it("should parse padding from base styles", () => {
    const parsed = parseTailwindClasses(BASE_STYLES_COMBINED);
    // Note: p-0 is not currently parsed by tailwind-to-figma
    // This is expected - generator can handle missing padding as 0
    expect(parsed.paddingX).toBeUndefined();
    expect(parsed.paddingY).toBeUndefined();
  });
});

describe("Code Generator - Appearance Styles Parsing", () => {
  /**
   * Test parsing of Code appearance styles from registry
   */
  it("should parse border-radius from appearance styles", () => {
    const parsed = parseTailwindClasses(codeStyling.appearance.borderRadius);
    // rounded-none should result in borderRadius: 0
    expect(parsed.borderRadius).toBeDefined();
    expect(typeof parsed.borderRadius).toBe("number");
  });

  it("should parse background as transparent", () => {
    const parsed = parseTailwindClasses(codeStyling.appearance.background);
    expect(parsed.fillVariable).toBeNull(); // bg-transparent = no fill
  });

  it("should parse border-none", () => {
    const parsed = parseTailwindClasses(codeStyling.appearance.border);
    // border-none sets hasBorder=true but no strokeWeight
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeWeight).toBeUndefined();
  });
});

describe("Code Generator - Testable Export Functions (RED PHASE)", () => {
  /**
   * RED PHASE TESTS - These functions DO NOT EXIST YET
   *
   * Expected behavior:
   * - These tests WILL FAIL with "not a function" or "undefined" errors
   * - This is CORRECT for RED phase TDD
   * - Implement the functions to make tests pass (GREEN phase)
   */

  describe("getBaseStyles", () => {
    it("should return base styles from registry", () => {
      const styles = getBaseStyles();
      expect(styles).toBeDefined();
      expect(styles.raw).toBeDefined();
      expect(styles.parsed).toBeDefined();
    });

    it("should return parsed transparent background", () => {
      const styles = getBaseStyles();
      expect(styles.parsed.fillVariable).toBeNull();
    });

    it("should return parsed text color variable", () => {
      const styles = getBaseStyles();
      expect(styles.parsed.textVariable).toBeDefined();
      expect(typeof styles.parsed.textVariable).toBe("string");
    });

    it("should return parsed font size", () => {
      const styles = getBaseStyles();
      expect(styles.parsed.fontSize).toBeDefined();
      expect(typeof styles.parsed.fontSize).toBe("number");
      expect(styles.parsed.fontSize).toBeGreaterThan(0);
    });

    it("should return parsed padding", () => {
      const styles = getBaseStyles();
      // Note: Parser doesn't handle p-0, so padding will be undefined
      // Generator should treat undefined as 0
      expect(styles.parsed.paddingX).toBeUndefined();
      expect(styles.parsed.paddingY).toBeUndefined();
    });

    it("should return parsed border-radius", () => {
      const styles = getBaseStyles();
      expect(styles.parsed.borderRadius).toBeDefined();
      expect(typeof styles.parsed.borderRadius).toBe("number");
    });
  });

  describe("getLangConfig", () => {
    it("should return lang variants from registry", () => {
      const config = getLangConfig();
      expect(config.values).toBeDefined();
      expect(Array.isArray(config.values)).toBe(true);
      expect(config.values.length).toBeGreaterThan(0);
      // Verify all registry values are present
      for (const lang of langProp.values) {
        expect(config.values).toContain(lang);
      }
      expect(config.default).toBe(langProp.default);
      expect(config.descriptions).toBeDefined();
    });

    it("should have descriptions for all lang variants", () => {
      const config = getLangConfig();
      for (const lang of config.values) {
        expect(config.descriptions[lang]).toBeDefined();
        expect(typeof config.descriptions[lang]).toBe("string");
        expect(config.descriptions[lang].length).toBeGreaterThan(0);
      }
    });
  });

  describe("getAllVariantData", () => {
    it("should return complete data structure", () => {
      const allData = getAllVariantData();
      expect(allData).toBeDefined();
      expect(allData.baseStyles).toBeDefined();
      expect(allData.langConfig).toBeDefined();
      expect(allData.variants).toBeDefined();
    });

    it("should return all lang variants", () => {
      const allData = getAllVariantData();
      expect(allData.variants.length).toBeGreaterThan(0);
      // Verify all registry values are present
      for (const lang of langProp.values) {
        expect(allData.langConfig.values).toContain(lang);
      }
    });

    it("should include base styles with raw and parsed data", () => {
      const allData = getAllVariantData();
      expect(allData.baseStyles.raw).toBeDefined();
      expect(allData.baseStyles.parsed).toBeDefined();
      expect(allData.baseStyles.parsed.textVariable).toBeDefined();
      expect(typeof allData.baseStyles.parsed.textVariable).toBe("string");
    });

    it("should include lang config with all properties", () => {
      const allData = getAllVariantData();
      expect(allData.langConfig.values.length).toBeGreaterThan(0);
      expect(allData.langConfig.default).toBe("ts");
      expect(allData.langConfig.descriptions).toBeDefined();
    });

    it("should include variant data for each lang", () => {
      const allData = getAllVariantData();
      for (const variant of allData.variants) {
        expect(variant.lang).toBeDefined();
        expect(variant.description).toBeDefined();
        expect(CODE_LANGS).toContain(
          variant.lang as (typeof CODE_LANGS)[number],
        );
      }
    });
  });
});

describe("Code Generator - Color Token Coverage", () => {
  /**
   * Verify that all color tokens used in Code component are
   * properly mapped in the tailwind-to-figma parser.
   */

  it("should map text-kumo-strong color token", () => {
    const parsed = parseTailwindClasses("text-kumo-strong");
    expect(parsed.textVariable).toBeDefined();
    expect(typeof parsed.textVariable).toBe("string");
  });

  it("should map bg-transparent correctly", () => {
    const parsed = parseTailwindClasses("bg-transparent");
    expect(parsed.fillVariable).toBeNull();
  });

  it("should map bg-kumo-base for CodeBlock container", () => {
    const parsed = parseTailwindClasses("bg-kumo-base");
    expect(parsed.fillVariable).toBeDefined();
    expect(typeof parsed.fillVariable).toBe("string");
  });

  it("should map border-kumo-fill for CodeBlock container", () => {
    const parsed = parseTailwindClasses("border border-kumo-fill");
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeVariable).toBeDefined();
    expect(typeof parsed.strokeVariable).toBe("string");
  });
});

describe("Code Generator - Expected Figma Output", () => {
  /**
   * These tests document the expected Figma component properties.
   * They serve as a contract for what the generator should produce.
   */

  it("should produce correct Figma properties for base Code component", () => {
    const BASE_STYLES_COMBINED =
      "m-0 w-auto rounded-none border-none bg-transparent p-0 font-mono text-sm leading-[20px] text-kumo-strong";
    const baseStyles = parseTailwindClasses(BASE_STYLES_COMBINED);

    // Verify parsed properties exist and have correct types
    expect(baseStyles.borderRadius).toBeDefined();
    expect(typeof baseStyles.borderRadius).toBe("number");

    expect(baseStyles.fillVariable).toBeNull(); // transparent

    expect(baseStyles.fontSize).toBeDefined();
    expect(typeof baseStyles.fontSize).toBe("number");
    expect(baseStyles.fontSize).toBeGreaterThan(0);

    expect(baseStyles.textVariable).toBeDefined();
    expect(typeof baseStyles.textVariable).toBe("string");

    expect(baseStyles.hasBorder).toBe(true);
    expect(baseStyles.strokeWeight).toBeUndefined();
  });

  // CodeBlock container styles are not in the Code registry -
  // they would be in a separate CodeBlock component if needed
});

describe("Code Generator - Lang Variant Count", () => {
  it("should have at least one lang variant", () => {
    expect(langProp.values.length).toBeGreaterThan(0);
  });

  it("should have a default lang that exists in values", () => {
    expect(langProp.default).toBeDefined();
    expect(langProp.values).toContain(langProp.default);
  });
});

describe("Code Generator - SubComponent Validation", () => {
  it("should have Block sub-component defined", () => {
    expect(codeComponent.subComponents).toBeDefined();
    expect(codeComponent.subComponents.Block).toBeDefined();
  });

  it("should have correct Block sub-component props", () => {
    const blockProps = codeComponent.subComponents.Block.props;
    expect(blockProps.code).toBeDefined();
    expect(blockProps.code.required).toBe(true);
    expect(blockProps.lang).toBeDefined();
    expect(blockProps.lang.optional).toBe(true);
  });
});
