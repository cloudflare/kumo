import type { ReactNode } from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "../../utils/cn";

/** Tabs variant definitions. */
export const KUMO_TABS_VARIANTS = {
  variant: ["segmented", "underline"],
} as const;

export const KUMO_TABS_DEFAULT_VARIANTS = {
  variant: "segmented",
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
}

/** Configuration for a single tab within the Tabs component. */
export type TabsItem = {
  /** Unique identifier for the tab, used as the controlled value. */
  value: string;
  /** Display content for the tab trigger. */
  label: ReactNode;
  /** Additional CSS classes for this tab trigger. */
  className?: string;
  /** Custom render function to replace the tab element (e.g. for link-based tabs). */
  render?: (props: Record<string, unknown>) => React.ReactElement;
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

  return (
    <TabsPrimitive.Root
      {...rootProps}
      className={cn("relative min-w-0 font-medium", className)}
      onValueChange={(nextValue) => {
        const stringValue = String(nextValue);
        onValueChange?.(stringValue);
      }}
    >
      {/* Background element for segmented variant */}
      {isSegmented && (
        <div className="absolute inset-x-0 top-1/2 -z-10 h-8.5 -translate-y-1/2 rounded-lg bg-kumo-tint" />
      )}
      <TabsPrimitive.List
        activateOnFocus={activateOnFocus}
        className={cn(
          "scrollbar-hide relative flex min-w-0 shrink items-stretch",
          isSegmented && "h-8.5 rounded-lg bg-kumo-tint px-px",
          isUnderline && "h-7 gap-4 border-b border-kumo-line pb-2",
          listClassName,
        )}
      >
        {items.map((tab) => (
          <TabsPrimitive.Tab
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative z-10 flex cursor-pointer items-center rounded bg-transparent text-base whitespace-nowrap hover:border-kumo-tint focus-visible:rounded-none focus-visible:ring-kumo-ring focus-visible:outline-offset-3",
              isSegmented &&
                "my-px rounded-lg px-2.5 text-kumo-strong aria-selected:text-kumo-default",
              isUnderline &&
                "mb-2 text-kumo-strong hover:text-kumo-subtle aria-selected:font-medium aria-selected:text-kumo-default",
              tab.className,
            )}
          >
            {tab.label}
          </TabsPrimitive.Tab>
        ))}
        <TabsPrimitive.Indicator
          className={cn(
            "absolute z-0 transition-[left,width,transform] duration-200 ease-out",
            "data-[rendered=false]:scale-90 data-[rendered=false]:opacity-0",
            "left-(--active-tab-left) w-(--active-tab-width)",
            isSegmented &&
              "top-(--active-tab-top) h-(--active-tab-height) rounded-lg bg-kumo-overlay shadow-sm ring ring-kumo-fill-hover",
            isUnderline && "bottom-0 h-0.5 bg-kumo-brand",
            indicatorClassName,
          )}
        />
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
