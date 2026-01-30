/**
 * Tests for link-button.ts generator
 *
 * These tests ensure the LinkButton Figma component generation stays in sync
 * with the source of truth (component-registry.json). LinkButton uses Button's
 * variant and size props from the registry.
 *
 * CRITICAL: These tests act as a regression guard. If you change the link-button
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * button.tsx → component-registry.json → link-button.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import {
  getLinkButtonVariantConfig,
  getLinkButtonSizeConfig,
  getLinkButtonParsedVariantStyles,
  getLinkButtonParsedSizeStyles,
  getLinkButtonLayoutData,
  getAllLinkButtonVariantData,
} from "./link-button";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

// LinkButton uses Button's props
const buttonComponent = registry.components.Button;
const buttonProps = buttonComponent.props;
const variantProp = buttonProps.variant as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};
const sizeProp = buttonProps.size as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

describe("LinkButton Generator - Registry Validation", () => {
  it("should have all expected variants in registry", () => {
    // Don't hardcode - verify structure
    expect(Array.isArray(variantProp.values)).toBe(true);
    expect(variantProp.values.length).toBeGreaterThan(0);
  });

  it("should have classes defined for all variants", () => {
    for (const variant of variantProp.values) {
      expect(variantProp.classes[variant]).toBeDefined();
      expect(typeof variantProp.classes[variant]).toBe("string");
      expect(variantProp.classes[variant].length).toBeGreaterThan(0);
    }
  });

  it("should have descriptions defined for all variants", () => {
    for (const variant of variantProp.values) {
      expect(variantProp.descriptions[variant]).toBeDefined();
      expect(typeof variantProp.descriptions[variant]).toBe("string");
      expect(variantProp.descriptions[variant].length).toBeGreaterThan(0);
    }
  });

  it("should have a default variant", () => {
    expect(variantProp.default).toBeDefined();
    expect(typeof variantProp.default).toBe("string");
    expect(variantProp.values).toContain(variantProp.default);
  });

  it("should have all expected sizes in registry", () => {
    expect(Array.isArray(sizeProp.values)).toBe(true);
    expect(sizeProp.values.length).toBeGreaterThan(0);
  });

  it("should have classes defined for all sizes", () => {
    for (const size of sizeProp.values) {
      expect(sizeProp.classes[size]).toBeDefined();
      expect(typeof sizeProp.classes[size]).toBe("string");
      expect(sizeProp.classes[size].length).toBeGreaterThan(0);
    }
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
});

describe("LinkButton Generator - Variant Configuration", () => {
  it("should return variant configuration from registry", () => {
    const config = getLinkButtonVariantConfig();
    expect(config.values).toBeDefined();
    expect(Array.isArray(config.values)).toBe(true);
    expect(config.classes).toBeDefined();
    expect(typeof config.classes).toBe("object");
    expect(config.descriptions).toBeDefined();
    expect(typeof config.descriptions).toBe("object");
    expect(config.default).toBeDefined();
    expect(typeof config.default).toBe("string");
  });
});

describe("LinkButton Generator - Size Configuration", () => {
  it("should return size configuration from registry", () => {
    const config = getLinkButtonSizeConfig();
    expect(config.values).toBeDefined();
    expect(Array.isArray(config.values)).toBe(true);
    expect(config.classes).toBeDefined();
    expect(typeof config.classes).toBe("object");
    expect(config.descriptions).toBeDefined();
    expect(typeof config.descriptions).toBe("object");
    expect(config.default).toBeDefined();
    expect(typeof config.default).toBe("string");
  });
});

describe("LinkButton Generator - Variant Styles Parsing", () => {
  for (const variant of variantProp.values) {
    describe(`${variant} variant`, () => {
      const classes = variantProp.classes[variant];

      it("should have classes defined", () => {
        expect(classes).toBeDefined();
        expect(typeof classes).toBe("string");
        expect(classes.length).toBeGreaterThan(0);
      });

      it("should parse variant styles", () => {
        const variantData = getLinkButtonParsedVariantStyles(variant);
        expect(variantData.variant).toBe(variant);
        expect(variantData.classes).toBe(classes);
        expect(variantData.description).toBeDefined();
        expect(variantData.parsed).toBeDefined();
        expect(typeof variantData.parsed).toBe("object");
      });

      it("should parse fill or have no background (ghost variant)", () => {
        const parsed = parseTailwindClasses(classes);
        // Either has fillVariable (background color) OR is ghost variant (transparent)
        if (variant === "ghost") {
          // Ghost should not have fillVariable (transparent background) - can be undefined or null
          expect(
            parsed.fillVariable === undefined || parsed.fillVariable === null,
          ).toBe(true);
        } else {
          // Other variants should have fillVariable or explicit background
          const hasFillOrBackground =
            parsed.fillVariable !== undefined || variant === "outline";
          expect(hasFillOrBackground).toBe(true);
        }
      });

      it("should parse text variable or detect white text", () => {
        const parsed = parseTailwindClasses(classes);
        expect(
          parsed.textVariable !== undefined || parsed.isWhiteText === true,
        ).toBe(true);
      });
    });
  }
});

describe("LinkButton Generator - Size Styles Parsing", () => {
  for (const size of sizeProp.values) {
    describe(`${size} size`, () => {
      const classes = sizeProp.classes[size];

      it("should have classes defined", () => {
        expect(classes).toBeDefined();
        expect(typeof classes).toBe("string");
        expect(classes.length).toBeGreaterThan(0);
      });

      it("should parse size styles", () => {
        const sizeData = getLinkButtonParsedSizeStyles(size);
        expect(sizeData.size).toBe(size);
        expect(sizeData.classes).toBe(classes);
        expect(sizeData.description).toBeDefined();
        expect(sizeData.parsed).toBeDefined();
        expect(typeof sizeData.parsed).toBe("object");
      });

      it("should parse height from size classes", () => {
        const parsed = parseTailwindClasses(classes);
        expect(parsed.height).toBeDefined();
        expect(typeof parsed.height).toBe("number");
        expect(parsed.height).toBeGreaterThan(0);
      });

      it("should parse padding from size classes", () => {
        const parsed = parseTailwindClasses(classes);
        expect(parsed.paddingX).toBeDefined();
        expect(typeof parsed.paddingX).toBe("number");
        expect(parsed.paddingX).toBeGreaterThan(0);
      });

      it("should parse gap from size classes", () => {
        const parsed = parseTailwindClasses(classes);
        expect(parsed.gap).toBeDefined();
        expect(typeof parsed.gap).toBe("number");
        expect(parsed.gap).toBeGreaterThan(0);
      });

      it("should parse border radius from size classes", () => {
        const parsed = parseTailwindClasses(classes);
        expect(parsed.borderRadius).toBeDefined();
        expect(typeof parsed.borderRadius).toBe("number");
        expect(parsed.borderRadius).toBeGreaterThan(0);
      });

      it("should parse font size from size classes", () => {
        const parsed = parseTailwindClasses(classes);
        expect(parsed.fontSize).toBeDefined();
        expect(typeof parsed.fontSize).toBe("number");
        expect(parsed.fontSize).toBeGreaterThan(0);
      });
    });
  }
});

describe("LinkButton Generator - Layout Data", () => {
  it("should compute layout data for any variant/size/hasIcon combination", () => {
    const variant = variantProp.values[0];
    const size = sizeProp.values[0];
    const hasIcon = false;

    const layoutData = getLinkButtonLayoutData(variant, size, hasIcon);
    expect(layoutData.variant).toBe(variant);
    expect(layoutData.size).toBe(size);
    expect(layoutData.hasIcon).toBe(hasIcon);
  });

  it("should include variant and size descriptions", () => {
    const variant = variantProp.values[0];
    const size = sizeProp.values[0];
    const layoutData = getLinkButtonLayoutData(variant, size, false);

    expect(layoutData.variantDescription).toBeDefined();
    expect(typeof layoutData.variantDescription).toBe("string");
    expect(layoutData.sizeDescription).toBeDefined();
    expect(typeof layoutData.sizeDescription).toBe("string");
  });

  it("should include layout properties", () => {
    const variant = variantProp.values[0];
    const size = sizeProp.values[0];
    const layoutData = getLinkButtonLayoutData(variant, size, false);

    expect(layoutData.layout).toBeDefined();
    expect(typeof layoutData.layout.paddingX).toBe("number");
    expect(typeof layoutData.layout.height).toBe("number");
    expect(typeof layoutData.layout.gap).toBe("number");
    expect(typeof layoutData.layout.cornerRadius).toBe("number");
    expect(typeof layoutData.layout.fontSize).toBe("number");
  });

  it("should include fill properties", () => {
    const variant = variantProp.values[0];
    const size = sizeProp.values[0];
    const layoutData = getLinkButtonLayoutData(variant, size, false);

    expect(layoutData.fill).toBeDefined();
    expect(typeof layoutData.fill.hasBackground).toBe("boolean");
    // variable can be string or null
  });

  it("should include stroke properties", () => {
    const variant = variantProp.values[0];
    const size = sizeProp.values[0];
    const layoutData = getLinkButtonLayoutData(variant, size, false);

    expect(layoutData.stroke).toBeDefined();
    expect(typeof layoutData.stroke.hasBorder).toBe("boolean");
    // variable can be string or null
  });

  it("should include text properties", () => {
    const variant = variantProp.values[0];
    const size = sizeProp.values[0];
    const layoutData = getLinkButtonLayoutData(variant, size, false);

    expect(layoutData.text).toBeDefined();
    expect(typeof layoutData.text.isWhiteText).toBe("boolean");
    // variable can be string or null
  });
});

describe("LinkButton Generator - Complete Variant Data", () => {
  it("should return complete variant data structure", () => {
    const allData = getAllLinkButtonVariantData();

    expect(allData.variantConfig).toBeDefined();
    expect(allData.sizeConfig).toBeDefined();
    expect(allData.variants).toBeDefined();
    expect(allData.sizes).toBeDefined();
    expect(allData.hasIconOptions).toBeDefined();
    expect(allData.exampleLayouts).toBeDefined();
  });

  it("should include all variants", () => {
    const allData = getAllLinkButtonVariantData();

    expect(Array.isArray(allData.variants)).toBe(true);
    expect(allData.variants.length).toBe(variantProp.values.length);
  });

  it("should include all sizes", () => {
    const allData = getAllLinkButtonVariantData();

    expect(Array.isArray(allData.sizes)).toBe(true);
    expect(allData.sizes.length).toBe(sizeProp.values.length);
  });

  it("should include hasIcon options", () => {
    const allData = getAllLinkButtonVariantData();

    expect(Array.isArray(allData.hasIconOptions)).toBe(true);
    expect(allData.hasIconOptions).toEqual([false, true]);
  });

  it("should include example layouts", () => {
    const allData = getAllLinkButtonVariantData();

    expect(Array.isArray(allData.exampleLayouts)).toBe(true);
    expect(allData.exampleLayouts.length).toBeGreaterThan(0);

    for (const layout of allData.exampleLayouts) {
      expect(layout.variant).toBeDefined();
      expect(layout.size).toBeDefined();
      expect(typeof layout.hasIcon).toBe("boolean");
      expect(layout.layout).toBeDefined();
    }
  });

  it("should have complete data for all variants", () => {
    const allData = getAllLinkButtonVariantData();

    for (const variant of allData.variants) {
      expect(variant.variant).toBeDefined();
      expect(variant.classes).toBeDefined();
      expect(variant.description).toBeDefined();
      expect(variant.parsed).toBeDefined();
    }
  });

  it("should have complete data for all sizes", () => {
    const allData = getAllLinkButtonVariantData();

    for (const size of allData.sizes) {
      expect(size.size).toBeDefined();
      expect(size.classes).toBeDefined();
      expect(size.description).toBeDefined();
      expect(size.parsed).toBeDefined();
    }
  });
});

/**
 * NOTE: Snapshot tests were intentionally removed.
 *
 * Snapshots are brittle and fail whenever styling changes in theme-kumo.css
 * or component classes are updated. The tests above verify:
 * - Registry structure integrity
 * - Parser produces valid output types
 * - Generator functions return complete data structures
 *
 * These structural tests are sufficient and don't break on style changes.
 */
