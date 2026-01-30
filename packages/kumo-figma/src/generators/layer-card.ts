/**
 * LayerCard Component Generator
 *
 * Generates a LayerCard ComponentSet in Figma that matches
 * the LayerCard component structure:
 *
 * - LayerCard (root): Container
 * - LayerCard.Secondary: Header section
 * - LayerCard.Primary: Main content area
 *
 * LayerCard has no variants - it's a single compound component style.
 *
 * @see packages/kumo/src/components/layer-card/layer-card.tsx
 */

import {
  createTextNode,
  getVariableByName,
  createModeSection,
  createRowLabel,
  bindFillToVariable,
  bindStrokeToVariable,
  bindTextColorToVariable,
  BORDER_RADIUS,
  FONT_SIZE,
  FALLBACK_VALUES,
  GRID_LAYOUT,
  SECTION_PADDING,
  SECTION_GAP,
  SECTION_LAYOUT,
  SECTION_TITLE,
  VAR_NAMES,
} from "./shared";
import { createIconInstance, bindIconColor, DEFAULT_ICONS } from "./icon-utils";
import registry from "@cloudflare/kumo/ai/component-registry.json";
import themeData from "../generated/theme-data.json";

// Read LayerCard styling from registry
const layerCardStyling = (registry.components.LayerCard as any).styling;

/**
 * LayerCard dimensions
 *
 * Now reads from registry.components.LayerCard.styling
 * with fallback to hardcoded values for backward compatibility.
 */
const FALLBACK_LAYER_CARD_CONFIG = {
  // FIGMA-SPECIFIC: Layout width for Figma canvas display, not from CSS
  width: 280,
  borderRadius: BORDER_RADIUS.lg, // 8px
  secondary: {
    paddingX: themeData.tailwind.spacing.scale["2"], // 8px
    paddingY: themeData.tailwind.spacing.scale["2"], // 8px
    gap: themeData.tailwind.spacing.scale["2"], // 8px
    fontSize: FONT_SIZE.lg, // 16px from theme-kumo.css
    fontWeight: FALLBACK_VALUES.fontWeight.medium, // 500
  },
  primary: {
    paddingX: themeData.tailwind.spacing.scale["4"], // 16px
    paddingY: themeData.tailwind.spacing.scale["4"], // 16px
    paddingRight: themeData.tailwind.spacing.scale["3"], // 12px
    gap: themeData.tailwind.spacing.scale["2"], // 8px
    fontSize: FONT_SIZE.lg, // 16px from theme-kumo.css
    fontWeight: FALLBACK_VALUES.fontWeight.normal, // 400
    borderRadius: BORDER_RADIUS.lg, // 8px
  },
};

/**
 * Get LayerCard configuration from registry with fallback
 */
function getConfigFromRegistry() {
  if (!layerCardStyling) return FALLBACK_LAYER_CARD_CONFIG;

  return {
    width:
      layerCardStyling.container?.width || FALLBACK_LAYER_CARD_CONFIG.width,
    borderRadius:
      layerCardStyling.container?.borderRadius ||
      FALLBACK_LAYER_CARD_CONFIG.borderRadius,
    secondary: {
      paddingX:
        layerCardStyling.secondary?.paddingX ||
        FALLBACK_LAYER_CARD_CONFIG.secondary.paddingX,
      paddingY:
        layerCardStyling.secondary?.paddingY ||
        FALLBACK_LAYER_CARD_CONFIG.secondary.paddingY,
      gap:
        layerCardStyling.secondary?.gap ||
        FALLBACK_LAYER_CARD_CONFIG.secondary.gap,
      fontSize:
        layerCardStyling.secondary?.fontSize ||
        FALLBACK_LAYER_CARD_CONFIG.secondary.fontSize,
      fontWeight:
        layerCardStyling.secondary?.fontWeight ||
        FALLBACK_LAYER_CARD_CONFIG.secondary.fontWeight,
    },
    primary: {
      paddingX:
        layerCardStyling.primary?.paddingX ||
        FALLBACK_LAYER_CARD_CONFIG.primary.paddingX,
      paddingY:
        layerCardStyling.primary?.paddingY ||
        FALLBACK_LAYER_CARD_CONFIG.primary.paddingY,
      paddingRight:
        layerCardStyling.primary?.paddingRight ||
        FALLBACK_LAYER_CARD_CONFIG.primary.paddingRight,
      gap:
        layerCardStyling.primary?.gap || FALLBACK_LAYER_CARD_CONFIG.primary.gap,
      fontSize:
        layerCardStyling.primary?.fontSize ||
        FALLBACK_LAYER_CARD_CONFIG.primary.fontSize,
      fontWeight:
        layerCardStyling.primary?.fontWeight ||
        FALLBACK_LAYER_CARD_CONFIG.primary.fontWeight,
      borderRadius:
        layerCardStyling.primary?.borderRadius ||
        FALLBACK_LAYER_CARD_CONFIG.primary.borderRadius,
    },
  };
}

const LAYER_CARD_CONFIG = getConfigFromRegistry();

/**
 * Create a single LayerCard component
 *
 * Structure:
 * - Root frame (bg-surface-2, ring-kumo-line)
 *   - Secondary frame (header with text-kumo-strong)
 *   - Primary frame (bg-surface, ring-kumo-fill)
 *
 * @returns ComponentNode for the LayerCard
 */
async function createLayerCardComponent(): Promise<ComponentNode> {
  console.log("LayerCard: Creating component...");
  const config = LAYER_CARD_CONFIG;

  // Create component
  const component = figma.createComponent();
  console.log("LayerCard: Component created");
  component.name = "default";
  component.description =
    "LayerCard - A layered card component with secondary header and primary content area";

  // Set up vertical auto-layout for root
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "FIXED";
  // Set width directly - height will auto-size from children
  component.resizeWithoutConstraints(config.width, 100);
  component.itemSpacing = 0;
  component.cornerRadius = config.borderRadius;

  // Apply root background (bg-kumo-elevated)
  const rootBgVar = getVariableByName(VAR_NAMES.color.elevated);
  if (rootBgVar) {
    bindFillToVariable(component, rootBgVar.id);
  } else {
    console.log(
      "LayerCard: color-kumo-elevated variable not found, using fallback",
    );
    // Fallback to surface variable
    const fallbackBgVar = getVariableByName(VAR_NAMES.color.base);
    if (fallbackBgVar) {
      bindFillToVariable(component, fallbackBgVar.id);
    }
  }

  // Apply root ring (ring-kumo-line)
  const rootRingVar = getVariableByName(VAR_NAMES.color.line);
  if (rootRingVar) {
    bindStrokeToVariable(component, rootRingVar.id, 1);
  }

  // Create Secondary section (header)
  const secondaryFrame = figma.createFrame();
  secondaryFrame.name = "Secondary";
  secondaryFrame.layoutMode = "HORIZONTAL";
  // Use SPACE_BETWEEN to push icon to the right (like justify-between in CSS)
  secondaryFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
  secondaryFrame.counterAxisAlignItems = "CENTER";
  // Note: layoutSizingHorizontal = "FILL" must be set AFTER appending to auto-layout parent
  secondaryFrame.primaryAxisSizingMode = "FIXED";
  secondaryFrame.counterAxisSizingMode = "AUTO";
  secondaryFrame.paddingLeft = config.secondary.paddingX;
  secondaryFrame.paddingRight = config.secondary.paddingX;
  secondaryFrame.paddingTop = config.secondary.paddingY;
  secondaryFrame.paddingBottom = config.secondary.paddingY;
  secondaryFrame.itemSpacing = config.secondary.gap;
  secondaryFrame.fills = [];

  // Secondary text
  console.log("LayerCard: Creating secondary text...");
  const secondaryText = await createTextNode(
    "Next Steps",
    config.secondary.fontSize,
    config.secondary.fontWeight,
  );
  console.log("LayerCard: Secondary text created");
  secondaryText.name = "Title";
  secondaryText.textAutoResize = "WIDTH_AND_HEIGHT";

  const secondaryTextVar = getVariableByName(VAR_NAMES.text.strong);
  if (secondaryTextVar) {
    bindTextColorToVariable(secondaryText, secondaryTextVar.id);
  }

  // Create arrow icon button (ghost button with arrow-right icon)
  const iconButtonFrame = figma.createFrame();
  iconButtonFrame.name = "Action Button";
  iconButtonFrame.layoutMode = "HORIZONTAL";
  iconButtonFrame.primaryAxisAlignItems = "CENTER";
  iconButtonFrame.counterAxisAlignItems = "CENTER";
  iconButtonFrame.resize(28, 28); // sm size button
  iconButtonFrame.cornerRadius = 4;
  iconButtonFrame.fills = []; // Ghost button has no background

  // Create arrow-right icon
  const arrowIcon = createIconInstance(DEFAULT_ICONS.arrowRight, 16);
  if (arrowIcon) {
    arrowIcon.name = "Icon";
    // Bind icon color to text-kumo-strong (same as the title text)
    bindIconColor(arrowIcon, "text-kumo-strong");
    iconButtonFrame.appendChild(arrowIcon);
  } else {
    // Fallback: create a simple arrow placeholder if icon library not generated
    console.log("LayerCard: Arrow icon not found, using placeholder");
    const arrowPlaceholder = figma.createFrame();
    arrowPlaceholder.name = "Arrow Placeholder";
    arrowPlaceholder.resize(16, 16);
    arrowPlaceholder.fills = [];
    const arrowBorderVar = getVariableByName(VAR_NAMES.color.line);
    if (arrowBorderVar) {
      bindStrokeToVariable(arrowPlaceholder, arrowBorderVar.id, 1);
    }
    iconButtonFrame.appendChild(arrowPlaceholder);
  }

  secondaryFrame.appendChild(secondaryText);
  secondaryFrame.appendChild(iconButtonFrame);
  // Append to parent FIRST, then set FILL sizing
  component.appendChild(secondaryFrame);
  secondaryFrame.layoutSizingHorizontal = "FILL";

  // Create Primary section (main content)
  const primaryFrame = figma.createFrame();
  primaryFrame.name = "Primary";
  primaryFrame.layoutMode = "VERTICAL";
  primaryFrame.primaryAxisAlignItems = "MIN";
  primaryFrame.counterAxisAlignItems = "MIN";
  // Note: layoutSizingHorizontal = "FILL" must be set AFTER appending to auto-layout parent
  primaryFrame.primaryAxisSizingMode = "AUTO";
  primaryFrame.counterAxisSizingMode = "AUTO";
  primaryFrame.paddingLeft = config.primary.paddingX;
  primaryFrame.paddingRight = config.primary.paddingRight;
  primaryFrame.paddingTop = config.primary.paddingY;
  primaryFrame.paddingBottom = config.primary.paddingY;
  primaryFrame.itemSpacing = config.primary.gap;
  primaryFrame.cornerRadius = config.primary.borderRadius;

  // Apply primary background (bg-kumo-base)
  // Fallback to color-surface if color-surface doesn't exist
  let primaryBgVar = getVariableByName(VAR_NAMES.color.base);
  if (!primaryBgVar) {
    primaryBgVar = getVariableByName(VAR_NAMES.color.base);
  }
  if (primaryBgVar) {
    bindFillToVariable(primaryFrame, primaryBgVar.id);
  }

  // Apply primary ring (ring-kumo-fill)
  const primaryRingVar = getVariableByName(VAR_NAMES.color.fill);
  if (primaryRingVar) {
    bindStrokeToVariable(primaryFrame, primaryRingVar.id, 1);
  } else {
    console.log("LayerCard: No ring variable found for primary section");
  }

  // Primary text content
  console.log("LayerCard: Creating primary text...");
  const primaryText = await createTextNode(
    "Get started with Kumo",
    config.primary.fontSize,
    config.primary.fontWeight,
  );
  console.log("LayerCard: Primary text created");
  primaryText.name = "Content";
  primaryText.textAutoResize = "WIDTH_AND_HEIGHT";

  const primaryTextVar = getVariableByName(VAR_NAMES.text.default);
  if (primaryTextVar) {
    bindTextColorToVariable(primaryText, primaryTextVar.id);
  }

  primaryFrame.appendChild(primaryText);
  // Append to parent FIRST, then set FILL sizing
  component.appendChild(primaryFrame);
  primaryFrame.layoutSizingHorizontal = "FILL";

  console.log("LayerCard: Component assembly complete");
  return component;
}

/**
 * Generate LayerCard ComponentSet
 *
 * Creates a "LayerCard" ComponentSet with the compound component structure.
 * LayerCard has no variants - it's a single style.
 *
 * Creates both light and dark mode sections.
 *
 * @param page - The page to add components to
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateLayerCardComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  console.log("LayerCard: Starting generation at Y=" + startY);

  try {
    figma.currentPage = page;

    // Generate single component (no variants)
    const components: ComponentNode[] = [];
    const rowLabels: { y: number; text: string }[] = [];

    const labelColumnWidth = 160;

    console.log("LayerCard: Calling createLayerCardComponent...");
    const component = await createLayerCardComponent();
    console.log("LayerCard: Component returned, setting position...");
    component.x = labelColumnWidth; // Position after label column
    component.y = 0;
    rowLabels.push({ y: 0, text: "LayerCard" });
    components.push(component);

    console.log("LayerCard: Combining as variants...");
    // Combine into ComponentSet (even with single variant for consistency)
    // @ts-ignore - combineAsVariants works at runtime
    const componentSet = figma.combineAsVariants(components, page);
    console.log("LayerCard: ComponentSet created");
    componentSet.name = "LayerCard";
    componentSet.description =
      "LayerCard - A layered card component with Secondary (header) and Primary (content) sections. " +
      "Use LayerCard.Secondary for the header area and LayerCard.Primary for the main content.";
    componentSet.layoutMode = "NONE";

    // Calculate content dimensions
    const contentWidth = componentSet.width + labelColumnWidth;
    const contentHeight = componentSet.height;

    // Add contentYOffset for title space inside frame
    const contentYOffset = SECTION_TITLE.height;

    // Create light mode section
    const lightSection = createModeSection(page, "LayerCard", "light");
    lightSection.frame.resize(
      contentWidth + SECTION_PADDING * 2,
      contentHeight + SECTION_PADDING * 2 + contentYOffset,
    );

    // Create dark mode section
    const darkSection = createModeSection(page, "LayerCard", "dark");
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
          GRID_LAYOUT.labelVerticalOffset.md,
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

    console.log("Generated LayerCard ComponentSet (light + dark)");
    console.log(
      "LayerCard dimensions: " +
        totalWidth +
        "x" +
        totalHeight +
        " at Y=" +
        startY,
    );

    return startY + totalHeight + SECTION_GAP;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("LayerCard generation failed: " + errorMessage);
    console.error("Stack: " + errorStack);
    throw error;
  }
}

// ============================================================================
// TESTABLE EXPORTS
// ============================================================================

/**
 * Get LayerCard dimensions configuration
 *
 * Returns the layout dimensions for the LayerCard component including
 * dimensions for both Secondary (header) and Primary (content) sections.
 */
export function getLayerCardDimensionsConfig() {
  return LAYER_CARD_CONFIG;
}

/**
 * Get LayerCard color bindings
 *
 * Returns the semantic color tokens used for LayerCard styling.
 * Includes color bindings for root, secondary, and primary sections.
 */
export function getLayerCardColorBindings() {
  return {
    root: {
      background: VAR_NAMES.color.control,
      backgroundFallback: VAR_NAMES.color.base,
      border: VAR_NAMES.color.line,
    },
    secondary: {
      text: VAR_NAMES.text.strong,
    },
    primary: {
      background: VAR_NAMES.color.base,
      backgroundFallback: VAR_NAMES.color.base,
      border: VAR_NAMES.color.fill,
      borderFallback: VAR_NAMES.color.line,
      text: VAR_NAMES.text.default,
    },
  };
}

/**
 * Get LayerCard sub-component configuration
 *
 * Returns metadata about the Secondary and Primary sub-components.
 */
export function getLayerCardSubComponentConfig() {
  const layerCardComponent = registry.components.LayerCard;
  return {
    subComponents: layerCardComponent.subComponents || {},
    hasSubComponents:
      Object.keys(layerCardComponent.subComponents || {}).length > 0,
  };
}

/**
 * Get LayerCard content configuration
 *
 * Returns the text content used in the LayerCard example.
 */
export function getLayerCardContentConfig() {
  return {
    secondary: {
      title: "Next Steps",
      iconName: "arrow-right",
      iconSize: 16,
    },
    primary: {
      content: "Get started with Kumo",
    },
  };
}

/**
 * Get all LayerCard data
 *
 * Returns complete intermediate data structure for the LayerCard component.
 * This is used for snapshot testing to catch unintended changes.
 */
export function getAllLayerCardData() {
  const dimensions = getLayerCardDimensionsConfig();
  const colorBindings = getLayerCardColorBindings();
  const subComponentConfig = getLayerCardSubComponentConfig();
  const contentConfig = getLayerCardContentConfig();

  return {
    dimensions: dimensions,
    colorBindings: colorBindings,
    subComponents: subComponentConfig,
    content: contentConfig,
  };
}
