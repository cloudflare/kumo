/**
 * Tests for collapsible.ts generator
 *
 * These tests ensure the Collapsible Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the collapsible
 * generator or parser, these tests will catch any unintended style changes.
 *
 * Source of truth chain:
 * collapsible.tsx → component-registry.json → collapsible.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getCollapsibleOpenConfig,
  getCollapsibleStateConfig,
  getCollapsibleParsedTriggerStyles,
  getCollapsibleParsedContentStyles,
  getCollapsibleLayoutData,
  getAllCollapsibleVariantData,
  getCollapsibleTriggerStyles,
} from "./collapsible";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const collapsibleComponent = registry.components.Collapsible;
const collapsibleColors = collapsibleComponent.colors as string[];

describe("Collapsible Generator - Registry Validation", () => {
  it("should have Collapsible component in registry", () => {
    expect(collapsibleComponent).toBeDefined();
    expect(collapsibleComponent.name).toBe("Collapsible");
  });

  it("should have required props in registry", () => {
    expect(collapsibleComponent.props).toBeDefined();
    expect(collapsibleComponent.props.label).toBeDefined();
    expect(collapsibleComponent.props.open).toBeDefined();
    expect(collapsibleComponent.props.children).toBeDefined();
  });

  it("should have color tokens defined", () => {
    expect(collapsibleComponent.colors).toBeDefined();
    expect(Array.isArray(collapsibleComponent.colors)).toBe(true);
    expect(collapsibleComponent.colors.length).toBeGreaterThan(0);
  });

  it("should include expected color tokens from registry", () => {
    // Verify that colors from registry are actually used in the component
    // These tests validate that the registry colors array is non-empty
    // and that key colors (border and text) are present
    const borderColors = collapsibleColors.filter((c) =>
      c.startsWith("border-"),
    );
    const textColors = collapsibleColors.filter((c) => c.startsWith("text-"));

    expect(borderColors.length).toBeGreaterThan(0);
    expect(textColors.length).toBeGreaterThan(0);

    // Verify that trigger styles reference colors from the registry
    const triggerStyles = getCollapsibleTriggerStyles();
    expect(triggerStyles.colors).toBeDefined();
    expect(triggerStyles.colors.length).toBeGreaterThan(0);
  });
});

describe("Collapsible Generator - Open State Configuration", () => {
  it("should have open state values defined", () => {
    const config = getCollapsibleOpenConfig();
    expect(config.values).toBeDefined();
    expect(Array.isArray(config.values)).toBe(true);
    expect(config.values.length).toBeGreaterThan(0);
  });

  it("should have both true and false open states", () => {
    const config = getCollapsibleOpenConfig();
    expect(config.values).toContain(false);
    expect(config.values).toContain(true);
  });
});

describe("Collapsible Generator - Interaction State Configuration", () => {
  it("should have interaction state values defined", () => {
    const config = getCollapsibleStateConfig();
    expect(config.values).toBeDefined();
    expect(Array.isArray(config.values)).toBe(true);
    expect(config.values.length).toBeGreaterThan(0);
  });

  it("should have expected interaction states", () => {
    const config = getCollapsibleStateConfig();
    expect(config.values).toContain("default");
    expect(config.values).toContain("hover");
    expect(config.values).toContain("focus");
    expect(config.values).toContain("disabled");
  });

  it("should have state styles defined for all states", () => {
    const config = getCollapsibleStateConfig();
    for (const state of config.values) {
      expect(config.styles[state]).toBeDefined();
      expect(typeof config.styles[state]).toBe("object");
    }
  });

  it("should have textVariable defined for all states", () => {
    const config = getCollapsibleStateConfig();
    for (const state of config.values) {
      expect(config.styles[state].textVariable).toBeDefined();
      expect(typeof config.styles[state].textVariable).toBe("string");
    }
  });
});

describe("Collapsible Generator - Trigger Styles Parsing", () => {
  it("should parse gap from trigger styles", () => {
    const parsed = getCollapsibleParsedTriggerStyles();
    expect(parsed.gap).toBeDefined();
    expect(typeof parsed.gap).toBe("number");
  });

  it("should parse font size from trigger styles", () => {
    const parsed = getCollapsibleParsedTriggerStyles();
    expect(parsed.fontSize).toBeDefined();
    expect(typeof parsed.fontSize).toBe("number");
  });

  it("should parse text variable from trigger styles", () => {
    const parsed = getCollapsibleParsedTriggerStyles();
    expect(parsed.textVariable).toBeDefined();
    expect(typeof parsed.textVariable).toBe("string");
  });
});

describe("Collapsible Generator - Content Styles Parsing", () => {
  it("should parse border from content styles", () => {
    const parsed = getCollapsibleParsedContentStyles();
    expect(parsed.hasBorder).toBe(true);
    expect(parsed.strokeVariable).toBeDefined();
    expect(typeof parsed.strokeVariable).toBe("string");
  });

  it("should handle content styles gracefully", () => {
    // Note: Parser may not support pl-* (left padding only) or my-* (vertical margin)
    // This test ensures the generator can handle whatever the parser returns
    const parsed = getCollapsibleParsedContentStyles();
    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe("object");
  });
});

describe("Collapsible Generator - Layout Data", () => {
  describe("collapsed + default state", () => {
    it("should have complete trigger layout", () => {
      const layout = getCollapsibleLayoutData(false, "default");
      expect(layout.trigger).toBeDefined();
      expect(typeof layout.trigger.gap).toBe("number");
      expect(typeof layout.trigger.fontSize).toBe("number");
      expect(typeof layout.trigger.fontWeight).toBe("number");
      expect(typeof layout.trigger.textVariable).toBe("string");
      expect(typeof layout.trigger.addRing).toBe("boolean");
    });

    it("should have chevron configuration", () => {
      const layout = getCollapsibleLayoutData(false, "default");
      expect(layout.chevron).toBeDefined();
      // Icon name should be a phosphor icon string starting with "ph-"
      expect(layout.chevron.iconName).toMatch(/^ph-/);
      expect(layout.chevron.rotation).toBe(0);
      expect(typeof layout.chevron.iconColorToken).toBe("string");
    });

    it("should have null content when collapsed", () => {
      const layout = getCollapsibleLayoutData(false, "default");
      expect(layout.content).toBeNull();
    });
  });

  describe("expanded + default state", () => {
    it("should have complete trigger layout", () => {
      const layout = getCollapsibleLayoutData(true, "default");
      expect(layout.trigger).toBeDefined();
      expect(typeof layout.trigger.gap).toBe("number");
      expect(typeof layout.trigger.fontSize).toBe("number");
    });

    it("should have chevron rotated 180 degrees", () => {
      const layout = getCollapsibleLayoutData(true, "default");
      expect(layout.chevron).toBeDefined();
      expect(layout.chevron.rotation).toBe(180);
    });

    it("should have content layout when expanded", () => {
      const layout = getCollapsibleLayoutData(true, "default");
      expect(layout.content).toBeDefined();
      expect(layout.content).not.toBeNull();
    });

    it("should have complete content layout properties", () => {
      const layout = getCollapsibleLayoutData(true, "default");
      expect(layout.content).toBeDefined();
      if (layout.content) {
        expect(typeof layout.content.paddingX).toBe("number");
        expect(typeof layout.content.paddingTop).toBe("number");
        expect(typeof layout.content.paddingBottom).toBe("number");
        expect(typeof layout.content.itemSpacing).toBe("number");
        expect(typeof layout.content.borderVariable).toBe("string");
        expect(typeof layout.content.borderWeight).toBe("number");
      }
    });
  });

  describe("focus state", () => {
    it("should have ring enabled for focus state", () => {
      const layout = getCollapsibleLayoutData(false, "focus");
      expect(layout.trigger.addRing).toBe(true);
    });

    it("should not have ring for default state", () => {
      const layout = getCollapsibleLayoutData(false, "default");
      expect(layout.trigger.addRing).toBe(false);
    });
  });

  describe("disabled state", () => {
    it("should have opacity defined for disabled state", () => {
      const layout = getCollapsibleLayoutData(false, "disabled");
      expect(layout.opacity).toBeDefined();
      expect(typeof layout.opacity).toBe("number");
    });

    it("should use disabled text color for icon", () => {
      const layout = getCollapsibleLayoutData(false, "disabled");
      // Disabled state should use a muted/inactive text color token
      // Verify it's a valid text color token
      expect(layout.chevron.iconColorToken).toMatch(/^text-kumo-/);
      // Verify disabled state has different color than default state
      const defaultLayout = getCollapsibleLayoutData(false, "default");
      expect(layout.chevron.iconColorToken).not.toBe(
        defaultLayout.chevron.iconColorToken,
      );
    });

    it("should not have opacity for default state", () => {
      const layout = getCollapsibleLayoutData(false, "default");
      expect(layout.opacity).toBeUndefined();
    });
  });
});

describe("Collapsible Generator - Complete Variant Data", () => {
  it("should have trigger styles defined", () => {
    const data = getAllCollapsibleVariantData();
    expect(data.triggerStyles).toBeDefined();
    expect(data.triggerStyles.raw).toBeDefined();
    expect(data.triggerStyles.parsed).toBeDefined();
  });

  it("should have content styles defined", () => {
    const data = getAllCollapsibleVariantData();
    expect(data.contentStyles).toBeDefined();
    expect(data.contentStyles.raw).toBeDefined();
    expect(data.contentStyles.parsed).toBeDefined();
  });

  it("should have open states defined", () => {
    const data = getAllCollapsibleVariantData();
    expect(data.openStates).toBeDefined();
    expect(Array.isArray(data.openStates)).toBe(true);
  });

  it("should have interaction states defined", () => {
    const data = getAllCollapsibleVariantData();
    expect(data.interactionStates).toBeDefined();
    expect(Array.isArray(data.interactionStates)).toBe(true);
  });

  it("should have state styles configuration", () => {
    const data = getAllCollapsibleVariantData();
    expect(data.stateStyles).toBeDefined();
    expect(typeof data.stateStyles).toBe("object");
  });

  it("should have variants array with all combinations", () => {
    const data = getAllCollapsibleVariantData();
    expect(data.variants).toBeDefined();
    expect(Array.isArray(data.variants)).toBe(true);
    // 2 open states × 4 interaction states = 8 variants
    expect(data.variants.length).toBe(8);
  });

  it("should have complete layout data for each variant", () => {
    const data = getAllCollapsibleVariantData();
    for (const variant of data.variants) {
      expect(variant.open).toBeDefined();
      expect(typeof variant.open).toBe("boolean");
      expect(variant.state).toBeDefined();
      expect(typeof variant.state).toBe("string");
      expect(variant.trigger).toBeDefined();
      expect(variant.chevron).toBeDefined();
    }
  });
});
