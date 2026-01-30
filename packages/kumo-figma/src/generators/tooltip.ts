import { logComplete } from "../logger";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
/**
 * Tooltip Component Generator
 *
 * Generates a Tooltip component in Figma that matches
 * the Tooltip component popup styling:
 *
 * - Static visual representation of an OPEN tooltip popup
 * - Tooltip has bg-kumo-base, text-kumo-default, rounded-md, px-2.5 py-1.5 padding
 * - Includes an arrow/pointer
 *
 * The Tooltip has:
 * - Container with bg-kumo-base, text-kumo-default, rounded-md, px-2.5 py-1.5
 * - Arrow pointing down (for a top-positioned tooltip)
 * - Text content with text-sm
 *
 * Uses semantic tokens bound to Figma variables:
 * - bg-kumo-base → color-kumo-base
 * - text-kumo-default → text-color-kumo-default
 * - Arrow uses fill matching bg-kumo-base
 *
 * @see packages/kumo/src/components/tooltip/tooltip.tsx
 */

import {
  createTextNode,
  getVariableByName,
  createModeSection,
  bindFillToVariable,
  bindStrokeToVariable,
  bindTextColorToVariable,
  BORDER_RADIUS,
  SECTION_PADDING,
  SECTION_GAP,
  SECTION_LAYOUT,
  FONT_SIZE,
  FALLBACK_VALUES,
  VAR_NAMES,
  COLORS,
} from "./shared";
import themeData from "../generated/theme-data.json";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

/**
 * Tooltip dimensions
 * FIGMA-SPECIFIC: Arrow dimensions are for Figma canvas rendering only,
 * not derived from design tokens (no CSS equivalent for tooltip arrows)
 */
const ARROW_WIDTH = 20;
const ARROW_HEIGHT = 10;

/**
 * Tooltip styling - read from React component
 * Matches the actual Tooltip.Popup styles from tooltip.tsx:
 * "rounded-md bg-kumo-base px-2.5 py-1.5 text-sm text-kumo-default"
 * "shadow-lg shadow-kumo-tip-shadow outline outline-kumo-fill"
 */
const tooltipComponent = registry.components.Tooltip;

// Tooltip popup styles from tooltip.tsx
const TOOLTIP_BOX_STYLES =
  "rounded-md bg-kumo-base px-2.5 py-1.5 text-sm text-kumo-default";
// Use centralized values from shared.ts to prevent drift
const TOOLTIP_TEXT_SIZE = FONT_SIZE.sm; // text-sm from theme-data.json
const TOOLTIP_TEXT_WEIGHT = FALLBACK_VALUES.fontWeight.normal; // font-normal from theme-data.json

/**
 * Create a tooltip arrow matching the React component's ArrowSvg
 *
 * The React component uses an SVG with 3 paths:
 * 1. ArrowFill - The main arrow body (fill-kumo-base)
 * 2. ArrowOuterStroke - Border visible in light mode (fill-kumo-tip-shadow)
 * 3. ArrowInnerStroke - Border stroke (fill-kumo-tip-stroke) - matches tooltip outline
 *
 * Uses figma.createNodeFromSvg() to import the exact SVG from the React component,
 * then binds semantic color variables to each path.
 *
 * @returns FrameNode containing the arrow vectors
 */
function createTooltipArrow(): FrameNode {
  // Arrow SVG pointing DOWN (for tooltip appearing above trigger)
  // This matches the React component's ArrowSvg WITHOUT the rotate-180 transform
  // The paths are the arrow shape only - no rectangular cap to "complete" the path
  //
  // Path structure (all pointing DOWN, tip at bottom):
  // 1. ArrowFill - main arrow body
  // 2. ArrowTipShadow - outer shadow stroke
  // 3. ArrowStroke - inner border stroke
  const svgString = `<svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.3356 7.39793L15.1924 3.02682C15.9269 2.36577 16.8801 2 17.8683 2H20V0H0V2H1.46507C2.45324 2 3.40643 2.36577 4.14093 3.02682L8.99772 7.39793C9.37801 7.7402 9.95534 7.74021 10.3356 7.39793Z"
      fill="#FFFFFF"
    />
    <path
      d="M11.0046 8.14124C10.244 8.82575 9.08939 8.82578 8.32871 8.14122L3.47192 3.77011C2.92105 3.27432 2.20615 2.99999 1.46507 2.99999L4.10999 3L8.99772 7.39793C9.37801 7.7402 9.95534 7.7402 10.3356 7.39793L15.2227 3L17.8683 2.99999C17.1272 2.99999 16.4123 3.27432 15.8614 3.77011L11.0046 8.14124Z"
      fill="#808080"
    />
    <path
      d="M9.66673 6.65461L14.5235 2.28352C15.4416 1.45721 16.6331 1 17.8683 1H20V2H17.8683C16.8801 2 15.9269 2.36577 15.1924 3.02682L10.3356 7.39793C9.95534 7.74021 9.37801 7.7402 8.99772 7.39793L4.14093 3.02682C3.40643 2.36577 2.45324 2 1.46507 2H0V1H1.46507C2.70023 1 3.89172 1.45722 4.80987 2.28352L9.66673 6.65461Z"
      fill="#CCCCCC"
    />
  </svg>`;

  const svgNode = figma.createNodeFromSvg(svgString);
  svgNode.name = "Arrow";

  // Find the vector children and bind variables to them
  // The SVG creates a frame with vector children in order: fill, tip-shadow, tip-stroke
  const children = svgNode.children;

  if (children.length >= 3) {
    // First path: Arrow Fill (fill-kumo-base)
    const arrowFill = children[0];
    if (arrowFill.type === "VECTOR") {
      arrowFill.name = "Arrow Fill";
      const bgVar = getVariableByName(VAR_NAMES.color.base);
      if (bgVar) {
        const variable = figma.variables.getVariableById(bgVar.id);
        if (variable) {
          let fill: SolidPaint = {
            type: "SOLID",
            color: COLORS.fallbackWhite,
          };
          fill = figma.variables.setBoundVariableForPaint(
            fill,
            "color",
            variable,
          );
          arrowFill.fills = [fill];
        }
      }
    }

    // Second path: Arrow Tip Shadow (fill-kumo-tip-shadow)
    const arrowTipShadow = children[1];
    if (arrowTipShadow.type === "VECTOR") {
      arrowTipShadow.name = "Arrow Tip Shadow";
      const tipShadowVar = getVariableByName(VAR_NAMES.color.tipShadow);
      if (tipShadowVar) {
        const variable = figma.variables.getVariableById(tipShadowVar.id);
        if (variable) {
          let fill: SolidPaint = {
            type: "SOLID",
            color: COLORS.placeholder,
          };
          fill = figma.variables.setBoundVariableForPaint(
            fill,
            "color",
            variable,
          );
          arrowTipShadow.fills = [fill];
        }
      }
    }

    // Third path: Arrow Stroke (fill-kumo-tip-stroke)
    const arrowStroke = children[2];
    if (arrowStroke.type === "VECTOR") {
      arrowStroke.name = "Arrow Stroke";
      const tipStrokeVar = getVariableByName(VAR_NAMES.color.tipStroke);
      if (tipStrokeVar) {
        const variable = figma.variables.getVariableById(tipStrokeVar.id);
        if (variable) {
          let fill: SolidPaint = {
            type: "SOLID",
            color: COLORS.borderGray,
          };
          fill = figma.variables.setBoundVariableForPaint(
            fill,
            "color",
            variable,
          );
          arrowStroke.fills = [fill];
        }
      }
    }
  }

  return svgNode;
}

/**
 * Create a single Tooltip component
 *
 * Layout structure:
 * - Component (frame with no auto-layout for manual positioning)
 *   - Tooltip box (with bg, padding, rounded corners)
 *     - Text content
 *   - Arrow (positioned below the box)
 *
 * NOTE: We use layoutMode = "NONE" because:
 * 1. layoutAlign = "CENTER" is deprecated in Figma
 * 2. layoutPositioning = "ABSOLUTE" requires parent to have layoutMode !== NONE
 * 3. Manual positioning is simpler and more reliable for this use case
 *
 * @returns ComponentNode for the tooltip
 */
async function createTooltipComponent(): Promise<ComponentNode> {
  // Create component (no auto-layout - manual positioning)
  const component = figma.createComponent();
  component.name = "Tooltip";
  component.description = "Tooltip popup component for contextual help";
  component.layoutMode = "NONE";
  component.fills = []; // Transparent - the inner box has the fill

  // Create the tooltip box (the rounded rectangle with text)
  const tooltipBox = figma.createFrame();
  tooltipBox.name = "Tooltip Box";
  tooltipBox.layoutMode = "VERTICAL";
  tooltipBox.primaryAxisSizingMode = "AUTO";
  tooltipBox.counterAxisSizingMode = "AUTO";
  tooltipBox.paddingLeft = themeData.tailwind.spacing.scale["2.5"]; // px-2.5 = 10px
  tooltipBox.paddingRight = themeData.tailwind.spacing.scale["2.5"];
  tooltipBox.paddingTop = themeData.tailwind.spacing.scale["1.5"]; // py-1.5 = 6px
  tooltipBox.paddingBottom = themeData.tailwind.spacing.scale["1.5"];
  tooltipBox.cornerRadius = BORDER_RADIUS.md; // rounded-md = 6px
  tooltipBox.x = 0;
  tooltipBox.y = 0;

  // Apply background fill (bg-kumo-base)
  const bgVar = getVariableByName(VAR_NAMES.color.base);
  if (bgVar) {
    bindFillToVariable(tooltipBox, bgVar.id);
  }

  // Apply outline stroke (outline outline-kumo-fill)
  // This provides visual separation especially in dark mode
  const outlineVar = getVariableByName(VAR_NAMES.color.fill);
  if (outlineVar) {
    bindStrokeToVariable(tooltipBox, outlineVar.id, 1, "OUTSIDE");
  }

  // Create tooltip text content
  // text-sm = 14px, normal weight = 400
  const text = await createTextNode(
    "Tooltip text",
    FONT_SIZE.sm,
    FALLBACK_VALUES.fontWeight.normal,
  );
  text.name = "Text";
  text.textAutoResize = "WIDTH_AND_HEIGHT";

  // Apply text color (text-kumo-default)
  const textVar = getVariableByName(VAR_NAMES.text.default);
  if (textVar) {
    bindTextColorToVariable(text, textVar.id);
  }

  tooltipBox.appendChild(text);
  component.appendChild(tooltipBox);

  // Create arrow and position below the box
  const arrow = createTooltipArrow();
  // Center arrow horizontally under the box
  arrow.x = (tooltipBox.width - ARROW_WIDTH) / 2;
  // Position directly at bottom of box (no gap)
  arrow.y = tooltipBox.height;

  component.appendChild(arrow);

  // Resize component to fit box + arrow
  component.resize(tooltipBox.width, tooltipBox.height + ARROW_HEIGHT);

  return component;
}

/**
 * Generate Tooltip ComponentSet
 *
 * Creates a "Tooltip" ComponentSet with a single variant (no variants).
 * Creates both light and dark mode sections.
 *
 * @param page - The page to add components to
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateTooltipComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  figma.currentPage = page;

  // Generate the tooltip component
  const components: ComponentNode[] = [];

  // Create the tooltip component
  const component = await createTooltipComponent();

  // Position component
  component.x = 0;
  component.y = 0;

  components.push(component);

  // Combine into ComponentSet (even with single variant for consistency)
  // @ts-ignore - combineAsVariants works at runtime
  const componentSet = figma.combineAsVariants(components, page);
  componentSet.name = "Tooltip";
  componentSet.description =
    "Tooltip popup component. " +
    "Use for contextual help and additional information on hover.";
  componentSet.layoutMode = "NONE";

  // Calculate content dimensions
  const contentWidth = componentSet.width;
  const contentHeight = componentSet.height;

  // Create light mode section
  const lightSection = createModeSection(page, "Tooltip", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2,
  );

  // Create dark mode section
  const darkSection = createModeSection(page, "Tooltip", "dark");
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

  logComplete("Generated Tooltip ComponentSet (light + dark)");

  return startY + totalHeight + SECTION_GAP;
}

/**
 * ============================================================================
 * TESTABLE EXPORTS - Pure functions for testing (no Figma API calls)
 * ============================================================================
 */

/**
 * Get Tooltip configuration from registry
 *
 * @returns Side variant configuration
 */
export function getTooltipSideConfig() {
  const props = tooltipComponent.props;
  const sideProp = props.side as {
    values: string[];
    descriptions: Record<string, string>;
    default: string;
  };

  return {
    values: sideProp.values,
    descriptions: sideProp.descriptions,
    default: sideProp.default,
  };
}

/**
 * Get Tooltip styling configuration from React component
 * Matches the actual Tooltip.Popup classes from tooltip.tsx
 *
 * @returns Tooltip styling configuration
 */
export function getTooltipStylingConfig() {
  return {
    popup: {
      // From tooltip.tsx Popup className
      background: "bg-kumo-base",
      text: "text-kumo-default",
      paddingX: "px-2.5", // 10px
      paddingY: "py-1.5", // 6px
      fontSize: "text-sm", // 14px
      borderRadius: "rounded-md",
      outline: "outline-kumo-fill", // Provides visual separation in dark mode
    },
    arrow: {
      // Arrow matches React component's ArrowSvg with 3 paths:
      // - fill-kumo-base: main arrow body
      // - fill-kumo-tip-shadow: outer stroke (light mode)
      // - fill-kumo-tip-stroke: border stroke (matches outline-kumo-fill)
      fill: "fill-kumo-base",
      tipShadow: "fill-kumo-tip-shadow",
      tipStroke: "fill-kumo-tip-stroke",
      width: ARROW_WIDTH,
      height: ARROW_HEIGHT,
    },
  };
}

/**
 * Get parsed styles for Tooltip box
 *
 * @returns Parsed Tailwind styles
 */
export function getTooltipParsedBoxStyles() {
  return parseTailwindClasses(TOOLTIP_BOX_STYLES);
}

/**
 * Get Tooltip box layout data
 *
 * @returns Layout dimensions and styling
 */
export function getTooltipBoxLayout() {
  const parsed = parseTailwindClasses(TOOLTIP_BOX_STYLES);

  return {
    // Padding
    paddingX: parsed.paddingX,
    paddingY: parsed.paddingY,
    // Border radius
    borderRadius: parsed.borderRadius,
    // Typography
    fontSize: TOOLTIP_TEXT_SIZE,
    fontWeight: TOOLTIP_TEXT_WEIGHT,
    // Fill
    fillVariable: parsed.fillVariable,
    // Text
    textVariable: parsed.textVariable,
    isWhiteText: parsed.isWhiteText,
    // Outline (for dark mode separation)
    outlineVariable: VAR_NAMES.color.fill,
  };
}

/**
 * Get Tooltip arrow dimensions
 *
 * @returns Arrow dimensions
 */
export function getTooltipArrowDimensions() {
  return {
    width: ARROW_WIDTH,
    height: ARROW_HEIGHT,
  };
}

/**
 * Get complete Tooltip intermediate data
 *
 * @returns All intermediate data for Tooltip component
 */
export function getAllTooltipData() {
  const sideConfig = getTooltipSideConfig();
  const stylingConfig = getTooltipStylingConfig();
  const boxLayout = getTooltipBoxLayout();
  const arrowDimensions = getTooltipArrowDimensions();
  const parsedStyles = getTooltipParsedBoxStyles();

  return {
    sideConfig,
    stylingConfig,
    boxStyles: {
      raw: TOOLTIP_BOX_STYLES,
      parsed: parsedStyles,
    },
    boxLayout,
    arrowDimensions,
    text: {
      fontSize: TOOLTIP_TEXT_SIZE,
      fontWeight: TOOLTIP_TEXT_WEIGHT,
    },
  };
}
