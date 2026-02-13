/**
 * Shared Utilities for Component Generators
 *
 * Common functions used by all component generators (Button, Badge, etc.)
 * Provides abstractions over Figma Plugin API for creating frames, text,
 * binding variables, and applying layouts.
 *
 * IMPORTANT: Size/spacing/font constants are generated from CSS sources.
 * Run `npx tsx build-theme-data.ts` to regenerate theme-data.json.
 */

import themeData from "../generated/theme-data.json";
import figmaVariablesData from "../generated/figma-variables.json";

/**
 * Semantic variable name mappings.
 * Maps generator-friendly names to actual Figma variable names from the theme config.
 *
 * This allows generators to use semantic names like "surface" or "control"
 * which get translated to the actual "kumo-*" variable names.
 */
export const VAR_NAMES = {
  // Text colors
  text: {
    default: "text-color-kumo-default",
    inverse: "text-color-kumo-inverse",
    strong: "text-color-kumo-strong",
    subtle: "text-color-kumo-subtle",
    inactive: "text-color-kumo-inactive",
    brand: "text-color-kumo-brand",
    link: "text-color-kumo-link",
    success: "text-color-kumo-success",
    danger: "text-color-kumo-danger",
    warning: "text-color-kumo-warning",
    // Legacy aliases (for gradual migration)
    surface: "text-color-kumo-default",
    muted: "text-color-kumo-subtle",
    label: "text-color-kumo-strong",
    error: "text-color-kumo-danger",
    disabled: "text-color-kumo-inactive",
  },
  // Background/fill colors
  color: {
    base: "color-kumo-base",
    elevated: "color-kumo-elevated",
    recessed: "color-kumo-recessed",
    overlay: "color-kumo-overlay",
    contrast: "color-kumo-contrast",
    control: "color-kumo-control",
    tint: "color-kumo-tint",
    interact: "color-kumo-interact",
    fill: "color-kumo-fill",
    fillHover: "color-kumo-fill-hover",
    brand: "color-kumo-brand",
    brandHover: "color-kumo-brand-hover",
    line: "color-kumo-line",
    ring: "color-kumo-ring",
    tipShadow: "color-kumo-tip-shadow",
    tipStroke: "color-kumo-tip-stroke",
    info: "color-kumo-info",
    infoTint: "color-kumo-info-tint",
    warning: "color-kumo-warning",
    warningTint: "color-kumo-warning-tint",
    danger: "color-kumo-danger",
    dangerTint: "color-kumo-danger-tint",
    success: "color-kumo-success",
    successTint: "color-kumo-success-tint",
    // Legacy aliases (for gradual migration from old naming convention)
    // Old: "color-{name}" → New: "color-kumo-{name}"
    surface: "color-kumo-base",
    surfaceInverse: "color-kumo-contrast",
    secondary: "color-kumo-control",
    primary: "color-kumo-brand",
    border: "color-kumo-line",
    active: "color-kumo-brand",
    hover: "color-kumo-interact",
    error: "color-kumo-danger",
    accent: "color-kumo-tint",
  },
} as const;

/**
 * Size and spacing constants
 * Generated from: Tailwind v4 theme.css --spacing base unit
 */
export const SPACING = {
  /** Extra small gap between elements */
  xs: themeData.computed.spacing.xs,
  /** Small gap between elements */
  sm: themeData.computed.spacing.sm,
  /** Base gap between elements */
  base: themeData.computed.spacing.base,
  /** Large gap between elements */
  lg: themeData.computed.spacing.lg,
} as const;

/**
 * Border radius constants
 * Generated from: Tailwind v4 theme.css --radius-* values
 */
export const BORDER_RADIUS = {
  /** Extra small radius - matches --radius-xs in Tailwind v4 theme.css */
  xs: themeData.computed.borderRadius.xs,
  /** Small radius - matches --radius-sm in Tailwind v4 theme.css */
  sm: themeData.computed.borderRadius.sm,
  /** Medium radius - matches --radius-md in Tailwind v4 theme.css */
  md: themeData.computed.borderRadius.md,
  /** Large radius - matches --radius-lg in Tailwind v4 theme.css */
  lg: themeData.computed.borderRadius.lg,
  /** Extra large radius - matches --radius-xl in Tailwind v4 theme.css */
  xl: themeData.computed.borderRadius.xl,
  /** Full rounded (9999px) */
  full: themeData.computed.borderRadius.full,
} as const;

/**
 * Font size constants
 * Generated from: theme-kumo.css --text-* values (Kumo overrides Tailwind defaults)
 */
export const FONT_SIZE = {
  /** Extra small - matches --text-xs in theme-kumo.css */
  xs: themeData.computed.fontSize.xs,
  /** Small - matches --text-sm in theme-kumo.css (Kumo override) */
  sm: themeData.computed.fontSize.sm,
  /** Base - matches --text-base in theme-kumo.css (Kumo override) */
  base: themeData.computed.fontSize.base,
  /** Large - matches --text-lg in theme-kumo.css (Kumo override) */
  lg: themeData.computed.fontSize.lg,
} as const;

/**
 * Section positioning for Figma canvas layout
 * Note: startX is mutable so it can be updated after icon generation
 * to position component sections to the right of the icons.
 */
export const SECTION_LAYOUT: {
  startX: number;
  readonly startY: 100;
  readonly modeGap: 50;
} = {
  /** X position for section start (mutable - updated after icon generation) */
  startX: 100,
  /** Y position for section start */
  startY: 100,
  /** Gap between light/dark mode sections */
  modeGap: 50,
};

/**
 * Opacity values for component states
 */
export const OPACITY = {
  /** Opacity for disabled state */
  disabled: 0.5,
  /** Opacity for backdrop/overlay */
  backdrop: 0.8,
  /** Opacity for shortcut/secondary text (e.g., dropdown shortcuts) */
  shortcut: 0.6,
} as const;

/**
 * RGB color constants for Figma
 * All hardcoded RGB values should be centralized here for consistency
 */
export const COLORS = {
  /** Placeholder/fallback gray (0.5) - used for icon placeholders, fallback strokes */
  placeholder: { r: 0.5, g: 0.5, b: 0.5 },
  /** Fallback white (1.0) - used for backgrounds, container fills */
  fallbackWhite: { r: 1, g: 1, b: 1 },
  /** Spinner stroke color (0.4) - used for loader animations, muted text */
  spinnerStroke: { r: 0.4, g: 0.4, b: 0.4 },
  /** Border/stroke gray (0.8) - used for borders when variable binding fails */
  borderGray: { r: 0.8, g: 0.8, b: 0.8 },
  /** Light gray background (0.95) - used for icon library example frames */
  lightGrayBg: { r: 0.95, g: 0.95, b: 0.95 },
  /** Skeleton/track gray (0.9) - used for skeleton loaders, meter tracks */
  skeletonGray: { r: 0.9, g: 0.9, b: 0.9 },
  /** Fallback primary blue - used for meter indicator when variable unavailable */
  fallbackPrimary: { r: 0.0, g: 0.5, b: 1.0 },
} as const;

/**
 * Dash pattern arrays for strokes
 */
export const DASH_PATTERN = {
  /** Standard dash pattern for dashed borders (4px dash, 4px gap) */
  standard: [4, 4],
} as const;

/**
 * Layout constants for component display sections
 */
export const SECTION_PADDING = 48;
export const SECTION_GAP = 80;

/**
 * Section title configuration
 * Used for titles displayed inside section frames
 */
export const SECTION_TITLE = {
  /** Font size for section titles */
  fontSize: 24,
  /** Font weight for section titles (Semi Bold) */
  fontWeight: 600,
  /** Gap between title and content below */
  gap: 16,
  /** Height of the title area (fontSize + gap) - used for content offset */
  height: 40, // 24px font + 16px gap
} as const;

/**
 * Shadow layer type for single-layer shadows
 */
type ShadowLayer = {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  opacity: number;
};

/**
 * Get the first layer from a shadow definition in theme-data.json
 * Falls back to provided defaults if no layers exist
 */
function getShadowLayer(
  shadowDef: { layers: ShadowLayer[] } | undefined,
  fallback: ShadowLayer,
): ShadowLayer {
  if (shadowDef?.layers && shadowDef.layers.length > 0) {
    return shadowDef.layers[0];
  }
  return fallback;
}

/**
 * Shadow presets for components
 * Generated from: Tailwind v4 theme.css shadow definitions via theme-data.json
 * Run `npx tsx build-theme-data.ts` to regenerate.
 */
export const SHADOWS = {
  /** Extra small shadow - minimal elevation
   *  Used for: Surface, MenuBar, subtle elevation
   *  Matches Tailwind: shadow-xs
   *  Generated from theme-data.json
   */
  xs: getShadowLayer(themeData.tailwind.shadows.xs, {
    offsetX: 0,
    offsetY: 1,
    blur: 2,
    spread: 0,
    opacity: 0.05,
  }),
  /** Small shadow - two layers
   *  Used for: Tabs indicator, subtle elevation
   *  Matches Tailwind: shadow-sm
   *  Generated from theme-data.json (first layer)
   */
  sm: getShadowLayer(themeData.tailwind.shadows.sm, {
    offsetX: 0,
    offsetY: 1,
    blur: 3,
    spread: 0,
    opacity: 0.1,
  }),
  /** Large shadow - high elevation with two layers
   *  Used for: Toast, popups, floating elements
   *  Matches Tailwind: shadow-lg
   *  Generated from theme-data.json
   */
  lg: {
    primary: getShadowLayer(themeData.tailwind.shadows.lg, {
      offsetX: 0,
      offsetY: 10,
      blur: 15,
      spread: -3,
      opacity: 0.1,
    }),
    secondary:
      themeData.tailwind.shadows.lg?.layers?.[1] ??
      ({
        offsetX: 0,
        offsetY: 4,
        blur: 6,
        spread: -4,
        opacity: 0.1,
      } as ShadowLayer),
  },
  /** Dialog shadow - Figma-specific exception (no CSS token backing).
   *  This is intentionally hardcoded for Figma rendering optimization.
   *  The Dialog React component uses a different shadow approach.
   *  Format: 0 8px 32px rgb(0 0 0 / 0.16)
   *  NOTE: This is NOT derived from Tailwind - it's a Figma-specific design choice.
   */
  dialog: {
    offsetX: 0,
    offsetY: 8,
    blur: 32,
    spread: 0,
    opacity: 0.16,
  },
  /** @deprecated Use SHADOWS.xs instead - same values */
  subtle: getShadowLayer(themeData.tailwind.shadows.xs, {
    offsetX: 0,
    offsetY: 1,
    blur: 2,
    spread: 0,
    opacity: 0.05,
  }),
} as const;

/**
 * Grid layout constants for component display sections
 * Used to arrange component variants in consistent grids with labels
 */
export const GRID_LAYOUT = {
  /** Vertical gap between component rows (common: 24-80px depending on component density) */
  rowGap: {
    /** Compact spacing for dense components (e.g., tabs, menubar, clipboard-text) */
    compact: 24,
    /** Medium spacing for standard components (e.g., badge, breadcrumbs, empty, meter) */
    medium: 40,
    /** Standard spacing for most components (e.g., banner, checkbox, switch, pagination) */
    standard: 48,
    /** Spacious layout for large components (e.g., refresh-button, code-block) */
    spacious: 60,
    /** Extra spacious for complex components (e.g., button, link-button) */
    extraSpacious: 80,
  },
  /** Width of label column for variant labels (common: 100-280px depending on label length) */
  labelColumnWidth: {
    /** Minimal width for short labels (e.g., surface, loader) */
    minimal: 100,
    /** Compact width for standard labels (e.g., collapsible, dialog) */
    compact: 120,
    /** Small width for slightly longer labels (e.g., clipboard-text, refresh-button) */
    small: 140,
    /** Standard width for typical labels (e.g., code, banner, menubar, tabs, text, layer-card) */
    standard: 160,
    /** Medium width for longer labels (e.g., badge, breadcrumbs, empty, meter, pagination, checkbox, dropdown, date-range-picker, select, combobox) */
    medium: 180,
    /** Wide for complex labels (e.g., input, input-area) */
    wide: 200,
    /** Wider for very long labels (e.g., button, link-button, sensitive-input) */
    wider: 220,
    /** Widest for exceptionally long labels (e.g., switch with multiple properties) */
    widest: 280,
  },
  /** Height of header row for column headers (typically 24px) */
  headerRowHeight: 24,
  /** Label vertical centering offsets by size */
  labelVerticalOffset: {
    /** Small offset for compact components (badge, loader) */
    sm: 4,
    /** Medium offset for standard components (input, checkbox) */
    md: 8,
    /** Medium-large offset for breadcrumbs, pagination, refresh-button */
    mdLg: 10,
    /** Large offset for larger components (button, dialog) */
    lg: 12,
    /** Extra large offset for tall components (empty) */
    xl: 20,
  },
  /** Horizontal gap between components in a row */
  componentGapX: {
    /** Compact horizontal gap (e.g., loader) */
    compact: 16,
    /** Standard horizontal gap (e.g., dropdown, button) */
    standard: 24,
  },
  /** Vertical gap between component groups */
  componentGapY: {
    /** Compact vertical gap */
    compact: 24,
    /** Standard vertical gap (e.g., dropdown) */
    standard: 40,
  },
} as const;

/**
 * Fallback values when parsing fails
 * Used as defensive defaults when registry or parser doesn't provide expected values
 *
 * IMPORTANT: Many values are generated from CSS sources via theme-data.json.
 * Run `npx tsx build-theme-data.ts` to regenerate.
 */
export const FALLBACK_VALUES = {
  /** Default font size (text-base from theme-kumo.css) */
  fontSize: themeData.computed.fontSize.base,
  /** Default font weight - generated from Tailwind v4 theme.css */
  fontWeight: {
    /** Normal weight (CSS default) */
    normal: themeData.computed.fontWeight.normal,
    /** Medium weight (commonly used in UI) */
    medium: themeData.computed.fontWeight.medium,
    /** Semi-bold weight (used in headings and emphasis) */
    semiBold: themeData.computed.fontWeight.semiBold,
  },
  /** Default padding values - derived from Tailwind spacing scale */
  padding: {
    /** Horizontal padding for inputs/buttons (px-3 = 12px) */
    horizontal: themeData.tailwind.spacing.scale["3"],
    /** Vertical padding for compact components (py-1.5 = 6px) */
    vertical: themeData.tailwind.spacing.scale["1.5"],
    /** Standard padding for content areas (p-4 = 16px) */
    standard: themeData.tailwind.spacing.scale["4"],
    /** Large padding for dialogs and cards (p-6 = 24px) */
    large: themeData.tailwind.spacing.scale["6"],
  },
  /** Default border radius - generated from Tailwind v4 theme.css */
  borderRadius: {
    /** Medium radius (rounded-md) */
    medium: themeData.computed.borderRadius.md,
    /** Large radius (rounded-lg) */
    large: themeData.computed.borderRadius.lg,
  },
  /** Default gap between elements - derived from Tailwind spacing scale */
  gap: {
    /** Tight gap (gap-1 = 4px) */
    tight: themeData.tailwind.spacing.scale["1"],
    /** Standard gap (gap-1.5 = 6px) */
    standard: themeData.tailwind.spacing.scale["1.5"],
    /** Medium gap (gap-2 = 8px) */
    medium: themeData.tailwind.spacing.scale["2"],
    /** Large gap for dialogs and cards (gap-4 = 16px) */
    large: themeData.tailwind.spacing.scale["4"],
  },
  /** Default height for inputs/buttons (h-9 = 36px) */
  height: {
    /** Base input/button height (h-9 = 36px) */
    base: themeData.tailwind.spacing.scale["9"],
  },
  /**
   * Button compact sizes (square/circle shapes)
   * Generated from: button.tsx KUMO_BUTTON_VARIANTS.compactSize
   */
  buttonCompactSize: {
    /** Extra small compact button (size-3.5) */
    xs: themeData.computed.buttonCompactSize.xs,
    /** Small compact button (size-6.5) */
    sm: themeData.computed.buttonCompactSize.sm,
    /** Base compact button (size-9) */
    base: themeData.computed.buttonCompactSize.base,
    /** Large compact button (size-10) */
    lg: themeData.computed.buttonCompactSize.lg,
  },
  /** Default stroke weight for borders */
  strokeWeight: 1,
  /** Thick stroke weight for emphasis borders (e.g., collapsible content border) */
  strokeWeightThick: 2,
  /** Default icon size - derived from Tailwind spacing scale */
  iconSize: {
    /** Extra small icon (size-3 = 12px) */
    xs: themeData.tailwind.spacing.scale["3"],
    /** Small icon (size-4 = 16px) */
    sm: themeData.tailwind.spacing.scale["4"],
    /** Medium icon (size-4.5 = 18px) */
    medium: themeData.tailwind.spacing.scale["4.5"] ?? 18,
    /** Base icon (size-5 = 20px) */
    base: themeData.tailwind.spacing.scale["5"],
    /** Large icon (size-12 = 48px) - used for Empty component */
    lg: themeData.tailwind.spacing.scale["12"],
    /** @deprecated Use xs instead */
    small: themeData.tailwind.spacing.scale["3"],
  },
  /**
   * Line height values
   * These are design-specific values for readability
   */
  lineHeight: {
    /** Code block line height (leading-[20px] from code.tsx) */
    code: 20,
  },
} as const;

/**
 * Auto-layout configuration
 */
export type AutoLayoutConfig = {
  /** Layout direction */
  mode: "HORIZONTAL" | "VERTICAL";
  /** Primary axis alignment */
  primaryAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  /** Counter axis alignment */
  counterAxisAlignItems?: "MIN" | "CENTER" | "MAX";
  /** Padding (all sides equal, or {top, right, bottom, left}) */
  padding?:
    | number
    | { top: number; right: number; bottom: number; left: number };
  /** Gap between child elements */
  itemSpacing?: number;
  /** Primary axis sizing behavior */
  primaryAxisSizingMode?: "FIXED" | "AUTO";
  /** Counter axis sizing behavior */
  counterAxisSizingMode?: "FIXED" | "AUTO";
};

/**
 * Create a frame with auto-layout configuration
 *
 * @param config - Auto-layout settings
 * @returns Frame node with auto-layout applied
 *
 * @example
 * const buttonFrame = createAutoLayoutFrame({
 *   mode: "HORIZONTAL",
 *   primaryAxisAlignItems: "CENTER",
 *   counterAxisAlignItems: "CENTER",
 *   padding: { top: 8, right: 12, bottom: 8, left: 12 },
 *   itemSpacing: 6,
 * });
 */
export function createAutoLayoutFrame(config: AutoLayoutConfig): FrameNode {
  const frame = figma.createFrame();

  // Apply layout mode
  frame.layoutMode = config.mode;

  // Apply alignment
  if (config.primaryAxisAlignItems) {
    frame.primaryAxisAlignItems = config.primaryAxisAlignItems;
  }
  if (config.counterAxisAlignItems) {
    frame.counterAxisAlignItems = config.counterAxisAlignItems;
  }

  // Apply padding
  if (config.padding !== undefined) {
    if (typeof config.padding === "number") {
      frame.paddingTop = config.padding;
      frame.paddingRight = config.padding;
      frame.paddingBottom = config.padding;
      frame.paddingLeft = config.padding;
    } else {
      frame.paddingTop = config.padding.top;
      frame.paddingRight = config.padding.right;
      frame.paddingBottom = config.padding.bottom;
      frame.paddingLeft = config.padding.left;
    }
  }

  // Apply item spacing (gap)
  if (config.itemSpacing !== undefined) {
    frame.itemSpacing = config.itemSpacing;
  }

  // Apply sizing modes
  if (config.primaryAxisSizingMode) {
    frame.primaryAxisSizingMode = config.primaryAxisSizingMode;
  }
  if (config.counterAxisSizingMode) {
    frame.counterAxisSizingMode = config.counterAxisSizingMode;
  }

  return frame;
}

/**
 * Bind a fill to a Figma variable
 *
 * @param node - Node to apply fill to
 * @param variableId - Figma variable ID
 *
 * @example
 * const button = figma.createRectangle();
 * const primaryVar = getVariableByName("primary");
 * bindFillToVariable(button, primaryVar.id);
 */
export function bindFillToVariable(node: SceneNode, variableId: string): void {
  if (!("fills" in node)) return;

  const variable = figma.variables.getVariableById(variableId);
  if (!variable) {
    console.warn(`Variable not found: ${variableId}`);
    return;
  }

  // Create base paint and bind variable
  let fill: SolidPaint = {
    type: "SOLID",
    color: { r: 1, g: 1, b: 1 },
  };
  fill = figma.variables.setBoundVariableForPaint(fill, "color", variable);

  node.fills = [fill];
}

/**
 * Parse a variable name that may contain an opacity suffix
 * e.g., "color-kumo-info/20" → { baseName: "color-kumo-info", opacity: 0.2 }
 * e.g., "color-kumo-brand" → { baseName: "color-kumo-brand", opacity: undefined }
 */
export function parseVariableWithOpacity(varName: string): {
  baseName: string;
  opacity: number | undefined;
} {
  const opacityMatch = varName.match(/^(.+)\/(\d+)$/);
  if (opacityMatch) {
    return {
      baseName: opacityMatch[1],
      opacity: parseInt(opacityMatch[2], 10) / 100,
    };
  }
  return { baseName: varName, opacity: undefined };
}

/**
 * Bind a fill to a Figma variable, parsing opacity from variable name if present.
 * Handles patterns like "color-kumo-info/20" by creating a new variable with
 * the opacity baked into the color values.
 *
 * @param node - Node to apply fill to
 * @param variableName - Variable name (may include opacity suffix like "/20")
 *
 * @example
 * bindFillToVariableWithOpacity(frame, "color-kumo-info/20"); // Creates/uses color-kumo-info/20 variable
 * bindFillToVariableWithOpacity(frame, "color-kumo-brand"); // Uses color-kumo-brand directly
 */
export function bindFillToVariableWithOpacity(
  node: SceneNode,
  variableName: string,
): void {
  // Get or create the variable (handles opacity variants automatically)
  const variable = getOrCreateVariableWithOpacity(variableName);
  if (variable) {
    bindFillToVariable(node, variable.id);
  } else {
    console.warn(`Variable not found: ${variableName}`);
  }
}

/**
 * Bind a stroke to a Figma variable
 *
 * @param node - Node to apply stroke to
 * @param variableId - Figma variable ID
 * @param weight - Stroke weight in pixels (default: 1)
 *
 * @example
 * const button = figma.createFrame();
 * const borderVar = getVariableByName("border");
 * bindStrokeToVariable(button, borderVar.id, 1);
 */
export function bindStrokeToVariable(
  node: SceneNode,
  variableId: string,
  weight: number = 1,
  align: "INSIDE" | "OUTSIDE" | "CENTER" = "INSIDE",
): void {
  if (!("strokes" in node)) return;

  const variable = figma.variables.getVariableById(variableId);
  if (!variable) {
    console.warn(`Variable not found: ${variableId}`);
    return;
  }

  // Create a base stroke
  let stroke: SolidPaint = {
    type: "SOLID",
    color: { r: 1, g: 1, b: 1 },
  };

  // Bind the variable to the stroke's color property
  stroke = figma.variables.setBoundVariableForPaint(stroke, "color", variable);

  node.strokes = [stroke];
  node.strokeWeight = weight;

  // Set stroke alignment - INSIDE matches CSS border behavior better
  // and ensures the stroke is fully visible within the node bounds
  if ("strokeAlign" in node) {
    (
      node as unknown as { strokeAlign: "INSIDE" | "OUTSIDE" | "CENTER" }
    ).strokeAlign = align;
  }
}

/**
 * Create a text node with styling
 *
 * @param text - Text content
 * @param fontSize - Font size in pixels
 * @param fontWeight - Font weight (default: 400)
 * @returns Text node
 *
 * @example
 * const label = createTextNode("Button", 16, 500);
 */
export async function createTextNode(
  text: string,
  fontSize: number,
  fontWeight: number = 400,
): Promise<TextNode> {
  const textNode = figma.createText();

  // Load ALL required fonts BEFORE setting any text properties
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  if (fontWeight >= 600) {
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  } else if (fontWeight >= 500) {
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  }

  // Now set text properties after all fonts are loaded
  textNode.characters = text;
  textNode.fontSize = fontSize;

  // Apply the appropriate font style based on weight
  if (fontWeight >= 600) {
    textNode.fontName = { family: "Inter", style: "Semi Bold" };
  } else if (fontWeight >= 500) {
    textNode.fontName = { family: "Inter", style: "Medium" };
  } else {
    textNode.fontName = { family: "Inter", style: "Regular" };
  }

  return textNode;
}

/**
 * Create a row label for component sections
 *
 * @param text - Label text (e.g., "variant=primary", "disabled=true")
 * @param x - X position
 * @param y - Y position
 * @returns Text node styled as a label
 *
 * @example
 * const label = await createRowLabel("variant=primary, size=base", 0, 100);
 */
export async function createRowLabel(
  text: string,
  x: number,
  y: number,
): Promise<TextNode> {
  const textNode = figma.createText();

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  textNode.characters = text;
  textNode.fontSize = FONT_SIZE.xs;
  textNode.fontName = { family: "Inter", style: "Medium" };

  // Use muted color for labels
  const mutedVar = getVariableByName(VAR_NAMES.text.subtle);
  if (mutedVar) {
    let fill: SolidPaint = {
      type: "SOLID",
      color: { r: 0.5, g: 0.5, b: 0.5 },
    };
    fill = figma.variables.setBoundVariableForPaint(fill, "color", mutedVar);
    textNode.fills = [fill];
  } else {
    // Fallback to gray
    textNode.fills = [
      {
        type: "SOLID",
        color: { r: 0.5, g: 0.5, b: 0.5 },
      },
    ];
  }

  textNode.x = x;
  textNode.y = y;

  return textNode;
}

/**
 * Create a section title inside a frame
 *
 * @param text - Title text (e.g., "Button", "Badge")
 * @param frame - Frame to append the title to
 * @returns Text node styled as a section title
 *
 * @example
 * const title = await createSectionTitle("Button", lightSection.frame);
 */
export async function createSectionTitle(
  text: string,
  frame: FrameNode,
): Promise<TextNode> {
  const textNode = figma.createText();

  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  textNode.characters = text;
  textNode.fontSize = SECTION_TITLE.fontSize;
  textNode.fontName = { family: "Inter", style: "Semi Bold" };

  // Use surface text color for titles
  const surfaceVar = getVariableByName(VAR_NAMES.text.default);
  if (surfaceVar) {
    let fill: SolidPaint = {
      type: "SOLID",
      color: { r: 0, g: 0, b: 0 },
    };
    fill = figma.variables.setBoundVariableForPaint(fill, "color", surfaceVar);
    textNode.fills = [fill];
  } else {
    // Fallback to black
    textNode.fills = [
      {
        type: "SOLID",
        color: { r: 0, g: 0, b: 0 },
      },
    ];
  }

  // Position at top-left with padding
  textNode.x = SECTION_PADDING;
  textNode.y = SECTION_PADDING;

  frame.appendChild(textNode);

  return textNode;
}

/**
 * Create column headers for component grids (e.g., size=xs, size=sm, etc.)
 *
 * @param headers - Array of { x, text } for each column header
 * @param y - Y position for all headers (typically above the grid)
 * @param frame - Frame to append headers to
 *
 * @example
 * await createColumnHeaders(
 *   [{ x: 180, text: "size=xs" }, { x: 280, text: "size=sm" }],
 *   SECTION_PADDING,
 *   lightSection.frame
 * );
 */
export async function createColumnHeaders(
  headers: { x: number; text: string }[],
  y: number,
  frame: FrameNode,
): Promise<void> {
  for (const header of headers) {
    const labelNode = await createRowLabel(header.text, header.x, y);
    frame.appendChild(labelNode);
  }
}

// Cache for the kumo-colors collection and variables
let _kumoColorsCollection: VariableCollection | null = null;
let _variableCache: Map<string, Variable> = new Map();

/**
 * Initialize or get the kumo-colors variable collection.
 * Creates the collection and all variables if they don't exist.
 * This should be called once at the start of generation.
 */
export function initializeColorVariables(): VariableCollection {
  // Check if already initialized
  if (_kumoColorsCollection) {
    return _kumoColorsCollection;
  }

  const collections = figma.variables.getLocalVariableCollections();
  let kumoColors: VariableCollection | undefined = collections.find(
    (c) => c.name === figmaVariablesData.collectionName,
  );

  // Create collection if it doesn't exist
  if (!kumoColors) {
    console.log(`Creating ${figmaVariablesData.collectionName} collection...`);
    kumoColors = figma.variables.createVariableCollection(
      figmaVariablesData.collectionName,
    );

    // Rename default mode to "Light"
    kumoColors.renameMode(kumoColors.modes[0].modeId, "Light");

    // Add Dark mode
    kumoColors.addMode("Dark");
  }

  _kumoColorsCollection = kumoColors;

  // Get mode IDs
  const lightModeId = kumoColors.modes.find((m) => m.name === "Light")?.modeId;
  const darkModeId = kumoColors.modes.find((m) => m.name === "Dark")?.modeId;

  if (!lightModeId || !darkModeId) {
    console.warn("Could not find Light/Dark modes in collection");
    return kumoColors;
  }

  // Create variables from figma-variables.json
  const existingVars = kumoColors.variableIds
    .map((id) => figma.variables.getVariableById(id))
    .filter((v): v is Variable => v !== null);

  for (const varDef of figmaVariablesData.variables) {
    // Cache existing variables
    const existing = existingVars.find((v) => v.name === varDef.name);
    if (existing) {
      _variableCache.set(varDef.name, existing);
      continue;
    }

    // Create new variable
    const variable = figma.variables.createVariable(
      varDef.name,
      kumoColors,
      "COLOR",
    );

    // Set light mode value (use RGBA if alpha is defined)
    const lightColor: RGB | RGBA =
      varDef.light.a !== undefined
        ? {
            r: varDef.light.r,
            g: varDef.light.g,
            b: varDef.light.b,
            a: varDef.light.a,
          }
        : {
            r: varDef.light.r,
            g: varDef.light.g,
            b: varDef.light.b,
          };
    variable.setValueForMode(lightModeId, lightColor);

    // Set dark mode value (use RGBA if alpha is defined)
    const darkColor: RGB | RGBA =
      varDef.dark.a !== undefined
        ? {
            r: varDef.dark.r,
            g: varDef.dark.g,
            b: varDef.dark.b,
            a: varDef.dark.a,
          }
        : {
            r: varDef.dark.r,
            g: varDef.dark.g,
            b: varDef.dark.b,
          };
    variable.setValueForMode(darkModeId, darkColor);

    _variableCache.set(varDef.name, variable);
  }

  console.log(
    `✅ Initialized ${figmaVariablesData.variables.length} color variables`,
  );
  return kumoColors;
}

/**
 * Clear the variable collection (for destructive sync).
 * Removes all variables and the collection itself.
 */
export function clearColorVariables(): void {
  const collections = figma.variables.getLocalVariableCollections();
  const kumoColors = collections.find(
    (c) => c.name === figmaVariablesData.collectionName,
  );

  if (kumoColors) {
    // Remove all variables
    for (const varId of kumoColors.variableIds) {
      const variable = figma.variables.getVariableById(varId);
      if (variable) {
        variable.remove();
      }
    }
    // Remove collection
    kumoColors.remove();
  }

  // Clear cache
  _kumoColorsCollection = null;
  _variableCache.clear();

  console.log(`🗑️ Cleared ${figmaVariablesData.collectionName} collection`);
}

/**
 * Get a variable by name from the kumo-colors collection.
 * The collection must be initialized first with initializeColorVariables().
 *
 * @param variableName - Variable name (e.g., "text-color-kumo-default", "color-kumo-base")
 * @returns Variable or undefined if not found
 *
 * @example
 * const textVar = getVariableByName("text-color-kumo-default");
 * if (textVar) {
 *   bindTextColorToVariable(textNode, textVar.id);
 * }
 */
export function getVariableByName(variableName: string): Variable | undefined {
  // Check cache first
  const cached = _variableCache.get(variableName);
  if (cached) {
    return cached;
  }

  // Try to find in collection
  const collections = figma.variables.getLocalVariableCollections();
  const kumoColors = collections.find(
    (c) => c.name === figmaVariablesData.collectionName,
  );

  if (!kumoColors) {
    console.warn(
      `${figmaVariablesData.collectionName} collection not found. Call initializeColorVariables() first.`,
    );
    return undefined;
  }

  const variables = kumoColors.variableIds
    .map((id) => figma.variables.getVariableById(id))
    .filter((v): v is Variable => v !== null);

  const variable = variables.find((v) => v.name === variableName);

  if (variable) {
    _variableCache.set(variableName, variable);
    return variable;
  }

  console.warn(
    `Variable "${variableName}" not found in ${figmaVariablesData.collectionName} collection`,
  );
  return undefined;
}

/**
 * Get or create a variable with opacity applied.
 * If the variable name includes an opacity suffix (e.g., "color-kumo-info/20"),
 * this will create a new variable with the opacity pre-multiplied into the RGB values.
 *
 * @param variableNameWithOpacity - Variable name possibly with opacity suffix (e.g., "color-kumo-info/20")
 * @returns Variable with opacity baked in, or undefined if base variable not found
 */
export function getOrCreateVariableWithOpacity(
  variableNameWithOpacity: string,
): Variable | undefined {
  // Check if this is an opacity variant
  const { baseName, opacity } = parseVariableWithOpacity(
    variableNameWithOpacity,
  );

  // If no opacity, just return the regular variable
  if (opacity === undefined) {
    return getVariableByName(baseName);
  }

  // Check cache for the opacity variant
  const opacityVarName = `${baseName}/${Math.round(opacity * 100)}`;
  const cached = _variableCache.get(opacityVarName);
  if (cached) {
    return cached;
  }

  // Get the base variable to read its color values
  const baseVariable = getVariableByName(baseName);
  if (!baseVariable) {
    return undefined;
  }

  // Get the collection
  const collections = figma.variables.getLocalVariableCollections();
  const kumoColors = collections.find(
    (c) => c.name === figmaVariablesData.collectionName,
  );
  if (!kumoColors) {
    return undefined;
  }

  // Get mode IDs
  const lightModeId = kumoColors.modes.find((m) => m.name === "Light")?.modeId;
  const darkModeId = kumoColors.modes.find((m) => m.name === "Dark")?.modeId;
  if (!lightModeId || !darkModeId) {
    return undefined;
  }

  // Find the base variable definition to get its colors
  const baseVarDef = figmaVariablesData.variables.find(
    (v) => v.name === baseName,
  );
  if (!baseVarDef) {
    console.warn(`Base variable definition not found for ${baseName}`);
    return undefined;
  }

  // Create new variable with opacity in name
  const opacityVariable = figma.variables.createVariable(
    opacityVarName,
    kumoColors,
    "COLOR",
  );

  // Apply opacity by blending with the appropriate background color for each mode
  // Light mode: blend towards white (1, 1, 1)
  // Dark mode: blend towards kumo-base dark which is black (0, 0, 0)
  //
  // Alpha blending formula: result = background * (1 - alpha) + foreground * alpha
  const lightColor: RGBA = {
    r: 1 + (baseVarDef.light.r - 1) * opacity,
    g: 1 + (baseVarDef.light.g - 1) * opacity,
    b: 1 + (baseVarDef.light.b - 1) * opacity,
    a: 1,
  };

  const darkColor: RGBA = {
    r: baseVarDef.dark.r * opacity,
    g: baseVarDef.dark.g * opacity,
    b: baseVarDef.dark.b * opacity,
    a: 1,
  };

  opacityVariable.setValueForMode(lightModeId, lightColor);
  opacityVariable.setValueForMode(darkModeId, darkColor);

  console.log(`✅ Created opacity variable: ${opacityVarName}`);
  _variableCache.set(opacityVarName, opacityVariable);

  return opacityVariable;
}

/**
 * Helper to set white text color (hardcoded, not a variable)
 *
 * @param textNode - Text node to apply white color to
 */
export function setWhiteTextColor(textNode: TextNode): void {
  const fill: SolidPaint = {
    type: "SOLID",
    color: { r: 1, g: 1, b: 1 },
  };
  textNode.fills = [fill];
}

/**
 * Helper to bind text color to a Figma variable
 *
 * @param textNode - Text node to apply color to
 * @param variableId - Figma variable ID
 */
export function bindTextColorToVariable(
  textNode: TextNode,
  variableId: string,
): void {
  const variable = figma.variables.getVariableById(variableId);
  if (!variable) {
    console.warn("Variable not found: " + variableId);
    figma.notify(`⚠️ Text color variable not found: ${variableId}`, {
      error: true,
    });
    return;
  }

  let fill: SolidPaint = {
    type: "SOLID",
    color: { r: 1, g: 1, b: 1 },
  };

  fill = figma.variables.setBoundVariableForPaint(fill, "color", variable);
  textNode.fills = [fill];
}

/**
 * Section configuration for consistent styling
 */
export const SECTION_CONFIG = {
  /** Padding inside section */
  padding: 48,
  /** Minimum width */
  minWidth: 400,
  /** Minimum height */
  minHeight: 200,
} as const;

/**
 * Color mode for sections
 */
export type ColorMode = "light" | "dark";

/**
 * Get the kumo-colors collection and its mode IDs
 */
function getKumoColorsModes(): {
  collection: VariableCollection;
  lightModeId: string;
  darkModeId: string;
} | null {
  const collections = figma.variables.getLocalVariableCollections();
  const kumoColors = collections.find((c) => c.name === "kumo-colors");

  if (!kumoColors) {
    console.warn("kumo-colors collection not found");
    return null;
  }

  // Find light and dark mode IDs
  const lightMode = kumoColors.modes.find(
    (m) => m.name.toLowerCase() === "light",
  );
  const darkMode = kumoColors.modes.find(
    (m) => m.name.toLowerCase() === "dark",
  );

  if (!lightMode || !darkMode) {
    console.warn("Light or dark mode not found in kumo-colors collection");
    return null;
  }

  return {
    collection: kumoColors,
    lightModeId: lightMode.modeId,
    darkModeId: darkMode.modeId,
  };
}

/**
 * Result from creating a mode section - contains the frame
 */
export type ModeSectionResult = {
  /** The frame with variable-bound background (for backwards compatibility, same as frame) */
  section: FrameNode;
  /** The frame with variable-bound background */
  frame: FrameNode;
};

/**
 * Create a frame with bg-kumo-base variable fill and explicit color mode
 *
 * The frame provides:
 * - Variable-bound background (bg-kumo-base)
 * - Explicit color mode (light/dark)
 * - Plain styling without borders
 *
 * @param page - Page to create frame on
 * @param sectionName - Section name (used for frame name)
 * @param mode - Color mode ("light" or "dark")
 * @returns Object with frame (section property is alias for backwards compatibility)
 */
export function createModeSection(
  page: PageNode | DocumentNode,
  sectionName: string,
  mode: ColorMode,
): ModeSectionResult {
  // Create frame directly (no Section wrapper)
  const frame = figma.createFrame();
  frame.name = `${sectionName} (${mode})`;
  frame.layoutMode = "NONE"; // Components will be positioned manually

  // Get the surface variable for background
  const surfaceVar = getVariableByName(VAR_NAMES.color.base);

  if (surfaceVar) {
    // Create fill bound to surface variable
    let fill: SolidPaint = {
      type: "SOLID",
      color: { r: 1, g: 1, b: 1 },
    };
    fill = figma.variables.setBoundVariableForPaint(fill, "color", surfaceVar);
    frame.fills = [fill];
  } else {
    // Fallback to static colors if variable not found
    frame.fills = [
      {
        type: "SOLID",
        color:
          mode === "light"
            ? { r: 1, g: 1, b: 1 } // White
            : { r: 0.067, g: 0.067, b: 0.067 }, // #111111
      },
    ];
  }

  // Set explicit variable mode on the frame
  const modesInfo = getKumoColorsModes();
  if (modesInfo) {
    const modeId =
      mode === "light" ? modesInfo.lightModeId : modesInfo.darkModeId;
    frame.setExplicitVariableModeForCollection(modesInfo.collection, modeId);
  }

  // @ts-expect-error - Figma types are overly strict for appendChild
  page.appendChild(frame);

  // Return frame as both section and frame for backwards compatibility
  return { section: frame, frame };
}

/**
 * Result from creating a component section pair with title
 */
export type ComponentSectionPairResult = {
  /** The light mode section */
  lightSection: ModeSectionResult;
  /** The dark mode section */
  darkSection: ModeSectionResult;
  /** The section title text node (inside light section) */
  title: TextNode;
  /** The Y position after all elements (for next section placement) */
  nextY: number;
};

/**
 * Create a pair of light/dark mode frames with a title inside each
 *
 * This helper creates a uniform layout for component sections:
 * - Light mode frame with title text inside at the top
 * - Dark mode frame with title text inside at the top
 * - Both frames positioned side by side
 *
 * @param page - Page to create frames on
 * @param componentName - Component name for title and frame names
 * @param startY - Y position to start
 * @param sectionWidth - Width of each frame
 * @param sectionHeight - Height of each frame
 * @returns Object with both sections, title, and next Y position
 *
 * @example
 * const { lightSection, darkSection, title, nextY } = await createComponentSectionPair(
 *   page,
 *   "Button",
 *   100,
 *   800,
 *   600
 * );
 */
export async function createComponentSectionPair(
  page: PageNode,
  componentName: string,
  startY: number,
  sectionWidth: number,
  sectionHeight: number,
): Promise<ComponentSectionPairResult> {
  // Create light mode section
  const lightSection = createModeSection(page, componentName, "light");
  lightSection.frame.resize(sectionWidth, sectionHeight);
  lightSection.frame.x = SECTION_LAYOUT.startX;
  lightSection.frame.y = startY;

  // Create dark mode section (positioned to the right)
  const darkSection = createModeSection(page, componentName, "dark");
  darkSection.frame.resize(sectionWidth, sectionHeight);
  darkSection.frame.x =
    lightSection.frame.x + sectionWidth + SECTION_LAYOUT.modeGap;
  darkSection.frame.y = startY;

  // Add title text inside the light section frame
  const title = await createTextNode(
    componentName,
    SECTION_TITLE.fontSize,
    600,
  );
  title.x = SECTION_PADDING;
  title.y = SECTION_PADDING;

  // Bind title color to text-color-kumo-default variable
  const surfaceTextVar = getVariableByName(VAR_NAMES.text.default);
  if (surfaceTextVar) {
    bindTextColorToVariable(title, surfaceTextVar.id);
  }
  lightSection.frame.appendChild(title);

  // Add title text inside the dark section frame too
  const darkTitle = await createTextNode(
    componentName,
    SECTION_TITLE.fontSize,
    600,
  );
  darkTitle.x = SECTION_PADDING;
  darkTitle.y = SECTION_PADDING;
  if (surfaceTextVar) {
    bindTextColorToVariable(darkTitle, surfaceTextVar.id);
  }
  darkSection.frame.appendChild(darkTitle);

  // Calculate next Y position
  const nextY = startY + sectionHeight + SECTION_GAP;

  return {
    lightSection,
    darkSection,
    title,
    nextY,
  };
}

/**
 * Create a component property definition
 *
 * @param name - Property name
 * @param type - Property type
 * @param options - Additional options (default value, variant options, etc.)
 * @returns Component property definition
 */
export type ComponentPropertyOptions = {
  defaultValue?: string | boolean;
  variantOptions?: string[];
};

export function createComponentProperty(
  name: string,
  type: "BOOLEAN" | "TEXT" | "INSTANCE_SWAP" | "VARIANT",
  options?: ComponentPropertyOptions,
): ComponentPropertyDefinition {
  const baseProperty = {
    type,
  };

  if (type === "BOOLEAN" && options?.defaultValue !== undefined) {
    return {
      ...baseProperty,
      type: "BOOLEAN",
      defaultValue: Boolean(options.defaultValue),
    };
  }

  if (type === "TEXT" && options?.defaultValue !== undefined) {
    return {
      ...baseProperty,
      type: "TEXT",
      defaultValue: String(options.defaultValue),
    };
  }

  if (type === "VARIANT" && options?.variantOptions) {
    return {
      ...baseProperty,
      type: "VARIANT",
      defaultValue: String(options?.defaultValue || options.variantOptions[0]),
      variantOptions: options.variantOptions,
    };
  }

  if (type === "INSTANCE_SWAP") {
    return {
      ...baseProperty,
      type: "INSTANCE_SWAP",
    };
  }

  return baseProperty as ComponentPropertyDefinition;
}

/**
 * Apply corner radius to a node
 *
 * @param node - Node to apply radius to
 * @param radius - Radius value (number or preset key)
 */
export function applyCornerRadius(
  node: SceneNode,
  radius: number | keyof typeof BORDER_RADIUS,
): void {
  if (!("cornerRadius" in node)) return;

  const radiusValue =
    typeof radius === "number" ? radius : BORDER_RADIUS[radius];
  node.cornerRadius = radiusValue;
}

/**
 * Find a ComponentSet by name on the Components page
 *
 * @param componentSetName - Name of the ComponentSet (e.g., "Checkbox", "Button")
 * @returns ComponentSetNode if found, undefined otherwise
 */
export function findComponentSet(
  componentSetName: string,
): ComponentSetNode | undefined {
  // Use the current page (should be "ui kit" page set by code.ts)
  const currentPage = figma.currentPage;

  // Search recursively for the ComponentSet (it may be inside sections/frames)
  function findInNode(node: SceneNode): ComponentSetNode | undefined {
    if (node.type === "COMPONENT_SET" && node.name === componentSetName) {
      return node as ComponentSetNode;
    }

    if ("children" in node && node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const found = findInNode(node.children[i]);
        if (found) return found;
      }
    }

    return undefined;
  }

  for (let i = 0; i < currentPage.children.length; i++) {
    const found = findInNode(currentPage.children[i]);
    if (found) return found;
  }

  console.warn("ComponentSet not found: " + componentSetName);
  return undefined;
}

/**
 * Create an instance of a component variant from a ComponentSet
 *
 * @param componentSetName - Name of the ComponentSet (e.g., "Checkbox")
 * @param variantProps - Object with variant property values (e.g., { state: "checked", variant: "default" })
 * @returns InstanceNode if found, undefined otherwise
 *
 * @example
 * const checkbox = createComponentInstance("Checkbox", { state: "checked", variant: "default", disabled: "false" });
 */
export function createComponentInstance(
  componentSetName: string,
  variantProps: Record<string, string>,
): InstanceNode | undefined {
  const componentSet = findComponentSet(componentSetName);
  if (!componentSet) {
    return undefined;
  }

  // Build the variant name string (e.g., "state=checked, variant=default, disabled=false")
  const variantName = Object.entries(variantProps)
    .map(function (entry) {
      return entry[0] + "=" + entry[1];
    })
    .join(", ");

  // Find the matching component variant
  const children = componentSet.children;
  if (!children) {
    return undefined;
  }

  const variant = children.find(function (child) {
    return child.type === "COMPONENT" && child.name === variantName;
  }) as ComponentNode | undefined;

  if (!variant) {
    console.warn(
      "Variant not found in " + componentSetName + ": " + variantName,
    );
    return undefined;
  }

  return variant.createInstance();
}
