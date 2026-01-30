import { logComplete } from "../logger";
/**
 * Meter Component Generator
 *
 * Generates a Meter ComponentSet in Figma showing progress bar at various fill levels.
 * Reads component definitions from component-registry.json.
 *
 * Meter has no variants (KUMO_METER_VARIANTS is empty). The React component uses:
 * - Root: "flex w-full flex-col gap-2"
 * - Label: "text-xs text-kumo-strong" (12px, text-kumo-strong token)
 * - Value: "text-sm font-medium text-kumo-default tabular-nums" (14px, 500 weight, text-kumo-default token)
 * - Track: "h-2 w-full rounded-full bg-kumo-fill" (height 8px, bg-kumo-fill token)
 * - Indicator: "rounded-full bg-linear-to-r from-kumo-brand" (primary gradient)
 */

import {
  createTextNode,
  bindFillToVariable,
  getVariableByName,
  createModeSection,
  createRowLabel,
  bindTextColorToVariable,
  SECTION_PADDING,
  SECTION_GAP,
  SECTION_TITLE,
  GRID_LAYOUT,
  SECTION_LAYOUT,
  COLORS,
  FONT_SIZE,
  FALLBACK_VALUES,
  BORDER_RADIUS,
  VAR_NAMES,
} from "./shared";

// Import theme data for CSS-derived values
import themeData from "../generated/theme-data.json";

// Import registry as source of truth
import registry from "@cloudflare/kumo/ai/component-registry.json";

const meterComponent = registry.components.Meter;
const meterProps = meterComponent.props;
const meterColors = meterComponent.colors;

/**
 * Meter base layout constants
 * These are derived from the React component's Tailwind classes:
 * - METER_TRACK_HEIGHT: h-2 = 8px (from Track className)
 * - METER_GAP: gap-2 = 8px (from Root className)
 * - METER_WIDTH: Layout-specific for Figma display
 */
const METER_WIDTH = 240; // FIGMA-SPECIFIC: Layout width for Figma canvas display, not from CSS
const METER_TRACK_HEIGHT = themeData.tailwind.spacing.scale["2"]; // h-2 = 8px from meter.tsx
const METER_GAP = themeData.tailwind.spacing.scale["2"]; // gap-2 = 8px from meter.tsx

/**
 * Fill levels to demonstrate: 0%, 25%, 50%, 75%, 100%
 */
const FILL_LEVELS = [0, 25, 50, 75, 100];

/**
 * ============================================================================
 * TESTABLE EXPORTS - Pure functions for testing (no Figma API calls)
 * ============================================================================
 */

/**
 * Get fill level configuration
 * Returns the fill levels that will be generated as variants
 */
export function getMeterFillLevelConfig() {
  return {
    fillLevels: FILL_LEVELS,
    description: "Fill levels to demonstrate meter progress states",
  };
}

/**
 * Get meter dimensions configuration
 * Returns the layout constants used for meter sizing
 */
export function getMeterDimensionsConfig() {
  return {
    meterWidth: METER_WIDTH,
    trackHeight: METER_TRACK_HEIGHT,
    gap: METER_GAP,
    description: "Meter base layout dimensions",
  };
}

/**
 * Get color bindings configuration
 * Returns the semantic tokens used for meter colors
 *
 * Sources from meter.tsx:
 * - Label: text-kumo-strong (text-xs text-kumo-strong)
 * - Value: text-kumo-default (text-sm font-medium text-kumo-default)
 * - Track: bg-kumo-fill (from Track className)
 * - Indicator: bg-kumo-brand (from bg-linear-to-r from-kumo-brand)
 */
export function getMeterColorBindings() {
  return {
    label: VAR_NAMES.text.label,
    value: VAR_NAMES.text.surface,
    track: VAR_NAMES.color.fill, // Note: React uses bg-kumo-fill
    indicator: VAR_NAMES.color.brand,
    description: "Semantic color tokens bound to meter elements",
    registryColors: meterColors,
  };
}

/**
 * Get computed indicator width for a specific fill percentage
 * @param fillPercentage - Fill percentage (0-100)
 * @returns Computed indicator width in pixels
 */
export function getMeterIndicatorWidth(fillPercentage: number) {
  return (METER_WIDTH * fillPercentage) / 100;
}

/**
 * Get typography configuration from React component classes
 * Returns font sizing and weights used in meter.tsx
 */
export function getMeterTypographyConfig() {
  return {
    label: {
      fontSize: FONT_SIZE.xs, // 12px from theme-kumo.css (text-xs)
      fontWeight: FALLBACK_VALUES.fontWeight.normal, // 400
      colorToken: VAR_NAMES.text.label,
      source: "text-xs text-kumo-strong",
    },
    value: {
      fontSize: FONT_SIZE.sm, // 13px from theme-kumo.css (text-sm, NOT 14px!)
      fontWeight: FALLBACK_VALUES.fontWeight.medium, // 500 (font-medium)
      colorToken: VAR_NAMES.text.surface,
      source: "text-sm font-medium text-kumo-default tabular-nums",
    },
  };
}

/**
 * Get all meter variant data (for snapshot testing)
 * Returns intermediate data before Figma API calls
 */
export function getAllMeterVariantData() {
  const fillLevelConfig = getMeterFillLevelConfig();
  const dimensionsConfig = getMeterDimensionsConfig();
  const colorBindings = getMeterColorBindings();
  const typography = getMeterTypographyConfig();

  return {
    registry: {
      name: meterComponent.name,
      description: meterComponent.description,
      category: meterComponent.category,
      colors: meterComponent.colors,
      props: {
        value: meterProps.value,
        max: meterProps.max,
        min: meterProps.min,
        label: meterProps.label,
      },
    },
    fillLevels: fillLevelConfig.fillLevels.map((fillLevel) => {
      return {
        fillPercentage: fillLevel,
        indicatorWidth: getMeterIndicatorWidth(fillLevel),
        label: "Progress",
        valueText: fillLevel + "%",
      };
    }),
    dimensions: dimensionsConfig,
    colorBindings: colorBindings,
    typography: typography,
    layout: {
      headerRowMode: "HORIZONTAL",
      headerRowAlign: "SPACE_BETWEEN",
      trackCornerRadius: BORDER_RADIUS.full, // rounded-full from meter.tsx
      indicatorCornerRadius: BORDER_RADIUS.full, // rounded-full from meter.tsx
      labelFontSize: typography.label.fontSize,
      labelFontWeight: typography.label.fontWeight,
      valueFontSize: typography.value.fontSize,
      valueFontWeight: typography.value.fontWeight,
    },
  };
}

/**
 * ============================================================================
 * FIGMA COMPONENT GENERATION
 * ============================================================================
 */

/**
 * Create a single Meter component with the specified fill percentage
 */
async function createMeterComponent(
  label: string,
  fillPercentage: number,
): Promise<ComponentNode> {
  // Get typography configuration from React component
  const typography = getMeterTypographyConfig();

  // Create component
  const component = figma.createComponent();
  component.name = "fill=" + fillPercentage;
  component.description = "Meter at " + fillPercentage + "% fill";

  // Set up auto-layout (vertical: label+value row, then track)
  // Matches "flex w-full flex-col gap-2" from meter.tsx
  component.layoutMode = "VERTICAL";
  component.primaryAxisAlignItems = "MIN";
  component.counterAxisAlignItems = "MIN";
  component.itemSpacing = METER_GAP;
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";

  // Create label+value row frame
  // Matches "flex items-center justify-between gap-4" from meter.tsx
  const headerRow = figma.createFrame();
  headerRow.name = "Header";
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  headerRow.counterAxisAlignItems = "CENTER";
  headerRow.primaryAxisSizingMode = "FIXED";
  headerRow.counterAxisSizingMode = "AUTO";
  headerRow.resize(METER_WIDTH, 20);
  headerRow.fills = [];

  // Create label text using typography config
  const labelText = await createTextNode(
    label,
    typography.label.fontSize,
    typography.label.fontWeight,
  );
  labelText.name = "Label";
  const labelVar = getVariableByName(typography.label.colorToken);
  if (labelVar) {
    bindTextColorToVariable(labelText, labelVar.id);
  }

  // Create value text using typography config
  const valueText = await createTextNode(
    fillPercentage + "%",
    typography.value.fontSize,
    typography.value.fontWeight,
  );
  valueText.name = "Value";
  const surfaceTextVar = getVariableByName(typography.value.colorToken);
  if (surfaceTextVar) {
    bindTextColorToVariable(valueText, surfaceTextVar.id);
  }

  headerRow.appendChild(labelText);
  headerRow.appendChild(valueText);

  // Create track frame (background)
  const track = figma.createFrame();
  track.name = "Track";
  track.layoutMode = "NONE";
  track.resize(METER_WIDTH, METER_TRACK_HEIGHT);
  track.cornerRadius = BORDER_RADIUS.full; // rounded-full

  // Bind track background to bg-kumo-fill variable
  const bgColorVar = getVariableByName(VAR_NAMES.color.fill);
  if (bgColorVar) {
    bindFillToVariable(track, bgColorVar.id);
  } else {
    // Fallback to gray
    track.fills = [
      {
        type: "SOLID",
        color: COLORS.skeletonGray,
      },
    ];
  }

  // Create indicator (filled portion)
  const indicator = figma.createFrame();
  indicator.name = "Indicator";
  indicator.layoutMode = "NONE";

  // Calculate indicator width based on fill percentage
  const indicatorWidth = (METER_WIDTH * fillPercentage) / 100;
  indicator.resize(indicatorWidth, METER_TRACK_HEIGHT);
  indicator.cornerRadius = BORDER_RADIUS.full; // rounded-full

  // Bind indicator background to primary variable
  const primaryVar = getVariableByName(VAR_NAMES.color.brand);
  if (primaryVar) {
    bindFillToVariable(indicator, primaryVar.id);
  } else {
    // Fallback to primary blue
    indicator.fills = [
      {
        type: "SOLID",
        color: COLORS.fallbackPrimary,
      },
    ];
  }

  // Position indicator inside track
  indicator.x = 0;
  indicator.y = 0;

  // Add indicator to track
  track.appendChild(indicator);

  // Add header and track to component
  component.appendChild(headerRow);
  component.appendChild(track);

  return component;
}

/**
 * Generate Meter ComponentSet with different fill levels
 *
 * Creates a single "Meter" ComponentSet with fill variants showing different states.
 * Creates both light and dark mode sections.
 *
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateMeterComponents(startY: number): Promise<number> {
  if (startY === undefined) startY = 100;

  // Fill levels to demonstrate: 0%, 25%, 50%, 75%, 100%
  const fillLevels = FILL_LEVELS;
  const components: ComponentNode[] = [];

  // Track row labels: { y, text }
  const rowLabels: { y: number; text: string }[] = [];

  // Layout spacing - vertical layout with labels
  const rowGap = GRID_LAYOUT.rowGap.medium;
  const labelColumnWidth = GRID_LAYOUT.labelColumnWidth.medium;

  // Track position for laying out components vertically
  let currentY = 0;

  for (let i = 0; i < fillLevels.length; i++) {
    const fillLevel = fillLevels[i];
    const component = await createMeterComponent("Progress", fillLevel);

    // Record row label
    rowLabels.push({ y: currentY, text: "fill=" + fillLevel });

    // Position each component vertically with label offset
    component.x = labelColumnWidth;
    component.y = currentY;
    currentY += component.height + rowGap;
    components.push(component);
  }

  // Combine all variants into a single ComponentSet
  // @ts-ignore - combineAsVariants works at runtime
  const componentSet = figma.combineAsVariants(components, figma.currentPage);
  componentSet.name = "Meter";
  componentSet.description =
    "Meter component showing progress at different fill levels";

  // Calculate content dimensions (add label column width)
  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height;

  // Add contentYOffset for title space inside frame
  const contentYOffset = SECTION_TITLE.height;

  // Create light mode section
  const lightSection = createModeSection(figma.currentPage, "Meter", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Create dark mode section
  const darkSection = createModeSection(figma.currentPage, "Meter", "dark");
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
  for (let j = 0; j < rowLabels.length; j++) {
    const label = rowLabels[j];
    const labelNode = await createRowLabel(
      label.text,
      SECTION_PADDING,
      SECTION_PADDING +
        contentYOffset +
        label.y +
        GRID_LAYOUT.labelVerticalOffset.md, // vertically center with meter
    );
    lightSection.frame.appendChild(labelNode);
  }

  // Create instances for dark section
  // Note: component positions are relative to ComponentSet after combineAsVariants
  // We need to add labelColumnWidth to match the light section layout
  for (let k = 0; k < components.length; k++) {
    const component = components[k];
    const instance = component.createInstance();
    instance.x = component.x + SECTION_PADDING + labelColumnWidth;
    instance.y = component.y + SECTION_PADDING + contentYOffset;
    darkSection.frame.appendChild(instance);
  }

  // Add row labels to dark section
  for (let m = 0; m < rowLabels.length; m++) {
    const label = rowLabels[m];
    const labelNode = await createRowLabel(
      label.text,
      SECTION_PADDING,
      SECTION_PADDING +
        contentYOffset +
        label.y +
        GRID_LAYOUT.labelVerticalOffset.md,
    );
    darkSection.frame.appendChild(labelNode);
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
    "✅ Generated Meter ComponentSet with " +
      fillLevels.length +
      " fill levels (light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}
