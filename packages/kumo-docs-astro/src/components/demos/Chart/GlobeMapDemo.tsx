import {
  GlobeMap,
  type GlobeMapMarker,
  type MapGeoJson,
} from "@cloudflare/kumo";
import { useIsDarkMode } from "~/lib/use-is-dark-mode";

interface GlobeMapDemoProps {
  geoJson: MapGeoJson | null;
}

interface CountryTraffic {
  country: string;
  requests: number;
}

const countries: CountryTraffic[] = [
  { country: "United States of America", requests: 4200 },
  { country: "Germany", requests: 3100 },
  { country: "United Kingdom", requests: 2800 },
  { country: "Japan", requests: 2500 },
  { country: "France", requests: 2200 },
  { country: "Brazil", requests: 1700 },
  { country: "India", requests: 1500 },
  { country: "Canada", requests: 1300 },
  { country: "Australia", requests: 1100 },
  { country: "Spain", requests: 900 },
  { country: "Netherlands", requests: 700 },
  { country: "Mexico", requests: 600 },
  { country: "Argentina", requests: 420 },
  { country: "Nigeria", requests: 300 },
  { country: "South Africa", requests: 220 },
];

const formatRequests = (value: number) => `${value.toLocaleString()} requests`;

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
export function GlobeMapAvailabilityZonesDemo({ geoJson }: GlobeMapDemoProps) {
  const isDarkMode = useIsDarkMode();

  if (!geoJson) return null;

  return (
    <div className="mx-auto max-w-xl">
      <GlobeMap
        geoJson={geoJson}
        markers={cloudflareAvailabilityLocations}
        noDataColor="var(--text-color-kumo-inactive)"
        landStyle="dotted"
        landDotSpacing={11}
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

/** An SVG globe with drag-to-rotate interaction and no WebGL dependency. */
export function GlobeMapBasicDemo({ geoJson }: GlobeMapDemoProps) {
  const isDarkMode = useIsDarkMode();

  if (!geoJson) return null;

  return (
    <div className="mx-auto max-w-xl">
      <GlobeMap<CountryTraffic>
        geoJson={geoJson}
        data={countries}
        name="country"
        value="requests"
        valueFormat={formatRequests}
        oceanColor="var(--color-kumo-base)"
        autoRotate
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
