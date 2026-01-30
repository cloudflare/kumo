/**
 * Tests for label.ts component generator
 *
 * These tests ensure the Label Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the label
 * generator, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * label.tsx → component-registry.json → label.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getLabelComponentConfig,
  getLabelLayoutConfig,
  getLabelTextConfig,
  getLabelIconConfig,
  getLabelCompleteConfig,
  LABEL_CONFIGS_EXPORT,
} from "./label";
import { FONT_SIZE, FALLBACK_VALUES, SPACING } from "./shared";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

// Use type assertion for Label component
const labelComponent = (registry.components as Record<string, unknown>)
  .Label as {
  name: string;
  description: string;
  props: Record<string, unknown>;
  colors: string[];
};

describe("Label Generator - Registry Validation", () => {
  it("should have Label component in registry", () => {
    expect(labelComponent).toBeDefined();
    expect(labelComponent.name).toBe("Label");
  });

  it("should have expected props in registry", () => {
    expect(labelComponent.props.children).toBeDefined();
    expect(labelComponent.props.showOptional).toBeDefined();
    expect(labelComponent.props.tooltip).toBeDefined();
    expect(labelComponent.props.className).toBeDefined();
    expect(labelComponent.props.asContent).toBeDefined();
  });

  it("should have colors in registry", () => {
    expect(Array.isArray(labelComponent.colors)).toBe(true);
    expect(labelComponent.colors.length).toBeGreaterThan(0);
    // All colors should use kumo semantic tokens
    for (const color of labelComponent.colors) {
      expect(color).toMatch(/kumo/);
    }
  });
});

describe("Label Generator - Component Config", () => {
  it("should return valid component config", () => {
    const config = getLabelComponentConfig();

    expect(config.name).toBe("Label");
    expect(config.description).toBeDefined();
    expect(config.props).toBeDefined();
    expect(Array.isArray(config.colors)).toBe(true);
    expect(config.colors.length).toBeGreaterThan(0);
  });
});

describe("Label Generator - Layout Config", () => {
  it("should return valid layout config", () => {
    const config = getLabelLayoutConfig();

    expect(config.layoutMode).toBe("HORIZONTAL");
    expect(config.primaryAxisAlignItems).toBe("MIN");
    expect(config.counterAxisAlignItems).toBe("CENTER");
    expect(config.primaryAxisSizingMode).toBe("AUTO");
    expect(config.counterAxisSizingMode).toBe("AUTO");
  });

  it("should use SPACING.xs for item spacing (gap-1 = 4px)", () => {
    const config = getLabelLayoutConfig();
    expect(config.itemSpacing).toBe(SPACING.xs);
  });
});

describe("Label Generator - Text Config", () => {
  it("should return valid main text config", () => {
    const config = getLabelTextConfig();

    expect(config.main.fontSize).toBe(FONT_SIZE.base);
    expect(config.main.fontWeight).toBe(FALLBACK_VALUES.fontWeight.medium);
    // Text variable should be a kumo semantic token
    expect(typeof config.main.textVariable).toBe("string");
    expect(config.main.textVariable).toMatch(/^text-color-kumo-/);
  });

  it("should return valid optional indicator text config", () => {
    const config = getLabelTextConfig();

    expect(config.optional.fontSize).toBe(FONT_SIZE.base);
    expect(config.optional.fontWeight).toBe(FALLBACK_VALUES.fontWeight.normal);
    // Text variable should be a kumo semantic token
    expect(typeof config.optional.textVariable).toBe("string");
    expect(config.optional.textVariable).toMatch(/^text-color-kumo-/);
  });

  it("should use different text colors for main and optional", () => {
    const config = getLabelTextConfig();
    // Main and optional should have distinct color treatments
    expect(config.main.textVariable).not.toBe(config.optional.textVariable);
  });
});

describe("Label Generator - Icon Config", () => {
  it("should return valid tooltip icon config", () => {
    const config = getLabelIconConfig();

    // Icon should have a phosphor icon name
    expect(typeof config.name).toBe("string");
    expect(config.name).toMatch(/^ph-/);
    expect(config.size).toBe(FALLBACK_VALUES.iconSize.sm);
    // Color variable should be a kumo semantic token
    expect(typeof config.colorVariable).toBe("string");
    expect(config.colorVariable).toMatch(/^text-color-kumo-/);
  });
});

describe("Label Generator - Complete Config", () => {
  it("should return config for default label (no optional, no tooltip)", () => {
    const config = getLabelCompleteConfig({
      showOptional: false,
      showTooltip: false,
    });

    expect(config.showOptional).toBe(false);
    expect(config.showTooltip).toBe(false);
    expect(config.layoutConfig).toBeDefined();
    expect(config.textConfig).toBeDefined();
    expect(config.iconConfig).toBeNull();
  });

  it("should return config for label with optional indicator", () => {
    const config = getLabelCompleteConfig({
      showOptional: true,
      showTooltip: false,
    });

    expect(config.showOptional).toBe(true);
    expect(config.showTooltip).toBe(false);
    expect(config.iconConfig).toBeNull();
  });

  it("should return config for label with tooltip", () => {
    const config = getLabelCompleteConfig({
      showOptional: false,
      showTooltip: true,
    });

    expect(config.showOptional).toBe(false);
    expect(config.showTooltip).toBe(true);
    expect(config.iconConfig).not.toBeNull();
    // Icon should have a phosphor icon name
    expect(config.iconConfig?.name).toMatch(/^ph-/);
  });

  it("should return config for label with both optional and tooltip", () => {
    const config = getLabelCompleteConfig({
      showOptional: true,
      showTooltip: true,
    });

    expect(config.showOptional).toBe(true);
    expect(config.showTooltip).toBe(true);
    expect(config.iconConfig).not.toBeNull();
  });
});

describe("Label Generator - Variant Configurations", () => {
  it("should have 4 label configurations", () => {
    expect(LABEL_CONFIGS_EXPORT.length).toBe(4);
  });

  it("should have all combinations of showOptional and showTooltip", () => {
    const configs = LABEL_CONFIGS_EXPORT;

    // Default (no optional, no tooltip)
    expect(configs).toContainEqual({ showOptional: false, showTooltip: false });

    // With optional
    expect(configs).toContainEqual({ showOptional: true, showTooltip: false });

    // With tooltip
    expect(configs).toContainEqual({ showOptional: false, showTooltip: true });

    // With both
    expect(configs).toContainEqual({ showOptional: true, showTooltip: true });
  });
});
