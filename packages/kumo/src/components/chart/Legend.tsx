import type { MouseEventHandler, PointerEventHandler } from "react";
import { cn } from "../../utils";

const interactiveLegendItemClasses =
  "m-0 appearance-none border-0 bg-transparent p-0 text-left text-inherit [font:inherit] focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand";

/** Shared props for both legend item variants */
interface LegendItemProps {
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
  onPointerEnter?: PointerEventHandler<HTMLElement>;
  /** Fired when a pointer leaves the legend item — useful for resetting chart series emphasis */
  onPointerLeave?: PointerEventHandler<HTMLElement>;
  /** Fired when the legend item is clicked — useful for toggling series visibility */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Optional className to customize legend item presentation */
  className?: string;
}

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
  onPointerEnter,
  onPointerLeave,
  onClick,
  className,
}: LegendItemProps) {
  const content = (
    <>
      <div className="flex items-center gap-2">
        <span
          className={cn("size-2 rounded-full inline-block", {
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
          className={cn("text-lg font-medium leading-none", {
            "opacity-50": inactive,
          })}
        >
          {value}
        </span>
        {unit && (
          <span
            className={cn("text-xs text-kumo-subtle leading-none", {
              "opacity-50": inactive,
            })}
          >
            {unit}
          </span>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        aria-pressed={!inactive}
        className={cn(
          interactiveLegendItemClasses,
          "inline-flex flex-col gap-2 min-w-42 py-2 cursor-pointer",
          className,
        )}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn("inline-flex flex-col gap-2 min-w-42 py-2", className)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {content}
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
  onPointerEnter,
  onPointerLeave,
  onClick,
  className,
}: LegendItemProps) {
  const content = (
    <>
      <span
        className={cn("size-2 rounded-full inline-block", {
          "opacity-50": inactive,
        })}
        style={{ backgroundColor: color }}
      />
      <span className={cn("text-xs", { "opacity-50": inactive })}>
        {name}
      </span>
      <span className={cn("text-xs font-medium", { "opacity-50": inactive })}>
        {value}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        aria-pressed={!inactive}
        className={cn(
          interactiveLegendItemClasses,
          "relative inline-flex items-center gap-2 cursor-pointer before:absolute before:left-1/2 before:top-1/2 before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
          className,
        )}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {content}
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
 * ```
 */
export const ChartLegend = {
  SmallItem,
  LargeItem,
};
