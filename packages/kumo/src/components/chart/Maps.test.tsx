import { createRef } from "react";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BubbleMap, type MapGeoJson } from "./Maps";

const createMockChart = () => ({
  setOption: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
});

const createMockEcharts = (mockChart = createMockChart()) => ({
  init: vi.fn(() => mockChart),
  registerMap: vi.fn(),
});

const geoJson: MapGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "US",
      properties: { name: "United States" },
      geometry: { type: "Polygon", coordinates: [] },
    },
  ],
};

const data = [
  { city: "San Francisco", lat: 37.77, lon: -122.42, requests: 10 },
  { city: "London", lat: 51.5, lon: -0.12, requests: 20 },
];

describe("BubbleMap", () => {
  it("reuses the generated map name across remounts for the same GeoJSON", () => {
    const mockEcharts = createMockEcharts();

    const first = render(
      <BubbleMap
        echarts={mockEcharts as any}
        geoJson={geoJson}
        data={data}
        lng="lon"
        lat="lat"
        name="city"
        value="requests"
      />,
    );
    first.unmount();

    render(
      <BubbleMap
        echarts={mockEcharts as any}
        geoJson={geoJson}
        data={data}
        lng="lon"
        lat="lat"
        name="city"
        value="requests"
      />,
    );

    expect(mockEcharts.registerMap).toHaveBeenCalledTimes(2);
    expect(mockEcharts.registerMap.mock.calls[0][0]).toBe(
      mockEcharts.registerMap.mock.calls[1][0],
    );
  });

  it("sanitizes custom map names before registering them", () => {
    const mockEcharts = createMockEcharts();

    render(
      <BubbleMap
        echarts={mockEcharts as any}
        geoJson={geoJson}
        mapName="world:traffic/map"
        data={data}
        lng="lon"
        lat="lat"
        name="city"
        value="requests"
      />,
    );

    expect(mockEcharts.registerMap).toHaveBeenCalledWith(
      "world-traffic-map",
      geoJson,
    );
  });

  it("uses bubbleSize when provided", async () => {
    const mockChart = createMockChart();
    const mockEcharts = createMockEcharts(mockChart);

    render(
      <BubbleMap
        echarts={mockEcharts as any}
        geoJson={geoJson}
        data={data}
        lng="lon"
        lat="lat"
        name="city"
        value="requests"
        bubbleSize={(value) => value / 2}
      />,
    );

    await waitFor(() => expect(mockChart.setOption).toHaveBeenCalled());
    const options = mockChart.setOption.mock.calls[0][0];

    expect(options.series[0].data[0].symbolSize).toBe(5);
    expect(options.series[0].data[1].symbolSize).toBe(10);
  });

  it("forwards the ECharts instance ref", async () => {
    const mockChart = createMockChart();
    const mockEcharts = createMockEcharts(mockChart);
    const ref = createRef<typeof mockChart | null>();

    const { unmount } = render(
      <BubbleMap
        ref={ref as any}
        echarts={mockEcharts as any}
        geoJson={geoJson}
        data={data}
        lng="lon"
        lat="lat"
        name="city"
        value="requests"
      />,
    );

    await waitFor(() => expect(ref.current).toBe(mockChart));

    unmount();

    expect(ref.current).toBeNull();
  });
});
