import type { PointerEvent as ReactPointerEvent } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  geoArea,
  geoCentroid,
  geoDistance,
  geoGraticule10,
  geoOrthographic,
  geoPath,
  type GeoPermissibleObjects,
} from "d3-geo";
import { cn } from "../../utils/cn";
import { ChartPalette } from "./Color";
import { GLOBE_LAND } from "./globe-land";
import type { MapGeoJson } from "./Maps";
import { defaultValueFormat } from "./tooltip-utils";
import { DEFAULT_ACTIVE_DELAY, useSettledValue } from "./use-settled-value";

export interface GlobeMapRegion {
  /** Joined to the `regionGeoJson` feature whose `regionNameProperty` equals this value. */
  name: string;
  /**
   * Display name for the tooltip and screen readers. Defaults to `name`; set
   * it when joining on a code (for example `"US"` via `iso_a2`).
   */
  label?: string;
  /** Drives the region's hatch colour along `regionColorRange`. */
  value: number;
  /** Hatch colour for this region. Overrides the value-based colour. */
  color?: string;
}

export interface GlobeMapMarker {
  /** Longitude in decimal degrees. */
  longitude: number;
  /** Latitude in decimal degrees. */
  latitude: number;
  /**
   * Short identifier, for example an IATA code. The tooltip reads
   * `description (name)` when a description is set, otherwise just `name`.
   */
  name: string;
  /** Optional longer name, for example a city. Shown before `name` in the tooltip. */
  description?: string;
  /** Marker fill. Overrides `markerColor`. */
  color?: string;
  /**
   * Numeric value that turns the marker into a proportional bubble (area
   * scales with value between `minRadius` and `maxRadius`) and appears in the
   * tooltip.
   */
  value?: number;
  /** Marker radius in view-box pixels. Overrides `value` sizing and `markerRadius`. */
  radius?: number;
}

export interface GlobeMapProps {
  /** Stroke color for the hatched land. Defaults to a subdued semantic Kumo text color. */
  landColor?: string;
  /** Spacing between land hatch lines in view-box pixels. Default: `10`. */
  landHatchSpacing?: number;
  /** Fill behind the land and graticule. Default: the Kumo base surface. */
  oceanColor?: string;
  /** Geographic points drawn above the land. Points fade at the horizon and back-facing points are hidden. */
  markers?: GlobeMapMarker[];
  /** Default marker fill. Defaults to the Kumo chart blue. */
  markerColor?: string;
  /** Default marker radius in view-box pixels for markers without a `value`. Default: `7`. */
  markerRadius?: number;
  /** Smallest bubble radius in view-box pixels for markers with a `value`. Default: `4`. */
  minRadius?: number;
  /** Largest bubble radius in view-box pixels for markers with a `value`. Default: `18`. */
  maxRadius?: number;
  /**
   * Explicit bubble radius `(value) => view-box pixels`. Overrides the default
   * `minRadius`/`maxRadius` scaling.
   */
  bubbleSize?: (value: number) => number;
  /** Format marker values in the tooltip. Default: `toLocaleString()`. */
  valueFormat?: (value: number) => string;
  /** Marker fill opacity from `0` to `1`. Use below `1` so overlapping bubbles stay readable. Default: `1`. */
  markerOpacity?: number;
  /** Marker border colour when `markerBorderWidth` is above 0. Default: the Kumo base surface. */
  markerBorderColor?: string;
  /** Marker border width in view-box pixels. Default: `0` (no border, like BubbleMap). */
  markerBorderWidth?: number;
  /** Called when a visible marker is clicked. */
  onMarkerClick?: (marker: GlobeMapMarker) => void;
  /**
   * GeoJSON `FeatureCollection` of regions (for example countries) to shade by
   * value, like `ChoroplethMap`. Only features with a matching `regions` entry
   * are drawn, as coloured hatching over the land. Prefer simplified geometry
   * (for example Natural Earth 1:110m) to keep rotation smooth.
   */
  regionGeoJson?: MapGeoJson;
  /** Region values, joined to `regionGeoJson` features by name. */
  regions?: GlobeMapRegion[];
  /**
   * GeoJSON feature property to join `regions[].name` on. Default: `"name"`.
   * ISO-code properties (for example `"iso_a2"`) are often more reliable.
   */
  regionNameProperty?: string;
  /**
   * Sequential colour ramp (low → high) for region hatching. Defaults to the
   * Kumo choropleth blues, which get brighter with value in dark mode.
   */
  regionColorRange?: string[];
  /**
   * Name of a marker to focus from outside the globe, for example from a list.
   * The globe rotates to centre it, pauses auto-rotation, highlights it and
   * shows its tooltip. Controlled: pass `null` (or omit) to clear.
   */
  activeMarker?: string | null;
  /**
   * Name of a region (`regions[].name`) to focus from outside, like
   * `activeMarker`. When both are set, `activeMarker` wins.
   */
  activeRegion?: string | null;
  /**
   * Milliseconds `activeMarker` / `activeRegion` must stay unchanged before
   * the globe reacts, so sweeping the pointer over a list doesn't spin the
   * globe to every item passed. Once an item is active, moving to another
   * waits at most 100ms. `0` reacts immediately. Clearing (`null`) applies
   * immediately. Default: `300`.
   */
  activeDelay?: number;
  /** Initial globe rotation as `[longitude, latitude, roll]`. */
  defaultRotation?: [number, number, number];
  /** Allow pointer dragging to rotate the globe. Default: `true`. */
  draggable?: boolean;
  /** Continuously rotate the globe horizontally. Default: `false`. */
  autoRotate?: boolean;
  /** Horizontal auto-rotation speed in degrees per second. Default: `4`. */
  autoRotateSpeed?: number;
  /** Draw latitude and longitude guides. Default: `false`. */
  showGraticule?: boolean;
  /** Show the Kumo-styled marker tooltip. Default: `true`. */
  showTooltip?: boolean;
  /** Called after pointer or keyboard interaction changes the globe rotation. */
  onUserRotationChange?: (rotation: [number, number, number]) => void;
  /** Accessible label for the visualization. Default: `"Interactive globe map"`. */
  "aria-label"?: string;
  /** Fixed component height. Otherwise the globe uses a square aspect ratio. */
  height?: number;
  className?: string;
  isDarkMode?: boolean;
}

interface GlobeTooltip {
  label: string;
  detail: string | undefined;
  x: number;
  anchorTop: number;
  anchorBottom: number;
}

type RegionGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

interface ResolvedGlobeRegion {
  key: string;
  region: GlobeMapRegion;
  label: string;
  geometry: RegionGeometry;
  color: string;
  value: string;
  centroid: [number, number];
  angularRadius: number;
}

interface ResolvedGlobeMarker {
  marker: GlobeMapMarker;
  key: string;
  radius: number;
  tooltipLabel: string;
  tooltipDetail: string | undefined;
  label: string;
}

const GLOBE_VIEWBOX_SIZE = 640;
const GLOBE_PADDING = 18;
const GLOBE_RADIUS = GLOBE_VIEWBOX_SIZE / 2 - GLOBE_PADDING;
const MARKER_EDGE_FADE_DISTANCE = 24;
const MARKER_HIT_PADDING = 8;
/** Gap between a marker and its tooltip, in CSS pixels. */
const TOOLTIP_GAP = 6;
const TOOLTIP_EDGE_PADDING = 4;
const REGION_TOOLTIP_POINTER_OFFSET = 10;
const EMPTY_REGIONS: GlobeMapRegion[] = [];
/** Fly-to duration scales with the angle turned, within these bounds. */
const FLY_TO_MIN_DURATION = 250;
const FLY_TO_MAX_DURATION = 550;
const FLY_TO_MS_PER_DEGREE = 2;

function flyToDuration(deltaLongitude: number, deltaLatitude: number): number {
  const angle = Math.hypot(deltaLongitude, deltaLatitude);
  return Math.min(
    FLY_TO_MAX_DURATION,
    Math.max(FLY_TO_MIN_DURATION, angle * FLY_TO_MS_PER_DEGREE),
  );
}
const ACTIVE_MARKER_HALO = 6;

function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

interface GlobeActiveTarget {
  key: string;
  coordinates: [number, number];
  label: string;
  detail: string | undefined;
  radius: number;
}
// useLayoutEffect warns when rendered with react-dom/server (React 18).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
/** Just under one 60Hz frame, so updates land on every frame without judder. */
const AUTO_ROTATE_INTERVAL = 1000 / 60 - 2;
/** Screen movement at the globe's centre per degree of rotation (view-box px). */
const PX_PER_DEGREE = (Math.PI / 180) * GLOBE_RADIUS;
/** Angular margin (radians) before the horizon where regions are clipped. */
const HORIZON_MARGIN = 0.05;
/** Tall tiles avoid seams along a line that shimmer as the pattern moves. */
const HATCH_TILE_LENGTH = GLOBE_VIEWBOX_SIZE * 2;

/**
 * Moves the hatch with the land so coastline line fragments don't flicker.
 * 45° lines repeat every `spacing × √2`, so the offset wraps there.
 */
function hatchPatternTransform(
  rotation: [number, number, number],
  spacing: number,
): string {
  const period = spacing * Math.SQRT2;
  const wrap = (value: number) => ((value % period) + period) % period;
  const offsetX = wrap(rotation[0] * PX_PER_DEGREE);
  const offsetY = wrap(-rotation[1] * PX_PER_DEGREE);
  return `translate(${offsetX.toFixed(2)} ${offsetY.toFixed(2)}) rotate(-45)`;
}
const GLOBE_GRATICULE = /* @__PURE__ */ geoGraticule10();
let globeSpherePath: string | undefined;

function getGlobeSpherePath(): string | undefined {
  globeSpherePath ??=
    geoPath(
      geoOrthographic()
        .translate([GLOBE_VIEWBOX_SIZE / 2, GLOBE_VIEWBOX_SIZE / 2])
        .scale(GLOBE_RADIUS)
        .clipAngle(90),
    ).digits(1)({ type: "Sphere" }) ?? undefined;
  return globeSpherePath;
}

/**
 * d3-geo reads RFC 7946 winding as "everything except this region", so reverse
 * any polygon larger than a hemisphere.
 */
function normalizePolygonWinding(polygon: number[][][]): number[][][] {
  const area = geoArea({
    type: "Polygon",
    coordinates: polygon,
  } as GeoPermissibleObjects);
  return area > 2 * Math.PI
    ? polygon.map((ring) => [...ring].reverse())
    : polygon;
}

function toRegionGeometry(geometry: unknown): RegionGeometry | null {
  if (!geometry || typeof geometry !== "object") return null;
  const { type, coordinates } = geometry as {
    type?: unknown;
    coordinates?: unknown;
  };
  if (!Array.isArray(coordinates)) return null;
  if (type === "Polygon") {
    return {
      type,
      coordinates: normalizePolygonWinding(coordinates as number[][][]),
    };
  }
  if (type === "MultiPolygon") {
    return {
      type,
      coordinates: (coordinates as number[][][][]).map(normalizePolygonWinding),
    };
  }
  return null;
}

/** Largest angular distance (radians) from `centroid` to any region vertex. */
function regionAngularRadius(
  geometry: RegionGeometry,
  centroid: [number, number],
): number {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let radius = 0;
  for (const polygon of polygons) {
    for (const [longitude, latitude] of polygon[0] ?? []) {
      radius = Math.max(
        radius,
        geoDistance(centroid, [longitude ?? 0, latitude ?? 0]),
      );
    }
  }
  return radius;
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Colour at `t` (0–1) along a ramp; hex stops are blended exactly. */
function colorAt(colors: string[], t: number): string {
  if (colors.length === 0) return "currentColor";
  if (colors.length === 1) return colors[0]!;
  const position = Math.max(0, Math.min(1, t)) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(position));
  const fraction = position - index;
  const from = colors[index]!;
  const to = colors[index + 1]!;
  if (fraction === 0) return from;
  if (fraction === 1) return to;
  if (HEX_COLOR.test(from) && HEX_COLOR.test(to)) {
    const channel = (offset: number) => {
      const a = Number.parseInt(from.slice(offset, offset + 2), 16);
      const b = Number.parseInt(to.slice(offset, offset + 2), 16);
      return Math.round(a + (b - a) * fraction)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${channel(1)}${channel(3)}${channel(5)}`;
  }
  const percent = Math.round((1 - fraction) * 100);
  return `color-mix(in oklab, ${from} ${percent}%, ${to})`;
}

function isFocusVisible(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  try {
    return target.matches(":focus-visible");
  } catch {
    return false;
  }
}

function finiteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function normalizeRotation(
  rotation: [number, number, number],
): [number, number, number] {
  return [
    finiteNumber(rotation[0], -10),
    Math.max(-90, Math.min(90, finiteNumber(rotation[1], -20))),
    finiteNumber(rotation[2], 0),
  ];
}

/**
 * GlobeMap — an SVG orthographic globe with hatched land and geographic
 * markers. Rendering is SVG-only and does not use WebGL.
 */
export const GlobeMap = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ forwardRef<HTMLDivElement, GlobeMapProps>(function GlobeMap(
    {
      landColor,
      landHatchSpacing = 10,
      oceanColor = "var(--color-kumo-base)",
      markers = [],
      markerColor,
      markerRadius = 7,
      minRadius = 4,
      maxRadius = 18,
      bubbleSize,
      valueFormat = defaultValueFormat,
      markerOpacity = 1,
      markerBorderColor,
      markerBorderWidth = 0,
      onMarkerClick,
      regionGeoJson,
      regions = EMPTY_REGIONS,
      regionNameProperty = "name",
      regionColorRange,
      activeMarker: activeMarkerProp,
      activeRegion: activeRegionProp,
      activeDelay = DEFAULT_ACTIVE_DELAY,
      defaultRotation = [-10, -20, 0],
      draggable = true,
      autoRotate = false,
      autoRotateSpeed = 4,
      showGraticule = false,
      showTooltip = true,
      onUserRotationChange,
      "aria-label": ariaLabel = "Interactive globe map",
      height,
      className,
      isDarkMode,
    },
    ref,
  ) {
    const [rotation, setRotation] = useState(() =>
      normalizeRotation(defaultRotation),
    );
    const [tooltip, setTooltip] = useState<GlobeTooltip | null>(null);
    const landPatternId = useId();
    const rotationRef = useRef(rotation);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const dragRef = useRef<{
      pointerId: number;
      x: number;
      y: number;
      rotation: [number, number, number];
    } | null>(null);
    const isFocusedRef = useRef(false);
    const isHoveredRef = useRef(false);
    const pointerMoveFrameRef = useRef<number | null>(null);
    const pendingPointerMoveRef = useRef<{
      pointerId: number;
      x: number;
      y: number;
    } | null>(null);
    const instructionsId = useId();

    const palette = useMemo(
      () => ChartPalette.mapColors(isDarkMode),
      [isDarkMode],
    );
    const resolvedLandColor = landColor ?? "var(--text-color-kumo-subtle)";
    const resolvedMarkerColor = markerColor ?? palette.bubble;
    const safeHatchSpacing = Math.max(3, finiteNumber(landHatchSpacing, 10));
    const safeMarkerRadius = Math.max(0, finiteNumber(markerRadius, 7));
    const safeMarkerOpacity = Math.max(
      0,
      Math.min(1, finiteNumber(markerOpacity, 1)),
    );
    const safeMarkerBorderWidth = Math.max(
      0,
      finiteNumber(markerBorderWidth, 0),
    );
    const { resolvedMarkers, markerDrawOrder } = useMemo(() => {
      const safeMinRadius = Math.max(0, finiteNumber(minRadius, 4));
      const safeMaxRadius = Math.max(
        safeMinRadius,
        finiteNumber(maxRadius, 18),
      );
      let maxValue = 0;
      for (const marker of markers) {
        if (marker.value !== undefined && Number.isFinite(marker.value)) {
          maxValue = Math.max(maxValue, marker.value);
        }
      }
      const radiusForValue = (value: number) => {
        if (bubbleSize) return bubbleSize(value);
        if (maxValue <= 0) return safeMinRadius;
        // Area, not radius, is proportional to value.
        const t = Math.sqrt(Math.max(0, value) / maxValue);
        return safeMinRadius + t * (safeMaxRadius - safeMinRadius);
      };

      const inputOrder = markers.map((marker, index): ResolvedGlobeMarker => {
        const numericValue =
          marker.value !== undefined && Number.isFinite(marker.value)
            ? marker.value
            : undefined;
        const baseRadius =
          marker.radius ??
          (numericValue === undefined
            ? safeMarkerRadius
            : radiusForValue(numericValue));
        const value =
          numericValue === undefined ? undefined : valueFormat(numericValue);
        const coordinates = `${marker.latitude.toFixed(2)}, ${marker.longitude.toFixed(2)}`;
        const description =
          marker.description ?? (value === undefined ? coordinates : undefined);
        return {
          marker,
          key: `marker:${marker.name}-${index}`,
          radius: Math.max(0, finiteNumber(baseRadius, safeMarkerRadius)),
          tooltipLabel: marker.description
            ? `${marker.description} (${marker.name})`
            : marker.name,
          tooltipDetail:
            value ?? (marker.description ? undefined : coordinates),
          label: `${marker.name}: ${[description, value]
            .filter(Boolean)
            .join(", ")}`,
        };
      });
      return {
        resolvedMarkers: inputOrder,
        // Larger bubbles first so smaller ones stay on top.
        markerDrawOrder: [...inputOrder].sort((a, b) => b.radius - a.radius),
      };
    }, [
      markers,
      minRadius,
      maxRadius,
      bubbleSize,
      valueFormat,
      safeMarkerRadius,
    ]);
    const regionFeatures = useMemo(() => {
      if (!regionGeoJson) return [];
      return regionGeoJson.features.flatMap((feature, index) => {
        const rawName = feature.properties?.[regionNameProperty];
        if (typeof rawName !== "string" && typeof rawName !== "number") {
          return [];
        }
        const geometry = toRegionGeometry(feature.geometry);
        if (!geometry) return [];
        const centroid = geoCentroid(geometry as GeoPermissibleObjects);
        return [
          {
            name: String(rawName),
            index,
            geometry,
            centroid,
            angularRadius: regionAngularRadius(geometry, centroid),
          },
        ];
      });
    }, [regionGeoJson, regionNameProperty]);
    const resolvedRegions = useMemo<ResolvedGlobeRegion[]>(() => {
      if (regionFeatures.length === 0 || regions.length === 0) return [];
      const regionByName = new Map<string, GlobeMapRegion>();
      let minValue = Number.POSITIVE_INFINITY;
      let maxValue = Number.NEGATIVE_INFINITY;
      for (const region of regions) {
        if (!Number.isFinite(region.value)) continue;
        regionByName.set(region.name, region);
        minValue = Math.min(minValue, region.value);
        maxValue = Math.max(maxValue, region.value);
      }
      const colors = regionColorRange ?? palette.scale;
      const valueRange = maxValue - minValue;

      return regionFeatures.flatMap((feature) => {
        const region = regionByName.get(feature.name);
        if (!region) return [];
        return [
          {
            key: `region:${feature.name}-${feature.index}`,
            region,
            label: region.label ?? region.name,
            geometry: feature.geometry,
            color:
              region.color ??
              colorAt(
                colors,
                valueRange > 0 ? (region.value - minValue) / valueRange : 1,
              ),
            value: valueFormat(region.value),
            centroid: feature.centroid,
            angularRadius: feature.angularRadius,
          },
        ];
      });
    }, [regionFeatures, regions, regionColorRange, palette, valueFormat]);
    const regionPatternPrefix = useId();
    const safeAutoRotateSpeed = Math.max(
      -60,
      Math.min(60, finiteNumber(autoRotateSpeed, 4)),
    );
    const projection = useMemo(
      () =>
        geoOrthographic()
          .translate([GLOBE_VIEWBOX_SIZE / 2, GLOBE_VIEWBOX_SIZE / 2])
          .scale(GLOBE_RADIUS)
          .clipAngle(90)
          .rotate(rotation),
      [rotation],
    );
    const path = useMemo(() => geoPath(projection).digits(1), [projection]);
    // Regions fully on the front side need no horizon clipping, which is most
    // of the cost of projecting them every frame.
    const unclippedPath = useMemo(
      () =>
        geoPath(
          geoOrthographic()
            .translate([GLOBE_VIEWBOX_SIZE / 2, GLOBE_VIEWBOX_SIZE / 2])
            .scale(GLOBE_RADIUS)
            .rotate(rotation)
            .preclip((stream) => stream)
            .precision(0),
        ).digits(1),
      [rotation],
    );
    const spherePath = getGlobeSpherePath();
    const graticulePath = useMemo(
      () => (showGraticule ? (path(GLOBE_GRATICULE) ?? undefined) : undefined),
      [path, showGraticule],
    );
    const landPath = useMemo(() => path(GLOBE_LAND) ?? undefined, [path]);
    const hatchTransform = useMemo(
      () => hatchPatternTransform(rotation, safeHatchSpacing),
      [rotation, safeHatchSpacing],
    );
    const center = useMemo(
      () =>
        projection.invert?.([GLOBE_VIEWBOX_SIZE / 2, GLOBE_VIEWBOX_SIZE / 2]),
      [projection],
    );
    const regionPaths = useMemo(
      () =>
        resolvedRegions.flatMap((region, index) => {
          const distance = center
            ? geoDistance(center, region.centroid)
            : undefined;
          let project = path;
          if (distance !== undefined) {
            if (distance - region.angularRadius > Math.PI / 2) return [];
            if (
              distance + region.angularRadius <
              Math.PI / 2 - HORIZON_MARGIN
            ) {
              project = unclippedPath;
            }
          }
          const d = project(region.geometry as GeoPermissibleObjects);
          return d
            ? [{ region, d, patternId: `${regionPatternPrefix}-${index}` }]
            : [];
        }),
      [resolvedRegions, path, unclippedPath, center, regionPatternPrefix],
    );

    const onUserRotationChangeRef = useRef(onUserRotationChange);
    useIsomorphicLayoutEffect(() => {
      onUserRotationChangeRef.current = onUserRotationChange;
    }, [onUserRotationChange]);
    const updateRotation = useCallback(
      (nextRotation: [number, number, number], notify = false) => {
        rotationRef.current = nextRotation;
        setRotation(nextRotation);
        if (notify) onUserRotationChangeRef.current?.(nextRotation);
      },
      [],
    );

    const activeMarker = useSettledValue(activeMarkerProp ?? null, activeDelay);
    const activeRegion = useSettledValue(activeRegionProp ?? null, activeDelay);
    const activeTarget = useMemo<GlobeActiveTarget | null>(() => {
      if (activeMarker != null) {
        const resolved = resolvedMarkers.find(
          (candidate) => candidate.marker.name === activeMarker,
        );
        if (resolved) {
          return {
            key: resolved.key,
            coordinates: [resolved.marker.longitude, resolved.marker.latitude],
            label: resolved.tooltipLabel,
            detail: resolved.tooltipDetail,
            radius: resolved.radius,
          };
        }
      }
      if (activeRegion != null) {
        const resolved = resolvedRegions.find(
          (candidate) => candidate.region.name === activeRegion,
        );
        if (resolved) {
          return {
            key: resolved.key,
            coordinates: resolved.centroid,
            label: resolved.label,
            detail: resolved.value,
            radius: 0,
          };
        }
      }
      return null;
    }, [activeMarker, activeRegion, resolvedMarkers, resolvedRegions]);
    const activeKey = activeTarget?.key ?? null;
    const activeLongitude = activeTarget?.coordinates[0];
    const activeLatitude = activeTarget?.coordinates[1];

    const isActiveRef = useRef(false);
    useEffect(() => {
      isActiveRef.current = activeKey !== null;
    }, [activeKey]);

    // Fly to the active item, then show its tooltip. Dragging cancels.
    const [arrivedKey, setArrivedKey] = useState<string | null>(null);
    // Reset on every change so re-focusing an item waits for its flight.
    const [arrivalFor, setArrivalFor] = useState(activeKey);
    if (arrivalFor !== activeKey) {
      setArrivalFor(activeKey);
      setArrivedKey(null);
    }
    useEffect(() => {
      if (
        activeKey === null ||
        activeLongitude === undefined ||
        activeLatitude === undefined
      ) {
        return;
      }
      const from = rotationRef.current;
      const deltaLongitude =
        ((((-activeLongitude - from[0]) % 360) + 540) % 360) - 180;
      const deltaLatitude =
        Math.max(-90, Math.min(90, -activeLatitude)) - from[1];
      const settle = () => {
        updateRotation([
          from[0] + deltaLongitude,
          from[1] + deltaLatitude,
          from[2],
        ]);
        setArrivedKey(activeKey);
      };

      let frame: number | null = null;
      if (prefersReducedMotion()) {
        frame = requestAnimationFrame(settle);
      } else {
        const duration = flyToDuration(deltaLongitude, deltaLatitude);
        let startTime: number | null = null;
        const step = (time: number) => {
          if (startTime === null) {
            startTime = time;
            setArrivedKey(null);
          }
          if (dragRef.current) {
            frame = null;
            setArrivedKey(activeKey);
            return;
          }
          const progress = Math.min(1, (time - startTime) / duration);
          if (progress >= 1) {
            frame = null;
            settle();
            return;
          }
          const eased = easeOutCubic(progress);
          updateRotation([
            from[0] + deltaLongitude * eased,
            from[1] + deltaLatitude * eased,
            from[2],
          ]);
          frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      }
      return () => {
        if (frame !== null) cancelAnimationFrame(frame);
      };
    }, [activeKey, activeLongitude, activeLatitude, updateRotation]);

    const markersInDrawOrder = useMemo(() => {
      const active = markerDrawOrder.find((marker) => marker.key === activeKey);
      return active
        ? [...markerDrawOrder.filter((marker) => marker !== active), active]
        : markerDrawOrder;
    }, [markerDrawOrder, activeKey]);
    // Hover only pauses auto-rotation when there is something to inspect.
    const canInspect =
      onMarkerClick !== undefined ||
      (showTooltip && (markers.length > 0 || resolvedRegions.length > 0));

    // Active tooltip anchor in view-box units; hidden on the far side.
    const activeAnchor = useMemo(() => {
      if (!showTooltip || !activeTarget || arrivedKey !== activeTarget.key) {
        return null;
      }
      if (
        center &&
        geoDistance(center, activeTarget.coordinates) > Math.PI / 2
      ) {
        return null;
      }
      const point = projection(activeTarget.coordinates);
      if (!point) return null;
      return {
        label: activeTarget.label,
        detail: activeTarget.detail,
        x: point[0],
        top: point[1] - activeTarget.radius,
        bottom: point[1] + activeTarget.radius,
      };
    }, [showTooltip, activeTarget, arrivedKey, center, projection]);
    const shownTooltip = tooltip ?? activeAnchor;

    useEffect(() => {
      if (!autoRotate) return;
      if (prefersReducedMotion()) return;

      let frame: number | null = null;
      let previousTime: number | null = null;
      const rotate = (time: number) => {
        if (
          dragRef.current ||
          isFocusedRef.current ||
          isHoveredRef.current ||
          isActiveRef.current
        ) {
          previousTime = time;
        } else if (
          previousTime !== null &&
          time - previousTime >= AUTO_ROTATE_INTERVAL
        ) {
          const deltaSeconds = Math.min((time - previousTime) / 1000, 0.1);
          const current = rotationRef.current;
          updateRotation([
            current[0] + safeAutoRotateSpeed * deltaSeconds,
            current[1],
            current[2],
          ]);
          previousTime = time;
        }
        if (previousTime === null) previousTime = time;
        frame = requestAnimationFrame(rotate);
      };
      const start = () => {
        if (frame === null) frame = requestAnimationFrame(rotate);
      };
      const stop = () => {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        previousTime = null;
      };
      const observer =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(([entry]) => {
              if (entry?.isIntersecting) start();
              else stop();
            });

      if (observer && svgRef.current) observer.observe(svgRef.current);
      else start();
      return () => {
        observer?.disconnect();
        stop();
      };
    }, [autoRotate, safeAutoRotateSpeed, updateRotation]);

    const showMarkerTooltip = useCallback(
      (element: SVGGElement, resolved: ResolvedGlobeMarker) => {
        if (!showTooltip) return;
        const svgBounds = element.ownerSVGElement?.getBoundingClientRect();
        if (!svgBounds) return;
        // Anchor to the visible circle, not the larger hit area.
        const markerBounds = (
          element.querySelector("[data-globe-marker-visual]") ?? element
        ).getBoundingClientRect();
        setTooltip({
          label: resolved.tooltipLabel,
          detail: resolved.tooltipDetail,
          x: markerBounds.left + markerBounds.width / 2 - svgBounds.left,
          anchorTop: markerBounds.top - svgBounds.top,
          anchorBottom: markerBounds.bottom - svgBounds.top,
        });
      },
      [showTooltip],
    );

    const showRegionTooltip = useCallback(
      (
        event: ReactPointerEvent<SVGPathElement>,
        resolved: ResolvedGlobeRegion,
      ) => {
        if (!showTooltip || dragRef.current) return;
        const svgBounds =
          event.currentTarget.ownerSVGElement?.getBoundingClientRect();
        if (!svgBounds) return;
        const x = event.clientX - svgBounds.left;
        const y = event.clientY - svgBounds.top;
        setTooltip({
          label: resolved.label,
          detail: resolved.value,
          x,
          anchorTop: y - REGION_TOOLTIP_POINTER_OFFSET,
          anchorBottom: y + REGION_TOOLTIP_POINTER_OFFSET * 2,
        });
      },
      [showTooltip],
    );

    // Place above the item, flip below near the top, clamp horizontally.
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    useIsomorphicLayoutEffect(() => {
      const node = tooltipRef.current;
      if (!node) return;
      // Hover tooltips are in CSS pixels; the active anchor is in view-box units.
      let anchor: Pick<
        GlobeTooltip,
        "x" | "anchorTop" | "anchorBottom"
      > | null = tooltip;
      if (!anchor && activeAnchor) {
        const bounds = svgRef.current?.getBoundingClientRect();
        if (!bounds) return;
        const scale =
          Math.min(bounds.width, bounds.height) / GLOBE_VIEWBOX_SIZE;
        const offsetX = (bounds.width - GLOBE_VIEWBOX_SIZE * scale) / 2;
        const offsetY = (bounds.height - GLOBE_VIEWBOX_SIZE * scale) / 2;
        anchor = {
          x: offsetX + activeAnchor.x * scale,
          anchorTop: offsetY + activeAnchor.top * scale,
          anchorBottom: offsetY + activeAnchor.bottom * scale,
        };
      }
      if (!anchor) return;
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const containerWidth = node.parentElement?.clientWidth ?? 0;
      let left = anchor.x - width / 2;
      if (containerWidth > 0) {
        left = Math.max(
          TOOLTIP_EDGE_PADDING,
          Math.min(left, containerWidth - width - TOOLTIP_EDGE_PADDING),
        );
      }
      let top = anchor.anchorTop - TOOLTIP_GAP - height;
      if (top < TOOLTIP_EDGE_PADDING) {
        top = anchor.anchorBottom + TOOLTIP_GAP;
      }
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      node.style.visibility = "visible";
    }, [tooltip, activeAnchor]);

    const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
      if (!draggable) return;
      if (event.isPrimary === false || event.button !== 0) return;
      if (
        event.target instanceof Element &&
        event.target.closest('[data-globe-marker-interactive="true"]')
      ) {
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        rotation: rotationRef.current,
      };
      setTooltip(null);
    };
    const applyPointerMove = useCallback(
      (pointerId: number, x: number, y: number) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== pointerId) return;
        const deltaX = x - drag.x;
        const deltaY = y - drag.y;
        updateRotation(
          [
            drag.rotation[0] + deltaX * 0.3,
            Math.max(-90, Math.min(90, drag.rotation[1] - deltaY * 0.3)),
            drag.rotation[2],
          ],
          true,
        );
      },
      [updateRotation],
    );
    const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      pendingPointerMoveRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      if (pointerMoveFrameRef.current !== null) return;
      pointerMoveFrameRef.current = requestAnimationFrame(() => {
        pointerMoveFrameRef.current = null;
        const pending = pendingPointerMoveRef.current;
        pendingPointerMoveRef.current = null;
        if (pending) applyPointerMove(pending.pointerId, pending.x, pending.y);
      });
    };
    const finishPointerDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
      if (dragRef.current?.pointerId !== event.pointerId) return;
      if (pointerMoveFrameRef.current !== null) {
        cancelAnimationFrame(pointerMoveFrameRef.current);
        pointerMoveFrameRef.current = null;
      }
      const pending = pendingPointerMoveRef.current;
      pendingPointerMoveRef.current = null;
      if (pending) applyPointerMove(pending.pointerId, pending.x, pending.y);
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    };

    useEffect(
      () => () => {
        if (pointerMoveFrameRef.current !== null) {
          cancelAnimationFrame(pointerMoveFrameRef.current);
        }
      },
      [],
    );

    return (
      <div
        ref={ref}
        className={cn("relative w-full overflow-hidden", className)}
        style={height === undefined ? { aspectRatio: "1" } : { height }}
        onFocusCapture={(event) => {
          isFocusedRef.current = isFocusVisible(event.target);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            isFocusedRef.current = false;
          }
        }}
      >
        {draggable ? (
          <span id={instructionsId} className="sr-only">
            Use the arrow keys to rotate the globe.
          </span>
        ) : null}
        <svg
          ref={svgRef}
          role="group"
          aria-label={ariaLabel}
          aria-describedby={draggable ? instructionsId : undefined}
          tabIndex={draggable ? 0 : undefined}
          viewBox={`0 0 ${GLOBE_VIEWBOX_SIZE} ${GLOBE_VIEWBOX_SIZE}`}
          className={cn(
            "group/globe block size-full outline-none select-none",
            draggable && "cursor-grab touch-none active:cursor-grabbing",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointerDrag}
          onPointerCancel={finishPointerDrag}
          onLostPointerCapture={(event) => {
            if (dragRef.current?.pointerId === event.pointerId) {
              dragRef.current = null;
            }
          }}
          onKeyDown={(event) => {
            if (!draggable || event.target !== event.currentTarget) return;
            if (
              event.key !== "ArrowLeft" &&
              event.key !== "ArrowRight" &&
              event.key !== "ArrowUp" &&
              event.key !== "ArrowDown"
            ) {
              return;
            }
            event.preventDefault();
            // Arrow keys after a click make focus keyboard-driven.
            isFocusedRef.current = true;
            const [longitude, latitude, roll] = rotationRef.current;
            const nextRotation: [number, number, number] =
              event.key === "ArrowLeft"
                ? [longitude - 10, latitude, roll]
                : event.key === "ArrowRight"
                  ? [longitude + 10, latitude, roll]
                  : event.key === "ArrowUp"
                    ? [longitude, Math.min(90, latitude + 10), roll]
                    : event.key === "ArrowDown"
                      ? [longitude, Math.max(-90, latitude - 10), roll]
                      : [longitude, latitude, roll];
            if (nextRotation[0] === longitude && nextRotation[1] === latitude) {
              return;
            }
            updateRotation(nextRotation, true);
          }}
          onPointerLeave={() => {
            isHoveredRef.current = false;
            if (!dragRef.current) setTooltip(null);
          }}
        >
          <defs>
            <pattern
              id={landPatternId}
              width={safeHatchSpacing}
              height={HATCH_TILE_LENGTH}
              patternUnits="userSpaceOnUse"
              patternTransform={hatchTransform}
            >
              <line
                x1={safeHatchSpacing / 2}
                y1="0"
                x2={safeHatchSpacing / 2}
                y2={HATCH_TILE_LENGTH}
                stroke={resolvedLandColor}
                strokeOpacity={landColor === undefined ? 0.75 : undefined}
                strokeWidth={1.25}
              />
            </pattern>
            {/* Region patterns share the land hatch geometry, so coloured
                lines sit exactly over the neutral land lines. */}
            {regionPaths.map(({ region, patternId }) => (
              <pattern
                key={region.key}
                id={patternId}
                width={safeHatchSpacing}
                height={HATCH_TILE_LENGTH}
                patternUnits="userSpaceOnUse"
                patternTransform={hatchTransform}
              >
                <line
                  x1={safeHatchSpacing / 2}
                  y1="0"
                  x2={safeHatchSpacing / 2}
                  y2={HATCH_TILE_LENGTH}
                  stroke={region.color}
                  strokeWidth={region.key === activeKey ? 2.5 : 1.5}
                />
              </pattern>
            ))}
          </defs>
          {/* Hovering anywhere on the globe (ocean, land or markers) with a
              mouse or pen pauses auto-rotation, so markers and their tooltips
              hold still while being inspected. A purely decorative globe
              (nothing to hover) keeps spinning. */}
          <g
            data-globe-hover-area=""
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch" && canInspect) {
                isHoveredRef.current = true;
              }
            }}
            onPointerLeave={() => {
              isHoveredRef.current = false;
            }}
          >
            <path
              d={spherePath}
              fill={oceanColor}
              // Keep the whole disc hoverable even with a transparent/none ocean.
              pointerEvents="visible"
              className="stroke-kumo-line"
              strokeWidth={1.5}
            />
            {showGraticule ? (
              <path
                d={graticulePath}
                fill="none"
                className="stroke-kumo-line"
                strokeWidth={0.75}
              />
            ) : null}
            <path
              data-land-style="hatched"
              d={landPath}
              fill={`url(#${landPatternId})`}
              className="pointer-events-none"
            />
            {regionPaths.map(({ region, d, patternId }) => (
              <path
                key={region.key}
                data-globe-region={region.region.name}
                d={d}
                fill={`url(#${patternId})`}
                onPointerEnter={(event) => showRegionTooltip(event, region)}
                onPointerMove={(event) => showRegionTooltip(event, region)}
                onPointerLeave={() => setTooltip(null)}
              />
            ))}
            <path
              data-globe-outline=""
              d={spherePath}
              fill="none"
              className="pointer-events-none stroke-kumo-line group-focus-visible/globe:stroke-kumo-brand group-focus-visible/globe:stroke-3"
              strokeWidth={2}
            />
            {markersInDrawOrder.map((resolved) => {
              const { marker, radius } = resolved;
              const isActive = resolved.key === activeKey;
              const position = projection([marker.longitude, marker.latitude]);
              const isVisible =
                center &&
                geoDistance(center, [marker.longitude, marker.latitude]) <=
                  Math.PI / 2;
              const activateMarker = () => {
                onMarkerClick?.(marker);
              };
              if (!position || !isVisible) return null;
              const isInteractive = onMarkerClick !== undefined;
              const distanceFromCenter = Math.hypot(
                position[0] - GLOBE_VIEWBOX_SIZE / 2,
                position[1] - GLOBE_VIEWBOX_SIZE / 2,
              );
              const edgeOpacity = Math.max(
                0,
                Math.min(
                  1,
                  (GLOBE_RADIUS - distanceFromCenter) /
                    MARKER_EDGE_FADE_DISTANCE,
                ),
              );
              return (
                <g
                  key={resolved.key}
                  // One attribute per marker per frame instead of cx/cy on each circle.
                  transform={`translate(${position[0].toFixed(1)} ${position[1].toFixed(1)})`}
                  opacity={edgeOpacity}
                  className={cn(
                    "outline-none focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kumo-brand",
                    isInteractive && "cursor-pointer",
                  )}
                  data-globe-marker=""
                  data-globe-marker-active={isActive || undefined}
                  data-globe-marker-interactive={isInteractive}
                  role={isInteractive ? "button" : undefined}
                  aria-label={isInteractive ? resolved.label : undefined}
                  aria-hidden={isInteractive ? undefined : true}
                  tabIndex={isInteractive ? 0 : undefined}
                  onPointerEnter={(event) =>
                    showMarkerTooltip(event.currentTarget, resolved)
                  }
                  onPointerLeave={() => setTooltip(null)}
                  onFocus={(event) =>
                    showMarkerTooltip(event.currentTarget, resolved)
                  }
                  onBlur={() => setTooltip(null)}
                  onClick={isInteractive ? activateMarker : undefined}
                  onKeyDown={
                    isInteractive
                      ? (event) => {
                          if (event.key !== "Enter" && event.key !== " ")
                            return;
                          event.preventDefault();
                          activateMarker();
                        }
                      : undefined
                  }
                >
                  <circle
                    r={radius > 0 ? radius + MARKER_HIT_PADDING : 0}
                    fill="transparent"
                    data-globe-marker-hit-area=""
                    aria-hidden="true"
                  />
                  {isActive && radius > 0 ? (
                    <circle
                      r={radius + ACTIVE_MARKER_HALO}
                      fill={marker.color ?? resolvedMarkerColor}
                      fillOpacity={0.25}
                      className="pointer-events-none"
                      data-globe-marker-halo=""
                      aria-hidden="true"
                    />
                  ) : null}
                  <circle
                    r={radius}
                    fill={marker.color ?? resolvedMarkerColor}
                    fillOpacity={
                      !isActive && safeMarkerOpacity < 1
                        ? safeMarkerOpacity
                        : undefined
                    }
                    stroke={
                      safeMarkerBorderWidth > 0 ? markerBorderColor : undefined
                    }
                    className={cn(
                      "pointer-events-none",
                      safeMarkerBorderWidth > 0 &&
                        markerBorderColor === undefined &&
                        "stroke-kumo-base",
                    )}
                    strokeWidth={
                      safeMarkerBorderWidth > 0
                        ? safeMarkerBorderWidth
                        : undefined
                    }
                    data-globe-marker-visual=""
                    aria-hidden="true"
                  />
                </g>
              );
            })}
          </g>
        </svg>
        {onMarkerClick === undefined && markers.length > 0 ? (
          <ul className="sr-only" aria-label={`${ariaLabel} locations`}>
            {resolvedMarkers.map((resolved) => (
              <li key={resolved.key}>{resolved.label}</li>
            ))}
          </ul>
        ) : null}
        {resolvedRegions.length > 0 ? (
          <ul className="sr-only" aria-label={`${ariaLabel} regions`}>
            {resolvedRegions.map((resolved) => (
              <li key={resolved.key}>
                {resolved.label}: {resolved.value}
              </li>
            ))}
          </ul>
        ) : null}
        {shownTooltip ? (
          <div
            ref={tooltipRef}
            role="tooltip"
            className="pointer-events-none invisible absolute top-0 left-0 z-10 flex max-w-[calc(100%-8px)] items-center gap-2 rounded-md border border-kumo-line bg-kumo-base px-2 py-1 text-xs whitespace-nowrap text-kumo-default shadow-md"
          >
            <span className="min-w-0 truncate">{shownTooltip.label}</span>
            {shownTooltip.detail ? (
              <span className="shrink-0 text-kumo-subtle tabular-nums">
                {shownTooltip.detail}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }),
  { displayName: "GlobeMap" },
);
