import {
  LayerCard,
  ChartPalette,
  Select,
  TimeseriesChart,
  Switch,
  Table,
  Chart,
} from "@cloudflare/kumo";
import * as echarts from "echarts/core";
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

export function LineChartDemo() {
  const [type, setType] = useState<"line" | "bar" | null>("line");
  const [colorType, setColorType] = useState<string | null>("unique");
  const [timeScale, setTimeScale] = useState<
    "small" | "normal" | "large" | null
  >("normal");
  const [lineCount, setLineCount] = useState<number>(2);
  const [showXLabel, setShowXLabel] = useState(true);
  const [showYLabel, setShowYLabel] = useState(true);
  const [showBefore, setShowBefore] = useState(false);
  const [showAfter, setShowAfter] = useState(false);
  const [enableTimeChange, setTimeChange] = useState(false);
  const isDarkMode = useIsDarkMode();

  const scaledPoints = useMemo(() => {
    const scale =
      {
        small: 0.0001,
        normal: 1,
        large: 10000,
      }[timeScale ?? "normal"] ?? 1;

    return Array.from({ length: lineCount }).map((_, i) =>
      buildSeriesData(i, 50, 60_000, scale),
    );
  }, [lineCount, timeScale]);

  const scaledData = useMemo(() => {
    const colorFn =
      {
        gray: ChartPalette.grayShade,
        orange: ChartPalette.orangeShade,
        blue: ChartPalette.blueShade,
        unique: ChartPalette.color,
      }[colorType ?? ""] ?? ChartPalette.grayShade;

    return scaledPoints.map((data, i) => ({
      name: "Requests " + (i + 1),
      data: data,
      color: colorFn(i, lineCount),
    }));
  }, [colorType, lineCount, scaledPoints]);

  const code = useMemo(() => {
    const colorMethod = (idx: number) => {
      if (colorType === "unique") {
        return `ChartPalette.color(${idx})`;
      } else {
        const colorName: Record<string, string> = {
          gray: "grayShade",
          orange: "orangeShade",
          blue: "blueShade",
        };

        return `ChartPalette.${colorName[colorType ?? ""]}(${idx}, ${lineCount})`;
      }
    };

    const dataPart = Array.from({ length: lineCount }).map((_, idx) => {
      return `{ name: "Requests ${idx + 1}", data: [....], color: ${colorMethod(idx)}},`;
    });

    const properties: Record<string, string> = {
      data: "{data}",
    };

    if (showXLabel) properties.xAxisName = '"Timezone (WET)"';
    if (showYLabel) properties.yAxisName = '"Requests"';

    const showBeforeMs = scaledData[0].data[2][0] ?? 0;
    const showAfterMs =
      scaledData[0].data[scaledData[0].data.length - 3][0] ?? 0;

    if (showBefore) properties.incomplete = `{{before: ${showBeforeMs}}}`;
    if (showAfter) properties.incomplete = `{{after: ${showAfterMs}}}`;
    if (showBefore && showAfter)
      properties.incomplete = `{{before: ${showBeforeMs}, after: ${showAfterMs}}}`;

    if (enableTimeChange)
      properties.onTimeRangeChange =
        "(from, to) => { alert(`From: ${from}, To: ${to}`) }";

    const componentPart = `<TimeseriesChart
  ${Object.entries(properties)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n  ")}
/>`;

    return `import { ChartPalette, TimeseriesChart } from "@cloudflare/kumo"

const data = [
  ${dataPart.join("\n  ")}
];

${componentPart}
`;
  }, [
    lineCount,
    colorType,
    showXLabel,
    showYLabel,
    showBefore,
    showAfter,
    enableTimeChange,
    scaledData,
  ]);

  return (
    <LayerCard>
      <LayerCard.Secondary>Timeseries Chart</LayerCard.Secondary>
      <LayerCard.Primary className="p-0">
        <div className="p-4">
          <TimeseriesChart
            echarts={echarts}
            isDarkMode={isDarkMode}
            type={type ?? "line"}
            data={scaledData}
            yAxisName={showYLabel ? "Requests" : undefined}
            xAxisName={showXLabel ? "Timezone (WET)" : undefined}
            incomplete={{
              before: showBefore ? (scaledData[0].data[2][0] ?? 0) : undefined,
              after: showAfter
                ? (scaledData[0].data[scaledData[0].data.length - 3][0] ?? 0)
                : undefined,
            }}
            onTimeRangeChange={
              enableTimeChange
                ? (from, to) => {
                    alert(`From: ${from}\nTo: ${to}`);
                  }
                : undefined
            }
          />
        </div>

        <div className="items-center gap-4 border-t border-kumo-line">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Property</Table.Head>
                <Table.Head>Controls</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Appearance</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Select
                      value={colorType}
                      onValueChange={setColorType}
                      items={[
                        {
                          label: "Unique",
                          value: "unique",
                        },
                        {
                          label: "Gray Shading",
                          value: "gray",
                        },

                        {
                          label: "Orange Shading",
                          value: "orange",
                        },
                        {
                          label: "Blue Shading",
                          value: "blue",
                        },
                      ]}
                    >
                      <Select.Option value="unique">
                        <div className="flex items-center gap-2">
                          <div
                            className="size-3 rounded-full"
                            style={{
                              background: `linear-gradient(to right, blue, gray, orange)`,
                            }}
                          />
                          Unique
                        </div>
                      </Select.Option>
                      <Select.Option value="gray">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-3 rounded-full"
                            style={{ backgroundColor: "gray" }}
                          />
                          Gray
                        </div>
                      </Select.Option>
                      <Select.Option value="orange">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-3 rounded-full"
                            style={{ backgroundColor: "orange" }}
                          />
                          Orange
                        </div>
                      </Select.Option>
                      <Select.Option value="blue">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-3 rounded-full"
                            style={{ backgroundColor: "blue" }}
                          />
                          Blue
                        </div>
                      </Select.Option>
                    </Select>

                    <Select
                      value={type}
                      onValueChange={setType}
                      items={[
                        { label: "Line", value: "line" },
                        { label: "Bar", value: "bar" },
                      ]}
                    >
                      <Select.Option value="line">Line</Select.Option>
                      <Select.Option value="bar">Bar</Select.Option>
                    </Select>
                  </div>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Random Series</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Select
                      value={timeScale}
                      onValueChange={setTimeScale}
                      items={[
                        { label: "Small", value: "small" },
                        { label: "Normal", value: "normal" },
                        { label: "Large", value: "large" },
                      ]}
                    >
                      <Select.Option value="small">Small</Select.Option>
                      <Select.Option value="normal">Normal</Select.Option>
                      <Select.Option value="large">Large</Select.Option>
                    </Select>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={lineCount}
                      onChange={(e) => {
                        setLineCount(Number(e.currentTarget.value));
                      }}
                      id="myRange"
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Axis Label</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Switch
                      size="sm"
                      label="Show X Axis Label"
                      checked={showXLabel}
                      onCheckedChange={setShowXLabel}
                    />
                    <Switch
                      size="sm"
                      label="Show Y Axis Label"
                      checked={showYLabel}
                      onCheckedChange={setShowYLabel}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Time Range Selection</Table.Cell>
                <Table.Cell>
                  <Switch
                    size="sm"
                    label="Enable Time Filter"
                    checked={enableTimeChange}
                    onCheckedChange={setTimeChange}
                  />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Incomplete</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Switch
                      size="sm"
                      label="Before"
                      checked={showBefore}
                      onCheckedChange={setShowBefore}
                    />
                    <Switch
                      size="sm"
                      label="After"
                      checked={showAfter}
                      onCheckedChange={setShowAfter}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </LayerCard.Primary>
    </LayerCard>
  );
}

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
      }) as echarts.EChartsCoreOption,
    [],
  );

  return <Chart echarts={echarts} options={options} height={400} />;
}

export function ChartColorDemo() {
  const ColorName = [
    "Attention",
    "Warning",
    "Neutral",
    "NeutralLight",
    "Disabled",
    "DisabledLight",
  ];

  return (
    <div className="flex flex-col gap-4">
      <LayerCard>
        <LayerCard.Secondary>Colors</LayerCard.Secondary>
        <LayerCard.Primary className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Semantic Color</Table.Head>
                <Table.Head>Light</Table.Head>
                <Table.Head>Dark</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ColorName.map((name) => (
                <Table.Row key={name}>
                  <Table.Cell>{name}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          backgroundColor: ChartPalette.semantic(name as any),
                        }}
                        className="-m-1 size-6 rounded p-1"
                      />
                      <span className="ml-1 font-mono text-xs">
                        {ChartPalette.semantic(name as any)}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell></Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </LayerCard.Primary>
      </LayerCard>

      <LayerCard>
        <LayerCard.Secondary>Categorical Colors</LayerCard.Secondary>
        <LayerCard.Primary>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, groupIdx) => (
              <div key={groupIdx} className="space-y-2">
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const colorIdx = groupIdx * 5 + idx;
                    return (
                      <div
                        key={colorIdx}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          style={{
                            backgroundColor: ChartPalette.color(colorIdx),
                          }}
                          className="size-8 rounded border border-kumo-line"
                        />
                        <span className="text-xs text-kumo-subtle">
                          {colorIdx + 1}
                        </span>
                        <span className="font-mono text-xs text-kumo-default">
                          {ChartPalette.color(colorIdx)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </LayerCard.Primary>
      </LayerCard>
    </div>
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
        color: ChartPalette.semantic("Neutral"),
      },
      {
        name: "Errors",
        data: buildSeriesData(1, 50, 60_000, 0.3),
        color: ChartPalette.semantic("Attention"),
      },
    ],
    [],
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
        color: ChartPalette.semantic("Neutral"),
      },
      {
        name: "Errors",
        data: buildSeriesData(1, 30, 60_000, 0.3),
        color: ChartPalette.semantic("Attention"),
      },
    ],
    [],
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
        color: ChartPalette.color(0),
      },
    ],
    [],
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
        color: ChartPalette.color(0),
      },
    ],
    [],
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
      }) as echarts.EChartsCoreOption,
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
