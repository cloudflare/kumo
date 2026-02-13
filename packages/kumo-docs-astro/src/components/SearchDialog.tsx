import { useState, useEffect, useCallback, useMemo } from "react";
import { matchSorter } from "match-sorter";
import { CommandPalette, Badge, type HighlightRange } from "@cloudflare/kumo";
import {
  MagnifyingGlassIcon,
  CubeIcon,
  StackIcon,
  SquaresFourIcon,
  BookOpenIcon,
} from "@phosphor-icons/react";

/**
 * Components in the registry that don't have Astro doc pages yet.
 * These are filtered out of search results until docs are written.
 *
 * To add a new component to search:
 * 1. Create the Astro doc page (e.g., /pages/components/my-component.astro)
 * 2. Remove it from this exclusion list
 * 3. Add its description to COMPONENT_DESCRIPTIONS below
 */
const COMPONENTS_WITHOUT_DOCS = new Set([
  "Field",
  "Icon",
  "InputArea",
  "Toasty",
]);

/**
 * Map registry component names to their doc page slugs.
 * Only needed when the name doesn't match the standard kebab-case conversion.
 */
const SLUG_OVERRIDES: Record<string, string> = {
  DropdownMenu: "dropdown",
};

/**
 * Static pages that should be included in search.
 * These are top-level documentation pages that aren't in the component registry.
 */
const STATIC_PAGES: Array<{
  name: string;
  description: string;
  url: string;
  category: string;
}> = [
  {
    name: "Installation",
    description: "How to install and set up Kumo in your project.",
    url: "/installation",
    category: "Getting Started",
  },
  {
    name: "Contributing",
    description: "Guidelines for contributing to the Kumo component library.",
    url: "/contributing",
    category: "Getting Started",
  },
  {
    name: "Accessibility",
    description:
      "Accessibility standards and best practices in Kumo components.",
    url: "/accessibility",
    category: "Getting Started",
  },
  {
    name: "Components vs Blocks",
    description: "Understanding the difference between components and blocks.",
    url: "/components-vs-blocks",
    category: "Getting Started",
  },
  {
    name: "Colors",
    description: "Explore Kumo's semantic color tokens and theming system.",
    url: "/colors",
    category: "Guides",
  },
  {
    name: "CLI",
    description:
      "Use the Kumo CLI to add components and blocks to your project.",
    url: "/cli",
    category: "Guides",
  },
  {
    name: "Streaming",
    description: "Server-side rendering and streaming support in Kumo.",
    url: "/streaming",
    category: "Guides",
  },
  {
    name: "Figma",
    description: "Using Kumo components in Figma with the Kumo Figma plugin.",
    url: "/figma",
    category: "Guides",
  },
  {
    name: "Component Registry",
    description: "Browse and explore the full Kumo component registry.",
    url: "/registry",
    category: "Guides",
  },
];

/** Better descriptions from the Astro doc pages */
const COMPONENT_DESCRIPTIONS: Record<string, string> = {
  badge: "Displays a small label for status, categorization, or metadata.",
  "command-palette":
    "A keyboard-driven command menu for searching and navigating.",
  "date-range-picker": "A date picker component for selecting date ranges.",
  meter: "A visual indicator showing a value within a known range.",
  pagination: "Navigation controls for paginated content.",
  banner:
    "Displays contextual inline messages for informational, alert, or error states.",
  button: "Displays a button or a component that looks like a button.",
  checkbox:
    "A control that allows the user to toggle between checked and not checked.",
  "clipboard-text": "A text component with a copy-to-clipboard button.",
  code: "Syntax-highlighted code blocks with support for multiple languages.",
  collapsible:
    "A vertically stacked set of interactive headings that each reveal content.",
  combobox:
    "A searchable select component for filtering and selecting from options.",
  dialog: "A modal window overlaid on the primary window or another dialog.",
  dropdown: "Displays a menu of actions or functions triggered by a button.",
  input:
    "A text input field with built-in label, description, and error support.",
  label: "A label component for form fields with required/optional indicators.",
  "layer-card":
    "A card with a layered visual effect for navigation or highlights.",
  loader: "A loading spinner to indicate loading state.",
  menubar: "A horizontal menu bar with icon buttons for toolbars.",
  popover: "An accessible popup anchored to a trigger element.",
  radio: "A control that allows selecting one option from a set.",
  select: "Displays a list of options for the user to pick from.",
  "sensitive-input":
    "A masked input for sensitive values like API keys and passwords.",
  "skeleton-line": "A skeleton loading placeholder for text content.",
  surface: "A container component that provides a styled surface for content.",
  switch: "A two-state toggle button that can be either on or off.",
  table:
    "A table component for displaying tabular data with selection support.",
  tabs: "Layered sections of content displayed one at a time.",
  text: "A typography component for various heading and copy styles.",
  tooltip: "A popup that displays information on hover or focus.",
  breadcrumbs:
    "Shows the current page's location within a navigational hierarchy.",
  empty:
    "A placeholder component for empty states with illustration and actions.",
  "page-header": "Combines breadcrumbs and tabs for page navigation.",
  "resource-list":
    "A layout for displaying resource lists with title and sidebar.",
};

interface ComponentRegistryEntry {
  name: string;
  type: "component" | "block" | "layout";
  description: string;
  category: string;
  props?: Record<string, unknown>;
}

interface ComponentRegistry {
  version: string;
  components: Record<string, ComponentRegistryEntry>;
}

interface SearchItem {
  name: string;
  type: "component" | "block" | "layout" | "page";
  description: string;
  category: string;
  url: string;
}

interface SearchGroup {
  label: string;
  items: SearchItem[];
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Build URL path from component type and name */
function getComponentUrl(type: string, name: string): string {
  const slug =
    SLUG_OVERRIDES[name] ??
    name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

  switch (type) {
    case "block":
      return `/blocks/${slug}`;
    case "layout":
      return `/layouts/${slug}`;
    default:
      return `/components/${slug}`;
  }
}

/** Get better description from mapping, falling back to registry */
function getDescription(name: string, registryDescription: string): string {
  const slug =
    SLUG_OVERRIDES[name] ??
    name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  return COMPONENT_DESCRIPTIONS[slug] || registryDescription;
}

/** Find all matching ranges in text for a query (for highlighting) */
function findHighlightRanges(text: string, query: string): HighlightRange[] {
  if (!query.trim()) return [];

  const ranges: HighlightRange[] = [];
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  let startIndex = 0;
  while (true) {
    const index = textLower.indexOf(queryLower, startIndex);
    if (index === -1) break;
    // HighlightRange is [start, end] tuple (end is inclusive)
    ranges.push([index, index + queryLower.length - 1]);
    startIndex = index + 1;
  }

  return ranges;
}

/** Group items by category (used when browsing without a query) */
function groupByCategory(items: SearchItem[]): SearchGroup[] {
  const groups: Record<string, SearchItem[]> = {};

  for (const item of items) {
    const category = item.category || "Other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
  }

  // Define category order: Getting Started and Guides first, Block/Layout last
  const categoryOrder = (cat: string): number => {
    if (cat === "Getting Started") return 0;
    if (cat === "Guides") return 1;
    if (cat === "Block" || cat === "Layout") return 100;
    return 50; // Component categories in the middle
  };

  const sortedCategories = Object.keys(groups).sort((a, b) => {
    const orderDiff = categoryOrder(a) - categoryOrder(b);
    if (orderDiff !== 0) return orderDiff;
    return a.localeCompare(b);
  });

  return sortedCategories.map((category) => ({
    label: category,
    items: groups[category],
  }));
}

/** Return items as a single "Results" group (used when searching) */
function asSearchResults(items: SearchItem[]): SearchGroup[] {
  if (items.length === 0) return [];
  return [{ label: "Results", items }];
}

/** Get icon for item type */
function getTypeIcon(type: "component" | "block" | "layout" | "page") {
  switch (type) {
    case "block":
      return <StackIcon size={16} weight="duotone" />;
    case "layout":
      return <SquaresFourIcon size={16} weight="duotone" />;
    case "page":
      return <BookOpenIcon size={16} weight="duotone" />;
    default:
      return <CubeIcon size={16} weight="duotone" />;
  }
}

/** Get badge for item type (only shown when searching, not when grouped by category) */
function getTypeBadge(
  type: "component" | "block" | "layout" | "page",
  isSearching: boolean,
) {
  if (!isSearching) return null; // Don't show badge when grouped - category label is enough

  switch (type) {
    case "block":
      return <Badge variant="secondary">Block</Badge>;
    case "layout":
      return <Badge variant="secondary">Layout</Badge>;
    case "page":
      return <Badge variant="secondary">Guide</Badge>;
    default:
      return null;
  }
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [registry, setRegistry] = useState<ComponentRegistry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch component registry
  useEffect(() => {
    async function fetchRegistry() {
      try {
        setLoading(true);
        const response = await fetch("/api/component-registry");
        if (!response.ok) {
          throw new Error(`Failed to fetch registry: ${response.status}`);
        }
        const data = await response.json();
        setRegistry(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load component registry:", err);
        setError("Failed to load search index");
      } finally {
        setLoading(false);
      }
    }

    if (open && !registry) {
      fetchRegistry();
    }
  }, [open, registry]);

  // Convert registry to searchable items and include static pages
  const allItems = useMemo<SearchItem[]>(() => {
    // Always include static pages
    const staticItems: SearchItem[] = STATIC_PAGES.map((page) => ({
      name: page.name,
      type: "page" as const,
      description: page.description,
      category: page.category,
      url: page.url,
    }));

    if (!registry?.components) return staticItems;

    const componentItems = Object.values(registry.components)
      .filter((component) => !COMPONENTS_WITHOUT_DOCS.has(component.name))
      .map((component) => ({
        name: component.name,
        type: component.type,
        description: getDescription(component.name, component.description),
        category: component.category,
        url: getComponentUrl(component.type, component.name),
      }));

    return [...staticItems, ...componentItems];
  }, [registry]);

  // Filter and group items based on query using match-sorter
  const filteredGroups = useMemo<SearchGroup[]>(() => {
    if (!query.trim()) {
      return groupByCategory(allItems);
    }

    const filtered = matchSorter(allItems, query, {
      keys: [
        { key: "name", threshold: matchSorter.rankings.CONTAINS },
        { key: "description", threshold: matchSorter.rankings.CONTAINS },
        { key: "category", threshold: matchSorter.rankings.CONTAINS },
      ],
    });

    return asSearchResults(filtered);
  }, [allItems, query]);

  // Get flat list of all filtered items for keyboard navigation
  const getSelectableItems = useCallback(
    (groups: SearchGroup[]) => groups.flatMap((g) => g.items),
    [],
  );

  // Handle item selection
  const handleSelect = useCallback(
    (item: SearchItem, options: { newTab: boolean }) => {
      if (options.newTab) {
        window.open(item.url, "_blank");
      } else {
        window.location.href = item.url;
      }
      onOpenChange(false);
    },
    [onOpenChange],
  );

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const hasResults = filteredGroups.some((g) => g.items.length > 0);
  const totalResults = filteredGroups.reduce(
    (sum, g) => sum + g.items.length,
    0,
  );
  const isSearching = query.trim().length > 0;

  return (
    <CommandPalette.Root<SearchGroup, SearchItem>
      open={open}
      onOpenChange={onOpenChange}
      items={filteredGroups}
      value={query}
      onValueChange={setQuery}
      itemToStringValue={(group: SearchGroup) => group.label}
      onSelect={handleSelect}
      getSelectableItems={getSelectableItems}
      filter={() => true}
    >
      <CommandPalette.Input
        placeholder="Search docs..."
        leading={
          <MagnifyingGlassIcon
            className="h-4 w-4 text-kumo-subtle"
            weight="bold"
          />
        }
      />
      <CommandPalette.List>
        {loading ? (
          <CommandPalette.Loading />
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-kumo-subtle">{error}</p>
          </div>
        ) : !hasResults ? (
          <CommandPalette.Empty>
            {query.trim()
              ? `No results found for "${query}"`
              : "Type to search docs"}
          </CommandPalette.Empty>
        ) : (
          <CommandPalette.Results>
            {(group: SearchGroup) => (
              <CommandPalette.Group key={group.label} items={group.items}>
                <CommandPalette.GroupLabel>
                  {group.label}
                </CommandPalette.GroupLabel>
                <CommandPalette.Items>
                  {(item: SearchItem) => (
                    <CommandPalette.Item<SearchItem>
                      key={item.name}
                      value={item}
                      onClick={(e: React.MouseEvent) => {
                        const newTab = e.metaKey || e.ctrlKey;
                        handleSelect(item, { newTab });
                      }}
                    >
                      <div className="flex w-full items-center gap-3">
                        <div className="flex-shrink-0 text-kumo-subtle">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <CommandPalette.HighlightedText
                              text={item.name}
                              highlights={findHighlightRanges(item.name, query)}
                              className="text-base font-medium text-kumo-default"
                            />
                            {getTypeBadge(item.type, isSearching)}
                          </div>
                          <CommandPalette.HighlightedText
                            text={item.description}
                            highlights={findHighlightRanges(
                              item.description,
                              query,
                            )}
                            className="block truncate text-sm text-kumo-subtle"
                          />
                        </div>
                      </div>
                    </CommandPalette.Item>
                  )}
                </CommandPalette.Items>
              </CommandPalette.Group>
            )}
          </CommandPalette.Results>
        )}
      </CommandPalette.List>
      <CommandPalette.Footer>
        <span className="text-kumo-subtle">
          {hasResults
            ? `${totalResults} result${totalResults === 1 ? "" : "s"}`
            : ""}
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5">
              ↑
            </kbd>
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5">
              ↓
            </kbd>
            <span>navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5">
              ↵
            </kbd>
            <span>open</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5">
              ⌘↵
            </kbd>
            <span>new tab</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5">
              esc
            </kbd>
            <span>close</span>
          </span>
        </div>
      </CommandPalette.Footer>
    </CommandPalette.Root>
  );
}
