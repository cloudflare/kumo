import {
  ChartPalette,
  TimeseriesChart,
  Chart,
  ChartLegend,
  LayerCard,
} from "@cloudflare/kumo";
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
import { LabelLayout, UniversalTransition } from "echarts/features";

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  AxisPointerComponent,
  BrushComponent,
  GridComponent,
  TooltipComponent,
  AriaComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

export function PieChartDemo() {
  const isDarkMode = useIsDarkMode();

  const options = useMemo<EChartsOption>(
    () =>
      ({
        animation: true,
        animationDuration: 2000,
        tooltip: {
          show: true,
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
      }),
    [],
  );

  return (
    <Chart
      echarts={echarts}
      options={options}
      height={400}
      isDarkMode={isDarkMode}
    />
  );
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

/**
 * Timeseries chart with custom axis tick label formats for both x-axis (HH:MM) and y-axis (compact numbers).
 */
export function CustomAxisLabelFormatDemo() {
  const isDarkMode = useIsDarkMode();

  const data = useMemo(
    () => [
      {
        name: "Requests",
        data: buildSeriesData(0, 50, 60_000, 1000),
        color: ChartPalette.semantic("Neutral", isDarkMode),
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
      yAxisName="Requests"
      xAxisTickFormat={(ts) => {
        const d = new Date(ts);
        return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
      }}
      yAxisTickFormat={(value) => {
        if (value >= 1000) return `${value / 1000}k`;
        return value.toString();
      }}
      tooltipValueFormat={(value) => `${(value / 1000).toFixed(1)}k requests`}
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
      yAxisTickCount={2}
      echarts={echarts}
      isDarkMode={isDarkMode}
      data={data}
      height={160}
    />
  );
}

/**
 * Timeseries chart with gradient fill beneath each line series.
 */
export function GradientLineChartDemo() {
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
      gradient
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
        color: ChartPalette.categorical(0, isDarkMode),
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
        color: ChartPalette.categorical(0, isDarkMode),
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
  const isDarkMode = useIsDarkMode();

  const options = useMemo<EChartsOption>(
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
      }),
    [],
  );

  return (
    <Chart
      echarts={echarts}
      options={options}
      height={160}
      isDarkMode={isDarkMode}
    />
  );
}

/**
 * Legend items with default variant showing semantic colors.
 */
export function LegendDefaultDemo() {
  const isDarkMode = useIsDarkMode();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Active State</h3>

      <div className="flex flex-wrap gap-4 divide-x divide-kumo-hairline">
        <ChartLegend.LargeItem
          name="Requests"
          color={ChartPalette.semantic("Neutral", isDarkMode)}
          value="1,234"
          unit="req/s"
        />
        <ChartLegend.LargeItem
          name="Storage"
          color={ChartPalette.semantic("Attention", isDarkMode)}
          value="56"
          unit="GB"
        />
        <ChartLegend.LargeItem
          name="Warnings"
          color={ChartPalette.semantic("Warning", isDarkMode)}
          value="128"
        />
      </div>

      <h3 className="text-sm font-medium mt-12">Inactive State</h3>

      <div className="flex flex-wrap gap-4 divide-x divide-kumo-hairline">
        <ChartLegend.LargeItem
          name="Requests"
          color={ChartPalette.semantic("Neutral", isDarkMode)}
          value="1,234"
          unit="req/s"
          inactive
        />
        <ChartLegend.LargeItem
          name="Storage"
          color={ChartPalette.semantic("Attention", isDarkMode)}
          value="56"
          unit="GB"
          inactive
        />
        <ChartLegend.LargeItem
          name="Warnings"
          color={ChartPalette.semantic("Warning", isDarkMode)}
          value="128"
          inactive
        />
      </div>
    </div>
  );
}

/**
 * Legend items with compact variant using categorical colors.
 */
export function LegendCompactDemo() {
  const isDarkMode = useIsDarkMode();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Active State</h3>
      <div className="flex flex-wrap gap-4">
        <ChartLegend.SmallItem
          name="Requests"
          color={ChartPalette.semantic("Neutral", isDarkMode)}
          value="1,234"
          unit="req/s"
        />
        <ChartLegend.SmallItem
          name="Storage"
          color={ChartPalette.semantic("Attention", isDarkMode)}
          value="56"
          unit="GB"
        />
        <ChartLegend.SmallItem
          name="Warnings"
          color={ChartPalette.semantic("Warning", isDarkMode)}
          value="128"
        />
      </div>

      <h3 className="text-sm font-medium mt-12">Inactive State</h3>
      <div className="flex flex-wrap gap-4">
        <ChartLegend.SmallItem
          name="Requests"
          color={ChartPalette.semantic("Neutral", isDarkMode)}
          value="1,234"
          unit="req/s"
          inactive
        />
        <ChartLegend.SmallItem
          name="Storage"
          color={ChartPalette.semantic("Attention", isDarkMode)}
          value="56"
          unit="GB"
          inactive
        />
        <ChartLegend.SmallItem
          name="Warnings"
          color={ChartPalette.semantic("Warning", isDarkMode)}
          value="128"
          inactive
        />
      </div>
    </div>
  );
}

/**
 * Timeseries chart rendered as a stacked bar chart.
 */
export function BarChartDemo() {
  const isDarkMode = useIsDarkMode();

  const data = useMemo(
    () => [
      {
        name: "Requests where age > 10",
        data: buildSeriesData(0, 20, 3_600_000, 1),
        color: ChartPalette.semantic("Neutral", isDarkMode),
      },
      {
        name: "Errors",
        data: buildSeriesData(1, 20, 3_600_000, 0.3),
        color: ChartPalette.semantic("Attention", isDarkMode),
      },
    ],
    [isDarkMode],
  );

  return (
    <TimeseriesChart
      echarts={echarts}
      isDarkMode={isDarkMode}
      type="bar"
      data={data}
      xAxisName="Time (UTC)"
      yAxisName="Count"
      tooltipValueFormat={(r) => r.toFixed(2)}
    />
  );
}

/**
 * Timeseries chart in loading state, showing the animated sine-wave skeleton.
 * Loads for 5 seconds then reveals the real chart. A button restarts the cycle.
 */
export function LoadingChartDemo() {
  const isDarkMode = useIsDarkMode();
  return (
    <div className="flex flex-col flex-1 w-full">
      <TimeseriesChart
        echarts={echarts}
        isDarkMode={isDarkMode}
        xAxisName="Time (UTC)"
        yAxisName="Count"
        data={[]}
        loading
      />
    </div>
  );
}

export function ChartExampleDemo() {
  const isDarkMode = useIsDarkMode();

  const data = useMemo(
    () => [
      {
        name: "P99",
        data: buildSeriesData(3, 30, 60_000, 1),
        color: ChartPalette.semantic("Attention", isDarkMode),
      },
      {
        name: "P95",
        data: buildSeriesData(2, 30, 60_000, 0.6),
        color: ChartPalette.semantic("Warning", isDarkMode),
      },
      {
        name: "P75",
        data: buildSeriesData(1, 30, 60_000, 0.4),
        color: ChartPalette.semantic("Neutral", isDarkMode),
      },
      {
        name: "P50",
        data: buildSeriesData(0, 30, 60_000, 0.2),
        color: ChartPalette.semantic("Neutral", isDarkMode),
      },
    ],
    [isDarkMode],
  );

  return (
    <LayerCard>
      <LayerCard.Secondary>Read latency</LayerCard.Secondary>
      <LayerCard.Primary>
        <div className="flex divide-x divide-kumo-hairline gap-4 px-2 mb-2">
          <ChartLegend.LargeItem
            name="P99"
            color={ChartPalette.semantic("Attention", isDarkMode)}
            value="124"
            unit="ms"
          />
          <ChartLegend.LargeItem
            name="P95"
            color={ChartPalette.semantic("Warning", isDarkMode)}
            value="76"
            unit="ms"
          />
          <ChartLegend.LargeItem
            name="P75"
            color={ChartPalette.semantic("Neutral", isDarkMode)}
            value="32"
            unit="ms"
          />
          <ChartLegend.LargeItem
            name="P50"
            color={ChartPalette.semantic("Neutral", isDarkMode)}
            value="10"
            unit="ms"
          />
        </div>
        <TimeseriesChart
          xAxisName="Time (UTC)"
          echarts={echarts}
          isDarkMode={isDarkMode}
          data={data}
          height={300}
        />
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Custom chart with HTML tooltip using dangerousHtmlFormatter.
 * USE WITH CAUTION: Only use dangerousHtmlFormatter for trusted HTML content.
 * Always sanitize any user-provided data using echarts.format.encodeHTML
 * or similar utilities to prevent XSS vulnerabilities.
 */
export function CustomTooltipChartDemo() {
  const isDarkMode = useIsDarkMode();

  const options = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          // IMPORTANT: Always escape ALL dynamic values using encodeHTML
          // from echarts/format before including in HTML. This prevents
          // XSS attacks from malicious data like:
          // { name: "<img src=x onerror=alert('xss')>", value: "..." }
          const safeName = echarts.format.encodeHTML(params.name);
          const safeValue = echarts.format.encodeHTML(String(params.value));
          const safePercent = echarts.format.encodeHTML(
            String(Math.round(params.percent)),
          );

          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${safeName}</div>
              <div>Value: <strong>${safeValue}</strong></div>
              <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">
                ${safePercent}% of total
              </div>
            </div>
          `;
        },
      },
      series: [
        {
          type: "pie",
          data: [
            { value: 101, name: "Series A" },
            { value: 202, name: "Series B" },
            // Malicious series name to demonstrate XSS protection via encodeHTML.
            // Without encoding, this would render an alert popup. With encodeHTML,
            // it safely displays as plain text.
            { value: 150, name: "<img src=x onerror=alert('XSS')>" },
            { value: 303, name: "Series C" },
            { value: 404, name: "Series D" },
          ],
        },
      ],
    }),
    [],
  );

  return (
    <Chart
      echarts={echarts}
      options={options}
      height={400}
      isDarkMode={isDarkMode}
    />
  );
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

function getIsDark() {
  if (typeof document === "undefined") return false;

  const root = document.documentElement;

  const mode = root.getAttribute("data-mode");
  if (mode === "dark") return true;
  if (mode === "light") return false;

  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

function useIsDarkMode() {
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
