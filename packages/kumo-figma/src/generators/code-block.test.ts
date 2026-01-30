/**
 * Tests for code-block.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If code-block styling changes, these tests
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

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const codeComponent = registry.components.Code as any;
const codeBlockSubComponent = codeComponent.subComponents?.Block;
const codeStyling = codeComponent.styling;
const codeProps = codeComponent.props;

const langProp = codeProps.lang as {
  values: string[];
  descriptions: Record<string, string>;
  default: string;
};

/**
 * Container styles - either from registry or fallback
 * The generator uses CODE_BLOCK_WRAPPER_STYLES as fallback
 */
const CODE_BLOCK_WRAPPER_STYLES =
  "min-w-0 rounded-md border border-kumo-fill bg-kumo-base";

describe("CodeBlock Generator - Registry Structure", () => {
  /**
   * These tests verify the registry has the required structure
   * for the generator to work. They don't test specific values.
   */

  it("should have Code component in registry", () => {
    expect(codeComponent).toBeDefined();
  });

  it("should have Code.Block sub-component in registry", () => {
    expect(codeBlockSubComponent).toBeDefined();
    expect(codeBlockSubComponent.name).toBeDefined();
  });

  it("should have Code.Block props defined", () => {
    expect(codeBlockSubComponent.props).toBeDefined();
    expect(codeBlockSubComponent.props.code).toBeDefined();
  });

  it("should have styling metadata defined", () => {
    expect(codeStyling).toBeDefined();
    expect(typeof codeStyling).toBe("object");
  });

  describe("lang prop", () => {
    it("should have at least one lang defined", () => {
      expect(langProp.values.length).toBeGreaterThan(0);
    });

    it("should have a default lang that exists in values", () => {
      expect(langProp.default).toBeDefined();
      expect(langProp.values).toContain(langProp.default);
    });

    it("should have descriptions defined for all langs", () => {
      for (const lang of langProp.values) {
        expect(langProp.descriptions[lang]).toBeDefined();
        expect(typeof langProp.descriptions[lang]).toBe("string");
        expect(langProp.descriptions[lang].length).toBeGreaterThan(0);
      }
    });
  });
});

describe("CodeBlock Generator - Container Styles Parsing", () => {
  /**
   * These tests verify the parser produces valid Figma-compatible output
   * for the container styles (using fallback styles since registry may not have them).
   */

  it("should parse container styles without errors", () => {
    expect(() => parseTailwindClasses(CODE_BLOCK_WRAPPER_STYLES)).not.toThrow();
  });

  it("should produce valid types from container styles", () => {
    const parsed = parseTailwindClasses(CODE_BLOCK_WRAPPER_STYLES);

    expect(typeof parsed).toBe("object");

    // If borderRadius is parsed, it should be a positive number
    if (parsed.borderRadius !== undefined) {
      expect(typeof parsed.borderRadius).toBe("number");
      expect(parsed.borderRadius).toBeGreaterThan(0);
    }

    // If hasBorder is parsed, it should be a boolean
    if (parsed.hasBorder !== undefined) {
      expect(typeof parsed.hasBorder).toBe("boolean");
    }

    // If strokeWeight is parsed, it should be a positive number
    if (parsed.strokeWeight !== undefined) {
      expect(typeof parsed.strokeWeight).toBe("number");
      expect(parsed.strokeWeight).toBeGreaterThan(0);
    }

    // If fillVariable is parsed, it should be a string or null
    if (parsed.fillVariable !== undefined) {
      expect(
        parsed.fillVariable === null || typeof parsed.fillVariable === "string",
      ).toBe(true);
    }

    // If strokeVariable is parsed, it should be a string or null
    if (parsed.strokeVariable !== undefined) {
      expect(
        parsed.strokeVariable === null ||
          typeof parsed.strokeVariable === "string",
      ).toBe(true);
    }
  });

  it("should parse border-related properties from container styles", () => {
    const parsed = parseTailwindClasses(CODE_BLOCK_WRAPPER_STYLES);

    // Container should have border
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeWeight).toBeDefined();
    expect(typeof parsed.strokeWeight).toBe("number");
  });

  it("should parse fill variable from container styles", () => {
    const parsed = parseTailwindClasses(CODE_BLOCK_WRAPPER_STYLES);

    expect(parsed.fillVariable).toBeDefined();
    expect(typeof parsed.fillVariable).toBe("string");
  });

  it("should parse stroke variable from container styles", () => {
    const parsed = parseTailwindClasses(CODE_BLOCK_WRAPPER_STYLES);

    expect(parsed.strokeVariable).toBeDefined();
    expect(typeof parsed.strokeVariable).toBe("string");
  });

  it("should parse borderRadius from container styles", () => {
    const parsed = parseTailwindClasses(CODE_BLOCK_WRAPPER_STYLES);

    expect(parsed.borderRadius).toBeDefined();
    expect(typeof parsed.borderRadius).toBe("number");
    expect(parsed.borderRadius).toBeGreaterThan(0);
  });
});

describe("CodeBlock Generator - Lang Variants", () => {
  /**
   * Tests for lang variant structure and placeholder text generation.
   */

  it("should have at least one lang variant", () => {
    expect(langProp.values.length).toBeGreaterThan(0);
  });

  it("should have descriptions for all lang variants", () => {
    for (const lang of langProp.values) {
      expect(langProp.descriptions[lang]).toBeDefined();
      expect(typeof langProp.descriptions[lang]).toBe("string");
    }
  });

  it("should have default lang in values", () => {
    expect(langProp.values).toContain(langProp.default);
  });
});

describe("CodeBlock Generator - Color Token Parsing", () => {
  /**
   * Test that color-related properties are correctly parsed.
   * This tests parser behavior, not specific colors used in code blocks.
   */

  it("should parse fill variable from bg-kumo-base", () => {
    const parsed = parseTailwindClasses("bg-kumo-base");
    expect(parsed.fillVariable).toBeDefined();
    expect(typeof parsed.fillVariable).toBe("string");
  });

  it("should parse stroke variable from border-kumo-fill", () => {
    const parsed = parseTailwindClasses("border border-kumo-fill");
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeVariable).toBeDefined();
    expect(typeof parsed.strokeVariable).toBe("string");
  });
});

describe("CodeBlock Generator - Border Parsing", () => {
  /**
   * Test that border-related properties are correctly parsed.
   */

  it("should parse border as having border", () => {
    const parsed = parseTailwindClasses("border");
    expect(parsed.hasBorder).toBe(true);
  });

  it("should parse strokeWeight from border", () => {
    const parsed = parseTailwindClasses("border");
    expect(parsed.strokeWeight).toBeDefined();
    expect(typeof parsed.strokeWeight).toBe("number");
    expect(parsed.strokeWeight).toBe(1);
  });

  it("should parse borderRadius from rounded-md", () => {
    const parsed = parseTailwindClasses("rounded-md");
    expect(parsed.borderRadius).toBeDefined();
    expect(typeof parsed.borderRadius).toBe("number");
    expect(parsed.borderRadius).toBeGreaterThan(0);
  });
});

describe("CodeBlock Generator - Figma Output Structure", () => {
  /**
   * These tests document the expected Figma component properties.
   * They test structural invariants, not specific values.
   */

  it("should produce valid Figma layout properties for container", () => {
    const parsed = parseTailwindClasses(CODE_BLOCK_WRAPPER_STYLES);

    // Verify all properties are valid for Figma
    expect(typeof parsed.borderRadius).toBe("number");
    expect(parsed.borderRadius).toBeGreaterThan(0);

    expect(typeof parsed.strokeWeight).toBe("number");
    expect(parsed.strokeWeight).toBeGreaterThan(0);
  });

  it("should have valid color tokens for container", () => {
    const parsed = parseTailwindClasses(CODE_BLOCK_WRAPPER_STYLES);

    expect(typeof parsed.fillVariable).toBe("string");
    expect((parsed.fillVariable as string).length).toBeGreaterThan(0);

    expect(typeof parsed.strokeVariable).toBe("string");
    expect((parsed.strokeVariable as string).length).toBeGreaterThan(0);
  });
});

describe("CodeBlock Generator - Styling Metadata", () => {
  /**
   * Test that styling metadata has required structure.
   */

  it("should have baseTokens defined", () => {
    expect(codeStyling.baseTokens).toBeDefined();
    expect(Array.isArray(codeStyling.baseTokens)).toBe(true);
  });

  it("should have typography defined", () => {
    expect(codeStyling.typography).toBeDefined();
    expect(typeof codeStyling.typography).toBe("object");
  });

  it("should have dimensions defined", () => {
    expect(codeStyling.dimensions).toBeDefined();
    expect(typeof codeStyling.dimensions).toBe("object");
  });

  it("should have appearance defined", () => {
    expect(codeStyling.appearance).toBeDefined();
    expect(typeof codeStyling.appearance).toBe("object");
  });
});
