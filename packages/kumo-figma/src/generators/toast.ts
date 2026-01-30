/**
 * Toast Component Generator
 *
 * Generates a Toast ComponentSet in Figma that matches
 * the Toast component styling:
 *
 * - Static visual representation of an open toast notification
 * - Title + Description + Close button layout
 * - No variants (single appearance)
 *
 * The Toast has:
 * - Container with bg-secondary, border-color, rounded-lg, shadow-lg
 * - Title text (text-surface, font-medium)
 * - Description text (text-kumo-subtle)
 * - Close button with X icon (text-kumo-subtle)
 *
 * Reads styles from component-registry.json (the source of truth).
 * Uses real icons from the Icon Library page.
 *
 * @see packages/kumo/src/components/toast/toast.tsx
 */

import {
  createTextNode,
  getVariableByName,
  createModeSection,
  bindFillToVariable,
  bindTextColorToVariable,
  bindStrokeToVariable,
  BORDER_RADIUS,
  SECTION_PADDING,
  SECTION_GAP,
  SECTION_LAYOUT,
  SHADOWS,
  SPACING,
  FALLBACK_VALUES,
  VAR_NAMES,
} from "./shared";
import themeData from "../generated/theme-data.json";
import { getButtonIcon, bindIconColor } from "./icon-utils";
import { logComplete } from "../logger";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

// Type for registry styling
const toastStyling = (registry.components as any).Toasty?.styling;

/**
 * Fallback config using theme-data.json values to prevent drift
 * Typography uses Tailwind fontSize values
 * Spacing uses Tailwind spacing scale
 */
const FALLBACK_TOAST_CONFIG = {
  // FIGMA-SPECIFIC: Fixed width for Figma canvas rendering
  // React component uses sm:w-[300px] which is viewport-responsive
  // This is intentionally hardcoded as there's no Tailwind token for arbitrary values
  width: 300,
  titleFontSize: themeData.tailwind.fontSize.base, // text-base = 16px
  titleFontWeight: FALLBACK_VALUES.fontWeight.medium, // font-medium = 500
  // COMPONENT-SPECIFIC: text-[0.925rem] = ~14.8px is a custom arbitrary value in toast.tsx
  // Using 15px as closest integer approximation (0.925 * 16 = 14.8)
  // This cannot be derived from Tailwind tokens as it's an arbitrary value
  descriptionFontSize: 15,
  descriptionFontWeight: FALLBACK_VALUES.fontWeight.normal, // font-normal = 400
  closeButtonSize: themeData.tailwind.spacing.scale["5"], // h-5 w-5 = 20px
  closeButtonIconSize: themeData.tailwind.spacing.scale["4"], // size-4 = 16px
};

/**
 * Read Toast configuration from registry with fallback
 */
function getToastConfigFromRegistry() {
  if (!toastStyling) {
    return FALLBACK_TOAST_CONFIG;
  }

  return {
    width: toastStyling.container?.width ?? FALLBACK_TOAST_CONFIG.width,
    titleFontSize:
      toastStyling.title?.fontSize ?? FALLBACK_TOAST_CONFIG.titleFontSize,
    titleFontWeight:
      toastStyling.title?.fontWeight ?? FALLBACK_TOAST_CONFIG.titleFontWeight,
    descriptionFontSize:
      toastStyling.description?.fontSize ??
      FALLBACK_TOAST_CONFIG.descriptionFontSize,
    descriptionFontWeight:
      toastStyling.description?.fontWeight ??
      FALLBACK_TOAST_CONFIG.descriptionFontWeight,
    closeButtonSize:
      toastStyling.closeButton?.size ?? FALLBACK_TOAST_CONFIG.closeButtonSize,
    closeButtonIconSize:
      toastStyling.closeButton?.iconSize ??
      FALLBACK_TOAST_CONFIG.closeButtonIconSize,
  };
}

const TOAST_CONFIG = getToastConfigFromRegistry();

/**
 * Toast dimensions (matches sm:w-[300px] from viewport)
 * Now reads from registry via TOAST_CONFIG
 */
const TOAST_WIDTH = TOAST_CONFIG.width;

/**
 * Create a single Toast component
 *
 * Layout structure:
 * - Component (vertical auto-layout)
 *   - Header (horizontal: title + spacer + close button)
 *   - Description
 *
 * @returns ComponentNode for the toast
 */
async function createToastComponent(): Promise<ComponentNode> {
  // Create component
  const component = figma.createComponent();
  component.name = "Toast";
  component.description = "Toast notification component for transient messages";

  // Set up vertical auto-layout
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "FIXED";
  component.resize(TOAST_WIDTH, 100); // Height will auto-adjust
  component.itemSpacing = SPACING.xs; // gap-1 = 4px, small gap between header and description
  component.paddingLeft = themeData.tailwind.spacing.scale["4"]; // p-4 = 16px
  component.paddingRight = themeData.tailwind.spacing.scale["4"];
  component.paddingTop = themeData.tailwind.spacing.scale["4"];
  component.paddingBottom = themeData.tailwind.spacing.scale["4"];
  component.cornerRadius = BORDER_RADIUS.lg; // rounded-lg = 8px

  // Apply background fill (bg-kumo-control)
  const bgVar = getVariableByName(VAR_NAMES.color.control);
  if (bgVar) {
    bindFillToVariable(component, bgVar.id);
  }

  // Apply border (border-kumo-fill)
  const borderVar = getVariableByName(VAR_NAMES.color.fill);
  if (borderVar) {
    bindStrokeToVariable(component, borderVar.id, 1);
  }

  // Apply shadow effect (shadow-lg) - using centralized SHADOWS preset
  component.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: SHADOWS.lg.primary.opacity },
      offset: { x: SHADOWS.lg.primary.offsetX, y: SHADOWS.lg.primary.offsetY },
      radius: SHADOWS.lg.primary.blur,
      spread: SHADOWS.lg.primary.spread,
      visible: true,
      blendMode: "NORMAL",
    },
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: SHADOWS.lg.secondary.opacity },
      offset: {
        x: SHADOWS.lg.secondary.offsetX,
        y: SHADOWS.lg.secondary.offsetY,
      },
      radius: SHADOWS.lg.secondary.blur,
      spread: SHADOWS.lg.secondary.spread,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  // Create header frame (title + close button with SPACE_BETWEEN)
  const header = figma.createFrame();
  header.name = "Header";
  header.layoutMode = "HORIZONTAL";
  header.primaryAxisAlignItems = "SPACE_BETWEEN";
  header.counterAxisAlignItems = "CENTER";
  header.primaryAxisSizingMode = "FIXED";
  header.counterAxisSizingMode = "AUTO";
  header.resize(TOAST_WIDTH - 32, 20); // Full width minus padding
  header.layoutAlign = "STRETCH";
  header.fills = [];
  header.itemSpacing = SPACING.base; // gap-2 = 8px

  // Create title text
  // text-[0.975rem] = ~15.6px, font-medium = 500
  const title = await createTextNode(
    "Toast created",
    TOAST_CONFIG.titleFontSize,
    TOAST_CONFIG.titleFontWeight,
  );
  title.name = "Title";
  title.textAutoResize = "WIDTH_AND_HEIGHT";
  title.layoutGrow = 1; // Take remaining space

  // Apply title text color (text-kumo-default)
  const titleVar = getVariableByName(VAR_NAMES.text.default);
  if (titleVar) {
    bindTextColorToVariable(title, titleVar.id);
  }

  header.appendChild(title);

  // Create close button
  // h-5 w-5 = 20x20px
  const closeButton = figma.createFrame();
  closeButton.name = "Close Button";
  closeButton.layoutMode = "HORIZONTAL";
  closeButton.primaryAxisAlignItems = "CENTER";
  closeButton.counterAxisAlignItems = "CENTER";
  closeButton.resize(
    TOAST_CONFIG.closeButtonSize,
    TOAST_CONFIG.closeButtonSize,
  );
  closeButton.cornerRadius = BORDER_RADIUS.sm; // rounded = 4px
  closeButton.fills = []; // bg-transparent

  // Create close icon (ph-x) - 16x16 inside 20x20 button
  const closeIconName = "ph-x";
  const closeIcon = getButtonIcon(closeIconName, "sm"); // sm = 16px (TOAST_CONFIG.closeButtonIconSize)
  closeIcon.name = "Icon";

  // Apply icon color (text-kumo-subtle)
  bindIconColor(closeIcon, "text-kumo-subtle");

  closeButton.appendChild(closeIcon);
  header.appendChild(closeButton);

  component.appendChild(header);

  // Create description text
  // text-[0.925rem] = ~14.8px, normal weight
  const description = await createTextNode(
    "This is a toast notification.",
    TOAST_CONFIG.descriptionFontSize,
    TOAST_CONFIG.descriptionFontWeight,
  );
  description.name = "Description";
  description.textAutoResize = "HEIGHT";
  description.layoutAlign = "STRETCH";
  description.resize(TOAST_WIDTH - 32, description.height); // Full width minus padding

  // Apply description text color (text-kumo-subtle)
  const descVar = getVariableByName(VAR_NAMES.text.subtle);
  if (descVar) {
    bindTextColorToVariable(description, descVar.id);
  }

  component.appendChild(description);

  return component;
}

/**
 * Generate Toast ComponentSet
 *
 * Creates a "Toast" ComponentSet with a single variant (no variants).
 * Creates both light and dark mode sections.
 *
 * @param page - The page to add components to
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateToastComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  figma.currentPage = page;

  // Generate the toast component
  const components: ComponentNode[] = [];

  // Create the toast component
  const component = await createToastComponent();

  // Position component
  component.x = 0;
  component.y = 0;

  components.push(component);

  // Combine into ComponentSet (even with single variant for consistency)
  // @ts-ignore - combineAsVariants works at runtime
  const componentSet = figma.combineAsVariants(components, page);
  componentSet.name = "Toast";
  componentSet.description =
    "Toast notification component. " +
    "Use for transient messages, confirmations, and alerts.";
  componentSet.layoutMode = "NONE";

  // Calculate content dimensions
  const contentWidth = componentSet.width;
  const contentHeight = componentSet.height;

  // Create light mode section
  const lightSection = createModeSection(page, "Toast", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2,
  );

  // Create dark mode section
  const darkSection = createModeSection(page, "Toast", "dark");
  darkSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2,
  );

  // Move ComponentSet into light section frame
  lightSection.frame.appendChild(componentSet);
  componentSet.x = SECTION_PADDING;
  componentSet.y = SECTION_PADDING;

  // Create instances for dark section
  for (let k = 0; k < components.length; k++) {
    const origComp = components[k];
    const instance = origComp.createInstance();
    instance.x = origComp.x + SECTION_PADDING;
    instance.y = origComp.y + SECTION_PADDING;
    darkSection.frame.appendChild(instance);
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

  logComplete("Generated Toast ComponentSet (light + dark)");

  return startY + totalHeight + SECTION_GAP;
}

/**
 * ============================================================
 * TESTABLE EXPORT FUNCTIONS
 * ============================================================
 *
 * These functions extract intermediate data from the registry
 * to enable testing without Figma plugin runtime.
 *
 * Source of truth chain:
 * toast.tsx (KUMO_TOAST_STYLING) → component-registry.json → toast.ts
 */

/**
 * Get container styling configuration from registry
 */
export function getContainerConfig() {
  const toastComponent = (registry.components as any).Toasty;
  const styling = toastComponent.styling;

  if (!styling || !styling.container) {
    throw new Error("Toast styling metadata not found in registry");
  }

  return {
    raw: styling.container,
    width: styling.container.width,
    padding: styling.container.padding,
    borderRadius: styling.container.borderRadius,
    background: styling.container.background,
    border: styling.container.border,
    shadow: styling.container.shadow,
    gap: styling.container.gap,
  };
}

/**
 * Get title styling configuration from registry
 */
export function getTitleConfig() {
  const toastComponent = (registry.components as any).Toasty;
  const styling = toastComponent.styling;

  if (!styling || !styling.title) {
    throw new Error("Toast styling metadata not found in registry");
  }

  return {
    raw: styling.title,
    fontSize: styling.title.fontSize,
    fontWeight: styling.title.fontWeight,
    color: styling.title.color,
  };
}

/**
 * Get description styling configuration from registry
 */
export function getDescriptionConfig() {
  const toastComponent = (registry.components as any).Toasty;
  const styling = toastComponent.styling;

  if (!styling || !styling.description) {
    throw new Error("Toast styling metadata not found in registry");
  }

  return {
    raw: styling.description,
    fontSize: styling.description.fontSize,
    fontWeight: styling.description.fontWeight,
    color: styling.description.color,
  };
}

/**
 * Get close button styling configuration from registry
 */
export function getCloseButtonConfig() {
  const toastComponent = (registry.components as any).Toasty;
  const styling = toastComponent.styling;

  if (!styling || !styling.closeButton) {
    throw new Error("Toast styling metadata not found in registry");
  }

  return {
    raw: styling.closeButton,
    size: styling.closeButton.size,
    iconSize: styling.closeButton.iconSize,
    iconName: styling.closeButton.iconName,
    iconColor: styling.closeButton.iconColor,
    hoverBackground: styling.closeButton.hoverBackground,
    hoverColor: styling.closeButton.hoverColor,
    borderRadius: styling.closeButton.borderRadius,
  };
}

/**
 * Get complete variant data for all Toast styling
 * This is the golden path test - captures all intermediate data
 */
export function getAllVariantData() {
  const toastComponent = (registry.components as any).Toasty;

  return {
    styling: toastComponent.styling,
    container: getContainerConfig(),
    title: getTitleConfig(),
    description: getDescriptionConfig(),
    closeButton: getCloseButtonConfig(),
  };
}
