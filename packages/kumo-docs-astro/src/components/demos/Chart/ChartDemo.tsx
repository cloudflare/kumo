import { ChartPalette, TimeseriesChart, Chart } from "@cloudflare/kumo";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import { useEffect, useMemo, useState } from "react";
import {
  AriaComponent,
  AxisPointerComponent,
  BrushComponent,
  GridComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  AxisPointerComponent,
  BrushComponent,
  GridComponent,
  TooltipComponent,
  CanvasRenderer,
  AriaComponent,
]);

export function PieChartDemo() {
  const options = useMemo(
    () =>
      ({
        toolbox: {
          show: false,
        },
        series: [
          {
            type: "pie",
            data: [
              { value: 101, name: "Series A" },
              { value: 202, name: "Series B" },
              { value: 303, name: "Series C" },
              { value: 404, name: "Series D" },
              { value: 505, name: "Series E" },
            ],
          },
        ],
      }) as EChartsOption,
    [],
  );

  return <Chart echarts={echarts} options={options} height={400} />;
}

/**
 * Basic line chart example showing simple time-based data visualization.
 */
export function BasicLineChartDemo() {
  const isDarkMode = useIsDarkMode();

  const data = useMemo(
    () => [
      {
        name: "Requests",
        data: buildSeriesData(0, 50, 60_000, 1),
        color: ChartPalette.semantic("Neutral", isDarkMode),
      },
      {
        name: "Errors",
        data: buildSeriesData(1, 50, 60_000, 0.3),
        color: ChartPalette.semantic("Attention", isDarkMode),
      },
    ],
    [isDarkMode],
  );

  return (
    <TimeseriesChart
      echarts={echarts}
      isDarkMode={isDarkMode}
      data={data}
      xAxisName="Time (UTC)"
      yAxisName="Count"
    />
  );
}

export function TimeseriesChartPreviewDemo() {
  const isDarkMode = useIsDarkMode();

  const data = useMemo(
    () => [
      {
        name: "Requests",
        data: buildSeriesData(0, 30, 60_000, 1),
        color: ChartPalette.semantic("Neutral", isDarkMode),
      },
      {
        name: "Errors",
        data: buildSeriesData(1, 30, 60_000, 0.3),
        color: ChartPalette.semantic("Attention", isDarkMode),
      },
    ],
    [isDarkMode],
  );

  return (
    <TimeseriesChart
      yAxisTickNumber={2}
      echarts={echarts}
      isDarkMode={isDarkMode}
      data={data}
      height={160}
    />
  );
}

/**
 * Timeseries chart with incomplete data regions highlighted.
 */
export function IncompleteDataChartDemo() {
  const isDarkMode = useIsDarkMode();

  const data = useMemo(
    () => [
      {
        name: "Bandwidth",
        data: buildSeriesData(0, 50, 60_000, 1),
        color: ChartPalette.color(0, isDarkMode),
      },
    ],
    [isDarkMode],
  );

  const incompleteTimestamp = data[0].data[data[0].data.length - 5][0];

  return (
    <TimeseriesChart
      echarts={echarts}
      isDarkMode={isDarkMode}
      data={data}
      xAxisName="Time (UTC)"
      yAxisName="Mbps"
      incomplete={{ after: incompleteTimestamp }}
    />
  );
}

/**
 * Timeseries chart with time range selection enabled.
 */
export function TimeRangeSelectionChartDemo() {
  const isDarkMode = useIsDarkMode();

  const data = useMemo(
    () => [
      {
        name: "CPU Usage",
        data: buildSeriesData(0, 50, 60_000, 1),
        color: ChartPalette.color(0, isDarkMode),
      },
    ],
    [isDarkMode],
  );

  return (
    <TimeseriesChart
      echarts={echarts}
      isDarkMode={isDarkMode}
      data={data}
      xAxisName="Time (UTC)"
      yAxisName="%"
      onTimeRangeChange={(from, to) => {
        alert(
          `Selected range:\nFrom: ${new Date(from).toLocaleString()}\nTo: ${new Date(to).toLocaleString()}`,
        );
      }}
    />
  );
}

export function PieChartPreviewDemo() {
  const options = useMemo(
    () =>
      ({
        toolbox: {
          show: false,
        },
        series: [
          {
            type: "pie",
            data: [
              { value: 101, name: "Series A" },
              { value: 202, name: "Series B" },
              { value: 303, name: "Series C" },
            ],
          },
        ],
      }) as EChartsOption,
    [],
  );

  return <Chart echarts={echarts} options={options} height={160} />;
}

function buildSeriesData(
  seed = 0,
  points = 50,
  stepMs = 60_000,
  timeScale = 1,
): [number, number][] {
  const end = Date.now();
  const start = end - (points - 1) * stepMs;

  return Array.from({ length: points }, (_, i) => {
    const ts = start + i * stepMs;
    const trend = i * 0.15;
    const noise = (Math.random() - 0.5) * 8;
    const value = Math.round((30 + seed * 15 + trend + noise) * 100) / 100;
    return [ts, value * timeScale];
  });
}

function useIsDarkMode() {
  const getIsDark = () => {
    if (typeof document === "undefined") return false;

    const root = document.documentElement;

    const mode = root.getAttribute("data-mode");
    if (mode === "dark") return true;
    if (mode === "light") return false;

    // 1) Prefer explicit html class contract (Tailwind-style)
    if (root.classList.contains("dark")) return true;
    if (root.classList.contains("light")) return false;

    // 2) Otherwise fall back to system preference
    return (
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
    );
  };

  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    const root = document.documentElement;

    const update = () => setIsDark(getIsDark());

    // Watch html class changes
    const mo = new MutationObserver(update);
    mo.observe(root, {
      attributes: true,
      attributeFilter: ["data-mode", "class"],
    });

    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (mql) {
      mql.addEventListener("change", update);
    }

    return () => {
      if (mql) {
        mql.removeEventListener("change", update);
      }
      mo.disconnect();
    };
  }, []);

  return isDark;
}
