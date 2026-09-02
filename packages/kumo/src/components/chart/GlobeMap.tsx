import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { ChartPalette } from "./Color";
import { isCanonicalLand } from "./globe-land-mask";

export interface GlobeMapMarker {
  /** Longitude in decimal degrees. */
  longitude: number;
  /** Latitude in decimal degrees. */
  latitude: number;
  /** Primary tooltip label. */
  name: string;
  /** Optional secondary tooltip text. */
  description?: string;
  /** Marker fill. Overrides `markerColor`. */
  color?: string;
  /** Marker radius in view-box pixels. Overrides `markerRadius`. */
  radius?: number;
}

export interface GlobeMapProps {
  /** Fill for the dotted land. Defaults to the neutral Kumo map area color. */
  landColor?: string;
  /** Spacing between land-dot centers in view-box pixels. Default: `10`. */
  landDotSpacing?: number;
  /** Fill behind the land and graticule. Default: the Kumo base surface. */
  oceanColor?: string;
  /** Geographic points drawn above the land. Back-facing points are clipped. */
  markers?: GlobeMapMarker[];
  /** Default marker fill. Defaults to the Kumo chart blue. */
  markerColor?: string;
  /** Default marker radius in view-box pixels. Default: `7`. */
  markerRadius?: number;
  /** Called when a visible marker is clicked. */
  onMarkerClick?: (marker: GlobeMapMarker) => void;
  /** Initial globe rotation as `[longitude, latitude, roll]`. */
  rotation?: [number, number, number];
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
  /** Called after pointer dragging changes the globe rotation. */
  onRotationChange?: (rotation: [number, number, number]) => void;
  /** Accessible label for the visualization. Default: `"Interactive globe map"`. */
  "aria-label"?: string;
  /** Fixed component height. Otherwise the globe uses a square aspect ratio. */
  height?: number;
  className?: string;
  isDarkMode?: boolean;
}

interface GlobeTooltip {
  name: string;
  detail: string;
  x: number;
  y: number;
}

const GLOBE_VIEWBOX_SIZE = 640;
const GLOBE_PADDING = 18;
const GLOBE_RADIUS = GLOBE_VIEWBOX_SIZE / 2 - GLOBE_PADDING;
interface GlobeLandDot {
  x: number;
  y: number;
  z: number;
}

interface GlobeScreenDot {
  projectedX: number;
  projectedY: number;
  depth: number;
  command: string;
}

interface GlobeRotationTransform {
  cosLongitude: number;
  sinLongitude: number;
  cosLatitude: number;
  sinLatitude: number;
  cosRoll: number;
  sinRoll: number;
}

const GLOBE_SPHERE_PATH = `M${GLOBE_VIEWBOX_SIZE / 2 - GLOBE_RADIUS},${GLOBE_VIEWBOX_SIZE / 2}a${GLOBE_RADIUS},${GLOBE_RADIUS} 0 1,0 ${GLOBE_RADIUS * 2},0a${GLOBE_RADIUS},${GLOBE_RADIUS} 0 1,0 -${GLOBE_RADIUS * 2},0`;
const globeDotCoordinateCache = new Map<number, GlobeScreenDot[]>();

function toCartesian(longitude: number, latitude: number): GlobeLandDot {
  const longitudeRadians = (longitude * Math.PI) / 180;
  const latitudeRadians = (latitude * Math.PI) / 180;
  const cosLatitude = Math.cos(latitudeRadians);
  return {
    x: Math.cos(longitudeRadians) * cosLatitude,
    y: Math.sin(longitudeRadians) * cosLatitude,
    z: Math.sin(latitudeRadians),
  };
}

function createRotationTransform(
  rotation: [number, number, number],
): GlobeRotationTransform {
  const [longitude, latitude, roll] = rotation.map(
    (degrees) => (degrees * Math.PI) / 180,
  );
  return {
    cosLongitude: Math.cos(longitude),
    sinLongitude: Math.sin(longitude),
    cosLatitude: Math.cos(latitude),
    sinLatitude: Math.sin(latitude),
    cosRoll: Math.cos(roll),
    sinRoll: Math.sin(roll),
  };
}

function projectVector(
  point: GlobeLandDot,
  transform: GlobeRotationTransform,
  output: [number, number, number],
): void {
  const rotatedX =
    point.x * transform.cosLongitude - point.y * transform.sinLongitude;
  const rotatedY =
    point.y * transform.cosLongitude + point.x * transform.sinLongitude;
  const latitudeAxis =
    point.z * transform.cosLatitude + rotatedX * transform.sinLatitude;
  output[2] =
    rotatedX * transform.cosLatitude - point.z * transform.sinLatitude;
  output[0] =
    GLOBE_VIEWBOX_SIZE / 2 +
    GLOBE_RADIUS *
      (rotatedY * transform.cosRoll - latitudeAxis * transform.sinRoll);
  output[1] =
    GLOBE_VIEWBOX_SIZE / 2 -
    GLOBE_RADIUS *
      (latitudeAxis * transform.cosRoll + rotatedY * transform.sinRoll);
}

const globeGraticuleLines: GlobeLandDot[][] = (() => {
  const lines: GlobeLandDot[][] = [];
  for (let longitude = -180; longitude < 180; longitude += 15) {
    const line: GlobeLandDot[] = [];
    for (let latitude = -88; latitude <= 88; latitude += 4) {
      line.push(toCartesian(longitude, latitude));
    }
    lines.push(line);
  }
  for (let latitude = -80; latitude <= 80; latitude += 10) {
    const line: GlobeLandDot[] = [];
    for (let longitude = -180; longitude <= 180; longitude += 4) {
      line.push(toCartesian(longitude, latitude));
    }
    lines.push(line);
  }
  return lines;
})();

function createGraticulePath(
  rotation: [number, number, number],
): string | undefined {
  const transform = createRotationTransform(rotation);
  const projected: [number, number, number] = [0, 0, 0];
  const commands: string[] = [];

  for (const line of globeGraticuleLines) {
    let previousX = 0;
    let previousY = 0;
    let previousDepth = -1;
    for (const point of line) {
      projectVector(point, transform, projected);
      const [x, y, depth] = projected;
      if (depth > 0) {
        if (previousDepth <= 0) {
          if (previousDepth !== -1) {
            const ratio = depth / (depth - previousDepth);
            commands.push(
              `M${(x + (previousX - x) * ratio).toFixed(2)},${(y + (previousY - y) * ratio).toFixed(2)}`,
            );
          } else {
            commands.push(`M${x.toFixed(2)},${y.toFixed(2)}`);
          }
        }
        commands.push(`L${x.toFixed(2)},${y.toFixed(2)}`);
      } else if (previousDepth > 0) {
        const ratio = previousDepth / (previousDepth - depth);
        commands.push(
          `L${(previousX + (x - previousX) * ratio).toFixed(2)},${(previousY + (y - previousY) * ratio).toFixed(2)}`,
        );
      }
      previousX = x;
      previousY = y;
      previousDepth = depth;
    }
  }
  return commands.join("") || undefined;
}

function createDottedLandPath(
  dots: GlobeScreenDot[],
  rotation: [number, number, number],
): string | undefined {
  const {
    cosLongitude,
    sinLongitude,
    cosLatitude,
    sinLatitude,
    cosRoll,
    sinRoll,
  } = createRotationTransform(rotation);
  const commands: string[] = [];

  // Keep a stable screen-space lattice and inverse-project each point into the
  // rotating land mask. Only membership changes; dot geometry never moves.
  for (const dot of dots) {
    const rotatedY = dot.projectedX * cosRoll + dot.projectedY * sinRoll;
    const latitudeAxis = dot.projectedY * cosRoll - dot.projectedX * sinRoll;
    const rotatedX = dot.depth * cosLatitude + latitudeAxis * sinLatitude;
    const worldZ = latitudeAxis * cosLatitude - dot.depth * sinLatitude;
    const worldX = rotatedX * cosLongitude + rotatedY * sinLongitude;
    const worldY = rotatedY * cosLongitude - rotatedX * sinLongitude;
    const longitude = (Math.atan2(worldY, worldX) * 180) / Math.PI;
    const latitude =
      (Math.asin(Math.max(-1, Math.min(1, worldZ))) * 180) / Math.PI;
    if (isCanonicalLand(longitude, latitude)) commands.push(dot.command);
  }
  return commands.join("") || undefined;
}

function createMarkerPath(
  point: GlobeLandDot,
  transform: GlobeRotationTransform,
  radius: number,
): string | undefined {
  const projected: [number, number, number] = [0, 0, 0];
  projectVector(point, transform, projected);
  if (projected[2] <= 0) return undefined;
  const x = Number(projected[0].toFixed(2));
  const y = Number(projected[1].toFixed(2));
  const diameter = radius * 2;
  return `M${x - radius},${y}a${radius},${radius} 0 1,0 ${diameter},0a${radius},${radius} 0 1,0 -${diameter},0`;
}

/**
 * GlobeMap — an SVG orthographic globe with dotted land and geographic
 * markers. Land boundaries are used only for dot placement and are never
 * drawn. Rendering is SVG-only and does not use WebGL.
 */
export function GlobeMap({
  landColor,
  landDotSpacing = 10,
  oceanColor = "var(--color-kumo-base)",
  markers = [],
  markerColor,
  markerRadius = 7,
  onMarkerClick,
  rotation = [-10, -20, 0],
  draggable = true,
  autoRotate = false,
  autoRotateSpeed = 4,
  showGraticule = false,
  showTooltip = true,
  onRotationChange,
  "aria-label": ariaLabel = "Interactive globe map",
  height,
  className,
  isDarkMode,
}: GlobeMapProps) {
  const currentRotationRef = useRef(rotation);
  const fadeMaskId = `kumo-globe-fade-${useId().replaceAll(":", "")}`;
  const [tooltip, setTooltip] = useState<GlobeTooltip | null>(null);
  const didDragRef = useRef(false);
  const autoRotateFrameRef = useRef<number | null>(null);
  const autoRotateObserverRef = useRef<IntersectionObserver | null>(null);
  const autoRotateTimeRef = useRef<number | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const landPathRef = useRef<SVGPathElement | null>(null);
  const graticulePathRef = useRef<SVGPathElement | null>(null);
  const markerPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const pendingRotationRef = useRef<[number, number, number] | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    rotation: [number, number, number];
  } | null>(null);

  const palette = useMemo(
    () => ChartPalette.mapColors(isDarkMode),
    [isDarkMode],
  );
  const resolvedLandColor = landColor ?? palette.area;
  const resolvedMarkerColor = markerColor ?? palette.bubble;
  const markerCoordinates = useMemo(
    () =>
      markers.map((marker) => toCartesian(marker.longitude, marker.latitude)),
    [markers],
  );
  const currentRotationTransform = createRotationTransform(
    currentRotationRef.current,
  );

  const spherePath = GLOBE_SPHERE_PATH;
  const graticulePath = showGraticule
    ? createGraticulePath(currentRotationRef.current)
    : undefined;
  const dottedLandDots = useMemo(() => {
    if (landDotSpacing <= 0) return [];

    const cached = globeDotCoordinateCache.get(landDotSpacing);
    if (cached) return cached;

    const dots: GlobeScreenDot[] = [];
    const radius = Number((landDotSpacing * 0.28).toFixed(2));
    const diameter = radius * 2;
    const start = GLOBE_VIEWBOX_SIZE / 2 - GLOBE_RADIUS;
    const end = GLOBE_VIEWBOX_SIZE / 2 + GLOBE_RADIUS;
    for (let y = start + landDotSpacing / 2; y < end; y += landDotSpacing) {
      for (let x = start + landDotSpacing / 2; x < end; x += landDotSpacing) {
        const projectedX = (x - GLOBE_VIEWBOX_SIZE / 2) / GLOBE_RADIUS;
        const projectedY = (GLOBE_VIEWBOX_SIZE / 2 - y) / GLOBE_RADIUS;
        const squaredDistance =
          projectedX * projectedX + projectedY * projectedY;
        if (squaredDistance >= 1) continue;
        dots.push({
          projectedX,
          projectedY,
          depth: Math.sqrt(1 - squaredDistance),
          command: `M${x - radius},${y}a${radius},${radius} 0 1,0 ${diameter},0a${radius},${radius} 0 1,0 -${diameter},0`,
        });
      }
    }
    globeDotCoordinateCache.set(landDotSpacing, dots);
    return dots;
  }, [landDotSpacing]);
  const dottedLandPath = useMemo(
    () => createDottedLandPath(dottedLandDots, currentRotationRef.current),
    [dottedLandDots, landDotSpacing],
  );

  const renderRotation = useCallback(
    (nextRotation: [number, number, number]) => {
      currentRotationRef.current = nextRotation;

      const nextLandPath = createDottedLandPath(dottedLandDots, nextRotation);
      if (nextLandPath) landPathRef.current?.setAttribute("d", nextLandPath);
      else landPathRef.current?.removeAttribute("d");

      if (graticulePathRef.current) {
        const nextGraticulePath = createGraticulePath(nextRotation);
        if (nextGraticulePath) {
          graticulePathRef.current.setAttribute("d", nextGraticulePath);
        }
      }

      const rotationTransform = createRotationTransform(nextRotation);
      markers.forEach((marker, index) => {
        const element = markerPathRefs.current[index];
        if (!element) return;
        const nextMarkerPath = createMarkerPath(
          markerCoordinates[index]!,
          rotationTransform,
          marker.radius ?? markerRadius,
        );
        if (!nextMarkerPath) {
          element.style.display = "none";
          element.setAttribute("aria-hidden", "true");
          element.setAttribute("tabindex", "-1");
          return;
        }
        element.style.removeProperty("display");
        element.removeAttribute("aria-hidden");
        element.setAttribute("tabindex", "0");
        element.setAttribute("d", nextMarkerPath);
      });
    },
    [landDotSpacing, markerCoordinates, markerRadius, markers, dottedLandDots],
  );

  const moveTooltip = useCallback(
    (
      event: ReactPointerEvent<SVGPathElement>,
      tooltipName: string,
      detail: string,
    ) => {
      if (!showTooltip) return;
      const bounds =
        event.currentTarget.ownerSVGElement?.getBoundingClientRect();
      if (!bounds) return;
      setTooltip({
        name: tooltipName,
        detail,
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
    },
    [showTooltip],
  );

  const handleSvgRef = useCallback(
    (node: SVGSVGElement | null) => {
      if (autoRotateFrameRef.current !== null) {
        cancelAnimationFrame(autoRotateFrameRef.current);
        autoRotateFrameRef.current = null;
      }
      autoRotateObserverRef.current?.disconnect();
      autoRotateObserverRef.current = null;
      autoRotateTimeRef.current = null;
      if (!node || !autoRotate) return;

      const rotate = (time: number) => {
        const previousTime = autoRotateTimeRef.current;
        if (previousTime === null) autoRotateTimeRef.current = time;
        if (
          previousTime !== null &&
          time - previousTime >= 1000 / 30 - 2 &&
          !dragRef.current
        ) {
          const deltaSeconds = Math.min((time - previousTime) / 1000, 0.1);
          autoRotateTimeRef.current = time;
          const current = currentRotationRef.current;
          renderRotation([
            current[0] + autoRotateSpeed * deltaSeconds,
            current[1],
            current[2],
          ]);
        }
        autoRotateFrameRef.current = requestAnimationFrame(rotate);
      };
      const start = () => {
        if (autoRotateFrameRef.current !== null) return;
        autoRotateTimeRef.current = null;
        autoRotateFrameRef.current = requestAnimationFrame(rotate);
      };
      const stop = () => {
        if (autoRotateFrameRef.current === null) return;
        cancelAnimationFrame(autoRotateFrameRef.current);
        autoRotateFrameRef.current = null;
        autoRotateTimeRef.current = null;
      };

      if (
        typeof matchMedia === "function" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      if (typeof IntersectionObserver === "undefined") {
        start();
        return;
      }
      autoRotateObserverRef.current = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) start();
        else stop();
      });
      autoRotateObserverRef.current.observe(node);
    },
    [autoRotate, autoRotateSpeed, renderRotation],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (!draggable) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      didDragRef.current = false;
      dragRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        rotation: currentRotationRef.current,
      };
      setTooltip(null);
    },
    [draggable],
  );

  const applyPendingRotation = useCallback(() => {
    dragFrameRef.current = null;
    const next = pendingRotationRef.current;
    pendingRotationRef.current = null;
    if (!next) return;
    renderRotation(next);
    onRotationChange?.(next);
  }, [onRotationChange, renderRotation]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - drag.x;
      const deltaY = event.clientY - drag.y;
      if (Math.hypot(deltaX, deltaY) > 3) didDragRef.current = true;
      pendingRotationRef.current = [
        drag.rotation[0] + deltaX * 0.3,
        Math.max(-90, Math.min(90, drag.rotation[1] - deltaY * 0.3)),
        drag.rotation[2],
      ];
      if (dragFrameRef.current === null) {
        dragFrameRef.current = requestAnimationFrame(applyPendingRotation);
      }
    },
    [applyPendingRotation],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (dragRef.current?.pointerId !== event.pointerId) return;
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
      applyPendingRotation();
    },
    [applyPendingRotation],
  );

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={height === undefined ? { aspectRatio: "1" } : { height }}
    >
      <svg
        ref={handleSvgRef}
        aria-label={ariaLabel}
        viewBox={`0 0 ${GLOBE_VIEWBOX_SIZE} ${GLOBE_VIEWBOX_SIZE}`}
        className={cn(
          "block size-full touch-none select-none",
          draggable && "cursor-grab active:cursor-grabbing",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => {
          if (!dragRef.current) setTooltip(null);
        }}
      >
        <defs>
          <radialGradient
            id={`${fadeMaskId}-gradient`}
            gradientUnits="userSpaceOnUse"
            cx={GLOBE_VIEWBOX_SIZE / 2}
            cy={GLOBE_VIEWBOX_SIZE / 2}
            r={GLOBE_RADIUS}
          >
            <stop offset="82%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
          <mask
            id={fadeMaskId}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={GLOBE_VIEWBOX_SIZE}
            height={GLOBE_VIEWBOX_SIZE}
          >
            <path d={spherePath} fill={`url(#${fadeMaskId}-gradient)`} />
          </mask>
        </defs>
        <path
          d={spherePath}
          fill={oceanColor}
          className="stroke-kumo-line"
          strokeWidth={1.5}
        />
        {showGraticule ? (
          <path
            ref={graticulePathRef}
            d={graticulePath}
            fill="none"
            className="stroke-kumo-line"
            strokeWidth={0.75}
          />
        ) : null}
        <path
          ref={landPathRef}
          data-land-style="dotted"
          d={dottedLandPath}
          fill={resolvedLandColor}
          mask={`url(#${fadeMaskId})`}
          className="pointer-events-none"
        />
        <g>
          {markers.map((marker, index) => {
            const markerPath = createMarkerPath(
              markerCoordinates[index]!,
              currentRotationTransform,
              marker.radius ?? markerRadius,
            );
            const detail =
              marker.description ??
              `${marker.latitude.toFixed(2)}, ${marker.longitude.toFixed(2)}`;
            const activateMarker = () => {
              if (didDragRef.current) {
                didDragRef.current = false;
                return;
              }
              onMarkerClick?.(marker);
            };
            return (
              <path
                key={`${marker.name}-${index}`}
                ref={(node) => {
                  markerPathRefs.current[index] = node;
                }}
                d={markerPath ?? undefined}
                style={markerPath ? undefined : { display: "none" }}
                fill={marker.color ?? resolvedMarkerColor}
                mask={`url(#${fadeMaskId})`}
                strokeWidth={2}
                className="stroke-kumo-base transition-opacity outline-none hover:opacity-80 focus-visible:opacity-80"
                role="button"
                aria-label={`${marker.name}: ${detail}`}
                tabIndex={markerPath ? 0 : -1}
                aria-hidden={markerPath ? undefined : true}
                onPointerEnter={(event) =>
                  moveTooltip(event, marker.name, detail)
                }
                onPointerMove={(event) => {
                  if (!dragRef.current) moveTooltip(event, marker.name, detail);
                }}
                onPointerLeave={() => setTooltip(null)}
                onFocus={(event) => {
                  if (!showTooltip) return;
                  const bounds =
                    event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (!bounds) return;
                  setTooltip({
                    name: marker.name,
                    detail,
                    x: bounds.width / 2,
                    y: bounds.height / 2,
                  });
                }}
                onBlur={() => setTooltip(null)}
                onClick={activateMarker}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  activateMarker();
                }}
              />
            );
          })}
        </g>
        <path
          d={spherePath}
          fill="none"
          className="pointer-events-none stroke-kumo-line"
          strokeWidth={2}
        />
      </svg>
      {tooltip ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col gap-0.5 rounded-lg border border-kumo-line bg-kumo-base px-2 py-1.5 text-xs text-kumo-default shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <strong>{tooltip.name}</strong>
          <span className="text-kumo-subtle">{tooltip.detail}</span>
        </div>
      ) : null}
    </div>
  );
}

GlobeMap.displayName = "GlobeMap";
