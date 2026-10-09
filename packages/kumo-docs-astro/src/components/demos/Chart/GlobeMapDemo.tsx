import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BubbleMap,
  Button,
  ChoroplethMap,
  cn,
  GlobeMap,
  type GlobeMapMarker,
  type GlobeMapRegion,
  type MapGeoJson,
} from "@cloudflare/kumo";
import { GlobeIcon, MapTrifoldIcon } from "@phosphor-icons/react";
import * as echarts from "echarts/core";
import { MapChart, ScatterChart } from "echarts/charts";
import { TooltipComponent, VisualMapComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useIsDarkMode } from "~/lib/use-is-dark-mode";

echarts.use([
  MapChart,
  ScatterChart,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

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
        landHatchSpacing={8}
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

/** Illustrative requests per second, used to size bubbles by value. */
const requestsByLocation: Record<string, number> = {
  SFO: 18420,
  LAX: 14960,
  SEA: 6310,
  DFW: 11780,
  ORD: 16240,
  IAD: 36120,
  EWR: 27450,
  GRU: 10390,
  EZE: 4670,
  LHR: 31880,
  AMS: 19530,
  CDG: 18710,
  FRA: 28940,
  MAD: 8120,
  DXB: 9340,
  LOS: 3910,
  JNB: 5720,
  BOM: 13260,
  SIN: 24950,
  HKG: 21030,
  NRT: 26380,
  ICN: 24810,
  SYD: 10560,
};

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const trafficLocations: GlobeMapMarker[] = cloudflareAvailabilityLocations.map(
  (location) => ({
    ...location,
    value: requestsByLocation[location.name] ?? 0,
  }),
);

/** Bubbles sized by value, like BubbleMap, on the SVG globe. */
export function GlobeMapBubbleDemo() {
  const isDarkMode = useIsDarkMode();

  return (
    <div className="mx-auto max-w-xl">
      <GlobeMap
        markers={trafficLocations}
        landHatchSpacing={8}
        oceanColor="transparent"
        showGraticule
        minRadius={5}
        maxRadius={22}
        markerOpacity={0.8}
        valueFormat={(value) => compactNumber.format(value)}
        autoRotate
        aria-label="Requests per second by location"
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

/**
 * Deterministic pseudo-random number in [0, 1). Integer maths keeps server and
 * client output identical, so hydration matches.
 */
function pseudoRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function randomBubbles(count: number, maxValue: number): GlobeMapMarker[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `Point ${i + 1}`,
    latitude: pseudoRandom(i * 3) * 140 - 60,
    longitude: pseudoRandom(i * 3 + 1) * 360 - 180,
    value: Math.round(10 + pseudoRandom(i * 3 + 2) ** 3 * maxValue),
  }));
}

const manyBubbles = randomBubbles(300, 5000);

/** 300 value-sized bubbles for checking overlap and rotation performance. */
export function GlobeMapManyBubblesDemo() {
  const isDarkMode = useIsDarkMode();

  return (
    <div className="mx-auto max-w-xl">
      <GlobeMap
        markers={manyBubbles}
        landHatchSpacing={8}
        oceanColor="transparent"
        minRadius={2}
        maxRadius={16}
        markerOpacity={0.6}
        autoRotate
        autoRotateSpeed={12}
        aria-label="Many bubbles"
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

/** Frames per second and the slowest frame over the last half second. */
function useFrameStats() {
  const [stats, setStats] = useState({ fps: 0, worst: 0 });

  useEffect(() => {
    let frame = 0;
    let frames = 0;
    let worst = 0;
    let windowStart = performance.now();
    let last = windowStart;
    const tick = (now: number) => {
      frames += 1;
      worst = Math.max(worst, now - last);
      last = now;
      if (now - windowStart >= 500) {
        setStats({
          fps: Math.round((frames * 1000) / (now - windowStart)),
          worst: Math.round(worst),
        });
        frames = 0;
        worst = 0;
        windowStart = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return stats;
}

const STRESS_MARKER_COUNTS = [0, 250, 500, 1000];
const STRESS_FOCUS_INTERVAL = 1500;

interface GlobeMapStressDemoProps {
  geoJson: MapGeoJson | null;
}

/** Every country as a region plus up to 1000 bubbles, with a frame meter. */
export function GlobeMapStressDemo({ geoJson }: GlobeMapStressDemoProps) {
  const isDarkMode = useIsDarkMode();
  const [showRegions, setShowRegions] = useState(true);
  const [markerCount, setMarkerCount] = useState(500);
  const [cycleFocus, setCycleFocus] = useState(false);
  const [focusStep, setFocusStep] = useState(0);
  const { fps, worst } = useFrameStats();

  const allRegions = useMemo<GlobeMapRegion[]>(() => {
    if (!geoJson) return [];
    return geoJson.features.flatMap((feature, i) => {
      const name = feature.properties?.name;
      if (typeof name !== "string") return [];
      return [{ name, value: Math.round(pseudoRandom(10000 + i) ** 2 * 1e6) }];
    });
  }, [geoJson]);
  const markers = useMemo(
    () => randomBubbles(markerCount, 50000),
    [markerCount],
  );
  const regions = showRegions ? allRegions : [];

  const focusTargets = useMemo(
    () =>
      showRegions
        ? [...allRegions]
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
            .map((region) => region.name)
        : markers.slice(0, 10).map((marker) => marker.name),
    [showRegions, allRegions, markers],
  );

  useEffect(() => {
    if (!cycleFocus) return;
    const timer = setInterval(
      () => setFocusStep((step) => step + 1),
      STRESS_FOCUS_INTERVAL,
    );
    return () => clearInterval(timer);
  }, [cycleFocus]);

  const focused = cycleFocus
    ? (focusTargets[focusStep % Math.max(1, focusTargets.length)] ?? null)
    : null;

  if (!geoJson) return null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Button
          size="sm"
          variant={showRegions ? "primary" : "secondary"}
          aria-pressed={showRegions}
          onClick={() => setShowRegions((value) => !value)}
        >
          {allRegions.length} regions
        </Button>
        {STRESS_MARKER_COUNTS.map((count) => (
          <Button
            key={count}
            size="sm"
            variant={markerCount === count ? "primary" : "secondary"}
            aria-pressed={markerCount === count}
            onClick={() => setMarkerCount(count)}
          >
            {count} bubbles
          </Button>
        ))}
        <Button
          size="sm"
          variant={cycleFocus ? "primary" : "secondary"}
          aria-pressed={cycleFocus}
          onClick={() => setCycleFocus((value) => !value)}
        >
          Cycle focus
        </Button>
        <span className="ml-auto font-mono text-kumo-subtle tabular-nums">
          {fps} fps · worst {worst}ms
        </span>
      </div>
      <GlobeMap
        regionGeoJson={geoJson}
        regions={regions}
        markers={markers}
        activeRegion={showRegions ? focused : null}
        activeMarker={showRegions ? null : focused}
        landHatchSpacing={6}
        oceanColor="transparent"
        minRadius={2}
        maxRadius={16}
        markerOpacity={0.6}
        valueFormat={(value) => compactNumber.format(value)}
        autoRotate
        aria-label="Stress test"
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

/** Clickable bubbles; the selected location is shown below the globe. */
export function GlobeMapClickableBubblesDemo() {
  const isDarkMode = useIsDarkMode();
  const [selected, setSelected] = useState<GlobeMapMarker | null>(null);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      <GlobeMap
        markers={trafficLocations}
        landHatchSpacing={8}
        oceanColor="transparent"
        minRadius={5}
        maxRadius={22}
        markerOpacity={0.8}
        valueFormat={(value) => compactNumber.format(value)}
        onMarkerClick={setSelected}
        aria-label="Clickable traffic locations"
        isDarkMode={isDarkMode}
      />
      <p className="text-center text-sm text-kumo-subtle">
        {selected
          ? `Selected ${selected.name} (${selected.description}): ${selected.value?.toLocaleString()} req/s`
          : "Click a bubble"}
      </p>
    </div>
  );
}

/** Illustrative requests per country, joined to GeoJSON features by `name`. */
const countryTraffic: GlobeMapRegion[] = [
  { name: "India", value: 20080 },
  { name: "China", value: 18350 },
  { name: "Japan", value: 16420 },
  { name: "Indonesia", value: 11940 },
  { name: "South Korea", value: 9810 },
  { name: "Australia", value: 8760 },
  { name: "Vietnam", value: 7020 },
  { name: "Thailand", value: 6580 },
  { name: "Philippines", value: 5930 },
  { name: "Malaysia", value: 4870 },
  { name: "Pakistan", value: 4210 },
  { name: "Bangladesh", value: 3640 },
  { name: "Russia", value: 3380 },
  { name: "Kazakhstan", value: 1450 },
  { name: "Mongolia", value: 620 },
  { name: "Myanmar", value: 1180 },
  { name: "Saudi Arabia", value: 3920 },
  { name: "Iran", value: 2760 },
  { name: "Turkey", value: 4480 },
  { name: "Egypt", value: 2310 },
  { name: "Kenya", value: 1270 },
  { name: "Nigeria", value: 2940 },
  { name: "South Africa", value: 2580 },
  { name: "Germany", value: 14260 },
  { name: "United Kingdom", value: 13710 },
  { name: "France", value: 12190 },
  { name: "Spain", value: 7430 },
  { name: "Italy", value: 8120 },
  { name: "Poland", value: 4960 },
  { name: "Netherlands", value: 6890 },
  { name: "United States of America", value: 19640 },
  { name: "Canada", value: 7850 },
  { name: "Mexico", value: 6120 },
  { name: "Brazil", value: 10830 },
  { name: "Argentina", value: 3470 },
];

interface GlobeMapChoroplethDemoProps {
  geoJson: MapGeoJson | null;
}

/** Countries hatched by value, joined to GeoJSON features by name. */
export function GlobeMapChoroplethDemo({
  geoJson,
}: GlobeMapChoroplethDemoProps) {
  const isDarkMode = useIsDarkMode();

  if (!geoJson) return null;

  return (
    <div className="mx-auto max-w-xl">
      <GlobeMap
        regionGeoJson={geoJson}
        regions={countryTraffic}
        landHatchSpacing={6}
        oceanColor="transparent"
        defaultRotation={[-85, -15, 0]}
        valueFormat={(value) => compactNumber.format(value)}
        autoRotate
        aria-label="Requests by country"
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

type MapView = "flat" | "globe";

const MAP_VIEW_HEIGHT = 420;

/** Switch the same locations between a flat BubbleMap and a GlobeMap. */
export function GlobeMapFlatToggleDemo({
  geoJson,
}: GlobeMapChoroplethDemoProps) {
  const isDarkMode = useIsDarkMode();
  const [view, setView] = useState<MapView>("flat");

  if (!geoJson) return null;

  return (
    <MapViewSwitcher
      view={view}
      onViewChange={setView}
      flat={
        <BubbleMap<GlobeMapMarker>
          echarts={echarts}
          geoJson={geoJson}
          data={trafficLocations}
          lng="longitude"
          lat="latitude"
          name="name"
          value={(location) => location.value ?? 0}
          minRadius={6}
          maxRadius={28}
          valueFormat={(value) => compactNumber.format(value)}
          height={MAP_VIEW_HEIGHT}
          isDarkMode={isDarkMode}
        />
      }
      globe={
        <GlobeMap
          markers={trafficLocations}
          landHatchSpacing={8}
          oceanColor="transparent"
          minRadius={5}
          maxRadius={22}
          markerOpacity={0.8}
          valueFormat={(value) => compactNumber.format(value)}
          autoRotate={view === "globe"}
          height={MAP_VIEW_HEIGHT}
          aria-label="Requests per second by location"
          isDarkMode={isDarkMode}
        />
      }
    />
  );
}

interface TopItem {
  name: string;
  label: string;
  value: number;
}

function MapViewSwitcher({
  view,
  onViewChange,
  flat,
  globe,
}: {
  view: MapView;
  onViewChange: (view: MapView) => void;
  flat: ReactNode;
  globe: ReactNode;
}) {
  const layerClass = (layer: MapView) =>
    cn(
      "absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none",
      view === layer ? "opacity-100" : "pointer-events-none opacity-0",
    );

  return (
    <div className="relative w-full" style={{ height: MAP_VIEW_HEIGHT }}>
      <div className={layerClass("flat")} inert={view !== "flat"}>
        {flat}
      </div>
      <div className={layerClass("globe")} inert={view !== "globe"}>
        {globe}
      </div>
      <div
        role="group"
        aria-label="Map view"
        className="absolute top-0 right-0 z-10 flex gap-0.5 rounded-lg border border-kumo-line bg-kumo-base p-0.5 shadow-xs"
      >
        <Button
          variant="ghost"
          shape="square"
          size="sm"
          icon={<MapTrifoldIcon />}
          aria-label="Flat map"
          aria-pressed={view === "flat"}
          className={cn(view === "flat" && "bg-kumo-tint")}
          onClick={() => onViewChange("flat")}
        />
        <Button
          variant="ghost"
          shape="square"
          size="sm"
          icon={<GlobeIcon />}
          aria-label="Globe"
          aria-pressed={view === "globe"}
          className={cn(view === "globe" && "bg-kumo-tint")}
          onClick={() => onViewChange("globe")}
        />
      </div>
    </div>
  );
}

function TopList({
  title,
  items,
  active,
  onActiveChange,
}: {
  title: string;
  items: TopItem[];
  active: string | null;
  onActiveChange: (name: string | null) => void;
}) {
  return (
    // Clear on leaving the list, not each item.
    <div
      className="flex flex-col gap-1"
      onPointerLeave={() => onActiveChange(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onActiveChange(null);
        }
      }}
    >
      <p className="px-2 pb-1 text-xs font-medium text-kumo-subtle">{title}</p>
      {items.map((item, index) => (
        <button
          key={item.name}
          type="button"
          onPointerEnter={() => onActiveChange(item.name)}
          onFocus={() => onActiveChange(item.name)}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-kumo-default transition-colors hover:bg-kumo-tint focus-visible:ring-2 focus-visible:ring-kumo-brand focus-visible:outline-none",
            item.name === active && "bg-kumo-tint",
          )}
        >
          <span className="w-4 text-xs text-kumo-subtle tabular-nums">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <span className="text-kumo-subtle tabular-nums">
            {compactNumber.format(item.value)}
          </span>
        </button>
      ))}
    </div>
  );
}

const topLocations: TopItem[] = [...trafficLocations]
  .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
  .slice(0, 5)
  .map((location) => ({
    name: location.name,
    label: `${location.description} (${location.name})`,
    value: location.value ?? 0,
  }));

/** Hovering a top-5 location focuses it on the flat map and the globe. */
export function GlobeMapControlledBubblesDemo({
  geoJson,
}: GlobeMapChoroplethDemoProps) {
  const isDarkMode = useIsDarkMode();
  const [view, setView] = useState<MapView>("globe");
  const [active, setActive] = useState<string | null>(null);

  if (!geoJson) return null;

  const activeIndex = trafficLocations.findIndex(
    (location) => location.name === active,
  );

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
      <MapViewSwitcher
        view={view}
        onViewChange={setView}
        flat={
          <BubbleMap<GlobeMapMarker>
            echarts={echarts}
            geoJson={geoJson}
            data={trafficLocations}
            lng="longitude"
            lat="latitude"
            name="name"
            value={(location) => location.value ?? 0}
            minRadius={6}
            maxRadius={28}
            valueFormat={(value) => compactNumber.format(value)}
            activeIndex={activeIndex >= 0 ? activeIndex : null}
            height={MAP_VIEW_HEIGHT}
            isDarkMode={isDarkMode}
          />
        }
        globe={
          <GlobeMap
            markers={trafficLocations}
            landHatchSpacing={8}
            oceanColor="transparent"
            minRadius={5}
            maxRadius={22}
            markerOpacity={0.8}
            valueFormat={(value) => compactNumber.format(value)}
            activeMarker={active}
            autoRotate={view === "globe"}
            height={MAP_VIEW_HEIGHT}
            aria-label="Requests per second by location"
            isDarkMode={isDarkMode}
          />
        }
      />
      <TopList
        title="Top 5 locations"
        items={topLocations}
        active={active}
        onActiveChange={setActive}
      />
    </div>
  );
}

const topCountries: TopItem[] = [...countryTraffic]
  .sort((a, b) => b.value - a.value)
  .slice(0, 5)
  .map((country) => ({
    name: country.name,
    label: country.label ?? country.name,
    value: country.value,
  }));

/** Hovering a top-5 country focuses it on the flat map and the globe. */
export function GlobeMapControlledChoroplethDemo({
  geoJson,
}: GlobeMapChoroplethDemoProps) {
  const isDarkMode = useIsDarkMode();
  const [view, setView] = useState<MapView>("globe");
  const [active, setActive] = useState<string | null>(null);

  if (!geoJson) return null;

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
      <MapViewSwitcher
        view={view}
        onViewChange={setView}
        flat={
          <ChoroplethMap<GlobeMapRegion>
            echarts={echarts}
            geoJson={geoJson}
            data={countryTraffic}
            name="name"
            value="value"
            valueFormat={(value) => compactNumber.format(value)}
            activeRegion={active}
            height={MAP_VIEW_HEIGHT}
            isDarkMode={isDarkMode}
          />
        }
        globe={
          <GlobeMap
            regionGeoJson={geoJson}
            regions={countryTraffic}
            landHatchSpacing={6}
            oceanColor="transparent"
            defaultRotation={[-85, -15, 0]}
            valueFormat={(value) => compactNumber.format(value)}
            activeRegion={active}
            autoRotate={view === "globe"}
            height={MAP_VIEW_HEIGHT}
            aria-label="Requests by country"
            isDarkMode={isDarkMode}
          />
        }
      />
      <TopList
        title="Top 5 countries"
        items={topCountries}
        active={active}
        onActiveChange={setActive}
      />
    </div>
  );
}
