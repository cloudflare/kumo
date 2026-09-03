import { GlobeMap, type GlobeMapMarker } from "@cloudflare/kumo";
import {
  geoDistance,
  geoGraticule10,
  geoOrthographic,
  geoPath,
  type GeoPermissibleObjects,
} from "d3-geo";
import { useEffect, useId, useState, type PointerEvent } from "react";
import { useIsDarkMode } from "~/lib/use-is-dark-mode";

const cloudflareAvailabilityLocations: GlobeMapMarker[] = [
  {
    name: "SFO",
    description: "San Francisco",
    latitude: 37.77,
    longitude: -122.42,
  },
  {
    name: "LAX",
    description: "Los Angeles",
    latitude: 34.05,
    longitude: -118.24,
  },
  { name: "SEA", description: "Seattle", latitude: 47.61, longitude: -122.33 },
  { name: "DFW", description: "Dallas", latitude: 32.78, longitude: -96.8 },
  { name: "ORD", description: "Chicago", latitude: 41.88, longitude: -87.63 },
  { name: "IAD", description: "Ashburn", latitude: 39.04, longitude: -77.49 },
  { name: "EWR", description: "New York", latitude: 40.71, longitude: -74.01 },
  {
    name: "GRU",
    description: "São Paulo",
    latitude: -23.55,
    longitude: -46.63,
  },
  {
    name: "EZE",
    description: "Buenos Aires",
    latitude: -34.6,
    longitude: -58.38,
  },
  { name: "LHR", description: "London", latitude: 51.51, longitude: -0.13 },
  { name: "AMS", description: "Amsterdam", latitude: 52.37, longitude: 4.9 },
  { name: "CDG", description: "Paris", latitude: 48.86, longitude: 2.35 },
  { name: "FRA", description: "Frankfurt", latitude: 50.11, longitude: 8.68 },
  { name: "MAD", description: "Madrid", latitude: 40.42, longitude: -3.7 },
  { name: "DXB", description: "Dubai", latitude: 25.2, longitude: 55.27 },
  { name: "LOS", description: "Lagos", latitude: 6.52, longitude: 3.38 },
  {
    name: "JNB",
    description: "Johannesburg",
    latitude: -26.2,
    longitude: 28.05,
  },
  { name: "BOM", description: "Mumbai", latitude: 19.08, longitude: 72.88 },
  { name: "SIN", description: "Singapore", latitude: 1.35, longitude: 103.82 },
  { name: "HKG", description: "Hong Kong", latitude: 22.32, longitude: 114.17 },
  { name: "NRT", description: "Tokyo", latitude: 35.68, longitude: 139.69 },
  { name: "ICN", description: "Seoul", latitude: 37.57, longitude: 126.98 },
  { name: "SYD", description: "Sydney", latitude: -33.87, longitude: 151.21 },
];

/** Illustrative Cloudflare network locations on a draggable SVG globe. */
export function GlobeMapAvailabilityZonesDemo() {
  const isDarkMode = useIsDarkMode();

  return (
    <div className="mx-auto max-w-xl">
      <GlobeMap
        markers={cloudflareAvailabilityLocations}
        landColor="var(--text-color-kumo-inactive)"
        landDotSpacing={8}
        oceanColor="transparent"
        showGraticule
        markerColor="var(--color-kumo-brand)"
        markerRadius={8}
        autoRotate
        aria-label="Cloudflare availability locations"
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

const LAND_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_110m_land.geojson";

function D3OrthographicGlobePrototype({ isDarkMode }: { isDarkMode: boolean }) {
  const [land, setLand] = useState<GeoPermissibleObjects | null>(null);
  const [tooltip, setTooltip] = useState<{
    name: string;
    detail: string;
    x: number;
    y: number;
  } | null>(null);
  const [rotation, setRotation] = useState<[number, number]>([-10, -20]);
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    rotation: [number, number];
  } | null>(null);
  const landPatternId = `d3-globe-land-${useId().replaceAll(":", "")}`;
  const landStroke = isDarkMode
    ? "var(--text-color-kumo-inactive)"
    : "var(--text-color-kumo-subtle)";

  useEffect(() => {
    void fetch(LAND_URL)
      .then((response) => response.json())
      .then((data: unknown) => setLand(data as GeoPermissibleObjects));
  }, []);

  const projection = geoOrthographic()
    .translate([320, 320])
    .scale(302)
    .clipAngle(90)
    .rotate(rotation);
  const path = geoPath(projection);
  const center = projection.invert?.([320, 320]);
  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({ x: event.clientX, y: event.clientY, rotation });
  };
  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragStart) return;
    setRotation([
      dragStart.rotation[0] + (event.clientX - dragStart.x) * 0.3,
      Math.max(
        -90,
        Math.min(
          90,
          dragStart.rotation[1] - (event.clientY - dragStart.y) * 0.3,
        ),
      ),
    ]);
  };
  const showTooltip = (
    event: PointerEvent<SVGCircleElement>,
    marker: GlobeMapMarker,
  ) => {
    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!bounds) return;
    setTooltip({
      name: marker.name,
      detail:
        marker.description ??
        `${marker.latitude.toFixed(2)}, ${marker.longitude.toFixed(2)}`,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  };

  return (
    <div className="relative size-full">
      <svg
        aria-label="D3 geo orthographic globe prototype"
        viewBox="0 0 640 640"
        className="block size-full cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragStart(null)}
        onPointerCancel={() => setDragStart(null)}
      >
        {land ? (
          <defs>
            <pattern
              id={landPatternId}
              width={10}
              height={10}
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M-2,2L2,-2M0,10L10,0M8,12L12,8"
                fill="none"
                stroke={landStroke}
                strokeWidth={1.25}
              />
            </pattern>
          </defs>
        ) : null}
        <path
          d={path({ type: "Sphere" }) ?? undefined}
          fill="transparent"
          className="stroke-kumo-line"
          strokeWidth={1.5}
        />
        <path
          d={path(geoGraticule10()) ?? undefined}
          fill="none"
          className="stroke-kumo-line"
          strokeWidth={0.75}
        />
        {land ? (
          <path
            d={path(land) ?? undefined}
            fill={`url(#${landPatternId})`}
            className="pointer-events-none"
          />
        ) : null}
        {cloudflareAvailabilityLocations.map((marker) => {
          const position = projection([marker.longitude, marker.latitude]);
          const isVisible =
            center &&
            geoDistance(center, [marker.longitude, marker.latitude]) <=
              Math.PI / 2;
          return position && isVisible ? (
            <circle
              key={marker.name}
              cx={position[0]}
              cy={position[1]}
              r={8}
              fill="var(--color-kumo-brand)"
              className="stroke-kumo-base"
              strokeWidth={2}
              onPointerEnter={(event) => showTooltip(event, marker)}
              onPointerMove={(event) => {
                if (!dragStart) showTooltip(event, marker);
              }}
              onPointerLeave={() => setTooltip(null)}
            />
          ) : null;
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
}

/** Local comparison of the shipped globe renderer and d3-geo's orthographic projection. */
export function GlobeMapComparisonDemo() {
  const isDarkMode = useIsDarkMode();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">
          Current GlobeMap
        </p>
        <GlobeMap
          markers={cloudflareAvailabilityLocations}
          landColor="var(--text-color-kumo-inactive)"
          landDotSpacing={8}
          oceanColor="transparent"
          showGraticule
          markerColor="var(--color-kumo-brand)"
          markerRadius={8}
          aria-label="Current GlobeMap"
          isDarkMode={isDarkMode}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">
          D3 geoOrthographic prototype
        </p>
        <div className="aspect-square">
          <D3OrthographicGlobePrototype isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}
