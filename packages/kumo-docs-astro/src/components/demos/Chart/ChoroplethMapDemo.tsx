import { ChoroplethMap, type MapGeoJson } from "@cloudflare/kumo";
import * as echarts from "echarts/core";
import { MapChart } from "echarts/charts";
import { VisualMapComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useIsDarkMode } from "~/lib/use-is-dark-mode";

echarts.use([MapChart, VisualMapComponent, TooltipComponent, CanvasRenderer]);

interface ChoroplethMapDemoProps {
  geoJson: MapGeoJson | null;
}

/** A country-level traffic row — joined to GeoJSON features by `country`. */
interface CountryTraffic {
  /** Must match the GeoJSON feature's `name` property. */
  country: string;
  requests: number;
}

// Country-level traffic. The colour scale is continuous; if your data is
// skewed, shape it in the parent (e.g. a transformed value) before passing it in.
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

const fmt = (n: number) =>
  `${n >= 1000 ? `${(n / 1000).toLocaleString()}k` : n.toString()} requests`;

/**
 * Choropleth map — regions shaded by value, joined to GeoJSON features by name.
 * Uses the default continuous linear colour scale.
 */
export function ChoroplethMapBasicDemo({ geoJson }: ChoroplethMapDemoProps) {
  const isDarkMode = useIsDarkMode();

  if (!geoJson) return null;

  return (
    <ChoroplethMap<CountryTraffic>
      echarts={echarts}
      geoJson={geoJson}
      data={countries}
      name="country"
      value="requests"
      valueFormat={fmt}
      isDarkMode={isDarkMode}
    />
  );
}
