/**
 * Breadcrumbs Component Generator
 *
 * Generates Breadcrumbs ComponentSet in Figma with size variants.
 * Reads variant definitions from component-registry.json (the source of truth).
 */

import {
  createTextNode,
  bindTextColorToVariable,
  getVariableByName,
  createModeSection,
  createRowLabel,
  SECTION_PADDING,
  SECTION_GAP,
  GRID_LAYOUT,
  SECTION_LAYOUT,
  SECTION_TITLE,
  FONT_SIZE,
  FALLBACK_VALUES,
  VAR_NAMES,
} from "./shared";
import themeData from "../generated/theme-data.json";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import { logInfo, logWarn } from "../logger";

// Import variant data from the registry
import registry from "@cloudflare/kumo/ai/component-registry.json";

const breadcrumbsComponent = registry.components.Breadcrumbs;
const breadcrumbsProps = breadcrumbsComponent.props;
const sizeProp = breadcrumbsProps.size as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

/**
 * TESTABLE EXPORTS - Pure functions that return intermediate data
 * These functions compute data without calling Figma APIs, enabling snapshot tests.
 */

/**
 * Get size configuration from registry
 */
export function getBreadcrumbsSizeConfig() {
  return {
    values: sizeProp.values,
    classes: sizeProp.classes,
    descriptions: sizeProp.descriptions,
    default: sizeProp.default,
  };
}

/**
 * Get parsed size styles for a specific size
 */
export function getBreadcrumbsParsedSizeStyles(size: string) {
  const classes = sizeProp.classes[size] || "";
  return {
    size,
    classes,
    description: sizeProp.descriptions[size] || "",
    parsed: parseTailwindClasses(classes),
  };
}

/**
 * Get color bindings for breadcrumb elements
 */
export function getBreadcrumbsColorBindings() {
  return {
    link: VAR_NAMES.text.subtle, // Links use text-kumo-subtle
    current: VAR_NAMES.text.default, // Current page uses default text color
    separator: VAR_NAMES.text.inactive, // Separator uses disabled color
  };
}

/**
 * Get separator icon configuration
 */
export function getBreadcrumbsSeparatorConfig() {
  return {
    iconName: "ph-caret-right",
    size: FALLBACK_VALUES.iconSize.base, // 20px - size-5 from Tailwind spacing scale
  };
}

/**
 * Get all breadcrumbs data (for snapshot testing)
 */
export function getAllBreadcrumbsData() {
  const sizeConfig = getBreadcrumbsSizeConfig();
  const colorBindings = getBreadcrumbsColorBindings();
  const separatorConfig = getBreadcrumbsSeparatorConfig();

  return {
    sizeConfig,
    sizes: sizeConfig.values.map((size) => {
      const sizeData = getBreadcrumbsParsedSizeStyles(size);
      return {
        ...sizeData,
        // Layout calculations
        layout: {
          // Fallbacks derived from Tailwind spacing scale
          height:
            sizeData.parsed.height ??
            (size === "sm"
              ? themeData.tailwind.spacing.scale["10"]
              : themeData.tailwind.spacing.scale["12"]),
          gap:
            sizeData.parsed.gap ??
            (size === "sm"
              ? themeData.tailwind.spacing.scale["0.5"]
              : themeData.tailwind.spacing.scale["1"]),
          fontSize:
            sizeData.parsed.fontSize ??
            (size === "sm" ? FONT_SIZE.base : FONT_SIZE.lg),
          itemGap: themeData.tailwind.spacing.scale["1"], // gap-1 between icon and text within item
        },
      };
    }),
    colorBindings,
    separatorConfig,
  };
}

/**
 * Create a single Breadcrumbs component with the specified size
 */
async function createBreadcrumbsComponent(
  size: string,
): Promise<ComponentNode> {
  const classes = sizeProp.classes[size] || "";
  const description = sizeProp.descriptions[size] || "";

  // Parse size styles
  const sizeStyles = parseTailwindClasses(classes);

  // Create component
  const component = figma.createComponent();
  component.name = `size=${size}`;
  component.description = description;

  // Set up auto-layout (horizontal layout for breadcrumb items)
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "FIXED";

  // Apply height from parsed styles with fallback (h-10=40px for sm, h-12=48px for base)
  const height =
    sizeStyles.height ??
    (size === "sm"
      ? themeData.tailwind.spacing.scale["10"]
      : themeData.tailwind.spacing.scale["12"]);
  component.resize(component.width, height);

  // Apply gap between items (link, separator, link, separator, current)
  // gap-0.5=2px for sm, gap-1=4px for base
  const gap =
    sizeStyles.gap ??
    (size === "sm"
      ? themeData.tailwind.spacing.scale["0.5"]
      : themeData.tailwind.spacing.scale["1"]);
  component.itemSpacing = gap;

  // Get font size for text elements (text-base=14px for sm, text-lg=16px for base)
  const fontSize =
    sizeStyles.fontSize ?? (size === "sm" ? FONT_SIZE.base : FONT_SIZE.lg);

  // Get color variables
  const linkTextVar = getVariableByName(VAR_NAMES.text.muted);
  const currentTextVar = getVariableByName(VAR_NAMES.text.surface);
  const separatorTextVar = getVariableByName(VAR_NAMES.text.disabled);

  // Create breadcrumb structure: Link > Separator > Link > Separator > Current
  // 1. First Link
  const link1 = figma.createFrame();
  link1.name = "Link";
  link1.layoutMode = "HORIZONTAL";
  link1.primaryAxisAlignItems = "CENTER";
  link1.counterAxisAlignItems = "CENTER";
  link1.itemSpacing = themeData.tailwind.spacing.scale["1"]; // gap-1
  link1.primaryAxisSizingMode = "AUTO";
  link1.counterAxisSizingMode = "AUTO";
  link1.fills = [];

  const link1Text = await createTextNode("Home", fontSize, 400);
  if (linkTextVar) {
    bindTextColorToVariable(link1Text, linkTextVar.id);
  }
  link1.appendChild(link1Text);

  component.appendChild(link1);

  // 2. First Separator
  const sep1 = await createSeparatorIcon(separatorTextVar?.id);
  component.appendChild(sep1);

  // 3. Second Link
  const link2 = figma.createFrame();
  link2.name = "Link";
  link2.layoutMode = "HORIZONTAL";
  link2.primaryAxisAlignItems = "CENTER";
  link2.counterAxisAlignItems = "CENTER";
  link2.itemSpacing = themeData.tailwind.spacing.scale["1"]; // gap-1
  link2.primaryAxisSizingMode = "AUTO";
  link2.counterAxisSizingMode = "AUTO";
  link2.fills = [];

  const link2Text = await createTextNode("Projects", fontSize, 400);
  if (linkTextVar) {
    bindTextColorToVariable(link2Text, linkTextVar.id);
  }
  link2.appendChild(link2Text);

  component.appendChild(link2);

  // 4. Second Separator
  const sep2 = await createSeparatorIcon(separatorTextVar?.id);
  component.appendChild(sep2);

  // 5. Current (bold, different color)
  const current = figma.createFrame();
  current.name = "Current";
  current.layoutMode = "HORIZONTAL";
  current.primaryAxisAlignItems = "CENTER";
  current.counterAxisAlignItems = "CENTER";
  current.itemSpacing = themeData.tailwind.spacing.scale["1"]; // gap-1
  current.primaryAxisSizingMode = "AUTO";
  current.counterAxisSizingMode = "AUTO";
  current.fills = [];

  const currentText = await createTextNode("Current Project", fontSize, 500); // medium weight
  if (currentTextVar) {
    bindTextColorToVariable(currentText, currentTextVar.id);
  }
  current.appendChild(currentText);

  component.appendChild(current);

  return component;
}

/**
 * Create separator icon (caret-right chevron)
 */
async function createSeparatorIcon(
  textVariableId?: string,
): Promise<FrameNode> {
  const separatorFrame = figma.createFrame();
  separatorFrame.name = "Separator";
  // Separator icon container - size-6 = 24px from Tailwind spacing scale
  const separatorSize = themeData.tailwind.spacing.scale["6"];
  separatorFrame.resize(separatorSize, separatorSize);
  separatorFrame.fills = [];
  separatorFrame.layoutMode = "HORIZONTAL";
  separatorFrame.primaryAxisAlignItems = "CENTER";
  separatorFrame.counterAxisAlignItems = "CENTER";

  // Create SVG with explicit stroke color (not currentColor) so Figma can parse it
  // This matches the SVG path from breadcrumbs.tsx: "M10.75 8.75L14.25 12L10.75 15.25"
  const disabledGray = "#999999"; // text-kumo-inactive equivalent
  const svgString = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.75 8.75L14.25 12L10.75 15.25" stroke="${disabledGray}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  try {
    const svgNode = figma.createNodeFromSvg(svgString);
    svgNode.name = "chevron";

    // Try to bind stroke color to variable on the path children
    if (textVariableId && "children" in svgNode) {
      for (const child of svgNode.children) {
        if ("strokes" in child && child.strokes && child.strokes.length > 0) {
          try {
            const variable = figma.variables.getVariableById(textVariableId);
            if (variable) {
              // Use setBoundVariable with field name only (Figma plugin API)
              (
                child as SceneNode & {
                  setBoundVariable: (field: string, variable: Variable) => void;
                }
              ).setBoundVariable("strokes", variable);
            }
          } catch {
            // Keep the solid color fallback
          }
        }
      }
    }

    separatorFrame.appendChild(svgNode);
  } catch (error) {
    logWarn(`Failed to create separator icon: ${error}`);
    // Fallback: create a simple text chevron
    const fallbackText = await createTextNode(">", 16, 400);
    separatorFrame.appendChild(fallbackText);
  }

  return separatorFrame;
}

/**
 * Generate Breadcrumbs ComponentSet with size property
 *
 * Creates a "Breadcrumbs" ComponentSet with variants derived from
 * component-registry.json. Creates both light and dark mode sections.
 *
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateBreadcrumbsComponents(
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  // Get size keys from the registry
  const sizes = sizeProp.values;
  const components: ComponentNode[] = [];

  // Track row labels: { y, text }
  const rowLabels: { y: number; text: string }[] = [];

  // Layout spacing - vertical layout with labels
  const rowGap = GRID_LAYOUT.rowGap.medium;
  const labelColumnWidth = GRID_LAYOUT.labelColumnWidth.medium;

  // Track position for laying out components vertically
  let currentY = 0;

  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const component = await createBreadcrumbsComponent(size);

    // Record row label
    rowLabels.push({ y: currentY, text: `size=${size}` });

    // Position each component vertically with label offset
    component.x = labelColumnWidth;
    component.y = currentY;
    currentY += component.height + rowGap;
    components.push(component);
  }

  // Combine all variants into a single ComponentSet
  const componentSet = figma.combineAsVariants(components, figma.currentPage);
  componentSet.name = "Breadcrumbs";
  componentSet.description = "Breadcrumbs component with size variants";

  // Calculate content dimensions (add label column width)
  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height;

  // Content Y offset to make room for title inside frame
  const contentYOffset = SECTION_TITLE.height;

  // Create light mode section
  const lightSection = createModeSection(
    figma.currentPage,
    "Breadcrumbs",
    "light",
  );
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Create dark mode section
  const darkSection = createModeSection(
    figma.currentPage,
    "Breadcrumbs",
    "dark",
  );
  darkSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Add title inside each frame

  // Move ComponentSet into light section frame
  lightSection.frame.appendChild(componentSet);
  componentSet.x = SECTION_PADDING + labelColumnWidth;
  componentSet.y = SECTION_PADDING + contentYOffset;

  // Add row labels to light section
  for (const label of rowLabels) {
    const labelNode = await createRowLabel(
      label.text,
      SECTION_PADDING,
      SECTION_PADDING +
        contentYOffset +
        label.y +
        GRID_LAYOUT.labelVerticalOffset.mdLg, // Center vertically with breadcrumbs
    );
    lightSection.frame.appendChild(labelNode);
  }

  // Create instances for dark section
  for (const component of components) {
    const instance = component.createInstance();
    instance.x = component.x + SECTION_PADDING + labelColumnWidth;
    instance.y = component.y + SECTION_PADDING + contentYOffset;
    darkSection.frame.appendChild(instance);
  }

  // Add row labels to dark section
  for (const label of rowLabels) {
    const labelNode = await createRowLabel(
      label.text,
      SECTION_PADDING,
      SECTION_PADDING +
        contentYOffset +
        label.y +
        GRID_LAYOUT.labelVerticalOffset.mdLg,
    );
    darkSection.frame.appendChild(labelNode);
  }

  // Resize sections to fit content with padding
  const totalWidth = contentWidth + SECTION_PADDING * 2;
  const totalHeight = contentHeight + SECTION_PADDING * 2 + contentYOffset;

  lightSection.section.resizeWithoutConstraints(totalWidth, totalHeight);
  darkSection.section.resizeWithoutConstraints(totalWidth, totalHeight);

  // Position sections at startY (no title offset needed since title is inside)
  lightSection.frame.x = SECTION_LAYOUT.startX;
  lightSection.frame.y = startY;

  darkSection.frame.x =
    lightSection.frame.x + totalWidth + SECTION_LAYOUT.modeGap;
  darkSection.frame.y = startY;

  logInfo(
    `✅ Generated Breadcrumbs ComponentSet with ${sizes.length} sizes (light + dark)`,
  );

  return startY + totalHeight + SECTION_GAP;
}
