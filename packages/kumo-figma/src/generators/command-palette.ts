/**
 * CommandPalette Component Generator
 *
 * Generates a CommandPalette component in Figma that matches
 * the CommandPalette component structure:
 *
 * - Dialog container with rounded corners and shadow
 * - Search input header with magnifying glass icon
 * - Results list with grouped items (normal + highlighted states)
 * - ResultItem with breadcrumbs, icons, and arrows
 * - Footer with keyboard hints
 *
 * The CommandPalette is a compound component used for search/command interfaces.
 * Since it doesn't have traditional variants, we show the full structure.
 *
 * @see packages/kumo/src/components/command-palette/command-palette.tsx
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
  FONT_SIZE,
  FALLBACK_VALUES,
  SPACING,
  SHADOWS,
  VAR_NAMES,
} from "./shared";
import { getButtonIcon, bindIconColor } from "./icon-utils";
import { logComplete } from "../logger";
import { parseTailwindClasses } from "../parsers/tailwind-to-figma";
import themeData from "../generated/theme-data.json";

/**
 * Tailwind classes extracted from command-palette.tsx
 * These serve as the source of truth for styling
 */
const COMPONENT_CLASSES = {
  // Container: "flex max-h-[60vh] flex-col overflow-hidden rounded-lg bg-kumo-elevated"
  container: "rounded-lg bg-kumo-elevated",
  // Dialog popup: "fixed top-[10vh] left-1/2 w-full max-w-2xl -translate-x-1/2 overflow-hidden rounded-lg"
  dialog: "max-w-2xl rounded-lg",
  // Input header: "flex items-center gap-3 bg-kumo-base px-4 py-3"
  inputHeader: "gap-3 bg-kumo-base px-4 py-3",
  // Search icon: "h-4 w-4 text-kumo-subtle"
  searchIcon: "h-4 w-4 text-kumo-subtle",
  // Input: "flex-1 border-none bg-transparent text-base placeholder:text-kumo-subtle"
  input: "text-base",
  // List: "z-10 min-h-0 flex-1 overflow-y-auto rounded-b-lg bg-kumo-base px-2 py-2 ring-1 ring-kumo-line"
  list: "rounded-b-lg bg-kumo-base px-2 py-2 ring-1 ring-kumo-line",
  // Group: "space-y-0.5"
  group: "space-y-0.5",
  // Group label: "mb-2 px-2 pt-1 text-xs font-semibold text-kumo-strong"
  groupLabel: "px-2 pt-1 text-xs font-semibold text-kumo-strong",
  // Item: "flex w-full items-center gap-3 px-2 py-1.5 text-left cursor-pointer data-[highlighted]:bg-kumo-overlay rounded-lg"
  item: "gap-3 px-2 py-1.5 rounded-lg",
  itemHighlighted: "bg-kumo-overlay",
  // ResultItem icon container: "flex flex-shrink-0 items-center text-kumo-subtle"
  resultIcon: "text-kumo-subtle",
  // ResultItem title: "text-base text-kumo-default"
  resultTitle: "text-base text-kumo-default",
  // ResultItem breadcrumb separator: "h-3 w-3 flex-shrink-0 text-kumo-subtle"
  breadcrumbSeparator: "h-3 w-3 text-kumo-subtle",
  // ResultItem arrow: "h-4 w-4 flex-shrink-0 text-kumo-subtle opacity-0 transition-opacity group-data-[highlighted]:opacity-100"
  resultArrow: "h-4 w-4 text-kumo-subtle",
  // External icon: "h-3.5 w-3.5 flex-shrink-0 text-kumo-subtle"
  externalIcon: "h-3.5 w-3.5 text-kumo-subtle",
  // Empty state: "p-8 text-center text-kumo-strong"
  empty: "p-8 text-kumo-strong",
  // Loading: "flex items-center justify-center p-8"
  loading: "p-8",
  // Footer: "flex items-center justify-between rounded-b-lg bg-kumo-elevated px-4 py-3 text-xs text-kumo-strong"
  footer: "rounded-b-lg bg-kumo-elevated px-4 py-3 text-xs text-kumo-strong",
  // Highlight mark: "rounded-sm bg-kumo-warning/50 text-kumo-default"
  highlightMark: "rounded-sm bg-kumo-warning/50 text-kumo-default",
};

/**
 * CommandPalette configuration derived from Tailwind classes
 * Uses parseTailwindClasses and theme-data for all values
 */
const CONFIG = {
  // max-w-2xl = 42rem = 672px (from Tailwind defaults)
  width: 42 * 16, // 672px
  // Approximate max height for Figma representation
  maxHeight: 400,
  // py-3 = 12px * 2 + icon height
  inputHeight:
    (themeData.tailwind.spacing.scale["3"] || 12) * 2 +
    (themeData.tailwind.spacing.scale["4"] || 16),
  // py-3 = 12px * 2 + text
  footerHeight:
    (themeData.tailwind.spacing.scale["3"] || 12) * 2 +
    (themeData.kumo.fontSize.xs || 12),
  // py-1.5 = 6px * 2 + content
  itemHeight:
    (themeData.tailwind.spacing.scale["1.5"] || 6) * 2 +
    (themeData.kumo.fontSize.base || 14),
  // text-xs + pt-1 + mb-2
  groupLabelHeight:
    (themeData.kumo.fontSize.xs || 12) +
    (themeData.tailwind.spacing.scale["1"] || 4) +
    (themeData.tailwind.spacing.scale["2"] || 8),
};

/**
 * Create the search input header
 * Styles from: "flex items-center gap-3 bg-kumo-base px-4 py-3"
 */
async function createInputHeader(): Promise<FrameNode> {
  const styles = parseTailwindClasses(COMPONENT_CLASSES.inputHeader);

  const header = figma.createFrame();
  header.name = "Input Header";
  header.layoutMode = "HORIZONTAL";
  header.primaryAxisAlignItems = "CENTER";
  header.counterAxisAlignItems = "CENTER";
  // For HORIZONTAL layout: primary axis = width, counter axis = height
  // Set to AUTO so it hugs content, then FILL after appending to parent
  header.primaryAxisSizingMode = "AUTO";
  header.counterAxisSizingMode = "AUTO";

  // px-4 py-3 from parsed classes
  header.paddingLeft = styles.paddingX || FALLBACK_VALUES.padding.standard;
  header.paddingRight = styles.paddingX || FALLBACK_VALUES.padding.standard;
  header.paddingTop = styles.paddingY || FALLBACK_VALUES.padding.horizontal;
  header.paddingBottom = styles.paddingY || FALLBACK_VALUES.padding.horizontal;
  // gap-3 from parsed classes
  header.itemSpacing = styles.gap || SPACING.lg;

  // bg-surface-elevated from parsed classes
  if (styles.fillVariable) {
    const bgVar = getVariableByName(styles.fillVariable);
    if (bgVar) {
      bindFillToVariable(header, bgVar.id);
    }
  }

  // Magnifying glass icon (h-4 w-4 text-kumo-subtle)
  const searchIcon = getButtonIcon("ph-magnifying-glass", "sm");
  searchIcon.name = "Search Icon";
  bindIconColor(searchIcon, "text-kumo-subtle");
  header.appendChild(searchIcon);

  // Search input placeholder text (text-base)
  const inputStyles = parseTailwindClasses(COMPONENT_CLASSES.input);
  const placeholder = await createTextNode(
    "Search...",
    inputStyles.fontSize || FONT_SIZE.base,
    FALLBACK_VALUES.fontWeight.normal,
  );
  placeholder.name = "Placeholder";
  placeholder.layoutGrow = 1;
  const mutedVar = getVariableByName(VAR_NAMES.text.subtle);
  if (mutedVar) {
    bindTextColorToVariable(placeholder, mutedVar.id);
  }
  header.appendChild(placeholder);

  return header;
}

/**
 * Create a result item
 * Styles from: "flex w-full items-center gap-3 px-2 py-1.5 text-left cursor-pointer rounded-lg"
 *
 * @param title - Item title text
 * @param highlighted - Whether to show highlighted (bg-subtle) state
 * @param showArrow - Whether to show the arrow indicator
 * @param breadcrumbs - Optional breadcrumb path before title
 * @param iconName - Icon to show (defaults to ph-file)
 */
async function createResultItem(
  title: string,
  highlighted: boolean = false,
  showArrow: boolean = true,
  breadcrumbs?: string[],
  iconName: string = "ph-file",
): Promise<FrameNode> {
  const styles = parseTailwindClasses(COMPONENT_CLASSES.item);

  const item = figma.createFrame();
  item.name = highlighted ? "Result Item (highlighted)" : "Result Item";
  item.layoutMode = "HORIZONTAL";
  item.primaryAxisAlignItems = "CENTER";
  item.counterAxisAlignItems = "CENTER";
  // For HORIZONTAL layout: primary axis = width, counter axis = height
  // Set to AUTO so it hugs content, then FILL after appending to parent
  item.primaryAxisSizingMode = "AUTO";
  item.counterAxisSizingMode = "AUTO";

  // px-2 py-1.5 from parsed classes
  item.paddingLeft = styles.paddingX || SPACING.base;
  item.paddingRight = styles.paddingX || SPACING.base;
  item.paddingTop = styles.paddingY || SPACING.sm;
  item.paddingBottom = styles.paddingY || SPACING.sm;
  // gap-3 from parsed classes
  item.itemSpacing = styles.gap || SPACING.lg;
  // rounded-lg from parsed classes
  item.cornerRadius = styles.borderRadius || BORDER_RADIUS.lg;

  // Background: transparent normally, bg-subtle when highlighted
  if (highlighted) {
    const highlightStyles = parseTailwindClasses(
      COMPONENT_CLASSES.itemHighlighted,
    );
    if (highlightStyles.fillVariable) {
      const bgVar = getVariableByName(highlightStyles.fillVariable);
      if (bgVar) {
        bindFillToVariable(item, bgVar.id);
      }
    }
  } else {
    item.fills = [];
  }

  // Item icon (text-kumo-subtle)
  const icon = getButtonIcon(iconName, "sm");
  icon.name = "Icon";
  bindIconColor(icon, "text-kumo-subtle");
  item.appendChild(icon);

  // Content wrapper for breadcrumbs + title
  const contentWrapper = figma.createFrame();
  contentWrapper.name = "Content";
  contentWrapper.layoutMode = "HORIZONTAL";
  contentWrapper.counterAxisAlignItems = "CENTER";
  // For HORIZONTAL layout: primary axis = width, counter axis = height
  // Set to AUTO so it hugs content, then FILL after appending to parent
  contentWrapper.primaryAxisSizingMode = "AUTO";
  contentWrapper.counterAxisSizingMode = "AUTO";
  contentWrapper.itemSpacing = SPACING.base;
  contentWrapper.fills = [];

  // Add breadcrumbs if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    for (const crumb of breadcrumbs) {
      // Breadcrumb text
      const crumbText = await createTextNode(
        crumb,
        FONT_SIZE.base,
        FALLBACK_VALUES.fontWeight.normal,
      );
      crumbText.name = "Breadcrumb";
      const surfaceVar = getVariableByName(VAR_NAMES.text.default);
      if (surfaceVar) {
        bindTextColorToVariable(crumbText, surfaceVar.id);
      }
      contentWrapper.appendChild(crumbText);

      // Separator icon (CaretRightIcon)
      const separator = getButtonIcon("ph-caret-right", "xs");
      separator.name = "Separator";
      bindIconColor(separator, "text-kumo-subtle");
      contentWrapper.appendChild(separator);
    }
  }

  // Title text (text-base text-kumo-default)
  const titleStyles = parseTailwindClasses(COMPONENT_CLASSES.resultTitle);
  const titleText = await createTextNode(
    title,
    titleStyles.fontSize || FONT_SIZE.base,
    FALLBACK_VALUES.fontWeight.normal,
  );
  titleText.name = "Title";
  if (titleStyles.textVariable) {
    const textVar = getVariableByName(titleStyles.textVariable);
    if (textVar) {
      bindTextColorToVariable(titleText, textVar.id);
    }
  }
  contentWrapper.appendChild(titleText);

  item.appendChild(contentWrapper);
  // Set FILL sizing after appending to auto-layout parent
  contentWrapper.layoutSizingHorizontal = "FILL";

  // Arrow icon (shown when highlighted)
  if (showArrow && highlighted) {
    const arrow = getButtonIcon("ph-arrow-right", "sm");
    arrow.name = "Arrow";
    bindIconColor(arrow, "text-kumo-subtle");
    item.appendChild(arrow);
  }

  return item;
}

/**
 * Create a group label
 * Styles from: "mb-2 px-2 pt-1 text-xs font-semibold text-kumo-strong"
 */
async function createGroupLabel(text: string): Promise<FrameNode> {
  const styles = parseTailwindClasses(COMPONENT_CLASSES.groupLabel);

  // Wrap in frame for padding
  const wrapper = figma.createFrame();
  wrapper.name = "Group Label";
  wrapper.layoutMode = "HORIZONTAL";
  // For HORIZONTAL layout: primary axis = width, counter axis = height
  // Set to AUTO so it hugs content, then FILL after appending to parent
  wrapper.primaryAxisSizingMode = "AUTO";
  wrapper.counterAxisSizingMode = "AUTO";
  wrapper.paddingLeft = styles.paddingX || SPACING.base;
  wrapper.paddingRight = styles.paddingX || SPACING.base;
  wrapper.paddingTop = SPACING.xs; // pt-1
  wrapper.fills = [];

  const label = await createTextNode(
    text,
    styles.fontSize || FONT_SIZE.xs,
    styles.fontWeight || FALLBACK_VALUES.fontWeight.semiBold,
  );
  label.name = "Label Text";

  // text-kumo-strong
  if (styles.textVariable) {
    const labelVar = getVariableByName(styles.textVariable);
    if (labelVar) {
      bindTextColorToVariable(label, labelVar.id);
    }
  }

  wrapper.appendChild(label);
  return wrapper;
}

/**
 * Create the results list
 * Styles from: "z-10 min-h-0 flex-1 overflow-y-auto rounded-b-lg bg-surface-elevated px-2 py-2 ring-1 ring-kumo-line"
 */
async function createResultsList(): Promise<FrameNode> {
  const styles = parseTailwindClasses(COMPONENT_CLASSES.list);

  const list = figma.createFrame();
  list.name = "Results List";
  list.layoutMode = "VERTICAL";
  // Note: layoutSizingHorizontal = "FILL" must be set AFTER appending to auto-layout parent
  // For VERTICAL layout: primaryAxis=height (AUTO=hug), counterAxis=width (AUTO until FILL set)
  list.primaryAxisSizingMode = "AUTO";
  list.counterAxisSizingMode = "AUTO";

  // px-2 py-2 from parsed classes
  list.paddingLeft = styles.paddingX || SPACING.base;
  list.paddingRight = styles.paddingX || SPACING.base;
  list.paddingTop = styles.paddingY || SPACING.base;
  list.paddingBottom = styles.paddingY || SPACING.base;
  // space-y-3 between groups (from Results component)
  list.itemSpacing = themeData.tailwind.spacing.scale["3"] || 12;

  // bg-surface-elevated from parsed classes
  if (styles.fillVariable) {
    const bgVar = getVariableByName(styles.fillVariable);
    if (bgVar) {
      bindFillToVariable(list, bgVar.id);
    }
  }

  // Note: The list has ring-1 ring-kumo-line and rounded-b-lg in the React component,
  // but when a Footer is present (which is the standard Figma representation),
  // the footer gets the rounded-b-lg and the list should have no rounding or ring.
  // The ring is an internal separator that's not needed in Figma's static representation.
  list.cornerRadius = 0;

  // Add first group with normal items
  const group1Frame = figma.createFrame();
  group1Frame.name = "Group: Recent";
  group1Frame.layoutMode = "VERTICAL";
  // Note: layoutSizingHorizontal = "FILL" must be set AFTER appending to auto-layout parent
  // For VERTICAL layout: primaryAxis=height (AUTO=hug), counterAxis=width (AUTO until FILL set)
  group1Frame.primaryAxisSizingMode = "AUTO";
  group1Frame.counterAxisSizingMode = "AUTO";
  // space-y-0.5 from group class
  group1Frame.itemSpacing = themeData.tailwind.spacing.scale["0.5"] || 2;
  group1Frame.fills = [];

  // Group label
  const groupLabel1 = await createGroupLabel("Recent");
  group1Frame.appendChild(groupLabel1);
  groupLabel1.layoutSizingHorizontal = "FILL";

  // Add sample items - first one highlighted to show the pattern
  const item1 = await createResultItem(
    "Dashboard",
    true,
    true,
    undefined,
    "ph-squares-four",
  );
  group1Frame.appendChild(item1);
  item1.layoutSizingHorizontal = "FILL";

  const item2 = await createResultItem(
    "Settings",
    false,
    true,
    undefined,
    "ph-gear",
  );
  group1Frame.appendChild(item2);
  item2.layoutSizingHorizontal = "FILL";

  list.appendChild(group1Frame);
  group1Frame.layoutSizingHorizontal = "FILL";

  // Add second group with breadcrumb example
  const group2Frame = figma.createFrame();
  group2Frame.name = "Group: Navigation";
  group2Frame.layoutMode = "VERTICAL";
  // Note: layoutSizingHorizontal = "FILL" must be set AFTER appending to auto-layout parent
  // For VERTICAL layout: primaryAxis=height (AUTO=hug), counterAxis=width (AUTO until FILL set)
  group2Frame.primaryAxisSizingMode = "AUTO";
  group2Frame.counterAxisSizingMode = "AUTO";
  // space-y-0.5 from group class
  group2Frame.itemSpacing = themeData.tailwind.spacing.scale["0.5"] || 2;
  group2Frame.fills = [];

  const groupLabel2 = await createGroupLabel("Navigation");
  group2Frame.appendChild(groupLabel2);
  groupLabel2.layoutSizingHorizontal = "FILL";

  // Item with breadcrumbs
  const itemWithBreadcrumbs = await createResultItem(
    "VPC",
    false,
    true,
    ["Compute", "Workers"],
    "ph-cloud",
  );
  group2Frame.appendChild(itemWithBreadcrumbs);
  itemWithBreadcrumbs.layoutSizingHorizontal = "FILL";

  list.appendChild(group2Frame);
  group2Frame.layoutSizingHorizontal = "FILL";

  return list;
}

/**
 * Create a keyboard hint element (kbd + label)
 * Styles from: "rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5 text-[10px]"
 */
async function createKeyboardHint(
  key: string,
  label: string,
): Promise<FrameNode> {
  const hint = figma.createFrame();
  hint.name = `Hint: ${label}`;
  hint.layoutMode = "HORIZONTAL";
  hint.primaryAxisSizingMode = "AUTO";
  hint.counterAxisSizingMode = "AUTO";
  hint.counterAxisAlignItems = "CENTER";
  hint.itemSpacing = SPACING.base; // gap-2 = 8px
  hint.fills = [];

  // Create kbd element
  const kbd = figma.createFrame();
  kbd.name = "Key";
  kbd.layoutMode = "HORIZONTAL";
  kbd.primaryAxisSizingMode = "AUTO";
  kbd.counterAxisSizingMode = "AUTO";
  kbd.primaryAxisAlignItems = "CENTER";
  kbd.counterAxisAlignItems = "CENTER";
  // px-1.5 py-0.5
  kbd.paddingLeft = SPACING.sm; // 6px
  kbd.paddingRight = SPACING.sm;
  kbd.paddingTop = SPACING.xs; // 2px
  kbd.paddingBottom = SPACING.xs;
  kbd.cornerRadius = BORDER_RADIUS.sm; // rounded

  // bg-kumo-base
  const bgVar = getVariableByName(VAR_NAMES.color.base);
  if (bgVar) {
    bindFillToVariable(kbd, bgVar.id);
  }

  // border border-kumo-line
  const borderVar = getVariableByName(VAR_NAMES.color.line);
  if (borderVar) {
    bindStrokeToVariable(kbd, borderVar.id, 1);
  }

  // Key text - text-[10px]
  // FIGMA-SPECIFIC: Using 10px to match the component's text-[10px] class
  const keyText = await createTextNode(
    key,
    10,
    FALLBACK_VALUES.fontWeight.normal,
  );
  keyText.name = "Key Text";
  const keyTextVar = getVariableByName(VAR_NAMES.text.strong);
  if (keyTextVar) {
    bindTextColorToVariable(keyText, keyTextVar.id);
  }
  kbd.appendChild(keyText);

  hint.appendChild(kbd);

  // Label text
  const labelText = await createTextNode(
    label,
    FONT_SIZE.xs,
    FALLBACK_VALUES.fontWeight.normal,
  );
  labelText.name = "Label";
  const labelTextVar = getVariableByName(VAR_NAMES.text.strong);
  if (labelTextVar) {
    bindTextColorToVariable(labelText, labelTextVar.id);
  }
  hint.appendChild(labelText);

  return hint;
}

/**
 * Create the footer with keyboard hints
 * Styles from: "flex items-center justify-between rounded-b-lg bg-kumo-elevated px-4 py-3 text-xs text-kumo-strong"
 */
async function createFooter(): Promise<FrameNode> {
  const styles = parseTailwindClasses(COMPONENT_CLASSES.footer);

  const footer = figma.createFrame();
  footer.name = "Footer";
  footer.layoutMode = "HORIZONTAL";
  footer.primaryAxisAlignItems = "SPACE_BETWEEN";
  footer.counterAxisAlignItems = "CENTER";
  // For HORIZONTAL layout: primary axis = width, counter axis = height
  // Set to AUTO so it hugs content, then FILL after appending to parent
  footer.primaryAxisSizingMode = "AUTO";
  footer.counterAxisSizingMode = "AUTO";

  // px-4 py-3 from parsed classes
  footer.paddingLeft = styles.paddingX || FALLBACK_VALUES.padding.standard;
  footer.paddingRight = styles.paddingX || FALLBACK_VALUES.padding.standard;
  footer.paddingTop = styles.paddingY || FALLBACK_VALUES.padding.horizontal;
  footer.paddingBottom = styles.paddingY || FALLBACK_VALUES.padding.horizontal;

  // rounded-b-lg from parsed classes - only bottom corners
  footer.topLeftRadius = 0;
  footer.topRightRadius = 0;
  footer.bottomLeftRadius = BORDER_RADIUS.lg;
  footer.bottomRightRadius = BORDER_RADIUS.lg;

  // bg-kumo-elevated from parsed classes
  if (styles.fillVariable) {
    const bgVar = getVariableByName(styles.fillVariable);
    if (bgVar) {
      bindFillToVariable(footer, bgVar.id);
    }
  }

  // Create keyboard hints matching the demo: ↑↓ Navigate, ↵ Select
  const navigateHint = await createKeyboardHint("↑↓", "Navigate");
  footer.appendChild(navigateHint);

  const selectHint = await createKeyboardHint("↵", "Select");
  footer.appendChild(selectHint);

  return footer;
}

/**
 * Create a single CommandPalette component
 * Container styles from: "flex max-h-[60vh] flex-col overflow-hidden rounded-lg bg-kumo-elevated"
 */
async function createCommandPaletteComponent(): Promise<ComponentNode> {
  const containerStyles = parseTailwindClasses(COMPONENT_CLASSES.container);

  const component = figma.createComponent();
  component.name = "CommandPalette";
  component.description =
    "Command palette for search and navigation. Compound component with Input, List, Groups, Items, and Footer sub-components. Use for global search, command menus, and quick actions.";

  // Set up vertical auto-layout with fixed width (max-w-2xl = 672px) and fixed height
  // FIGMA-SPECIFIC: Using fixed height so the list can FILL and push footer to bottom
  // This matches the React component's flex-col with list having flex-1
  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "FIXED"; // Height fixed so list can fill
  component.counterAxisSizingMode = "FIXED"; // Width fixed
  component.resize(CONFIG.width, CONFIG.maxHeight);
  component.itemSpacing = 0;

  // rounded-lg from parsed classes
  component.cornerRadius = containerStyles.borderRadius || BORDER_RADIUS.lg;
  component.clipsContent = true;

  // bg-kumo-elevated from parsed classes
  if (containerStyles.fillVariable) {
    const bgVar = getVariableByName(containerStyles.fillVariable);
    if (bgVar) {
      bindFillToVariable(component, bgVar.id);
    }
  }

  // Apply dialog shadow (consistent with Dialog component)
  component.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: SHADOWS.dialog.opacity },
      offset: { x: SHADOWS.dialog.offsetX, y: SHADOWS.dialog.offsetY },
      radius: SHADOWS.dialog.blur,
      spread: SHADOWS.dialog.spread,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  // Create and add sections
  // Note: layoutSizingHorizontal = "FILL" must be set AFTER appending to auto-layout parent
  const inputHeader = await createInputHeader();
  component.appendChild(inputHeader);
  inputHeader.layoutSizingHorizontal = "FILL";

  const resultsList = await createResultsList();
  component.appendChild(resultsList);
  resultsList.layoutSizingHorizontal = "FILL";
  // Make list fill vertical space to push footer to bottom (like flex-1 in React)
  resultsList.layoutSizingVertical = "FILL";

  const footer = await createFooter();
  component.appendChild(footer);
  footer.layoutSizingHorizontal = "FILL";

  return component;
}

/**
 * Generate CommandPalette component
 *
 * Creates a "CommandPalette" component with light and dark mode sections.
 *
 * @param page - The page to add components to
 * @param startY - Y position to start placing the section
 * @returns The Y position after this section (for next section placement)
 */
export async function generateCommandPaletteComponents(
  page: PageNode,
  startY: number,
): Promise<number> {
  if (startY === undefined) startY = 100;

  figma.currentPage = page;

  // Create the component
  const component = await createCommandPaletteComponent();

  // Calculate content dimensions
  const contentWidth = component.width;
  const contentHeight = component.height;

  // Create light mode section
  const lightSection = createModeSection(page, "CommandPalette", "light");
  lightSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + 40, // Extra for title
  );

  // Create dark mode section
  const darkSection = createModeSection(page, "CommandPalette", "dark");
  darkSection.frame.resize(
    contentWidth + SECTION_PADDING * 2,
    contentHeight + SECTION_PADDING * 2 + 40,
  );

  // Move component into light section
  lightSection.frame.appendChild(component);
  component.x = SECTION_PADDING;
  component.y = SECTION_PADDING + 40;

  // Create instance for dark section
  const darkInstance = component.createInstance();
  darkInstance.x = SECTION_PADDING;
  darkInstance.y = SECTION_PADDING + 40;
  darkSection.frame.appendChild(darkInstance);

  // Position sections
  const totalWidth = contentWidth + SECTION_PADDING * 2;
  const totalHeight = contentHeight + SECTION_PADDING * 2 + 40;

  lightSection.section.resizeWithoutConstraints(totalWidth, totalHeight);
  darkSection.section.resizeWithoutConstraints(totalWidth, totalHeight);

  lightSection.frame.x = SECTION_LAYOUT.startX;
  lightSection.frame.y = startY;

  darkSection.frame.x =
    lightSection.frame.x + totalWidth + SECTION_LAYOUT.modeGap;
  darkSection.frame.y = startY;

  logComplete("Generated CommandPalette component (light + dark)");

  return startY + totalHeight + SECTION_GAP;
}

/**
 * Testable export functions for test suite
 */

/**
 * Get CommandPalette configuration derived from Tailwind classes
 * @returns Configuration object with layout dimensions
 */
export function getCommandPaletteConfig() {
  return CONFIG;
}

/**
 * Get the Tailwind classes used by the component
 * @returns Object with all component class strings
 */
export function getCommandPaletteClasses() {
  return COMPONENT_CLASSES;
}

/**
 * Get parsed styles for a specific component part
 * @param part - Component part key from COMPONENT_CLASSES
 * @returns Parsed styles from Tailwind classes
 */
export function getParsedStyles(part: keyof typeof COMPONENT_CLASSES) {
  return parseTailwindClasses(COMPONENT_CLASSES[part]);
}

/**
 * Get complete variant data for snapshot testing
 * @returns All configuration and parsed styles for the component
 */
export function getAllCommandPaletteData() {
  const parsedStyles: Record<
    string,
    ReturnType<typeof parseTailwindClasses>
  > = {};

  // Parse all component classes
  for (const [key, classes] of Object.entries(COMPONENT_CLASSES)) {
    parsedStyles[key] = parseTailwindClasses(classes);
  }

  return {
    config: CONFIG,
    classes: COMPONENT_CLASSES,
    parsedStyles,
    subComponents: [
      "Dialog",
      "Root",
      "Panel",
      "Input",
      "List",
      "Group",
      "GroupLabel",
      "Item",
      "ResultItem",
      "HighlightedText",
      "Empty",
      "Loading",
      "Footer",
      "Results",
      "Items",
    ],
  };
}

/**
 * Get base configuration for tests
 * @returns Base styling configuration
 */
export function getBaseConfig() {
  return {
    width: CONFIG.width,
    background: VAR_NAMES.color.control,
    shadow: SHADOWS.dialog,
    borderRadius: BORDER_RADIUS.lg,
    sections: {
      inputHeader: {
        background: VAR_NAMES.color.elevated,
        padding: parseTailwindClasses(COMPONENT_CLASSES.inputHeader),
      },
      list: {
        background: VAR_NAMES.color.elevated,
        border: VAR_NAMES.color.line,
        padding: parseTailwindClasses(COMPONENT_CLASSES.list),
      },
      footer: {
        background: VAR_NAMES.color.control,
        textColor: VAR_NAMES.text.strong,
        padding: parseTailwindClasses(COMPONENT_CLASSES.footer),
      },
    },
    item: {
      normalBackground: null,
      highlightedBackground: VAR_NAMES.color.tint,
      textColor: VAR_NAMES.text.default,
      iconColor: "text-kumo-subtle",
      padding: parseTailwindClasses(COMPONENT_CLASSES.item),
    },
  };
}
