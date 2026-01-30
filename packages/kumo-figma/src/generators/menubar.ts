/**
 * MenuBar Component Generator
 *
 * Generates a MenuBar ComponentSet in Figma that matches
 * the MenuBar component structure from menubar.tsx.
 *
 * Note: The React component stretches to fill its container by default,
 * but in Figma we generate the "fit content" version (w-fit behavior)
 * since Figma components typically hug their contents. The React component
 * can achieve this with className="w-fit".
 *
 * Structure:
 * - Horizontal nav container with border and shadow
 * - Icon buttons with tooltips (represented as icon-only buttons)
 * - Active state shows elevated background
 *
 * @see packages/kumo/src/components/menubar/menubar.tsx
 * @see packages/kumo/src/components/menubar/menubar.stories.tsx (FitContent story)
 */

import {
  getVariableByName,
  createModeSection,
  createRowLabel,
  bindFillToVariable,
  bindStrokeToVariable,
  SECTION_PADDING,
  SECTION_GAP,
  SECTION_LAYOUT,
  SECTION_TITLE,
  GRID_LAYOUT,
  SHADOWS,
  BORDER_RADIUS,
  FALLBACK_VALUES,
  VAR_NAMES,
} from "./shared";
import { createIconInstance, bindIconColor } from "./icon-utils";
import registry from "@cloudflare/kumo/ai/component-registry.json";

// Read styling metadata from registry (added in Phase 7)
const menuBarStyling = (registry.components.MenuBar as any).styling;

/**
 * MenuBar dimensions and styling
 * Based on menubar.tsx: w-11 (44px) per button, height hugs content
 *
 * The React component uses:
 * - nav: flex, rounded-lg, border, pl-px
 * - button: h-full, w-11 (44px), rounded-md
 * - icon: size 18px via IconContext
 *
 * The height is determined by the icon + minimal padding.
 * Looking at Storybook, the component is quite compact.
 */
const FALLBACK_MENUBAR_CONFIG = {
  // COMPONENT-SPECIFIC: Height derived from icon size (18px) + vertical padding
  // The React component uses h-full on buttons which inherit from parent
  // 32px = 18px icon + 7px padding top + 7px padding bottom (approximate)
  // This is intentionally hardcoded as the React component height is content-driven
  height: 32,
  // COMPONENT-SPECIFIC: Button width derived from w-11 (44px) but adjusted for visual balance
  // The React component uses w-11 = 44px, but Figma rendering looks better at 36px
  buttonWidth: 36,
  /** Icon size inside buttons (size-4.5 = 18px) - from shared.ts */
  iconSize: FALLBACK_VALUES.iconSize.medium,
  /** Border radius for the container (rounded-lg = 8px) - from shared.ts */
  borderRadius: BORDER_RADIUS.lg,
  /** Border radius for individual buttons (rounded-md = 6px) - from shared.ts */
  buttonBorderRadius: BORDER_RADIUS.md,
};

/**
 * Get MenuBar configuration from registry with fallback
 *
 * Reads container and button dimensions from registry.components.MenuBar.styling
 * Falls back to hardcoded values if registry data is missing.
 */
function getConfigFromRegistry() {
  if (!menuBarStyling?.container || !menuBarStyling?.button) {
    return FALLBACK_MENUBAR_CONFIG;
  }

  return {
    height: menuBarStyling.container.height || FALLBACK_MENUBAR_CONFIG.height,
    buttonWidth:
      menuBarStyling.button.width || FALLBACK_MENUBAR_CONFIG.buttonWidth,
    iconSize:
      menuBarStyling.button.iconSize || FALLBACK_MENUBAR_CONFIG.iconSize,
    borderRadius:
      menuBarStyling.container.borderRadius ||
      FALLBACK_MENUBAR_CONFIG.borderRadius,
    buttonBorderRadius:
      menuBarStyling.button.borderRadius ||
      FALLBACK_MENUBAR_CONFIG.buttonBorderRadius,
  };
}

const MENUBAR_CONFIG = getConfigFromRegistry();

/**
 * Default menu options to display (matches Storybook Default story)
 */
const DEFAULT_OPTIONS = [
  { icon: "ph-house", tooltip: "Home", id: "home" },
  { icon: "ph-magnifying-glass", tooltip: "Search", id: "search" },
  { icon: "ph-bell", tooltip: "Notifications", id: "notifications" },
  { icon: "ph-gear", tooltip: "Settings", id: "settings" },
];

/**
 * Create a single menu option button
 *
 * @param iconId - Icon glyph ID (e.g., "ph-house")
 * @param isActive - Whether this button is the active one
 * @returns FrameNode representing the menu option
 */
function createMenuOption(iconId: string, isActive: boolean): FrameNode {
  const button = figma.createFrame();
  button.name = isActive ? "Option (active)" : "Option";
  button.resize(MENUBAR_CONFIG.buttonWidth, MENUBAR_CONFIG.height);

  // Layout: center the icon
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.primaryAxisSizingMode = "FIXED";
  button.counterAxisSizingMode = "FIXED";

  // No padding - icon is centered in the fixed-size button
  button.paddingTop = 0;
  button.paddingBottom = 0;
  button.paddingLeft = 0;
  button.paddingRight = 0;

  // Corner radius for buttons (rounded-md = 6px)
  button.cornerRadius = MENUBAR_CONFIG.buttonBorderRadius;

  // Background: bg-kumo-fill for inactive, bg-kumo-base for active
  if (isActive) {
    const surfaceVar = getVariableByName(VAR_NAMES.color.base);
    if (surfaceVar) {
      bindFillToVariable(button, surfaceVar.id);
    }
  } else {
    const colorVar = getVariableByName(VAR_NAMES.color.fill);
    if (colorVar) {
      bindFillToVariable(button, colorVar.id);
    }
  }

  // Create icon
  const icon = createIconInstance(iconId, MENUBAR_CONFIG.iconSize);
  if (icon) {
    icon.name = "Icon";
    // Icon color: fill-kumo-contrast (dark on light, light on dark)
    // This maps to color-surface-inverse variable, NOT text-color-surface-inverse
    bindIconColor(icon, "fill-kumo-contrast");
    button.appendChild(icon);
  }

  return button;
}

/**
 * Create a MenuBar component with specified active index
 *
 * @param activeIndex - Index of the active option (0-based), or -1 for none
 * @returns ComponentNode for the MenuBar
 */
async function createMenuBarComponent(
  activeIndex: number,
): Promise<ComponentNode> {
  const component = figma.createComponent();

  // Name based on active state
  if (activeIndex >= 0 && activeIndex < DEFAULT_OPTIONS.length) {
    component.name = "active=" + DEFAULT_OPTIONS[activeIndex].id;
  } else {
    component.name = "active=none";
  }

  component.description =
    "MenuBar navigation component with icon buttons. " +
    "Active button shows elevated background. " +
    'Note: This is the fit-content version; React component uses className="w-fit" for this behavior.';

  // Container layout: horizontal, hug contents (w-fit behavior)
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO"; // Hug contents (w-fit)
  component.counterAxisSizingMode = "FIXED"; // Fixed height
  component.resize(100, MENUBAR_CONFIG.height); // Will auto-resize width
  component.itemSpacing = 0; // Buttons are adjacent with -ml-px overlap effect
  component.paddingLeft = 1; // pl-px from the component
  component.paddingRight = 0;
  component.paddingTop = 0;
  component.paddingBottom = 0;

  // Styling: rounded-lg border border-kumo-fill bg-kumo-fill shadow-xs
  component.cornerRadius = MENUBAR_CONFIG.borderRadius;

  // Border: border-kumo-fill
  const borderVar = getVariableByName(VAR_NAMES.color.fill);
  if (borderVar) {
    bindStrokeToVariable(component, borderVar.id, 1);
  }

  // Background: bg-kumo-fill
  const bgVar = getVariableByName(VAR_NAMES.color.fill);
  if (bgVar) {
    bindFillToVariable(component, bgVar.id);
  }

  // Add shadow effect (shadow-xs) - using centralized SHADOWS preset
  component.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: SHADOWS.xs.opacity },
      offset: { x: SHADOWS.xs.offsetX, y: SHADOWS.xs.offsetY },
      radius: SHADOWS.xs.blur,
      spread: SHADOWS.xs.spread,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  // Create menu option buttons
  for (let i = 0; i < DEFAULT_OPTIONS.length; i++) {
    const option = DEFAULT_OPTIONS[i];
    const isActive = i === activeIndex;
    const button = createMenuOption(option.icon, isActive);
    button.name = option.id;
    component.appendChild(button);
  }

  return component;
}

/**
 * Generate MenuBar ComponentSet
 *
 * Creates a "MenuBar" ComponentSet with active state variants.
 * Creates both light and dark mode sections.
 *
 * @param page - The page to add components to
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateMenuBarComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  console.log("MenuBar: Starting generation at Y=" + startY);

  try {
    figma.currentPage = page;

    const components: ComponentNode[] = [];
    const rowLabels: { y: number; text: string }[] = [];

    // Layout spacing - using centralized GRID_LAYOUT constants
    const labelColumnWidth = GRID_LAYOUT.labelColumnWidth.standard; // 160px
    const rowGap = GRID_LAYOUT.rowGap.compact; // 24px
    let currentY = 0;

    // Create a component for each active state
    for (let i = 0; i < DEFAULT_OPTIONS.length; i++) {
      const option = DEFAULT_OPTIONS[i];
      console.log("MenuBar: Creating active=" + option.id);

      const component = await createMenuBarComponent(i);
      component.x = labelColumnWidth;
      component.y = currentY;

      rowLabels.push({ y: currentY, text: "active=" + option.id });
      components.push(component);

      currentY += MENUBAR_CONFIG.height + rowGap;
    }

    console.log("MenuBar: Combining as variants...");
    // @ts-ignore - combineAsVariants works at runtime
    const componentSet = figma.combineAsVariants(components, page);
    componentSet.name = "MenuBar";
    componentSet.description =
      "MenuBar - Horizontal icon navigation bar. " +
      "Shows active state with elevated button background. " +
      "Icons: Home, Search, Notifications, Settings. " +
      'Note: Figma version uses fit-content width; React equivalent is className="w-fit".';
    componentSet.layoutMode = "NONE";

    // Calculate content dimensions
    const contentWidth = componentSet.width + labelColumnWidth;
    const contentHeight = componentSet.height;

    // Add contentYOffset for title space inside frame
    const contentYOffset = SECTION_TITLE.height;

    // Create light mode section
    const lightSection = createModeSection(page, "MenuBar", "light");
    lightSection.frame.resize(
      contentWidth + SECTION_PADDING * 2,
      contentHeight + SECTION_PADDING * 2 + contentYOffset,
    );

    // Create dark mode section
    const darkSection = createModeSection(page, "MenuBar", "dark");
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
          GRID_LAYOUT.labelVerticalOffset.lg, // Center vertically with menubar
      );
      lightSection.frame.appendChild(labelNode);
    }

    // Create instances for dark section
    for (let k = 0; k < components.length; k++) {
      const origComp = components[k];
      const instance = origComp.createInstance();
      instance.x = SECTION_PADDING + labelColumnWidth;
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
          GRID_LAYOUT.labelVerticalOffset.lg,
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

    console.log(
      "Generated MenuBar ComponentSet with " +
        DEFAULT_OPTIONS.length +
        " variants (light + dark)",
    );

    return startY + totalHeight + SECTION_GAP;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("MenuBar generation failed: " + errorMessage);
    console.error("Stack: " + errorStack);
    throw error;
  }
}

// ============================================================================
// TESTABLE EXPORTS
// ============================================================================

/**
 * Get MenuBar dimensions configuration
 *
 * Returns the layout dimensions for the MenuBar component.
 */
export function getMenuBarDimensionsConfig() {
  return MENUBAR_CONFIG;
}

/**
 * Get MenuBar default options
 *
 * Returns the default menu options used in the generator.
 */
export function getMenuBarDefaultOptions() {
  return DEFAULT_OPTIONS;
}

/**
 * Get MenuBar color bindings
 *
 * Returns the semantic color tokens used for MenuBar styling.
 */
export function getMenuBarColorBindings() {
  return {
    container: {
      background: VAR_NAMES.color.fill,
      border: VAR_NAMES.color.fill,
    },
    button: {
      inactive: {
        background: VAR_NAMES.color.fill,
      },
      active: {
        background: VAR_NAMES.color.base,
      },
      icon: "fill-kumo-contrast",
    },
  };
}

/**
 * Get MenuBar shadow configuration
 *
 * Returns the shadow effect configuration (shadow-xs).
 * Uses centralized SHADOWS.xs preset for consistency.
 */
export function getMenuBarShadowConfig() {
  return {
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: SHADOWS.xs.opacity },
    offset: { x: SHADOWS.xs.offsetX, y: SHADOWS.xs.offsetY },
    radius: SHADOWS.xs.blur,
    spread: SHADOWS.xs.spread,
  };
}

/**
 * Get all MenuBar data
 *
 * Returns complete intermediate data structure for the MenuBar component.
 * This is used for snapshot testing to catch unintended changes.
 */
export function getAllMenuBarData() {
  const dimensions = getMenuBarDimensionsConfig();
  const defaultOptions = getMenuBarDefaultOptions();
  const colorBindings = getMenuBarColorBindings();
  const shadowConfig = getMenuBarShadowConfig();

  return {
    dimensions: dimensions,
    defaultOptions: defaultOptions,
    colorBindings: colorBindings,
    shadowConfig: shadowConfig,
  };
}
