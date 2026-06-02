import {
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { ScrollArea as ScrollAreaBase } from "@base-ui/react/scroll-area";
import type { TabsTab } from "@base-ui/react/tabs";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
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

const SCROLL_EDGE_THRESHOLD_PX = 1;

function toPixels(value: string, element: HTMLElement) {
  const trimmedValue = value.trim();
  const numericValue = Number.parseFloat(trimmedValue);

  if (!Number.isFinite(numericValue)) return 48;
  if (trimmedValue.endsWith("rem")) {
    return (
      numericValue *
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  }
  if (trimmedValue.endsWith("em")) {
    return numericValue * Number.parseFloat(getComputedStyle(element).fontSize);
  }

  return numericValue;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function scrollActiveTabIntoView(
  list: HTMLElement | null,
  behavior: ScrollBehavior = "auto",
) {
  const activeTab = list?.querySelector<HTMLElement>(
    '[role="tab"][aria-selected="true"]',
  );

  if (!list || !activeTab) return false;

  const maxScrollLeft = list.scrollWidth - list.clientWidth;
  if (maxScrollLeft <= SCROLL_EDGE_THRESHOLD_PX) return false;

  const fadeWidth = toPixels(
    getComputedStyle(list).getPropertyValue("--scroll-fade-width") || "3rem",
    list,
  );
  const canScrollLeft = list.scrollLeft > SCROLL_EDGE_THRESHOLD_PX;
  const canScrollRight = list.scrollLeft < maxScrollLeft - SCROLL_EDGE_THRESHOLD_PX;
  const visibleLeft = list.scrollLeft + (canScrollLeft ? fadeWidth : 0);
  const visibleRight =
    list.scrollLeft + list.clientWidth - (canScrollRight ? fadeWidth : 0);
  const activeLeft = activeTab.offsetLeft;
  const activeRight = activeLeft + activeTab.offsetWidth;

  if (activeLeft < visibleLeft) {
    list.scrollTo({
      left: clamp(activeLeft - fadeWidth, 0, maxScrollLeft),
      behavior,
    });
  } else if (activeRight > visibleRight) {
    list.scrollTo({
      left: clamp(activeRight - list.clientWidth + fadeWidth, 0, maxScrollLeft),
      behavior,
    });
  }

  return true;
}

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
  const [uncontrolledValueForScroll, setUncontrolledValueForScroll] = useState(
    selectedValue ?? fallbackValue,
  );
  const selectedValueForScroll = isControlled
    ? value
    : uncontrolledValueForScroll;
  const rootProps = {
    value: isControlled ? value : undefined,
    defaultValue: isControlled ? undefined : (selectedValue ?? fallbackValue),
  };

  const isSegmented = variant === "segmented";
  const isUnderline = variant === "underline";
  const isSm = size === "sm";
  const listRef = useRef<HTMLDivElement>(null);
  useActiveTabScroll(listRef, selectedValueForScroll, isSegmented);
  const bindDrag = useHorizontalDragScroll(listRef);

  const tabsListContent = (
    <>
      {items.map((tab) => (
        <TabsPrimitive.Tab
          key={tab.value}
          data-kumo-component="Tabs"
          data-kumo-part="tab"
          value={tab.value}
          render={tab.render}
          className={cn(
            "relative z-2 flex items-center rounded bg-transparent whitespace-nowrap focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand cursor-pointer group-data-[has-overflow-x]/tabs-list:cursor-grab group-data-[has-overflow-x]/tabs-list:active:cursor-grabbing",
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
    </>
  );

  return (
    <TabsPrimitive.Root
      {...rootProps}
      className={cn("relative isolate min-w-0 font-medium", className)}
      onValueChange={(nextValue) => {
        const stringValue = String(nextValue);
        if (!isControlled) {
          setUncontrolledValueForScroll(stringValue);
        }
        onValueChange?.(stringValue);
      }}
    >
      {/* Background element for segmented variant */}
      {isSegmented && (
        <div className={cn("absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 rounded-lg bg-kumo-recessed", isSm ? "h-6.5" : "h-9")} />
      )}
      {isSegmented ? (
        <ScrollAreaBase.Root className="min-w-0 shrink" overflowEdgeThreshold={1}>
          <TabsPrimitive.List
            ref={listRef}
            render={<ScrollAreaBase.Viewport />}
            activateOnFocus={activateOnFocus}
            data-kumo-scroll-fade=""
            {...bindDrag()}
            className={cn(
              "relative flex min-w-0 shrink items-stretch group/tabs-list",
              "kumo-tabs-list overflow-x-auto! overflow-y-hidden! rounded-lg bg-kumo-recessed px-0.5 ring ring-kumo-hairline/70 [--scroll-fade-width:3rem] [scroll-padding-inline:var(--scroll-fade-width,3rem)] data-[has-overflow-x]:cursor-grab data-[has-overflow-x]:active:cursor-grabbing",
              isSm ? "h-6.5 rounded-md" : "h-9",
              listClassName,
            )}
          >
            {tabsListContent}
          </TabsPrimitive.List>
          <ScrollAreaBase.Scrollbar
            orientation="horizontal"
            keepMounted
            className="pointer-events-none h-0 overflow-hidden opacity-0"
          >
            <ScrollAreaBase.Thumb />
          </ScrollAreaBase.Scrollbar>
        </ScrollAreaBase.Root>
      ) : (
        <TabsPrimitive.List
          ref={listRef}
          activateOnFocus={activateOnFocus}
          className={cn(
            "relative flex min-w-0 shrink items-stretch group/tabs-list",
            "gap-4 border-b border-kumo-hairline pb-2",
            isSm ? "h-6.5" : "h-7.5",
            listClassName,
          )}
        >
          {tabsListContent}
        </TabsPrimitive.List>
      )}
    </TabsPrimitive.Root>
  );
}

function useActiveTabScroll(
  listRef: RefObject<HTMLElement | null>,
  selectedValue: string | undefined,
  enabled: boolean,
) {
  const hasPositionedInitialTab = useRef(false);

  const positionActiveTab = (behavior: ScrollBehavior) => {
    const didPosition = scrollActiveTabIntoView(listRef.current, behavior);
    if (didPosition) {
      hasPositionedInitialTab.current = true;
    }
  };

  useLayoutEffect(() => {
    if (!enabled) return;
    positionActiveTab(hasPositionedInitialTab.current ? "smooth" : "auto");
  }, [enabled, selectedValue]);

  useLayoutEffect(() => {
    if (!enabled) return;
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(() => {
      positionActiveTab("auto");
    });

    resizeObserver.observe(list);

    return () => resizeObserver.disconnect();
  }, [enabled]);
}

// ─── Horizontal drag-to-scroll ────────────────────────────────────────

/**
 * Enables mouse drag to horizontally scroll the tab list.
 * Touch devices keep native horizontal overflow scrolling and inertia.
 */
function useHorizontalDragScroll(
  ref: React.RefObject<HTMLElement | null>,
) {
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    dragging: boolean;
  } | null>(null);
  const shouldSuppressClick = useRef(false);

  return () => ({
    onPointerDownCapture: (event: PointerEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el || !el.hasAttribute("data-has-overflow-x")) return;
      if (event.pointerType !== "mouse" || event.button !== 0) return;

      dragState.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        scrollLeft: el.scrollLeft,
        dragging: false,
      };
      shouldSuppressClick.current = false;
    },
    onPointerMoveCapture: (event: PointerEvent<HTMLElement>) => {
      const el = ref.current;
      const state = dragState.current;
      if (!el || !state || state.pointerId !== event.pointerId) return;

      const movementX = event.clientX - state.startX;
      if (!state.dragging) {
        if (Math.abs(movementX) <= 3) return;
        state.dragging = true;
        shouldSuppressClick.current = true;
        el.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
      el.scrollLeft = state.scrollLeft - movementX;
    },
    onPointerUpCapture: (event: PointerEvent<HTMLElement>) => {
      const el = ref.current;
      const state = dragState.current;
      if (!el || !state || state.pointerId !== event.pointerId) return;

      dragState.current = null;
      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
      if (shouldSuppressClick.current) {
        window.setTimeout(() => {
          shouldSuppressClick.current = false;
        }, 0);
      }
    },
    onPointerCancelCapture: (event: PointerEvent<HTMLElement>) => {
      const el = ref.current;
      const state = dragState.current;
      if (!el || !state || state.pointerId !== event.pointerId) return;

      dragState.current = null;
      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
    },
    onClickCapture: (event: MouseEvent<HTMLElement>) => {
      if (!shouldSuppressClick.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      shouldSuppressClick.current = false;
    },
  });
}
