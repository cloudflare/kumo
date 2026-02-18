import type * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { forwardRef, useEffect, useRef } from "react";
import { cn } from "../../utils";
import { CHART_DARK_COLORS, CHART_LIGHT_COLORS } from "./Color";

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

export interface ChartEvents {
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
