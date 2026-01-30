/**
 * Tests for pagination.ts generator
 *
 * These tests ensure the Pagination Figma component generation stays in sync
 * with the source of truth (component-registry.json).
 *
 * CRITICAL: These tests act as a regression guard. If you change the pagination
 * generator, these tests will catch any unintended changes.
 *
 * Source of truth chain:
 * pagination.tsx → component-registry.json → pagination.ts (generator) → Figma
 */

import { describe, it, expect } from "vitest";
import {
  getPaginationDimensionsConfig,
  getPaginationStateConfig,
  getPaginationColorBindings,
  calculateShowingRange,
  getButtonStates,
  getAllPaginationData,
} from "./pagination";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const componentData = registry.components.Pagination;
const props = componentData.props;

describe("Pagination Generator - Registry Validation", () => {
  it("should have Pagination component in registry", () => {
    expect(componentData).toBeDefined();
    expect(componentData.name).toBe("Pagination");
    expect(componentData.category).toBe("Navigation");
  });

  it("should have required props defined", () => {
    expect(props.setPage).toBeDefined();
    expect(props.setPage.type).toBe("(page: number) => void");
    expect(props.setPage.required).toBe(true);
  });

  it("should have optional props defined", () => {
    expect(props.page).toBeDefined();
    expect(props.page.optional).toBe(true);
    expect(props.perPage).toBeDefined();
    expect(props.perPage.optional).toBe(true);
    expect(props.totalCount).toBeDefined();
    expect(props.totalCount.optional).toBe(true);
  });

  it("should have examples defined", () => {
    expect(componentData.examples).toBeDefined();
    expect(Array.isArray(componentData.examples)).toBe(true);
    expect(componentData.examples.length).toBeGreaterThan(0);
  });
});

describe("Pagination Generator - Dimensions Configuration", () => {
  const dimensions = getPaginationDimensionsConfig();

  it("should have all dimension properties defined", () => {
    expect(dimensions.paginationHeight).toBeDefined();
    expect(dimensions.buttonSize).toBeDefined();
    expect(dimensions.inputWidth).toBeDefined();
    expect(dimensions.iconSize).toBeDefined();
    expect(dimensions.gap).toBeDefined();
    expect(dimensions.borderRadius).toBeDefined();
  });

  it("should have numeric values for all dimensions", () => {
    expect(typeof dimensions.paginationHeight).toBe("number");
    expect(typeof dimensions.buttonSize).toBe("number");
    expect(typeof dimensions.inputWidth).toBe("number");
    expect(typeof dimensions.iconSize).toBe("number");
    expect(typeof dimensions.gap).toBe("number");
    expect(typeof dimensions.borderRadius).toBe("number");
  });

  it("should have positive values for non-zero dimensions", () => {
    expect(dimensions.paginationHeight).toBeGreaterThan(0);
    expect(dimensions.buttonSize).toBeGreaterThan(0);
    expect(dimensions.inputWidth).toBeGreaterThan(0);
    expect(dimensions.iconSize).toBeGreaterThan(0);
    expect(dimensions.borderRadius).toBeGreaterThan(0);
  });

  it("should have gap of 0 (buttons flush against each other)", () => {
    expect(dimensions.gap).toBe(0);
  });

  it("should have button size equal to pagination height", () => {
    expect(dimensions.buttonSize).toBe(dimensions.paginationHeight);
  });
});

describe("Pagination Generator - State Configuration", () => {
  const states = getPaginationStateConfig();

  it("should have 3 state variants", () => {
    expect(Array.isArray(states)).toBe(true);
    expect(states.length).toBe(3);
  });

  it("should have first page state", () => {
    const firstState = states.find((s) => s.label === "state=first");
    expect(firstState).toBeDefined();
    expect(firstState!.page).toBe(1);
  });

  it("should have middle page state", () => {
    const middleState = states.find((s) => s.label === "state=middle");
    expect(middleState).toBeDefined();
    expect(middleState!.page).toBeGreaterThan(1);
  });

  it("should have last page state", () => {
    const lastState = states.find((s) => s.label === "state=last");
    expect(lastState).toBeDefined();
    expect(lastState!.page).toBeGreaterThan(1);
  });

  it("should have page and label for each state", () => {
    states.forEach((state) => {
      expect(typeof state.page).toBe("number");
      expect(typeof state.label).toBe("string");
      expect(state.page).toBeGreaterThan(0);
      expect(state.label.length).toBeGreaterThan(0);
    });
  });
});

describe("Pagination Generator - Color Bindings", () => {
  const colors = getPaginationColorBindings();

  it("should have all color bindings defined", () => {
    expect(colors.buttonBackground).toBeDefined();
    expect(colors.buttonBorder).toBeDefined();
    expect(colors.iconEnabled).toBeDefined();
    expect(colors.iconDisabled).toBeDefined();
    expect(colors.inputBackground).toBeDefined();
    expect(colors.inputBorder).toBeDefined();
    expect(colors.inputText).toBeDefined();
    expect(colors.showingTextLabel).toBeDefined();
  });

  it("should use semantic tokens for all colors", () => {
    expect(typeof colors.buttonBackground).toBe("string");
    expect(typeof colors.buttonBorder).toBe("string");
    expect(typeof colors.iconEnabled).toBe("string");
    expect(typeof colors.iconDisabled).toBe("string");
    expect(typeof colors.inputBackground).toBe("string");
    expect(typeof colors.inputBorder).toBe("string");
    expect(typeof colors.inputText).toBe("string");
    expect(typeof colors.showingTextLabel).toBe("string");
  });

  it("should use kumo semantic tokens for buttons", () => {
    // Button background and border should use kumo color tokens
    expect(colors.buttonBackground).toMatch(/^color-kumo-/);
    expect(colors.buttonBorder).toMatch(/^color-kumo-/);
  });

  it("should use kumo semantic tokens for icons", () => {
    // Icon colors should use kumo text color tokens
    expect(colors.iconEnabled).toMatch(/^text-color-kumo-/);
    expect(colors.iconDisabled).toMatch(/^text-color-kumo-/);
    // Enabled and disabled states should be different
    expect(colors.iconEnabled).not.toBe(colors.iconDisabled);
  });

  it("should use kumo semantic tokens for input", () => {
    // Input colors should use kumo tokens
    expect(colors.inputBackground).toMatch(/^color-kumo-/);
    expect(colors.inputBorder).toMatch(/^color-kumo-/);
    expect(colors.inputText).toMatch(/^text-color-kumo-/);
  });

  it("should use kumo semantic token for showing text", () => {
    expect(colors.showingTextLabel).toMatch(/^text-color-kumo-/);
  });
});

describe("Pagination Generator - Showing Range Calculation", () => {
  it("should calculate first page range correctly", () => {
    const range = calculateShowingRange(1, 10, 100);
    expect(range.lower).toBe(1);
    expect(range.upper).toBe(10);
    expect(range.maxPage).toBe(10);
    expect(range.text).toBe("Showing 1-10 of 100");
  });

  it("should calculate middle page range correctly", () => {
    const range = calculateShowingRange(5, 10, 100);
    expect(range.lower).toBe(41);
    expect(range.upper).toBe(50);
    expect(range.maxPage).toBe(10);
    expect(range.text).toBe("Showing 41-50 of 100");
  });

  it("should calculate last page range correctly", () => {
    const range = calculateShowingRange(10, 10, 100);
    expect(range.lower).toBe(91);
    expect(range.upper).toBe(100);
    expect(range.maxPage).toBe(10);
    expect(range.text).toBe("Showing 91-100 of 100");
  });

  it("should handle partial last page correctly", () => {
    const range = calculateShowingRange(10, 10, 95);
    expect(range.lower).toBe(91);
    expect(range.upper).toBe(95);
    expect(range.maxPage).toBe(10);
    expect(range.text).toBe("Showing 91-95 of 95");
  });

  it("should have all required properties", () => {
    const range = calculateShowingRange(1, 10, 100);
    expect(typeof range.lower).toBe("number");
    expect(typeof range.upper).toBe("number");
    expect(typeof range.maxPage).toBe("number");
    expect(typeof range.text).toBe("string");
  });
});

describe("Pagination Generator - Button States", () => {
  it("should disable prev/first buttons on first page", () => {
    const states = getButtonStates(1, 10);
    expect(states.isFirstPage).toBe(true);
    expect(states.isLastPage).toBe(false);

    const firstBtn = states.buttons.find((b) => b.ariaLabel === "First page");
    const prevBtn = states.buttons.find((b) => b.ariaLabel === "Previous page");
    expect(firstBtn!.disabled).toBe(true);
    expect(prevBtn!.disabled).toBe(true);
  });

  it("should enable all buttons on middle page", () => {
    const states = getButtonStates(5, 10);
    expect(states.isFirstPage).toBe(false);
    expect(states.isLastPage).toBe(false);

    states.buttons.forEach((btn) => {
      expect(btn.disabled).toBe(false);
    });
  });

  it("should disable next/last buttons on last page", () => {
    const states = getButtonStates(10, 10);
    expect(states.isFirstPage).toBe(false);
    expect(states.isLastPage).toBe(true);

    const nextBtn = states.buttons.find((b) => b.ariaLabel === "Next page");
    const lastBtn = states.buttons.find((b) => b.ariaLabel === "Last page");
    expect(nextBtn!.disabled).toBe(true);
    expect(lastBtn!.disabled).toBe(true);
  });

  it("should have 4 navigation buttons", () => {
    const states = getButtonStates(5, 10);
    expect(states.buttons.length).toBe(4);
  });

  it("should have correct button configuration for first page", () => {
    const states = getButtonStates(1, 10);
    const firstBtn = states.buttons[0];
    // Icon should be a phosphor icon
    expect(firstBtn.iconId).toMatch(/^ph-/);
    expect(typeof firstBtn.ariaLabel).toBe("string");
    expect(firstBtn.ariaLabel.length).toBeGreaterThan(0);
    expect(firstBtn.position).toBe("first");
  });

  it("should have correct button configuration for previous page", () => {
    const states = getButtonStates(1, 10);
    const prevBtn = states.buttons[1];
    // Icon should be a phosphor icon
    expect(prevBtn.iconId).toMatch(/^ph-/);
    expect(typeof prevBtn.ariaLabel).toBe("string");
    expect(prevBtn.ariaLabel.length).toBeGreaterThan(0);
    expect(prevBtn.position).toBe("middle");
  });

  it("should have correct button configuration for next page", () => {
    const states = getButtonStates(1, 10);
    const nextBtn = states.buttons[2];
    // Icon should be a phosphor icon
    expect(nextBtn.iconId).toMatch(/^ph-/);
    expect(typeof nextBtn.ariaLabel).toBe("string");
    expect(nextBtn.ariaLabel.length).toBeGreaterThan(0);
    expect(nextBtn.position).toBe("middle");
  });

  it("should have correct button configuration for last page", () => {
    const states = getButtonStates(1, 10);
    const lastBtn = states.buttons[3];
    // Icon should be a phosphor icon
    expect(lastBtn.iconId).toMatch(/^ph-/);
    expect(typeof lastBtn.ariaLabel).toBe("string");
    expect(lastBtn.ariaLabel.length).toBeGreaterThan(0);
    expect(lastBtn.position).toBe("last");
  });

  it("should have unique icons for each navigation direction", () => {
    const states = getButtonStates(1, 10);
    const iconIds = states.buttons.map((b) => b.iconId);
    // All 4 buttons should have unique icons
    const uniqueIcons = new Set(iconIds);
    expect(uniqueIcons.size).toBe(4);
  });

  it("should have required properties for each button", () => {
    const states = getButtonStates(5, 10);
    states.buttons.forEach((btn) => {
      expect(typeof btn.iconId).toBe("string");
      expect(typeof btn.ariaLabel).toBe("string");
      expect(typeof btn.position).toBe("string");
      expect(typeof btn.disabled).toBe("boolean");
    });
  });
});

describe("Pagination Generator - Complete Data Structure", () => {
  const allData = getAllPaginationData();

  it("should have all top-level properties defined", () => {
    expect(allData.dimensions).toBeDefined();
    expect(allData.colors).toBeDefined();
    expect(allData.states).toBeDefined();
  });

  it("should have 3 state variants with complete data", () => {
    expect(Array.isArray(allData.states)).toBe(true);
    expect(allData.states.length).toBe(3);
  });

  it("should have showing range for each state", () => {
    allData.states.forEach((state) => {
      expect(state.showingRange).toBeDefined();
      expect(typeof state.showingRange.lower).toBe("number");
      expect(typeof state.showingRange.upper).toBe("number");
      expect(typeof state.showingRange.maxPage).toBe("number");
      expect(typeof state.showingRange.text).toBe("string");
    });
  });

  it("should have button states for each state", () => {
    allData.states.forEach((state) => {
      expect(state.buttonStates).toBeDefined();
      expect(typeof state.buttonStates.isFirstPage).toBe("boolean");
      expect(typeof state.buttonStates.isLastPage).toBe("boolean");
      expect(Array.isArray(state.buttonStates.buttons)).toBe(true);
      expect(state.buttonStates.buttons.length).toBe(4);
    });
  });

  it("should have first page with prev/first buttons disabled", () => {
    const firstState = allData.states.find((s) => s.label === "state=first");
    expect(firstState).toBeDefined();
    expect(firstState!.buttonStates.isFirstPage).toBe(true);
    expect(firstState!.buttonStates.isLastPage).toBe(false);
  });

  it("should have middle page with all buttons enabled", () => {
    const middleState = allData.states.find((s) => s.label === "state=middle");
    expect(middleState).toBeDefined();
    expect(middleState!.buttonStates.isFirstPage).toBe(false);
    expect(middleState!.buttonStates.isLastPage).toBe(false);
  });

  it("should have last page with next/last buttons disabled", () => {
    const lastState = allData.states.find((s) => s.label === "state=last");
    expect(lastState).toBeDefined();
    expect(lastState!.buttonStates.isFirstPage).toBe(false);
    expect(lastState!.buttonStates.isLastPage).toBe(true);
  });
});
