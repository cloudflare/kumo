import type {
  KeyboardEventHandler,
  MouseEventHandler,
  PointerEventHandler,
} from "react";
import { cn } from "../../utils";
import { SkeletonLine } from "../loader";

const onInteractiveKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  event.currentTarget.click();
};

/** Content props shared by both legend item variants when data is present */
interface LegendItemContentProps {
  /** Series name shown as a label */
  name: string;
  /** Hex color string for the series indicator dot */
  color: string;
  /** Formatted value string to display */
  value: string;
  /** Optional unit label shown after the value (e.g. `"ms"`, `"%"`) */
  unit?: string;
  /** When `true`, renders the item at 50% opacity to indicate a deselected state */
  inactive?: boolean;
  /** Fired when a pointer enters the legend item — useful for highlighting the corresponding chart series */
  onPointerEnter?: PointerEventHandler<HTMLDivElement>;
  /** Fired when a pointer leaves the legend item — useful for resetting chart series emphasis */
  onPointerLeave?: PointerEventHandler<HTMLDivElement>;
  /** Fired when the legend item is clicked — useful for toggling series visibility */
  onClick?: MouseEventHandler<HTMLDivElement>;
}

/**
 * Legend item props. When `loading` is `true`, the item renders skeleton
 * placeholders (you typically have no data yet); otherwise pass `name`,
 * `color`, and `value`.
 */
type LegendItemProps = {
  className?: string;
} & (
  | ({
      /** When `true`, renders animated skeleton placeholders instead of content */
      loading: true;
    } & Partial<LegendItemContentProps>)
  | ({ loading?: boolean } & LegendItemContentProps)
);

/**
 * Large legend item — stacked layout with a colored dot + series name on top
 * and a large value with an optional small unit below. Use for prominent
 * single-metric displays such as dashboard cards.
 */
function LargeItem({
  color,
  value,
  name,
  unit,
  inactive,
  loading,
  onPointerEnter,
  onPointerLeave,
  onClick,
  className,
}: LegendItemProps) {
  if (loading) {
    return (
      <div
        aria-hidden="true"
        className={cn("inline-flex min-w-42 flex-col gap-2 py-2", className)}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-kumo-fill" />
          <SkeletonLine className="h-3 w-[8ch]" />
        </div>
        <SkeletonLine className="h-5 w-[5ch]" />
      </div>
    );
  }

  return (
    <div
      // oxlint-disable-next-line prefer-tag-over-role
      role="button"
      tabIndex={onClick ? 0 : -1}
      className={cn(
        "inline-flex min-w-42 flex-col gap-2 py-2",
        { "cursor-pointer": !!onClick },
        className,
      )}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      onKeyDown={onClick ? onInteractiveKeyDown : undefined}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn("inline-block size-2 rounded-full", {
            "opacity-50": inactive,
          })}
          style={{ backgroundColor: color }}
        />
        <span className={cn("text-xs", { "opacity-50": inactive })}>
          {name}
        </span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span
          className={cn("text-lg leading-none font-medium", {
            "opacity-50": inactive,
          })}
        >
          {value}
        </span>
        {unit && (
          <span
            className={cn("text-xs leading-none text-kumo-subtle", {
              "opacity-50": inactive,
            })}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Small legend item — inline layout with a colored dot, series name, and value
 * on a single row. Use for compact legends below or beside a chart.
 */
function SmallItem({
  color,
  value,
  name,
  inactive,
  loading,
  onPointerEnter,
  onPointerLeave,
  onClick,
  className,
}: LegendItemProps) {
  if (loading) {
    return (
      <div
        aria-hidden="true"
        className={cn("inline-flex h-4 items-center gap-2", className)}
      >
        <span className="inline-block size-2 rounded-full bg-kumo-fill" />
        <SkeletonLine className="h-3 w-[5ch]" />
        <SkeletonLine className="h-3 w-[3ch]" />
      </div>
    );
  }

  return (
    <div
      // oxlint-disable-next-line prefer-tag-over-role
      role="button"
      tabIndex={onClick ? 0 : -1}
      className={cn(
        "inline-flex h-4 items-center gap-2",
        { "cursor-pointer": !!onClick },
        className,
      )}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      onKeyDown={onClick ? onInteractiveKeyDown : undefined}
    >
      <span
        className={cn("inline-block size-2 rounded-full", {
          "opacity-50": inactive,
        })}
        style={{ backgroundColor: color }}
      />
      <span className={cn("text-xs", { "opacity-50": inactive })}>{name}</span>
      <span className={cn("text-xs font-medium", { "opacity-50": inactive })}>
        {value}
      </span>
    </div>
  );
}

/**
 * ChartLegend — pre-built legend item components for use alongside a chart.
 *
 * - `ChartLegend.SmallItem` — compact inline layout; suited for multi-series legends
 * - `ChartLegend.LargeItem` — stacked layout with a large value; suited for single-metric cards
 *
 * @example
 * ```tsx
 * <ChartLegend.SmallItem name="Requests" color="#086FFF" value="1,234" />
 * <ChartLegend.LargeItem name="Latency" color="#CF7EE9" value="42" unit="ms" inactive />
 *
 * // While data is loading, render skeleton placeholders:
 * <ChartLegend.SmallItem loading />
 * ```
 */
export const ChartLegend = {
  SmallItem,
  LargeItem,
};
