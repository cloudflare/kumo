import type * as echarts from "echarts/core";
import type { EChartsOption, SetOptionOpts } from "echarts";
import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../utils";
import { CHART_DARK_COLORS, CHART_LIGHT_COLORS } from "./Color";

/** Parameters passed to mouse event handlers on chart elements */
type EChartsMouseEventParams = {
  /** The type of component that triggered the event (e.g. "series", "markPoint") */
  componentType: string;
  /** Series type (e.g. "line", "bar") — present when componentType is "series" */
  seriesType?: string;
  /** Zero-based index of the series in the option.series array */
  seriesIndex?: number;
  /** Name of the series */
  seriesName?: string;
  /** Name of the data item */
  name?: string;
  /** Zero-based index of the data item within its series */
  dataIndex?: number;
  /** Raw data item value */
  data?: any;
  /** Sub-type of data (e.g. "node", "edge" for graph series) */
  dataType?: string;
  /** Numeric or array value of the data item */
  value?: number | any[];
  /** Resolved color of the series or data item */
  color?: string;
};

/**
 * ECharts event handlers that can be attached to a `Chart`.
 * Pass a subset via the `onEvents` prop; handlers are registered lazily and
 * cleaned up automatically when removed or when the chart is unmounted.
 */
export interface ChartEvents {
  // Mouse events — fired on chart elements (series, marks, etc.)
  click: (params: EChartsMouseEventParams) => void;
  dblclick: (params: EChartsMouseEventParams) => void;
  mousedown: (params: EChartsMouseEventParams) => void;
  mousemove: (params: EChartsMouseEventParams) => void;
  mouseup: (params: EChartsMouseEventParams) => void;
  mouseover: (params: EChartsMouseEventParams) => void;
  mouseout: (params: EChartsMouseEventParams) => void;
  /** Fired when the pointer leaves the chart canvas entirely */
  globalout: (params: any) => void;
  contextmenu: (params: any) => void;

  // Legend events
  /** Fired when any legend item's selected state changes */
  legendselectchanged: (params: {
    name: string;
    /** Map of series name → selected state for all legend items */
    selected: Record<string, boolean>;
  }) => void;
  legendselected: (params: any) => void;
  legendunselected: (params: any) => void;
  legendscroll: (params: any) => void;

  // Data zoom / timeline events
  datazoom: (params: any) => void;
  datarangeselected: (params: any) => void;
  timelinechanged: (params: any) => void;
  timelineplaychanged: (params: any) => void;

  // Toolbox events
  restore: (params: any) => void;
  dataviewchanged: (params: any) => void;
  magictypechanged: (params: any) => void;

  // Pie chart selection events
  pieselectchanged: (params: any) => void;
  pieselected: (params: any) => void;
  pieunselected: (params: any) => void;

  // Map / geo selection events
  mapselectchanged: (params: any) => void;
  mapselected: (params: any) => void;
  mapunselected: (params: any) => void;
  geoselectchanged: (params: any) => void;
  geoselected: (params: any) => void;
  geounselected: (params: any) => void;

  axisareaselected: (params: any) => void;

  // Brush / selection events
  brush: (params: any) => void;
  brushselected: (params: any) => void;
  /** Fired when the user finishes drawing a brush selection */
  brushend: (params: {
    areas: Array<{
      /** Coordinate range covered by the brush — interpretation depends on axis type */
      coordRange: any;
      brushType?: string;
      panelId?: string;
      range?: any;
    }>;
  }) => void;
}

/** Props for the low-level `Chart` wrapper around Apache ECharts */
export interface ChartProps {
  /**
   * The ECharts core instance imported by the consumer.
   * Passed in rather than imported directly so the consumer controls which
   * ECharts modules are bundled (tree-shaking).
   */
  echarts: typeof echarts;
  /** ECharts option object — passed through to `chart.setOption()` */
  options: EChartsOption;
  /**
   * Additional options passed as the second argument to `chart.setOption()`.
   * Defaults to `{ notMerge: false, lazyUpdate: true }`.
   */
  optionUpdateBehavior?: SetOptionOpts;
  /** Additional CSS classes applied to the chart container `<div>` */
  className?: string;
  /**
   * When `true`, initialises ECharts with its built-in dark theme.
   * Changing this value after mount destroys and re-creates the chart instance.
   */
  isDarkMode?: boolean;
  /** Height of the chart container in pixels. Defaults to `350`. */
  height?: number;
  /** Subset of ECharts events to listen for. Handlers are bound/unbound reactively. */
  onEvents?: Partial<ChartEvents>;
}

/**
 * Chart — a low-level wrapper around [Apache ECharts](https://echarts.apache.org).
 *
 * Manages the ECharts instance lifecycle (init, option updates, event binding,
 * resize observation, and disposal). Exposes the raw `echarts.ECharts` instance
 * via `ref` for imperative access when needed.
 *
 * Prefer `TimeseriesChart` for time-series data; use this component when you
 * need full control over the ECharts option object.
 *
 * @example
 * ```tsx
 * import * as echarts from "echarts/core";
 * import { BarChart } from "echarts/charts";
 * import { GridComponent } from "echarts/components";
 * import { CanvasRenderer } from "echarts/renderers";
 *
 * echarts.use([BarChart, GridComponent, CanvasRenderer]);
 *
 * <Chart
 *   echarts={echarts}
 *   options={{ xAxis: { data: ["A", "B"] }, yAxis: {}, series: [{ type: "bar", data: [1, 2] }] }}
 * />
 * ```
 */
export const Chart = forwardRef<echarts.ECharts, ChartProps>(function Chart(
  {
    echarts,
    options,
    optionUpdateBehavior,
    className,
    isDarkMode,
    height = 350,
    onEvents,
  }: ChartProps,
  ref,
) {
  // Ref to the container DOM node that ECharts renders into
  const elRef = useRef<HTMLDivElement | null>(null);
  // Ref to the active ECharts instance
  const chartRef = useRef<echarts.ECharts | null>(null);
  // Keeps the latest onEvents object without triggering re-binding on every render
  const handlersRef = useRef<Partial<ChartEvents>>({});
  // Stable wrapper functions per event name — avoids creating new closures on re-render
  const wrappersRef = useRef<Record<string, (params: any) => void>>({});
  // Tracks which event names are currently bound to the chart instance
  const boundEventsRef = useRef<Set<string>>(new Set());

  // Init and cleanup
  useEffect(() => {
    if (!elRef.current) return;

    const chart = echarts.init(
      elRef.current,
      isDarkMode
        ? "dark"
        : {
            color: isDarkMode ? CHART_DARK_COLORS : CHART_LIGHT_COLORS,
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

    chart.setOption(options, {
      notMerge: false,
      lazyUpdate: true,
      ...optionUpdateBehavior,
    });
  }, [isDarkMode, optionUpdateBehavior, options]);

  // Keep handlersRef in sync so wrapper closures always call the latest handler
  // without needing to re-bind listeners on every render
  useEffect(() => {
    handlersRef.current = onEvents ?? {};
  }, [onEvents]);

  // Reactively bind and unbind event listeners when onEvents changes.
  // Uses stable wrapper functions (wrappersRef) so the same function reference
  // is passed to both chart.on() and chart.off(), which ECharts requires.
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
  }, [echarts, isDarkMode, onEvents]);

  // Resize handling
  useEffect(() => {
    const chart = chartRef.current;
    const el = elRef.current;
    if (!chart || !el) return;

    // Flag to skip the very first trigger
    let isInitial = true;

    const ro = new ResizeObserver(() => {
      if (isInitial) {
        isInitial = false;
        return; // Skip the first resize to let the animation play
      }
      chart.resize();
    });

    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <div ref={elRef} className={cn("w-full", className)} style={{ height }} />
  );
});

Chart.displayName = "Chart";
