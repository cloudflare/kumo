/**
 * Combobox Component Generator
 *
 * Generates a Combobox ComponentSet in Figma that matches
 * the Combobox component props:
 *
 * - variant: default, withLabel, withError
 * - open: false, true
 * - state: default, focus, disabled
 *
 * INTENTIONAL DIVERGENCE: Figma variants differ from React variants
 *
 * React Component Variants:
 * - No variants prop (Combobox uses Input's variants internally)
 *
 * Figma Display Variants (for demonstration):
 * - default: Bare combobox without Field wrapper
 * - withLabel: Combobox with Field wrapper (label + description)
 * - withError: Combobox with Field wrapper showing error state
 *
 * The Figma variants show different Field wrapper configurations
 * for design exploration, not React component variants. The React
 * component achieves these states through Field composition, not
 * through a variants prop.
 *
 * The Combobox has a TriggerInput (input-like field) and when open,
 * displays a dropdown panel with sample items.
 *
 * Reads styles from component-registry.json (the source of truth).
 * Uses real icons from the Icon Library page.
 *
 * @see packages/kumo/src/components/combobox/combobox.tsx
 */

import {
  createTextNode,
  getVariableByName,
  createModeSection,
  createRowLabel,
  createColumnHeaders,
  bindFillToVariable,
  bindStrokeToVariable,
  bindTextColorToVariable,
  BORDER_RADIUS,
  SECTION_PADDING,
  SECTION_GAP,
  SECTION_LAYOUT,
  SECTION_TITLE,
  OPACITY,
  FONT_SIZE,
  FALLBACK_VALUES,
  GRID_LAYOUT,
  VAR_NAMES,
} from "./shared";
import { getButtonIcon, bindIconColor } from "./icon-utils";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import { logComplete } from "../logger";
import registry from "@cloudflare/kumo/ai/component-registry.json";
import themeData from "../generated/theme-data.json";

/**
 * Extract Combobox component data from registry (for metadata)
 */
const comboboxComponent = registry.components.Combobox;

/**
 * Base styles for TriggerInput container
 * "bg-kumo-control ring ring-kumo-line rounded-lg"
 */
const TRIGGER_BASE_STYLES = "bg-kumo-control ring ring-kumo-line rounded-lg";

/**
 * Dropdown panel styles
 * "bg-kumo-base border border-kumo-line"
 */
const DROPDOWN_PANEL_STYLES = "bg-kumo-base border border-kumo-line";

/**
 * Fallback configuration for Combobox dimensions
 * These values define trigger, dropdown, and item layouts
 */
const FALLBACK_COMBOBOX_CONFIG = {
  trigger: {
    width: 280, // FIGMA-SPECIFIC: Layout width for Figma canvas display
    height: FALLBACK_VALUES.height.base, // h-9 = 36px
    borderRadius: BORDER_RADIUS.lg, // rounded-lg = 8px
    paddingX: themeData.tailwind.spacing.scale["3"], // px-3 = 12px
    itemSpacing: themeData.tailwind.spacing.scale["2"], // gap-2 = 8px
  },
  dropdown: {
    width: 280, // FIGMA-SPECIFIC: Layout width for Figma canvas display
    height: 120, // FIGMA-SPECIFIC: Fixed height for display (shows 3-4 items)
    borderRadius: BORDER_RADIUS.lg, // rounded-lg = 8px
    paddingY: themeData.tailwind.spacing.scale["1"], // py-1 = 4px
    itemHeight: themeData.tailwind.spacing.scale["8"], // h-8 = 32px
    itemPaddingX: themeData.tailwind.spacing.scale["3"], // px-3 = 12px
    itemPaddingY: themeData.tailwind.spacing.scale["2"], // py-2 = 8px
  },
  label: {
    fontSize: FONT_SIZE.base, // text-base = 14px from theme-kumo.css
    fontWeight: FALLBACK_VALUES.fontWeight.medium, // font-medium = 500
  },
  placeholder: {
    fontSize: FONT_SIZE.lg, // text-lg = 16px from theme-kumo.css
    fontWeight: FALLBACK_VALUES.fontWeight.normal, // font-normal = 400
  },
  description: {
    fontSize: FONT_SIZE.xs, // text-xs = 12px from theme-kumo.css
    fontWeight: FALLBACK_VALUES.fontWeight.normal, // font-normal = 400
  },
  item: {
    fontSize: FONT_SIZE.base, // text-base = 14px from theme-kumo.css
    fontWeight: FALLBACK_VALUES.fontWeight.normal, // font-normal = 400
  },
} as const;

/**
 * Variant types
 */
const VARIANT_VALUES = ["default", "withLabel", "withError"];

/**
 * Open state values
 */
const OPEN_VALUES = [false, true];

/**
 * Interaction state values
 */
const STATE_VALUES = ["default", "focus", "disabled"];

/**
 * State-specific style overrides for the trigger
 */
const STATE_STYLES: Record<
  string,
  {
    ringVariable?: string;
    opacity?: number;
  }
> = {
  default: {
    ringVariable: VAR_NAMES.color.line,
  },
  focus: {
    ringVariable: VAR_NAMES.color.brand,
  },
  disabled: {
    ringVariable: VAR_NAMES.color.line,
    opacity: OPACITY.disabled,
  },
};

/**
 * Variant-specific configuration
 */
const VARIANT_CONFIG: Record<
  string,
  {
    label?: string;
    description?: string;
    errorMessage?: string;
    useErrorRing?: boolean;
  }
> = {
  default: {},
  withLabel: {
    label: "Country",
    description: "Select your country of residence",
  },
  withError: {
    label: "Subscription Plan",
    errorMessage: "Please select a plan to continue",
    useErrorRing: true,
  },
};

/**
 * ========================================
 * TESTABLE EXPORTS - Pure functions for testing
 * ========================================
 */

/**
 * Get variant configuration from generator constants
 * @returns Object with variants, open states, interaction states, and configuration
 */
export function getComboboxVariantConfig() {
  return {
    variants: VARIANT_VALUES,
    openStates: OPEN_VALUES,
    interactionStates: STATE_VALUES,
    variantConfig: VARIANT_CONFIG,
    stateStyles: STATE_STYLES,
  };
}

/**
 * Get parsed base styles for TriggerInput
 * @returns Parsed Tailwind classes for trigger base styles
 */
export function getComboboxParsedTriggerStyles() {
  return {
    raw: TRIGGER_BASE_STYLES,
    parsed: parseTailwindClasses(TRIGGER_BASE_STYLES),
  };
}

/**
 * Get parsed dropdown panel styles
 * @returns Parsed Tailwind classes for dropdown panel
 */
export function getComboboxParsedDropdownStyles() {
  return {
    raw: DROPDOWN_PANEL_STYLES,
    parsed: parseTailwindClasses(DROPDOWN_PANEL_STYLES),
  };
}

/**
 * Get computed layout data for a specific variant + state combination
 * @param variant - Variant type (default, withLabel, withError)
 * @param open - Whether dropdown is open
 * @param state - Interaction state (default, focus, disabled)
 * @returns Object with computed layout properties
 */
export function getComboboxLayoutData(
  variant: string,
  open: boolean,
  state: string,
) {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG["default"];
  const stateStyle = STATE_STYLES[state] || STATE_STYLES["default"];

  return {
    variant,
    open,
    state,
    hasLabel: !!config.label,
    hasDescription: !!config.description,
    hasError: !!config.errorMessage,
    ringVariable: config.useErrorRing
      ? VAR_NAMES.color.danger
      : stateStyle.ringVariable || VAR_NAMES.color.line,
    opacity: stateStyle.opacity,
    trigger: {
      width: FALLBACK_COMBOBOX_CONFIG.trigger.width,
      height: FALLBACK_COMBOBOX_CONFIG.trigger.height,
      borderRadius: FALLBACK_COMBOBOX_CONFIG.trigger.borderRadius,
      paddingX: FALLBACK_COMBOBOX_CONFIG.trigger.paddingX,
      itemSpacing: FALLBACK_COMBOBOX_CONFIG.trigger.itemSpacing,
    },
    dropdown: open
      ? {
          width: FALLBACK_COMBOBOX_CONFIG.dropdown.width,
          height: FALLBACK_COMBOBOX_CONFIG.dropdown.height,
          borderRadius: FALLBACK_COMBOBOX_CONFIG.dropdown.borderRadius,
          paddingY: FALLBACK_COMBOBOX_CONFIG.dropdown.paddingY,
          itemHeight: FALLBACK_COMBOBOX_CONFIG.dropdown.itemHeight,
          itemPaddingX: FALLBACK_COMBOBOX_CONFIG.dropdown.itemPaddingX,
          itemPaddingY: FALLBACK_COMBOBOX_CONFIG.dropdown.itemPaddingY,
        }
      : null,
  };
}

/**
 * Get all combobox variant data (complete intermediate data structure)
 * @returns Complete data structure for all variants
 */
/**
 * Get combobox registry metadata
 *
 * Returns component metadata from component-registry.json.
 * Note: React component has no variants prop, but generator creates
 * Figma-specific display variants (default, withLabel, withError).
 */
export function getComboboxRegistryData() {
  return {
    component: comboboxComponent.name,
    description: comboboxComponent.description,
    colors: comboboxComponent.colors,
    note: "Generator uses Figma-specific display variants (default, withLabel, withError) to showcase different Field wrapper configurations",
  };
}

export function getAllComboboxVariantData() {
  const triggerStyles = getComboboxParsedTriggerStyles();
  const dropdownStyles = getComboboxParsedDropdownStyles();
  const config = getComboboxVariantConfig();

  const variants: any[] = [];

  for (let vi = 0; vi < config.variants.length; vi++) {
    const variant = config.variants[vi];
    for (let oi = 0; oi < config.openStates.length; oi++) {
      const open = config.openStates[oi];
      for (let si = 0; si < config.interactionStates.length; si++) {
        const state = config.interactionStates[si];
        variants.push(getComboboxLayoutData(variant, open, state));
      }
    }
  }

  return {
    triggerStyles,
    dropdownStyles,
    config,
    variants,
    registryData: getComboboxRegistryData(),
  };
}

/**
 * ========================================
 * END TESTABLE EXPORTS
 * ========================================
 */

/**
 * Create a single Combobox component variant
 *
 * @param variant - Variant type (default, withLabel, withError)
 * @param open - Whether the dropdown is open
 * @param state - Interaction state (default, focus, disabled)
 * @returns ComponentNode for the combobox
 */
async function createComboboxComponent(
  variant: string,
  open: boolean,
  state: string,
): Promise<ComponentNode> {
  // Parse base styles (for potential future use)
  const _triggerStyles = parseTailwindClasses(TRIGGER_BASE_STYLES);
  const _dropdownStyles = parseTailwindClasses(DROPDOWN_PANEL_STYLES);

  // Get variant config
  const variantConfig = VARIANT_CONFIG[variant] || VARIANT_CONFIG["default"];

  // Create component
  const component = figma.createComponent();
  component.name = "variant=" + variant + ", open=" + open + ", state=" + state;
  component.description =
    "Combobox " +
    variant +
    " " +
    (open ? "open" : "closed") +
    " in " +
    state +
    " state";

  // Set up vertical auto-layout for the entire component
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.counterAxisAlignItems = "MIN"; // Left-align all children (label, trigger, dropdown)
  component.itemSpacing = 4; // Small gap between label and trigger, trigger and description/error
  component.fills = [];

  // Get state-specific styles
  const stateStyle = STATE_STYLES[state] || STATE_STYLES["default"];

  // Apply disabled opacity to entire component
  if (stateStyle.opacity !== undefined) {
    component.opacity = stateStyle.opacity;
  }

  // Create label if needed
  if (variantConfig.label) {
    const labelText = await createTextNode(
      variantConfig.label,
      FALLBACK_COMBOBOX_CONFIG.label.fontSize,
      FALLBACK_COMBOBOX_CONFIG.label.fontWeight,
    );
    labelText.name = "Label";
    labelText.textAutoResize = "WIDTH_AND_HEIGHT";

    // Apply label text color (text-kumo-strong)
    const labelVar = getVariableByName(VAR_NAMES.text.strong);
    if (labelVar) {
      bindTextColorToVariable(labelText, labelVar.id);
    }

    component.appendChild(labelText);
  }

  // Create trigger input frame
  const trigger = figma.createFrame();
  trigger.name = "TriggerInput";
  trigger.layoutMode = "HORIZONTAL";
  trigger.primaryAxisAlignItems = "SPACE_BETWEEN"; // Text left, icon right
  trigger.counterAxisAlignItems = "CENTER";
  trigger.primaryAxisSizingMode = "FIXED";
  trigger.counterAxisSizingMode = "FIXED";
  trigger.resize(
    FALLBACK_COMBOBOX_CONFIG.trigger.width,
    FALLBACK_COMBOBOX_CONFIG.trigger.height,
  );
  trigger.itemSpacing = FALLBACK_COMBOBOX_CONFIG.trigger.itemSpacing;
  trigger.paddingLeft = FALLBACK_COMBOBOX_CONFIG.trigger.paddingX;
  trigger.paddingRight = FALLBACK_COMBOBOX_CONFIG.trigger.paddingX;
  trigger.paddingTop = 0;
  trigger.paddingBottom = 0;
  trigger.cornerRadius = FALLBACK_COMBOBOX_CONFIG.trigger.borderRadius;

  // Apply background fill (bg-kumo-control)
  const bgVar = getVariableByName(VAR_NAMES.color.control);
  if (bgVar) {
    bindFillToVariable(trigger, bgVar.id);
  }

  // Apply ring (stroke) - use error ring if error variant
  let ringVarName = variantConfig.useErrorRing
    ? VAR_NAMES.color.danger
    : stateStyle.ringVariable || VAR_NAMES.color.line;
  const ringVar = getVariableByName(ringVarName);
  if (ringVar) {
    bindStrokeToVariable(trigger, ringVar.id, 1);
  }

  // Create placeholder text
  const placeholderText = await createTextNode(
    "Select item...",
    FALLBACK_COMBOBOX_CONFIG.placeholder.fontSize,
    FALLBACK_COMBOBOX_CONFIG.placeholder.fontWeight,
  );
  placeholderText.name = "Placeholder";
  placeholderText.textAutoResize = "WIDTH_AND_HEIGHT";

  // Apply text color (text-kumo-subtle for placeholder)
  const mutedVar = getVariableByName(VAR_NAMES.text.subtle);
  if (mutedVar) {
    bindTextColorToVariable(placeholderText, mutedVar.id);
  }

  trigger.appendChild(placeholderText);

  // Create chevron down icon
  const chevronIconName = "ph-caret-down";
  const chevron = getButtonIcon(chevronIconName, "sm");
  chevron.name = "Chevron";

  // Rotate chevron 180° when open (pointing up)
  if (open) {
    chevron.rotation = 180;
  }

  // Apply icon color based on state
  const iconColorToken =
    state === "disabled" ? "text-kumo-inactive" : "text-kumo-default";
  bindIconColor(chevron, iconColorToken);

  trigger.appendChild(chevron);
  component.appendChild(trigger);

  // Create description or error message if needed
  if (variantConfig.description) {
    const descText = await createTextNode(
      variantConfig.description,
      FALLBACK_COMBOBOX_CONFIG.description.fontSize,
      FALLBACK_COMBOBOX_CONFIG.description.fontWeight,
    );
    descText.name = "Description";
    descText.textAutoResize = "WIDTH_AND_HEIGHT";

    // Apply description text color (text-kumo-subtle)
    const descVar = getVariableByName(VAR_NAMES.text.subtle);
    if (descVar) {
      bindTextColorToVariable(descText, descVar.id);
    }

    component.appendChild(descText);
  }

  if (variantConfig.errorMessage) {
    const errorText = await createTextNode(
      variantConfig.errorMessage,
      FALLBACK_COMBOBOX_CONFIG.description.fontSize,
      FALLBACK_COMBOBOX_CONFIG.description.fontWeight,
    );
    errorText.name = "Error";
    errorText.textAutoResize = "WIDTH_AND_HEIGHT";

    // Apply error text color (text-kumo-danger)
    const errorVar = getVariableByName(VAR_NAMES.text.danger);
    if (errorVar) {
      bindTextColorToVariable(errorText, errorVar.id);
    }

    component.appendChild(errorText);
  }

  // Create dropdown panel (only when open)
  if (open) {
    const dropdownPanel = figma.createFrame();
    dropdownPanel.name = "Dropdown";
    dropdownPanel.layoutMode = "VERTICAL";
    dropdownPanel.primaryAxisSizingMode = "FIXED";
    dropdownPanel.counterAxisSizingMode = "AUTO";
    dropdownPanel.resize(
      FALLBACK_COMBOBOX_CONFIG.dropdown.width,
      FALLBACK_COMBOBOX_CONFIG.dropdown.height,
    );
    dropdownPanel.itemSpacing = 0;
    dropdownPanel.paddingLeft = 0;
    dropdownPanel.paddingRight = 0;
    dropdownPanel.paddingTop = FALLBACK_COMBOBOX_CONFIG.dropdown.paddingY;
    dropdownPanel.paddingBottom = FALLBACK_COMBOBOX_CONFIG.dropdown.paddingY;
    dropdownPanel.cornerRadius = FALLBACK_COMBOBOX_CONFIG.dropdown.borderRadius;

    // Apply background fill (bg-kumo-control) - matches Content/Popup in combobox.tsx
    const dropdownBgVar = getVariableByName(VAR_NAMES.color.control);
    if (dropdownBgVar) {
      bindFillToVariable(dropdownPanel, dropdownBgVar.id);
    }

    // Apply border
    const borderVar = getVariableByName(VAR_NAMES.color.line);
    if (borderVar) {
      bindStrokeToVariable(dropdownPanel, borderVar.id, 1);
    }

    // Create 3 sample items
    const itemLabels = ["Option 1", "Option 2", "Option 3"];
    for (let i = 0; i < itemLabels.length; i++) {
      const itemFrame = figma.createFrame();
      itemFrame.name = "Item " + (i + 1);
      itemFrame.layoutMode = "HORIZONTAL";
      itemFrame.primaryAxisAlignItems = "MIN"; // Text left-aligned
      itemFrame.counterAxisAlignItems = "CENTER";
      itemFrame.primaryAxisSizingMode = "FIXED";
      itemFrame.counterAxisSizingMode = "AUTO";
      itemFrame.resize(
        FALLBACK_COMBOBOX_CONFIG.dropdown.width,
        FALLBACK_COMBOBOX_CONFIG.dropdown.itemHeight,
      );
      itemFrame.itemSpacing = themeData.tailwind.spacing.scale["2"]; // gap-2 = 8px
      itemFrame.paddingLeft = FALLBACK_COMBOBOX_CONFIG.dropdown.itemPaddingX;
      itemFrame.paddingRight = FALLBACK_COMBOBOX_CONFIG.dropdown.itemPaddingX;
      itemFrame.paddingTop = FALLBACK_COMBOBOX_CONFIG.dropdown.itemPaddingY;
      itemFrame.paddingBottom = FALLBACK_COMBOBOX_CONFIG.dropdown.itemPaddingY;
      itemFrame.fills = [];

      // Highlight second item (selected/hover state) - matches data-highlighted:bg-kumo-overlay
      if (i === 1) {
        const accentVar = getVariableByName(VAR_NAMES.color.control);
        if (accentVar) {
          bindFillToVariable(itemFrame, accentVar.id);
        }
      }

      // Create item text
      const itemText = await createTextNode(
        itemLabels[i],
        FALLBACK_COMBOBOX_CONFIG.item.fontSize,
        FALLBACK_COMBOBOX_CONFIG.item.fontWeight,
      );
      itemText.name = "Label";
      itemText.textAutoResize = "WIDTH_AND_HEIGHT";

      // Apply text color
      const textVar = getVariableByName(VAR_NAMES.text.default);
      if (textVar) {
        bindTextColorToVariable(itemText, textVar.id);
      }

      itemFrame.appendChild(itemText);
      dropdownPanel.appendChild(itemFrame);
    }

    component.appendChild(dropdownPanel);
  }

  return component;
}

/**
 * Generate Combobox ComponentSet with variant, open, and state properties
 *
 * Creates a "Combobox" ComponentSet with all combinations of:
 * - variant: default, withLabel, withError
 * - open: false, true
 * - state: default, focus, disabled
 *
 * Layout:
 * - Rows: variant (default, withLabel, withError)
 * - Columns: open × state combinations (6 columns total)
 *
 * Creates both light and dark mode sections.
 *
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateComboboxComponents(
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
  const labelColumnWidth = 150; // Wider for variant labels

  // Track layout by row (variant)
  const rowComponents: Map<number, ComponentNode[]> = new Map();

  // Generate components for each combination
  // Rows = variants, Columns = open × state
  for (let vi = 0; vi < VARIANT_VALUES.length; vi++) {
    const variant = VARIANT_VALUES[vi];
    rowComponents.set(vi, []);

    for (let oi = 0; oi < OPEN_VALUES.length; oi++) {
      const open = OPEN_VALUES[oi];

      for (let si = 0; si < STATE_VALUES.length; si++) {
        const state = STATE_VALUES[si];
        const component = await createComboboxComponent(variant, open, state);
        rowComponents.get(vi)!.push(component);
        components.push(component);
      }
    }
  }

  // First pass: calculate max width per column and max height per row
  const columnWidths: number[] = [];
  const rowHeights: number[] = [];

  const numColumns = OPEN_VALUES.length * STATE_VALUES.length;

  for (let colIdx = 0; colIdx < numColumns; colIdx++) {
    let maxColWidth = 0;
    for (let rowIdx = 0; rowIdx < VARIANT_VALUES.length; rowIdx++) {
      const row = rowComponents.get(rowIdx) || [];
      const comp = row[colIdx];
      if (comp && comp.width > maxColWidth) {
        maxColWidth = comp.width;
      }
    }
    columnWidths.push(maxColWidth);
  }

  for (let rowIdx = 0; rowIdx < VARIANT_VALUES.length; rowIdx++) {
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

  for (let rowIdx = 0; rowIdx < VARIANT_VALUES.length; rowIdx++) {
    const row = rowComponents.get(rowIdx) || [];
    let xOffset = labelColumnWidth;
    const variantValue = VARIANT_VALUES[rowIdx];

    // Record row label
    rowLabels.push({
      y: yOffset,
      text: "variant=" + variantValue,
    });

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const comp = row[colIdx];
      comp.x = xOffset;
      comp.y = yOffset;

      // Record column headers from first row
      if (rowIdx === 0) {
        const openIdx = Math.floor(colIdx / STATE_VALUES.length);
        const stateIdx = colIdx % STATE_VALUES.length;
        const openVal = OPEN_VALUES[openIdx];
        const stateVal = STATE_VALUES[stateIdx];
        columnHeaders.push({
          x: xOffset,
          text: "open=" + openVal + ", state=" + stateVal,
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
  componentSet.name = "Combobox";
  componentSet.description =
    "Combobox component with variant, open, and state properties. " +
    "Use for searchable select dropdowns with filtering.";
  componentSet.layoutMode = "NONE";

  // Calculate content dimensions
  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height + headerRowHeight;

  // Content Y offset to make room for title inside frame
  const contentYOffset = SECTION_TITLE.height;

  // Create light mode section
  const lightSection = createModeSection(
    figma.currentPage,
    "Combobox",
    "light",
  );
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Create dark mode section
  const darkSection = createModeSection(figma.currentPage, "Combobox", "dark");
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
    "Generated Combobox ComponentSet with " +
      components.length +
      " variants (light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}

/**
 * Exports for tests and backwards compatibility
 */
export const COMBOBOX_VARIANT_VALUES = VARIANT_VALUES;
export const COMBOBOX_OPEN_VALUES = OPEN_VALUES;
export const COMBOBOX_STATE_VALUES = STATE_VALUES;
