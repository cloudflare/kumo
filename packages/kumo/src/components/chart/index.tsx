import type * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import type { BarSeriesOption, LineSeriesOption } from "echarts/charts";

import { forwardRef, useEffect, useMemo, useRef } from "react";
import { cn } from "../../utils";

type EChartsMouseEventParams = {
  componentType: string;
  seriesType?: string;
  seriesIndex?: number;
  seriesName?: string;
  name?: string;
  dataIndex?: number;
  data?: any;
  dataType?: string;
  value?: number | any[];
  color?: string;
};

interface ChartEvents {
  click: (params: EChartsMouseEventParams) => void;
  dblclick: (params: EChartsMouseEventParams) => void;
  mousedown: (params: EChartsMouseEventParams) => void;
  mousemove: (params: EChartsMouseEventParams) => void;
  mouseup: (params: EChartsMouseEventParams) => void;
  mouseover: (params: EChartsMouseEventParams) => void;
  mouseout: (params: EChartsMouseEventParams) => void;
  globalout: (params: any) => void;
  contextmenu: (params: any) => void;

  legendselectchanged: (params: {
    name: string;
    selected: Record<string, boolean>;
  }) => void;
  legendselected: (params: any) => void;
  legendunselected: (params: any) => void;
  legendscroll: (params: any) => void;

  datazoom: (params: any) => void;
  datarangeselected: (params: any) => void;
  timelinechanged: (params: any) => void;
  timelineplaychanged: (params: any) => void;

  restore: (params: any) => void;
  dataviewchanged: (params: any) => void;
  magictypechanged: (params: any) => void;

  pieselectchanged: (params: any) => void;
  pieselected: (params: any) => void;
  pieunselected: (params: any) => void;

  mapselectchanged: (params: any) => void;
  mapselected: (params: any) => void;
  mapunselected: (params: any) => void;
  geoselectchanged: (params: any) => void;
  geoselected: (params: any) => void;
  geounselected: (params: any) => void;

  axisareaselected: (params: any) => void;

  brush: (params: any) => void;
  brushselected: (params: any) => void;
  brushend: (params: {
    areas: Array<{
      coordRange: any;
      brushType?: string;
      panelId?: string;
      range?: any;
    }>;
  }) => void;
}

interface ChartProps {
  echarts: typeof echarts;
  options: EChartsOption;
  className?: string;
  isDarkMode?: boolean;
  height?: number;
  onEvents?: Partial<ChartEvents>;
}

export const Chart = forwardRef<echarts.ECharts, ChartProps>(function Chart(
  {
    echarts,
    options,
    className,
    isDarkMode,
    height = 350,
    onEvents,
  }: ChartProps,
  ref,
) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const handlersRef = useRef<Partial<ChartEvents>>({});
  const wrappersRef = useRef<Record<string, (params: any) => void>>({});
  const boundEventsRef = useRef<Set<string>>(new Set());

  // Init and cleanup
  useEffect(() => {
    if (!elRef.current) return;

    const chart = echarts.init(
      elRef.current,
      isDarkMode
        ? "dark"
        : {
            color: CHART_COLORS,
          },
    );
    chartRef.current = chart;

    if (typeof ref === "function") ref(chart);
    else if (ref) ref.current = chart;

    return () => {
      for (const event of boundEventsRef.current) {
        const wrapper = wrappersRef.current[event];
        if (wrapper) chart.off(event, wrapper);
      }
      boundEventsRef.current.clear();
      if (typeof ref === "function") ref(null);
      else if (ref) ref.current = null;
      chartRef.current = null;
      chart.dispose();
    };
  }, [elRef, isDarkMode]);

  // Update options
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.setOption(options, { notMerge: true, lazyUpdate: true });
  }, [isDarkMode, options]);

  useEffect(() => {
    handlersRef.current = onEvents ?? {};
  }, [onEvents]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const nextBound = new Set<string>();

    for (const [event, handler] of Object.entries(onEvents ?? {})) {
      if (typeof handler !== "function") continue;
      nextBound.add(event);

      if (!wrappersRef.current[event]) {
        wrappersRef.current[event] = (params: any) => {
          const current = handlersRef.current as Record<
            string,
            ((p: any) => void) | undefined
          >;
          current[event]?.(params);
        };
      }

      if (!boundEventsRef.current.has(event)) {
        chart.on(event, wrappersRef.current[event]);
      }
    }

    for (const event of boundEventsRef.current) {
      if (nextBound.has(event)) continue;
      const wrapper = wrappersRef.current[event];
      if (wrapper) {
        chart.off(event, wrapper);
      }
    }

    boundEventsRef.current = nextBound;
  }, [isDarkMode, onEvents]);

  // Resize handling
  useEffect(() => {
    const chart = chartRef.current;
    const el = elRef.current;
    if (!chart || !el) return;

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <div ref={elRef} className={cn("w-full", className)} style={{ height }} />
  );
});

Chart.displayName = "Chart";

interface TimeSeriesData {
  name: string;
  data: [number, number][];
  color: string;
}

interface TimeSeriesChartProps {
  echarts: typeof echarts;
  type?: "line" | "bar";
  /** Array of time series data to display on the chart */
  data: TimeSeriesData[];
  /** Label for the x-axis (time axis) */
  xAxisName?: string;
  /** Number of ticks to display on the x-axis */
  xAxisTickNumber?: number;
  /** Label for the y-axis (value axis) */
  yAxisName?: string;
  /** Number of ticks to display on the y-axis */
  yAxisTickNumber?: number;
  /** Indicates incomplete data periods with optional before/after timestamps in ms */
  incomplete?: { before?: number; after?: number };
  /** Height of the chart in pixels */
  height?: number;
  /** Callback fired when user selects a time range via brush selection */
  onTimeRangeChange?: (from: number, to: number) => void;
  isDarkMode?: boolean;
}

export function TimeseriesChart({
  echarts,
  type = "line",
  data,
  xAxisName,
  yAxisName,
  yAxisTickNumber,
  onTimeRangeChange,
  height = 350,
  incomplete,
  isDarkMode,
}: TimeSeriesChartProps) {
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
      transformSeries.push({
        data: completePoints,
        color: s.color,
        name: s.name,
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
              return `${param.marker} ${param.seriesName}: <strong>${value}</strong>`;
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
      },
      yAxis: {
        name: yAxisName,
        nameLocation: "middle" as const,
        nameGap: 40,
        type: "value" as const,
        axisTick: { show: true },
        axisLabel: {
          margin: 15,
        },
        splitLine: {
          show: true,
          lineStyle: { type: "dashed" as const, width: 1 },
        },
        splitNumber: yAxisTickNumber,
      },
      grid: {
        left: yAxisName ? 30 : 24,
        right: 24,
        top: 24,
        bottom: xAxisName ? 30 : 24,
      },
      series: transformSeries,
    };
  }, [data, xAxisName, yAxisName, incompleteBefore, incompleteAfter, type]);

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
  }, [chartRef, hasTimeRangeCallback]);

  return (
    <Chart
      echarts={echarts}
      ref={chartRef}
      options={options as EChartsOption}
      height={height}
      isDarkMode={isDarkMode}
      onEvents={events}
    />
  );
}

enum ChartCategoricalLightColors {
  Blue = "#086FFF",
  Violet = "#CF7EE9",
  Cyan = "#73CEE6",
  Indigo = "#5B5FEF",
  LightBlue = "#82B6FF",
  Pink = "#F5609F",
  Indigo3 = "#C2BDF3",
  Violet2 = "#8D1EB1",
  Violet3 = "#EBCAF6",
  Indigo2 = "#7366E4",
}

enum ChartSemanticLightColors {
  Attention = "#FC574A",
  Warning = "#F8A054",
  Neutral = "#82B6FF",
  NeutralLight = "#B9D6FF",
  Disabled = "#B6B6B6",
  DisabledLight = "#D9D9D9",
}

const CHART_COLORS = [
  ChartCategoricalLightColors.Blue,
  ChartCategoricalLightColors.Violet,
  ChartCategoricalLightColors.Cyan,
  ChartCategoricalLightColors.Indigo,
  ChartCategoricalLightColors.LightBlue,
  ChartCategoricalLightColors.Pink,
  ChartCategoricalLightColors.Indigo3,
  ChartCategoricalLightColors.Violet2,
  ChartCategoricalLightColors.Violet3,
  ChartCategoricalLightColors.Indigo2,
];

export class ChartPalette {
  static semantic(
    name:
      | "Attention"
      | "Warning"
      | "Neutral"
      | "NeutralLight"
      | "Disabled"
      | "DisabledLight",
  ) {
    return ChartSemanticLightColors[name];
  }

  static color(index: number) {
    return CHART_COLORS[index % CHART_COLORS.length];
  }

  static orangeShade(index: number, count: number) {
    return shadingColor("#f8a054", index, count);
  }

  static grayShade(index: number, count: number) {
    return shadingColor("#eee", index, count);
  }

  static blueShade(index: number, count: number) {
    return shadingColor("#0051C3", index, count);
  }
}

function shadingColor(baseHex: string, index: number, count: number) {
  const c = Math.max(1, Math.floor(count));
  const i = ((index % c) + c) % c;

  const { r, g, b } = hexToRgb(baseHex);
  const { h, s } = rgbToHsl(r, g, b);

  // Lightness range (tweak to taste)
  const maxL = clamp01(0.72); // lighter
  const minL = clamp01(0.42); // darker

  const t = c === 1 ? 0.5 : i / (c - 1);
  const l = maxL + (minL - maxL) * t;

  // Canvas (and ECharts) will accept hsl() strings
  const hh = Math.round(h);
  const ss = Math.round(s * 100);
  const ll = Math.round(l * 100);
  return `hsl(${hh}, ${ss}%, ${ll}%)`;
}

function formatTimestamp(ts: number | string | Date): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

// returns h in [0..360), s/l in [0..1]
function rgbToHsl(r: number, g: number, b: number) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;

  let h = 0;
  const l = (max + min) / 2;

  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  if (d !== 0) {
    switch (max) {
      case rr:
        h = ((gg - bb) / d) % 6;
        break;
      case gg:
        h = (bb - rr) / d + 2;
        break;
      default:
        h = (rr - gg) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}
