import type * as echarts from "echarts/core";
import type { LineSeriesOption, BarSeriesOption } from "echarts/charts";
import type { EChartsOption, SeriesOption, SetOptionOpts } from "echarts";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { Chart, ChartEvents, KumoChartOption } from "./EChart";
import { ChartPalette } from "./Color";
import {
  buildTimeseriesMarkerAnnotations,
  clusterTimeseriesMarkers,
  getApproximateMarkerClusterInterval,
  getTimeseriesMarkerFromEvent,
  type TimeseriesMarker,
} from "./timeseries-markers";
import {
  TooltipContent,
  type MarkerTooltipState,
  type TooltipRow,
  type TooltipState,
} from "./timeseries-tooltip";
import {
  buildTimeseriesThresholdAnnotations,
  getThresholdValueExtent,
  type TimeseriesThreshold,
} from "./timeseries-thresholds";

export type { TimeseriesMarker } from "./timeseries-markers";
export type { TimeseriesThreshold } from "./timeseries-thresholds";

/** A single data series rendered on a `TimeseriesChart` */
export interface TimeseriesData {
  /** Display name shown in tooltips and legends */
  name: string;
  /** Array of `[timestamp_ms, value]` tuples ordered by time */
  data: [number, number][];
  /** Hex color string used for this series' line, bars, and legend dot */
  color: string;
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
  /** Vertical reference markers rendered on the time axis. */
  markers?: TimeseriesMarker[];
  /** Horizontal threshold lines rendered on the value axis. */
  thresholds?: TimeseriesThreshold[];
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
   * Accessible description for screen readers. When provided, it is passed to
   * ECharts' `aria.label.description` and announced when the chart receives
   * focus. Consumers are responsible for writing a meaningful description —
   * see the W3C guidance on complex images for recommendations.
   *
   * @see https://www.w3.org/WAI/tutorials/images/complex/
   * @see https://echarts.apache.org/handbook/en/best-practices/aria/
   */
  ariaDescription?: string;
  /**
   * Additional options passed as the second argument to `chart.setOption()`.
   * Defaults to `{ notMerge: false, lazyUpdate: true }`.
   */
  optionUpdateBehavior?: SetOptionOpts;
}

const DEFAULT_X_AXIS_TICK_COUNT = 5;

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
    markers,
    thresholds,
    xAxisName,
    xAxisTickCount,
    xAxisTickFormat,
    yAxisTickFormat,
    yAxisTickLabelFormat,
    yAxisName,
    yAxisTickCount,
    tooltipValueFormat,
    onTimeRangeChange,
    height = 350,
    incomplete,
    enableLegendSelection = false,
    isDarkMode,
    gradient,
    loading,
    ariaDescription,
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

  const markerHoverRef = useRef(false);
  const activeMarkerKeyRef = useRef<string | null>(null);

  const tooltipModeRef = useRef(tooltipMode);
  tooltipModeRef.current = tooltipMode;
  const tooltipMaxItemsRef = useRef(tooltipMaxItems);
  tooltipMaxItemsRef.current = tooltipMaxItems;

  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);

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

  const markerColor = ChartPalette.text("primary", isDarkMode);
  const markerLabelBackgroundColor = isDarkMode
    ? "rgba(0, 0, 0, 0.5)"
    : "rgba(255, 255, 255, 0.5)";

  const options = useMemo(() => {
    const transformSeries: Array<LineSeriesOption | BarSeriesOption> = [];

    const seriesType =
      type === "bar"
        ? ({ type: "bar", stack: "total" } as const)
        : ({ type: "line", showSymbol: false } as const);

    const thresholdAnnotations = buildTimeseriesThresholdAnnotations(thresholds);
    const thresholdExtent = getThresholdValueExtent(thresholds);

    const markerClusters = clusterTimeseriesMarkers(
      markers,
      getApproximateMarkerClusterInterval(
        getTimestamps(data, markers),
        xAxisTickCount ?? DEFAULT_X_AXIS_TICK_COUNT,
      ),
    );
    const markerAnnotations = buildTimeseriesMarkerAnnotations(markerClusters, {
      color: markerColor,
      labelBackgroundColor: markerLabelBackgroundColor,
    });

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

    if (markerAnnotations) {
      transformSeries.push({
        data: [],
        name: "Markers",
        type: type === "bar" ? "bar" : "line",
        animation: false,
        markLine: markerAnnotations.markLine,
      });
    }

    if (thresholdAnnotations) {
      transformSeries.push({
        data: [],
        name: "Thresholds",
        type: type === "bar" ? "bar" : "line",
        animation: false,
        markLine: thresholdAnnotations.markLine,
      });
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
        splitNumber: xAxisTickCount ?? DEFAULT_X_AXIS_TICK_COUNT,
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
        ...(thresholdExtent && {
          min: (value: { min: number }) =>
            Math.min(value.min, thresholdExtent.min),
          max: (value: { max: number }) =>
            Math.max(value.max, thresholdExtent.max),
        }),
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
    markers,
    thresholds,
    markerColor,
    markerLabelBackgroundColor,
  ]);

  const events = useMemo<Partial<ChartEvents>>(() => {
    return {
      updateaxispointer: (params: any) => {
        if (markerHoverRef.current) return;

        const ts: number | undefined = params?.axesInfo?.[0]?.value;
        if (ts == null) return;

        const allRows = getAllTooltipRowsAtTimestamp(
          dataRef.current,
          ts,
          legendSelectedRef.current,
        );

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
          ({ rows, hiddenCount } = limitTooltipRows(
            allRows,
            tooltipMaxItemsRef.current,
          ));
        }

        const nextState: TooltipState = {
          type: "series",
          ts,
          rows,
          hiddenCount,
        };
        setTooltipState((prev) => {
          if (isSameTooltipState(prev, nextState)) return prev;
          return nextState;
        });
      },
      mouseover: (params) => {
        const marker = getTimeseriesMarkerFromEvent(params);
        if (!marker) return;

        const markerKey = `${marker.timestamp}-${marker.label ?? ""}`;
        if (activeMarkerKeyRef.current === markerKey) return;

        activeMarkerKeyRef.current = markerKey;
        markerHoverRef.current = true;
        chartRef.current?.dispatchAction({ type: "hideTip" });
        chartRef.current?.dispatchAction({
          type: "updateAxisPointer",
          currTrigger: "leave",
        });

        const { rows, hiddenCount } = getTooltipRowsAtTimestamp(
          dataRef.current,
          marker.timestamp,
          legendSelectedRef.current,
          tooltipMaxItemsRef.current,
        );

        setTooltipState({
          type: "marker",
          ts: marker.timestamp,
          color: marker.color ?? markerColor,
          markers: marker.markers,
          rows,
          hiddenCount,
        });
      },
      mouseout: (params) => {
        if (!getTimeseriesMarkerFromEvent(params)) return;
        activeMarkerKeyRef.current = null;
        markerHoverRef.current = false;
        setTooltipState(null);
      },
      globalout: () => {
        activeMarkerKeyRef.current = null;
        markerHoverRef.current = false;
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
  }, [onTimeRangeChange, markerColor]);

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
          />
        }
      >
        {loading && <ChartWaveLoader height={height} isDarkMode={isDarkMode} />}
        {!loading && (
          <Chart
            echarts={echarts}
            ref={mergedRef}
            options={options as EChartsOption}
            height={height}
            isDarkMode={isDarkMode}
            onEvents={events}
            optionUpdateBehavior={optionUpdateBehavior}
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
              <TooltipContent
                state={tooltipState}
                formatValue={formatFn}
                formatTimestamp={formatTimestamp}
              />
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      )}
    </TooltipPrimitive.Root>
  );
});

TimeseriesChart.displayName = "TimeseriesChart";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function getTimestamps(
  data: TimeseriesData[],
  markers: TimeseriesMarker[] | undefined,
): number[] {
  return [
    ...data.flatMap((series) => series.data.map(([timestamp]) => timestamp)),
    ...(markers?.map((marker) => marker.timestamp) ?? []),
  ];
}

function getAllTooltipRowsAtTimestamp(
  data: TimeseriesData[],
  ts: number,
  legendSelected: Record<string, boolean> | null,
): TooltipRow[] {
  const seenNames = new Set<string>();
  const rows: TooltipRow[] = [];

  for (const s of data) {
    if (seenNames.has(s.name)) continue;
    if (legendSelected && legendSelected[s.name] === false) continue;
    seenNames.add(s.name);
    const value = findNearest(s.data, ts);
    if (value != null) rows.push({ name: s.name, value, color: s.color });
  }

  return rows.sort((a, b) => b.value - a.value);
}

function limitTooltipRows(
  rows: TooltipRow[],
  max: number,
): { rows: TooltipRow[]; hiddenCount: number } {
  return {
    rows: rows.slice(0, max),
    hiddenCount: Math.max(0, rows.length - max),
  };
}

function getTooltipRowsAtTimestamp(
  data: TimeseriesData[],
  ts: number,
  legendSelected: Record<string, boolean> | null,
  max: number,
): { rows: TooltipRow[]; hiddenCount: number } {
  return limitTooltipRows(
    getAllTooltipRowsAtTimestamp(data, ts, legendSelected),
    max,
  );
}

function isSameMarkerTooltipState(
  a: MarkerTooltipState,
  b: MarkerTooltipState,
): boolean {
  return (
    a.ts === b.ts &&
    a.color === b.color &&
    a.hiddenCount === b.hiddenCount &&
    a.rows.length === b.rows.length &&
    isSameTooltipRows(a.rows, b.rows) &&
    a.markers.length === b.markers.length &&
    a.markers.every((marker, i) => {
      const next = b.markers[i];
      return (
        marker.timestamp === next.timestamp &&
        marker.label === next.label &&
        marker.description === next.description &&
        marker.color === next.color &&
        marker.lineStyle === next.lineStyle
      );
    })
  );
}

/** Shallow-compare two tooltip states so React can skip renders when nothing changed. */
function isSameTooltipState(a: TooltipState | null, b: TooltipState): boolean {
  if (!a || a.type !== b.type) return false;

  if (a.type === "marker" && b.type === "marker") {
    return isSameMarkerTooltipState(a, b);
  }
  if (a.type !== "series" || b.type !== "series") return false;

  if (
    a.ts !== b.ts ||
    a.hiddenCount !== b.hiddenCount ||
    a.rows.length !== b.rows.length
  ) {
    return false;
  }
  return isSameTooltipRows(a.rows, b.rows);
}

function isSameTooltipRows(a: TooltipRow[], b: TooltipRow[]): boolean {
  return a.every((row, i) => {
    const next = b[i];
    return (
      row.name === next.name &&
      row.value === next.value &&
      row.color === next.color
    );
  });
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
        className="w-full animate-pulse"
      >
        <path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          style={{
            animation: `kumo-chart-wave 2.4s linear infinite`,
            transformOrigin: "0 0",
          }}
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
