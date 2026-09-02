import type * as echarts from "echarts/core";
import type { ForwardedRef, ReactElement, RefAttributes } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { geoMercator } from "d3-geo";
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

/**
 * A geographic projection in ECharts' `{ project, unproject }` shape. Maps
 * default to Mercator (the familiar flat 2D web-map look); pass another d3-geo
 * projection (e.g. `geoNaturalEarth1`) to override, or `null` for raw lng/lat.
 */
export interface MapProjection {
  project: (point: number[]) => number[];
  unproject: (point: number[]) => number[];
}

/**
 * Mercator's latitude cutoff. It stretches toward ±90° to infinity, so we clamp
 * at ±85.0511° — otherwise Antarctica projects to an unbounded height and the
 * whole map shrinks to fit. Renders the poles as a flat edge, like web maps do.
 */
const MERCATOR_MAX_LAT = 85.0511;

/**
 * Default projection for all maps: latitude-clamped Mercator. A single shared
 * instance is fine - `project`/`unproject` are pure (no per-chart state).
 */
const mercatorProjection = geoMercator();
const DEFAULT_PROJECTION: MapProjection = {
  project: (point) => {
    const lat = Math.max(
      -MERCATOR_MAX_LAT,
      Math.min(MERCATOR_MAX_LAT, point[1]),
    );
    return mercatorProjection([point[0], lat]) ?? [0, 0];
  },
  unproject: (point) =>
    mercatorProjection.invert?.(point as [number, number]) ?? [0, 0],
};

/**
 * Default displayed window as ECharts `boundingCoords`
 * (`[[west, north], [east, south]]`). Crops the empty Arctic and most of
 * Antarctica so the populated landmasses fill the container.
 */
const DEFAULT_BOUNDING_COORDS: [[number, number], [number, number]] = [
  [-180, 80],
  [180, -58],
];

/**
 * Resolve the effective projection: `undefined` → the Mercator default,
 * `null` → none (raw plotting), otherwise the caller's projection.
 */
function resolveProjection(
  projection: MapProjection | null | undefined,
): MapProjection | undefined {
  if (projection === null) return undefined;
  return projection ?? DEFAULT_PROJECTION;
}

/**
 * Aspect ratio (`width / height`) of the projected window, used to size the
 * container so the map fills it (ECharts contain-fits the map, so a mismatched
 * container letterboxes it).
 *
 * Measures width at the equator and height down the central meridian - exact
 * for cylindrical projections (Mercator/equirectangular/raw), close enough for
 * curved ones (at worst a small letterbox).
 */
function projectedAspect(
  projection: MapProjection | undefined,
  [[west, north], [east, south]]: [[number, number], [number, number]],
): number {
  const project = projection ? projection.project : (p: number[]) => p;
  const midLat = Math.min(north, Math.max(south, 0));
  const w = Math.abs(project([east, midLat])[0] - project([west, midLat])[0]);
  const h = Math.abs(project([0, north])[1] - project([0, south])[1]);
  return w > 0 && h > 0 ? w / h : 16 / 9;
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
  projection?: MapProjection;
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
    // Crop empty poles / Antarctica so land fills the container.
    boundingCoords: DEFAULT_BOUNDING_COORDS,
    ...(opts.projection ? { projection: opts.projection } : { aspectScale: 1 }),
    silent: true,
    itemStyle: {
      areaColor: opts.areaColor,
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
  /** Enable drag-to-pan and scroll-to-zoom. Default: `false`. */
  roam?: boolean;
  /**
   * Geographic projection. Defaults to a latitude-clamped Mercator (flat 2D
   * web-map look). Pass another d3-geo projection to override, or `null` for
   * ECharts' raw equirectangular plotting.
   *
   * Use a stable reference (module-level or memoised): a new object each render
   * rebuilds the view and resets a roamed/zoomed map.
   */
  projection?: MapProjection | null;

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

  /**
   * Container aspect ratio as `width / height` (e.g. `1.7` or `"16 / 9"`). The
   * height derives from the rendered width so the map fills the frame with no
   * letterboxing. Defaults to the projected aspect of the displayed window, so
   * the land fits edge-to-edge. Pass `height` to fix a pixel height instead.
   */
  aspectRatio?: number | string;
  /**
   * Fixed chart height in pixels. Overrides `aspectRatio` when set. Leave unset
   * to size by aspect ratio (the default) so the map fills the container.
   */
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
    roam = false,
    projection,
    showTooltip = true,
    valueFormat = defaultValueFormat,
    tooltipFormatter,
    onBubbleHover,
    onBubbleClick,
    aspectRatio,
    height,
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

  const palette = useMemo(
    () => ChartPalette.mapColors(isDarkMode),
    [isDarkMode],
  );

  // Rebuild `geo` only when the map data or view changes. Depend on `center`'s
  // components, not the array ref, so an inline `center={[x, y]}` doesn't rebuild
  // `geo` (and reset the view) every render.
  const centerX = center?.[0];
  const centerY = center?.[1];
  const geo = useMemo(
    () =>
      buildGeo({
        mapName,
        areaColor: palette.area,
        center:
          centerX !== undefined && centerY !== undefined
            ? [centerX, centerY]
            : undefined,
        zoom,
        roam,
        projection: resolveProjection(projection),
      }),
    [mapName, geoJson, palette, centerX, centerY, zoom, roam, projection],
  );

  // Size the container to the projected window's aspect so the map fills the
  // frame (no letterboxing). An explicit `height` opts out of aspect sizing.
  const resolvedAspect = useMemo(() => {
    if (height !== undefined) return undefined;
    return (
      aspectRatio ??
      projectedAspect(resolveProjection(projection), DEFAULT_BOUNDING_COORDS)
    );
  }, [aspectRatio, height, projection]);

  // Apply `geo` only when its identity changes, so refetches don't reset a
  // roamed/zoomed view. The ref is updated post-commit (not during render) so
  // discarded render passes (StrictMode/concurrent) can't mark `geo` applied
  // before it reaches the chart.
  const appliedGeoRef = useRef<typeof geo | undefined>(undefined);
  const shouldIncludeGeo = appliedGeoRef.current !== geo;
  useEffect(() => {
    appliedGeoRef.current = geo;
  }, [geo]);

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
    const values = data.map((row) => resolve(row, value));
    const vmax = values.length ? Math.max(...values) : 1;

    const radiusFor = (v: number) => {
      if (bubbleSize) return bubbleSize(v);
      if (vmax <= 0) return minRadius;
      const t = Math.sqrt(Math.max(0, v) / vmax);
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
      animationDurationUpdate: 0,
      ...(shouldIncludeGeo ? { geo } : {}),
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
          id: "bubbles",
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
    palette,
    geo,
    shouldIncludeGeo,
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
      aspectRatio={resolvedAspect}
      onEvents={onEvents}
    />
  );
}

export const BubbleMap = forwardRef(BubbleMapRoot) as (<T>(
  props: BubbleMapProps<T> & RefAttributes<echarts.ECharts | null>,
) => ReactElement | null) & { displayName?: string };

BubbleMap.displayName = "BubbleMap";

// ===========================================================================
// ChoroplethMap — GeoJSON regions shaded by value
// ===========================================================================

export interface ChoroplethMapProps<T> {
  /**
   * The ECharts core instance imported by the consumer (passed in for
   * tree-shaking). Requires `MapChart`, `VisualMapComponent`, `TooltipComponent`,
   * and a renderer registered via `echarts.use([...])`.
   */
  echarts: typeof echarts;
  /** GeoJSON `FeatureCollection` whose regions are shaded by value. */
  geoJson: MapGeoJson;
  /**
   * Optional stable ECharts map registry name. Set this when the same GeoJSON is
   * parsed into new object instances across mounts and should reuse one global
   * ECharts registration.
   */
  mapName?: string;
  /** Raw data rows. The region key and value are read via the accessors below. */
  data: T[];
  /**
   * Region-key accessor (key of `T` or `(row) => string`). Each row is joined to
   * a GeoJSON feature whose `nameProperty` equals this value.
   */
  name: MapAccessor<T, string>;
  /** Value accessor — drives the region's fill colour. */
  value: MapAccessor<T, number>;
  /**
   * GeoJSON feature property to join on. Default: `"name"`. Real-world data is
   * often more reliably matched on an ISO-code property (e.g. `"iso_a2"`).
   */
  nameProperty?: string;

  /**
   * Sequential colour ramp (low → high). Defaults to the Kumo choropleth blues,
   * tuned to stay distinct from the no-data fill. Distributed across the
   * continuous gradient.
   */
  colorRange?: string[];
  /** Lower bound of the continuous scale. Default: data minimum. */
  min?: number;
  /** Upper bound of the continuous scale. Default: data maximum. */
  max?: number;
  /** Fill for regions with no matching data row. Defaults to the neutral land grey. */
  noDataColor?: string;
  /** Show the visualMap colour legend. Default: `false`. */
  showLegend?: boolean;

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

  /** Called as the pointer enters/leaves a region with data. */
  onRegionHover?: (row: T | undefined) => void;
  /** Called when a region with data is clicked. */
  onRegionClick?: (row: T) => void;

  /** Map center as `[longitude, latitude]`. Defaults to auto-fit. */
  center?: [number, number];
  /** Zoom level — multiplies the auto-fit scale. Default: `1.25`. */
  zoom?: number;
  /** Enable drag-to-pan and scroll-to-zoom. Default: `false`. */
  roam?: boolean;
  /**
   * Geographic projection. Defaults to a latitude-clamped Mercator (flat 2D
   * web-map look). Pass another d3-geo projection to override, or `null` for
   * ECharts' raw equirectangular plotting.
   *
   * Use a stable reference (module-level or memoised): a new object each render
   * rebuilds the view and resets a roamed/zoomed map.
   */
  projection?: MapProjection | null;

  /**
   * Container aspect ratio as `width / height` (e.g. `1.7` or `"16 / 9"`). The
   * height derives from the rendered width so the map fills the frame with no
   * letterboxing. Defaults to the projected aspect of the displayed window, so
   * the regions fit edge-to-edge. Pass `height` to fix a pixel height instead.
   */
  aspectRatio?: number | string;
  /**
   * Fixed chart height in pixels. Overrides `aspectRatio` when set. Leave unset
   * to size by aspect ratio (the default) so the map fills the container.
   */
  height?: number;
  className?: string;
  isDarkMode?: boolean;
}

interface ChoroplethRegion<T> {
  name: string;
  value: number;
  datum: T;
}

/**
 * ChoroplethMap — shades GeoJSON regions by value, joining data rows to features
 * by `name`/`nameProperty`. A continuous `visualMap` legend maps value → colour.
 * Regions without a matching row render in `noDataColor`. For skewed data, scale
 * the `value` in the parent (e.g. log) before passing it in.
 *
 * @example
 * ```tsx
 * import * as echarts from "echarts/core";
 * import { MapChart } from "echarts/charts";
 * import { VisualMapComponent, TooltipComponent } from "echarts/components";
 * import { CanvasRenderer } from "echarts/renderers";
 * echarts.use([MapChart, VisualMapComponent, TooltipComponent, CanvasRenderer]);
 *
 * <ChoroplethMap
 *   echarts={echarts}
 *   geoJson={world}
 *   data={countries}
 *   name="country" value="requests"
 * />
 * ```
 */
function ChoroplethMapRoot<T>(
  {
    echarts: ec,
    geoJson,
    mapName: mapNameProp,
    data,
    name,
    value,
    nameProperty = "name",
    colorRange,
    min,
    max,
    noDataColor,
    showLegend = false,
    showTooltip = true,
    valueFormat = defaultValueFormat,
    tooltipFormatter,
    onRegionHover,
    onRegionClick,
    center,
    zoom = 1.25,
    roam = false,
    projection,
    aspectRatio,
    height,
    className,
    isDarkMode,
  }: ChoroplethMapProps<T>,
  ref: ForwardedRef<echarts.ECharts | null>,
) {
  // ECharts has no public unregisterMap API, so reuse a deterministic
  // registration name for equivalent GeoJSON instead of creating one per mount.
  const mapName = useMemo(
    () => getMapName(geoJson, mapNameProp),
    [geoJson, mapNameProp],
  );
  useRegisterMap(ec, mapName, geoJson);

  const palette = useMemo(
    () => ChartPalette.mapColors(isDarkMode),
    [isDarkMode],
  );

  // The view fields (roam/zoom/center) reset the map when re-sent, so memoise
  // them on their primitive components and only re-apply on change — a data
  // refetch must not snap a roamed/zoomed map back to its initial view.
  // `isDarkMode` is a dependency because toggling the theme destroys and
  // recreates the ECharts instance (see EChart init effect); the fresh instance
  // needs the view re-applied or it resets aspectScale/zoom/center to defaults.
  const centerX = center?.[0];
  const centerY = center?.[1];
  const view = useMemo(
    () => ({
      roam,
      ...(roam
        ? {
            scaleLimit: {
              min: Math.min(1, zoom),
              max: zoom * MAX_ZOOM_FACTOR,
            },
          }
        : {}),
      center:
        centerX !== undefined && centerY !== undefined
          ? [centerX, centerY]
          : undefined,
      zoom,
      // Crop empty poles / Antarctica so land fills the container.
      boundingCoords: DEFAULT_BOUNDING_COORDS,
      ...(resolveProjection(projection)
        ? { projection: resolveProjection(projection) }
        : { aspectScale: 1 }),
    }),
    [centerX, centerY, zoom, roam, isDarkMode, projection],
  );

  // Size the container to the projected window's aspect so the map fills the
  // frame (no letterboxing). An explicit `height` opts out of aspect sizing.
  const resolvedAspect = useMemo(() => {
    if (height !== undefined) return undefined;
    return (
      aspectRatio ??
      projectedAspect(resolveProjection(projection), DEFAULT_BOUNDING_COORDS)
    );
  }, [aspectRatio, height, projection]);

  // Update the applied-view ref post-commit (not during render) so discarded
  // render passes (StrictMode/concurrent) can't mark the view applied early.
  const appliedViewRef = useRef<typeof view | undefined>(undefined);
  const shouldIncludeView = appliedViewRef.current !== view;
  useEffect(() => {
    appliedViewRef.current = view;
  }, [view]);

  // Keep the latest hover callback without re-binding chart events.
  const hoverRef = useRef(onRegionHover);
  hoverRef.current = onRegionHover;

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
    const colors = colorRange ?? palette.scale;
    const noData = noDataColor ?? palette.area;

    const regions: ChoroplethRegion<T>[] = data.map((row) => ({
      name: resolve(row, name),
      value: resolve(row, value),
      datum: row,
    }));

    const values = regions.map((r) => r.value);
    const vmin = values.length ? Math.min(...values) : 0;
    const vmax = values.length ? Math.max(...values) : 1;
    const resolvedMin = min ?? vmin;
    const resolvedMax = max ?? (vmax > vmin ? vmax : vmin + 1);

    const visualMap = {
      type: "continuous" as const,
      show: showLegend,
      min: resolvedMin,
      max: resolvedMax,
      calculable: false,
      hoverLink: false,
      inRange: { color: colors },
      orient: "horizontal" as const,
      text: ["High", "Low"],
      left: 0,
      bottom: 8,
      textStyle: {
        color: ChartPalette.text("primary", isDarkMode),
        fontSize: 11,
      },
    };

    return {
      backgroundColor: "transparent",
      animation: true,
      animationDuration: 500,
      animationDurationUpdate: 0,
      visualMap,
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
                value?: number;
                data?: { datum?: T };
              };
              const row = p.data?.datum;
              // Suppress the tooltip for regions with no matching data row.
              if (row === undefined) return "";
              if (tooltipFormatter) return tooltipFormatter(row);
              const v =
                typeof p.value === "number" && !Number.isNaN(p.value)
                  ? p.value
                  : undefined;
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
          id: "regions",
          type: "map",
          map: mapName,
          nameProperty,
          ...(shouldIncludeView ? view : {}),
          data: regions,
          itemStyle: {
            areaColor: noData,
            borderColor: "transparent",
            borderWidth: 0,
          },
          label: { show: false },
          emphasis: {
            focus: "self" as const,
            label: { show: false },
            itemStyle: {
              areaColor: "inherit",
            },
          },
          blur: {
            label: { show: false },
            itemStyle: { opacity: 0.45 },
          },
          select: { disabled: true },
          z: 1,
        },
      ],
    };
  }, [
    isDarkMode,
    palette,
    geoJson,
    mapName,
    view,
    shouldIncludeView,
    data,
    name,
    value,
    nameProperty,
    colorRange,
    min,
    max,
    noDataColor,
    showLegend,
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
      if (datum !== undefined) onRegionClick?.(datum);
    },
    [onRegionClick],
  );

  const onEvents = useMemo<Partial<ChartEvents>>(
    () => ({
      ...(onRegionHover
        ? {
            mouseover: handleMouseOver,
            mouseout: handleMouseOut,
            globalout: handleMouseOut,
          }
        : {}),
      ...(onRegionClick ? { click: handleClick } : {}),
    }),
    [
      onRegionHover,
      handleMouseOver,
      handleMouseOut,
      handleClick,
      onRegionClick,
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
      aspectRatio={resolvedAspect}
      onEvents={onEvents}
    />
  );
}

export const ChoroplethMap = forwardRef(ChoroplethMapRoot) as (<T>(
  props: ChoroplethMapProps<T> & RefAttributes<echarts.ECharts | null>,
) => ReactElement | null) & { displayName?: string };

ChoroplethMap.displayName = "ChoroplethMap";

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
