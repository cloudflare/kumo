import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TabsTab } from "@base-ui/react/tabs";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { useDrag } from "@use-gesture/react";
import { cn } from "../../utils/cn";

/** Tabs variant definitions. */
export const KUMO_TABS_VARIANTS = {
  variant: ["segmented", "underline"],
  size: ["base", "sm"],
} as const;

export const KUMO_TABS_DEFAULT_VARIANTS = {
  variant: "segmented",
  size: "base",
} as const;

export const KUMO_TABS_STYLING = {
  container: {
    height: 34,
    borderRadius: 8,
    background: "color-accent",
    padding: 1,
  },
  tab: {
    paddingX: 10,
    verticalMargin: 1,
    fontSize: 16,
    fontWeight: 500,
    borderRadius: 8,
    activeColor: "text-color-surface",
    inactiveColor: "text-color-label",
  },
  indicator: {
    background: "color-surface-secondary",
    ring: "color-color-2",
    borderRadius: 6,
    shadow: "shadow-sm",
  },
} as const;

// Derived types from KUMO_TABS_VARIANTS
export interface KumoTabsVariantsProps {
  /**
   * Tab style.
   * - `"segmented"` — Pill-shaped indicator on a filled track
   * - `"underline"` — Underline indicator below tab text
   * @default "segmented"
   */
  variant?: (typeof KUMO_TABS_VARIANTS.variant)[number];
  /**
   * Tab size.
   * - `"base"` — Default size (h-9, text-base)
   * - `"sm"` — Compact size (h-6.5, text-xs) — matches Input size="sm"
   * @default "base"
   */
  size?: (typeof KUMO_TABS_VARIANTS.size)[number];
}

/** Configuration for a single tab within the Tabs component. */
export type TabsItem = {
  /** Unique identifier for the tab, used as the controlled value. */
  value: string;
  /** Display content for the tab trigger. */
  label: ReactNode;
  /** Additional CSS classes for this tab trigger. */
  className?: string;
  /**
   * Custom render function or element to replace the tab element (e.g. for link-based tabs).
   * When using a function, it receives the props to spread on the element and the tab's state.
   */
  render?: TabsTab.Props["render"];
};

/**
 * Tabs component props.
 *
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { value: "overview", label: "Overview" },
 *     { value: "settings", label: "Settings" },
 *   ]}
 *   value={activeTab}
 *   onValueChange={setActiveTab}
 * />
 * ```
 */
export type TabsProps = KumoTabsVariantsProps & {
  /** Array of tab items to render. */
  tabs?: TabsItem[];
  /** Controlled value. When set, component becomes controlled. */
  value?: string;
  /** Default selected value for uncontrolled mode. Ignored when `value` is set. */
  selectedValue?: string;
  /** Callback fired when the active tab changes. */
  onValueChange?: (value: string) => void;
  /**
   * When `true`, tabs are activated immediately upon receiving focus via arrow keys.
   * When `false` (default), tabs receive focus but require Enter/Space to activate.
   */
  activateOnFocus?: boolean;
  /** Additional CSS classes for the root element. */
  className?: string;
  /** Additional CSS classes for the tab list element. */
  listClassName?: string;
  /** Additional CSS classes for the indicator element. */
  indicatorClassName?: string;
};

/**
 * Tab navigation component with segmented or underline style.
 * Built on Base UI Tabs with animated active indicator.
 *
 * @example
 * ```tsx
 * <Tabs
 *   variant="segmented"
 *   tabs={[{ value: "tab1", label: "Tab 1" }, { value: "tab2", label: "Tab 2" }]}
 *   value={active}
 *   onValueChange={setActive}
 * />
 * ```
 */
export function Tabs({
  tabs,
  value,
  selectedValue,
  onValueChange,
  activateOnFocus,
  className,
  listClassName,
  indicatorClassName,
  variant = KUMO_TABS_DEFAULT_VARIANTS.variant,
  size = KUMO_TABS_DEFAULT_VARIANTS.size,
}: TabsProps) {
  const items: TabsItem[] = tabs ?? [];

  if (items.length === 0) {
    return null;
  }

  const fallbackValue = items[0]?.value;
  const isControlled = value !== undefined;
  const rootProps = {
    value: isControlled ? value : undefined,
    defaultValue: isControlled ? undefined : (selectedValue ?? fallbackValue),
  };

  const isSegmented = variant === "segmented";
  const isUnderline = variant === "underline";
  const isSm = size === "sm";
  const { ref: listRef, isOverflowing } = useOverflowDetect(isSegmented);
  const bindDrag = useHorizontalDragScroll(listRef, isOverflowing);

  return (
    <TabsPrimitive.Root
      {...rootProps}
      className={cn("relative isolate min-w-0 font-medium", className)}
      onValueChange={(nextValue) => {
        const stringValue = String(nextValue);
        onValueChange?.(stringValue);
      }}
    >
      {/* Background element for segmented variant */}
      {isSegmented && (
        <div className={cn("absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 rounded-lg bg-kumo-recessed", isSm ? "h-6.5" : "h-9")} />
      )}
      <TabsPrimitive.List
        ref={listRef}
        activateOnFocus={activateOnFocus}
        data-overflowing={isOverflowing ? "" : undefined}
        {...bindDrag()}
        className={cn(
          "relative flex min-w-0 shrink items-stretch",
          isSegmented && "kumo-tabs-list overflow-x-auto rounded-lg bg-kumo-recessed px-0.5 touch-pan-y ring ring-kumo-hairline/70 [--scroll-fade-width:3rem]",
          isSegmented && (isSm ? "h-6.5 rounded-md" : "h-9"),
          isUnderline && "gap-4 border-b border-kumo-hairline pb-2",
          isUnderline && (isSm ? "h-6.5" : "h-7.5"),
          listClassName,
        )}
      >
        {items.map((tab) => (
          <TabsPrimitive.Tab
            key={tab.value}
            value={tab.value}
            render={tab.render}
            className={cn(
              "relative z-2 flex cursor-pointer items-center rounded bg-transparent whitespace-nowrap focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand",
              isSm ? "text-xs" : "text-base",
              isSegmented &&
                "my-0.5 rounded-md text-kumo-subtle hover:text-kumo-default aria-selected:text-kumo-default focus-visible:ring-inset",
              isSegmented && (isSm ? "px-2" : "px-2.5"),
              isUnderline &&
                "text-kumo-subtle hover:bg-kumo-tint hover:text-kumo-default aria-selected:hover:bg-kumo-tint aria-selected:font-medium aria-selected:text-kumo-default",
              isUnderline && (isSm ? "px-1.5 py-2.5" : "px-2 py-3"),
              tab.className,
            )}
          >
            {tab.label}
          </TabsPrimitive.Tab>
        ))}
        <TabsPrimitive.Indicator
          render={(props) => (
            <div
              {...props}
              className={cn(
                "absolute z-1 left-0",
                "w-(--active-tab-width) translate-x-(--active-tab-left) transition-all duration-200",
                "data-[rendered=false]:scale-90 data-[rendered=false]:opacity-0",
                isSegmented &&
                  cn("top-(--active-tab-top) h-(--active-tab-height) bg-kumo-base shadow-sm ring ring-kumo-line", isSm ? "rounded" : "rounded-md"),
                isUnderline && "bottom-0 h-0.5 bg-kumo-brand",
                indicatorClassName,
              )}
            />
          )}
        />
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

// ─── Horizontal drag-to-scroll ────────────────────────────────────────

/**
 * Enables pointer/touch drag to horizontally scroll the tab list.
 * Only active when the list is overflowing. Prevents vertical scroll
 * interference and uses `touch-action: pan-y` so native vertical
 * scrolling is preserved.
 */
function useHorizontalDragScroll(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  return useDrag(
    ({ delta: [dx], event }) => {
      const el = ref.current;
      if (!el || !enabled) return;
      // Prevent text selection while dragging
      event?.preventDefault();
      el.scrollLeft -= dx;
    },
    {
      axis: "x",
      pointer: { touch: true },
      filterTaps: true,
      from: [0, 0],
    },
  );
}

// ─── Overflow detection ───────────────────────────────────────────────

/**
 * Detects whether the element's content overflows horizontally.
 * Returns a ref to attach and a boolean for conditional rendering.
 * The `data-overflowing` attribute drives the scroll-fade CSS.
 */
function useOverflowDetect(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const check = () => setIsOverflowing(el.scrollWidth > el.clientWidth);

    const ro = new ResizeObserver(check);
    ro.observe(el);
    check();

    return () => ro.disconnect();
  }, [enabled]);

  return { ref, isOverflowing };
}
