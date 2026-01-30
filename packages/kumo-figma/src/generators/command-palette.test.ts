/**
 * Tests for command-palette.ts component generator
 *
 * These tests ensure the CommandPalette Figma component generation stays in sync
 * with the source React component (command-palette.tsx).
 *
 * CRITICAL: These tests act as a regression guard. If you change the command-palette
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Note: CommandPalette is a compound component without traditional variants in the
 * registry. The tests validate that Tailwind classes from the React component are
 * properly parsed and used for Figma generation.
 *
 * Source of truth chain:
 * command-palette.tsx → command-palette.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getCommandPaletteConfig,
  getCommandPaletteClasses,
  getParsedStyles,
  getAllCommandPaletteData,
  getBaseConfig,
} from "./command-palette";
import {
  FONT_SIZE,
  FALLBACK_VALUES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  VAR_NAMES,
} from "./shared";

/**
 * Helper to verify a value is a valid kumo fill variable
 */
function isKumoFillVariable(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith("color-kumo-");
}

/**
 * Helper to verify a value is a valid kumo text color variable
 */
function isKumoTextVariable(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith("text-color-kumo-");
}

/**
 * Helper to verify Tailwind classes contain expected patterns
 */
function hasKumoClass(classes: string, pattern: RegExp): boolean {
  return pattern.test(classes);
}

describe("CommandPalette Generator - Config Validation", () => {
  const config = getCommandPaletteConfig();

  it("should have valid width (max-w-2xl = 672px)", () => {
    expect(config.width).toBe(672); // 42rem * 16
  });

  it("should have valid maxHeight", () => {
    // FIGMA-SPECIFIC: max-h-[60vh] is viewport-relative, 400px is a reasonable Figma canvas height
    expect(config.maxHeight).toBe(400); // Not fontWeight - FALLBACK note for drift detection
  });

  it("should have valid inputHeight derived from spacing", () => {
    // py-3 = 12px * 2 + icon height
    expect(config.inputHeight).toBeGreaterThan(0);
  });

  it("should have valid footerHeight derived from spacing", () => {
    // py-3 = 12px * 2 + text
    expect(config.footerHeight).toBeGreaterThan(0);
  });

  it("should have valid itemHeight derived from spacing", () => {
    // py-1.5 = 6px * 2 + content
    expect(config.itemHeight).toBeGreaterThan(0);
  });

  it("should have valid groupLabelHeight derived from spacing", () => {
    expect(config.groupLabelHeight).toBeGreaterThan(0);
  });
});

describe("CommandPalette Generator - Component Classes", () => {
  const classes = getCommandPaletteClasses();

  it("should have container classes with border radius and background", () => {
    expect(classes.container).toBeDefined();
    // Verify structural classes exist (not specific values)
    expect(hasKumoClass(classes.container, /rounded-/)).toBe(true);
    expect(hasKumoClass(classes.container, /bg-kumo-/)).toBe(true);
  });

  it("should have inputHeader classes with spacing and background", () => {
    expect(classes.inputHeader).toBeDefined();
    // Verify layout/spacing classes exist
    expect(hasKumoClass(classes.inputHeader, /gap-/)).toBe(true);
    expect(hasKumoClass(classes.inputHeader, /bg-kumo-/)).toBe(true);
    expect(hasKumoClass(classes.inputHeader, /p[xy]?-/)).toBe(true);
  });

  it("should have list classes with background and border", () => {
    expect(classes.list).toBeDefined();
    // Verify structural classes exist
    expect(hasKumoClass(classes.list, /bg-kumo-/)).toBe(true);
    expect(hasKumoClass(classes.list, /p[xy]?-/)).toBe(true);
    expect(hasKumoClass(classes.list, /ring-/)).toBe(true);
  });

  it("should have item classes with spacing and border radius", () => {
    expect(classes.item).toBeDefined();
    // Verify layout classes exist
    expect(hasKumoClass(classes.item, /gap-/)).toBe(true);
    expect(hasKumoClass(classes.item, /p[xy]?-/)).toBe(true);
    expect(hasKumoClass(classes.item, /rounded-/)).toBe(true);
  });

  it("should have itemHighlighted classes with background", () => {
    expect(classes.itemHighlighted).toBeDefined();
    // Verify background class exists
    expect(hasKumoClass(classes.itemHighlighted, /bg-kumo-/)).toBe(true);
  });

  it("should have groupLabel classes with typography and color", () => {
    expect(classes.groupLabel).toBeDefined();
    // Verify typography classes exist
    expect(hasKumoClass(classes.groupLabel, /text-/)).toBe(true);
    expect(hasKumoClass(classes.groupLabel, /font-/)).toBe(true);
  });

  it("should have footer classes with background, padding, and typography", () => {
    expect(classes.footer).toBeDefined();
    // Verify structural classes exist
    expect(hasKumoClass(classes.footer, /bg-kumo-/)).toBe(true);
    expect(hasKumoClass(classes.footer, /p[xy]?-/)).toBe(true);
    expect(hasKumoClass(classes.footer, /text-/)).toBe(true);
  });

  it("should have resultTitle classes with typography", () => {
    expect(classes.resultTitle).toBeDefined();
    // Verify typography classes exist
    expect(hasKumoClass(classes.resultTitle, /text-/)).toBe(true);
  });
});

describe("CommandPalette Generator - Parsed Styles", () => {
  /**
   * Note: Some Kumo-specific tokens (bg-surface-2, bg-surface-elevated) are not
   * in the tailwind-to-figma parser's COLOR_TO_VARIABLE map. The generator
   * handles these by using getVariableByName directly with hardcoded token names.
   * Tests marked with "handled by generator" document this behavior.
   */

  describe("container styles", () => {
    const styles = getParsedStyles("container");

    it("should parse borderRadius from rounded-lg", () => {
      expect(styles.borderRadius).toBe(BORDER_RADIUS.lg);
    });

    it("should parse fillVariable as valid kumo color variable", () => {
      // Verify the fill variable follows kumo naming convention
      expect(isKumoFillVariable(styles.fillVariable)).toBe(true);
    });
  });

  describe("inputHeader styles", () => {
    const styles = getParsedStyles("inputHeader");

    it("should parse gap from gap-3", () => {
      expect(styles.gap).toBe(SPACING.lg); // gap-3 = 12px
    });

    it("should parse padding from px-4 py-3", () => {
      expect(styles.paddingX).toBe(FALLBACK_VALUES.padding.standard); // px-4 = 16px
      expect(styles.paddingY).toBe(FALLBACK_VALUES.padding.horizontal); // py-3 = 12px
    });

    it("should parse fillVariable as valid kumo color variable", () => {
      // Verify the fill variable follows kumo naming convention
      expect(isKumoFillVariable(styles.fillVariable)).toBe(true);
    });
  });

  describe("list styles", () => {
    const styles = getParsedStyles("list");

    it("should parse padding from px-2 py-2", () => {
      expect(styles.paddingX).toBe(SPACING.base); // px-2 = 8px
      expect(styles.paddingY).toBe(SPACING.base); // py-2 = 8px
    });

    it("should parse fillVariable as valid kumo color variable", () => {
      // Verify the fill variable follows kumo naming convention
      expect(isKumoFillVariable(styles.fillVariable)).toBe(true);
    });

    it("should parse strokeVariable as valid kumo color variable", () => {
      // Verify the stroke variable follows kumo naming convention
      expect(isKumoFillVariable(styles.strokeVariable)).toBe(true);
    });

    it("should not parse borderRadius from rounded-b-lg (partial radius not supported)", () => {
      // rounded-b-lg (only bottom corners) is not supported by the parser
      // The generator uses BORDER_RADIUS.lg directly
      expect(styles.borderRadius).toBeUndefined();
    });
  });

  describe("item styles", () => {
    const styles = getParsedStyles("item");

    it("should parse gap from gap-3", () => {
      expect(styles.gap).toBe(SPACING.lg); // gap-3 = 12px
    });

    it("should parse padding from px-2 py-1.5", () => {
      expect(styles.paddingX).toBe(SPACING.base); // px-2 = 8px
      expect(styles.paddingY).toBe(SPACING.sm); // py-1.5 = 6px
    });

    it("should parse borderRadius from rounded-lg", () => {
      expect(styles.borderRadius).toBe(BORDER_RADIUS.lg);
    });
  });

  describe("itemHighlighted styles", () => {
    const styles = getParsedStyles("itemHighlighted");

    it("should parse fillVariable as valid kumo color variable", () => {
      // Verify the fill variable follows kumo naming convention
      expect(isKumoFillVariable(styles.fillVariable)).toBe(true);
    });
  });

  describe("groupLabel styles", () => {
    const styles = getParsedStyles("groupLabel");

    it("should parse fontSize from text-xs", () => {
      expect(styles.fontSize).toBe(FONT_SIZE.xs);
    });

    it("should parse fontWeight from font-semibold", () => {
      expect(styles.fontWeight).toBe(FALLBACK_VALUES.fontWeight.semiBold);
    });

    it("should parse textVariable as valid kumo text color variable", () => {
      // Verify the text variable follows kumo naming convention
      expect(isKumoTextVariable(styles.textVariable)).toBe(true);
    });
  });

  describe("footer styles", () => {
    const styles = getParsedStyles("footer");

    it("should parse padding from px-4 py-3", () => {
      expect(styles.paddingX).toBe(FALLBACK_VALUES.padding.standard); // px-4 = 16px
      expect(styles.paddingY).toBe(FALLBACK_VALUES.padding.horizontal); // py-3 = 12px
    });

    it("should parse fillVariable as valid kumo color variable", () => {
      // Verify the fill variable follows kumo naming convention
      expect(isKumoFillVariable(styles.fillVariable)).toBe(true);
    });

    it("should parse fontSize from text-xs", () => {
      expect(styles.fontSize).toBe(FONT_SIZE.xs);
    });

    it("should parse textVariable as valid kumo text color variable", () => {
      // Verify the text variable follows kumo naming convention
      expect(isKumoTextVariable(styles.textVariable)).toBe(true);
    });
  });
});

describe("CommandPalette Generator - Base Config", () => {
  const baseConfig = getBaseConfig();

  it("should have correct width from config", () => {
    const config = getCommandPaletteConfig();
    expect(baseConfig.width).toBe(config.width);
  });

  it("should have background token from VAR_NAMES", () => {
    // Background should reference a valid VAR_NAMES color
    expect(baseConfig.background).toBe(VAR_NAMES.color.control);
  });

  it("should have correct shadow", () => {
    expect(baseConfig.shadow).toEqual(SHADOWS.dialog);
  });

  it("should have correct borderRadius", () => {
    expect(baseConfig.borderRadius).toBe(BORDER_RADIUS.lg);
  });

  it("should have inputHeader section config with valid kumo tokens", () => {
    expect(baseConfig.sections.inputHeader).toBeDefined();
    // Background should be a valid kumo color variable
    expect(baseConfig.sections.inputHeader.background).toBe(
      VAR_NAMES.color.elevated,
    );
  });

  it("should have list section config with valid kumo tokens", () => {
    expect(baseConfig.sections.list).toBeDefined();
    // Background and border should be valid kumo color variables
    expect(baseConfig.sections.list.background).toBe(VAR_NAMES.color.elevated);
    expect(baseConfig.sections.list.border).toBe(VAR_NAMES.color.line);
  });

  it("should have footer section config with valid kumo tokens", () => {
    expect(baseConfig.sections.footer).toBeDefined();
    // Background should be valid kumo color, textColor should be valid text color
    expect(baseConfig.sections.footer.background).toBe(VAR_NAMES.color.control);
    expect(baseConfig.sections.footer.textColor).toBe(VAR_NAMES.text.strong);
  });

  it("should have item config with valid kumo tokens", () => {
    expect(baseConfig.item).toBeDefined();
    expect(baseConfig.item.normalBackground).toBeNull();
    // Highlighted background, textColor, iconColor should be valid kumo tokens
    expect(baseConfig.item.highlightedBackground).toBe(VAR_NAMES.color.tint);
    expect(baseConfig.item.textColor).toBe(VAR_NAMES.text.default);
    // iconColor uses raw text-kumo-* format (not VAR_NAMES)
    expect(baseConfig.item.iconColor).toMatch(/^text-kumo-/);
  });
});

describe("CommandPalette Generator - All Data Structure", () => {
  const allData = getAllCommandPaletteData();

  it("should have config", () => {
    expect(allData.config).toBeDefined();
    expect(allData.config.width).toBe(672);
  });

  it("should have classes", () => {
    expect(allData.classes).toBeDefined();
    expect(Object.keys(allData.classes).length).toBeGreaterThan(0);
  });

  it("should have parsedStyles for all component parts", () => {
    expect(allData.parsedStyles).toBeDefined();
    expect(allData.parsedStyles.container).toBeDefined();
    expect(allData.parsedStyles.inputHeader).toBeDefined();
    expect(allData.parsedStyles.list).toBeDefined();
    expect(allData.parsedStyles.item).toBeDefined();
    expect(allData.parsedStyles.footer).toBeDefined();
  });

  it("should have subComponents list", () => {
    expect(allData.subComponents).toBeDefined();
    expect(allData.subComponents).toContain("Dialog");
    expect(allData.subComponents).toContain("Root");
    expect(allData.subComponents).toContain("Panel");
    expect(allData.subComponents).toContain("Input");
    expect(allData.subComponents).toContain("List");
    expect(allData.subComponents).toContain("Group");
    expect(allData.subComponents).toContain("GroupLabel");
    expect(allData.subComponents).toContain("Item");
    expect(allData.subComponents).toContain("ResultItem");
    expect(allData.subComponents).toContain("HighlightedText");
    expect(allData.subComponents).toContain("Empty");
    expect(allData.subComponents).toContain("Loading");
    expect(allData.subComponents).toContain("Footer");
  });
});

describe("CommandPalette Generator - Color Token Coverage", () => {
  const baseConfig = getBaseConfig();

  it("should use semantic color tokens for container background", () => {
    // Background should reference VAR_NAMES.color namespace
    expect(baseConfig.background).toBe(VAR_NAMES.color.control);
  });

  it("should use semantic color tokens for section backgrounds", () => {
    // All section backgrounds should reference VAR_NAMES.color namespace
    expect(baseConfig.sections.inputHeader.background).toBe(
      VAR_NAMES.color.elevated,
    );
    expect(baseConfig.sections.list.background).toBe(VAR_NAMES.color.elevated);
    expect(baseConfig.sections.footer.background).toBe(VAR_NAMES.color.control);
  });

  it("should use semantic color tokens for borders", () => {
    // Border should reference VAR_NAMES.color namespace
    expect(baseConfig.sections.list.border).toBe(VAR_NAMES.color.line);
  });

  it("should use semantic color tokens for text", () => {
    // Text colors should reference VAR_NAMES.text namespace
    expect(baseConfig.sections.footer.textColor).toBe(VAR_NAMES.text.strong);
    expect(baseConfig.item.textColor).toBe(VAR_NAMES.text.default);
  });

  it("should use semantic color tokens for item states", () => {
    // Item state colors should reference appropriate kumo tokens
    expect(baseConfig.item.highlightedBackground).toBe(VAR_NAMES.color.tint);
    // iconColor uses raw text-kumo-* format (not VAR_NAMES)
    expect(baseConfig.item.iconColor).toMatch(/^text-kumo-/);
  });
});

describe("CommandPalette Generator - Snapshot Tests (Intermediate Data)", () => {
  /**
   * SNAPSHOT TESTS - Regression guards for intermediate data
   *
   * These tests capture the intermediate data (config, parsed styles)
   * BEFORE it hits Figma APIs. This enables:
   *
   * 1. Testing without Figma plugin runtime
   * 2. Detecting unintended changes in sizing or layout logic
   * 3. Validating the source of truth chain:
   *    command-palette.tsx → command-palette.ts parser → Figma
   */

  it("should produce consistent config", () => {
    const config = getCommandPaletteConfig();
    expect(config).toMatchSnapshot();
  });

  it("should produce consistent classes", () => {
    const classes = getCommandPaletteClasses();
    expect(classes).toMatchSnapshot();
  });

  it("should produce consistent base config", () => {
    const baseConfig = getBaseConfig();
    expect(baseConfig).toMatchSnapshot();
  });

  it("should produce consistent container styles", () => {
    const styles = getParsedStyles("container");
    expect(styles).toMatchSnapshot();
  });

  it("should produce consistent inputHeader styles", () => {
    const styles = getParsedStyles("inputHeader");
    expect(styles).toMatchSnapshot();
  });

  it("should produce consistent list styles", () => {
    const styles = getParsedStyles("list");
    expect(styles).toMatchSnapshot();
  });

  it("should produce consistent item styles", () => {
    const styles = getParsedStyles("item");
    expect(styles).toMatchSnapshot();
  });

  it("should produce consistent footer styles", () => {
    const styles = getParsedStyles("footer");
    expect(styles).toMatchSnapshot();
  });

  /**
   * GOLDEN PATH TEST - Full intermediate data chain
   */
  it("should produce consistent intermediate data (golden path)", () => {
    const allData = getAllCommandPaletteData();

    // Verify structure exists
    expect(allData.config).toBeDefined();
    expect(allData.classes).toBeDefined();
    expect(allData.parsedStyles).toBeDefined();
    expect(allData.subComponents.length).toBeGreaterThan(0);

    // Full snapshot
    expect(allData).toMatchSnapshot();
  });
});
