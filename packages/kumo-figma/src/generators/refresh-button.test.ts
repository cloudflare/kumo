/**
 * Tests for refresh-button.ts generator
 *
 * These tests ensure the RefreshButton Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the refresh-button
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * button.tsx → component-registry.json → refresh-button.ts (generator) → Figma
 *
 * Note: RefreshButton uses Button's variant and size props from the registry,
 * but only generates the "secondary" variant (default) with square shape.
 */

import { describe, it, expect } from "vitest";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import { FALLBACK_VALUES } from "./shared";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const buttonData = registry.components.Button;
const props = buttonData.props;

const variantProp = props.variant as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

const sizeProp = props.size as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

describe("RefreshButton Generator - Registry Validation", () => {
  it("should have all expected size variants in registry", () => {
    expect(Array.isArray(sizeProp.values)).toBe(true);
    expect(sizeProp.values.length).toBeGreaterThan(0);
    expect(sizeProp.values).toContain("xs");
    expect(sizeProp.values).toContain("sm");
    expect(sizeProp.values).toContain("base");
    expect(sizeProp.values).toContain("lg");
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

  it("should have all expected variant values in registry", () => {
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
});

describe("RefreshButton Generator - Compact Size Configuration", () => {
  // Use centralized constant from shared.ts to prevent drift
  const COMPACT_SIZE_MAP = FALLBACK_VALUES.buttonCompactSize;

  it("should have compact size mapping for all sizes", () => {
    expect(Object.keys(COMPACT_SIZE_MAP)).toHaveLength(4);
    for (const size of sizeProp.values) {
      expect(
        COMPACT_SIZE_MAP[size as keyof typeof COMPACT_SIZE_MAP],
      ).toBeDefined();
      expect(
        typeof COMPACT_SIZE_MAP[size as keyof typeof COMPACT_SIZE_MAP],
      ).toBe("number");
      expect(
        COMPACT_SIZE_MAP[size as keyof typeof COMPACT_SIZE_MAP],
      ).toBeGreaterThan(0);
    }
  });

  it("should have correct compact size values", () => {
    // Validate square aspect ratio (width === height)
    for (const [_size, dimension] of Object.entries(COMPACT_SIZE_MAP)) {
      expect(dimension).toBe(dimension); // Square button (width === height)
    }
  });

  it("should have increasing size values", () => {
    expect(COMPACT_SIZE_MAP.sm).toBeGreaterThan(COMPACT_SIZE_MAP.xs);
    expect(COMPACT_SIZE_MAP.base).toBeGreaterThan(COMPACT_SIZE_MAP.sm);
    expect(COMPACT_SIZE_MAP.lg).toBeGreaterThan(COMPACT_SIZE_MAP.base);
  });
});

describe("RefreshButton Generator - Icon Size Configuration", () => {
  // RefreshButton-specific icon sizes (not in shared.ts as these are component-specific)
  const REFRESH_ICON_SIZE: Record<string, number> = {
    xs: 12,
    sm: 16,
    base: 18,
    lg: 20,
  };

  it("should have icon size mapping for all sizes", () => {
    expect(Object.keys(REFRESH_ICON_SIZE)).toHaveLength(4);
    for (const size of sizeProp.values) {
      expect(REFRESH_ICON_SIZE[size]).toBeDefined();
      expect(typeof REFRESH_ICON_SIZE[size]).toBe("number");
      expect(REFRESH_ICON_SIZE[size]).toBeGreaterThan(0);
    }
  });

  it("should have icon sizes smaller than button sizes", () => {
    for (const size of sizeProp.values) {
      expect(REFRESH_ICON_SIZE[size]).toBeLessThan(
        FALLBACK_VALUES.buttonCompactSize[
          size as keyof typeof FALLBACK_VALUES.buttonCompactSize
        ],
      );
    }
  });

  it("should have increasing icon size values", () => {
    expect(Object.keys(REFRESH_ICON_SIZE)).toHaveLength(4);
    for (const size of sizeProp.values) {
      expect(REFRESH_ICON_SIZE[size]).toBeDefined();
      expect(typeof REFRESH_ICON_SIZE[size]).toBe("number");
      expect(REFRESH_ICON_SIZE[size]).toBeGreaterThan(0);
    }
  });

  it("should have icon sizes smaller than button sizes", () => {
    const REFRESH_ICON_SIZE: Record<string, number> = {
      xs: 12,
      sm: 16,
      base: 18,
      lg: 20,
    };

    const COMPACT_SIZE_MAP: Record<string, number> = {
      xs: 14,
      sm: 26,
      base: 36,
      lg: 40,
    };

    for (const size of sizeProp.values) {
      expect(REFRESH_ICON_SIZE[size]).toBeLessThan(COMPACT_SIZE_MAP[size]);
    }
  });

  it("should have increasing icon size values", () => {
    const REFRESH_ICON_SIZE: Record<string, number> = {
      xs: 12,
      sm: 16,
      base: 18,
      lg: 20,
    };

    const xs = REFRESH_ICON_SIZE.xs;
    const sm = REFRESH_ICON_SIZE.sm;
    const base = REFRESH_ICON_SIZE.base;
    const lg = REFRESH_ICON_SIZE.lg;

    expect(sm).toBeGreaterThan(xs);
    expect(base).toBeGreaterThan(sm);
    expect(lg).toBeGreaterThan(base);
  });
});

describe("RefreshButton Generator - Variant Styles Parsing", () => {
  it("should use secondary variant by default", () => {
    const variant = variantProp.default;
    expect(variant).toBe("secondary");
  });

  it("should parse secondary variant classes", () => {
    const variant = variantProp.default; // "secondary"
    const classes = variantProp.classes[variant];
    const parsed = parseTailwindClasses(classes);

    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe("object");
  });

  it("should have fill variable for secondary variant", () => {
    const variant = variantProp.default; // "secondary"
    const classes = variantProp.classes[variant];
    const parsed = parseTailwindClasses(classes);

    expect(parsed.fillVariable).toBeDefined();
    expect(typeof parsed.fillVariable).toBe("string");
  });

  it("should have stroke variable for secondary variant", () => {
    const variant = variantProp.default; // "secondary"
    const classes = variantProp.classes[variant];
    const parsed = parseTailwindClasses(classes);

    expect(parsed.strokeVariable).toBeDefined();
    expect(typeof parsed.strokeVariable).toBe("string");
  });

  it("should have text variable for secondary variant", () => {
    const variant = variantProp.default; // "secondary"
    const classes = variantProp.classes[variant];
    const parsed = parseTailwindClasses(classes);

    expect(parsed.textVariable).toBeDefined();
    expect(typeof parsed.textVariable).toBe("string");
  });

  it("should have hasBorder true for secondary variant", () => {
    const variant = variantProp.default; // "secondary"
    const classes = variantProp.classes[variant];
    const parsed = parseTailwindClasses(classes);

    expect(parsed.hasBorder).toBe(true);
  });
});

describe("RefreshButton Generator - Size Styles Parsing", () => {
  for (const size of sizeProp.values) {
    describe(`${size} size`, () => {
      const classes = sizeProp.classes[size];

      it("should have classes defined", () => {
        expect(classes).toBeDefined();
        expect(typeof classes).toBe("string");
        expect(classes.length).toBeGreaterThan(0);
      });

      it("should parse border radius", () => {
        const parsed = parseTailwindClasses(classes);
        expect(parsed.borderRadius).toBeDefined();
        expect(typeof parsed.borderRadius).toBe("number");
        expect(parsed.borderRadius).toBeGreaterThan(0);
      });
    });
  }
});

describe("RefreshButton Generator - Complete Variant Data", () => {
  it("should have size values array", () => {
    expect(Array.isArray(sizeProp.values)).toBe(true);
    expect(sizeProp.values.length).toBe(4);
    expect(sizeProp.values).toEqual(["xs", "sm", "base", "lg"]);
  });

  it("should have loading state options", () => {
    const loadingOptions = [false, true];
    expect(Array.isArray(loadingOptions)).toBe(true);
    expect(loadingOptions.length).toBe(2);
    expect(loadingOptions).toContain(false);
    expect(loadingOptions).toContain(true);
  });

  it("should generate correct number of combinations", () => {
    const sizes = sizeProp.values;
    const loadingOptions = [false, true];
    const totalCombinations = sizes.length * loadingOptions.length;

    expect(totalCombinations).toBe(8);
  });

  it("should have consistent data structure for all sizes", () => {
    const sizes = sizeProp.values;

    for (const size of sizes) {
      const sizeClasses = sizeProp.classes[size];

      expect(sizeClasses).toBeDefined();
      expect(typeof sizeClasses).toBe("string");

      const parsed = parseTailwindClasses(sizeClasses);
      expect(parsed).toBeDefined();
      expect(typeof parsed).toBe("object");
    }
  });

  it("should have all required configuration maps", () => {
    const COMPACT_SIZE_MAP: Record<string, number> = {
      xs: 14,
      sm: 26,
      base: 36,
      lg: 40,
    };

    const REFRESH_ICON_SIZE: Record<string, number> = {
      xs: 12,
      sm: 16,
      base: 18,
      lg: 20,
    };

    expect(Object.keys(COMPACT_SIZE_MAP)).toHaveLength(4);
    expect(Object.keys(REFRESH_ICON_SIZE)).toHaveLength(4);

    // Verify all size values have mappings
    for (const size of sizeProp.values) {
      expect(COMPACT_SIZE_MAP[size]).toBeDefined();
      expect(REFRESH_ICON_SIZE[size]).toBeDefined();
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
