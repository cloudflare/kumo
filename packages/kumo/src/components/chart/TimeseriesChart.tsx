import type * as echarts from "echarts/core";
import type { LineSeriesOption, BarSeriesOption } from "echarts/charts";
import type { EChartsOption, SeriesOption, SetOptionOpts } from "echarts";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { Chart, ChartEvents, KumoChartOption } from "./EChart";

/** A single data series rendered on a `TimeseriesChart` */
export interface TimeseriesData {
  /** Display name shown in tooltips and legends */
  name: string;
  /** Array of `[timestamp_ms, value]` tuples ordered by time */
  data: [number, number][];
  /** Hex color string used for this series' line, bars, and legend dot */
  color: string;
}

/** Localizable labels for the keyboard and single-pointer time range controls. */
export interface TimeseriesTimeRangeControlsLabels {
  /** Accessible name for the fallback controls form. Defaults to "Select time range". */
  groupLabel?: string;
  /** Instructional text shown above the controls. Defaults to "Choose a start and end time, then apply the range.". */
  instructions?: string;
  /** Label for the start timestamp select. Defaults to "Start". */
  startLabel?: string;
  /** Label for the end timestamp select. Defaults to "End". */
  endLabel?: string;
  /** Label for the submit button. Defaults to "Apply range". */
  applyLabel?: string;
  /** Label for the preset button that selects the full available range. Defaults to "Use full range". */
  fullRangeLabel?: string;
  /** Text shown when no timestamps are available. Defaults to "No timestamps available". */
  emptyLabel?: string;
}

/** Props for `TimeseriesChart` */
export interface TimeseriesChartProps {
  /**
   * The ECharts core instance imported by the consumer.
   * Passed in rather than imported directly so the consumer controls which
   * ECharts modules are bundled (tree-shaking).
   */
  echarts: typeof echarts;
  /** Visual style of each series. Defaults to `"line"`. */
  type?: "line" | "bar";
  /** Array of time series data to display on the chart */
  data: TimeseriesData[];
  /** Label for the x-axis (time axis) */
  xAxisName?: string;
  /** Number of ticks to display on the x-axis */
  xAxisTickCount?: number;
  /**
   * Custom formatter for x-axis tick labels.
   * Receives the raw timestamp in milliseconds and returns a display string,
   * overriding ECharts' built-in time formatting.
   */
  xAxisTickFormat?: (value: number) => string;
  /**
   * Custom formatter for y-axis tick labels.
   * Receives the raw value and returns a display string.
   * When omitted, ECharts' built-in formatter is used.
   */
  yAxisTickFormat?: (value: number) => string;
  /**
   * @deprecated Use `tooltipValueFormat` instead. This prop formats tooltip
   * values, not y-axis tick labels. It will be removed in a future major version.
   */
  yAxisTickLabelFormat?: (value: number) => string;
  /** Label for the y-axis (value axis) */
  yAxisName?: string;
  /** Number of ticks to display on the y-axis */
  yAxisTickCount?: number;
  /**
   * Custom formatter for tooltip values.
   * Receives the raw y-value and returns a display string.
   * When omitted, the raw value is shown. Takes precedence over the
   * deprecated `yAxisTickLabelFormat` prop.
   */
  tooltipValueFormat?: (value: number) => string;
  /**
   * Controls which series are shown in the tooltip.
   * - `"all"` — show all series at the hovered timestamp (default)
   * - `"single"` — show only the series whose value is closest to the cursor
   */
  tooltipMode?: "all" | "single";
  /**
   * Maximum number of series rows shown in the tooltip when `tooltipMode` is `"all"`.
   * Additional series are hidden with a `+N more` footer. Defaults to `10`.
   */
  tooltipMaxItems?: number;
  /**
   * Constrains the tooltip to stay within a specific element or region.
   * By default the tooltip avoids overflowing any clipping ancestor
   * (scroll containers, viewports, etc.).
   *
   * Pass an `Element` or array of elements to restrict the tooltip to a
   * specific container.
   *
   * @default "clipping-ancestors"
   */
  tooltipBoundary?: "clipping-ancestors" | Element | Element[];
  /**
   * Which axis the tooltip follows the cursor on.
   *
   * - `"both"` — tooltip tracks the cursor on both axes, staying near the
   *   pointer at all times. This is the default and matches the behaviour of
   *   ECharts' built-in tooltip.
   * - `"x"` — tooltip follows the cursor horizontally but is locked to a
   *   fixed vertical position relative to the chart. This keeps the tooltip
   *   out of the way of the data and avoids vertical jitter as series values
   *   change — the same approach used by Recharts and many dashboard UIs.
   *
   * Only these two modes are offered because the x-axis is always time in a
   * `TimeseriesChart`: y-only tracking and fully-fixed positioning don't
   * produce useful tooltip behaviour for time-series data.
   *
   * Powered by Base UI Tooltip's `trackCursorAxis` under the hood.
   *
   * @default "both"
   */
  tooltipFollowCursor?: "both" | "x";
  /** Indicates incomplete data periods with optional before/after timestamps in ms */
  incomplete?: { before?: number; after?: number };
  /**
   * When `true`, adds a hidden ECharts legend so consumers can drive series
   * visibility imperatively via the `legendSelect` / `legendUnSelect` /
   * `legendToggleSelect` actions (e.g. to build a custom interactive legend).
   * Toggled-off series are also excluded from the tooltip.
   *
   * Requires the consumer to register ECharts' `LegendComponent`
   * (`echarts.use([LegendComponent])`); otherwise the legend actions no-op and,
   * in development, ECharts logs a "component legend is used but not imported"
   * warning.
   *
   * @default false
   */
  enableLegendSelection?: boolean;
  /** Height of the chart in pixels. Defaults to `350`. */
  height?: number;
  /** Callback fired when user selects a time range via brush selection */
  onTimeRangeChange?: (from: number, to: number) => void;
  /**
   * Localized labels for the fallback time-range controls shown when
   * `onTimeRangeChange` is provided. These controls give users a keyboard and
   * single-pointer alternative to ECharts' drag brush selection.
   */
  timeRangeControlsLabels?: TimeseriesTimeRangeControlsLabels;
  /**
   * Formats timestamp options in the fallback time-range controls. Defaults to
   * `xAxisTickFormat` when provided, otherwise uses the browser locale.
   */
  timeRangeControlsFormat?: (timestamp: number) => string;
  /** When `true`, switches the chart to ECharts' built-in dark theme */
  isDarkMode?: boolean;
  /**
   * When `true`, renders a vertical gradient fill beneath each line series.
   * The gradient fades from the series' color at the top to transparent at the bottom.
   * Has no effect when `type` is `"bar"`.
   */
  gradient?: boolean;
  /**
   * When `true`, hides the chart and displays an animated sine-wave skeleton
   * that oscillates back and forth to indicate that data is being fetched.
   */
  loading?: boolean;
  /**
   * Accessible name for the chart wrapper. Use a specific, localized label
   * that identifies what this chart shows, for example "Requests over time".
   */
  ariaLabel?: string;
  /**
   * Accessible description for screen readers. When provided, it is passed to
   * the chart wrapper and ECharts' `aria.label.description`. Consumers are
   * responsible for writing a meaningful, localized description —
   * see the W3C guidance on complex images for recommendations.
   *
   * @see https://www.w3.org/WAI/tutorials/images/complex/
   * @see https://echarts.apache.org/handbook/en/best-practices/aria/
   */
  ariaDescription?: string;
  /**
   * Localized text announced while `loading` is true. Defaults to
   * "Loading chart".
   */
  loadingText?: string;
  /**
   * Additional options passed as the second argument to `chart.setOption()`.
   * Defaults to `{ notMerge: false, lazyUpdate: true }`.
   */
  optionUpdateBehavior?: SetOptionOpts;
}

interface TooltipRow {
  name: string;
  value: number;
  color: string;
}

interface TooltipState {
  ts: number;
  rows: TooltipRow[];
  hiddenCount: number;
}

/**
 * TimeseriesChart — a time-series line or bar chart.
 *
 * Built on `Chart` (Apache ECharts) with opinionated defaults for time-series data:
 * a time-typed x-axis, dashed lines for incomplete data periods, brush-based
 * time range selection, and automatic tooltip deduplication.
 *
 * @example
 * ```tsx
 * import * as echarts from "echarts/core";
 * import { LineChart } from "echarts/charts";
 * import { GridComponent, TooltipComponent, BrushComponent, ToolboxComponent } from "echarts/components";
 * import { CanvasRenderer } from "echarts/renderers";
 *
 * echarts.use([LineChart, GridComponent, TooltipComponent, BrushComponent, ToolboxComponent, CanvasRenderer]);
 *
 * const [range, setRange] = useState<[number, number]>();
 *
 * <TimeseriesChart
 *   echarts={echarts}
 *   data={[{ name: "Requests", data: [[Date.now(), 42]], color: "#086FFF" }]}
 *   xAxisName="Time"
 *   xAxisTickFormat={(ts) => new Date(ts).toLocaleTimeString()}
 *   yAxisName="Count"
 *   yAxisTickFormat={(value) => `${value / 1000}k`}
 *   tooltipValueFormat={(value) => `${value.toFixed(2)} req/s`}
 *   onTimeRangeChange={(from, to) => setRange([from, to])}
 * />
 * ```
 */
export const TimeseriesChart = forwardRef<
  echarts.ECharts | null,
  TimeseriesChartProps
>(function TimeseriesChart(
  {
    echarts,
    type = "line",
    data,
    xAxisName,
    xAxisTickCount,
    xAxisTickFormat,
    yAxisTickFormat,
    yAxisTickLabelFormat,
    yAxisName,
    yAxisTickCount,
    tooltipValueFormat,
    onTimeRangeChange,
    timeRangeControlsLabels,
    timeRangeControlsFormat,
    height = 350,
    incomplete,
    enableLegendSelection = false,
    isDarkMode,
    gradient,
    loading,
    ariaLabel,
    ariaDescription,
    loadingText = "Loading chart",
    optionUpdateBehavior,
    tooltipMode = "all",
    tooltipMaxItems = 10,
    tooltipFollowCursor = "both",
    tooltipBoundary,
  },
  ref,
) {
  const chartRef = useRef<echarts.ECharts | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const mergedRef = useCallback(
    (instance: echarts.ECharts | null) => {
      chartRef.current = instance;
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
    },
    [ref],
  );

  // Keep latest props accessible inside event handlers without stale closures
  const dataRef = useRef(data);
  dataRef.current = data;
  // Tracks legend selection (series name → visible) so the tooltip can skip toggled-off series
  const legendSelectedRef = useRef<Record<string, boolean> | null>(null);
  // Clear stale selection so it can't keep filtering the tooltip when:
  // - legend selection is disabled (hidden legend removed), or
  // - the theme toggles (`isDarkMode` change re-inits the ECharts instance,
  //   which resets legend selection to all-visible).
  // Done in an effect (not during render) to stay safe under concurrent rendering.
  useEffect(() => {
    legendSelectedRef.current = null;
  }, [enableLegendSelection, isDarkMode]);

  const tooltipModeRef = useRef(tooltipMode);
  tooltipModeRef.current = tooltipMode;
  const tooltipMaxItemsRef = useRef(tooltipMaxItems);
  tooltipMaxItemsRef.current = tooltipMaxItems;

  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);
  const timeRangeControlTimestamps = useMemo(
    () => getTimeRangeControlTimestamps(data),
    [data],
  );
  const formatTimeRangeControl = timeRangeControlsFormat ?? xAxisTickFormat;

  // Track cursor position for single-mode y lookup (convertFromPixel needs relative coords)
  const mousePosRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    container.addEventListener("mousemove", onMove);
    return () => container.removeEventListener("mousemove", onMove);
  }, []);

  const incompleteBefore = incomplete?.before;
  const incompleteAfter = incomplete?.after;

  const options = useMemo(() => {
    const transformSeries: Array<LineSeriesOption | BarSeriesOption> = [];

    const seriesType =
      type === "bar"
        ? ({ type: "bar", stack: "total" } as const)
        : ({ type: "line", showSymbol: false } as const);

    for (const s of data) {
      const incompleteBeforePoints =
        incompleteBefore && type === "line"
          ? s.data.filter((point) => point[0] <= incompleteBefore)
          : [];

      const incompleteAfterPoints =
        incompleteAfter && type === "line"
          ? s.data.filter((point) => point[0] >= incompleteAfter)
          : [];

      const completePoints =
        incompleteBeforePoints.length > 0 || incompleteAfterPoints.length > 0
          ? s.data.slice(
              Math.max(0, incompleteBeforePoints.length - 1),
              Math.max(0, s.data.length - incompleteAfterPoints.length + 1),
            )
          : s.data;

      // Main complete data series
      const areaStyle =
        gradient && type === "line"
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colorWithOpacity(s.color, 0.4) },
                { offset: 1, color: colorWithOpacity(s.color, 0) },
              ]),
            }
          : undefined;

      transformSeries.push({
        data: completePoints,
        color: s.color,
        name: s.name,
        emphasis: { focus: "series" },
        ...(areaStyle ? { areaStyle } : {}),
        ...seriesType,
      });

      // Incomplete data series with dashed lines
      const incompleteSeriesConfig = {
        color: s.color,
        name: s.name,
        type: "line" as const,
        lineStyle: { type: "dashed" as const },
        showSymbol: false,
        emphasis: { focus: "series" as const },
      };

      if (incompleteBeforePoints.length > 0) {
        transformSeries.push({
          ...incompleteSeriesConfig,
          data: incompleteBeforePoints,
        });
      }

      if (incompleteAfterPoints.length > 0) {
        transformSeries.push({
          ...incompleteSeriesConfig,
          data: incompleteAfterPoints,
        });
      }
    }

    return {
      aria: {
        enabled: true,
        ...(ariaDescription && { label: { description: ariaDescription } }),
      },
      brush: {
        xAxisIndex: "all" as const,
        brushType: "lineX" as const,
        brushMode: "single" as const,
        outOfBrush: {
          colorAlpha: 0.3,
        },
        brushStyle: {
          borderWidth: 1,
          color: "rgba(120,140,180,0.3)",
          borderColor: "rgba(120,140,180,0.8)",
        },
      },
      tooltip: {
        trigger: "axis" as const,
        showContent: false,
        axisPointer: { type: "shadow" as const },
      },
      backgroundColor: "transparent",
      toolbox: { show: false },
      ...(enableLegendSelection ? { legend: { show: false } } : {}),
      xAxis: {
        name: xAxisName,
        nameLocation: "middle" as const,
        nameGap: 30,
        type: "time" as const,
        splitLine: {
          show: false,
        },
        axisLine: { show: false },
        splitNumber: xAxisTickCount ?? 5,
        ...(xAxisTickFormat && {
          axisLabel: {
            formatter: (value: number) => xAxisTickFormat(value),
          },
        }),
      },
      yAxis: {
        name: yAxisName,
        nameLocation: "middle" as const,
        nameGap: 40,
        type: "value" as const,
        axisTick: { show: true },
        axisLabel: {
          margin: 15,
          ...(yAxisTickFormat && {
            formatter: (value: number) => yAxisTickFormat(value),
          }),
        },
        splitLine: {
          show: true,
          lineStyle: { type: "dashed" as const, width: 1 },
        },
        splitNumber: yAxisTickCount,
      },
      grid: {
        left: yAxisName ? 30 : 24,
        right: 24,
        top: 24,
        bottom: xAxisName ? 30 : 24,
      },
      series: transformSeries as SeriesOption[],
    } satisfies KumoChartOption;
  }, [
    data,
    xAxisName,
    xAxisTickCount,
    xAxisTickFormat,
    yAxisTickFormat,
    yAxisName,
    yAxisTickCount,
    incompleteBefore,
    incompleteAfter,
    type,
    gradient,
    enableLegendSelection,
    echarts,
    ariaDescription,
  ]);

  const events = useMemo<Partial<ChartEvents>>(() => {
    return {
      updateaxispointer: (params: any) => {
        const ts: number | undefined = params?.axesInfo?.[0]?.value;
        if (ts == null) return;

        const seenNames = new Set<string>();
        const allRows: TooltipRow[] = [];

        // Respect legend selection: series toggled off via the legend
        // (legendUnSelect / legendToggleSelect) should not appear in the tooltip.
        // Read from a ref kept in sync by `legendselectchanged` — avoids the
        // expensive `getOption()` deep-clone on every pointer move.
        const legendSelected = legendSelectedRef.current;

        for (const s of dataRef.current) {
          if (seenNames.has(s.name)) continue;
          if (legendSelected && legendSelected[s.name] === false) continue;
          seenNames.add(s.name);
          const value = findNearest(s.data, ts);
          if (value != null)
            allRows.push({ name: s.name, value, color: s.color });
        }

        // Sort by value descending so highest series appears first
        allRows.sort((a, b) => b.value - a.value);

        let rows: TooltipRow[];
        let hiddenCount = 0;

        if (tooltipModeRef.current === "single") {
          // Find the series whose value is closest to the cursor's y position
          const chart = chartRef.current;
          const cursorValue = chart
            ? (
                chart.convertFromPixel("grid", [0, mousePosRef.current.y]) as [
                  number,
                  number,
                ]
              )?.[1]
            : null;
          if (cursorValue != null && allRows.length > 0) {
            const nearest = allRows.reduce((best, row) =>
              Math.abs(row.value - cursorValue) <
              Math.abs(best.value - cursorValue)
                ? row
                : best,
            );
            rows = [nearest];
          } else {
            rows = allRows.slice(0, 1);
          }
        } else {
          const max = tooltipMaxItemsRef.current;
          rows = allRows.slice(0, max);
          hiddenCount = Math.max(0, allRows.length - max);
        }

        const nextState: TooltipState = { ts, rows, hiddenCount };
        setTooltipState((prev) => {
          if (isSameTooltipState(prev, nextState)) return prev;
          return nextState;
        });
      },
      globalout: () => {
        setTooltipState(null);
      },
      // Keep the tooltip in sync with legend selection. Each action fires a
      // different event — `legendToggleSelect` → `legendselectchanged`,
      // `legendSelect` → `legendselected`, `legendUnSelect` → `legendunselected`
      // — and all three carry the full `selected` map, so we listen to all of
      // them (params type inferred from `ChartEvents`).
      legendselectchanged: (params) => {
        legendSelectedRef.current = params.selected;
      },
      legendselected: (params) => {
        legendSelectedRef.current = params.selected;
      },
      legendunselected: (params) => {
        legendSelectedRef.current = params.selected;
      },
      ...(onTimeRangeChange && {
        brushend: (params: any) => {
          const range = params.areas[0].coordRange;
          onTimeRangeChange(range[0], range[1]);
          chartRef.current?.dispatchAction({ type: "brush", areas: [] });
        },
      }),
    };
  }, [onTimeRangeChange]);

  // Activate the lineX brush cursor when a time-range callback is provided,
  // and deactivate it on cleanup so the cursor resets when the prop is removed.
  const hasTimeRangeCallback = !!onTimeRangeChange;
  useEffect(() => {
    const chart = chartRef.current;
    if (chart && hasTimeRangeCallback) {
      chart.dispatchAction({
        type: "takeGlobalCursor",
        key: "brush",
        brushOption: {
          brushType: "lineX" as const,
          brushMode: "single" as const,
        },
      });

      return () => {
        chart.dispatchAction({
          type: "takeGlobalCursor",
          key: "brush",
          brushOption: {
            brushType: false,
          },
        });
      };
    }
    // `loading` controls whether <Chart> is mounted. When it flips to false,
    // chartRef.current becomes available and the brush cursor must be activated.
    // Without this dep, the effect won't re-run after Chart mounts.
  }, [chartRef, hasTimeRangeCallback, loading]);

  const formatFn = tooltipValueFormat ?? yAxisTickLabelFormat;
  const tooltipOpen = tooltipState !== null;

  return (
    <TooltipPrimitive.Root
      open={tooltipOpen}
      trackCursorAxis={tooltipFollowCursor}
    >
      <TooltipPrimitive.Trigger
        render={
          <div
            ref={containerRef}
            className="relative w-full"
            style={{ height }}
            aria-busy={loading ? true : undefined}
          />
        }
      >
        <div className="relative w-full" style={{ height }}>
          {loading ? (
            <>
              <ChartWaveLoader height={height} isDarkMode={isDarkMode} />
              <div role="status" aria-live="polite" className="sr-only">
                {loadingText}
              </div>
            </>
          ) : (
            <Chart
              echarts={echarts}
              ref={mergedRef}
              options={options as EChartsOption}
              height={height}
              isDarkMode={isDarkMode}
              ariaLabel={ariaLabel}
              ariaDescription={ariaDescription}
              onEvents={events}
              optionUpdateBehavior={optionUpdateBehavior}
            />
          )}
        </div>
        {onTimeRangeChange && (
          <TimeRangeControls
            timestamps={timeRangeControlTimestamps}
            labels={timeRangeControlsLabels}
            formatTimestampLabel={formatTimeRangeControl}
            onTimeRangeChange={onTimeRangeChange}
          />
        )}
      </TooltipPrimitive.Trigger>
      {tooltipOpen && (
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner
            side="right"
            align="start"
            sideOffset={12}
            collisionAvoidance={{ side: "flip", align: "shift" }}
            collisionBoundary={tooltipBoundary}
            collisionPadding={8}
          >
            <TooltipPrimitive.Popup
              data-mode={isDarkMode ? "dark" : "light"}
              className="bg-kumo-base rounded-lg shadow-lg shadow-kumo-tip-shadow outline outline-1 outline-kumo-fill p-2 min-w-[150px] max-w-xs"
            >
              <TooltipContent state={tooltipState} formatValue={formatFn} />
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      )}
    </TooltipPrimitive.Root>
  );
});

TimeseriesChart.displayName = "TimeseriesChart";

// ─── Tooltip content ──────────────────────────────────────────────────────────
//
// Memoized so React skips reconciliation when the cursor moves within the same
// data point. The timestamp dedup in updateAxisPointer already prevents most
// unnecessary state updates; this is a safety net for when the parent re-renders
// for unrelated reasons (e.g. a prop change on TimeseriesChart).

interface TooltipContentProps {
  state: TooltipState;
  formatValue?: (v: number) => string;
}

const TooltipContent = memo(function TooltipContent({
  state,
  formatValue,
}: TooltipContentProps) {
  const { ts, rows, hiddenCount } = state;

  return (
    <>
      <div className="text-xs font-semibold text-kumo-default mb-1">
        {formatTimestamp(ts)}
      </div>
      {rows.map((row) => (
        <div
          key={row.name}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: row.color }}
            />
            <span
              className="text-xs font-medium text-kumo-default truncate"
              title={row.name}
            >
              {row.name}
            </span>
          </div>
          <span className="text-xs font-semibold text-kumo-default shrink-0">
            {formatValue
              ? formatValue(row.value)
              : formatDefaultValue(row.value)}
          </span>
        </div>
      ))}
      {hiddenCount > 0 && (
        <div className="text-xs text-kumo-subtle mt-1">+{hiddenCount} more</div>
      )}
    </>
  );
});

// ─── Time range controls ──────────────────────────────────────────────────────

const DEFAULT_TIME_RANGE_CONTROL_LABELS = {
  groupLabel: "Select time range",
  instructions: "Choose a start and end time, then apply the range.",
  startLabel: "Start",
  endLabel: "End",
  applyLabel: "Apply range",
  fullRangeLabel: "Use full range",
  emptyLabel: "No timestamps available",
} satisfies Required<TimeseriesTimeRangeControlsLabels>;

interface TimeRangeControlsProps {
  timestamps: number[];
  labels?: TimeseriesTimeRangeControlsLabels;
  formatTimestampLabel?: (timestamp: number) => string;
  onTimeRangeChange: (from: number, to: number) => void;
}

function TimeRangeControls({
  timestamps,
  labels: labelsProp,
  formatTimestampLabel,
  onTimeRangeChange,
}: TimeRangeControlsProps) {
  const instructionsId = useId();
  const labels = {
    groupLabel: labelsProp?.groupLabel ?? DEFAULT_TIME_RANGE_CONTROL_LABELS.groupLabel,
    instructions:
      labelsProp?.instructions ?? DEFAULT_TIME_RANGE_CONTROL_LABELS.instructions,
    startLabel: labelsProp?.startLabel ?? DEFAULT_TIME_RANGE_CONTROL_LABELS.startLabel,
    endLabel: labelsProp?.endLabel ?? DEFAULT_TIME_RANGE_CONTROL_LABELS.endLabel,
    applyLabel: labelsProp?.applyLabel ?? DEFAULT_TIME_RANGE_CONTROL_LABELS.applyLabel,
    fullRangeLabel:
      labelsProp?.fullRangeLabel ?? DEFAULT_TIME_RANGE_CONTROL_LABELS.fullRangeLabel,
    emptyLabel: labelsProp?.emptyLabel ?? DEFAULT_TIME_RANGE_CONTROL_LABELS.emptyLabel,
  };
  const timestampValues = useMemo(
    () => timestamps.map((timestamp) => String(timestamp)),
    [timestamps],
  );
  const firstValue = timestampValues[0] ?? "";
  const lastValue = timestampValues[timestampValues.length - 1] ?? "";
  const hasTimestamps = timestampValues.length > 0;

  const [range, setRange] = useState({ from: firstValue, to: lastValue });

  useEffect(() => {
    setRange((current) => {
      const next = {
        from: timestampValues.includes(current.from) ? current.from : firstValue,
        to: timestampValues.includes(current.to) ? current.to : lastValue,
      };

      if (current.from === next.from && current.to === next.to) {
        return current;
      }

      return next;
    });
  }, [firstValue, lastValue, timestampValues]);

  const applyRange = useCallback(
    (fromValue: string, toValue: string) => {
      const from = Number(fromValue);
      const to = Number(toValue);

      if (!Number.isFinite(from) || !Number.isFinite(to)) {
        return;
      }

      // Match brush selection's timestamp tuple while keeping manual input forgiving.
      onTimeRangeChange(Math.min(from, to), Math.max(from, to));
    },
    [onTimeRangeChange],
  );

  const formatOptionLabel = useCallback(
    (timestamp: number) =>
      formatTimestampLabel ? formatTimestampLabel(timestamp) : formatTimestamp(timestamp),
    [formatTimestampLabel],
  );

  return (
    <form
      aria-label={labels.groupLabel}
      className="mt-3 rounded-lg bg-kumo-elevated p-3 shadow-xs ring ring-kumo-line"
      onSubmit={(event) => {
        event.preventDefault();
        applyRange(range.from, range.to);
      }}
    >
      <p id={instructionsId} className="text-xs text-kumo-subtle text-pretty">
        {labels.instructions}
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-kumo-subtle">
            {labels.startLabel}
          </span>
          <select
            value={range.from}
            disabled={!hasTimestamps}
            aria-describedby={instructionsId}
            className="h-10 w-full rounded-lg border-0 bg-kumo-base px-3 text-sm text-kumo-default shadow-xs ring ring-kumo-line focus:outline-none focus:ring-kumo-focus/50 focus:ring-[1.5px] disabled:cursor-not-allowed disabled:opacity-60"
            onChange={(event) =>
              setRange((current) => ({ ...current, from: event.target.value }))
            }
          >
            {hasTimestamps ? (
              timestamps.map((timestamp) => (
                <option key={timestamp} value={String(timestamp)}>
                  {formatOptionLabel(timestamp)}
                </option>
              ))
            ) : (
              <option value="">{labels.emptyLabel}</option>
            )}
          </select>
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-kumo-subtle">
            {labels.endLabel}
          </span>
          <select
            value={range.to}
            disabled={!hasTimestamps}
            aria-describedby={instructionsId}
            className="h-10 w-full rounded-lg border-0 bg-kumo-base px-3 text-sm text-kumo-default shadow-xs ring ring-kumo-line focus:outline-none focus:ring-kumo-focus/50 focus:ring-[1.5px] disabled:cursor-not-allowed disabled:opacity-60"
            onChange={(event) =>
              setRange((current) => ({ ...current, to: event.target.value }))
            }
          >
            {hasTimestamps ? (
              timestamps.map((timestamp) => (
                <option key={timestamp} value={String(timestamp)}>
                  {formatOptionLabel(timestamp)}
                </option>
              ))
            ) : (
              <option value="">{labels.emptyLabel}</option>
            )}
          </select>
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={!hasTimestamps}
            className="inline-flex h-10 items-center justify-center rounded-lg border-0 bg-kumo-base px-3 text-sm font-medium text-kumo-default shadow-xs ring ring-kumo-line transition-transform hover:bg-kumo-tint active:scale-[0.96] focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
            onClick={() => applyRange(firstValue, lastValue)}
          >
            {labels.fullRangeLabel}
          </button>
          <button
            type="submit"
            disabled={!hasTimestamps}
            className="inline-flex h-10 items-center justify-center rounded-lg border-0 bg-kumo-brand px-3 text-sm font-medium text-white shadow-xs transition-transform hover:bg-kumo-brand-hover active:scale-[0.96] focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            {labels.applyLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeRangeControlTimestamps(data: TimeseriesData[]): number[] {
  const timestamps = new Set<number>();

  for (const series of data) {
    for (const [timestamp] of series.data) {
      if (Number.isFinite(timestamp)) {
        timestamps.add(timestamp);
      }
    }
  }

  return [...timestamps].sort((a, b) => a - b);
}

/** Binary search for the value in `data` whose timestamp is closest to `ts`. */
function findNearest(data: [number, number][], ts: number): number | null {
  if (data.length === 0) return null;
  let lo = 0,
    hi = data.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (data[mid][0] < ts) lo = mid + 1;
    else hi = mid;
  }
  // Check both neighbours and return the closer one
  if (lo > 0 && Math.abs(data[lo - 1][0] - ts) < Math.abs(data[lo][0] - ts))
    lo--;
  return data[lo][1];
}

/** Shallow-compare two tooltip states so React can skip renders when nothing changed. */
function isSameTooltipState(a: TooltipState | null, b: TooltipState): boolean {
  if (
    !a ||
    a.ts !== b.ts ||
    a.hiddenCount !== b.hiddenCount ||
    a.rows.length !== b.rows.length
  ) {
    return false;
  }
  return a.rows.every((row, i) => {
    const next = b.rows[i];
    return (
      row.name === next.name &&
      row.value === next.value &&
      row.color === next.color
    );
  });
}

const defaultNumberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 3,
});

/** Fallback value formatter — avoids floating point noise without scientific notation. */
function formatDefaultValue(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return defaultNumberFormat.format(value);
}

/**
 * Animated sine-wave skeleton shown while `TimeseriesChart` is in `loading` state.
 * Renders multiple staggered wave paths that sweep continuously left-to-right,
 * mimicking the motion of live time-series data being drawn.
 */
function ChartWaveLoader({
  height,
  isDarkMode,
}: {
  height: number;
  isDarkMode?: boolean;
}) {
  const mid = height / 2;
  const amp = Math.min(height * 0.12, 28);
  const period = 400;
  const steps = 120;

  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = -period + (i / steps) * period * 3;
    const y = mid + Math.sin((i / steps) * 2 * Math.PI * 3) * amp;
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  const d = points.join(" ");

  const strokeColor = isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.2)";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{ height }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${period} ${height}`}
        preserveAspectRatio="none"
        className="kumo-chart-wave-loader w-full animate-pulse motion-reduce:animate-none"
      >
        <path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          className="kumo-chart-wave-path"
        />
      </svg>
    </div>
  );
}

/**
 * Returns an `rgba(r, g, b, alpha)` string for any hex or rgb(a) color input,
 * replacing whatever opacity was already present with the given `alpha` (0–1).
 *
 * Handles:
 * - 6-digit hex:  `#RRGGBB`
 * - 8-digit hex:  `#RRGGBBAA`  ← strips existing alpha
 * - 3-digit hex:  `#RGB`
 * - `rgb(r, g, b)`
 * - `rgba(r, g, b, a)`  ← replaces existing alpha
 */
function colorWithOpacity(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));

  // rgb / rgba
  const rgbMatch = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i,
  );
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${a})`;
  }

  // hex — strip leading #
  let hex = color.replace(/^#/, "");

  // expand 3-digit → 6-digit
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // strip 8-digit alpha → keep only 6
  if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const tooltipDateFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/**
 * Formats a timestamp for use in chart tooltips using the browser's locale.
 * Accepts a Unix timestamp in milliseconds, an ISO date string, or a `Date` object.
 */
function formatTimestamp(ts: number | string | Date): string {
  return tooltipDateFormat.format(new Date(ts));
}
