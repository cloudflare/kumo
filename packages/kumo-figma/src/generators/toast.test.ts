/**
 * Tests for toast.ts component generator
 *
 * These tests validate the generator's behavior without coupling to
 * specific design decisions. If toast styling changes, these tests
 * should NOT break - only the Figma output changes.
 *
 * Test philosophy:
 * - Test that the generator correctly reads from the registry
 * - Test that the parser produces valid Figma-compatible output
 * - Test structural invariants, not specific values
 * - DO NOT test specific colors, sizes, or token names
 */

import { describe, it, expect } from "vitest";
import {
  getContainerConfig,
  getTitleConfig,
  getDescriptionConfig,
  getCloseButtonConfig,
  getAllVariantData,
} from "./toast";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const toastComponent = (registry.components as any).Toasty;
const toastStyling = toastComponent.styling;

describe("Toast Generator - Registry Structure", () => {
  /**
   * These tests verify the registry has the required structure
   * for the generator to work. They don't test specific values.
   */

  it("should have Toasty component in registry", () => {
    expect(toastComponent).toBeDefined();
    expect(toastComponent.name).toBe("Toasty");
  });

  it("should have styling metadata defined", () => {
    expect(toastStyling).toBeDefined();
    expect(toastStyling.container).toBeDefined();
    expect(toastStyling.title).toBeDefined();
    expect(toastStyling.description).toBeDefined();
    expect(toastStyling.closeButton).toBeDefined();
  });

  describe("container styling", () => {
    it("should have all required container properties", () => {
      expect(toastStyling.container.width).toBeDefined();
      expect(toastStyling.container.padding).toBeDefined();
      expect(toastStyling.container.borderRadius).toBeDefined();
      expect(toastStyling.container.background).toBeDefined();
      expect(toastStyling.container.border).toBeDefined();
      expect(toastStyling.container.shadow).toBeDefined();
      expect(toastStyling.container.gap).toBeDefined();
    });

    it("should have correct types for container properties", () => {
      expect(typeof toastStyling.container.width).toBe("number");
      expect(typeof toastStyling.container.padding).toBe("number");
      expect(typeof toastStyling.container.borderRadius).toBe("number");
      expect(typeof toastStyling.container.background).toBe("string");
      expect(typeof toastStyling.container.border).toBe("string");
      expect(typeof toastStyling.container.shadow).toBe("string");
      expect(typeof toastStyling.container.gap).toBe("number");
    });

    it("should have positive numeric values for dimensions", () => {
      expect(toastStyling.container.width).toBeGreaterThan(0);
      expect(toastStyling.container.padding).toBeGreaterThanOrEqual(0);
      expect(toastStyling.container.borderRadius).toBeGreaterThanOrEqual(0);
      expect(toastStyling.container.gap).toBeGreaterThanOrEqual(0);
    });
  });

  describe("title styling", () => {
    it("should have all required title properties", () => {
      expect(toastStyling.title.fontSize).toBeDefined();
      expect(toastStyling.title.fontWeight).toBeDefined();
      expect(toastStyling.title.color).toBeDefined();
    });

    it("should have correct types for title properties", () => {
      expect(typeof toastStyling.title.fontSize).toBe("number");
      expect(typeof toastStyling.title.fontWeight).toBe("number");
      expect(typeof toastStyling.title.color).toBe("string");
    });

    it("should have positive numeric values for typography", () => {
      expect(toastStyling.title.fontSize).toBeGreaterThan(0);
      expect(toastStyling.title.fontWeight).toBeGreaterThan(0);
    });
  });

  describe("description styling", () => {
    it("should have all required description properties", () => {
      expect(toastStyling.description.fontSize).toBeDefined();
      expect(toastStyling.description.fontWeight).toBeDefined();
      expect(toastStyling.description.color).toBeDefined();
    });

    it("should have correct types for description properties", () => {
      expect(typeof toastStyling.description.fontSize).toBe("number");
      expect(typeof toastStyling.description.fontWeight).toBe("number");
      expect(typeof toastStyling.description.color).toBe("string");
    });

    it("should have positive numeric values for typography", () => {
      expect(toastStyling.description.fontSize).toBeGreaterThan(0);
      expect(toastStyling.description.fontWeight).toBeGreaterThanOrEqual(0);
    });
  });

  describe("closeButton styling", () => {
    it("should have all required closeButton properties", () => {
      expect(toastStyling.closeButton.size).toBeDefined();
      expect(toastStyling.closeButton.iconSize).toBeDefined();
      expect(toastStyling.closeButton.iconName).toBeDefined();
      expect(toastStyling.closeButton.iconColor).toBeDefined();
      expect(toastStyling.closeButton.hoverBackground).toBeDefined();
      expect(toastStyling.closeButton.hoverColor).toBeDefined();
      expect(toastStyling.closeButton.borderRadius).toBeDefined();
    });

    it("should have correct types for closeButton properties", () => {
      expect(typeof toastStyling.closeButton.size).toBe("number");
      expect(typeof toastStyling.closeButton.iconSize).toBe("number");
      expect(typeof toastStyling.closeButton.iconName).toBe("string");
      expect(typeof toastStyling.closeButton.iconColor).toBe("string");
      expect(typeof toastStyling.closeButton.hoverBackground).toBe("string");
      expect(typeof toastStyling.closeButton.hoverColor).toBe("string");
      expect(typeof toastStyling.closeButton.borderRadius).toBe("number");
    });

    it("should have positive numeric values for dimensions", () => {
      expect(toastStyling.closeButton.size).toBeGreaterThan(0);
      expect(toastStyling.closeButton.iconSize).toBeGreaterThan(0);
      expect(toastStyling.closeButton.borderRadius).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("Toast Generator - Config Functions", () => {
  /**
   * These tests verify the config getter functions return
   * the expected structure from the registry.
   */

  describe("getContainerConfig", () => {
    it("should return container config matching registry", () => {
      const config = getContainerConfig();
      expect(config.raw).toEqual(toastStyling.container);
      expect(config.width).toBe(toastStyling.container.width);
      expect(config.padding).toBe(toastStyling.container.padding);
      expect(config.borderRadius).toBe(toastStyling.container.borderRadius);
      expect(config.background).toBe(toastStyling.container.background);
      expect(config.border).toBe(toastStyling.container.border);
      expect(config.shadow).toBe(toastStyling.container.shadow);
      expect(config.gap).toBe(toastStyling.container.gap);
    });

    it("should have all required properties", () => {
      const config = getContainerConfig();
      expect(config).toHaveProperty("raw");
      expect(config).toHaveProperty("width");
      expect(config).toHaveProperty("padding");
      expect(config).toHaveProperty("borderRadius");
      expect(config).toHaveProperty("background");
      expect(config).toHaveProperty("border");
      expect(config).toHaveProperty("shadow");
      expect(config).toHaveProperty("gap");
    });

    it("should return numeric values for dimensions", () => {
      const config = getContainerConfig();
      expect(typeof config.width).toBe("number");
      expect(typeof config.padding).toBe("number");
      expect(typeof config.borderRadius).toBe("number");
      expect(typeof config.gap).toBe("number");
    });

    it("should return string values for color tokens", () => {
      const config = getContainerConfig();
      expect(typeof config.background).toBe("string");
      expect(typeof config.border).toBe("string");
      expect(typeof config.shadow).toBe("string");
    });
  });

  describe("getTitleConfig", () => {
    it("should return title config matching registry", () => {
      const config = getTitleConfig();
      expect(config.raw).toEqual(toastStyling.title);
      expect(config.fontSize).toBe(toastStyling.title.fontSize);
      expect(config.fontWeight).toBe(toastStyling.title.fontWeight);
      expect(config.color).toBe(toastStyling.title.color);
    });

    it("should have all required properties", () => {
      const config = getTitleConfig();
      expect(config).toHaveProperty("raw");
      expect(config).toHaveProperty("fontSize");
      expect(config).toHaveProperty("fontWeight");
      expect(config).toHaveProperty("color");
    });

    it("should return numeric values for typography", () => {
      const config = getTitleConfig();
      expect(typeof config.fontSize).toBe("number");
      expect(typeof config.fontWeight).toBe("number");
    });

    it("should return string value for color token", () => {
      const config = getTitleConfig();
      expect(typeof config.color).toBe("string");
    });
  });

  describe("getDescriptionConfig", () => {
    it("should return description config matching registry", () => {
      const config = getDescriptionConfig();
      expect(config.raw).toEqual(toastStyling.description);
      expect(config.fontSize).toBe(toastStyling.description.fontSize);
      expect(config.fontWeight).toBe(toastStyling.description.fontWeight);
      expect(config.color).toBe(toastStyling.description.color);
    });

    it("should have all required properties", () => {
      const config = getDescriptionConfig();
      expect(config).toHaveProperty("raw");
      expect(config).toHaveProperty("fontSize");
      expect(config).toHaveProperty("fontWeight");
      expect(config).toHaveProperty("color");
    });

    it("should return numeric values for typography", () => {
      const config = getDescriptionConfig();
      expect(typeof config.fontSize).toBe("number");
      expect(typeof config.fontWeight).toBe("number");
    });

    it("should return string value for color token", () => {
      const config = getDescriptionConfig();
      expect(typeof config.color).toBe("string");
    });
  });

  describe("getCloseButtonConfig", () => {
    it("should return close button config matching registry", () => {
      const config = getCloseButtonConfig();
      expect(config.raw).toEqual(toastStyling.closeButton);
      expect(config.size).toBe(toastStyling.closeButton.size);
      expect(config.iconSize).toBe(toastStyling.closeButton.iconSize);
      expect(config.iconName).toBe(toastStyling.closeButton.iconName);
      expect(config.iconColor).toBe(toastStyling.closeButton.iconColor);
      expect(config.hoverBackground).toBe(
        toastStyling.closeButton.hoverBackground,
      );
      expect(config.hoverColor).toBe(toastStyling.closeButton.hoverColor);
      expect(config.borderRadius).toBe(toastStyling.closeButton.borderRadius);
    });

    it("should have all required properties", () => {
      const config = getCloseButtonConfig();
      expect(config).toHaveProperty("raw");
      expect(config).toHaveProperty("size");
      expect(config).toHaveProperty("iconSize");
      expect(config).toHaveProperty("iconName");
      expect(config).toHaveProperty("iconColor");
      expect(config).toHaveProperty("hoverBackground");
      expect(config).toHaveProperty("hoverColor");
      expect(config).toHaveProperty("borderRadius");
    });

    it("should return numeric values for dimensions", () => {
      const config = getCloseButtonConfig();
      expect(typeof config.size).toBe("number");
      expect(typeof config.iconSize).toBe("number");
      expect(typeof config.borderRadius).toBe("number");
    });

    it("should return string values for icon and color tokens", () => {
      const config = getCloseButtonConfig();
      expect(typeof config.iconName).toBe("string");
      expect(typeof config.iconColor).toBe("string");
      expect(typeof config.hoverBackground).toBe("string");
      expect(typeof config.hoverColor).toBe("string");
    });
  });
});

describe("Toast Generator - getAllVariantData", () => {
  /**
   * This function aggregates all data needed for Figma generation.
   * It should return a complete structure with all styling sections.
   */

  it("should return complete data structure", () => {
    const allData = getAllVariantData();
    expect(allData).toBeDefined();
    expect(allData.styling).toBeDefined();
    expect(allData.container).toBeDefined();
    expect(allData.title).toBeDefined();
    expect(allData.description).toBeDefined();
    expect(allData.closeButton).toBeDefined();
  });

  it("should include all styling sections from registry", () => {
    const allData = getAllVariantData();
    expect(allData.styling).toEqual(toastStyling);
  });

  it("should include parsed container config matching registry", () => {
    const allData = getAllVariantData();
    expect(allData.container.width).toBe(toastStyling.container.width);
    expect(allData.container.padding).toBe(toastStyling.container.padding);
    expect(allData.container.borderRadius).toBe(
      toastStyling.container.borderRadius,
    );
    expect(allData.container.background).toBe(
      toastStyling.container.background,
    );
    expect(allData.container.border).toBe(toastStyling.container.border);
  });

  it("should include parsed title config matching registry", () => {
    const allData = getAllVariantData();
    expect(allData.title.fontSize).toBe(toastStyling.title.fontSize);
    expect(allData.title.fontWeight).toBe(toastStyling.title.fontWeight);
    expect(allData.title.color).toBe(toastStyling.title.color);
  });

  it("should include parsed description config matching registry", () => {
    const allData = getAllVariantData();
    expect(allData.description.fontSize).toBe(
      toastStyling.description.fontSize,
    );
    expect(allData.description.fontWeight).toBe(
      toastStyling.description.fontWeight,
    );
    expect(allData.description.color).toBe(toastStyling.description.color);
  });

  it("should include parsed close button config matching registry", () => {
    const allData = getAllVariantData();
    expect(allData.closeButton.size).toBe(toastStyling.closeButton.size);
    expect(allData.closeButton.iconSize).toBe(
      toastStyling.closeButton.iconSize,
    );
    expect(allData.closeButton.iconName).toBe(
      toastStyling.closeButton.iconName,
    );
    expect(allData.closeButton.iconColor).toBe(
      toastStyling.closeButton.iconColor,
    );
  });
});

describe("Toast Generator - Expected Figma Output", () => {
  /**
   * These tests document the expected Figma component properties.
   * They verify structural invariants and type correctness,
   * not specific values which may change with design updates.
   */

  it("should produce valid Figma properties for toast container", () => {
    const containerConfig = getContainerConfig();

    // Expected Figma component properties - structural checks
    const figmaProps = {
      layoutMode: "VERTICAL",
      width: containerConfig.width,
      padding: containerConfig.padding,
      cornerRadius: containerConfig.borderRadius,
      itemSpacing: containerConfig.gap,
      backgroundVariable: containerConfig.background,
      borderVariable: containerConfig.border,
    };

    // Structural assertions - verify types and valid ranges
    expect(figmaProps.layoutMode).toBe("VERTICAL");
    expect(typeof figmaProps.width).toBe("number");
    expect(figmaProps.width).toBeGreaterThan(0);
    expect(typeof figmaProps.padding).toBe("number");
    expect(figmaProps.padding).toBeGreaterThanOrEqual(0);
    expect(typeof figmaProps.cornerRadius).toBe("number");
    expect(figmaProps.cornerRadius).toBeGreaterThanOrEqual(0);
    expect(typeof figmaProps.itemSpacing).toBe("number");
    expect(figmaProps.itemSpacing).toBeGreaterThanOrEqual(0);
    expect(typeof figmaProps.backgroundVariable).toBe("string");
    expect(typeof figmaProps.borderVariable).toBe("string");
  });

  it("should produce valid Figma properties for toast title", () => {
    const titleConfig = getTitleConfig();

    const figmaProps = {
      fontSize: titleConfig.fontSize,
      fontWeight: titleConfig.fontWeight,
      textVariable: titleConfig.color,
    };

    expect(typeof figmaProps.fontSize).toBe("number");
    expect(figmaProps.fontSize).toBeGreaterThan(0);
    expect(typeof figmaProps.fontWeight).toBe("number");
    expect(figmaProps.fontWeight).toBeGreaterThan(0);
    expect(typeof figmaProps.textVariable).toBe("string");
  });

  it("should produce valid Figma properties for toast description", () => {
    const descConfig = getDescriptionConfig();

    const figmaProps = {
      fontSize: descConfig.fontSize,
      fontWeight: descConfig.fontWeight,
      textVariable: descConfig.color,
    };

    expect(typeof figmaProps.fontSize).toBe("number");
    expect(figmaProps.fontSize).toBeGreaterThan(0);
    expect(typeof figmaProps.fontWeight).toBe("number");
    expect(figmaProps.fontWeight).toBeGreaterThanOrEqual(0);
    expect(typeof figmaProps.textVariable).toBe("string");
  });

  it("should produce valid Figma properties for close button", () => {
    const buttonConfig = getCloseButtonConfig();

    const figmaProps = {
      size: buttonConfig.size,
      iconSize: buttonConfig.iconSize,
      iconName: buttonConfig.iconName,
      iconColor: buttonConfig.iconColor,
      hoverBackground: buttonConfig.hoverBackground,
      hoverColor: buttonConfig.hoverColor,
      borderRadius: buttonConfig.borderRadius,
    };

    // Structural assertions - verify types and valid ranges
    expect(typeof figmaProps.size).toBe("number");
    expect(figmaProps.size).toBeGreaterThan(0);
    expect(typeof figmaProps.iconSize).toBe("number");
    expect(figmaProps.iconSize).toBeGreaterThan(0);
    expect(typeof figmaProps.iconName).toBe("string");
    expect(figmaProps.iconName.length).toBeGreaterThan(0);
    expect(typeof figmaProps.iconColor).toBe("string");
    expect(typeof figmaProps.hoverBackground).toBe("string");
    expect(typeof figmaProps.hoverColor).toBe("string");
    expect(typeof figmaProps.borderRadius).toBe("number");
    expect(figmaProps.borderRadius).toBeGreaterThanOrEqual(0);
  });
});
