import { Children, forwardRef, type ReactNode } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { LayerCard } from "../layer-card/layer-card";

// Variants

/** MetricCardGroup variant definitions mapping orientation to layout classes. */
export const KUMO_METRIC_CARD_GROUP_VARIANTS = {
  orientation: {
    horizontal: {
      classes: "grid grid-cols-1 overflow-hidden",
      description:
        "Responsive grid of cards using container queries, up to 6 columns",
    },
    vertical: {
      classes: "flex flex-col divide-y divide-kumo-line",
      description: "Cards stacked with horizontal dividers",
    },
  },
} as const;

export const KUMO_METRIC_CARD_GROUP_DEFAULT_VARIANTS = {
  orientation: "horizontal",
} as const;

// Derived types from KUMO_METRIC_CARD_GROUP_VARIANTS
export type KumoMetricCardGroupOrientation =
  keyof typeof KUMO_METRIC_CARD_GROUP_VARIANTS.orientation;

export interface KumoMetricCardGroupVariantsProps {
  /**
   * Layout direction for child metric cards.
   * - `"horizontal"` — Cards in a row with vertical dividers
   * - `"vertical"` — Cards stacked with horizontal dividers
   * @default "horizontal"
   */
  orientation?: KumoMetricCardGroupOrientation;
}

export function metricCardGroupVariants({
  orientation = KUMO_METRIC_CARD_GROUP_DEFAULT_VARIANTS.orientation,
}: KumoMetricCardGroupVariantsProps = {}) {
  const orientationConfig =
    KUMO_METRIC_CARD_GROUP_VARIANTS.orientation[orientation];
  return cn(
    orientationConfig?.classes ??
      KUMO_METRIC_CARD_GROUP_VARIANTS.orientation[
        KUMO_METRIC_CARD_GROUP_DEFAULT_VARIANTS.orientation
      ].classes,
  );
}

/**
 * Container-query breakpoint classes for horizontal MetricCardGroup.
 * Each breakpoint adds a column at 170px increments (matching card min-width).
 * Capped by child count so a 3-card group never gets a 4-column class.
 */
const CONTAINER_BREAKPOINTS = [
  "@[340px]/metrics:grid-cols-2",
  "@[510px]/metrics:grid-cols-3",
  "@[680px]/metrics:grid-cols-4",
  "@[850px]/metrics:grid-cols-5",
  "@[1020px]/metrics:grid-cols-6",
] as const;

function getResponsiveGridClasses(childCount: number): string {
  const maxBreakpoints = Math.min(
    Math.max(childCount - 1, 0),
    CONTAINER_BREAKPOINTS.length,
  );
  return CONTAINER_BREAKPOINTS.slice(0, maxBreakpoints).join(" ");
}

// MetricCardGroup

/**
 * MetricCardGroup component props.
 *
 * @example
 * ```tsx
 * <MetricCardGroup>
 *   <MetricCard label="Requests" value="1.2M" />
 *   <MetricCard label="Error Rate" value="0.3" unit="%" />
 * </MetricCardGroup>
 *
 * <MetricCardGroup title="Performance" orientation="vertical">
 *   <MetricCard label="p50 Latency" value="42" unit="ms" />
 *   <MetricCard label="p99 Latency" value="142" unit="ms" />
 * </MetricCardGroup>
 * ```
 */
export interface MetricCardGroupProps
  extends KumoMetricCardGroupVariantsProps,
    // "lang" omitted to prevent it from appearing in the component API reference (inherited from HTMLAttributes)
    Omit<HTMLAttributes<HTMLDivElement>, "title" | "lang"> {
  /** Optional header text rendered in a LayerCard.Secondary section. */
  title?: ReactNode;
  /** MetricCard children to render inside the group. */
  children: ReactNode;
}

/**
 * Groups MetricCard children inside a LayerCard with an optional header
 * and configurable horizontal/vertical orientation.
 *
 * @example
 * ```tsx
 * <MetricCardGroup>
 *   <MetricCard label="Requests" value="1.2M" />
 *   <MetricCard label="Bandwidth" value="3.5" unit="GB" />
 * </MetricCardGroup>
 * ```
 */
export const MetricCardGroup = forwardRef<HTMLDivElement, MetricCardGroupProps>(
  function MetricCardGroup(
    {
      orientation = KUMO_METRIC_CARD_GROUP_DEFAULT_VARIANTS.orientation,
      title,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const innerClasses = metricCardGroupVariants({ orientation });
    const childCount = Children.count(children);
    const responsiveClasses =
      orientation === "horizontal"
        ? getResponsiveGridClasses(childCount)
        : undefined;

    return (
      <LayerCard
        className={cn("flex w-full flex-col", className)}
        ref={ref}
        {...rest}
      >
        {title && <LayerCard.Secondary>{title}</LayerCard.Secondary>}
        <LayerCard.Primary className="p-0">
          {orientation === "horizontal" ? (
            <div className="@container/metrics">
              <div
                className={cn(
                  innerClasses,
                  responsiveClasses,
                  "[&>*]:h-auto [&>*]:ring-[0.5px] [&>*]:ring-kumo-line [&>*]:rounded-none [&>*]:bg-kumo-base",
                )}
              >
                {children}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                innerClasses,
                "[&>*]:h-auto [&>*]:ring-0 [&>*]:rounded-none [&>*]:bg-kumo-base",
              )}
            >
              {children}
            </div>
          )}
        </LayerCard.Primary>
      </LayerCard>
    );
  },
);

MetricCardGroup.displayName = "MetricCardGroup";
