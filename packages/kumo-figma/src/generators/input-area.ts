/**
 * InputArea Component Generator
 *
 * Generates an InputArea ComponentSet in Figma that matches
 * the InputArea component props:
 *
 * - size: xs, sm, base, lg
 * - variant: default, error
 * - state: default, focus, disabled
 * - withLabel: false (bare textarea), true (with Field wrapper)
 *
 * The InputArea is a multi-line textarea with optional label, description, and error states.
 * InputArea uses Input's inputVariants, so we read from the Input component registry.
 *
 * @see packages/kumo/src/components/input/input-area.tsx
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
  GRID_LAYOUT,
  VAR_NAMES,
} from "./shared";
import themeData from "../generated/theme-data.json";
import { logComplete } from "../logger";
import registry from "@cloudflare/kumo/ai/component-registry.json";

/**
 * Extract Input component from registry (InputArea uses Input's inputVariants)
 */
const inputRegistry = registry.components.Input as any;
const inputProps = inputRegistry.props;
const inputStyling = inputRegistry.styling;

/**
 * Extract InputArea styling from registry (minHeight and width per size)
 */
const inputAreaStyling = (registry.components.InputArea as any).styling;

/**
 * Size values from Input registry
 */
const SIZE_VALUES = inputProps.size.values;

/**
 * Variant values from Input registry
 */
const VARIANT_VALUES = inputProps.variant.values;

/**
 * Get size configuration from registry (merging InputArea and Input styling)
 * InputArea uses the same paddingX, fontSize, borderRadius as Input,
 * but with larger minHeight for multi-line content and py-2 instead of Input's height.
 * minHeight and width come from InputArea registry, other dimensions from Input registry.
 * @param size - Size variant (xs, sm, base, lg)
 * @returns Size dimensions including layout-specific width
 */
function getSizeConfigFromRegistry(size: string) {
  // Fallback values if registry data is missing
  const FALLBACK_INPUT_AREA_CONFIG: Record<
    string,
    { minHeight: number; width: number }
  > = {
    xs: { minHeight: 60, width: 200 },
    sm: { minHeight: 72, width: 240 },
    base: { minHeight: 88, width: 320 },
    lg: { minHeight: 100, width: 360 },
  };

  const FALLBACK_INPUT_CONFIG = {
    paddingX: themeData.tailwind.spacing.scale["3"], // px-3 = 12px
    fontSize: FONT_SIZE.lg, // 16px from theme-kumo.css
    borderRadius: BORDER_RADIUS.lg, // 8px
  };

  // Get InputArea-specific dimensions (minHeight, width) from registry
  const inputAreaSizeData =
    inputAreaStyling?.sizeVariants?.[size] ||
    FALLBACK_INPUT_AREA_CONFIG[size] ||
    FALLBACK_INPUT_AREA_CONFIG.base;

  // Get Input dimensions (paddingX, fontSize, borderRadius) from registry
  const inputSizeVariant =
    inputStyling?.sizeVariants?.[size] || inputStyling?.sizeVariants?.base;

  return {
    minHeight: inputAreaSizeData.minHeight,
    paddingX:
      inputSizeVariant?.dimensions?.paddingX || FALLBACK_INPUT_CONFIG.paddingX,
    paddingY: themeData.tailwind.spacing.scale["2"], // py-2 = 8px for all sizes (InputArea-specific, not in registry)
    fontSize:
      inputSizeVariant?.dimensions?.fontSize || FALLBACK_INPUT_CONFIG.fontSize,
    borderRadius:
      inputSizeVariant?.dimensions?.borderRadius ||
      FALLBACK_INPUT_CONFIG.borderRadius,
    width: inputAreaSizeData.width,
  };
}

/**
 * Size configuration from registry (computed at generator init time)
 */
const SIZE_CONFIG: Record<
  string,
  {
    minHeight: number;
    paddingX: number;
    paddingY: number;
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
 * State values
 */
const STATE_VALUES = ["default", "focus", "disabled"];

/**
 * WithLabel values - whether to show Field wrapper (label, description, error)
 */
const WITH_LABEL_VALUES = [false, true];

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
    label: "Message",
    description: "Enter your message here",
  },
  error: {
    ringVariable: VAR_NAMES.color.danger,
    label: "Message",
    errorMessage: "Please enter a valid message",
  },
};

/**
 * Create a single InputArea component variant
 *
 * @param size - Size (xs, sm, base, lg)
 * @param variant - Variant type (default, error)
 * @param state - Interaction state (default, focus, disabled)
 * @param withLabel - Whether to show Field wrapper (label, description, error)
 * @returns ComponentNode for the textarea
 */
async function createInputAreaComponent(
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
    "InputArea " +
    size +
    " " +
    variant +
    " in " +
    state +
    " state" +
    (withLabel ? " with Field wrapper" : " bare");

  // Set up vertical auto-layout for the entire component (label + textarea + description/error)
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.counterAxisAlignItems = "MIN";
  component.itemSpacing = 4;
  component.fills = [];

  // Apply disabled opacity to entire component
  if (stateStyle.opacity !== undefined) {
    component.opacity = stateStyle.opacity;
  }

  // Create label (only if withLabel is true)
  if (withLabel && variantConfig.label) {
    const labelText = await createTextNode(
      variantConfig.label,
      FONT_SIZE.base,
      500,
    ); // 14px from theme-kumo.css
    labelText.name = "Label";
    labelText.textAutoResize = "WIDTH_AND_HEIGHT";

    const labelVar = getVariableByName(VAR_NAMES.text.label);
    if (labelVar) {
      bindTextColorToVariable(labelText, labelVar.id);
    }

    component.appendChild(labelText);
  }

  // Create textarea frame
  const textareaFrame = figma.createFrame();
  textareaFrame.name = "Textarea";
  textareaFrame.layoutMode = "HORIZONTAL";
  textareaFrame.primaryAxisAlignItems = "MIN";
  textareaFrame.counterAxisAlignItems = "MIN"; // Top-align text in textarea
  textareaFrame.primaryAxisSizingMode = "FIXED";
  textareaFrame.counterAxisSizingMode = "FIXED";
  textareaFrame.resize(sizeConfig.width, sizeConfig.minHeight);
  textareaFrame.itemSpacing = 8;
  textareaFrame.paddingLeft = sizeConfig.paddingX;
  textareaFrame.paddingRight = sizeConfig.paddingX;
  textareaFrame.paddingTop = sizeConfig.paddingY;
  textareaFrame.paddingBottom = sizeConfig.paddingY;
  textareaFrame.cornerRadius = sizeConfig.borderRadius;

  // Apply background fill (bg-kumo-control)
  const bgVar = getVariableByName(VAR_NAMES.color.control);
  if (bgVar) {
    bindFillToVariable(textareaFrame, bgVar.id);
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
    bindStrokeToVariable(textareaFrame, ringVar.id, 1);
  }

  // Create placeholder text (multi-line for textarea)
  const placeholderValue =
    variant === "error"
      ? "Invalid content here..."
      : "Enter your message here...";
  const placeholderText = await createTextNode(
    placeholderValue,
    sizeConfig.fontSize,
    400,
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

  textareaFrame.appendChild(placeholderText);
  component.appendChild(textareaFrame);

  // Create description or error message (only if withLabel is true)
  if (withLabel && variantConfig.description && variant === "default") {
    const descText = await createTextNode(
      variantConfig.description,
      FONT_SIZE.xs,
      400,
    ); // 12px from theme-kumo.css
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
      400,
    ); // 12px from theme-kumo.css
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
 * Generate InputArea ComponentSet with size, variant, state, and withLabel properties
 *
 * Creates an "InputArea" ComponentSet with all combinations of:
 * - size: xs, sm, base, lg
 * - variant: default, error
 * - state: default, focus, disabled
 * - withLabel: false (bare textarea), true (with Field wrapper)
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
export async function generateInputAreaComponents(
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
  const componentGapY = 40;
  const headerRowHeight = 24;
  const labelColumnWidth = 200; // Wider for size + withLabel labels

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
          const component = await createInputAreaComponent(
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
  componentSet.name = "InputArea";
  componentSet.description =
    "InputArea (textarea) component with size, variant, state, and withLabel properties. " +
    "Use withLabel=false for bare textareas, withLabel=true for textareas with Field wrapper (label, description, error).";
  componentSet.layoutMode = "NONE";

  // Calculate content dimensions
  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height + headerRowHeight;

  // Add contentYOffset for title space inside frame
  const contentYOffset = SECTION_TITLE.height;

  // Create light mode section
  const lightSection = createModeSection(page, "InputArea", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Create dark mode section
  const darkSection = createModeSection(page, "InputArea", "dark");
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
    "Generated InputArea ComponentSet with " +
      components.length +
      " variants (light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}

/**
 * Testable exports for input-area.test.ts (no Figma API calls)
 */

/**
 * Get size configuration from registry
 * @returns Size values, config object, and registry metadata
 */
export function getInputAreaSizeConfig() {
  return {
    values: SIZE_VALUES,
    config: SIZE_CONFIG,
    registryClasses: inputProps.size.classes,
    registryDescriptions: inputProps.size.descriptions,
  };
}

/**
 * Get variant configuration from registry
 * @returns Variant values, config object, and registry metadata
 */
export function getInputAreaVariantConfig() {
  return {
    values: VARIANT_VALUES,
    config: VARIANT_CONFIG,
    registryClasses: inputProps.variant.classes,
    registryDescriptions: inputProps.variant.descriptions,
  };
}

/**
 * Get state configuration from STATE_STYLES
 * @returns State values and styles object
 */
export function getInputAreaStateConfig() {
  return {
    values: STATE_VALUES,
    styles: STATE_STYLES,
  };
}

/**
 * Get withLabel configuration
 * @returns WithLabel values
 */
export function getInputAreaWithLabelConfig() {
  return {
    values: WITH_LABEL_VALUES,
  };
}

/**
 * Get computed dimensions for a specific size
 * @param size - Size value
 * @returns Size dimensions object
 */
export function getInputAreaSizeDimensions(size: string) {
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG["base"];
  return {
    size: size,
    minHeight: sizeConfig.minHeight,
    paddingX: sizeConfig.paddingX,
    paddingY: sizeConfig.paddingY,
    fontSize: sizeConfig.fontSize,
    borderRadius: sizeConfig.borderRadius,
    width: sizeConfig.width,
  };
}

/**
 * Get ring variable for a specific variant and state combination
 * @param variant - Variant value
 * @param state - State value
 * @returns Ring variable name
 */
export function getInputAreaRingVariable(variant: string, state: string) {
  const variantConfig = VARIANT_CONFIG[variant] || VARIANT_CONFIG["default"];

  // Determine ring variable based on variant and state
  let ringVarName = variantConfig.ringVariable;
  if (state === "focus" && variant === "default") {
    ringVarName = VAR_NAMES.color.brand;
  } else if (state === "focus" && variant === "error") {
    ringVarName = VAR_NAMES.color.danger;
  }

  return ringVarName;
}

/**
 * Get complete intermediate data for all InputArea variants
 * This captures all data computed before Figma API calls
 * @returns Complete variant data structure
 */
export function getAllInputAreaVariantData() {
  return {
    sizes: SIZE_VALUES.map(function (size: string) {
      return {
        size: size,
        dimensions: getInputAreaSizeDimensions(size),
      };
    }),
    variants: VARIANT_VALUES.map(function (variant: string) {
      const variantConfig =
        VARIANT_CONFIG[variant] || VARIANT_CONFIG["default"];
      return {
        variant: variant,
        config: variantConfig,
        states: STATE_VALUES.map(function (state: string) {
          return {
            state: state,
            ringVariable: getInputAreaRingVariable(variant, state),
            stateStyle: STATE_STYLES[state] || STATE_STYLES["default"],
          };
        }),
      };
    }),
    withLabelOptions: WITH_LABEL_VALUES,
    registryMetadata: {
      component: "Input",
      note: "InputArea uses Input's inputVariants (size and variant props)",
    },
  };
}

/**
 * Exports for tests and backwards compatibility
 */
export const INPUT_AREA_SIZE_VALUES = SIZE_VALUES;
export const INPUT_AREA_VARIANT_VALUES = VARIANT_VALUES;
export const INPUT_AREA_STATE_VALUES = STATE_VALUES;
