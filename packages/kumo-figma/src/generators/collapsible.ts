/**
 * Collapsible Component Generator
 *
 * Generates a Collapsible ComponentSet in Figma that matches
 * the Collapsible component props:
 *
 * - open: true, false
 * - state: default, hover, focus, disabled
 *
 * The Collapsible has a trigger (label + chevron icon) and when open,
 * displays a content panel with a left border.
 *
 * Reads styles from component-registry.json (the source of truth).
 * Uses real icons from the Icon Library page.
 *
 * @see packages/kumo/src/components/collapsible/collapsible.tsx
 */

import {
  createTextNode,
  getVariableByName,
  createModeSection,
  createRowLabel,
  createColumnHeaders,
  bindStrokeToVariable,
  bindTextColorToVariable,
  BORDER_RADIUS,
  SECTION_PADDING,
  SECTION_GAP,
  FALLBACK_VALUES,
  GRID_LAYOUT,
  SECTION_LAYOUT,
  SECTION_TITLE,
  OPACITY,
  SPACING,
  VAR_NAMES,
} from "./shared";
import themeData from "../generated/theme-data.json";
import { getButtonIcon, bindIconColor } from "./icon-utils";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import { logComplete } from "../logger";
import registry from "@cloudflare/kumo/ai/component-registry.json";

// Extract Collapsible component data from registry
const collapsibleComponent = registry.components.Collapsible;
const collapsibleColors = collapsibleComponent.colors as string[];

/**
 * Base styles from collapsibleVariants() in collapsible.tsx
 * Reading from React component source:
 * "flex cursor-pointer items-center gap-1 text-sm text-kumo-link select-none"
 *
 * NOTE: Collapsible has no variants (KUMO_COLLAPSIBLE_VARIANTS is empty).
 * The collapsibleVariants() function returns a fixed set of base styles.
 * Using actual class string from collapsible.tsx collapsibleVariants().
 */
const TRIGGER_BASE_STYLES = "flex items-center gap-1 text-sm text-kumo-link";

/**
 * Content panel styles from collapsible.tsx
 * From the inline className in the content div:
 * "my-2 space-y-4 border-l-2 border-kumo-fill pl-4"
 *
 * These classes are directly in the JSX, not in a variant function.
 */
const CONTENT_PANEL_STYLES = "my-2 border-l-2 border-kumo-fill pl-4";

/**
 * Open state values
 */
const OPEN_VALUES = [false, true];

/**
 * Interaction state values
 */
const STATE_VALUES = ["default", "hover", "focus", "disabled"];

/**
 * State-specific style overrides for the trigger
 */
const STATE_STYLES: Record<
  string,
  {
    textVariable?: string;
    addRing?: boolean;
    opacity?: number;
  }
> = {
  default: {
    textVariable: VAR_NAMES.text.link,
  },
  hover: {
    textVariable: VAR_NAMES.text.link,
    // Could add underline or different color on hover
  },
  focus: {
    textVariable: VAR_NAMES.text.link,
    addRing: true,
  },
  disabled: {
    textVariable: VAR_NAMES.text.disabled,
    opacity: OPACITY.disabled,
  },
};

/**
 * Create a single Collapsible component variant
 *
 * @param open - Whether the collapsible is expanded
 * @param state - Interaction state (default, hover, focus, disabled)
 * @returns ComponentNode for the collapsible
 */
async function createCollapsibleComponent(
  open: boolean,
  state: string,
): Promise<ComponentNode> {
  // Parse base styles
  const triggerStyles = parseTailwindClasses(TRIGGER_BASE_STYLES);
  const contentStyles = parseTailwindClasses(CONTENT_PANEL_STYLES);

  // Create component
  const component = figma.createComponent();
  component.name = "open=" + open + ", state=" + state;
  component.description =
    "Collapsible " +
    (open ? "expanded" : "collapsed") +
    " in " +
    state +
    " state";

  // Set up vertical auto-layout for the entire component
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.itemSpacing = themeData.tailwind.spacing.scale["2"]; // my-2 = 8px from Tailwind
  component.fills = [];

  // Get state-specific styles
  const stateStyle = STATE_STYLES[state] || STATE_STYLES["default"];

  // Apply disabled opacity to entire component
  if (stateStyle.opacity !== undefined) {
    component.opacity = stateStyle.opacity;
  }

  // Create trigger frame (label + chevron)
  const trigger = figma.createFrame();
  trigger.name = "Trigger";
  trigger.layoutMode = "HORIZONTAL";
  trigger.primaryAxisAlignItems = "CENTER";
  trigger.counterAxisAlignItems = "CENTER";
  trigger.primaryAxisSizingMode = "AUTO";
  trigger.counterAxisSizingMode = "AUTO";
  trigger.itemSpacing = triggerStyles.gap || FALLBACK_VALUES.gap.tight;
  trigger.fills = [];
  trigger.paddingTop = themeData.tailwind.spacing.scale["1"]; // p-1 = 4px from Tailwind
  trigger.paddingBottom = themeData.tailwind.spacing.scale["1"];
  trigger.paddingLeft = themeData.tailwind.spacing.scale["1"];
  trigger.paddingRight = themeData.tailwind.spacing.scale["1"];
  trigger.cornerRadius = BORDER_RADIUS.sm;

  // Add focus ring if in focus state
  if (stateStyle.addRing) {
    const ringVar = getVariableByName(VAR_NAMES.color.brand);
    if (ringVar) {
      bindStrokeToVariable(trigger, ringVar.id, 2);
    }
  }

  // Create label text
  const labelText = await createTextNode(
    "Click to expand",
    triggerStyles.fontSize || FALLBACK_VALUES.fontSize,
    400,
  );
  labelText.name = "Label";

  // Apply text color based on state
  const textVar = getVariableByName(
    stateStyle.textVariable || VAR_NAMES.text.link,
  );
  if (textVar) {
    bindTextColorToVariable(labelText, textVar.id);
  }

  trigger.appendChild(labelText);

  // Create chevron icon (caret-down from Phosphor)
  const chevronIconName = "ph-caret-down";
  const chevron = getButtonIcon(chevronIconName, "sm");
  chevron.name = "Chevron";

  // Rotate chevron 180° when open (pointing up)
  if (open) {
    chevron.rotation = 180;
  }

  // Apply icon color based on state
  const iconColorToken =
    state === "disabled" ? "text-kumo-inactive" : "text-kumo-link";
  bindIconColor(chevron, iconColorToken);

  trigger.appendChild(chevron);
  component.appendChild(trigger);

  // Create content panel (always present, visibility controlled by open state)
  if (open) {
    const contentPanel = figma.createFrame();
    contentPanel.name = "Content";
    contentPanel.layoutMode = "VERTICAL";
    contentPanel.primaryAxisSizingMode = "AUTO";
    contentPanel.counterAxisSizingMode = "AUTO";
    contentPanel.itemSpacing = themeData.tailwind.spacing.scale["4"]; // space-y-4 = 16px from Tailwind
    contentPanel.paddingLeft =
      contentStyles.paddingX || FALLBACK_VALUES.padding.standard;
    contentPanel.paddingTop = themeData.tailwind.spacing.scale["2"]; // py-2 = 8px from Tailwind
    contentPanel.paddingBottom = themeData.tailwind.spacing.scale["2"];
    contentPanel.fills = [];

    // Add left border (border-l-2 border-kumo-fill)
    const borderVar = getVariableByName(VAR_NAMES.color.line);
    if (borderVar) {
      bindStrokeToVariable(contentPanel, borderVar.id, 2);
      // Set stroke to left side only
      contentPanel.strokeLeftWeight = 2;
      contentPanel.strokeTopWeight = 0;
      contentPanel.strokeRightWeight = 0;
      contentPanel.strokeBottomWeight = 0;
    }

    // Create placeholder content text
    const contentText = await createTextNode(
      "This is the collapsible content that can be shown or hidden.",
      14,
      400,
    );
    contentText.name = "Content Text";

    // Set content text width for wrapping
    contentText.layoutSizingHorizontal = "FIXED";
    contentText.resize(280, contentText.height);
    contentText.textAutoResize = "HEIGHT";

    const contentTextVar = getVariableByName(VAR_NAMES.text.default);
    if (contentTextVar) {
      bindTextColorToVariable(contentText, contentTextVar.id);
    }

    contentPanel.appendChild(contentText);
    component.appendChild(contentPanel);
  }

  return component;
}

/**
 * Generate Collapsible ComponentSet with open and state properties
 *
 * Creates a "Collapsible" ComponentSet with all combinations of:
 * - open: true, false
 * - state: default, hover, focus, disabled
 *
 * Layout:
 * - Rows: open=false, open=true
 * - Columns: state variations (default, hover, focus, disabled)
 *
 * Creates both light and dark mode sections.
 *
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateCollapsibleComponents(
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  // Generate all combinations
  const components: ComponentNode[] = [];

  // Track row labels: { y, text }
  const rowLabels: { y: number; text: string }[] = [];

  // Track column headers: { x, text }
  let columnHeaders: { x: number; text: string }[] = [];

  // Layout spacing
  const componentGapX = 24;
  const componentGapY = 40;
  const headerRowHeight = 24;
  const labelColumnWidth = 120;

  // Track layout by row (open state)
  const rowComponents: Map<number, ComponentNode[]> = new Map();

  // Generate components for each combination
  for (let oi = 0; oi < OPEN_VALUES.length; oi++) {
    const open = OPEN_VALUES[oi];
    rowComponents.set(oi, []);

    for (let si = 0; si < STATE_VALUES.length; si++) {
      const state = STATE_VALUES[si];
      const component = await createCollapsibleComponent(open, state);
      rowComponents.get(oi)!.push(component);
      components.push(component);
    }
  }

  // First pass: calculate max width per column and max height per row
  const columnWidths: number[] = [];
  const rowHeights: number[] = [];

  for (let colIdx = 0; colIdx < STATE_VALUES.length; colIdx++) {
    let maxColWidth = 0;
    for (let rowIdx = 0; rowIdx < OPEN_VALUES.length; rowIdx++) {
      const row = rowComponents.get(rowIdx) || [];
      const comp = row[colIdx];
      if (comp && comp.width > maxColWidth) {
        maxColWidth = comp.width;
      }
    }
    columnWidths.push(maxColWidth);
  }

  for (let rowIdx = 0; rowIdx < OPEN_VALUES.length; rowIdx++) {
    const row = rowComponents.get(rowIdx) || [];
    let maxRowHeight = 0;
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const comp = row[colIdx];
      if (comp && comp.height > maxRowHeight) {
        maxRowHeight = comp.height;
      }
    }
    rowHeights.push(maxRowHeight);
  }

  // Second pass: position components using consistent column widths
  let yOffset = headerRowHeight;

  for (let rowIdx = 0; rowIdx < OPEN_VALUES.length; rowIdx++) {
    const row = rowComponents.get(rowIdx) || [];
    let xOffset = labelColumnWidth;
    const openValue = OPEN_VALUES[rowIdx];

    // Record row label
    rowLabels.push({
      y: yOffset,
      text: "open=" + openValue,
    });

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const comp = row[colIdx];
      comp.x = xOffset;
      comp.y = yOffset;

      // Record column headers from first row
      if (rowIdx === 0) {
        columnHeaders.push({
          x: xOffset,
          text: "state=" + STATE_VALUES[colIdx],
        });
      }

      // Use consistent column width for positioning
      xOffset += columnWidths[colIdx] + componentGapX;
    }

    yOffset += rowHeights[rowIdx] + componentGapY;
  }

  // Combine all variants into a single ComponentSet
  // @ts-ignore - combineAsVariants works at runtime
  const componentSet = figma.combineAsVariants(components, figma.currentPage);
  componentSet.name = "Collapsible";
  componentSet.description =
    "Collapsible component with open and state properties. " +
    "Use to show/hide content with an animated chevron indicator.";
  componentSet.layoutMode = "NONE";

  // Calculate content dimensions
  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height + headerRowHeight;

  // Content Y offset to make room for title inside frame
  const contentYOffset = SECTION_TITLE.height;

  // Create light mode section
  const lightSection = createModeSection(
    figma.currentPage,
    "Collapsible",
    "light",
  );
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Create dark mode section
  const darkSection = createModeSection(
    figma.currentPage,
    "Collapsible",
    "dark",
  );
  darkSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Add title inside each frame

  // Move ComponentSet into light section frame
  lightSection.frame.appendChild(componentSet);
  componentSet.x = SECTION_PADDING + labelColumnWidth;
  componentSet.y = SECTION_PADDING + headerRowHeight + contentYOffset;

  // Add column headers to light section
  await createColumnHeaders(
    columnHeaders.map(function (h) {
      return { x: h.x + SECTION_PADDING, text: h.text };
    }),
    SECTION_PADDING + contentYOffset,
    lightSection.frame,
  );

  // Add row labels to light section
  for (let li = 0; li < rowLabels.length; li++) {
    const label = rowLabels[li];
    const labelNode = await createRowLabel(
      label.text,
      SECTION_PADDING,
      SECTION_PADDING +
        contentYOffset +
        label.y +
        GRID_LAYOUT.labelVerticalOffset.md,
    );
    lightSection.frame.appendChild(labelNode);
  }

  // Create instances for dark section
  for (let k = 0; k < components.length; k++) {
    const origComp = components[k];
    const instance = origComp.createInstance();
    instance.x = origComp.x + SECTION_PADDING + labelColumnWidth;
    instance.y =
      origComp.y + SECTION_PADDING + headerRowHeight + contentYOffset;
    darkSection.frame.appendChild(instance);
  }

  // Add column headers to dark section
  await createColumnHeaders(
    columnHeaders.map(function (h) {
      return { x: h.x + SECTION_PADDING, text: h.text };
    }),
    SECTION_PADDING + contentYOffset,
    darkSection.frame,
  );

  // Add row labels to dark section
  for (let di = 0; di < rowLabels.length; di++) {
    const darkLabel = rowLabels[di];
    const darkLabelNode = await createRowLabel(
      darkLabel.text,
      SECTION_PADDING,
      SECTION_PADDING + contentYOffset + darkLabel.y + 8,
    );
    darkSection.frame.appendChild(darkLabelNode);
  }

  // Resize sections to fit content with padding
  const totalWidth = contentWidth + SECTION_PADDING * 2;
  const totalHeight = contentHeight + SECTION_PADDING * 2 + contentYOffset;

  lightSection.section.resizeWithoutConstraints(totalWidth, totalHeight);
  darkSection.section.resizeWithoutConstraints(totalWidth, totalHeight);

  // Position sections at startY (no title offset needed since title is inside)
  lightSection.frame.x = SECTION_LAYOUT.startX;
  lightSection.frame.y = startY;

  darkSection.frame.x =
    lightSection.frame.x + totalWidth + SECTION_LAYOUT.modeGap;
  darkSection.frame.y = startY;

  logComplete(
    "Generated Collapsible ComponentSet with " +
      components.length +
      " variants (light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}

/**
 * Testable exports for tests (pure functions, no Figma API calls)
 */

/**
 * Get collapsible component data from registry
 */
export function getCollapsibleRegistryData() {
  return {
    component: collapsibleComponent,
    colors: collapsibleColors,
  };
}

/**
 * Get open state configuration
 */
export function getCollapsibleOpenConfig() {
  return {
    values: OPEN_VALUES,
  };
}

/**
 * Get state configuration
 */
export function getCollapsibleStateConfig() {
  return {
    values: STATE_VALUES,
    styles: STATE_STYLES,
  };
}

/**
 * Get trigger base styles from React component
 */
export function getCollapsibleTriggerStyles() {
  return {
    raw: TRIGGER_BASE_STYLES,
    colors: collapsibleColors,
  };
}

/**
 * Get content panel styles from React component
 */
export function getCollapsibleContentStyles() {
  return {
    raw: CONTENT_PANEL_STYLES,
  };
}

/**
 * Get parsed trigger base styles
 */
export function getCollapsibleParsedTriggerStyles() {
  return parseTailwindClasses(TRIGGER_BASE_STYLES);
}

/**
 * Get parsed content panel styles
 */
export function getCollapsibleParsedContentStyles() {
  return parseTailwindClasses(CONTENT_PANEL_STYLES);
}

/**
 * Get computed layout data for a specific open/state combination
 */
export function getCollapsibleLayoutData(open: boolean, state: string) {
  const triggerStyles = parseTailwindClasses(TRIGGER_BASE_STYLES);
  const contentStyles = parseTailwindClasses(CONTENT_PANEL_STYLES);
  const stateStyle = STATE_STYLES[state] || STATE_STYLES["default"];

  return {
    open: open,
    state: state,
    trigger: {
      gap: triggerStyles.gap || FALLBACK_VALUES.gap.tight,
      fontSize: triggerStyles.fontSize || FALLBACK_VALUES.fontSize,
      fontWeight: FALLBACK_VALUES.fontWeight.normal,
      textVariable: stateStyle.textVariable || VAR_NAMES.text.link,
      addRing: stateStyle.addRing || false,
      borderRadius: BORDER_RADIUS.sm,
    },
    content: open
      ? {
          paddingX: contentStyles.paddingX || FALLBACK_VALUES.padding.standard,
          // paddingTop/Bottom: py-2 = 8px from themeData
          paddingTop: SPACING.base,
          paddingBottom: SPACING.base,
          // itemSpacing: space-y-4 = 16px from themeData
          itemSpacing: FALLBACK_VALUES.gap.large,
          borderVariable: VAR_NAMES.color.line,
          // borderWeight: 2px border for emphasis
          borderWeight: FALLBACK_VALUES.strokeWeightThick,
        }
      : null,
    chevron: {
      iconName: "ph-caret-down",
      rotation: open ? 180 : 0,
      iconColorToken:
        state === "disabled" ? "text-kumo-inactive" : "text-kumo-link",
    },
    opacity: stateStyle.opacity,
  };
}

/**
 * Get all collapsible variant data (for snapshot testing)
 */
export function getAllCollapsibleVariantData() {
  const registryData = getCollapsibleRegistryData();
  const triggerStylesData = getCollapsibleTriggerStyles();
  const contentStylesData = getCollapsibleContentStyles();
  const triggerStyles = getCollapsibleParsedTriggerStyles();
  const contentStyles = getCollapsibleParsedContentStyles();
  const openConfig = getCollapsibleOpenConfig();
  const stateConfig = getCollapsibleStateConfig();

  return {
    registry: {
      component: registryData.component.name,
      colors: registryData.colors,
    },
    triggerStyles: {
      raw: triggerStylesData.raw,
      colors: triggerStylesData.colors,
      parsed: triggerStyles,
    },
    contentStyles: {
      raw: contentStylesData.raw,
      parsed: contentStyles,
    },
    openStates: openConfig.values,
    interactionStates: stateConfig.values,
    stateStyles: stateConfig.styles,
    variants: OPEN_VALUES.flatMap(function (open) {
      return STATE_VALUES.map(function (state) {
        return getCollapsibleLayoutData(open, state);
      });
    }),
  };
}

/**
 * Exports for tests and backwards compatibility
 */
export const COLLAPSIBLE_OPEN_VALUES = OPEN_VALUES;
export const COLLAPSIBLE_STATE_VALUES = STATE_VALUES;
