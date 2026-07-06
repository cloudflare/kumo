import { BubbleMap, type MapGeoJson } from "@cloudflare/kumo";
import * as echarts from "echarts/core";
import { MapChart, ScatterChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useIsDarkMode } from "~/lib/use-is-dark-mode";

echarts.use([MapChart, ScatterChart, TooltipComponent, CanvasRenderer]);

interface BubbleMapDemoProps {
  geoJson: MapGeoJson | null;
}

/** A point-of-presence row — the kind of raw shape these maps consume. */
interface Colo {
  iata: string;
  city: string;
  lat: number;
  lon: number;
  requests: number;
  country?: string;
}

const colos: Colo[] = [
  { iata: "SFO", city: "San Francisco", country: "US", lat: 37.77, lon: -122.42, requests: 1200 }, // prettier-ignore
  { iata: "EWR", city: "New York", country: "US", lat: 40.71, lon: -74.0, requests: 980 }, // prettier-ignore
  { iata: "GRU", city: "São Paulo", country: "BR", lat: -23.55, lon: -46.63, requests: 540 }, // prettier-ignore
  { iata: "LHR", city: "London", country: "GB", lat: 51.5, lon: -0.12, requests: 1500 }, // prettier-ignore
  { iata: "LOS", city: "Lagos", country: "NG", lat: 6.52, lon: 3.38, requests: 320 }, // prettier-ignore
  { iata: "FRA", city: "Frankfurt", country: "DE", lat: 50.11, lon: 8.68, requests: 760 }, // prettier-ignore
  { iata: "BOM", city: "Mumbai", country: "IN", lat: 19.07, lon: 72.87, requests: 640 }, // prettier-ignore
  { iata: "SIN", city: "Singapore", country: "SG", lat: 1.35, lon: 103.82, requests: 880 }, // prettier-ignore
  { iata: "NRT", city: "Tokyo", country: "JP", lat: 35.68, lon: 139.69, requests: 1100 }, // prettier-ignore
  { iata: "SYD", city: "Sydney", country: "AU", lat: -33.86, lon: 151.21, requests: 410 }, // prettier-ignore
];

const fmt = (n: number) =>
  `${n > 1000 ? `${(n / 1000).toLocaleString()}k` : n.toString()} requests`;

/**
 * Bubble map — raw rows + dimension accessors, radius scaling, a tooltip
 */
export function BubbleMapBasicDemo({ geoJson }: BubbleMapDemoProps) {
  const isDarkMode = useIsDarkMode();

  if (!geoJson) return null;

  return (
    <BubbleMap<Colo>
      echarts={echarts}
      geoJson={geoJson}
      data={colos}
      lng="lon"
      lat="lat"
      name="city"
      value="requests"
      valueFormat={fmt}
      minRadius={8}
      isDarkMode={isDarkMode}
    />
  );
}

export function BubbleMapManyPointsDemo({ geoJson }: BubbleMapDemoProps) {
  const isDarkMode = useIsDarkMode();

  if (!geoJson) return null;

  return (
    <BubbleMap<Colo>
      echarts={echarts}
      geoJson={geoJson}
      data={colos2}
      lng="lon"
      lat="lat"
      name="city"
      value="requests"
      valueFormat={fmt}
      isDarkMode={isDarkMode}
    />
  );
}

const colos2 = [
  {
    requests: 1455,
    iata: "CDG",
    lat: 49.012798,
    lon: 2.55,
    cca2: "FR",
    region: "Europe",
    city: "Paris",
  },
  {
    requests: 3,
    iata: "SEA",
    lat: 47.449001,
    lon: -122.308998,
    cca2: "US",
    region: "North America",
    city: "Seattle",
  },
  {
    requests: 1,
    iata: "DAC",
    lat: 23.843347,
    lon: 90.397783,
    cca2: "BD",
    region: "Asia Pacific",
    city: "Dhaka",
  },
  {
    requests: 13,
    iata: "SIN",
    lat: 1.35019,
    lon: 103.994003,
    cca2: "SG",
    region: "Asia Pacific",
    city: "Singapore",
  },
  {
    requests: 1,
    iata: "DUS",
    lat: 51.289501,
    lon: 6.76678,
    cca2: "DE",
    region: "Europe",
    city: "Dusseldorf",
  },
  {
    requests: 1443,
    iata: "MAD",
    lat: 40.4936,
    lon: -3.56676,
    cca2: "ES",
    region: "Europe",
    city: "Madrid",
  },
  {
    requests: 5,
    iata: "ATL",
    lat: 33.6367,
    lon: -84.428101,
    cca2: "US",
    region: "North America",
    city: "Atlanta",
  },
  {
    requests: 1,
    iata: "MCT",
    lat: 23.5933,
    lon: 58.284401,
    cca2: "OM",
    region: "Middle East",
    city: "Muscat",
  },
  {
    requests: 1515,
    iata: "LAX",
    lat: 33.942501,
    lon: -118.407997,
    cca2: "US",
    region: "North America",
    city: "Los Angeles",
  },
  {
    requests: 23,
    iata: "YYZ",
    lat: 43.6772,
    lon: -79.6306,
    cca2: "CA",
    region: "North America",
    city: "Toronto",
  },
  {
    requests: 11,
    iata: "AMS",
    lat: 52.308601,
    lon: 4.76389,
    cca2: "NL",
    region: "Europe",
    city: "Amsterdam",
  },
  {
    requests: 1,
    iata: "DME",
    lat: 55.408798,
    lon: 37.9063,
    cca2: "RU",
    region: "Europe",
    city: "Moscow",
  },
  {
    requests: 1,
    iata: "CGK",
    lat: -6.12557,
    lon: 106.655998,
    cca2: "ID",
    region: "Asia Pacific",
    city: "Jakarta",
  },
  {
    requests: 2,
    iata: "EWR",
    lat: 40.692501,
    lon: -74.168701,
    cca2: "US",
    region: "North America",
    city: "Newark",
  },
  {
    requests: 1,
    iata: "TPA",
    lat: 27.9755,
    lon: -82.533203,
    cca2: "US",
    region: "North America",
    city: "Tampa",
  },
  {
    requests: 2,
    iata: "DEL",
    lat: 28.5665,
    lon: 77.103104,
    cca2: "IN",
    region: "Asia Pacific",
    city: "New Delhi",
  },
  {
    requests: 4,
    iata: "MIA",
    lat: 25.7932,
    lon: -80.290604,
    cca2: "US",
    region: "North America",
    city: "Miami",
  },
  {
    requests: 3,
    iata: "EZE",
    lat: -34.8222,
    lon: -58.5358,
    cca2: "AR",
    region: "South America",
    city: "Ezeiza",
  },
  {
    requests: 1,
    iata: "LHR",
    lat: 51.4706,
    lon: -0.461941,
    cca2: "GB",
    region: "Europe",
    city: "London",
  },
  {
    requests: 13,
    iata: "ZRH",
    lat: 47.464699,
    lon: 8.54917,
    cca2: "CH",
    region: "Europe",
    city: "Zurich",
  },
  {
    requests: 3,
    iata: "FRA",
    lat: 50.026402,
    lon: 8.54313,
    cca2: "DE",
    region: "Europe",
    city: "Frankfurt-am-Main",
  },
  {
    requests: 1,
    iata: "IAD",
    lat: 38.9445,
    lon: -77.455803,
    cca2: "US",
    region: "North America",
    city: "Dulles",
  },
  {
    requests: 1460,
    iata: "DFW",
    lat: 32.896801,
    lon: -97.038002,
    cca2: "US",
    region: "North America",
    city: "Dallas-Fort Worth",
  },
  {
    requests: 1413,
    iata: "SJC",
    lat: 37.362598,
    lon: -121.929001,
    cca2: "US",
    region: "North America",
    city: "San Jose",
  },
  {
    requests: 1,
    iata: "AMM",
    lat: 31.722601,
    lon: 35.993198,
    cca2: "JO",
    region: "Middle East",
    city: "Amman",
  },
  {
    requests: 1,
    iata: "GYE",
    lat: -2.15742,
    lon: -79.883598,
    cca2: "EC",
    region: "South America",
    city: "Guayaquil",
  },
  {
    requests: 5,
    iata: "GRU",
    lat: -23.435556,
    lon: -46.473057,
    cca2: "BR",
    region: "South America",
    city: "Sao Paulo",
  },
  {
    requests: 1437,
    iata: "BOD",
    lat: 44.8283,
    lon: -0.715556,
    cca2: "FR",
    region: "Europe",
    city: "Bordeaux/Merignac",
  },
  {
    requests: 1,
    iata: "GUA",
    lat: 14.5833,
    lon: -90.527496,
    cca2: "GT",
    region: "North America",
    city: "Guatemala City",
  },
  {
    requests: 1,
    iata: "SCL",
    lat: -33.393002,
    lon: -70.785797,
    cca2: "CL",
    region: "South America",
    city: "Santiago",
  },
  {
    requests: 1,
    iata: "HKG",
    lat: 22.308901,
    lon: 113.915001,
    cca2: "HK",
    region: "Asia Pacific",
    city: "Hong Kong",
  },
];
