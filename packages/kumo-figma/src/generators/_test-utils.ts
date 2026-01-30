/**
 * Shared test utilities for generator tests
 *
 * These utilities provide common patterns for testing Figma generators
 * in a way that is decoupled from specific design decisions.
 *
 * Test Philosophy:
 * - Test that generators correctly read from the registry
 * - Test that the parser produces valid Figma-compatible output
 * - Test structural invariants, not specific values
 * - DO NOT test specific colors, sizes, or variant names
 */

import { expect } from "vitest";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";

/**
 * Type for a variant prop from the registry
 */
export interface VariantProp {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
}

/**
 * Type for a size prop from the registry
 */
export interface SizeProp {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
}

/**
 * Test that a registry prop has valid structure
 */
export function expectValidRegistryProp(
  prop: VariantProp | SizeProp,
  propName: string,
) {
  // Should have at least one value
  expect(
    prop.values.length,
    `${propName} should have at least one value`,
  ).toBeGreaterThan(0);

  // Default should exist in values
  expect(prop.default, `${propName} should have a default`).toBeDefined();
  expect(prop.values, `${propName} default should exist in values`).toContain(
    prop.default,
  );

  // Each value should have classes defined
  for (const value of prop.values) {
    expect(
      prop.classes[value],
      `${propName}.classes[${value}] should be defined`,
    ).toBeDefined();
    expect(
      typeof prop.classes[value],
      `${propName}.classes[${value}] should be a string`,
    ).toBe("string");
  }

  // Each value should have descriptions defined
  for (const value of prop.values) {
    expect(
      prop.descriptions[value],
      `${propName}.descriptions[${value}] should be defined`,
    ).toBeDefined();
    expect(
      typeof prop.descriptions[value],
      `${propName}.descriptions[${value}] should be a string`,
    ).toBe("string");
  }
}

/**
 * Test that all variant classes parse without errors
 */
export function expectAllClassesParsable(
  prop: VariantProp | SizeProp,
  propName: string,
) {
  for (const value of prop.values) {
    const classes = prop.classes[value];
    if (classes) {
      expect(
        () => parseTailwindClasses(classes),
        `${propName}.classes[${value}] should parse without errors`,
      ).not.toThrow();
    }
  }
}

/**
 * Test that parsed output has valid types for common properties
 */
export function expectValidParsedTypes(
  parsed: ReturnType<typeof parseTailwindClasses>,
) {
  // Fill variable should be string or null
  if (parsed.fillVariable !== undefined) {
    expect(
      parsed.fillVariable === null || typeof parsed.fillVariable === "string",
      "fillVariable should be string or null",
    ).toBe(true);
  }

  // Text variable should be string or null
  if (parsed.textVariable !== undefined) {
    expect(
      parsed.textVariable === null || typeof parsed.textVariable === "string",
      "textVariable should be string or null",
    ).toBe(true);
  }

  // Stroke variable should be string or null
  if (parsed.strokeVariable !== undefined) {
    expect(
      parsed.strokeVariable === null ||
        typeof parsed.strokeVariable === "string",
      "strokeVariable should be string or null",
    ).toBe(true);
  }

  // Numeric properties should be numbers
  const numericProps = [
    "height",
    "width",
    "paddingX",
    "paddingY",
    "gap",
    "fontSize",
    "fontWeight",
    "borderRadius",
    "strokeWeight",
  ] as const;

  for (const prop of numericProps) {
    if (parsed[prop] !== undefined) {
      expect(
        typeof parsed[prop],
        `${prop} should be a number when defined`,
      ).toBe("number");
    }
  }

  // Boolean properties should be booleans
  if (parsed.hasBorder !== undefined) {
    expect(typeof parsed.hasBorder, "hasBorder should be boolean").toBe(
      "boolean",
    );
  }
  if (parsed.isWhiteText !== undefined) {
    expect(typeof parsed.isWhiteText, "isWhiteText should be boolean").toBe(
      "boolean",
    );
  }
}

/**
 * Test that numeric layout properties are positive when present
 */
export function expectPositiveLayoutValues(
  parsed: ReturnType<typeof parseTailwindClasses>,
) {
  const positiveProps = [
    "height",
    "width",
    "fontSize",
    "fontWeight",
    "strokeWeight",
  ] as const;

  for (const prop of positiveProps) {
    if (parsed[prop] !== undefined) {
      expect(
        parsed[prop],
        `${prop} should be positive when defined`,
      ).toBeGreaterThan(0);
    }
  }

  // These can be 0 or positive
  const nonNegativeProps = [
    "paddingX",
    "paddingY",
    "gap",
    "borderRadius",
  ] as const;

  for (const prop of nonNegativeProps) {
    if (parsed[prop] !== undefined) {
      expect(
        parsed[prop],
        `${prop} should be non-negative when defined`,
      ).toBeGreaterThanOrEqual(0);
    }
  }
}

/**
 * Test that exports match registry values
 */
export function expectExportsMatchRegistry<T extends string>(
  exportedValues: T[],
  registryValues: T[],
  exportName: string,
) {
  expect(exportedValues, `${exportName} should match registry values`).toEqual(
    registryValues,
  );
}

/**
 * Test that a getter function returns data matching the registry
 */
export function expectGetterMatchesRegistry(
  getterResult: {
    values: string[];
    classes?: Record<string, string>;
    descriptions?: Record<string, string>;
    default?: string;
  },
  registryProp: VariantProp | SizeProp,
  getterName: string,
) {
  expect(
    getterResult.values,
    `${getterName}.values should match registry`,
  ).toEqual(registryProp.values);

  if (getterResult.classes) {
    expect(
      getterResult.classes,
      `${getterName}.classes should match registry`,
    ).toEqual(registryProp.classes);
  }

  if (getterResult.descriptions) {
    expect(
      getterResult.descriptions,
      `${getterName}.descriptions should match registry`,
    ).toEqual(registryProp.descriptions);
  }

  if (getterResult.default !== undefined) {
    expect(
      getterResult.default,
      `${getterName}.default should match registry`,
    ).toEqual(registryProp.default);
  }
}

/**
 * Test that parsed variant data has complete structure
 */
export function expectCompleteParsedVariantData(
  data: {
    variant?: string;
    size?: string;
    shape?: string;
    classes?: string;
    description?: string;
    parsed?: ReturnType<typeof parseTailwindClasses>;
  },
  valueName: string,
) {
  // Check that the identifying field exists
  const hasIdentifier =
    data.variant !== undefined ||
    data.size !== undefined ||
    data.shape !== undefined;
  expect(hasIdentifier, `${valueName} should have an identifier`).toBe(true);

  // Check that parsed data exists
  expect(data.parsed, `${valueName}.parsed should be defined`).toBeDefined();
  expect(typeof data.parsed, `${valueName}.parsed should be an object`).toBe(
    "object",
  );
}

/**
 * Test all variant data for completeness
 */
export function expectAllVariantDataComplete(
  allData: {
    variants?: Array<{
      variant: string;
      classes: string;
      description: string;
      parsed: ReturnType<typeof parseTailwindClasses>;
    }>;
    sizes?: Array<{
      size: string;
      classes: string;
      description: string;
      parsed: ReturnType<typeof parseTailwindClasses>;
    }>;
    shapes?: Array<{
      shape: string;
      classes: string;
      description: string;
      parsed: ReturnType<typeof parseTailwindClasses>;
    }>;
  },
  registryVariants?: string[],
  registrySizes?: string[],
  registryShapes?: string[],
) {
  if (allData.variants && registryVariants) {
    expect(
      allData.variants.length,
      "variants count should match registry",
    ).toBe(registryVariants.length);

    for (const variant of allData.variants) {
      expectCompleteParsedVariantData(variant, `variant[${variant.variant}]`);
    }
  }

  if (allData.sizes && registrySizes) {
    expect(allData.sizes.length, "sizes count should match registry").toBe(
      registrySizes.length,
    );

    for (const size of allData.sizes) {
      expectCompleteParsedVariantData(size, `size[${size.size}]`);
    }
  }

  if (allData.shapes && registryShapes) {
    expect(allData.shapes.length, "shapes count should match registry").toBe(
      registryShapes.length,
    );

    for (const shape of allData.shapes) {
      expectCompleteParsedVariantData(shape, `shape[${shape.shape}]`);
    }
  }
}
