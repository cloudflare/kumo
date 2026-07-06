import type * as echarts from "echarts/core";
import type { ForwardedRef, ReactElement, RefAttributes } from "react";
import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { Chart, type ChartEvents, type KumoChartOption } from "./EChart";
import { ChartPalette } from "./Color";
import { defaultValueFormat, escapeHtml } from "./tooltip-utils";

export interface MapGeoJson {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id?: string | number;
    properties?: Record<string, unknown> | null;
    geometry: unknown;
  }>;
}

/** Keys of `T` whose value is assignable to `V`. */
type KeysWithValue<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

/** Accessor for a value on a data row: a key of `T`, or a function of the row. */
export type MapAccessor<T, V> = KeysWithValue<T, V> | ((row: T) => V);

function resolve<T, V>(row: T, accessor: MapAccessor<T, V>): V {
  return typeof accessor === "function" ? accessor(row) : (row[accessor] as V);
}

/** Per-datum style value: a constant, or a function of the row. */
export type MapStyle<T, V> = V | ((row: T) => V);

function resolveStyle<T, V>(row: T, style: MapStyle<T, V>): V {
  return typeof style === "function"
    ? (style as (r: T) => V)(row)
    : (style as V);
}

/** Furthest `roam` zoom-in, as a multiple of the auto-fit scale. */
const MAX_ZOOM_FACTOR = 8;

const geoJsonMapNames = new WeakMap<MapGeoJson, string>();

function sanitizeMapName(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = Math.imul(31, hash) + value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function getMapName(geoJson: MapGeoJson, mapName?: string) {
  if (mapName) return sanitizeMapName(mapName);

  const existing = geoJsonMapNames.get(geoJson);
  if (existing) return existing;

  const generated = `kumo-map-${hashString(JSON.stringify(geoJson))}`;
  geoJsonMapNames.set(geoJson, generated);
  return generated;
}

/** Build the `geo` coordinate-system config (land base for the bubbles). */
function buildGeo(opts: {
  mapName: string;
  areaColor: string;
  center?: [number, number];
  zoom: number;
  roam: boolean;
}) {
  return {
    map: opts.mapName,
    nameProperty: "name",
    roam: opts.roam,
    // Prevent zooming far out into empty space while still allowing users to
    // zoom back to the lesser of ECharts' base scale and the configured zoom.
    ...(opts.roam
      ? {
          scaleLimit: {
            min: Math.min(1, opts.zoom),
            max: opts.zoom * MAX_ZOOM_FACTOR,
          },
        }
      : {}),
    center: opts.center,
    zoom: opts.zoom,
    aspectScale: 1,
    silent: true,
    layoutCenter: ["50%", "50%"],
    layoutSize: "180%",
    itemStyle: {
      areaColor: opts.areaColor,
      // Stroke the seams in the fill colour so the land reads as one seamless
      // mass rather than dotted internal borders.
      borderColor: opts.areaColor,
      borderWidth: 0.5,
    },
    emphasis: { disabled: true },
  };
}

// ===========================================================================
// BubbleMap — proportional symbols over a blank GeoJSON base
// ===========================================================================

export interface BubbleMapProps<T> {
  /**
   * The ECharts core instance imported by the consumer (passed in for
   * tree-shaking). Requires `MapChart`, `ScatterChart`, `TooltipComponent`, and
   * a renderer registered via `echarts.use([...])`.
   */
  echarts: typeof echarts;
  /** GeoJSON `FeatureCollection` for the land base. */
  geoJson: MapGeoJson;
  /**
   * Optional stable ECharts map registry name. Set this when the same GeoJSON is
   * parsed into new object instances across mounts and should reuse one global
   * ECharts registration.
   */
  mapName?: string;
  /** Raw data rows. Coordinates/value/name are read via the accessors below. */
  data: T[];
  /** Longitude accessor (key of `T` or `(row) => number`). */
  lng: MapAccessor<T, number>;
  /** Latitude accessor (key of `T` or `(row) => number`). */
  lat: MapAccessor<T, number>;
  /** Value accessor — drives bubble size. */
  value: MapAccessor<T, number>;
  /** Optional name accessor — used by the default tooltip. */
  name?: MapAccessor<T, string>;

  /** Smallest bubble radius in px. Default: `6`. */
  minRadius?: number;
  /** Largest bubble radius in px. Default: `26`. */
  maxRadius?: number;
  /**
   * Explicit bubble radius `(value) => px`. Overrides the default
   * `minRadius`/`maxRadius` scaling.
   */
  bubbleSize?: (value: number) => number;
  /** Bubble fill colour — constant or `(row) => color`. Defaults to the chart blue. */
  bubbleColor?: MapStyle<T, string>;
  /** Bubble border colour — constant or `(row) => color`. Default: `transparent`. */
  bubbleBorderColor?: MapStyle<T, string>;
  /** Bubble border width — constant or `(row) => px`. Default: `0`. */
  bubbleBorderWidth?: MapStyle<T, number>;
  /** Map center as `[longitude, latitude]`. Defaults to auto-fit. */
  center?: [number, number];
  /** Zoom level — multiplies the auto-fit scale. Default: `1.25`. */
  zoom?: number;
  /** Enable drag-to-pan and scroll-to-zoom. Default: `true`. */
  roam?: boolean;

  /** Show the tooltip. Default: `true`. */
  showTooltip?: boolean;
  /** Format the value for the default tooltip. Default: `toLocaleString()`. */
  valueFormat?: (value: number) => string;
  /**
   * Override the tooltip content for a row. Returns an HTML string rendered by
   * ECharts' own tooltip.
   *
   * USE WITH CAUTION: the return value is injected as HTML. Escape any
   * user-provided strings to avoid XSS.
   */
  tooltipFormatter?: (row: T) => string;

  /** Called as the pointer enters/leaves a bubble. */
  onBubbleHover?: (row: T | undefined) => void;
  /** Called when a bubble is clicked. */
  onBubbleClick?: (row: T) => void;

  /** Height of the chart in pixels. Default: `400`. */
  height?: number;
  className?: string;
  isDarkMode?: boolean;
}

interface BubblePoint<T> {
  name?: string;
  value: [number, number, number];
  symbolSize: number;
  itemStyle: { color: string; borderColor: string; borderWidth: number };
  datum: T;
}

/**
 * BubbleMap — proportional bubbles plotted by coordinate over a blank GeoJSON
 * base. Land is rendered seamlessly (no internal borders) so the bubbles read
 * clearly; bubble area is proportional to value (`minRadius`…`maxRadius`).
 *
 * @example
 * ```tsx
 * import * as echarts from "echarts/core";
 * import { MapChart, ScatterChart } from "echarts/charts";
 * import { TooltipComponent } from "echarts/components";
 * import { CanvasRenderer } from "echarts/renderers";
 * echarts.use([MapChart, ScatterChart, TooltipComponent, CanvasRenderer]);
 *
 * <BubbleMap
 *   echarts={echarts}
 *   geoJson={world}
 *   data={colos}
 *   lng="lon" lat="lat" name="iata" value="requests"
 *   onBubbleHover={(c) => setHovered(c?.iata)}
 * />
 * ```
 */
function BubbleMapRoot<T>(
  {
    echarts: ec,
    geoJson,
    mapName: mapNameProp,
    data,
    lng,
    lat,
    value,
    name,
    minRadius = 6,
    maxRadius = 26,
    bubbleSize,
    bubbleColor,
    bubbleBorderColor = "transparent",
    bubbleBorderWidth = 0,
    center,
    zoom = 1.25,
    roam = true,
    showTooltip = true,
    valueFormat = defaultValueFormat,
    tooltipFormatter,
    onBubbleHover,
    onBubbleClick,
    height = 400,
    className,
    isDarkMode,
  }: BubbleMapProps<T>,
  ref: ForwardedRef<echarts.ECharts | null>,
) {
  // ECharts has no public unregisterMap API, so reuse a deterministic
  // registration name for equivalent GeoJSON instead of creating one per mount.
  const mapName = useMemo(
    () => getMapName(geoJson, mapNameProp),
    [geoJson, mapNameProp],
  );
  useRegisterMap(ec, mapName, geoJson);

  // Keep the latest hover callback without re-binding chart events.
  const hoverRef = useRef(onBubbleHover);
  hoverRef.current = onBubbleHover;

  const mergedRef = useCallback(
    (instance: echarts.ECharts | null) => {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
    },
    [ref],
  );

  const options = useMemo<KumoChartOption>(() => {
    const palette = ChartPalette.mapColors(isDarkMode);

    const values = data.map((row) => resolve(row, value));
    const vmin = values.length ? Math.min(...values) : 0;
    const vmax = values.length ? Math.max(...values) : 1;

    const radiusFor = (v: number) => {
      if (bubbleSize) return bubbleSize(v);
      if (vmax <= vmin) return maxRadius;
      const t = Math.sqrt((v - vmin) / (vmax - vmin));
      return minRadius + t * (maxRadius - minRadius);
    };

    const points: BubblePoint<T>[] = data.map((row) => {
      const v = resolve(row, value);
      return {
        name: name ? resolve(row, name) : undefined,
        value: [resolve(row, lng), resolve(row, lat), v],
        symbolSize: radiusFor(v),
        itemStyle: {
          color: bubbleColor ? resolveStyle(row, bubbleColor) : palette.bubble,
          borderColor: resolveStyle(row, bubbleBorderColor),
          borderWidth: resolveStyle(row, bubbleBorderWidth),
        },
        datum: row,
      };
    });

    return {
      backgroundColor: "transparent",
      animation: true,
      animationDuration: 500,
      geo: buildGeo({ mapName, areaColor: palette.area, center, zoom, roam }),
      tooltip: showTooltip
        ? {
            trigger: "item",
            triggerOn: "mousemove",
            backgroundColor: "var(--color-kumo-base)",
            borderColor: "var(--color-kumo-line)",
            borderWidth: 1,
            padding: 8,
            textStyle: {
              color: "var(--text-color-kumo-default)",
              fontSize: 13,
            },
            extraCssText: "border-radius: 0.5rem;",
            dangerousHtmlFormatter: (params: unknown) => {
              const p = params as {
                name?: string;
                value?: number[];
                data?: { datum?: T };
              };
              const row = p.data?.datum;
              if (tooltipFormatter && row !== undefined) {
                return tooltipFormatter(row);
              }
              const v = p.value?.[2];
              // Two-line layout: name on top, value muted below (use
              // `valueFormat` to add a unit, e.g. "1.2k requests").
              const nameStr = p.name
                ? `<strong>${escapeHtml(p.name)}</strong>`
                : "";
              const valueStr =
                v !== undefined
                  ? `<span style="color:var(--text-color-kumo-subtle)">${escapeHtml(valueFormat(v))}</span>`
                  : "";
              return `<div style="display:flex;flex-direction:column;gap:2px;">${nameStr}${valueStr}</div>`;
            },
          }
        : undefined,
      series: [
        {
          type: "scatter",
          coordinateSystem: "geo",
          data: points,
          itemStyle: { opacity: 0.8 },
          emphasis: { scale: 1.2, itemStyle: { opacity: 1 } },
          z: 3,
        },
      ],
    };
  }, [
    isDarkMode,
    geoJson,
    mapNameProp,
    mapName,
    data,
    lng,
    lat,
    value,
    name,
    minRadius,
    maxRadius,
    bubbleSize,
    bubbleColor,
    bubbleBorderColor,
    bubbleBorderWidth,
    center,
    zoom,
    roam,
    showTooltip,
    tooltipFormatter,
    valueFormat,
  ]);

  const handleMouseOver = useCallback(
    (params: Parameters<ChartEvents["mouseover"]>[0]) => {
      const datum = (params.data as { datum?: T } | undefined)?.datum;
      if (datum !== undefined) hoverRef.current?.(datum);
    },
    [],
  );

  const handleMouseOut = useCallback(() => {
    hoverRef.current?.(undefined);
  }, []);

  const handleClick = useCallback(
    (params: Parameters<ChartEvents["click"]>[0]) => {
      const datum = (params.data as { datum?: T } | undefined)?.datum;
      if (datum !== undefined) onBubbleClick?.(datum);
    },
    [onBubbleClick],
  );

  const onEvents = useMemo<Partial<ChartEvents>>(
    () => ({
      ...(onBubbleHover
        ? {
            mouseover: handleMouseOver,
            mouseout: handleMouseOut,
            globalout: handleMouseOut,
          }
        : {}),
      ...(onBubbleClick ? { click: handleClick } : {}),
    }),
    [
      onBubbleHover,
      handleMouseOver,
      handleMouseOut,
      handleClick,
      onBubbleClick,
    ],
  );

  return (
    <Chart
      echarts={ec}
      ref={mergedRef}
      options={options}
      className={className}
      isDarkMode={isDarkMode}
      height={height}
      onEvents={onEvents}
    />
  );
}

export const BubbleMap = forwardRef(BubbleMapRoot) as (<T>(
  props: BubbleMapProps<T> & RefAttributes<echarts.ECharts | null>,
) => ReactElement | null) & { displayName?: string };

BubbleMap.displayName = "BubbleMap";

/** Register the GeoJSON with ECharts before the child Chart's setOption runs. */
function useRegisterMap(
  ec: typeof echarts,
  mapName: string,
  geoJson: MapGeoJson,
) {
  useLayoutEffect(() => {
    ec.registerMap(mapName, geoJson as Parameters<typeof ec.registerMap>[1]);
  }, [ec, mapName, geoJson]);
}
