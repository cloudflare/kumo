import type * as echarts from "echarts/core";
import type {
  EChartsOption,
  SetOptionOpts,
  TooltipComponentOption,
} from "echarts";
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
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
 * Tooltip options with the `formatter` property removed and replaced with
 * `dangerousHtmlFormatter` to make the security implications more explicit.
 */
export type SafeTooltipOption = Omit<TooltipComponentOption, "formatter"> & {
  /**
   * USE WITH CAUTION: Use this only for trusted HTML content.
   * When building tooltip HTML with user-provided data, always sanitize
   * the input to prevent XSS vulnerabilities. Recommended: use
   * `encodeHTML` from `echarts/format` to escape HTML special characters.
   */
  dangerousHtmlFormatter?: TooltipComponentOption["formatter"];
};

export type KumoChartOption = {
  [K in keyof EChartsOption]: K extends "tooltip"
    ? SafeTooltipOption | SafeTooltipOption[] | undefined
    : EChartsOption[K];
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

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
  /** Map of series name → selected state for all legend items */
  /** Fired on legend toggle (`legendToggleSelect` action or a legend UI click) */
  legendselectchanged: (params: {
    name: string;
    selected: Record<string, boolean>;
  }) => void;
  /** Fired by the `legendSelect` action. Carries the full `selected` map. */
  legendselected: (params: {
    name: string;
    selected: Record<string, boolean>;
  }) => void;
  /** Fired by the `legendUnSelect` action. Carries the full `selected` map. */
  legendunselected: (params: {
    name: string;
    selected: Record<string, boolean>;
  }) => void;
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
  options: KumoChartOption;
  /**
   * Additional options passed as the second argument to `chart.setOption()`.
   * Defaults to `{ notMerge: false, lazyUpdate: true }`.
   */
  optionUpdateBehavior?: SetOptionOpts;
  /** Additional CSS classes applied to the chart container `<div>` */
  className?: string;
  /**
   * Accessible name for the chart wrapper. Use a specific, localized label
   * that identifies what this chart shows, for example "Requests over time".
   */
  ariaLabel?: string;
  /**
   * Accessible description for the chart wrapper and ECharts' generated aria
   * summary. Use this for longer localized context, trends, or data caveats.
   */
  ariaDescription?: string;
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

const transformTooltip = (tooltipObj: SafeTooltipOption) => {
  const { dangerousHtmlFormatter, ...restOfTooltip } = tooltipObj;
  return {
    ...restOfTooltip,
    formatter: dangerousHtmlFormatter,
  };
};

const getPrefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

const disableSeriesAnimation = (
  series: EChartsOption["series"],
): EChartsOption["series"] => {
  if (Array.isArray(series)) {
    return series.map((seriesOption) =>
      isRecord(seriesOption)
        ? { ...seriesOption, animation: false }
        : seriesOption,
    ) as EChartsOption["series"];
  }

  return isRecord(series)
    ? ({ ...series, animation: false } as EChartsOption["series"])
    : series;
};

const applyReducedMotionOptions = (options: EChartsOption): EChartsOption => ({
  ...options,
  animation: false,
  ...(options.series !== undefined
    ? { series: disableSeriesAnimation(options.series) }
    : {}),
});

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    getPrefersReducedMotion,
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    setPrefersReducedMotion(mediaQueryList.matches);

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);
    } else {
      mediaQueryList.addListener?.(handleChange);
    }

    return () => {
      if (typeof mediaQueryList.removeEventListener === "function") {
        mediaQueryList.removeEventListener("change", handleChange);
      } else {
        mediaQueryList.removeListener?.(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
};

const prepareChartOptions = ({
  options,
  isDarkMode,
  ariaLabel,
  ariaDescription,
  prefersReducedMotion,
}: {
  options: KumoChartOption;
  isDarkMode?: boolean;
  ariaLabel?: string;
  ariaDescription?: string;
  prefersReducedMotion?: boolean;
}): EChartsOption => {
  let withDefaults: EChartsOption = {
    backgroundColor: "transparent",
    color: isDarkMode ? CHART_DARK_COLORS : CHART_LIGHT_COLORS,
    ...options,
  };

  if (prefersReducedMotion) {
    withDefaults = applyReducedMotionOptions(withDefaults);
  }

  withDefaults = mergeAriaOptions({
    options: withDefaults,
    shouldEnableAria: Boolean(ariaLabel || ariaDescription),
    ariaDescription,
  });

  if (!withDefaults.tooltip) return withDefaults;

  return {
    ...withDefaults,
    tooltip: Array.isArray(withDefaults.tooltip)
      ? withDefaults.tooltip.map(transformTooltip)
      : transformTooltip(withDefaults.tooltip as SafeTooltipOption),
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAriaEnabled = (aria: EChartsOption["aria"] | undefined): boolean =>
  isRecord(aria) && aria.enabled === true;

const mergeAriaOptions = ({
  options,
  shouldEnableAria,
  ariaDescription,
}: {
  options: EChartsOption;
  shouldEnableAria: boolean;
  ariaDescription?: string;
}): EChartsOption => {
  const userAria = options.aria;

  if (!shouldEnableAria && !ariaDescription && !userAria) {
    return options;
  }

  const ariaRecord = isRecord(userAria) ? userAria : {};
  const userLabel = isRecord(ariaRecord.label) ? ariaRecord.label : {};
  const nextAria: Record<string, unknown> = {
    enabled: true,
    ...ariaRecord,
  };

  if (ariaDescription || ariaRecord.label !== undefined) {
    nextAria.label = {
      ...(ariaDescription ? { description: ariaDescription } : {}),
      ...userLabel,
    };
  }

  return {
    ...options,
    aria: nextAria as EChartsOption["aria"],
  };
};

const mergeIds = (...ids: Array<string | undefined>): string | undefined => {
  const merged = ids.filter(Boolean).join(" ");
  return merged || undefined;
};

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
    ariaLabel,
    ariaDescription,
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
  const descriptionId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();
  const preparedOptions = useMemo(
    () =>
      prepareChartOptions({
        options,
        isDarkMode,
        ariaLabel,
        ariaDescription,
        prefersReducedMotion,
      }),
    [ariaDescription, ariaLabel, isDarkMode, options, prefersReducedMotion],
  );
  const chartDescriptionId = ariaDescription ? descriptionId : undefined;
  const chartHasAccessibleWrapper =
    Boolean(ariaLabel || ariaDescription) || isAriaEnabled(preparedOptions.aria);

  // Init and cleanup
  useEffect(() => {
    if (!elRef.current) return;

    const chart = echarts.init(elRef.current, isDarkMode ? "dark" : undefined);
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

    chart.setOption(preparedOptions, {
      notMerge: false,
      lazyUpdate: true,
      ...optionUpdateBehavior,
    });

    // ECharts may write its own aria-label when aria support is enabled. Reapply
    // Kumo's explicit wrapper label after setOption so consumer-provided labels
    // remain the accessible name.
    if (ariaLabel && elRef.current) {
      elRef.current.setAttribute("aria-label", ariaLabel);
    }
  }, [ariaLabel, optionUpdateBehavior, preparedOptions]);

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
    <>
      <div
        ref={elRef}
        className={cn("w-full", className)}
        style={{ height }}
        tabIndex={chartHasAccessibleWrapper ? 0 : undefined}
        role={chartHasAccessibleWrapper ? "img" : undefined}
        aria-label={ariaLabel}
        aria-describedby={mergeIds(chartDescriptionId)}
      />
      {ariaDescription && (
        <div id={descriptionId} className="sr-only">
          {ariaDescription}
        </div>
      )}
    </>
  );
});

Chart.displayName = "Chart";
