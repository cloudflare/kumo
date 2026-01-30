import { logComplete } from "../logger";
import registry from "@cloudflare/kumo/ai/component-registry.json";

/**
 * DateRangePicker Component Generator
 *
 * Generates a DateRangePicker ComponentSet in Figma that matches
 * the DateRangePicker component props:
 *
 * - size: sm, base, lg
 * - variant: default, subtle
 * - selected: false, true (whether a date range is selected)
 *
 * The DateRangePicker displays two side-by-side calendars with:
 * - Navigation buttons (prev/next month)
 * - Month/Year header
 * - Day-of-week headers (Su Mo Tu We Th Fr Sa)
 * - 42 day cells (6 rows × 7 columns) per calendar
 * - Footer with timezone and reset button
 *
 * Reads styles from component-registry.json (the source of truth).
 * Uses real icons from the Icon Library page.
 *
 * @see packages/kumo/src/components/date-range-picker/date-range-picker.tsx
 */

import {
  createTextNode,
  getVariableByName,
  createModeSection,
  createRowLabel,
  createColumnHeaders,
  bindFillToVariable,
  bindTextColorToVariable,
  BORDER_RADIUS,
  SECTION_PADDING,
  SECTION_GAP,
  SECTION_LAYOUT,
  SECTION_TITLE,
  FONT_SIZE,
  FALLBACK_VALUES,
  GRID_LAYOUT,
  VAR_NAMES,
} from "./shared";
import themeData from "../generated/theme-data.json";
import { getButtonIcon, bindIconColor } from "./icon-utils";

/**
 * Extract DateRangePicker configuration from registry
 */
const dateRangePickerComponent = registry.components.DateRangePicker;
const dateRangePickerProps = dateRangePickerComponent.props;
const dateRangePickerStyling = (registry.components.DateRangePicker as any)
  .styling;
const sizeProp = dateRangePickerProps.size as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};
const variantProp = dateRangePickerProps.variant as {
  values: string[];
  classes: Record<string, string>;
  descriptions: Record<string, string>;
  default: string;
};

/**
 * Size values (from registry)
 */
const SIZE_VALUES = sizeProp.values;

/**
 * Variant values (from registry)
 */
const VARIANT_VALUES = variantProp.values;

/**
 * Selected state values
 */
const SELECTED_VALUES = [false, true];

/**
 * Fallback size-specific configurations (from date-range-picker.tsx)
 * Used if registry.styling is not available.
 */
const FALLBACK_SIZE_CONFIG: Record<
  string,
  {
    calendarWidth: number;
    cellHeight: number;
    cellWidth: number;
    textSize: number;
    iconSize: number;
    padding: number;
    gap: number;
  }
> = {
  sm: {
    // FIGMA-SPECIFIC: Calendar layout dimensions for Figma display, not from CSS
    calendarWidth: 168,
    cellHeight: 22,
    cellWidth: 24,
    textSize: FONT_SIZE.xs, // 12px from theme-kumo.css
    iconSize: 14, // FIGMA-SPECIFIC: Custom icon size for sm variant
    padding: themeData.tailwind.spacing.scale["3"], // p-3 = 12px
    gap: themeData.tailwind.spacing.scale["2"], // gap-2 = 8px
  },
  base: {
    // FIGMA-SPECIFIC: Calendar layout dimensions for Figma display, not from CSS
    calendarWidth: 196,
    cellHeight: 26,
    cellWidth: 28,
    textSize: FONT_SIZE.base, // 14px from theme-kumo.css
    iconSize: FALLBACK_VALUES.iconSize.sm, // size-4 = 16px
    padding: themeData.tailwind.spacing.scale["4"], // p-4 = 16px
    gap: themeData.tailwind.spacing.scale["2.5"], // gap-2.5 = 10px
  },
  lg: {
    // FIGMA-SPECIFIC: Calendar layout dimensions for Figma display, not from CSS
    calendarWidth: 252,
    cellHeight: 32,
    cellWidth: 36,
    textSize: FONT_SIZE.lg, // 16px from theme-kumo.css
    iconSize: FALLBACK_VALUES.iconSize.medium, // size-4.5 = 18px
    padding: themeData.tailwind.spacing.scale["5"], // p-5 = 20px
    gap: themeData.tailwind.spacing.scale["3"], // gap-3 = 12px
  },
};

/**
 * Get size configuration from registry with fallback
 */
function getSizeConfigFromRegistry() {
  if (!dateRangePickerStyling?.sizeVariants) return FALLBACK_SIZE_CONFIG;

  const config: Record<string, any> = {};
  for (let i = 0; i < SIZE_VALUES.length; i++) {
    const size = SIZE_VALUES[i];
    const sizeData = dateRangePickerStyling.sizeVariants[size];
    if (sizeData && (sizeData as any).dimensions) {
      config[size] = (sizeData as any).dimensions;
    } else {
      config[size] = FALLBACK_SIZE_CONFIG[size];
    }
  }
  return config;
}

/**
 * Size-specific configurations (from registry or fallback)
 */
const SIZE_CONFIG = getSizeConfigFromRegistry();

/**
 * Variant-specific background colors (from registry)
 */
function getVariantBackground(variant: string): string {
  const classes = variantProp.classes[variant] || variantProp.classes.default;
  if (classes.indexOf("bg-kumo-overlay") >= 0) {
    return VAR_NAMES.color.overlay;
  } else if (classes.indexOf("bg-kumo-base") >= 0) {
    return VAR_NAMES.color.base;
  }
  return VAR_NAMES.color.overlay; // fallback
}

const VARIANT_CONFIG: Record<string, { bgVariable: string }> = {};
for (let vi = 0; vi < VARIANT_VALUES.length; vi++) {
  const v = VARIANT_VALUES[vi];
  VARIANT_CONFIG[v] = { bgVariable: getVariantBackground(v) };
}

/**
 * Day-of-week labels
 */
const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Create day-of-week header row
 */
async function createDayHeaders(
  size: string,
  sizeConfig: (typeof SIZE_CONFIG)["base"],
): Promise<FrameNode> {
  const headerRow = figma.createFrame();
  headerRow.name = "Day Headers";
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.primaryAxisSizingMode = "AUTO";
  headerRow.counterAxisSizingMode = "AUTO";
  headerRow.itemSpacing = 4;
  headerRow.fills = [];

  for (let i = 0; i < DAYS_OF_WEEK.length; i++) {
    const dayLabel = await createTextNode(
      DAYS_OF_WEEK[i],
      sizeConfig.textSize,
      400,
    );
    dayLabel.name = DAYS_OF_WEEK[i];
    dayLabel.textAlignHorizontal = "CENTER";
    dayLabel.resize(sizeConfig.cellWidth, 22);

    // Apply muted text color
    const mutedVar = getVariableByName(VAR_NAMES.text.subtle);
    if (mutedVar) {
      bindTextColorToVariable(dayLabel, mutedVar.id);
    }

    headerRow.appendChild(dayLabel);
  }

  return headerRow;
}

/**
 * Create a single day cell
 */
async function createDayCell(
  dayNumber: number,
  mode: "normal" | "selected" | "start" | "end" | "outOfRange",
  sizeConfig: (typeof SIZE_CONFIG)["base"],
): Promise<FrameNode> {
  const cell = figma.createFrame();
  cell.name = "Day " + dayNumber;
  cell.layoutMode = "HORIZONTAL";
  cell.primaryAxisAlignItems = "CENTER";
  cell.counterAxisAlignItems = "CENTER";
  cell.primaryAxisSizingMode = "FIXED";
  cell.counterAxisSizingMode = "FIXED";
  cell.resize(sizeConfig.cellWidth, sizeConfig.cellHeight);
  cell.fills = [];

  // Apply background based on mode
  // Note: "outOfRange" has NO background - just muted text
  if (mode === "selected") {
    const selectedVar = getVariableByName(VAR_NAMES.color.interact);
    if (selectedVar) {
      bindFillToVariable(cell, selectedVar.id);
    }
  } else if (mode === "start" || mode === "end") {
    const endpointVar = getVariableByName(VAR_NAMES.color.contrast);
    if (endpointVar) {
      bindFillToVariable(cell, endpointVar.id);
    }
    // Apply border radius
    if (mode === "start") {
      cell.topLeftRadius = 5;
      cell.bottomLeftRadius = 5;
    } else {
      cell.topRightRadius = 5;
      cell.bottomRightRadius = 5;
    }
  }
  // outOfRange mode: no background fill, just muted text (applied below)

  // Create day number text
  const dayText = await createTextNode(
    String(dayNumber),
    sizeConfig.textSize,
    400,
  );
  dayText.name = "Day Number";
  dayText.textAlignHorizontal = "CENTER";

  // Apply text color based on mode
  if (mode === "start" || mode === "end") {
    const inverseVar = getVariableByName(VAR_NAMES.text.inverse);
    if (inverseVar) {
      bindTextColorToVariable(dayText, inverseVar.id);
    }
  } else if (mode === "outOfRange") {
    const labelVar = getVariableByName(VAR_NAMES.text.strong);
    if (labelVar) {
      bindTextColorToVariable(dayText, labelVar.id);
    }
  } else {
    const surfaceVar = getVariableByName(VAR_NAMES.text.default);
    if (surfaceVar) {
      bindTextColorToVariable(dayText, surfaceVar.id);
    }
  }

  cell.appendChild(dayText);
  return cell;
}

/**
 * Month configuration for realistic calendar display
 * December 2025 starts on Monday (index 1), has 31 days
 * January 2026 starts on Thursday (index 4), has 31 days
 */
const MONTH_CONFIG: Record<
  string,
  { startDay: number; daysInMonth: number; prevMonthDays: number }
> = {
  December: { startDay: 1, daysInMonth: 31, prevMonthDays: 30 }, // Mon, Nov has 30
  January: { startDay: 4, daysInMonth: 31, prevMonthDays: 31 }, // Thu, Dec has 31
};

/**
 * Create calendar grid with 42 day cells (6 rows × 7 columns)
 * Shows realistic dates with previous/next month overflow
 */
async function createCalendarGrid(
  monthName: string,
  selected: boolean,
  sizeConfig: (typeof SIZE_CONFIG)["base"],
): Promise<FrameNode> {
  const grid = figma.createFrame();
  grid.name = "Calendar Grid";
  grid.layoutMode = "VERTICAL";
  grid.primaryAxisSizingMode = "AUTO";
  grid.counterAxisSizingMode = "AUTO";
  grid.itemSpacing = 2;
  grid.fills = [];

  const config = MONTH_CONFIG[monthName] || MONTH_CONFIG["January"];
  const startDay = config.startDay; // 0=Sun, 1=Mon, etc.
  const daysInMonth = config.daysInMonth;
  const prevMonthDays = config.prevMonthDays;

  // Create 6 rows of 7 days each
  for (let row = 0; row < 6; row++) {
    const rowFrame = figma.createFrame();
    rowFrame.name = "Row " + (row + 1);
    rowFrame.layoutMode = "HORIZONTAL";
    rowFrame.primaryAxisSizingMode = "AUTO";
    rowFrame.counterAxisSizingMode = "AUTO";
    rowFrame.itemSpacing = 0;
    rowFrame.fills = [];

    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;
      let dayNumber: number;
      let isOutOfRange = false;

      if (cellIndex < startDay) {
        // Previous month's trailing days
        dayNumber = prevMonthDays - startDay + cellIndex + 1;
        isOutOfRange = true;
      } else if (cellIndex >= startDay + daysInMonth) {
        // Next month's leading days
        dayNumber = cellIndex - startDay - daysInMonth + 1;
        isOutOfRange = true;
      } else {
        // Current month
        dayNumber = cellIndex - startDay + 1;
      }

      // Determine cell mode
      let cellMode: "normal" | "selected" | "start" | "end" | "outOfRange" =
        isOutOfRange ? "outOfRange" : "normal";

      // Apply selection only to current month days (not overflow)
      if (selected && !isOutOfRange) {
        // Show selected range from 15th to 22nd
        if (dayNumber === 15) {
          cellMode = "start";
        } else if (dayNumber === 22) {
          cellMode = "end";
        } else if (dayNumber > 15 && dayNumber < 22) {
          cellMode = "selected";
        }
      }

      const cell = await createDayCell(dayNumber, cellMode, sizeConfig);
      rowFrame.appendChild(cell);
    }

    grid.appendChild(rowFrame);
  }

  return grid;
}

/**
 * Create month header with navigation
 */
async function createMonthHeader(
  monthName: string,
  year: string,
  showLeftNav: boolean,
  showRightNav: boolean,
  sizeConfig: (typeof SIZE_CONFIG)["base"],
): Promise<FrameNode> {
  const header = figma.createFrame();
  header.name = "Month Header";
  header.layoutMode = "HORIZONTAL";
  header.primaryAxisAlignItems = "SPACE_BETWEEN";
  header.counterAxisAlignItems = "CENTER";
  header.primaryAxisSizingMode = "FIXED";
  header.counterAxisSizingMode = "AUTO";
  header.resize(sizeConfig.calendarWidth, 32);
  header.fills = [];

  // Left navigation button (if applicable)
  if (showLeftNav) {
    const leftButton = figma.createFrame();
    leftButton.name = "Prev Month";
    leftButton.layoutMode = "HORIZONTAL";
    leftButton.primaryAxisAlignItems = "CENTER";
    leftButton.counterAxisAlignItems = "CENTER";
    leftButton.primaryAxisSizingMode = "AUTO";
    leftButton.counterAxisSizingMode = "AUTO";
    leftButton.paddingLeft = 6;
    leftButton.paddingRight = 6;
    leftButton.paddingTop = 6;
    leftButton.paddingBottom = 6;
    leftButton.cornerRadius = BORDER_RADIUS.md;

    const selectedOpacityVar = getVariableByName(VAR_NAMES.color.interact);
    if (selectedOpacityVar) {
      bindFillToVariable(leftButton, selectedOpacityVar.id);
    }

    const leftIcon = getButtonIcon("ph-caret-left", "sm");
    bindIconColor(leftIcon, "text-kumo-default");
    leftButton.appendChild(leftIcon);
    header.appendChild(leftButton);
  } else {
    const spacer = figma.createFrame();
    spacer.resize(1, 1);
    spacer.fills = [];
    header.appendChild(spacer);
  }

  // Month and year text
  const titleText = await createTextNode(
    monthName + " " + year,
    sizeConfig.textSize,
    600,
  );
  titleText.name = "Month Year";
  titleText.textAlignHorizontal = "CENTER";

  const surfaceVar = getVariableByName(VAR_NAMES.text.default);
  if (surfaceVar) {
    bindTextColorToVariable(titleText, surfaceVar.id);
  }

  header.appendChild(titleText);

  // Right navigation button (if applicable)
  if (showRightNav) {
    const rightButton = figma.createFrame();
    rightButton.name = "Next Month";
    rightButton.layoutMode = "HORIZONTAL";
    rightButton.primaryAxisAlignItems = "CENTER";
    rightButton.counterAxisAlignItems = "CENTER";
    rightButton.primaryAxisSizingMode = "AUTO";
    rightButton.counterAxisSizingMode = "AUTO";
    rightButton.paddingLeft = 6;
    rightButton.paddingRight = 6;
    rightButton.paddingTop = 6;
    rightButton.paddingBottom = 6;
    rightButton.cornerRadius = BORDER_RADIUS.md;

    const selectedOpacityVar2 = getVariableByName(VAR_NAMES.color.interact);
    if (selectedOpacityVar2) {
      bindFillToVariable(rightButton, selectedOpacityVar2.id);
    }

    const rightIcon = getButtonIcon("ph-caret-right", "sm");
    bindIconColor(rightIcon, "text-kumo-default");
    rightButton.appendChild(rightIcon);
    header.appendChild(rightButton);
  } else {
    const spacer2 = figma.createFrame();
    spacer2.resize(1, 1);
    spacer2.fills = [];
    header.appendChild(spacer2);
  }

  return header;
}

/**
 * Create single calendar (left or right)
 */
async function createCalendar(
  monthName: string,
  year: string,
  showLeftNav: boolean,
  showRightNav: boolean,
  selected: boolean,
  sizeConfig: (typeof SIZE_CONFIG)["base"],
): Promise<FrameNode> {
  const calendar = figma.createFrame();
  calendar.name = monthName + " Calendar";
  calendar.layoutMode = "VERTICAL";
  calendar.primaryAxisSizingMode = "AUTO";
  calendar.counterAxisSizingMode = "AUTO";
  calendar.itemSpacing = 12;
  calendar.fills = [];

  const monthHeader = await createMonthHeader(
    monthName,
    year,
    showLeftNav,
    showRightNav,
    sizeConfig,
  );
  calendar.appendChild(monthHeader);

  const dayHeaders = await createDayHeaders("base", sizeConfig);
  calendar.appendChild(dayHeaders);

  const grid = await createCalendarGrid(monthName, selected, sizeConfig);
  calendar.appendChild(grid);

  return calendar;
}

/**
 * Create footer with timezone and reset button
 */
async function createFooter(
  sizeConfig: (typeof SIZE_CONFIG)["base"],
): Promise<FrameNode> {
  const footer = figma.createFrame();
  footer.name = "Footer";
  footer.layoutMode = "HORIZONTAL";
  footer.primaryAxisAlignItems = "SPACE_BETWEEN";
  footer.counterAxisAlignItems = "CENTER";
  footer.primaryAxisSizingMode = "FIXED";
  footer.counterAxisSizingMode = "AUTO";
  footer.resize(sizeConfig.calendarWidth * 2 + 16, 32);
  footer.itemSpacing = 8;
  footer.fills = [];

  // Timezone section with icon
  const timezoneSection = figma.createFrame();
  timezoneSection.name = "Timezone";
  timezoneSection.layoutMode = "HORIZONTAL";
  timezoneSection.primaryAxisAlignItems = "MIN";
  timezoneSection.counterAxisAlignItems = "CENTER";
  timezoneSection.primaryAxisSizingMode = "AUTO";
  timezoneSection.counterAxisSizingMode = "AUTO";
  timezoneSection.itemSpacing = 8;
  timezoneSection.fills = [];

  const globeIcon = getButtonIcon("ph-globe-hemisphere-west", "sm");
  bindIconColor(globeIcon, "text-kumo-strong");
  timezoneSection.appendChild(globeIcon);

  const timezoneText = await createTextNode(
    "Timezone: New York, NY, USA (GMT-4)",
    sizeConfig.textSize,
    400,
  );
  timezoneText.name = "Timezone Text";

  const labelVar = getVariableByName(VAR_NAMES.text.strong);
  if (labelVar) {
    bindTextColorToVariable(timezoneText, labelVar.id);
  }

  timezoneSection.appendChild(timezoneText);
  footer.appendChild(timezoneSection);

  // Reset button
  const resetButton = await createTextNode(
    "Reset Dates",
    sizeConfig.textSize,
    600,
  );
  resetButton.name = "Reset Button";
  resetButton.textDecoration = "UNDERLINE";

  const resetSurfaceVar = getVariableByName(VAR_NAMES.text.default);
  if (resetSurfaceVar) {
    bindTextColorToVariable(resetButton, resetSurfaceVar.id);
  }

  footer.appendChild(resetButton);

  return footer;
}

/**
 * Create a single DateRangePicker component variant
 */
async function createDateRangePickerComponent(
  size: string,
  variant: string,
  selected: boolean,
): Promise<ComponentNode> {
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG["base"];
  const variantConfig = VARIANT_CONFIG[variant] || VARIANT_CONFIG["default"];

  const component = figma.createComponent();
  component.name =
    "size=" + size + ", variant=" + variant + ", selected=" + selected;
  component.description =
    "DateRangePicker " +
    size +
    " " +
    variant +
    " " +
    (selected ? "with selected range" : "no selection");

  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.itemSpacing = sizeConfig.gap;
  component.paddingLeft = sizeConfig.padding;
  component.paddingRight = sizeConfig.padding;
  component.paddingTop = sizeConfig.padding;
  component.paddingBottom = sizeConfig.padding;
  component.cornerRadius = BORDER_RADIUS.lg;

  // Apply background
  const bgVar = getVariableByName(variantConfig.bgVariable);
  if (bgVar) {
    bindFillToVariable(component, bgVar.id);
  }

  // Create calendars container
  const calendarsContainer = figma.createFrame();
  calendarsContainer.name = "Calendars";
  calendarsContainer.layoutMode = "HORIZONTAL";
  calendarsContainer.primaryAxisSizingMode = "AUTO";
  calendarsContainer.counterAxisSizingMode = "AUTO";
  calendarsContainer.itemSpacing = 16;
  calendarsContainer.fills = [];

  // Left calendar (December 2025) - shows selection when selected=true
  const leftCalendar = await createCalendar(
    "December",
    "2025",
    true,
    false,
    selected,
    sizeConfig,
  );
  calendarsContainer.appendChild(leftCalendar);

  // Right calendar (January 2026) - never shows selection (range is in December)
  const rightCalendar = await createCalendar(
    "January",
    "2026",
    false,
    true,
    false,
    sizeConfig,
  );
  calendarsContainer.appendChild(rightCalendar);

  component.appendChild(calendarsContainer);

  // Footer
  const footer = await createFooter(sizeConfig);
  component.appendChild(footer);

  return component;
}

/**
 * Generate DateRangePicker ComponentSet
 *
 * Creates a "DateRangePicker" ComponentSet with base size only (for performance).
 * Other sizes (sm, lg) are available in code but not generated here.
 *
 * Variants generated:
 * - variant: default, subtle
 * - selected: false, true
 *
 * Creates both light and dark mode sections.
 *
 * @param page - Page to create components on
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateDateRangePickerComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  figma.currentPage = page;

  // Only generate base size for performance (sm, lg available in code)
  const sizesToGenerate = ["base"];

  // Generate combinations
  const components: ComponentNode[] = [];
  const rowLabels: { y: number; text: string }[] = [];
  let columnHeaders: { x: number; text: string }[] = [];

  const componentGapX = 24;
  const componentGapY = 40;
  const headerRowHeight = 24;
  const labelColumnWidth = 150;

  // Track layout by row (size)
  const rowComponents: Map<number, ComponentNode[]> = new Map();

  // Generate components for each combination
  for (let si = 0; si < sizesToGenerate.length; si++) {
    const size = sizesToGenerate[si];
    rowComponents.set(si, []);

    for (let vi = 0; vi < VARIANT_VALUES.length; vi++) {
      const variant = VARIANT_VALUES[vi];

      for (let seli = 0; seli < SELECTED_VALUES.length; seli++) {
        const selected = SELECTED_VALUES[seli];
        const component = await createDateRangePickerComponent(
          size,
          variant,
          selected,
        );
        const row = rowComponents.get(si);
        if (row) {
          row.push(component);
        }
        components.push(component);
      }
    }
  }

  // First pass: calculate max width per column and max height per row
  const columnWidths: number[] = [];
  const rowHeights: number[] = [];

  const numColumns = VARIANT_VALUES.length * SELECTED_VALUES.length;

  for (let colIdx = 0; colIdx < numColumns; colIdx++) {
    let maxColWidth = 0;
    for (let rowIdx = 0; rowIdx < sizesToGenerate.length; rowIdx++) {
      const row = rowComponents.get(rowIdx);
      if (row) {
        const comp = row[colIdx];
        if (comp && comp.width > maxColWidth) {
          maxColWidth = comp.width;
        }
      }
    }
    columnWidths.push(maxColWidth);
  }

  for (let rowIdx = 0; rowIdx < sizesToGenerate.length; rowIdx++) {
    const row = rowComponents.get(rowIdx);
    if (row) {
      let maxRowHeight = 0;
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const comp = row[colIdx];
        if (comp && comp.height > maxRowHeight) {
          maxRowHeight = comp.height;
        }
      }
      rowHeights.push(maxRowHeight);
    }
  }

  // Second pass: position components
  let yOffset = headerRowHeight;

  for (let rowIdx = 0; rowIdx < sizesToGenerate.length; rowIdx++) {
    const row = rowComponents.get(rowIdx);
    if (row) {
      let xOffset = labelColumnWidth;
      const sizeValue = sizesToGenerate[rowIdx];

      rowLabels.push({
        y: yOffset,
        text: "size=" + sizeValue,
      });

      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const comp = row[colIdx];
        comp.x = xOffset;
        comp.y = yOffset;

        if (rowIdx === 0) {
          const variantIdx = Math.floor(colIdx / SELECTED_VALUES.length);
          const selectedIdx = colIdx % SELECTED_VALUES.length;
          const variantVal = VARIANT_VALUES[variantIdx];
          const selectedVal = SELECTED_VALUES[selectedIdx];
          columnHeaders.push({
            x: xOffset,
            text: "variant=" + variantVal + ", selected=" + selectedVal,
          });
        }

        xOffset = xOffset + columnWidths[colIdx] + componentGapX;
      }

      yOffset = yOffset + rowHeights[rowIdx] + componentGapY;
    }
  }

  // Combine into ComponentSet
  // @ts-ignore - combineAsVariants works at runtime
  const componentSet = figma.combineAsVariants(components, page);
  componentSet.name = "DateRangePicker";
  componentSet.description =
    "DateRangePicker component with variant and selected properties. " +
    "Showing base size only. Additional sizes (sm, lg) available in code.";
  componentSet.layoutMode = "NONE";

  // Calculate dimensions
  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height + headerRowHeight;

  // Content Y offset to make room for title inside frame (defined later for totalHeight calculation)
  const contentYOffsetLocal = SECTION_TITLE.height;

  // Create light mode section
  const lightSection = createModeSection(page, "DateRangePicker", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffsetLocal,
  );

  // Create dark mode section
  const darkSection = createModeSection(page, "DateRangePicker", "dark");
  darkSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffsetLocal,
  );

  // Add title inside each frame (done later in main function)

  // Move ComponentSet into light section
  lightSection.frame.appendChild(componentSet);
  componentSet.x = SECTION_PADDING + labelColumnWidth;
  componentSet.y = SECTION_PADDING + headerRowHeight + contentYOffsetLocal;

  // Add column headers to light section
  await createColumnHeaders(
    columnHeaders.map(function (h) {
      return { x: h.x + SECTION_PADDING, text: h.text };
    }),
    SECTION_PADDING + contentYOffsetLocal,
    lightSection.frame,
  );

  // Add row labels to light section
  for (let li = 0; li < rowLabels.length; li++) {
    const label = rowLabels[li];
    const labelNode = await createRowLabel(
      label.text,
      SECTION_PADDING,
      SECTION_PADDING +
        contentYOffsetLocal +
        label.y +
        GRID_LAYOUT.labelVerticalOffset.md,
    );
    lightSection.frame.appendChild(labelNode);
  }

  // Add note about other sizes
  const noteText = await createTextNode(
    "Note: sm and lg sizes also available in code",
    12,
    400,
  );
  noteText.name = "Size Note";
  const noteMutedVar = getVariableByName(VAR_NAMES.text.subtle);
  if (noteMutedVar) {
    bindTextColorToVariable(noteText, noteMutedVar.id);
  }
  noteText.x = SECTION_PADDING;
  noteText.y = SECTION_PADDING + contentYOffsetLocal + yOffset + 16;
  lightSection.frame.appendChild(noteText);

  // Create instances for dark section
  for (let k = 0; k < components.length; k++) {
    const origComp = components[k];
    const instance = origComp.createInstance();
    instance.x = origComp.x + SECTION_PADDING + labelColumnWidth;
    instance.y =
      origComp.y + SECTION_PADDING + headerRowHeight + contentYOffsetLocal;
    darkSection.frame.appendChild(instance);
  }

  // Add column headers to dark section
  await createColumnHeaders(
    columnHeaders.map(function (h) {
      return { x: h.x + SECTION_PADDING, text: h.text };
    }),
    SECTION_PADDING + contentYOffsetLocal,
    darkSection.frame,
  );

  // Add row labels to dark section
  for (let di = 0; di < rowLabels.length; di++) {
    const darkLabel = rowLabels[di];
    const darkLabelNode = await createRowLabel(
      darkLabel.text,
      SECTION_PADDING,
      SECTION_PADDING + contentYOffsetLocal + darkLabel.y + 8,
    );
    darkSection.frame.appendChild(darkLabelNode);
  }

  // Add note about other sizes to dark section
  const darkNoteText = await createTextNode(
    "Note: sm and lg sizes also available in code",
    12,
    400,
  );
  darkNoteText.name = "Size Note";
  const darkNoteMutedVar = getVariableByName(VAR_NAMES.text.subtle);
  if (darkNoteMutedVar) {
    bindTextColorToVariable(darkNoteText, darkNoteMutedVar.id);
  }
  darkNoteText.x = SECTION_PADDING;
  darkNoteText.y = SECTION_PADDING + contentYOffsetLocal + yOffset + 16;
  darkSection.frame.appendChild(darkNoteText);

  // Content Y offset to make room for title inside frame
  const contentYOffset = SECTION_TITLE.height;

  // Resize sections (add extra height for note and title)
  const totalWidth = contentWidth + SECTION_PADDING * 2;
  const totalHeight = contentHeight + SECTION_PADDING * 2 + 40 + contentYOffset;

  lightSection.section.resizeWithoutConstraints(totalWidth, totalHeight);
  darkSection.section.resizeWithoutConstraints(totalWidth, totalHeight);

  // Add title inside each frame

  // Position sections at startY (no title offset needed since title is inside)
  lightSection.frame.x = SECTION_LAYOUT.startX;
  lightSection.frame.y = startY;

  darkSection.frame.x =
    lightSection.frame.x + totalWidth + SECTION_LAYOUT.modeGap;
  darkSection.frame.y = startY;

  logComplete(
    "✅ Generated DateRangePicker ComponentSet with " +
      components.length +
      " variants (base size only, light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}

/**
 * Exports for tests and backwards compatibility
 */
export const DATE_RANGE_PICKER_SIZE_VALUES = SIZE_VALUES;
export const DATE_RANGE_PICKER_VARIANT_VALUES = VARIANT_VALUES;
export const DATE_RANGE_PICKER_SELECTED_VALUES = SELECTED_VALUES;

/**
 * TESTABLE EXPORTS - Pure functions for testing without Figma API
 *
 * These exports enable structural + snapshot testing pattern.
 * They return intermediate data structures BEFORE Figma API calls.
 */

/**
 * Returns size configuration from SIZE_CONFIG (values from registry)
 */
export function getDateRangePickerSizeConfig() {
  return {
    values: SIZE_VALUES, // from registry
    config: SIZE_CONFIG, // hardcoded (TODO: extract from KUMO_DATE_RANGE_PICKER_VARIANTS)
    registryClasses: sizeProp.classes,
    registryDescriptions: sizeProp.descriptions,
  };
}

/**
 * Returns variant configuration from VARIANT_CONFIG (derived from registry)
 */
export function getDateRangePickerVariantConfig() {
  return {
    values: VARIANT_VALUES, // from registry
    config: VARIANT_CONFIG, // derived from registry classes
    registryClasses: variantProp.classes,
    registryDescriptions: variantProp.descriptions,
  };
}

/**
 * Returns selected state configuration
 */
export function getDateRangePickerSelectedConfig() {
  return {
    values: SELECTED_VALUES,
  };
}

/**
 * Returns size-specific dimensions for a given size
 */
export function getDateRangePickerSizeDimensions(size: string) {
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG["base"];
  return {
    size: size,
    calendarWidth: sizeConfig.calendarWidth,
    cellHeight: sizeConfig.cellHeight,
    cellWidth: sizeConfig.cellWidth,
    textSize: sizeConfig.textSize,
    iconSize: sizeConfig.iconSize,
    padding: sizeConfig.padding,
    gap: sizeConfig.gap,
  };
}

/**
 * Returns variant-specific background variable
 */
export function getDateRangePickerVariantBackground(variant: string) {
  const variantConfig = VARIANT_CONFIG[variant] || VARIANT_CONFIG["default"];
  return {
    variant: variant,
    bgVariable: variantConfig.bgVariable,
  };
}

/**
 * Returns day-of-week labels
 */
export function getDateRangePickerDayLabels() {
  return DAYS_OF_WEEK;
}

/**
 * Returns month configuration for calendar display
 */
export function getDateRangePickerMonthConfig() {
  return MONTH_CONFIG;
}

/**
 * Returns complete intermediate data for all size/variant/selected combinations
 */
export function getAllDateRangePickerVariantData() {
  const allData: {
    size: string;
    variant: string;
    selected: boolean;
    sizeConfig: ReturnType<typeof getDateRangePickerSizeDimensions>;
    variantConfig: ReturnType<typeof getDateRangePickerVariantBackground>;
  }[] = [];

  for (let si = 0; si < SIZE_VALUES.length; si++) {
    const size = SIZE_VALUES[si];
    for (let vi = 0; vi < VARIANT_VALUES.length; vi++) {
      const variant = VARIANT_VALUES[vi];
      for (let seli = 0; seli < SELECTED_VALUES.length; seli++) {
        const selected = SELECTED_VALUES[seli];
        allData.push({
          size: size,
          variant: variant,
          selected: selected,
          sizeConfig: getDateRangePickerSizeDimensions(size),
          variantConfig: getDateRangePickerVariantBackground(variant),
        });
      }
    }
  }

  return {
    sizeConfig: getDateRangePickerSizeConfig(),
    variantConfig: getDateRangePickerVariantConfig(),
    selectedConfig: getDateRangePickerSelectedConfig(),
    dayLabels: getDateRangePickerDayLabels(),
    monthConfig: getDateRangePickerMonthConfig(),
    variants: allData,
  };
}
