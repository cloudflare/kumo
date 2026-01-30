/**
 * Radio Component Generator
 *
 * Generates high-quality Radio components in Figma matching the code implementation.
 *
 * ## Generated Components
 *
 * ### 1. Radio (ComponentSet)
 * Single radio button with label. Properties:
 * - checked: false, true
 * - variant: default, error
 * - disabled: false, true
 *
 * ### 2. Radio.Group (ComponentSet)
 * Fieldset containing multiple radio buttons. Properties:
 * - orientation: vertical, horizontal
 * - hasDescription: false, true
 * - hasError: false, true
 * - controlPosition: start, end
 *
 * Component Structure (from radio.tsx):
 * - Single Radio: label wrapper with radio + label text
 * - Radio.Group: Fieldset with legend, optional description/error, Radio.Item children
 * - Radio indicator: 16x16 circle, bg-kumo-base (off) / bg-kumo-contrast (on)
 * - Inner dot: 8x8 circle, bg-kumo-base (visible when checked)
 *
 * @see packages/kumo/src/components/radio/radio.tsx
 */

import {
  bindFillToVariable,
  bindStrokeToVariable,
  getVariableByName,
  createModeSection,
  createTextNode,
  createRowLabel,
  createColumnHeaders,
  bindTextColorToVariable,
  BORDER_RADIUS,
  FONT_SIZE,
  SECTION_PADDING,
  SECTION_GAP,
  GRID_LAYOUT,
  SECTION_LAYOUT,
  OPACITY,
  SPACING,
  FALLBACK_VALUES,
  VAR_NAMES,
} from "./shared";
import themeData from "../generated/theme-data.json";
import { logInfo } from "../logger";

// Import registry for component metadata (note: Radio has variants defined in source, not props)
import registry from "@cloudflare/kumo/ai/component-registry.json";

// Radio component exists in registry but variants are in KUMO_RADIO_VARIANTS, not props
const _radioComponent = registry.components as Record<string, unknown>;
const _hasRadio = "Radio" in _radioComponent;

// Radio doesn't have a variant prop in props, but has KUMO_RADIO_VARIANTS in source
// Let's define the variants based on the source code
const RADIO_VARIANTS = {
  values: ["default", "error"],
  classes: {
    default: "ring-kumo-line",
    error: "ring-destructive",
  },
  descriptions: {
    default: "Default radio appearance",
    error: "Error state for validation failures",
  },
  default: "default",
};

/**
 * Radio indicator size (h-4 w-4 = 16px)
 * Generated from: Tailwind spacing scale (4 = 16px)
 */
const RADIO_SIZE = themeData.tailwind.spacing.scale["4"]; // 16px

/**
 * Inner dot size (h-2 w-2 = 8px)
 * Generated from: Tailwind spacing scale (2 = 8px)
 */
const RADIO_DOT_SIZE = themeData.tailwind.spacing.scale["2"]; // 8px

/**
 * Gap between radio and label (gap-2 = 8px)
 * Generated from: Tailwind spacing scale
 */
const RADIO_LABEL_GAP = SPACING.base; // 8px

/**
 * TESTABLE EXPORTS - Pure functions that return intermediate data
 * These functions compute data without calling Figma APIs, enabling snapshot tests.
 */

/**
 * Get variant configuration
 */
export function getRadioVariantConfig() {
  return {
    values: RADIO_VARIANTS.values,
    classes: RADIO_VARIANTS.classes,
    descriptions: RADIO_VARIANTS.descriptions,
    default: RADIO_VARIANTS.default,
  };
}

/**
 * Get radio indicator size
 */
export function getRadioSize(): number {
  return RADIO_SIZE;
}

/**
 * Get radio inner dot size
 */
export function getRadioDotSize(): number {
  return RADIO_DOT_SIZE;
}

/**
 * Get label gap
 */
export function getRadioLabelGap(): number {
  return RADIO_LABEL_GAP;
}

/**
 * Get background variable for a given checked state
 */
export function getRadioBgVariable(checked: boolean): string {
  return checked ? VAR_NAMES.color.contrast : VAR_NAMES.color.base;
}

/**
 * Get ring/border variable for a given variant
 */
export function getRadioRingVariable(variant: string): string {
  return variant === "error" ? VAR_NAMES.color.danger : VAR_NAMES.color.line;
}

/**
 * Get complete radio configuration for a specific combination
 */
export function getRadioConfig(
  checked: boolean,
  variant: string,
  disabled: boolean,
) {
  return {
    checked,
    variant,
    disabled,
    size: RADIO_SIZE,
    dotSize: RADIO_DOT_SIZE,
    bgVariable: getRadioBgVariable(checked),
    ringVariable: getRadioRingVariable(variant),
    opacity: disabled ? OPACITY.disabled : 1.0,
  };
}

/**
 * Get all radio variant data (for snapshot testing)
 */
export function getAllRadioVariantData() {
  const variantConfig = getRadioVariantConfig();

  const configs: ReturnType<typeof getRadioConfig>[] = [];
  const checkedValues = [false, true];
  const disabledValues = [false, true];

  for (let ci = 0; ci < checkedValues.length; ci++) {
    for (let vi = 0; vi < variantConfig.values.length; vi++) {
      for (let di = 0; di < disabledValues.length; di++) {
        configs.push(
          getRadioConfig(
            checkedValues[ci],
            variantConfig.values[vi],
            disabledValues[di],
          ),
        );
      }
    }
  }

  return {
    variantConfig,
    configs,
    constants: {
      size: RADIO_SIZE,
      dotSize: RADIO_DOT_SIZE,
      labelGap: RADIO_LABEL_GAP,
    },
  };
}

// ============================================================================
// FIGMA GENERATION FUNCTIONS (use Figma APIs)
// ============================================================================

/**
 * Create the radio indicator (the circular button with optional inner dot)
 */
function createRadioIndicator(
  checked: boolean,
  variant: string,
  _disabled: boolean,
): FrameNode {
  const config = getRadioConfig(checked, variant, _disabled);

  const indicator = figma.createFrame();
  indicator.name = "Radio Indicator";
  indicator.resize(config.size, config.size);

  // Auto-layout for centering inner dot
  indicator.layoutMode = "HORIZONTAL";
  indicator.primaryAxisAlignItems = "CENTER";
  indicator.counterAxisAlignItems = "CENTER";
  indicator.primaryAxisSizingMode = "FIXED";
  indicator.counterAxisSizingMode = "FIXED";

  // Border radius: rounded-full
  indicator.cornerRadius = BORDER_RADIUS.full;

  // Background fill based on checked state
  const bgVar = getVariableByName(config.bgVariable);
  if (bgVar) {
    bindFillToVariable(indicator, bgVar.id);
  }

  // Ring/border based on variant
  const ringVar = getVariableByName(config.ringVariable);
  if (ringVar) {
    bindStrokeToVariable(indicator, ringVar.id, 1);
  }

  // Add inner dot if checked
  if (checked) {
    const dot = figma.createEllipse();
    dot.name = "Inner Dot";
    dot.resize(config.dotSize, config.dotSize);

    // Inner dot is bg-kumo-base (white in dark mode, contrasts with bg-kumo-contrast)
    const dotBgVar = getVariableByName(VAR_NAMES.color.base);
    if (dotBgVar) {
      bindFillToVariable(dot, dotBgVar.id);
    }

    indicator.appendChild(dot);
  }

  return indicator;
}

/**
 * Create a single radio component with label
 */
async function createRadioComponent(
  checked: boolean,
  variant: string,
  disabled: boolean,
  labelText: string,
): Promise<ComponentNode> {
  const config = getRadioConfig(checked, variant, disabled);

  const component = figma.createComponent();
  component.name =
    "checked=" + checked + ", variant=" + variant + ", disabled=" + disabled;

  const variantDesc =
    (RADIO_VARIANTS.descriptions as Record<string, string>)[variant] || "";
  component.description = variantDesc;

  // Configure as horizontal auto-layout (radio + label)
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "MIN";
  component.counterAxisAlignItems = "CENTER";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.itemSpacing = RADIO_LABEL_GAP;
  component.fills = [];

  // Create radio indicator
  const radioIndicator = createRadioIndicator(checked, variant, disabled);
  component.appendChild(radioIndicator);

  // Create label text
  const label = await createTextNode(
    labelText,
    FONT_SIZE.base,
    FALLBACK_VALUES.fontWeight.medium,
  );
  const textVar = getVariableByName(VAR_NAMES.text.default);
  if (textVar) {
    bindTextColorToVariable(label, textVar.id);
  }
  component.appendChild(label);

  // Apply disabled state: opacity-50
  if (disabled) {
    component.opacity = config.opacity;
  }

  return component;
}

/**
 * Get a simple label for the radio
 */
function getRadioLabel(): string {
  return "Label";
}

/**
 * Create a Radio.Item (radio within a group)
 */
async function createRadioItem(
  checked: boolean,
  disabled: boolean,
  controlPosition: "start" | "end",
  labelText: string,
): Promise<FrameNode> {
  const item = figma.createFrame();
  item.name = "Radio.Item";
  item.layoutMode = "HORIZONTAL";
  item.primaryAxisAlignItems = "MIN";
  item.counterAxisAlignItems = "CENTER";
  item.primaryAxisSizingMode = "AUTO";
  item.counterAxisSizingMode = "AUTO";
  item.itemSpacing = RADIO_LABEL_GAP;
  item.fills = [];

  // Create radio indicator (always default variant in groups)
  const radioIndicator = createRadioIndicator(checked, "default", disabled);

  // Create label text
  const label = await createTextNode(
    labelText,
    FONT_SIZE.base,
    FALLBACK_VALUES.fontWeight.medium,
  );
  const textVar = getVariableByName(VAR_NAMES.text.default);
  if (textVar) {
    bindTextColorToVariable(label, textVar.id);
  }

  // Add in order based on controlPosition
  if (controlPosition === "start") {
    item.appendChild(radioIndicator);
    item.appendChild(label);
  } else {
    item.appendChild(label);
    item.appendChild(radioIndicator);
  }

  // Apply disabled state
  if (disabled) {
    item.opacity = OPACITY.disabled;
  }

  return item;
}

/**
 * Create a Radio.Group component
 */
async function createRadioGroupComponent(
  orientation: "vertical" | "horizontal",
  hasDescription: boolean,
  hasError: boolean,
  controlPosition: "start" | "end",
): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name =
    "orientation=" +
    orientation +
    ", hasDescription=" +
    hasDescription +
    ", hasError=" +
    hasError +
    ", controlPosition=" +
    controlPosition;

  component.description =
    "Radio group with fieldset and legend. " +
    (orientation === "horizontal"
      ? "Horizontal layout. "
      : "Vertical layout. ") +
    (hasDescription ? "Includes description text. " : "") +
    (hasError ? "Shows error message. " : "") +
    (controlPosition === "start"
      ? "Radios appear before labels."
      : "Labels appear before radios.");

  // Fieldset container: flex flex-col gap-4 rounded-lg border border-kumo-line p-4
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.itemSpacing = themeData.tailwind.spacing.scale["4"]; // gap-4 = 16px
  component.paddingLeft = themeData.tailwind.spacing.scale["4"]; // p-4 = 16px
  component.paddingRight = themeData.tailwind.spacing.scale["4"];
  component.paddingTop = themeData.tailwind.spacing.scale["4"];
  component.paddingBottom = themeData.tailwind.spacing.scale["4"];
  component.cornerRadius = BORDER_RADIUS.lg; // rounded-lg = 8px

  // Border: border-kumo-line
  const borderVar = getVariableByName(VAR_NAMES.color.line);
  if (borderVar) {
    component.strokes = [
      figma.variables.setBoundVariableForPaint(
        { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
        "color",
        borderVar,
      ),
    ];
    component.strokeWeight = 1;
  }

  // Background: transparent (no fill)
  component.fills = [];

  // Legend: text-lg font-medium text-kumo-default
  const legend = await createTextNode(
    "Notification preference",
    FONT_SIZE.lg,
    FALLBACK_VALUES.fontWeight.medium,
  );
  const textVar = getVariableByName(VAR_NAMES.text.default);
  if (textVar) {
    bindTextColorToVariable(legend, textVar.id);
  }
  component.appendChild(legend);

  // Items container: flex flex-col/row gap-2
  const itemsContainer = figma.createFrame();
  itemsContainer.name = "Items";
  itemsContainer.layoutMode =
    orientation === "vertical" ? "VERTICAL" : "HORIZONTAL";
  itemsContainer.primaryAxisSizingMode = "AUTO";
  itemsContainer.counterAxisSizingMode = "AUTO";
  itemsContainer.itemSpacing = SPACING.base; // gap-2 = 8px
  itemsContainer.fills = [];

  // Wrap items in horizontal layout
  if (orientation === "horizontal") {
    itemsContainer.layoutWrap = "WRAP";
  }

  // Add 3 radio items (one checked)
  const item1 = await createRadioItem(true, false, controlPosition, "Email");
  const item2 = await createRadioItem(false, false, controlPosition, "SMS");
  const item3 = await createRadioItem(false, false, controlPosition, "Push");

  itemsContainer.appendChild(item1);
  itemsContainer.appendChild(item2);
  itemsContainer.appendChild(item3);

  component.appendChild(itemsContainer);

  // Error message: text-sm text-kumo-danger
  if (hasError) {
    const errorText = await createTextNode(
      "Please select a notification method",
      FONT_SIZE.xs,
      FALLBACK_VALUES.fontWeight.normal,
    );
    const errorVar = getVariableByName(VAR_NAMES.text.danger);
    if (errorVar) {
      bindTextColorToVariable(errorText, errorVar.id);
    }
    component.appendChild(errorText);
  }

  // Description: text-sm text-kumo-subtle
  if (hasDescription) {
    const descText = await createTextNode(
      "Choose how you want to be notified",
      FONT_SIZE.xs,
      FALLBACK_VALUES.fontWeight.normal,
    );
    const mutedVar = getVariableByName(VAR_NAMES.text.subtle);
    if (mutedVar) {
      bindTextColorToVariable(descText, mutedVar.id);
    }
    component.appendChild(descText);
  }

  return component;
}

/**
 * Generate Radio ComponentSet
 *
 * Layout:
 * - Column headers: checked=false | checked=true
 * - Row 1: variant=default
 * - Row 2: variant=default, disabled=true
 * - Row 3: variant=error
 * - Row 4: variant=error, disabled=true
 *
 * @param page - Target page for components
 * @param startY - Y position to start placing sections
 * @returns The Y position after all sections
 */
export async function generateRadioComponents(
  page: PageNode,
  startY: number = 100,
): Promise<number> {
  figma.currentPage = page;

  const variants = RADIO_VARIANTS.values;

  // Generate all meaningful combinations
  const components: ComponentNode[] = [];

  // Track row labels: { y, text }
  const rowLabels: { y: number; text: string }[] = [];

  // Layout grid spacing
  const componentGap = 24;
  const rowGap = GRID_LAYOUT.rowGap.standard;
  const headerRowHeight = GRID_LAYOUT.headerRowHeight;

  const labelColumnWidth = GRID_LAYOUT.labelColumnWidth.wide;

  // Column headers for checked states
  const columnHeaderTexts = ["checked=false", "checked=true"];

  // Track original X positions for column headers
  const columnXPositions: number[] = [];

  // Track layout
  let currentY = headerRowHeight; // Start below header row

  // Generate rows for each variant × disabled combination
  for (let vi = 0; vi < variants.length; vi++) {
    const variant = variants[vi];

    // Enabled row
    rowLabels.push({ y: currentY, text: "variant=" + variant });
    let currentX = labelColumnWidth;
    const checkedStates = [false, true];
    for (let ci = 0; ci < checkedStates.length; ci++) {
      const checked = checkedStates[ci];
      const component = await createRadioComponent(
        checked,
        variant,
        false,
        getRadioLabel(),
      );
      component.x = currentX;
      component.y = currentY;
      // Store original X positions from first row for column headers
      if (vi === 0) {
        columnXPositions.push(currentX);
      }
      currentX += component.width + componentGap;
      components.push(component);
    }
    currentY += rowGap;

    // Disabled row
    rowLabels.push({
      y: currentY,
      text: "variant=" + variant + ", disabled=true",
    });
    currentX = labelColumnWidth;
    for (let cdi = 0; cdi < checkedStates.length; cdi++) {
      const checkedD = checkedStates[cdi];
      const componentD = await createRadioComponent(
        checkedD,
        variant,
        true,
        getRadioLabel(),
      );
      componentD.x = currentX;
      componentD.y = currentY;
      currentX += componentD.width + componentGap;
      components.push(componentD);
    }
    currentY += rowGap;
  }

  // Combine into ComponentSet
  // @ts-ignore - combineAsVariants works at runtime
  const componentSet = figma.combineAsVariants(components, page);
  componentSet.name = "Radio";
  componentSet.description =
    "Radio component with checked (false/true), variant (default/error), and disabled properties. Includes label text.";

  componentSet.layoutMode = "NONE";

  // Calculate content dimensions
  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height + headerRowHeight;

  // Create light mode section
  const lightSection = createModeSection(page, "Radio", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2,
  );

  // Create dark mode section
  const darkSection = createModeSection(page, "Radio", "dark");
  darkSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2,
  );

  // Move ComponentSet into light section frame
  lightSection.frame.appendChild(componentSet);
  componentSet.x = SECTION_PADDING + labelColumnWidth;
  componentSet.y = SECTION_PADDING + headerRowHeight;

  // Build column headers with stored original positions
  const columnHeaders: { x: number; text: string }[] = [];
  for (let i = 0; i < columnXPositions.length; i++) {
    columnHeaders.push({
      x: columnXPositions[i] + SECTION_PADDING,
      text: columnHeaderTexts[i],
    });
  }

  // Add column headers to light section
  await createColumnHeaders(columnHeaders, SECTION_PADDING, lightSection.frame);

  // Add row labels to light section
  for (let li = 0; li < rowLabels.length; li++) {
    const labelData = rowLabels[li];
    const labelNode = await createRowLabel(
      labelData.text,
      SECTION_PADDING,
      SECTION_PADDING + labelData.y + GRID_LAYOUT.labelVerticalOffset.sm,
    );
    lightSection.frame.appendChild(labelNode);
  }

  // Create instances for dark section
  for (let ci = 0; ci < components.length; ci++) {
    const comp = components[ci];
    const instance = comp.createInstance();
    instance.x = comp.x + SECTION_PADDING + labelColumnWidth;
    instance.y = comp.y + SECTION_PADDING + headerRowHeight;
    darkSection.frame.appendChild(instance);
  }

  // Add column headers to dark section
  await createColumnHeaders(columnHeaders, SECTION_PADDING, darkSection.frame);

  // Add row labels to dark section
  for (let dli = 0; dli < rowLabels.length; dli++) {
    const darkLabelData = rowLabels[dli];
    const darkLabelNode = await createRowLabel(
      darkLabelData.text,
      SECTION_PADDING,
      SECTION_PADDING + darkLabelData.y + GRID_LAYOUT.labelVerticalOffset.sm,
    );
    darkSection.frame.appendChild(darkLabelNode);
  }

  // Resize sections to fit content with padding
  const totalWidth = contentWidth + SECTION_PADDING * 2;
  const totalHeight = contentHeight + SECTION_PADDING * 2;

  lightSection.frame.resize(totalWidth, totalHeight);
  darkSection.frame.resize(totalWidth, totalHeight);

  // Create section title above sections

  // Position sections side by side

  lightSection.frame.x = SECTION_LAYOUT.startX;
  lightSection.frame.y = startY;

  darkSection.frame.x =
    lightSection.frame.x + totalWidth + SECTION_LAYOUT.modeGap;
  darkSection.frame.y = startY;

  logInfo(
    "✅ Generated Radio ComponentSet with " +
      components.length +
      " variants (light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}

/**
 * Generate Radio.Group ComponentSet
 *
 * Creates variants for:
 * - orientation: vertical, horizontal
 * - hasDescription: false, true
 * - hasError: false, true
 * - controlPosition: start, end
 *
 * Total: 2 × 2 × 2 × 2 = 16 variants
 *
 * @param page - Target page for components
 * @param startY - Y position to start placing sections
 * @returns The Y position after all sections
 */
export async function generateRadioGroupComponents(
  page: PageNode,
  startY: number = 100,
): Promise<number> {
  logInfo("Radio.Group: Starting generation at Y=" + startY);

  figma.currentPage = page;

  const components: ComponentNode[] = [];

  // Generate all combinations
  const orientationValues: ("vertical" | "horizontal")[] = [
    "vertical",
    "horizontal",
  ];
  const hasDescriptionValues = [false, true];
  const hasErrorValues = [false, true];
  const controlPositionValues: ("start" | "end")[] = ["start", "end"];

  for (let o = 0; o < orientationValues.length; o++) {
    for (let d = 0; d < hasDescriptionValues.length; d++) {
      for (let e = 0; e < hasErrorValues.length; e++) {
        for (let c = 0; c < controlPositionValues.length; c++) {
          const component = await createRadioGroupComponent(
            orientationValues[o],
            hasDescriptionValues[d],
            hasErrorValues[e],
            controlPositionValues[c],
          );
          components.push(component);
        }
      }
    }
  }

  // Combine into ComponentSet
  // @ts-ignore - combineAsVariants works at runtime
  const componentSet = figma.combineAsVariants(components, page);
  componentSet.name = "Radio.Group";
  componentSet.description =
    "Radio group with fieldset, legend, optional description and error message. " +
    "Properties: orientation, hasDescription, hasError, controlPosition.";

  // Auto-layout the component set for clean display
  componentSet.layoutMode = "HORIZONTAL";
  componentSet.layoutWrap = "WRAP";
  componentSet.itemSpacing = 24;
  componentSet.counterAxisSpacing = 24;
  componentSet.primaryAxisSizingMode = "AUTO";
  componentSet.counterAxisSizingMode = "AUTO";

  // Create light mode section
  const lightSection = createModeSection(page, "Radio.Group", "light");

  // Create dark mode section
  const darkSection = createModeSection(page, "Radio.Group", "dark");

  // Move ComponentSet into light section
  lightSection.frame.appendChild(componentSet);
  componentSet.x = SECTION_PADDING;
  componentSet.y = SECTION_PADDING;

  // Create instances for dark section
  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    const instance = comp.createInstance();
    instance.x = comp.x + SECTION_PADDING;
    instance.y = comp.y + SECTION_PADDING;
    darkSection.frame.appendChild(instance);
  }

  // Resize sections to fit content
  const contentWidth = componentSet.width + SECTION_PADDING * 2;
  const contentHeight = componentSet.height + SECTION_PADDING * 2;

  lightSection.frame.resize(contentWidth, contentHeight);
  darkSection.frame.resize(contentWidth, contentHeight);

  // Add title inside each frame

  // Position sections side by side
  lightSection.frame.x = SECTION_LAYOUT.startX;
  lightSection.frame.y = startY;

  darkSection.frame.x =
    lightSection.frame.x + contentWidth + SECTION_LAYOUT.modeGap;
  darkSection.frame.y = startY;

  logInfo(
    "✅ Generated Radio.Group ComponentSet with " +
      components.length +
      " variants (light + dark)",
  );

  return startY + contentHeight + SECTION_GAP;
}

/**
 * Legacy exports for backwards compatibility
 */
export const RADIO_VARIANTS_EXPORT = RADIO_VARIANTS.values;
export const RADIO_CHECKED_OPTIONS = [false, true];
export const RADIO_DISABLED_OPTIONS = [false, true];
