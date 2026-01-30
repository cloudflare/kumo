import { logComplete } from "../logger";
/**
 * Surface Component Generator
 *
 * Generates a Surface ComponentSet in Figma that matches
 * the Surface component styling:
 *
 * - A simple container with shadow and border
 * - Polymorphic (can be any element), but visually just a styled container
 *
 * The Surface is a layout primitive with shadow-xs and ring ring-border.
 *
 * @see packages/kumo/src/components/surface/surface.tsx
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
  SECTION_PADDING,
  SECTION_GAP,
  SECTION_LAYOUT,
  SHADOWS,
  FONT_SIZE,
  FALLBACK_VALUES,
  GRID_LAYOUT,
  VAR_NAMES,
} from "./shared";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import themeData from "../generated/theme-data.json";

/**
 * Base styles from Surface component
 */
const BASE_STYLES = "shadow-xs ring ring-kumo-line";

/**
 * Create a single Surface component
 */
async function createSurfaceComponent(): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = "Surface";
  component.description =
    "A container component with shadow and border for creating elevated surfaces.";

  // Set up the surface frame
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.primaryAxisAlignItems = "MIN";
  component.counterAxisAlignItems = "MIN";
  component.paddingLeft = themeData.tailwind.spacing.scale["4"]; // p-4 = 16px
  component.paddingRight = themeData.tailwind.spacing.scale["4"]; // p-4 = 16px
  component.paddingTop = themeData.tailwind.spacing.scale["4"]; // p-4 = 16px
  component.paddingBottom = themeData.tailwind.spacing.scale["4"]; // p-4 = 16px
  component.itemSpacing = themeData.tailwind.spacing.scale["2"]; // gap-2 = 8px
  component.cornerRadius = BORDER_RADIUS.lg;

  // Apply background fill (bg-kumo-base for the container)
  const bgVar = getVariableByName(VAR_NAMES.color.base);
  if (bgVar) {
    bindFillToVariable(component, bgVar.id);
  }

  // Apply border (ring ring-kumo-line)
  const borderVar = getVariableByName(VAR_NAMES.color.line);
  if (borderVar) {
    bindStrokeToVariable(component, borderVar.id, 1);
  }

  // Apply shadow effect (shadow-xs) - using centralized SHADOWS preset
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

  // Add sample content text
  const contentText = await createTextNode(
    "Surface content",
    FONT_SIZE.base, // 14px from theme-kumo.css
    FALLBACK_VALUES.fontWeight.normal, // 400
  );
  contentText.name = "Content";
  contentText.textAutoResize = "WIDTH_AND_HEIGHT";

  const textVar = getVariableByName(VAR_NAMES.text.default);
  if (textVar) {
    bindTextColorToVariable(contentText, textVar.id);
  }

  component.appendChild(contentText);

  return component;
}

/**
 * Generate Surface ComponentSet
 *
 * Creates a "Surface" ComponentSet with a single variant showing
 * the surface styling (shadow + border).
 *
 * Creates both light and dark mode sections.
 */
export async function generateSurfaceComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  figma.currentPage = page;

  const components: ComponentNode[] = [];
  const rowLabels: { y: number; text: string }[] = [];

  const labelColumnWidth = 100;

  // Create single surface component
  const component = await createSurfaceComponent();
  component.x = labelColumnWidth;
  component.y = 0;
  rowLabels.push({ y: 0, text: "default" });
  components.push(component);

  // Combine into ComponentSet (even with single variant for consistency)
  // @ts-ignore
  const componentSet = figma.combineAsVariants(components, page);
  componentSet.name = "Surface";
  componentSet.description =
    "A polymorphic container component for creating elevated surfaces with shadow and border.";
  componentSet.layoutMode = "NONE";

  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height;

  // Create sections
  const lightSection = createModeSection(page, "Surface", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2,
  );

  const darkSection = createModeSection(page, "Surface", "dark");
  darkSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2,
  );

  // Move ComponentSet into light section
  lightSection.frame.appendChild(componentSet);
  componentSet.x = SECTION_PADDING + labelColumnWidth;
  componentSet.y = SECTION_PADDING;

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
    instance.y = origComp.y + SECTION_PADDING;
    darkSection.frame.appendChild(instance);
  }

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
    "Generated Surface ComponentSet with " +
      components.length +
      " variants (light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}

// ============================================================================
// TESTABLE EXPORTS
// ============================================================================

/**
 * Get Surface dimensions configuration
 *
 * Returns the dimensions used for the Surface container.
 * Values are derived from theme-data.json (Tailwind spacing scale).
 */
export function getSurfaceDimensionsConfig() {
  return {
    paddingLeft: themeData.tailwind.spacing.scale["4"], // p-4 = 16px
    paddingRight: themeData.tailwind.spacing.scale["4"], // p-4 = 16px
    paddingTop: themeData.tailwind.spacing.scale["4"], // p-4 = 16px
    paddingBottom: themeData.tailwind.spacing.scale["4"], // p-4 = 16px
    itemSpacing: themeData.tailwind.spacing.scale["2"], // gap-2 = 8px
    cornerRadius: BORDER_RADIUS.lg,
  };
}

/**
 * Get Surface color bindings
 *
 * Returns the semantic color tokens used for Surface styling.
 */
export function getSurfaceColorBindings() {
  return {
    background: VAR_NAMES.color.base,
    border: VAR_NAMES.color.line,
    text: VAR_NAMES.text.default,
  };
}

/**
 * Get Surface shadow configuration
 *
 * Returns the shadow effect configuration (shadow-xs).
 * Uses centralized SHADOWS.xs preset for consistency.
 */
export function getSurfaceShadowConfig() {
  return {
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: SHADOWS.xs.opacity },
    offset: { x: SHADOWS.xs.offsetX, y: SHADOWS.xs.offsetY },
    radius: SHADOWS.xs.blur,
    spread: SHADOWS.xs.spread,
  };
}

/**
 * Get parsed base styles
 *
 * Returns the parsed Tailwind classes from Surface's base styles.
 */
export function getSurfaceParsedBaseStyles() {
  return parseTailwindClasses(BASE_STYLES);
}

/**
 * Get all Surface data
 *
 * Returns complete intermediate data structure for the Surface component.
 * This is used for snapshot testing to catch unintended changes.
 */
export function getAllSurfaceData() {
  const dimensions = getSurfaceDimensionsConfig();
  const colorBindings = getSurfaceColorBindings();
  const shadowConfig = getSurfaceShadowConfig();
  const parsedBaseStyles = getSurfaceParsedBaseStyles();

  return {
    baseStyles: {
      raw: BASE_STYLES,
      parsed: parsedBaseStyles,
    },
    dimensions: dimensions,
    colorBindings: colorBindings,
    shadowConfig: shadowConfig,
    contentText: {
      text: "Surface content",
      fontSize: FONT_SIZE.base, // 14px from theme-kumo.css
      fontWeight: FALLBACK_VALUES.fontWeight.normal, // 400
    },
  };
}
