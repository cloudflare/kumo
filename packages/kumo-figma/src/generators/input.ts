/**
 * Input Component Generator
 *
 * Generates an Input ComponentSet in Figma that matches
 * the Input component props:
 *
 * - size: xs, sm, base, lg
 * - variant: default, error
 * - state: default, focus, disabled
 *
 * The Input has a text field with optional label, description, and error states.
 *
 * Reads styles from component-registry.json (the source of truth).
 *
 * @see packages/kumo/src/components/input/input.tsx
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
  SECTION_PADDING,
  SECTION_GAP,
  GRID_LAYOUT,
  SECTION_LAYOUT,
  SECTION_TITLE,
  OPACITY,
  SPACING,
  FONT_SIZE,
  FALLBACK_VALUES,
  VAR_NAMES,
} from "./shared";
import { logComplete } from "../logger";
import registry from "@cloudflare/kumo/ai/component-registry.json";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";

/**
 * Extract Input component from registry
 */
const inputRegistry = registry.components.Input as any;
const inputProps = inputRegistry.props;
const inputStyling = inputRegistry.styling;

/**
 * Size values from registry
 */
const SIZE_VALUES = inputProps.size.values;

/**
 * Variant values from registry
 */
const VARIANT_VALUES = inputProps.variant.values;

/**
 * State values
 */
const STATE_VALUES = ["default", "focus", "disabled"];

/**
 * WithLabel values - whether to show Field wrapper (label, description, error)
 */
const WITH_LABEL_VALUES = [false, true];

/**
 * Get size configuration from registry
 * @param size - Size variant (xs, sm, base, lg)
 * @returns Size dimensions including layout-specific width
 */
function getSizeConfigFromRegistry(size: string) {
  // Registry uses "dimensions" not "sizeVariants"
  let dimensions = inputStyling.dimensions?.[size];
  if (!dimensions) {
    // Fallback to base if size not found
    dimensions = inputStyling.dimensions?.base;
  }

  // Fallback values if registry data is missing
  const fallbackDimensions: Record<
    string,
    { height: number; paddingX: number; fontSize: number; borderRadius: number }
  > = {
    xs: { height: 20, paddingX: 6, fontSize: 12, borderRadius: 2 },
    sm: { height: 26, paddingX: 8, fontSize: 12, borderRadius: 6 },
    base: { height: 36, paddingX: 12, fontSize: 16, borderRadius: 8 },
    lg: { height: 40, paddingX: 16, fontSize: 16, borderRadius: 8 },
  };

  const dims =
    dimensions || fallbackDimensions[size] || fallbackDimensions.base;

  // Layout-specific widths (not in registry - generator specific)
  const widthMap: Record<string, number> = {
    xs: 160,
    sm: 200,
    base: 280,
    lg: 320,
  };

  return {
    height: dims.height,
    paddingX: dims.paddingX,
    fontSize: dims.fontSize,
    borderRadius: dims.borderRadius,
    width: widthMap[size] || widthMap.base,
  };
}

/**
 * Size configuration from registry
 */
const SIZE_CONFIG: Record<
  string,
  {
    height: number;
    paddingX: number;
    fontSize: number;
    borderRadius: number;
    width: number;
  }
> = {
  xs: getSizeConfigFromRegistry("xs"),
  sm: getSizeConfigFromRegistry("sm"),
  base: getSizeConfigFromRegistry("base"),
  lg: getSizeConfigFromRegistry("lg"),
};

/**
 * State-specific style overrides
 */
const STATE_STYLES: Record<
  string,
  {
    ringVariable?: string;
    opacity?: number;
    textColorVariable?: string;
  }
> = {
  default: {
    ringVariable: VAR_NAMES.color.line,
    textColorVariable: VAR_NAMES.text.subtle,
  },
  focus: {
    ringVariable: VAR_NAMES.color.brand,
    textColorVariable: VAR_NAMES.text.subtle,
  },
  disabled: {
    ringVariable: VAR_NAMES.color.line,
    opacity: OPACITY.disabled,
    textColorVariable: VAR_NAMES.text.subtle,
  },
};

/**
 * Variant-specific configuration
 */
const VARIANT_CONFIG: Record<
  string,
  {
    ringVariable: string;
    label?: string;
    description?: string;
    errorMessage?: string;
  }
> = {
  default: {
    ringVariable: VAR_NAMES.color.line,
    label: "Email",
    description: "Enter your email address",
  },
  error: {
    ringVariable: VAR_NAMES.color.danger,
    label: "Email",
    errorMessage: "Please enter a valid email address",
  },
};

/**
 * Create a single Input component variant
 *
 * @param size - Size (xs, sm, base, lg)
 * @param variant - Variant type (default, error)
 * @param state - Interaction state (default, focus, disabled)
 * @param withLabel - Whether to show Field wrapper (label, description, error)
 * @returns ComponentNode for the input
 */
async function createInputComponent(
  size: string,
  variant: string,
  state: string,
  withLabel: boolean,
): Promise<ComponentNode> {
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG["base"];
  const variantConfig = VARIANT_CONFIG[variant] || VARIANT_CONFIG["default"];
  const stateStyle = STATE_STYLES[state] || STATE_STYLES["default"];

  // Create component
  const component = figma.createComponent();
  component.name =
    "size=" +
    size +
    ", variant=" +
    variant +
    ", state=" +
    state +
    ", withLabel=" +
    withLabel;
  component.description =
    "Input " +
    size +
    " " +
    variant +
    " in " +
    state +
    " state" +
    (withLabel ? " with Field wrapper" : " bare");

  // Set up vertical auto-layout for the entire component (label + input + description/error)
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.counterAxisAlignItems = "MIN";
  component.itemSpacing = SPACING.xs; // Gap between label, input, and description/error
  component.fills = [];

  // Apply disabled opacity to entire component
  if (stateStyle.opacity !== undefined) {
    component.opacity = stateStyle.opacity;
  }

  // Create label (only if withLabel is true)
  if (withLabel && variantConfig.label) {
    const labelText = await createTextNode(
      variantConfig.label,
      FONT_SIZE.xs,
      FALLBACK_VALUES.fontWeight.medium,
    );
    labelText.name = "Label";
    labelText.textAutoResize = "WIDTH_AND_HEIGHT";

    const labelVar = getVariableByName(VAR_NAMES.text.label);
    if (labelVar) {
      bindTextColorToVariable(labelText, labelVar.id);
    }

    component.appendChild(labelText);
  }

  // Create input frame
  const inputFrame = figma.createFrame();
  inputFrame.name = "Input";
  inputFrame.layoutMode = "HORIZONTAL";
  inputFrame.primaryAxisAlignItems = "MIN";
  inputFrame.counterAxisAlignItems = "CENTER";
  inputFrame.primaryAxisSizingMode = "FIXED";
  inputFrame.counterAxisSizingMode = "FIXED";
  inputFrame.resize(sizeConfig.width, sizeConfig.height);
  inputFrame.itemSpacing = SPACING.base; // Gap between icon/prefix and input text
  inputFrame.paddingLeft = sizeConfig.paddingX;
  inputFrame.paddingRight = sizeConfig.paddingX;
  inputFrame.paddingTop = 0;
  inputFrame.paddingBottom = 0;
  inputFrame.cornerRadius = sizeConfig.borderRadius;

  // Apply background fill (bg-kumo-control)
  const bgVar = getVariableByName(VAR_NAMES.color.control);
  if (bgVar) {
    bindFillToVariable(inputFrame, bgVar.id);
  }

  // Apply ring (stroke) - use variant ring in default state, state ring for focus
  let ringVarName = variantConfig.ringVariable;
  if (state === "focus" && variant === "default") {
    ringVarName = VAR_NAMES.color.brand;
  } else if (state === "focus" && variant === "error") {
    ringVarName = VAR_NAMES.color.danger;
  }
  const ringVar = getVariableByName(ringVarName);
  if (ringVar) {
    bindStrokeToVariable(inputFrame, ringVar.id, 1);
  }

  // Create placeholder text
  const placeholderValue =
    variant === "error" ? "invalid@example" : "you@example.com";
  const placeholderText = await createTextNode(
    placeholderValue,
    sizeConfig.fontSize,
    FALLBACK_VALUES.fontWeight.normal,
  );
  placeholderText.name = "Placeholder";
  placeholderText.textAutoResize = "WIDTH_AND_HEIGHT";

  // Apply text color (text-kumo-subtle for placeholder, text-kumo-default for value in error)
  const textColorVar =
    variant === "error"
      ? getVariableByName(VAR_NAMES.text.default)
      : getVariableByName(VAR_NAMES.text.subtle);
  if (textColorVar) {
    bindTextColorToVariable(placeholderText, textColorVar.id);
  }

  inputFrame.appendChild(placeholderText);
  component.appendChild(inputFrame);

  // Create description or error message (only if withLabel is true)
  if (withLabel && variantConfig.description && variant === "default") {
    const descText = await createTextNode(
      variantConfig.description,
      FONT_SIZE.xs,
      FALLBACK_VALUES.fontWeight.normal,
    );
    descText.name = "Description";
    descText.textAutoResize = "WIDTH_AND_HEIGHT";

    const descVar = getVariableByName(VAR_NAMES.text.subtle);
    if (descVar) {
      bindTextColorToVariable(descText, descVar.id);
    }

    component.appendChild(descText);
  }

  if (withLabel && variantConfig.errorMessage && variant === "error") {
    const errorText = await createTextNode(
      variantConfig.errorMessage,
      FONT_SIZE.xs,
      FALLBACK_VALUES.fontWeight.normal,
    );
    errorText.name = "Error";
    errorText.textAutoResize = "WIDTH_AND_HEIGHT";

    const errorVar = getVariableByName(VAR_NAMES.text.danger);
    if (errorVar) {
      bindTextColorToVariable(errorText, errorVar.id);
    }

    component.appendChild(errorText);
  }

  return component;
}

/**
 * Generate Input ComponentSet with size, variant, state, and withLabel properties
 *
 * Creates an "Input" ComponentSet with all combinations of:
 * - size: xs, sm, base, lg
 * - variant: default, error
 * - state: default, focus, disabled
 * - withLabel: false (bare input), true (with Field wrapper)
 *
 * Layout:
 * - Rows: size × withLabel combinations (8 rows total)
 * - Columns: variant × state combinations (6 columns total)
 *
 * Creates both light and dark mode sections.
 *
 * @param page - The page to add components to
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateInputComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  figma.currentPage = page;

  // Generate all combinations
  const components: ComponentNode[] = [];

  // Track row labels: { y, text }
  const rowLabels: { y: number; text: string }[] = [];

  // Track column headers: { x, text }
  let columnHeaders: { x: number; text: string }[] = [];

  // Layout spacing
  const componentGapX = 24;
  const componentGapY = GRID_LAYOUT.rowGap.medium;
  const headerRowHeight = GRID_LAYOUT.headerRowHeight;
  const labelColumnWidth = GRID_LAYOUT.labelColumnWidth.wide;

  // Track layout by row (size × withLabel)
  const rowComponents: Map<number, ComponentNode[]> = new Map();

  // Generate components for each combination
  // Rows = size × withLabel, Columns = variant × state
  let rowIndex = 0;
  for (let si = 0; si < SIZE_VALUES.length; si++) {
    const size = SIZE_VALUES[si];

    for (let wli = 0; wli < WITH_LABEL_VALUES.length; wli++) {
      const withLabel = WITH_LABEL_VALUES[wli];
      rowComponents.set(rowIndex, []);

      for (let vi = 0; vi < VARIANT_VALUES.length; vi++) {
        const variant = VARIANT_VALUES[vi];

        for (let sti = 0; sti < STATE_VALUES.length; sti++) {
          const state = STATE_VALUES[sti];
          const component = await createInputComponent(
            size,
            variant,
            state,
            withLabel,
          );
          rowComponents.get(rowIndex)!.push(component);
          components.push(component);
        }
      }

      rowIndex++;
    }
  }

  // First pass: calculate max width per column and max height per row
  const columnWidths: number[] = [];
  const rowHeights: number[] = [];

  const numColumns = VARIANT_VALUES.length * STATE_VALUES.length;
  const totalRows = SIZE_VALUES.length * WITH_LABEL_VALUES.length;

  for (let colIdx = 0; colIdx < numColumns; colIdx++) {
    let maxColWidth = 0;
    for (let rowIdx = 0; rowIdx < totalRows; rowIdx++) {
      const row = rowComponents.get(rowIdx) || [];
      const comp = row[colIdx];
      if (comp && comp.width > maxColWidth) {
        maxColWidth = comp.width;
      }
    }
    columnWidths.push(maxColWidth);
  }

  for (let rowIdx = 0; rowIdx < totalRows; rowIdx++) {
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

  let currentRowIndex = 0;
  for (let si2 = 0; si2 < SIZE_VALUES.length; si2++) {
    const sizeValue = SIZE_VALUES[si2];

    for (let wli2 = 0; wli2 < WITH_LABEL_VALUES.length; wli2++) {
      const withLabelValue = WITH_LABEL_VALUES[wli2];
      const row = rowComponents.get(currentRowIndex) || [];
      let xOffset = labelColumnWidth;

      // Record row label
      rowLabels.push({
        y: yOffset,
        text: "size=" + sizeValue + ", withLabel=" + withLabelValue,
      });

      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const comp = row[colIdx];
        comp.x = xOffset;
        comp.y = yOffset;

        // Record column headers from first row
        if (currentRowIndex === 0) {
          const variantIdx = Math.floor(colIdx / STATE_VALUES.length);
          const stateIdx = colIdx % STATE_VALUES.length;
          const variantVal = VARIANT_VALUES[variantIdx];
          const stateVal = STATE_VALUES[stateIdx];
          columnHeaders.push({
            x: xOffset,
            text: "variant=" + variantVal + ", state=" + stateVal,
          });
        }

        // Use consistent column width for positioning
        xOffset += columnWidths[colIdx] + componentGapX;
      }

      yOffset += rowHeights[currentRowIndex] + componentGapY;
      currentRowIndex++;
    }
  }

  // Combine all variants into a single ComponentSet
  // @ts-ignore - combineAsVariants works at runtime
  const componentSet = figma.combineAsVariants(components, page);
  componentSet.name = "Input";
  componentSet.description =
    "Input component with size, variant, state, and withLabel properties. " +
    "Use withLabel=false for bare inputs, withLabel=true for inputs with Field wrapper (label, description, error).";
  componentSet.layoutMode = "NONE";

  // Calculate content dimensions
  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height + headerRowHeight;

  // Add contentYOffset for title space inside frame
  const contentYOffset = SECTION_TITLE.height;

  // Create light mode section
  const lightSection = createModeSection(page, "Input", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Create dark mode section
  const darkSection = createModeSection(page, "Input", "dark");
  darkSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Move ComponentSet into light section frame
  lightSection.frame.appendChild(componentSet);
  componentSet.x = SECTION_PADDING + labelColumnWidth;
  componentSet.y = SECTION_PADDING + headerRowHeight + contentYOffset;

  // Add section titles inside frames

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
      SECTION_PADDING +
        contentYOffset +
        darkLabel.y +
        GRID_LAYOUT.labelVerticalOffset.md,
    );
    darkSection.frame.appendChild(darkLabelNode);
  }

  // Resize sections to fit content with padding
  const totalWidth = contentWidth + SECTION_PADDING * 2;
  const totalHeight = contentHeight + SECTION_PADDING * 2 + contentYOffset;

  lightSection.section.resizeWithoutConstraints(totalWidth, totalHeight);
  darkSection.section.resizeWithoutConstraints(totalWidth, totalHeight);

  // Position sections side by side
  lightSection.frame.x = SECTION_LAYOUT.startX;
  lightSection.frame.y = startY;

  darkSection.frame.x =
    lightSection.frame.x + totalWidth + SECTION_LAYOUT.modeGap;
  darkSection.frame.y = startY;

  logComplete(
    "Generated Input ComponentSet with " +
      components.length +
      " variants (light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}

/**
 * Exports for tests and backwards compatibility
 */
export const INPUT_SIZE_VALUES = SIZE_VALUES;
export const INPUT_VARIANT_VALUES = VARIANT_VALUES;
export const INPUT_STATE_VALUES = STATE_VALUES;

/**
 * Testable export functions for input.test.ts
 * These functions expose internal data structures for testing the source of truth chain:
 * input.tsx → component-registry.json → input.ts (generator) → Figma
 */

const inputComponent = inputRegistry;

/**
 * Get base styling configuration from registry
 * Returns parsed base styles and styling metadata
 */
export function getBaseStyles() {
  const styling = inputComponent.styling;
  const baseTokens = styling?.baseTokens || [];
  const states = styling?.states || {};

  // Parse base state tokens
  const baseStateClasses = (states.base || []).join(" ");
  const parsed = parseTailwindClasses(baseStateClasses);

  return {
    raw: baseTokens,
    parsed: {
      backgroundVariable: parsed.fillVariable || null,
      textVariable: parsed.textVariable || null,
      placeholderVariable: null, // Placeholder handled separately in component
      ringVariable: parsed.strokeVariable || null,
    },
    styling: styling,
  };
}

/**
 * Get size-specific configuration from registry
 * Returns dimensions for a specific size variant
 */
export function getSizeConfig(size: string) {
  const styling = inputComponent.styling;
  const dimensions = styling?.dimensions || {};
  const sizeConfig = dimensions[size];

  if (!sizeConfig) {
    throw new Error(`Size "${size}" not found in Input styling metadata`);
  }

  return {
    size,
    height: sizeConfig.height,
    dimensions: {
      paddingX: sizeConfig.paddingX,
      fontSize: sizeConfig.fontSize,
      borderRadius: sizeConfig.borderRadius,
      width: sizeConfig.width,
    },
  };
}

/**
 * Get complete variant data for all sizes
 * Returns structured data including raw registry values and parsed styles
 */
export function getAllVariantData() {
  const props = inputComponent.props;
  const styling = inputComponent.styling;
  const sizeVariants = props.size?.values || [];
  const variantValues = props.variant?.values || [];

  const baseStyles = getBaseStyles();

  const sizes = sizeVariants.map((size: string) => {
    const sizeConfig = getSizeConfig(size);
    const sizeClasses = props.size?.classes?.[size] || "";
    const parsed = parseTailwindClasses(sizeClasses);

    return {
      size,
      classes: sizeClasses,
      description: props.size?.descriptions?.[size] || "",
      dimensions: sizeConfig,
      parsed,
    };
  });

  const variants = variantValues.map((variant: string) => {
    const variantClasses = props.variant?.classes?.[variant] || "";
    const parsed = parseTailwindClasses(variantClasses);

    return {
      variant,
      classes: variantClasses,
      description: props.variant?.descriptions?.[variant] || "",
      parsed,
    };
  });

  return {
    baseStyles,
    sizes,
    variants,
    stateTokens: styling?.states || {},
  };
}
