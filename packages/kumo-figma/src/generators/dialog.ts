/**
 * Dialog Component Generator
 *
 * Generates a Dialog ComponentSet in Figma that matches
 * the Dialog component props:
 *
 * - size: sm, base, lg, xl
 *
 * The Dialog has:
 * - Header with title and close button (X icon)
 * - Description text
 * - Action buttons (Cancel + Primary)
 *
 * Reads styles from component-registry.json (the source of truth).
 * Uses real icons from the Icon Library page.
 *
 * @see packages/kumo/src/components/dialog/dialog.tsx
 */

import {
  createTextNode,
  getVariableByName,
  createModeSection,
  createRowLabel,
  bindFillToVariable,
  bindTextColorToVariable,
  bindStrokeToVariable,
  BORDER_RADIUS,
  SECTION_PADDING,
  SECTION_GAP,
  SECTION_TITLE,
  SHADOWS,
  GRID_LAYOUT,
  SECTION_LAYOUT,
  FONT_SIZE,
  FALLBACK_VALUES,
  SPACING,
  VAR_NAMES,
} from "./shared";
import { getButtonIcon, bindIconColor } from "./icon-utils";
import registry from "@cloudflare/kumo/ai/component-registry.json";
import { logComplete } from "../logger";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import themeData from "../generated/theme-data.json";

/**
 * Extract props from registry
 */
const dialogProps = (registry as any).components.Dialog.props;
const sizeProp = dialogProps.size as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

/**
 * Size values from registry
 */
const SIZE_VALUES = sizeProp.values;

/**
 * Parse width from registry size classes
 * Extracts minWidth from Tailwind classes like "min-w-96" or "min-w-[32rem]"
 * Falls back to hardcoded value if parsing fails
 */
function parseDialogWidth(size: string, fallbackWidth: number): number {
  const classes = sizeProp.classes[size];
  if (!classes) return fallbackWidth;

  const parsed = parseTailwindClasses(classes);
  return parsed.minWidth !== undefined ? parsed.minWidth : fallbackWidth;
}

/**
 * Size-specific configuration
 * Maps size to width, title font size, description font size, padding
 * Widths are derived from registry classes where possible
 * Typography and spacing use centralized constants from shared.ts
 */
const SIZE_CONFIG: Record<
  string,
  {
    width: number;
    titleSize: number;
    titleWeight: number;
    descSize: number;
    padding: number;
    gap: number;
    buttonSize: "sm" | "base";
  }
> = {
  sm: {
    width: parseDialogWidth("sm", 288), // min-w-72 = 288px (fallback)
    titleSize: FONT_SIZE.lg, // 20px
    titleWeight: FALLBACK_VALUES.fontWeight.semiBold, // 600
    descSize: FONT_SIZE.base, // 16px
    padding: FALLBACK_VALUES.padding.standard, // 16px
    gap: SPACING.base, // 8px
    buttonSize: "sm",
  },
  base: {
    width: parseDialogWidth("base", 384), // min-w-96 = 384px (fallback)
    titleSize: FONT_SIZE.lg, // 20px
    titleWeight: FALLBACK_VALUES.fontWeight.semiBold, // 600
    descSize: FONT_SIZE.base, // 16px
    padding: FALLBACK_VALUES.padding.large, // 24px
    gap: FALLBACK_VALUES.gap.large, // 16px
    buttonSize: "base",
  },
  lg: {
    width: parseDialogWidth("lg", 512), // min-w-[32rem] = 512px (fallback)
    titleSize: FONT_SIZE.lg, // 20px
    titleWeight: FALLBACK_VALUES.fontWeight.semiBold, // 600
    descSize: FONT_SIZE.base, // 16px
    padding: FALLBACK_VALUES.padding.large, // 24px
    gap: FALLBACK_VALUES.gap.large, // 16px
    buttonSize: "base",
  },
  xl: {
    width: parseDialogWidth("xl", 768), // min-w-[48rem] = 768px (fallback)
    titleSize: FONT_SIZE.lg, // 20px
    titleWeight: FALLBACK_VALUES.fontWeight.semiBold, // 600
    descSize: FONT_SIZE.base, // 16px
    padding: FALLBACK_VALUES.padding.large, // 24px
    gap: FALLBACK_VALUES.gap.large, // 16px
    buttonSize: "base",
  },
};

/**
 * Create a button frame for dialog actions
 *
 * @param label - Button label text
 * @param isPrimary - Whether this is the primary action button
 * @param size - Button size (sm or base)
 * @returns FrameNode for the button
 */
async function createButton(
  label: string,
  isPrimary: boolean,
  size: "sm" | "base",
): Promise<FrameNode> {
  const button = figma.createFrame();
  button.name = isPrimary ? "Primary Button" : "Secondary Button";
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.primaryAxisSizingMode = "AUTO";
  button.counterAxisSizingMode = "AUTO";

  // Size-specific dimensions (derived from Button component styling)
  if (size === "sm") {
    button.paddingLeft = FALLBACK_VALUES.padding.horizontal; // px-3 = 12px
    button.paddingRight = FALLBACK_VALUES.padding.horizontal;
    button.paddingTop = SPACING.base; // py-2 = 8px
    button.paddingBottom = SPACING.base;
    // FIGMA-SPECIFIC: Minimum button width for visual balance in dialog footer layout
    button.minWidth = 70;
  } else {
    button.paddingLeft = FALLBACK_VALUES.padding.large; // px-4 = 16px (base size)
    button.paddingRight = FALLBACK_VALUES.padding.large;
    button.paddingTop = SPACING.base; // py-2 = 8px
    button.paddingBottom = SPACING.base;
    // FIGMA-SPECIFIC: Minimum button width for visual balance in dialog footer layout
    button.minWidth = 100;
  }

  button.itemSpacing = size === "sm" ? SPACING.xs : SPACING.base; // gap-1 : gap-2
  button.cornerRadius = BORDER_RADIUS.md;

  if (isPrimary) {
    // Primary button: bg-kumo-brand text-white
    const primaryBgVar = getVariableByName(VAR_NAMES.color.brand);
    if (primaryBgVar) {
      bindFillToVariable(button, primaryBgVar.id);
    }
  } else {
    // Secondary button: bg-transparent border-kumo-line
    button.fills = [];
    const borderVar = getVariableByName(VAR_NAMES.color.line);
    if (borderVar) {
      bindStrokeToVariable(button, borderVar.id, 1);
    }
  }

  // Create button label
  // For sm buttons, use Tailwind's text-sm (14px) rather than Kumo's 13px override
  const fontSize =
    size === "sm" ? themeData.tailwind.fontSize.sm : FONT_SIZE.base; // 14px (sm) or 14px (base)
  const buttonLabel = await createTextNode(
    label,
    fontSize,
    FALLBACK_VALUES.fontWeight.semiBold,
  );
  buttonLabel.name = "Label";
  buttonLabel.textAutoResize = "WIDTH_AND_HEIGHT";

  if (isPrimary) {
    // White text for primary
    buttonLabel.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  } else {
    // text-kumo-default for secondary
    const textVar = getVariableByName(VAR_NAMES.text.default);
    if (textVar) {
      bindTextColorToVariable(buttonLabel, textVar.id);
    }
  }

  button.appendChild(buttonLabel);
  return button;
}

/**
 * Create a single Dialog component variant
 *
 * @param size - Size variant (sm, base, lg, xl)
 * @returns ComponentNode for the dialog
 */
async function createDialogComponent(size: string): Promise<ComponentNode> {
  // Get size config
  const config = SIZE_CONFIG[size] || SIZE_CONFIG["base"];

  // Create component
  const component = figma.createComponent();
  component.name = "size=" + size;
  component.description =
    sizeProp.descriptions[size] || "Dialog " + size + " variant";

  // Set up vertical auto-layout
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "FIXED";
  component.resize(config.width, 100); // Height will auto-adjust
  component.itemSpacing = config.gap;
  component.paddingLeft = config.padding;
  component.paddingRight = config.padding;
  component.paddingTop = config.padding;
  component.paddingBottom = config.padding;
  component.cornerRadius = BORDER_RADIUS.lg; // rounded-lg = 8px

  // Apply background fill (bg-kumo-base)
  const bgVar = getVariableByName(VAR_NAMES.color.base);
  if (bgVar) {
    bindFillToVariable(component, bgVar.id);
  }

  // Apply shadow effect using centralized shadow preset
  component.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: SHADOWS.dialog.opacity },
      offset: { x: SHADOWS.dialog.offsetX, y: SHADOWS.dialog.offsetY },
      radius: SHADOWS.dialog.blur,
      spread: SHADOWS.dialog.spread,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  // Create header frame (title + close button)
  // Header must fill width so SPACE_BETWEEN pushes X to the right
  const header = figma.createFrame();
  header.name = "Header";
  header.layoutMode = "HORIZONTAL";
  header.primaryAxisAlignItems = "SPACE_BETWEEN";
  header.counterAxisAlignItems = "CENTER";
  header.primaryAxisSizingMode = "FIXED";
  header.counterAxisSizingMode = "AUTO";
  header.resize(config.width - config.padding * 2, GRID_LAYOUT.headerRowHeight); // Full width minus padding
  header.layoutAlign = "STRETCH";
  header.layoutGrow = 0;
  header.fills = [];
  header.itemSpacing = SPACING.base; // gap-2 = 8px

  // Create title text
  const title = await createTextNode(
    "Dialog Title",
    config.titleSize,
    config.titleWeight,
  );
  title.name = "Title";
  title.textAutoResize = "WIDTH_AND_HEIGHT";
  title.layoutGrow = 1;

  // Apply title text color (text-kumo-default)
  const titleVar = getVariableByName(VAR_NAMES.text.default);
  if (titleVar) {
    bindTextColorToVariable(title, titleVar.id);
  }

  header.appendChild(title);

  // Create close icon (ph-x) - 20x20 directly in header
  // Color is text-kumo-subtle to match code: className="text-kumo-subtle hover:text-kumo-default"
  const closeIconName = "ph-x";
  const closeIcon = getButtonIcon(closeIconName, "base");
  closeIcon.name = "Close";

  // Apply icon color (text-kumo-subtle to match code)
  bindIconColor(closeIcon, "text-kumo-subtle");

  header.appendChild(closeIcon);
  component.appendChild(header);

  // Create description text
  const description = await createTextNode(
    "This is a dialog description with some content explaining the purpose of this dialog.",
    config.descSize,
    FALLBACK_VALUES.fontWeight.normal, // 400
  );
  description.name = "Description";
  description.textAutoResize = "HEIGHT";
  description.layoutAlign = "STRETCH";
  description.resize(config.width - config.padding * 2, description.height);

  // Apply description text color (text-kumo-subtle)
  const descVar = getVariableByName(VAR_NAMES.text.subtle);
  if (descVar) {
    bindTextColorToVariable(description, descVar.id);
  }

  component.appendChild(description);

  // Create actions frame (buttons)
  const actions = figma.createFrame();
  actions.name = "Actions";
  actions.layoutMode = "HORIZONTAL";
  actions.primaryAxisAlignItems = "MAX"; // Right-align buttons
  actions.counterAxisAlignItems = "CENTER";
  actions.primaryAxisSizingMode = "AUTO";
  actions.counterAxisSizingMode = "AUTO";
  actions.layoutAlign = "STRETCH";
  actions.layoutGrow = 0;
  actions.fills = [];
  actions.itemSpacing = SPACING.lg; // gap-3 = 12px

  // Create Cancel button (secondary)
  const cancelButton = await createButton("Cancel", false, config.buttonSize);
  actions.appendChild(cancelButton);

  // Create primary action button
  const primaryButton = await createButton("Confirm", true, config.buttonSize);
  actions.appendChild(primaryButton);

  component.appendChild(actions);

  return component;
}

/**
 * Generate Dialog ComponentSet with size property
 *
 * Creates a "Dialog" ComponentSet with all size variants:
 * - sm, base, lg, xl
 *
 * Creates both light and dark mode sections.
 *
 * @param page - The page to add components to
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateDialogComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  figma.currentPage = page;

  // Generate all size variants
  const components: ComponentNode[] = [];

  // Track row labels: { y, text }
  const rowLabels: { y: number; text: string }[] = [];

  // Layout spacing
  const componentGapY = GRID_LAYOUT.rowGap.medium;
  const labelColumnWidth = GRID_LAYOUT.labelColumnWidth.compact;

  // Track layout
  let yOffset = 0;
  let maxWidth = 0;

  // Generate components for each size
  for (let i = 0; i < SIZE_VALUES.length; i++) {
    const size = SIZE_VALUES[i];
    const component = await createDialogComponent(size);

    // Position component
    component.x = labelColumnWidth;
    component.y = yOffset;

    // Record row label
    rowLabels.push({
      y: yOffset,
      text: "size=" + size,
    });

    // Track max width
    if (component.width > maxWidth) {
      maxWidth = component.width;
    }

    // Update y offset for next component
    yOffset += component.height + componentGapY;

    components.push(component);
  }

  // Combine all variants into a single ComponentSet
  // @ts-ignore - combineAsVariants works at runtime
  const componentSet = figma.combineAsVariants(components, page);
  componentSet.name = "Dialog";
  componentSet.description =
    "Dialog component with size variants. " +
    "Use for modal dialogs, confirmations, and forms.";
  componentSet.layoutMode = "NONE";

  // Calculate content dimensions
  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height;

  // Add contentYOffset for title space inside frame
  const contentYOffset = SECTION_TITLE.height;

  // Create light mode section
  const lightSection = createModeSection(page, "Dialog", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Create dark mode section
  const darkSection = createModeSection(page, "Dialog", "dark");
  darkSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Move ComponentSet into light section frame
  lightSection.frame.appendChild(componentSet);
  componentSet.x = SECTION_PADDING + labelColumnWidth;
  componentSet.y = SECTION_PADDING + contentYOffset;

  // Add section titles inside frames

  // Add row labels to light section
  for (let li = 0; li < rowLabels.length; li++) {
    const label = rowLabels[li];
    const labelNode = await createRowLabel(
      label.text,
      SECTION_PADDING,
      SECTION_PADDING +
        contentYOffset +
        label.y +
        GRID_LAYOUT.labelVerticalOffset.lg, // Center label for dialog
    );
    lightSection.frame.appendChild(labelNode);
  }

  // Create instances for dark section
  for (let k = 0; k < components.length; k++) {
    const origComp = components[k];
    const instance = origComp.createInstance();
    instance.x = origComp.x + SECTION_PADDING + labelColumnWidth;
    instance.y = origComp.y + SECTION_PADDING + contentYOffset;
    darkSection.frame.appendChild(instance);
  }

  // Add row labels to dark section
  for (let di = 0; di < rowLabels.length; di++) {
    const darkLabel = rowLabels[di];
    const darkLabelNode = await createRowLabel(
      darkLabel.text,
      SECTION_PADDING,
      SECTION_PADDING +
        contentYOffset +
        darkLabel.y +
        GRID_LAYOUT.labelVerticalOffset.lg, // Center label for dialog
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
    "Generated Dialog ComponentSet with " +
      components.length +
      " variants (light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}

/**
 * Testable export functions for test suite
 */

/**
 * Get size-specific configuration for a given size
 * @param size - Size variant (sm, base, lg, xl)
 * @returns Size configuration object
 */
export function getSizeConfig(size: string) {
  return SIZE_CONFIG[size] || SIZE_CONFIG["base"];
}

/**
 * Get base configuration for dialog components
 * @returns Base configuration object with tokens, border radius, shadow
 *
 * Uses centralized constants from shared.ts:
 * - BORDER_RADIUS.xl (12px) for dialog corners
 * - FALLBACK_VALUES.fontWeight.semiBold/normal for text weights
 * - FALLBACK_VALUES.iconSize.base (20px) for close icon
 */
export function getBaseConfig() {
  return {
    background: VAR_NAMES.color.base,
    text: VAR_NAMES.text.default,
    borderRadius: BORDER_RADIUS.xl,
    shadow: "shadow-m",
    backdrop: {
      background: VAR_NAMES.color.overlay,
      opacity: 0.8,
    },
    header: {
      title: {
        fontWeight: FALLBACK_VALUES.fontWeight.semiBold,
        color: VAR_NAMES.text.default,
      },
      closeIcon: {
        name: "ph-x",
        size: FALLBACK_VALUES.iconSize.base,
        color: VAR_NAMES.text.subtle,
      },
    },
    description: {
      fontWeight: FALLBACK_VALUES.fontWeight.normal,
      color: VAR_NAMES.text.subtle,
    },
    buttons: {
      primary: { background: VAR_NAMES.color.brand, text: "white" },
      secondary: { ring: VAR_NAMES.color.line, text: VAR_NAMES.text.default },
    },
  };
}

/**
 * Get complete variant data for all dialog sizes
 * @returns Complete variant data structure with all sizes and configurations
 */
export function getAllVariantData() {
  const baseConfig = getBaseConfig();

  const variants = SIZE_VALUES.map((size) => {
    const config = getSizeConfig(size);
    return {
      size: size,
      description: sizeProp.descriptions[size] || "Dialog " + size + " variant",
      config: config,
      classes: sizeProp.classes[size],
    };
  });

  return {
    baseConfig: baseConfig,
    sizeConfig: SIZE_CONFIG,
    variants: variants,
    sizeValues: SIZE_VALUES,
  };
}

/**
 * Exports for tests and backwards compatibility
 */
export const DIALOG_SIZE_VALUES = SIZE_VALUES;
