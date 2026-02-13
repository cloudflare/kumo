import type * as echarts from "echarts/core";
import type { LineSeriesOption, BarSeriesOption } from "echarts/charts";
import type { EChartsOption } from "echarts";
import { useEffect, useMemo, useRef } from "react";
import { Chart, ChartEvents } from "./EChart";

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
        splitNumber: 5,
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

function formatTimestamp(ts: number | string | Date): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
