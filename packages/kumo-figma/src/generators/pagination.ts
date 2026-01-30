import { logComplete } from "../logger";
/**
 * Pagination Component Generator
 *
 * Generates a Pagination ComponentSet in Figma showing page navigation controls.
 * Structure: "Showing X-Y of Z" text + InputGroup with navigation buttons.
 *
 * NOTE: Layout constants are specific to Figma display and not directly from React component.
 * The React Pagination component uses Button and Input primitives, but the generator creates
 * a custom layout for demonstration purposes.
 */

import {
  createTextNode,
  bindFillToVariable,
  getVariableByName,
  createModeSection,
  createRowLabel,
  bindTextColorToVariable,
  bindStrokeToVariable,
  VAR_NAMES,
  SECTION_PADDING,
  SECTION_GAP,
  SECTION_LAYOUT,
  SECTION_TITLE,
  GRID_LAYOUT,
  FONT_SIZE,
  FALLBACK_VALUES,
  SPACING,
} from "./shared";
import themeData from "../generated/theme-data.json";
import { createIconInstance, bindIconColor } from "./icon-utils";

// Import component metadata from registry
import registry from "@cloudflare/kumo/ai/component-registry.json";

const paginationComponent = registry.components.Pagination;
const paginationProps = paginationComponent.props;
const paginationColors = paginationComponent.colors;
const paginationStyling = (registry.components.Pagination as any).styling;

/**
 * Fallback layout configuration
 * Used if registry doesn't have styling metadata
 */
const FALLBACK_LAYOUT = {
  height: FALLBACK_VALUES.height.base, // h-9 = 36px
  buttonSize: FALLBACK_VALUES.height.base, // h-9 = 36px
  inputWidth: 50, // FIGMA-SPECIFIC: Page number input width for Figma display
  iconSize: FALLBACK_VALUES.iconSize.sm, // size-4 = 16px
  gap: themeData.tailwind.spacing.scale["2"], // gap-2 = 8px
  borderRadius: themeData.tailwind.borderRadius.lg, // rounded-lg = 8px
};

/**
 * Get layout configuration from registry with fallback
 * Reads from registry.components.Pagination.styling.layout
 */
function getLayoutFromRegistry() {
  if (!paginationStyling?.layout) {
    return FALLBACK_LAYOUT;
  }
  return paginationStyling.layout;
}

/**
 * Pagination layout constants
 * NOTE: These are Figma display-specific dimensions for showing the navigation control variants.
 * The React component uses Button (h-9, 36px) and Input components, which have their own sizing.
 */
const LAYOUT = getLayoutFromRegistry();
const PAGINATION_HEIGHT = LAYOUT.height;
const BUTTON_SIZE = LAYOUT.buttonSize;
const INPUT_WIDTH = LAYOUT.inputWidth;
const ICON_SIZE = LAYOUT.iconSize;
const GAP = 0; // InputGroup buttons are flush against each other (overridden from registry gap: 8)
const BORDER_RADIUS = LAYOUT.borderRadius;

/**
 * ============================================================================
 * TESTABLE EXPORTS - Pure functions for testing (no Figma API calls)
 * ============================================================================
 */

/**
 * Get registry data for Pagination component
 */
export function getPaginationRegistryData() {
  return {
    name: paginationComponent.name,
    description: paginationComponent.description,
    category: paginationComponent.category,
    colors: paginationColors,
    props: {
      controls: paginationProps.controls,
    },
  };
}

/**
 * Get pagination layout dimensions configuration
 * NOTE: These are Figma display-specific, not directly from React component
 */
export function getPaginationDimensionsConfig() {
  return {
    paginationHeight: PAGINATION_HEIGHT,
    buttonSize: BUTTON_SIZE,
    inputWidth: INPUT_WIDTH,
    iconSize: ICON_SIZE,
    gap: GAP,
    borderRadius: BORDER_RADIUS,
  };
}

/**
 * Get page state configurations
 * Demonstrates first page (prev disabled), middle page (all enabled), last page (next disabled)
 */
export function getPaginationStateConfig() {
  return [
    { page: 1, label: "state=first" },
    { page: 5, label: "state=middle" },
    { page: 10, label: "state=last" },
  ];
}

/**
 * Get pagination color bindings (semantic tokens)
 * Maps visual elements to Kumo semantic color tokens
 */
export function getPaginationColorBindings() {
  return {
    buttonBackground: VAR_NAMES.color.control, // bg-kumo-control
    buttonBorder: VAR_NAMES.color.line, // ring-kumo-line
    iconEnabled: VAR_NAMES.text.default,
    iconDisabled: VAR_NAMES.text.inactive,
    inputBackground: VAR_NAMES.color.control, // bg-kumo-control
    inputBorder: VAR_NAMES.color.line, // ring-kumo-line
    inputText: VAR_NAMES.text.default,
    showingTextLabel: VAR_NAMES.text.strong, // From registry.colors: text-kumo-strong
  };
}

/**
 * Calculate showing range text data
 */
export function calculateShowingRange(
  page: number,
  perPage: number,
  totalCount: number,
) {
  const lower = page * perPage - perPage + 1;
  const upper = Math.min(page * perPage, totalCount);
  const maxPage = Math.ceil(totalCount / perPage);
  return {
    lower: lower,
    upper: upper,
    maxPage: maxPage,
    text: "Showing " + lower + "-" + upper + " of " + totalCount,
  };
}

/**
 * Get button states for a given page
 */
export function getButtonStates(page: number, maxPage: number) {
  const isFirstPage = page <= 1;
  const isLastPage = page >= maxPage;
  return {
    isFirstPage: isFirstPage,
    isLastPage: isLastPage,
    buttons: [
      {
        iconId: "ph-caret-double-left",
        ariaLabel: "First page",
        position: "first" as "first" | "middle" | "last" | "single",
        disabled: isFirstPage,
      },
      {
        iconId: "ph-caret-left",
        ariaLabel: "Previous page",
        position: "middle" as "first" | "middle" | "last" | "single",
        disabled: isFirstPage,
      },
      {
        iconId: "ph-caret-right",
        ariaLabel: "Next page",
        position: "middle" as "first" | "middle" | "last" | "single",
        disabled: isLastPage,
      },
      {
        iconId: "ph-caret-double-right",
        ariaLabel: "Last page",
        position: "last" as "first" | "middle" | "last" | "single",
        disabled: isLastPage,
      },
    ],
  };
}

/**
 * Get all pagination intermediate data (for snapshot testing)
 */
export function getAllPaginationData() {
  const registry = getPaginationRegistryData();
  const dimensions = getPaginationDimensionsConfig();
  const states = getPaginationStateConfig();
  const colors = getPaginationColorBindings();
  const perPage = 10;
  const totalCount = 100;

  return {
    registry: registry,
    dimensions: dimensions,
    colors: colors,
    states: states.map(function (state) {
      const showingRange = calculateShowingRange(
        state.page,
        perPage,
        totalCount,
      );
      const buttonStates = getButtonStates(state.page, showingRange.maxPage);
      return {
        label: state.label,
        page: state.page,
        perPage: perPage,
        totalCount: totalCount,
        showingRange: showingRange,
        buttonStates: buttonStates,
      };
    }),
  };
}

/**
 * Create a navigation button with icon
 */
async function createNavButton(
  iconId: string,
  ariaLabel: string,
  position: "first" | "middle" | "last" | "single",
  disabled: boolean,
): Promise<FrameNode> {
  const button = figma.createFrame();
  button.name = ariaLabel;
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.primaryAxisSizingMode = "FIXED";
  button.counterAxisSizingMode = "FIXED";
  button.resize(BUTTON_SIZE, BUTTON_SIZE);

  // Apply corner radius based on position
  if (position === "first") {
    button.topLeftRadius = BORDER_RADIUS;
    button.bottomLeftRadius = BORDER_RADIUS;
    button.topRightRadius = 0;
    button.bottomRightRadius = 0;
  } else if (position === "last") {
    button.topLeftRadius = 0;
    button.bottomLeftRadius = 0;
    button.topRightRadius = BORDER_RADIUS;
    button.bottomRightRadius = BORDER_RADIUS;
  } else if (position === "single") {
    button.cornerRadius = BORDER_RADIUS;
  } else {
    button.cornerRadius = 0;
  }

  // Background: bg-kumo-control (color-surface-2)
  const bgVar = getVariableByName(VAR_NAMES.color.control);
  if (bgVar) {
    bindFillToVariable(button, bgVar.id);
  }

  // Border: ring-kumo-line
  const borderVar = getVariableByName(VAR_NAMES.color.line);
  if (borderVar) {
    bindStrokeToVariable(button, borderVar.id, 1);
  }

  // Create icon
  const icon = createIconInstance(iconId, ICON_SIZE);
  if (icon) {
    // Icon color: text-color-surface for enabled, text-color-disabled for disabled
    const iconColorVar = disabled
      ? VAR_NAMES.text.inactive
      : VAR_NAMES.text.default;
    bindIconColor(icon, iconColorVar);
    button.appendChild(icon);
  }

  return button;
}

/**
 * Create the page number input field
 */
async function createPageInput(pageNumber: string): Promise<FrameNode> {
  const input = figma.createFrame();
  input.name = "Page Input";
  input.layoutMode = "HORIZONTAL";
  input.primaryAxisAlignItems = "CENTER";
  input.counterAxisAlignItems = "CENTER";
  input.primaryAxisSizingMode = "FIXED";
  input.counterAxisSizingMode = "FIXED";
  input.resize(INPUT_WIDTH, BUTTON_SIZE);
  input.cornerRadius = 0;

  // Background: bg-kumo-control (color-surface-2)
  const bgVar = getVariableByName(VAR_NAMES.color.control);
  if (bgVar) {
    bindFillToVariable(input, bgVar.id);
  }

  // Border: ring-kumo-line
  const borderVar = getVariableByName(VAR_NAMES.color.line);
  if (borderVar) {
    bindStrokeToVariable(input, borderVar.id, 1);
  }

  // Page number text - use centralized constants
  const text = await createTextNode(
    pageNumber,
    FONT_SIZE.xs + 2,
    FALLBACK_VALUES.fontWeight.normal,
  );
  text.name = "Page Number";
  text.textAlignHorizontal = "CENTER";

  const textColorVar = getVariableByName(VAR_NAMES.text.default);
  if (textColorVar) {
    bindTextColorToVariable(text, textColorVar.id);
  }

  input.appendChild(text);

  return input;
}

/**
 * Create the "Showing X-Y of Z" text
 */
async function createShowingText(
  lower: number,
  upper: number,
  total: number,
): Promise<TextNode> {
  const text = await createTextNode(
    "Showing " + lower + "-" + upper + " of " + total,
    FONT_SIZE.xs + 2, // 14px
    FALLBACK_VALUES.fontWeight.normal,
  );
  text.name = "Showing Text";

  const labelVar = getVariableByName(VAR_NAMES.text.strong);
  if (labelVar) {
    bindTextColorToVariable(text, labelVar.id);
  }

  return text;
}

/**
 * Create the InputGroup container with navigation buttons
 */
async function createInputGroup(
  currentPage: number,
  maxPage: number,
): Promise<FrameNode> {
  const group = figma.createFrame();
  group.name = "InputGroup";
  group.layoutMode = "HORIZONTAL";
  group.primaryAxisAlignItems = "MIN";
  group.counterAxisAlignItems = "CENTER";
  group.primaryAxisSizingMode = "AUTO";
  group.counterAxisSizingMode = "AUTO";
  group.itemSpacing = GAP;
  group.fills = [];

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= maxPage;

  // First page button
  const firstBtn = await createNavButton(
    "ph-caret-double-left",
    "First page",
    "first",
    isFirstPage,
  );
  group.appendChild(firstBtn);

  // Previous page button
  const prevBtn = await createNavButton(
    "ph-caret-left",
    "Previous page",
    "middle",
    isFirstPage,
  );
  group.appendChild(prevBtn);

  // Page input
  const pageInput = await createPageInput(String(currentPage));
  group.appendChild(pageInput);

  // Next page button
  const nextBtn = await createNavButton(
    "ph-caret-right",
    "Next page",
    "middle",
    isLastPage,
  );
  group.appendChild(nextBtn);

  // Last page button
  const lastBtn = await createNavButton(
    "ph-caret-double-right",
    "Last page",
    "last",
    isLastPage,
  );
  group.appendChild(lastBtn);

  return group;
}

/**
 * Create a single Pagination component
 */
async function createPaginationComponent(
  page: number,
  perPage: number,
  totalCount: number,
  variantLabel: string,
): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = variantLabel;
  component.description = "Pagination at page " + page;

  // Set up auto-layout (horizontal: showing text + input group)
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "SPACE_BETWEEN";
  component.counterAxisAlignItems = "CENTER";
  component.primaryAxisSizingMode = "FIXED";
  component.counterAxisSizingMode = "AUTO";
  component.itemSpacing = SPACING.base;
  component.resize(400, PAGINATION_HEIGHT);
  component.fills = [];

  // Calculate showing range
  const lower = page * perPage - perPage + 1;
  const upper = Math.min(page * perPage, totalCount);
  const maxPage = Math.ceil(totalCount / perPage);

  // Create "Showing X-Y of Z" text
  const showingText = await createShowingText(lower, upper, totalCount);
  component.appendChild(showingText);

  // Create InputGroup with navigation
  const inputGroup = await createInputGroup(page, maxPage);
  component.appendChild(inputGroup);

  return component;
}

/**
 * Generate Pagination ComponentSet with different page states
 *
 * Creates variants for: first page, middle page, last page
 * Creates both light and dark mode sections.
 *
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generatePaginationComponents(
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  // Page states to demonstrate
  const pageStates = [
    { page: 1, label: "state=first" }, // First page (prev disabled)
    { page: 5, label: "state=middle" }, // Middle page (all enabled)
    { page: 10, label: "state=last" }, // Last page (next disabled)
  ];

  const perPage = 10;
  const totalCount = 100;

  const components: ComponentNode[] = [];
  const rowLabels: { y: number; text: string }[] = [];

  // Layout spacing - using centralized GRID_LAYOUT constants
  const rowGap = GRID_LAYOUT.rowGap.standard; // 48px
  const labelColumnWidth = GRID_LAYOUT.labelColumnWidth.medium; // 180px
  let currentY = 0;

  for (let i = 0; i < pageStates.length; i++) {
    const state = pageStates[i];
    const component = await createPaginationComponent(
      state.page,
      perPage,
      totalCount,
      state.label,
    );

    // Record row label
    rowLabels.push({ y: currentY, text: state.label });

    // Position each component vertically
    component.x = labelColumnWidth;
    component.y = currentY;
    currentY += component.height + rowGap;
    components.push(component);
  }

  // Combine all variants into a single ComponentSet
  // @ts-ignore - combineAsVariants works at runtime
  const componentSet = figma.combineAsVariants(components, figma.currentPage);
  componentSet.name = "Pagination";
  componentSet.description =
    "Pagination component showing page navigation at different states";

  // Calculate content dimensions
  const contentWidth = componentSet.width + labelColumnWidth;
  const contentHeight = componentSet.height;

  // Content Y offset to make room for title inside frame
  const contentYOffset = SECTION_TITLE.height;

  // Create light mode section
  const lightSection = createModeSection(
    figma.currentPage,
    "Pagination",
    "light",
  );
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + contentYOffset,
  );

  // Create dark mode section
  const darkSection = createModeSection(
    figma.currentPage,
    "Pagination",
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
  for (let j = 0; j < rowLabels.length; j++) {
    const label = rowLabels[j];
    const labelNode = await createRowLabel(
      label.text,
      SECTION_PADDING,
      SECTION_PADDING + contentYOffset + label.y + 10,
    );
    lightSection.frame.appendChild(labelNode);
  }

  // Create instances for dark section
  for (let k = 0; k < components.length; k++) {
    const comp = components[k];
    const instance = comp.createInstance();
    instance.x = comp.x + SECTION_PADDING + labelColumnWidth;
    instance.y = comp.y + SECTION_PADDING + contentYOffset;
    darkSection.frame.appendChild(instance);
  }

  // Add row labels to dark section
  for (let l = 0; l < rowLabels.length; l++) {
    const darkLabel = rowLabels[l];
    const darkLabelNode = await createRowLabel(
      darkLabel.text,
      SECTION_PADDING,
      SECTION_PADDING + contentYOffset + darkLabel.y + 10,
    );
    darkSection.frame.appendChild(darkLabelNode);
  }

  // Resize sections to fit content with padding
  const totalWidth = contentWidth + SECTION_PADDING * 2;
  const totalHeight = contentHeight + SECTION_PADDING * 2 + contentYOffset;

  lightSection.frame.resize(totalWidth, totalHeight);
  darkSection.frame.resize(totalWidth, totalHeight);

  // Position sections at startY (title is inside frame)
  lightSection.frame.x = SECTION_LAYOUT.startX;
  lightSection.frame.y = startY;

  darkSection.frame.x =
    lightSection.frame.x + totalWidth + SECTION_LAYOUT.modeGap;
  darkSection.frame.y = startY;

  logComplete(
    "✅ Generated Pagination ComponentSet with " +
      pageStates.length +
      " states (light + dark)",
  );

  return startY + totalHeight + SECTION_GAP;
}
