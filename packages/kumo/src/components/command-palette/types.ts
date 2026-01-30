import type { ReactNode } from "react";

/** A single highlight range within a string [startIndex, endIndex] (inclusive) */
export type HighlightRange = [number, number];

/**
 * Props for the CommandPalette.Root component - main dialog wrapper with Autocomplete
 *
 * Keyboard navigation (arrow keys, Enter) is enabled automatically via the Autocomplete primitive.
 * The items array can be flat or grouped - the Autocomplete handles both patterns.
 *
 * @template TGroup - The type of items in the list (groups when using getSelectableItems)
 * @template TItem - The type of selectable items (defaults to TGroup for flat lists)
 */
export interface CommandPaletteRootProps<TGroup, TItem = TGroup> {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void;
  /**
   * Optional callback when backdrop is clicked.
   * Receives the mouse event for position tracking (e.g., for ripple effects).
   * If not provided, backdrop click calls onOpenChange(false).
   */
  onBackdropClick?: (e: React.MouseEvent) => void;
  /** Child components (Input, List, Footer, etc.) */
  children: ReactNode;
  /**
   * Items for the command palette. Enables keyboard navigation (arrow keys, Enter).
   * Can be a flat array or grouped items - use with Autocomplete.List render function.
   */
  items: TGroup[];
  /** Controlled input value for the search */
  value?: string;
  /** Callback when input value changes */
  onValueChange?: (value: string) => void;
  /** Callback when an item is highlighted (arrow keys or hover) */
  onItemHighlighted?: (
    item: TGroup | undefined,
    details: { reason: string; event: Event; index: number },
  ) => void;
  /**
   * Convert item to display string. Required when items are objects.
   * Used for accessibility and typeahead search.
   */
  itemToStringValue?: (item: TGroup) => string;
  /**
   * Custom filter function. Return true to include item in results.
   * Defaults to showing all items (consumer handles filtering).
   */
  filter?: (item: TGroup, query: string) => boolean;
  /**
   * Callback when an item is selected via Cmd/Ctrl+Enter keyboard shortcut.
   * Receives the selectable item (TItem type when using getSelectableItems).
   * newTab is always true for this callback (Cmd/Ctrl+Enter).
   */
  onSelect?: (item: TItem, options: { newTab: boolean }) => void;
  /**
   * Function to get the flat list of selectable items from the items array.
   * Required when using grouped items (e.g., items is an array of groups).
   * If not provided, assumes items is a flat array of selectable items.
   */
  getSelectableItems?: (items: TGroup[]) => TItem[];
}

/**
 * Props for the CommandPalette.Item component - individual result item
 * @template T - The type of the item value
 */
export interface CommandPaletteItemProps<T = unknown> {
  /** The value associated with this item */
  value: T;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Content to render inside the item */
  children: ReactNode;
  /** Click handler - use e.metaKey || e.ctrlKey to detect new tab intent */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Props for the CommandPalette.Footer component - keyboard hints footer
 */
export interface CommandPaletteFooterProps {
  /** Custom children to override default keyboard hints */
  children?: ReactNode;
}

/**
 * Props for the CommandPalette.List component - scrollable results container
 */
export interface CommandPaletteListProps {
  /** Result items or groups to render */
  children: ReactNode;
}

/**
 * Props for the CommandPalette.Group component - category grouping
 */
export interface CommandPaletteGroupProps {
  /** Group content (items) */
  children: ReactNode;
}

/**
 * Props for the CommandPalette.GroupLabel component - section header
 */
export interface CommandPaletteGroupLabelProps {
  /** Label text to display */
  children: ReactNode;
}

/**
 * Props for the CommandPalette.Empty component - empty state
 */
export interface CommandPaletteEmptyProps {
  /** Custom empty message, defaults to "No results found" */
  children?: ReactNode;
}

/**
 * Props for the CommandPalette.Loading component - loading state
 */
export interface CommandPaletteLoadingProps {
  /** Optional custom loading content */
  children?: ReactNode;
}

/**
 * Props for the CommandPalette.ResultItem component - rich item with breadcrumbs and highlights
 */
export interface CommandPaletteResultItemProps<T = unknown> {
  /** Item title text */
  title: string;
  /** Optional breadcrumb path parts displayed before the title (e.g., ["Compute (Workers)"] for "Compute (Workers) > VPC") */
  breadcrumbs?: string[];
  /** Highlight ranges for the title, from Fuse.js match indices */
  titleHighlights?: HighlightRange[];
  /** Highlight ranges for each breadcrumb, parallel array to breadcrumbs */
  breadcrumbHighlights?: HighlightRange[][];
  /** Optional description displayed after the title (for non-navigation items like search tips) */
  description?: string;
  /** Optional icon to display before the title */
  icon?: ReactNode;
  /** The value associated with this item (for Autocomplete) */
  value: T;
  /** Click handler - use e.metaKey || e.ctrlKey to detect new tab intent */
  onClick: (e: React.MouseEvent) => void;
  /** Whether to show arrow indicator on highlight (default: true) */
  showArrow?: boolean;
  /** Whether this links to an external URL (shows external icon) */
  external?: boolean;
  /** Whether this item is non-interactive (no hover/highlight) */
  nonInteractive?: boolean;
}
