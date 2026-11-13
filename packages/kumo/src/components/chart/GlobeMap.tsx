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
  landHatchSpacing?: number;
  /** Fill behind the land and graticule. Default: the Kumo base surface. */
  oceanColor?: string;
  /** Geographic points drawn above the land. Points fade at the horizon and back-facing points are hidden. */
  markers?: GlobeMapMarker[];
  /** Default marker fill. Defaults to the Kumo chart blue. */
  markerColor?: string;
  /** Default marker radius in view-box pixels. Default: `7`. */
  markerRadius?: number;
  /** Called when a visible marker is clicked. */
  onMarkerClick?: (marker: GlobeMapMarker) => void;
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
  name: string;
  detail: string;
  x: number;
  y: number;
}

const GLOBE_VIEWBOX_SIZE = 640;
const GLOBE_PADDING = 18;
const GLOBE_RADIUS = GLOBE_VIEWBOX_SIZE / 2 - GLOBE_PADDING;
const MARKER_EDGE_FADE_DISTANCE = 24;
const AUTO_ROTATE_INTERVAL = 1000 / 30;

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
      landHatchSpacing = 10,
      oceanColor = "var(--color-kumo-base)",
      markers = [],
      markerColor,
      markerRadius = 7,
      onMarkerClick,
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
    const sphereClipId = useId();
    const rotationRef = useRef(rotation);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const dragRef = useRef<{
      pointerId: number;
      x: number;
      y: number;
      rotation: [number, number, number];
    } | null>(null);
    const isFocusedRef = useRef(false);
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
    const resolvedLandColor = landColor ?? palette.area;
    const resolvedMarkerColor = markerColor ?? palette.bubble;
    const safeHatchSpacing = Math.max(3, finiteNumber(landHatchSpacing, 10));
    const safeMarkerRadius = Math.max(0, finiteNumber(markerRadius, 7));
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
    const path = useMemo(() => geoPath(projection), [projection]);
    const spherePath = useMemo(
      () => path({ type: "Sphere" }) ?? undefined,
      [path],
    );
    const graticulePath = useMemo(
      () => path(geoGraticule10()) ?? undefined,
      [path],
    );
    const landHatchPath = useMemo(
      () => createLandHatchPath(projection, safeHatchSpacing),
      [projection, safeHatchSpacing],
    );
    const center = useMemo(
      () =>
        projection.invert?.([GLOBE_VIEWBOX_SIZE / 2, GLOBE_VIEWBOX_SIZE / 2]),
      [projection],
    );

    const updateRotation = useCallback(
      (nextRotation: [number, number, number], notify = false) => {
        rotationRef.current = nextRotation;
        setRotation(nextRotation);
        if (notify) onUserRotationChange?.(nextRotation);
      },
      [onUserRotationChange],
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
        if (dragRef.current || isFocusedRef.current) {
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
        onFocusCapture={() => {
          isFocusedRef.current = true;
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
            "block size-full touch-none select-none",
            draggable && "cursor-grab active:cursor-grabbing",
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
            if (!dragRef.current) setTooltip(null);
          }}
        >
          <defs>
            <clipPath id={sphereClipId}>
              <path d={spherePath} />
            </clipPath>
          </defs>
          <path
            d={spherePath}
            fill={oceanColor}
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
            d={landHatchPath}
            fill="none"
            stroke={resolvedLandColor}
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath={`url(#${sphereClipId})`}
            className="pointer-events-none"
          />
          <path
            data-globe-outline=""
            d={spherePath}
            fill="none"
            className="pointer-events-none stroke-kumo-line"
            strokeWidth={2}
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
                (GLOBE_RADIUS - distanceFromCenter) / MARKER_EDGE_FADE_DISTANCE,
              ),
            );
            return (
              <circle
                key={`${marker.name}-${index}`}
                cx={position[0]}
                cy={position[1]}
                r={Math.max(
                  0,
                  finiteNumber(
                    marker.radius ?? safeMarkerRadius,
                    safeMarkerRadius,
                  ),
                )}
                fill={marker.color ?? resolvedMarkerColor}
                opacity={edgeOpacity}
                className="stroke-kumo-base transition-opacity outline-none"
                strokeWidth={2}
                data-globe-marker=""
                data-globe-marker-interactive={isInteractive}
                role={isInteractive ? "button" : undefined}
                aria-label={
                  isInteractive ? `${marker.name}: ${detail}` : undefined
                }
                aria-hidden={isInteractive ? undefined : true}
                tabIndex={isInteractive ? 0 : undefined}
                onPointerEnter={(event) => moveTooltip(event, marker)}
                onPointerMove={(event) => {
                  if (!dragRef.current) moveTooltip(event, marker);
                }}
                onPointerLeave={() => setTooltip(null)}
                onFocus={(event) => {
                  if (!showTooltip) return;
                  const svgBounds =
                    event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (!svgBounds) return;
                  const markerBounds =
                    event.currentTarget.getBoundingClientRect();
                  setTooltip({
                    name: marker.name,
                    detail,
                    x:
                      markerBounds.left +
                      markerBounds.width / 2 -
                      svgBounds.left,
                    y: markerBounds.top - svgBounds.top,
                  });
                }}
                onBlur={() => setTooltip(null)}
                onClick={isInteractive ? activateMarker : undefined}
                onKeyDown={
                  isInteractive
                    ? (event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        activateMarker();
                      }
                    : undefined
                }
              />
            );
          })}
        </svg>
        {onMarkerClick === undefined && markers.length > 0 ? (
          <ul className="sr-only" aria-label={`${ariaLabel} locations`}>
            {markers.map((marker, index) => (
              <li key={`${marker.name}-${index}`}>
                {marker.name}:{" "}
                {marker.description ??
                  `${marker.latitude.toFixed(2)}, ${marker.longitude.toFixed(2)}`}
              </li>
            ))}
          </ul>
        ) : null}
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
