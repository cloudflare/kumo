import { ChartPalette, Chart, LayerCard, Table } from "@cloudflare/kumo";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { BarChart, HeatmapChart, LineChart, PieChart } from "echarts/charts";
import { useEffect, useMemo, useState } from "react";
import {
  AriaComponent,
  AxisPointerComponent,
  BrushComponent,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { LabelLayout, UniversalTransition } from "echarts/features";

echarts.use([
  BarChart,
  HeatmapChart,
  LineChart,
  PieChart,
  AxisPointerComponent,
  BrushComponent,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  AriaComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

// ─── Theme mode detection ─────────────────────────────────────────────────────

type ThemeMode = "dark" | "light";

const THEME_MODE_ATTRS = ["data-mode", "class"] as const;

function getModeFromElement(element: Element | null): ThemeMode | null {
  if (!element) return null;

  const mode = element.getAttribute("data-mode");
  if (mode === "dark" || mode === "light") return mode;

  if (element.classList.contains("dark")) return "dark";
  if (element.classList.contains("light")) return "light";

  return null;
}

function getThemeModeFromDom(): ThemeMode | null {
  return (
    getModeFromElement(document.documentElement) ??
    getModeFromElement(document.body)
  );
}

function useIsDarkMode() {
  const getIsDarkMode = () => {
    if (typeof document === "undefined") return false;
    const mode = getThemeModeFromDom();
    if (mode) return mode === "dark";
    return (
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
    );
  };

  const [isDark, setIsDark] = useState(getIsDarkMode);

  useEffect(() => {
    const update = () => setIsDark(getIsDarkMode());
    const observer = new MutationObserver(update);

    [document.documentElement, document.body].forEach((node) => {
      if (!node) return;
      observer.observe(node, {
        attributes: true,
        attributeFilter: [...THEME_MODE_ATTRS],
      });
    });

    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (mql) {
      mql.addEventListener("change", update);
    }

    return () => {
      observer.disconnect();
      if (mql) {
        mql.removeEventListener("change", update);
      }
    };
  }, []);

  return isDark;
}

// ─── Chart example data ─────────────────

// 6-series line — requests by region over 7 days at 6-hour granularity
const SIX_SERIES = ["US", "EU", "APAC", "LATAM", "MEA", "Other"];
const REGION_BASELINES = [4820, 3610, 2190, 1120, 640, 870]; // req/s order of magnitude
const LINE_TIMESTAMPS = (() => {
  const end = Date.now();
  const step = 6 * 60 * 60 * 1000; // 6-hour buckets
  return Array.from({ length: 28 }, (_, i) => end - (27 - i) * step);
})();

// ─── Donut — traffic share by country ────────────────────────────────────────
const COUNTRY_SLICES = [
  { name: "United States", value: 2000 },
  { name: "United Kingdom", value: 1500 },
  { name: "Germany", value: 1000 },
  { name: "France", value: 500 },
  { name: "Japan", value: 300 },
  { name: "Canada", value: 250 },
];

// ─── Stacked bar — cache status breakdown ────────────────────────────────────

const BAR_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Daily cache status counts — Hit dominates (healthy cache), Miss/Expired are minority
const CACHE_DATA: Record<string, number[]> = {
  Hit: [18200, 19400, 21000, 20500, 22100, 16800, 15200],
  Miss: [4200, 4800, 5100, 4900, 5300, 3900, 3600],
  Revalidated: [2800, 3100, 3300, 3200, 3500, 2600, 2400],
  Expired: [1100, 1200, 1300, 1250, 1400, 1050, 950],
  Unknown: [900, 1000, 1100, 1050, 1150, 850, 780],
};

const HEATMAP_HOURS = ["00:00", "06:00", "12:00", "18:00"];
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_VALUES = [
  [4, 12, 24, 36],
  [6, 14, 26, 38],
  [8, 16, 28, 40],
  [10, 18, 30, 42],
  [12, 20, 32, 44],
  [14, 22, 34, 46],
  [16, 24, 36, 48],
];

function buildSeriesData(dataKey: keyof typeof CACHE_DATA) {
  return CACHE_DATA[dataKey];
}

const LINE_STYLE_BY_SERIES: Record<string, "solid" | "dashed" | "dotted"> = {
  US: "dashed",
  EU: "solid",
  APAC: "dashed",
  LATAM: "solid",
  MEA: "dotted",
  Other: "solid",
};

type SemanticColorName =
  | "Attention"
  | "Warning"
  | "Success"
  | "Neutral"
  | "Disabled"
  | "Skeleton";

const semanticColorNames: SemanticColorName[] = [
  "Attention",
  "Warning",
  "Success",
  "Neutral",
  "Disabled",
  "Skeleton",
];

const categoricalColorIndices = Array.from({ length: 6 }, (_, i) => i);

const DEUTERANOPIA_MATRIX = [
  [0.367, 0.861, -0.228],
  [0.28, 0.673, 0.047],
  [-0.012, 0.043, 0.969],
] as const;

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const chunk = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : normalized;

  const r = Number.parseInt(chunk.slice(0, 2), 16);
  const g = Number.parseInt(chunk.slice(2, 4), 16);
  const b = Number.parseInt(chunk.slice(4, 6), 16);
  return [r, g, b];
}

function rgbToHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function srgbToLinear(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number) {
  const clamped = Math.max(0, Math.min(1, channel));
  const encoded = clamped <= 0.0031308
    ? clamped * 12.92
    : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return encoded * 255;
}

function simulateCvdHex(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const matrix = DEUTERANOPIA_MATRIX;
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const simulated: [number, number, number] = [
    linearToSrgb(matrix[0][0] * lr + matrix[0][1] * lg + matrix[0][2] * lb),
    linearToSrgb(matrix[1][0] * lr + matrix[1][1] * lg + matrix[1][2] * lb),
    linearToSrgb(matrix[2][0] * lr + matrix[2][1] * lg + matrix[2][2] * lb),
  ];

  return rgbToHex(simulated);
}

const COLOR_SYSTEM_ROWS = [
  {
    system: "Semantic",
    when: "Data has inherent polarity — good/bad, pass/fail, blocked/allowed",
    task: "Evaluate",
    examples: "WAF actions, Web Vitals, error rates, TLS versions",
  },
  {
    system: "Categorical",
    when: "Nominal categories with no inherent order or polarity",
    task: "Identify",
    examples: "Countries, URLs, ASNs, worker versions, service names",
  },
  {
    system: "Sequential",
    when: "Single metric varying in magnitude — more = darker",
    task: "Read magnitude",
    examples: "Choropleth maps, heatmaps, bot score histograms",
  },
];

const semantic = (name: SemanticColorName, isDarkMode = false) =>
  ChartPalette.semantic(name, isDarkMode);

/**
 * Semantic colour tokens table — Attention, Warning, Success, Neutral,
 * Disabled, Skeleton. Shows values for the active theme only.
 */
export function SemanticColorsDemo() {
  const isDarkMode = useIsDarkMode();

  return (
    <LayerCard>
      <LayerCard.Secondary className="!p-0 !m-0">
        <Table layout="fixed" className="!p-0 !m-0">
          <Table.Body>
            <Table.Row>
              {semanticColorNames.map((name) => (
                <Table.Cell key={name} className="whitespace-nowrap w-1/6">
                  {name}
                </Table.Cell>
              ))}
            </Table.Row>
          </Table.Body>
        </Table>
      </LayerCard.Secondary>
      <LayerCard.Primary className="!p-0 !m-0">
        <Table layout="fixed" className="!p-0 !m-0">
          <Table.Body>
            <Table.Row>
              {semanticColorNames.map((name) => {
                const color = semantic(name, isDarkMode);
                return (
                  <Table.Cell key={name} className="w-1/6">
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: color }}
                        className="size-5 rounded"
                      />
                      <span className="font-mono text-xs">{color}</span>
                    </div>
                  </Table.Cell>
                );
              })}
            </Table.Row>
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Categorical colour palette table — 6 slots indexed 0–5.
 * Shows values for the active theme only.
 */
export function CategoricalColorsDemo() {
  const isDarkMode = useIsDarkMode();

  return (
    <LayerCard>
      <LayerCard.Secondary className="!p-0 !m-0">
        <Table layout="fixed" className="!p-0 !m-0">
          <Table.Body>
            <Table.Row>
              {categoricalColorIndices.map((colorIdx) => (
                <Table.Cell key={colorIdx} className="whitespace-nowrap w-1/6">
                  {colorIdx}
                </Table.Cell>
              ))}
            </Table.Row>
          </Table.Body>
        </Table>
      </LayerCard.Secondary>
      <LayerCard.Primary className="!p-0 !m-0">
        <Table layout="fixed" className="!p-0 !m-0">
          <Table.Body>
            <Table.Row>
              {categoricalColorIndices.map((colorIdx) => {
                const color = String(ChartPalette.categorical(colorIdx, isDarkMode));
                return (
                  <Table.Cell key={colorIdx} className="w-1/6">
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: color }}
                        className="size-5 rounded"
                      />
                      <span className="font-mono text-xs">{color}</span>
                    </div>
                  </Table.Cell>
                );
              })}
            </Table.Row>
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Deuteranopia simulation for categorical palette readability.
 */
export function CategoricalCvdDemo() {
  const isDarkMode = useIsDarkMode();

  const baseColors = useMemo(
    () =>
      categoricalColorIndices.map((index) =>
        String(ChartPalette.categorical(index, isDarkMode)),
      ),
    [isDarkMode],
  );

  const simulatedColors = useMemo(
    () => baseColors.map((hex) => simulateCvdHex(hex)),
    [baseColors],
  );

  return (
    <LayerCard>
      <LayerCard.Secondary className="!p-0 !m-0">
        <Table layout="fixed" className="!p-0 !m-0">
          <Table.Body>
            <Table.Row>
              {categoricalColorIndices.map((colorIdx) => (
                <Table.Cell key={colorIdx} className="whitespace-nowrap w-1/6">
                  {colorIdx}
                </Table.Cell>
              ))}
            </Table.Row>
          </Table.Body>
        </Table>
      </LayerCard.Secondary>
      <LayerCard.Primary className="!p-0 !m-0">
        <Table layout="fixed" className="!p-0 !m-0">
          <Table.Body>
            <Table.Row>
              {simulatedColors.map((color, index) => (
                <Table.Cell key={`deuteranopia-${index}`} className="text-center w-1/6">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: color }}
                      className="size-5 rounded"
                    />
                    <span className="font-mono text-xs">{color}</span>
                  </div>
                </Table.Cell>
              ))}
            </Table.Row>
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Sequential colour scale table — 5 steps derived from the first categorical
 * colour (index 0). Uses light-mode ordering in light theme and inverted
 * ordering in dark theme (step 1 = darkest).
 */
export function SequentialColorsDemo() {
  const isDarkMode = useIsDarkMode();
  const scale = ChartPalette.sequential("blues", isDarkMode);

  return (
    <LayerCard>
      <LayerCard.Secondary className="!p-0 !m-0">
        <Table layout="fixed" className="!p-0 !m-0">
          <Table.Body>
            <Table.Row>
              {scale.map((_, i) => (
                <Table.Cell key={i} className="whitespace-nowrap w-1/5">
                  {`Step ${i + 1}`}
                </Table.Cell>
              ))}
            </Table.Row>
          </Table.Body>
        </Table>
      </LayerCard.Secondary>
      <LayerCard.Primary className="!p-0 !m-0">
        <Table layout="fixed" className="!p-0 !m-0">
          <Table.Body>
            <Table.Row>
              {scale.map((hex, i) => (
                <Table.Cell key={i} className="w-1/5">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: hex }}
                      className="size-5 rounded"
                    />
                    <span className="font-mono text-xs">{hex}</span>
                  </div>
                </Table.Cell>
              ))}
            </Table.Row>
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Heatmap example showing how sequential colours encode magnitude.
 */
export function SequentialHeatmapDemo() {
  const isDarkMode = useIsDarkMode();
  const scale = ChartPalette.sequential("blues", isDarkMode);

  const maxValue = useMemo(
    () => Math.max(...HEATMAP_VALUES.flatMap((row) => row)),
    [],
  );

  const data = useMemo(
    () =>
      HEATMAP_DAYS.flatMap((day, dayIndex) =>
        HEATMAP_HOURS.map((hour, hourIndex) => [
          hourIndex,
          dayIndex,
          HEATMAP_VALUES[dayIndex][hourIndex],
        ] as [number, number, number]),
      ),
    [],
  );

  const visualPieces = useMemo(() => {
    const stepSize = Math.max(1, Math.ceil((maxValue + 1) / scale.length));
    return scale.map((color, i) => {
      const min = i * stepSize;
      const max = i === scale.length - 1 ? maxValue : (i + 1) * stepSize - 1;
      return {
        min,
        max,
        color,
        label: `${min}–${max}`,
      };
    });
  }, [maxValue, scale]);

  const options = useMemo(
    (): EChartsOption => ({
      backgroundColor: "transparent",
      grid: { left: 72, right: 24, top: 20, bottom: 70 },
      tooltip: {
        appendToBody: true,
        confine: false,
        position: "top",
        formatter: (params) => {
          const p = Array.isArray(params) ? params[0] : params;
          const point = p?.data as [number, number, number] | undefined;
          if (!point) return "";
          const [hourIndex, dayIndex, value] = point;
          const day = HEATMAP_DAYS[dayIndex] ?? "";
          const hour = HEATMAP_HOURS[hourIndex] ?? "";
          return `${day} ${hour}<br/>Request density: ${value}`;
        },
      },
      xAxis: {
        type: "category",
        data: HEATMAP_HOURS,
        splitArea: { show: true },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: "category",
        data: HEATMAP_DAYS,
        splitArea: { show: true },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      visualMap: {
        type: "piecewise",
        show: true,
        dimension: 2,
        orient: "horizontal",
        left: "center",
        bottom: 16,
        itemWidth: 16,
        itemHeight: 10,
        textStyle: { fontSize: 11 },
        pieces: visualPieces,
      },
      series: [
        {
          type: "heatmap",
          data,
          label: { show: false },
          itemStyle: {
            borderColor: isDarkMode ? "#1F2937" : "#bcd8fa",
            borderWidth: 0.5,
          },
        },
      ],
    }),
    [data, isDarkMode, visualPieces],
  );

  return (
    <LayerCard>
      <LayerCard.Secondary>
        Heatmap — request density by day and hour (sequential scale)
      </LayerCard.Secondary>
      <LayerCard.Primary className="!overflow-visible">
        <Chart
          echarts={echarts}
          options={options}
          height={300}
          isDarkMode={isDarkMode}
        />
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * 6-series line chart using the full categorical palette.
 */
export function CategoricalLineChartDemo() {
  const isDarkMode = useIsDarkMode();

  const seriesData = useMemo(
    () =>
      SIX_SERIES.map((name, i) => ({
        name,
        data: LINE_TIMESTAMPS.map(
          (ts, j) =>
            [
              ts,
              Math.max(
                0,
                Math.round(
                  REGION_BASELINES[i] * (0.8 + 0.4 * Math.sin(j * 0.4 + i)) +
                    (Math.random() - 0.5) * REGION_BASELINES[i] * 0.15,
                ),
              ),
            ] as [number, number],
        ),
        color: String(ChartPalette.categorical(i, isDarkMode)),
      })),
    [isDarkMode],
  );

  const options = useMemo(
    (): EChartsOption => ({
      backgroundColor: "transparent",
      legend: {
        top: 4,
        left: 0,
        itemWidth: 10,
        itemHeight: 10,
        icon: "circle",
        textStyle: { fontSize: 11 },
      },
      grid: { left: 56, right: 16, top: 40, bottom: 40 },
      tooltip: {
        trigger: "axis",
        appendToBody: true,
        confine: false,
      },
      xAxis: {
        type: "time",
        name: "Time (UTC)",
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        name: "Requests",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { type: "dashed", opacity: 0.5 } },
      },
      series: seriesData.map((s) => ({
        name: s.name,
        type: "line",
        data: s.data,
        color: s.color,
        showSymbol: false,
        lineStyle: {
          width: 2,
          type: LINE_STYLE_BY_SERIES[s.name] ?? "solid",
        },
      })),
    }),
    [seriesData],
  );

  return (
    <LayerCard>
      <LayerCard.Secondary>Line chart — requests by region</LayerCard.Secondary>
      <LayerCard.Primary className="!overflow-visible">
        <Chart
          echarts={echarts}
          options={options}
          height={260}
          isDarkMode={isDarkMode}
        />
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Stacked bar chart using semantic tokens — cache status has inherent polarity
 * (Hit=success, Miss=danger, Revalidated=neutral, Expired=warning, Unknown=disabled).
 */
export function CategoricalBarChartDemo() {
  const isDarkMode = useIsDarkMode();
  const seriesData = useMemo(
    () => [
      {
        name: "Hit",
        data: buildSeriesData("Hit"),
        color: String(ChartPalette.semantic("Success", isDarkMode)),
        type: "bar" as const,
        stack: "total" as const,
        barWidth: 28,
      },
      {
        name: "Miss",
        data: buildSeriesData("Miss"),
        color: String(ChartPalette.semantic("Attention", isDarkMode)),
        type: "bar" as const,
        stack: "total" as const,
        barWidth: 28,
      },
      {
        name: "Revalidated",
        data: buildSeriesData("Revalidated"),
        color: String(ChartPalette.semantic("Neutral", isDarkMode)),
        type: "bar" as const,
        stack: "total" as const,
        barWidth: 28,
      },
      {
        name: "Expired",
        data: buildSeriesData("Expired"),
        color: String(ChartPalette.semantic("Warning", isDarkMode)),
        type: "bar" as const,
        stack: "total" as const,
        barWidth: 28,
      },
      {
        name: "Unknown",
        data: buildSeriesData("Unknown"),
        color: String(ChartPalette.semantic("Disabled", isDarkMode)),
        type: "bar" as const,
        stack: "total" as const,
        barWidth: 28,
      },
    ],
    [isDarkMode],
  );

  const options = useMemo(
    (): EChartsOption => ({
      // Cache status has inherent polarity — semantic tokens, not categorical palette
      backgroundColor: "transparent",
      grid: { left: 56, right: 16, top: 40, bottom: 40 },
      legend: {
        top: 4,
        left: 0,
        itemWidth: 10,
        itemHeight: 10,
        icon: "circle",
        textStyle: { fontSize: 11 },
      },
      tooltip: {
        trigger: "axis",
        appendToBody: true,
        confine: false,
      },
      xAxis: {
        type: "category",
        data: BAR_LABELS,
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { type: "dashed", opacity: 0.5 } },
      },
      series: seriesData,
    }),
    [seriesData],
  );

  return (
    <LayerCard>
      <LayerCard.Secondary>
        Bar chart — cache status by day (semantic tokens)
      </LayerCard.Secondary>
      <LayerCard.Primary className="!overflow-visible">
        <Chart
          echarts={echarts}
          options={options}
          height={260}
          isDarkMode={isDarkMode}
        />
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Donut chart using the categorical palette — shows how colours read at segment scale.
 */
export function CategoricalDonutChartDemo() {
  const isDarkMode = useIsDarkMode();

  const options = useMemo(
    (): EChartsOption => ({
      color: COUNTRY_SLICES.map((_, i) =>
        String(ChartPalette.categorical(i, isDarkMode)),
      ),
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} req ({d}%)",
        appendToBody: true,
        confine: false,
      },
      series: [
        {
          type: "pie",
          radius: ["42%", "70%"],
          data: COUNTRY_SLICES,
          label: { show: true, formatter: "{b}" },
        },
      ],
    }),
    [isDarkMode],
  );

  return (
    <LayerCard>
      <LayerCard.Secondary>
        Donut chart — traffic by country
      </LayerCard.Secondary>
      <LayerCard.Primary className="!overflow-visible">
        <Chart
          echarts={echarts}
          options={options}
          height={300}
          isDarkMode={isDarkMode}
        />
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Quick reference table explaining when to use each colour system.
 */
export function ChartColorSystemsDemo() {
  return (
    <LayerCard>
      <LayerCard.Secondary className="!m-0 !p-0" />
      <Table className="!m-0 !p-0 [&_tbody]:text-sm [&_tbody]:font-medium [&_tbody]:text-kumo-default">
        <colgroup>
          <col className="w-[14%]" />
          <col className="w-[38%]" />
          <col className="w-[16%]" />
          <col className="w-[32%]" />
        </colgroup>
        <Table.Body>
          <Table.Row>
            <Table.Cell>System</Table.Cell>
            <Table.Cell>When to use</Table.Cell>
            <Table.Cell>User task</Table.Cell>
            <Table.Cell>Examples</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <LayerCard.Primary className="!p-0 !m-0">
        <Table layout="fixed" className="!p-0 !m-0 w-full [&_td]:align-top [&_td]:text-kumo-default">
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[38%]" />
            <col className="w-[16%]" />
            <col className="w-[32%]" />
          </colgroup>
          <Table.Body>
            {COLOR_SYSTEM_ROWS.map(({ system, when, task, examples }) => (
              <Table.Row key={system}>
                <Table.Cell>{system}</Table.Cell>
                <Table.Cell>{when}</Table.Cell>
                <Table.Cell>{task}</Table.Cell>
                <Table.Cell>{examples}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Both semantic and categorical colour tables combined — used on the Charts
 * overview page at the Coloring section.
 */
export function ColorDemo() {
  return (
    <>
      <SemanticColorsDemo />
      <CategoricalColorsDemo />
    </>
  );
}
