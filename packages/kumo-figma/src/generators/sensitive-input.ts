import { logComplete } from "../logger";
/**
 * SensitiveInput Component Generator
 *
 * Generates a SensitiveInput ComponentSet in Figma that matches
 * the SensitiveInput component props:
 *
 * - size: xs, sm, base, lg
 * - variant: default, error
 * - state: default, focus, disabled
 * - mode: masked, revealed
 * - withLabel: false, true
 *
 * The SensitiveInput shows masked dots (●●●●●●●●) or revealed text,
 * with eye icon toggle and copy button on hover.
 *
 * @see packages/kumo/src/components/sensitive-input/sensitive-input.tsx
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
  SECTION_LAYOUT,
  OPACITY,
  GRID_LAYOUT,
  VAR_NAMES,
  BORDER_RADIUS,
} from "./shared";
import { getButtonIcon, bindIconColor } from "./icon-utils";
import registry from "@cloudflare/kumo/ai/component-registry.json";

/**
 * Extract Input component data from registry
 * SensitiveInput uses Input's size and variant configuration
 */
const inputComponent = registry.components.Input;
const inputProps = inputComponent.props;
const inputStyling = inputComponent.styling;

const sizeProp = inputProps.size as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

const variantProp = inputProps.variant as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

/**
 * Size values from Input registry
 */
const SIZE_VALUES = sizeProp.values;

/**
 * Variant values from Input registry
 */
const VARIANT_VALUES = variantProp.values;

/**
 * Width mapping for SensitiveInput (layout-specific)
 */
const SIZE_WIDTHS: Record<string, number> = {
  xs: 200,
  sm: 220,
  base: 280,
  lg: 320,
};

/**
 * Icon size mapping for SensitiveInput (layout-specific)
 */
const ICON_SIZES: Record<string, string> = {
  xs: "sm",
  sm: "sm",
  base: "base",
  lg: "base",
};

/**
 * Get size configuration from Input registry styling
 */
function getSizeConfigFromRegistry(size: string): {
  height: number;
  paddingX: number;
  fontSize: number;
  borderRadius: number;
  width: number;
  iconSize: string;
} {
  // Registry uses "dimensions" not "sizeVariants"
  const dimensions = inputStyling.dimensions as
    | Record<
        string,
        {
          height: number;
          paddingX: number;
          fontSize: number;
          borderRadius: number;
          width: number;
        }
      >
    | undefined;

  // Fallback values if registry data is missing
  // Uses BORDER_RADIUS constants from shared.ts (derived from Tailwind v4 theme.css)
  const fallbackDimensions: Record<
    string,
    { height: number; paddingX: number; fontSize: number; borderRadius: number }
  > = {
    xs: {
      height: 20,
      paddingX: 6,
      fontSize: 12,
      borderRadius: BORDER_RADIUS.xs,
    },
    sm: {
      height: 26,
      paddingX: 8,
      fontSize: 12,
      borderRadius: BORDER_RADIUS.md,
    },
    base: {
      height: 36,
      paddingX: 12,
      fontSize: 16,
      borderRadius: BORDER_RADIUS.lg,
    },
    lg: {
      height: 40,
      paddingX: 16,
      fontSize: 16,
      borderRadius: BORDER_RADIUS.lg,
    },
  };

  const dims =
    dimensions?.[size] ||
    dimensions?.["base"] ||
    fallbackDimensions[size] ||
    fallbackDimensions["base"];

  return {
    height: dims.height,
    paddingX: dims.paddingX,
    fontSize: dims.fontSize,
    borderRadius: dims.borderRadius,
    width: SIZE_WIDTHS[size] || SIZE_WIDTHS["base"],
    iconSize: ICON_SIZES[size] || ICON_SIZES["base"],
  };
}

/**
 * Size configuration from registry (dynamically computed)
 */
const SIZE_CONFIG: Record<
  string,
  {
    height: number;
    paddingX: number;
    fontSize: number;
    borderRadius: number;
    width: number;
    iconSize: string;
  }
> = {};

// Populate SIZE_CONFIG from registry at generator init time
for (let i = 0; i < SIZE_VALUES.length; i++) {
  const sizeKey = SIZE_VALUES[i];
  SIZE_CONFIG[sizeKey] = getSizeConfigFromRegistry(sizeKey);
}

/**
 * State values
 */
const STATE_VALUES = ["default", "focus", "disabled"];

/**
 * Mode values - masked shows dots, revealed shows text
 */
const MODE_VALUES = ["masked", "revealed"];

/**
 * WithLabel values - whether to show Field wrapper
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
    ringVariable: string;
    label?: string;
    description?: string;
    errorMessage?: string;
  }
> = {
  default: {
    ringVariable: VAR_NAMES.color.line,
    label: "API Key",
    description: "Keep this key secure",
  },
  error: {
    ringVariable: VAR_NAMES.color.danger,
    label: "API Key",
    errorMessage: "This API key is not valid",
  },
};

/**
 * Create a single SensitiveInput component variant
 */
async function createSensitiveInputComponent(
  size: string,
  variant: string,
  state: string,
  mode: string,
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
    ", mode=" +
    mode +
    ", withLabel=" +
    withLabel;
  component.description =
    "SensitiveInput " +
    size +
    " " +
    variant +
    " in " +
    state +
    " state, " +
    mode +
    (withLabel ? " with Field wrapper" : " bare");

  // Set up vertical auto-layout
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.counterAxisAlignItems = "MIN";
  component.itemSpacing = 4;
  component.fills = [];

  // Apply disabled opacity
  if (stateStyle.opacity !== undefined) {
    component.opacity = stateStyle.opacity;
  }

  // Create label (only if withLabel is true)
  if (withLabel && variantConfig.label) {
    const labelText = await createTextNode(variantConfig.label, 14, 500);
    labelText.name = "Label";
    labelText.textAutoResize = "WIDTH_AND_HEIGHT";

    const labelVar = getVariableByName(VAR_NAMES.text.strong);
    if (labelVar) {
      bindTextColorToVariable(labelText, labelVar.id);
    }

    component.appendChild(labelText);
  }

  // Create input container frame
  const inputFrame = figma.createFrame();
  inputFrame.name = "Input";
  inputFrame.layoutMode = "HORIZONTAL";
  inputFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
  inputFrame.counterAxisAlignItems = "CENTER";
  inputFrame.primaryAxisSizingMode = "FIXED";
  inputFrame.counterAxisSizingMode = "FIXED";
  inputFrame.resize(sizeConfig.width, sizeConfig.height);
  inputFrame.itemSpacing = 8;
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

  // Create content based on mode
  if (mode === "masked") {
    // Show masked dots
    const maskedText = await createTextNode(
      "●●●●●●●●",
      sizeConfig.fontSize,
      400,
    );
    maskedText.name = "MaskedValue";
    maskedText.textAutoResize = "WIDTH_AND_HEIGHT";

    const maskedTextVar = getVariableByName(VAR_NAMES.text.default);
    if (maskedTextVar) {
      bindTextColorToVariable(maskedText, maskedTextVar.id);
    }

    inputFrame.appendChild(maskedText);
  } else {
    // Show revealed text
    const revealedText = await createTextNode(
      "sk_live_abc123",
      sizeConfig.fontSize,
      400,
    );
    revealedText.name = "Value";
    revealedText.textAutoResize = "WIDTH_AND_HEIGHT";

    const revealedTextVar = getVariableByName(VAR_NAMES.text.default);
    if (revealedTextVar) {
      bindTextColorToVariable(revealedText, revealedTextVar.id);
    }

    inputFrame.appendChild(revealedText);
  }

  // Create eye icon (EyeSlash when revealed, Eye when masked)
  const eyeIconName = mode === "revealed" ? "ph-eye-slash" : "ph-eye";
  const eyeIcon = getButtonIcon(eyeIconName, sizeConfig.iconSize);
  eyeIcon.name = "EyeIcon";

  const iconColorToken =
    state === "disabled" ? "text-kumo-inactive" : "text-kumo-subtle";
  bindIconColor(eyeIcon, iconColorToken);

  inputFrame.appendChild(eyeIcon);
  component.appendChild(inputFrame);

  // Create description or error message (only if withLabel is true)
  if (withLabel && variantConfig.description && variant === "default") {
    const descText = await createTextNode(variantConfig.description, 12, 400);
    descText.name = "Description";
    descText.textAutoResize = "WIDTH_AND_HEIGHT";

    const descVar = getVariableByName(VAR_NAMES.text.subtle);
    if (descVar) {
      bindTextColorToVariable(descText, descVar.id);
    }

    component.appendChild(descText);
  }

  if (withLabel && variantConfig.errorMessage && variant === "error") {
    const errorText = await createTextNode(variantConfig.errorMessage, 12, 400);
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
 * Generate SensitiveInput ComponentSet
 *
 * Creates a "SensitiveInput" ComponentSet with all combinations of:
 * - size: xs, sm, base, lg
 * - variant: default, error
 * - state: default, focus, disabled
 * - mode: masked, revealed
 * - withLabel: false, true
 *
 * Layout:
 * - Rows: size x withLabel combinations (8 rows)
 * - Columns: variant x state x mode combinations (12 columns)
 *
 * Creates both light and dark mode sections.
 */
export async function generateSensitiveInputComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  figma.currentPage = page;

  const components: ComponentNode[] = [];
  const rowLabels: { y: number; text: string }[] = [];
  let columnHeaders: { x: number; text: string }[] = [];

  const componentGapX = 24;
  const componentGapY = 40;
  const headerRowHeight = 24;
  const labelColumnWidth = 220;

  const rowComponents: Map<number, ComponentNode[]> = new Map();

  // Generate components
  // Rows = size x withLabel, Columns = variant x state x mode
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

          for (let mi = 0; mi < MODE_VALUES.length; mi++) {
            const mode = MODE_VALUES[mi];
            const component = await createSensitiveInputComponent(
              size,
              variant,
              state,
              mode,
              withLabel,
            );
            rowComponents.get(rowIndex)!.push(component);
            components.push(component);
          }
        }
      }

      rowIndex++;
    }
  }

  // Calculate column widths and row heights
  const columnWidths: number[] = [];
  const rowHeights: number[] = [];

  const numColumns =
    VARIANT_VALUES.length * STATE_VALUES.length * MODE_VALUES.length;
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

  // Position components
  let yOffset = headerRowHeight;

  let currentRowIndex = 0;
  for (let si2 = 0; si2 < SIZE_VALUES.length; si2++) {
    const sizeValue = SIZE_VALUES[si2];

    for (let wli2 = 0; wli2 < WITH_LABEL_VALUES.length; wli2++) {
      const withLabelValue = WITH_LABEL_VALUES[wli2];
      const row = rowComponents.get(currentRowIndex) || [];
      let xOffset = labelColumnWidth;

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
          const variantIdx = Math.floor(
            colIdx / (STATE_VALUES.length * MODE_VALUES.length),
          );
          const stateIdx = Math.floor(
            (colIdx % (STATE_VALUES.length * MODE_VALUES.length)) /
              MODE_VALUES.length,
          );
          const modeIdx = colIdx % MODE_VALUES.length;
          const variantVal = VARIANT_VALUES[variantIdx];
          const stateVal = STATE_VALUES[stateIdx];
          const modeVal = MODE_VALUES[modeIdx];
          columnHeaders.push({
            x: xOffset,
            text:
              "variant=" +
              variantVal +
              ", state=" +
              stateVal +
              ", mode=" +
              modeVal,
          });
        }

        xOffset += columnWidths[colIdx] + componentGapX;
      }

      yOffset += rowHeights[currentRowIndex] + componentGapY;
      currentRowIndex++;
    }
  }

  // Combine into ComponentSet
  // @ts-ignore
  const componentSet = figma.combineAsVariants(components, page);
  componentSet.name = "SensitiveInput";
  componentSet.description =
    "SensitiveInput component for passwords and API keys. " +
    "Shows masked dots or revealed text with eye toggle.";
  componentSet.layoutMode = "NONE";

  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height + headerRowHeight;

  // Create sections
  const lightSection = createModeSection(page, "SensitiveInput", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2,
  );

  const darkSection = createModeSection(page, "SensitiveInput", "dark");
  darkSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2,
  );

  // Move ComponentSet into light section
  lightSection.frame.appendChild(componentSet);
  componentSet.x = SECTION_PADDING + labelColumnWidth;
  componentSet.y = SECTION_PADDING + headerRowHeight;

  // Add column headers to light section
  await createColumnHeaders(
    columnHeaders.map(function (h) {
      return { x: h.x + SECTION_PADDING, text: h.text };
    }),
    SECTION_PADDING,
    lightSection.frame,
  );

  // Add row labels to light section
  for (let li = 0; li < rowLabels.length; li++) {
    const label = rowLabels[li];
    const labelNode = await createRowLabel(
      label.text,
      SECTION_PADDING,
      SECTION_PADDING + label.y + GRID_LAYOUT.labelVerticalOffset.md,
    );
    lightSection.frame.appendChild(labelNode);
  }

  // Create instances for dark section
  for (let k = 0; k < components.length; k++) {
    const origComp = components[k];
    const instance = origComp.createInstance();
    instance.x = origComp.x + SECTION_PADDING + labelColumnWidth;
    instance.y = origComp.y + SECTION_PADDING + headerRowHeight;
    darkSection.frame.appendChild(instance);
  }

  // Add column headers to dark section
  await createColumnHeaders(
    columnHeaders.map(function (h) {
      return { x: h.x + SECTION_PADDING, text: h.text };
    }),
    SECTION_PADDING,
    darkSection.frame,
  );

  // Add row labels to dark section
  for (let di = 0; di < rowLabels.length; di++) {
    const darkLabel = rowLabels[di];
    const darkLabelNode = await createRowLabel(
      darkLabel.text,
      SECTION_PADDING,
      SECTION_PADDING + darkLabel.y + 8,
    );
    darkSection.frame.appendChild(darkLabelNode);
  }

  // Resize and position sections
  const totalWidth = contentWidth + SECTION_PADDING * 2;
  const totalHeight = contentHeight + SECTION_PADDING * 2;

  lightSection.frame.resize(totalWidth, totalHeight);
  darkSection.frame.resize(totalWidth, totalHeight);

  // Add title inside each frame

  lightSection.frame.x = SECTION_LAYOUT.startX;
  lightSection.frame.y = startY;

  darkSection.frame.x =
    lightSection.frame.x + totalWidth + SECTION_LAYOUT.modeGap;
  darkSection.frame.y = startY;

  logComplete(
    "Generated SensitiveInput ComponentSet with " +
      components.length +
      " variants (light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}

/**
 * Testable exports
 */

/**
 * Get size configuration from Input registry
 */
export function getSensitiveInputSizeConfig() {
  return {
    values: SIZE_VALUES,
    config: SIZE_CONFIG,
    registrySource: "Input.props.size.values",
    registryStyling: inputStyling.dimensions,
  };
}

/**
 * Get variant configuration from Input registry
 */
export function getSensitiveInputVariantConfig() {
  return {
    values: VARIANT_VALUES,
    config: VARIANT_CONFIG,
    registrySource: "Input.props.variant.values",
  };
}

/**
 * Get state configuration (generator-specific)
 */
export function getSensitiveInputStateConfig() {
  return {
    values: STATE_VALUES,
    styles: STATE_STYLES,
  };
}

/**
 * Get mode configuration (SensitiveInput-specific)
 */
export function getSensitiveInputModeConfig() {
  return {
    values: MODE_VALUES,
  };
}

/**
 * Get withLabel configuration (generator-specific)
 */
export function getSensitiveInputWithLabelConfig() {
  return {
    values: WITH_LABEL_VALUES,
  };
}

/**
 * Get computed size dimensions for a specific size
 */
export function getSensitiveInputSizeDimensions(size: string) {
  return SIZE_CONFIG[size] || SIZE_CONFIG["base"];
}

/**
 * Get complete intermediate data
 */
export function getAllSensitiveInputVariantData() {
  return {
    sizeConfig: getSensitiveInputSizeConfig(),
    variantConfig: getSensitiveInputVariantConfig(),
    stateConfig: getSensitiveInputStateConfig(),
    modeConfig: getSensitiveInputModeConfig(),
    withLabelConfig: getSensitiveInputWithLabelConfig(),
    registryMetadata: {
      component: inputComponent.name,
      description: inputComponent.description,
      colors: inputComponent.colors,
    },
  };
}

/**
 * Legacy exports for backward compatibility
 */
export const SENSITIVE_INPUT_SIZE_VALUES = SIZE_VALUES;
export const SENSITIVE_INPUT_VARIANT_VALUES = VARIANT_VALUES;
export const SENSITIVE_INPUT_STATE_VALUES = STATE_VALUES;
export const SENSITIVE_INPUT_MODE_VALUES = MODE_VALUES;
