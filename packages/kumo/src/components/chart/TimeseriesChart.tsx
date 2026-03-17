import type * as echarts from "echarts/core";
import type { LineSeriesOption, BarSeriesOption } from "echarts/charts";
import type { EChartsOption } from "echarts";
import { useEffect, useMemo, useRef } from "react";
import { Chart, ChartEvents } from "./EChart";

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
  /** Indicates incomplete data periods with optional before/after timestamps in ms */
  incomplete?: { before?: number; after?: number };
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
export function TimeseriesChart({
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
  height = 350,
  incomplete,
  isDarkMode,
  gradient,
  loading,
}: TimeseriesChartProps) {
  const chartRef = useRef<echarts.ECharts | null>(null);
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
      },
      brush: {
        snapToData: true,
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
        axisPointer: { type: "shadow" as const },
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];

          // Track seen series names to avoid duplicates in tooltip
          // This is needed because incomplete data series (dashed lines) and complete data series
          // can overlap at the same timestamp, causing duplicate entries in the tooltip
          const seenNames = new Set<string>();
          const filteredParams = items.filter((param: any) => {
            if (seenNames.has(param.seriesName)) return false;
            seenNames.add(param.seriesName);
            return true;
          });

          const first = filteredParams[0];
          const ts = first?.value?.[0] ?? first?.axisValue;
          const header =
            ts != null
              ? `<div style="font-weight:600;margin-bottom:4px;">${formatTimestamp(ts)}</div>`
              : "";

          const rows = filteredParams
            .map((param: any) => {
              const value = param?.value?.[1];
              const formatFn = tooltipValueFormat ?? yAxisTickLabelFormat;
              return `${param.marker} ${param.seriesName}: <strong>${formatFn ? formatFn(value) : value}</strong>`;
            })
            .join("<br/>");

          return `${header}${rows}`;
        },
      },
      backgroundColor: "transparent",
      toolbox: { show: false },
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
      series: transformSeries,
    };
  }, [
    data,
    xAxisName,
    xAxisTickCount,
    xAxisTickFormat,
    yAxisTickFormat,
    yAxisTickLabelFormat,
    yAxisName,
    yAxisTickCount,
    tooltipValueFormat,
    incompleteBefore,
    incompleteAfter,
    type,
    gradient,
    echarts,
  ]);

  const events = useMemo<Partial<ChartEvents>>(() => {
    if (!onTimeRangeChange) return {};

    return {
      brushend: (params) => {
        const range = params.areas[0].coordRange;
        onTimeRangeChange(range[0], range[1]);
        chartRef.current?.dispatchAction({ type: "brush", areas: [] });
      },
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

  return (
    <div className="relative w-full" style={{ height }}>
      {loading && <ChartWaveLoader height={height} isDarkMode={isDarkMode} />}
      {!loading && (
        <Chart
          echarts={echarts}
          ref={chartRef}
          options={options as EChartsOption}
          height={height}
          isDarkMode={isDarkMode}
          onEvents={events}
        />
      )}
    </div>
  );
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

/** Zero-pads a number to two digits (e.g. `5` → `"05"`) */
function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/**
 * Formats a timestamp as `"YYYY-MM-DD HH:mm:ss"` for use in chart tooltips.
 * Accepts a Unix timestamp in milliseconds, an ISO date string, or a `Date` object.
 */
function formatTimestamp(ts: number | string | Date): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
