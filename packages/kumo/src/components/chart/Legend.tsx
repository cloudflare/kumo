import { cn } from "../../utils";

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
}

/**
 * Large legend item — stacked layout with a colored dot + series name on top
 * and a large value with an optional small unit below. Use for prominent
 * single-metric displays such as dashboard cards.
 */
function LargeItem({ color, value, name, unit, inactive }: LegendItemProps) {
  return (
    <div className="inline-flex flex-col gap-2 min-w-42 py-2">
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
    </div>
  );
}

/**
 * Small legend item — inline layout with a colored dot, series name, and value
 * on a single row. Use for compact legends below or beside a chart.
 */
function SmallItem({ color, value, name, inactive }: LegendItemProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn("size-2 rounded-full inline-block", {
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
 * ```
 */
export const ChartLegend = {
  SmallItem,
  LargeItem,
};
