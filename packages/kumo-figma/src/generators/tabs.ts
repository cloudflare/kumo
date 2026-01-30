/**
 * Tabs Component Generator
 *
 * Generates a Tabs ComponentSet in Figma that matches
 * the Tabs component structure from tabs.tsx.
 *
 * Structure:
 * - Horizontal container with rounded background (bg-kumo-tint)
 * - Active tab has elevated white pill indicator (bg-kumo-control with shadow)
 * - Inactive tabs show muted text
 * - Active tab has dark text
 *
 * @see packages/kumo/src/components/tabs/tabs.tsx
 * @see packages/kumo/src/components/tabs/tabs.stories.tsx
 */

import {
  getVariableByName,
  createModeSection,
  createRowLabel,
  bindFillToVariable,
  bindStrokeToVariable,
  createTextNode,
  bindTextColorToVariable,
  SECTION_PADDING,
  SECTION_GAP,
  SHADOWS,
  GRID_LAYOUT,
  SECTION_LAYOUT,
  BORDER_RADIUS,
  FALLBACK_VALUES,
  VAR_NAMES,
} from "./shared";
import { logComplete, logStart, logProgress } from "../logger";
import registry from "@cloudflare/kumo/ai/component-registry.json";
import themeData from "../generated/theme-data.json";

// Type for registry styling
const tabsStyling = (registry.components as any).Tabs?.styling;

/**
 * Fallback tabs dimensions and styling
 * Used if registry doesn't have styling metadata
 * Based on tabs.tsx:
 * - Container: h-8.5 (34px), rounded-lg (8px), bg-accent, px-px (1px)
 * - Tab buttons: my-px (1px vertical margin), px-2.5 (10px horizontal), rounded-lg
 * - Indicator: rounded-lg, bg-secondary, shadow-sm, ring ring-kumo-fill-hover
 *
 * Values derived from theme-data.json where possible to prevent drift.
 */
const FALLBACK_TABS_CONFIG = {
  /** Height of tabs container (h-8.5 = 8.5 * 4 = 34px) */
  containerHeight: themeData.tailwind.spacing.scale["8"] + 2, // 32 + 2 = 34px (closest to h-8.5)
  /** Border radius for container (rounded-lg = 8px) */
  borderRadius: BORDER_RADIUS.lg,
  /** Horizontal padding inside container (px-px = 1px on each side) */
  containerPadding: themeData.tailwind.spacing.scale["px"], // 1px
  /** Vertical margin on tabs (my-px = 1px) */
  tabVerticalMargin: themeData.tailwind.spacing.scale["px"], // 1px
  /** Horizontal padding on tabs (px-2.5 = 10px) */
  tabHorizontalPadding: themeData.tailwind.spacing.scale["2.5"], // 10px
  /** Tab text size (text-base from Tailwind = 16px, or Kumo = 14px) */
  tabFontSize: themeData.tailwind.fontSize.base, // 16px (Tailwind default for tabs)
  /** Tab font weight (font-medium = 500) */
  tabFontWeight: FALLBACK_VALUES.fontWeight.medium, // 500
};

/**
 * Get tabs configuration from registry with fallback
 * Reads from registry.components.Tabs.styling
 */
function getTabsConfigFromRegistry() {
  if (!tabsStyling) {
    return FALLBACK_TABS_CONFIG;
  }

  return {
    containerHeight:
      tabsStyling.container?.height ?? FALLBACK_TABS_CONFIG.containerHeight,
    borderRadius:
      tabsStyling.container?.borderRadius ?? FALLBACK_TABS_CONFIG.borderRadius,
    containerPadding:
      tabsStyling.container?.padding ?? FALLBACK_TABS_CONFIG.containerPadding,
    tabVerticalMargin:
      tabsStyling.tab?.verticalMargin ?? FALLBACK_TABS_CONFIG.tabVerticalMargin,
    tabHorizontalPadding:
      tabsStyling.tab?.paddingX ?? FALLBACK_TABS_CONFIG.tabHorizontalPadding,
    tabFontSize: tabsStyling.tab?.fontSize ?? FALLBACK_TABS_CONFIG.tabFontSize,
    tabFontWeight:
      tabsStyling.tab?.fontWeight ?? FALLBACK_TABS_CONFIG.tabFontWeight,
  };
}

/**
 * Tabs configuration (reads from registry with fallback)
 */
const TABS_CONFIG = getTabsConfigFromRegistry();

/**
 * Default tab items to display (matches Storybook Default story)
 */
const DEFAULT_TABS = ["Tab 1", "Tab 2", "Tab 3"];

/**
 * Testable export functions for testing
 * These enable testing without Figma runtime
 */

/**
 * Get container configuration from TABS_CONFIG
 * Used for testing and validation
 */
export function getContainerConfig() {
  return {
    height: TABS_CONFIG.containerHeight,
    borderRadius: TABS_CONFIG.borderRadius,
    padding: TABS_CONFIG.containerPadding,
  };
}

/**
 * Get tab configuration from TABS_CONFIG
 * Used for testing and validation
 */
export function getTabConfig() {
  return {
    paddingX: TABS_CONFIG.tabHorizontalPadding,
    verticalMargin: TABS_CONFIG.tabVerticalMargin,
    fontSize: TABS_CONFIG.tabFontSize,
    fontWeight: TABS_CONFIG.tabFontWeight,
    borderRadius: TABS_CONFIG.borderRadius,
  };
}

/**
 * Get indicator configuration
 * Used for testing and validation
 */
export function getIndicatorConfig() {
  return {
    borderRadius: TABS_CONFIG.borderRadius,
    // Note: Colors and shadow are applied via Figma variables at runtime
    // These are semantic tokens: color-secondary, color-color-2, shadow-sm
  };
}

/**
 * Get all variant data for testing
 * Returns complete data structure for snapshot testing
 */
export function getAllVariantData() {
  return {
    config: TABS_CONFIG,
    defaultTabs: DEFAULT_TABS,
    container: getContainerConfig(),
    tab: getTabConfig(),
    indicator: getIndicatorConfig(),
    variants: DEFAULT_TABS.map((tab, index) => ({
      value: tab,
      index,
      isActive: false, // Will be set based on activeIndex
    })),
  };
}

/**
 * Create a single tab button
 *
 * @param label - Tab label text
 * @param isActive - Whether this tab is active
 * @returns FrameNode representing the tab button
 */
async function createTabButton(
  label: string,
  isActive: boolean,
): Promise<FrameNode> {
  const button = figma.createFrame();
  button.name = isActive ? "Tab (active)" : "Tab";

  // Layout: horizontal, hug content
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.primaryAxisSizingMode = "AUTO"; // Hug width
  button.counterAxisSizingMode = "FIXED"; // Fixed height

  // Height accounts for vertical margin (34px container - 2px margin = 32px)
  const buttonHeight =
    TABS_CONFIG.containerHeight - TABS_CONFIG.tabVerticalMargin * 2;
  button.resize(100, buttonHeight); // Width will auto-resize

  // Padding: px-2.5 (10px horizontal)
  button.paddingLeft = TABS_CONFIG.tabHorizontalPadding;
  button.paddingRight = TABS_CONFIG.tabHorizontalPadding;
  button.paddingTop = 0;
  button.paddingBottom = 0;

  // Corner radius (rounded-lg = 8px)
  button.cornerRadius = TABS_CONFIG.borderRadius;

  // Background: transparent (indicator provides background for active)
  button.fills = [];

  // Create text label
  const text = await createTextNode(
    label,
    TABS_CONFIG.tabFontSize,
    TABS_CONFIG.tabFontWeight,
  );
  text.name = "Label";

  // Text color: text-kumo-default for active, text-kumo-strong for inactive
  if (isActive) {
    const surfaceTextVar = getVariableByName(VAR_NAMES.text.default);
    if (surfaceTextVar) {
      bindTextColorToVariable(text, surfaceTextVar.id);
    }
  } else {
    const labelTextVar = getVariableByName(VAR_NAMES.text.strong);
    if (labelTextVar) {
      bindTextColorToVariable(text, labelTextVar.id);
    }
  }

  button.appendChild(text);

  return button;
}

/**
 * Create the active tab indicator (animated pill background)
 *
 * @param activeIndex - Index of the active tab (for positioning)
 * @param tabWidths - Array of tab widths for positioning calculation
 * @returns FrameNode representing the indicator
 */
function createTabIndicator(
  activeIndex: number,
  tabWidths: number[],
): FrameNode {
  const indicator = figma.createFrame();
  indicator.name = "Indicator";

  // NOTE: layoutPositioning = "ABSOLUTE" must be set AFTER adding to parent
  // It will be set in createTabsComponent after insertChild

  // Calculate position and size based on active tab
  const indicatorHeight =
    TABS_CONFIG.containerHeight - TABS_CONFIG.tabVerticalMargin * 2;

  // Width matches the active tab
  const indicatorWidth = tabWidths[activeIndex];

  // X position is sum of previous tab widths + container padding
  let indicatorX = TABS_CONFIG.containerPadding;
  for (let i = 0; i < activeIndex; i++) {
    indicatorX = indicatorX + tabWidths[i];
  }

  // Y position accounts for vertical margin
  const indicatorY = TABS_CONFIG.tabVerticalMargin;

  indicator.resize(indicatorWidth, indicatorHeight);
  indicator.x = indicatorX;
  indicator.y = indicatorY;

  // Styling: rounded-lg, bg-kumo-control
  indicator.cornerRadius = TABS_CONFIG.borderRadius;

  // Background: bg-kumo-control
  const surfaceElevatedVar = getVariableByName(VAR_NAMES.color.control);
  if (surfaceElevatedVar) {
    bindFillToVariable(indicator, surfaceElevatedVar.id);
  }

  // Border: ring ring-kumo-fill-hover (1px)
  const ringVar = getVariableByName(VAR_NAMES.color.elevated);
  if (ringVar) {
    bindStrokeToVariable(indicator, ringVar.id, 1);
  }

  // Shadow: shadow-sm using centralized shadow preset
  indicator.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: SHADOWS.subtle.opacity },
      offset: { x: SHADOWS.subtle.offsetX, y: SHADOWS.subtle.offsetY },
      radius: SHADOWS.subtle.blur,
      spread: SHADOWS.subtle.spread,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  return indicator;
}

/**
 * Create a Tabs component with specified active index
 *
 * @param activeIndex - Index of the active tab (0-based)
 * @returns ComponentNode for the Tabs
 */
async function createTabsComponent(
  activeIndex: number,
): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = "active=" + DEFAULT_TABS[activeIndex];
  component.description =
    "Tabs navigation component. " +
    "Active tab shows elevated white pill indicator with shadow. " +
    "Tabs: Tab 1, Tab 2, Tab 3.";

  // Container layout: horizontal, hug contents
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO"; // Hug width
  component.counterAxisSizingMode = "FIXED"; // Fixed height
  component.resize(100, TABS_CONFIG.containerHeight); // Will auto-resize width
  component.itemSpacing = 0; // No gap between tabs
  component.paddingLeft = TABS_CONFIG.containerPadding;
  component.paddingRight = TABS_CONFIG.containerPadding;
  component.paddingTop = 0;
  component.paddingBottom = 0;

  // Styling: rounded-lg, bg-kumo-tint
  component.cornerRadius = TABS_CONFIG.borderRadius;

  // Background: bg-kumo-tint
  const tintVar = getVariableByName(VAR_NAMES.color.tint);
  if (tintVar) {
    bindFillToVariable(component, tintVar.id);
  }

  // Create tab buttons and add to component
  const tabButtons: FrameNode[] = [];
  const tabWidths: number[] = [];

  for (let i = 0; i < DEFAULT_TABS.length; i++) {
    const tab = DEFAULT_TABS[i];
    const isActive = i === activeIndex;
    const button = await createTabButton(tab, isActive);
    tabButtons.push(button);
    component.appendChild(button);
    // Width is calculated after appendChild due to auto-layout
    tabWidths.push(button.width);
  }

  // Create indicator and insert at index 0 (behind tabs)
  // In Figma, lower index = further back in z-order
  const indicator = createTabIndicator(activeIndex, tabWidths);

  // Insert indicator at the beginning so it appears behind tabs
  // In Figma, lower index = further back in z-order
  component.insertChild(0, indicator);

  // CRITICAL: Set layoutPositioning AFTER adding to parent with layoutMode !== NONE
  // This makes the indicator absolutely positioned so it doesn't affect tab layout
  indicator.layoutPositioning = "ABSOLUTE";

  return component;
}

/**
 * Generate Tabs ComponentSet
 *
 * Creates a "Tabs" ComponentSet with active state variants.
 * Creates both light and dark mode sections.
 *
 * @param page - The page to add components to
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateTabsComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  logStart("Tabs", "Y=" + startY);

  try {
    figma.currentPage = page;

    const components: ComponentNode[] = [];
    const rowLabels: { y: number; text: string }[] = [];

    const labelColumnWidth = GRID_LAYOUT.labelColumnWidth.standard;
    const rowGap = GRID_LAYOUT.rowGap.compact;
    let currentY = 0;

    // Create a component for each active state
    for (let i = 0; i < DEFAULT_TABS.length; i++) {
      const tab = DEFAULT_TABS[i];
      logProgress("Tabs", "Creating active=" + tab);

      const component = await createTabsComponent(i);
      component.x = labelColumnWidth;
      component.y = currentY;

      rowLabels.push({ y: currentY, text: "active=" + tab });
      components.push(component);

      currentY = currentY + TABS_CONFIG.containerHeight + rowGap;
    }

    logProgress("Tabs", "Combining as variants...");
    // @ts-ignore - combineAsVariants works at runtime
    const componentSet = figma.combineAsVariants(components, page);
    componentSet.name = "Tabs";
    componentSet.description =
      "Tabs - Horizontal tab navigation. " +
      "Shows active state with elevated pill indicator. " +
      "Tabs: Tab 1, Tab 2, Tab 3.";
    componentSet.layoutMode = "NONE";

    // Calculate content dimensions
    const contentWidth = componentSet.width + labelColumnWidth;
    const contentHeight = componentSet.height;

    // Create light mode section
    const lightSection = createModeSection(page, "Tabs", "light");
    lightSection.frame.resize(
      contentWidth + SECTION_PADDING * 2,
      contentHeight + SECTION_PADDING * 2,
    );

    // Create dark mode section
    const darkSection = createModeSection(page, "Tabs", "dark");
    darkSection.frame.resize(
      contentWidth + SECTION_PADDING * 2,
      contentHeight + SECTION_PADDING * 2,
    );

    // Move ComponentSet into light section frame
    lightSection.frame.appendChild(componentSet);
    componentSet.x = SECTION_PADDING + labelColumnWidth;
    componentSet.y = SECTION_PADDING;

    // Add row labels to light section
    for (let li = 0; li < rowLabels.length; li++) {
      const label = rowLabels[li];
      const labelNode = await createRowLabel(
        label.text,
        SECTION_PADDING,
        SECTION_PADDING + label.y + GRID_LAYOUT.labelVerticalOffset.lg, // Large offset to center vertically with tabs
      );
      lightSection.frame.appendChild(labelNode);
    }

    // Create instances for dark section
    for (let k = 0; k < components.length; k++) {
      const origComp = components[k];
      const instance = origComp.createInstance();
      instance.x = SECTION_PADDING + labelColumnWidth;
      instance.y = origComp.y + SECTION_PADDING;
      darkSection.frame.appendChild(instance);
    }

    // Add row labels to dark section
    for (let di = 0; di < rowLabels.length; di++) {
      const darkLabel = rowLabels[di];
      const darkLabelNode = await createRowLabel(
        darkLabel.text,
        SECTION_PADDING,
        SECTION_PADDING + darkLabel.y + GRID_LAYOUT.labelVerticalOffset.lg,
      );
      darkSection.frame.appendChild(darkLabelNode);
    }

    // Resize sections to fit content with padding
    const totalWidth = contentWidth + SECTION_PADDING * 2;
    const totalHeight = contentHeight + SECTION_PADDING * 2;

    lightSection.frame.resize(totalWidth, totalHeight);
    darkSection.frame.resize(totalWidth, totalHeight);

    // Add title inside each frame

    // Position sections side by side
    lightSection.frame.x = SECTION_LAYOUT.startX;
    lightSection.frame.y = startY;

    darkSection.frame.x =
      lightSection.frame.x + totalWidth + SECTION_LAYOUT.modeGap;
    darkSection.frame.y = startY;

    logComplete(
      "Generated Tabs ComponentSet with " +
        DEFAULT_TABS.length +
        " variants (light + dark)",
    );

    return startY + totalHeight + SECTION_GAP;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("Tabs generation failed: " + errorMessage);
    console.error("Stack: " + errorStack);
    throw error;
  }
}
