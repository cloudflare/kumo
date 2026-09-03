import type { PointerEvent as ReactPointerEvent } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
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
  /** Stroke color for the hatched land. Defaults to the neutral Kumo map area color. */
  landColor?: string;
  /** Spacing between land hatch lines in view-box pixels. Default: `10`. */
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

function createLandHatchPath(
  projection: ReturnType<typeof geoOrthographic>,
  spacing: number,
): string | undefined {
  if (spacing <= 0) return undefined;
  if (!projection.invert) return undefined;

  const commands: string[] = [];
  const sampleStep = 3;
  for (
    let offset = -GLOBE_VIEWBOX_SIZE;
    offset < GLOBE_VIEWBOX_SIZE * 2;
    offset += spacing
  ) {
    let drawing = false;
    for (let y = 0; y <= GLOBE_VIEWBOX_SIZE; y += sampleStep) {
      const x = y + offset;
      const coordinates =
        x >= 0 && x <= GLOBE_VIEWBOX_SIZE ? projection.invert?.([x, y]) : null;
      const onLand =
        coordinates !== null && isCanonicalLand(coordinates[0], coordinates[1]);

      if (onLand && !drawing) {
        commands.push(`M${x.toFixed(1)},${y.toFixed(1)}`);
        drawing = true;
      } else if (onLand) {
        commands.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
      } else {
        drawing = false;
      }
    }
  }
  return commands.join("") || undefined;
}

/**
 * GlobeMap — an SVG orthographic globe with hatched land and geographic
 * markers. Rendering is SVG-only and does not use WebGL.
 */
export const GlobeMap = forwardRef<HTMLDivElement, GlobeMapProps>(
  function GlobeMap(
    {
      landColor,
      landDotSpacing = 10,
      oceanColor = "var(--color-kumo-base)",
      markers = [],
      markerColor,
      markerRadius = 7,
      onMarkerClick,
      rotation: initialRotation = [-10, -20, 0],
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
    },
    ref,
  ) {
    const [rotation, setRotation] = useState(initialRotation);
    const [tooltip, setTooltip] = useState<GlobeTooltip | null>(null);
    const sphereClipId = useId();
    const rotationRef = useRef(rotation);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const dragRef = useRef<{
      pointerId: number;
      x: number;
      y: number;
      rotation: [number, number, number];
    } | null>(null);
    const didDragRef = useRef(false);

    const palette = useMemo(
      () => ChartPalette.mapColors(isDarkMode),
      [isDarkMode],
    );
    const resolvedLandColor = landColor ?? palette.area;
    const resolvedMarkerColor = markerColor ?? palette.bubble;
    const projection = geoOrthographic()
      .translate([GLOBE_VIEWBOX_SIZE / 2, GLOBE_VIEWBOX_SIZE / 2])
      .scale(GLOBE_RADIUS)
      .clipAngle(90)
      .rotate(rotation);
    const path = geoPath(projection);
    const landHatchPath = createLandHatchPath(projection, landDotSpacing);
    const center = projection.invert?.([
      GLOBE_VIEWBOX_SIZE / 2,
      GLOBE_VIEWBOX_SIZE / 2,
    ]);

    const updateRotation = useCallback(
      (nextRotation: [number, number, number], notify = false) => {
        rotationRef.current = nextRotation;
        setRotation(nextRotation);
        if (notify) onRotationChange?.(nextRotation);
      },
      [onRotationChange],
    );

    useEffect(() => {
      if (!autoRotate) return;
      if (
        typeof matchMedia === "function" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      let frame: number | null = null;
      let previousTime: number | null = null;
      const rotate = (time: number) => {
        if (previousTime !== null && !dragRef.current) {
          const deltaSeconds = Math.min((time - previousTime) / 1000, 0.1);
          const current = rotationRef.current;
          updateRotation([
            current[0] + autoRotateSpeed * deltaSeconds,
            current[1],
            current[2],
          ]);
        }
        previousTime = time;
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
    }, [autoRotate, autoRotateSpeed, updateRotation]);

    const moveTooltip = useCallback(
      (event: ReactPointerEvent<SVGCircleElement>, marker: GlobeMapMarker) => {
        if (!showTooltip) return;
        const bounds =
          event.currentTarget.ownerSVGElement?.getBoundingClientRect();
        if (!bounds) return;
        setTooltip({
          name: marker.name,
          detail:
            marker.description ??
            `${marker.latitude.toFixed(2)}, ${marker.longitude.toFixed(2)}`,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
      },
      [showTooltip],
    );

    const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
      if (!draggable) return;
      if (
        event.target instanceof Element &&
        event.target.closest('circle[role="button"]')
      ) {
        didDragRef.current = false;
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      didDragRef.current = false;
      dragRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        rotation: rotationRef.current,
      };
      setTooltip(null);
    };
    const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - drag.x;
      const deltaY = event.clientY - drag.y;
      if (Math.hypot(deltaX, deltaY) > 3) didDragRef.current = true;
      updateRotation(
        [
          drag.rotation[0] + deltaX * 0.3,
          Math.max(-90, Math.min(90, drag.rotation[1] - deltaY * 0.3)),
          drag.rotation[2],
        ],
        true,
      );
    };
    const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
      if (dragRef.current?.pointerId !== event.pointerId) return;
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    };

    return (
      <div
        ref={ref}
        className={cn("relative w-full overflow-hidden", className)}
        style={height === undefined ? { aspectRatio: "1" } : { height }}
      >
        <svg
          ref={svgRef}
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
            <clipPath id={sphereClipId}>
              <path d={path({ type: "Sphere" }) ?? undefined} />
            </clipPath>
          </defs>
          <path
            d={path({ type: "Sphere" }) ?? undefined}
            fill={oceanColor}
            className="stroke-kumo-line"
            strokeWidth={1.5}
          />
          {showGraticule ? (
            <path
              d={path(geoGraticule10()) ?? undefined}
              fill="none"
              className="stroke-kumo-line"
              strokeWidth={0.75}
            />
          ) : null}
          <path
            data-land-style="hatched"
            d={landHatchPath}
            fill="none"
            stroke={resolvedLandColor}
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath={`url(#${sphereClipId})`}
            className="pointer-events-none"
          />
          {markers.map((marker, index) => {
            const position = projection([marker.longitude, marker.latitude]);
            const isVisible =
              center &&
              geoDistance(center, [marker.longitude, marker.latitude]) <=
                Math.PI / 2;
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
            if (!position || !isVisible) return null;
            return (
              <circle
                key={`${marker.name}-${index}`}
                cx={position[0]}
                cy={position[1]}
                r={marker.radius ?? markerRadius}
                fill={marker.color ?? resolvedMarkerColor}
                className="stroke-kumo-base transition-opacity outline-none hover:opacity-80 focus-visible:opacity-80"
                strokeWidth={2}
                role="button"
                aria-label={`${marker.name}: ${detail}`}
                tabIndex={0}
                onPointerEnter={(event) => moveTooltip(event, marker)}
                onPointerMove={(event) => {
                  if (!dragRef.current) moveTooltip(event, marker);
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
                    x: (position[0] / GLOBE_VIEWBOX_SIZE) * bounds.width,
                    y: (position[1] / GLOBE_VIEWBOX_SIZE) * bounds.height,
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
          <path
            d={path({ type: "Sphere" }) ?? undefined}
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
  },
);

GlobeMap.displayName = "GlobeMap";
