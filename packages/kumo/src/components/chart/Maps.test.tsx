import { createRef } from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";
import { GlobeMap } from "./GlobeMap";
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

describe("GlobeMap", () => {
  it("renders an accessible SVG globe without ECharts", () => {
    const onMarkerClick = vi.fn();
    const { getByLabelText, getByRole } = render(
      <GlobeMap
        markers={[
          {
            name: "London",
            description: "Availability location",
            latitude: 51.5,
            longitude: -0.12,
          },
        ]}
        showGraticule
        onMarkerClick={onMarkerClick}
        aria-label="Traffic globe"
      />,
    );

    const globe = getByLabelText("Traffic globe");
    expect(globe.tagName).toBe("svg");
    expect(getByRole("group", { name: "Traffic globe" })).toBe(globe);
    expect(globe.getAttribute("aria-describedby")).toBeTruthy();
    expect(globe.querySelectorAll("path").length).toBeGreaterThan(3);
    const landPath = globe
      .querySelector('[data-land-style="hatched"]')
      ?.getAttribute("d");
    expect(landPath).toContain("L");
    expect(landPath?.match(/M/g)?.length).toBeGreaterThan(100);
    const sphereClip = globe.querySelector("clipPath");
    expect(sphereClip).not.toBeNull();
    expect(landPath).toBeTruthy();
    expect(
      globe
        .querySelector('[data-land-style="hatched"]')
        ?.getAttribute("clip-path"),
    ).toBe(`url(#${sphereClip?.id})`);
    expect(globe.querySelectorAll("circle")).toHaveLength(1);
    expect(globe.querySelector("pattern")).toBeNull();
    expect(globe.querySelector(".stroke-kumo-base")).not.toBeNull();

    fireEvent.keyDown(
      getByRole("button", { name: "London: Availability location" }),
      { key: "Enter" },
    );
    expect(onMarkerClick).toHaveBeenCalledWith(
      expect.objectContaining({ name: "London" }),
    );
  });

  it("updates rotation while dragging", async () => {
    const onUserRotationChange = vi.fn();
    const { getByLabelText } = render(
      <GlobeMap
        aria-label="Draggable globe"
        onUserRotationChange={onUserRotationChange}
      />,
    );
    const globe = getByLabelText("Draggable globe");
    const land = globe.querySelector('[data-land-style="hatched"]');
    const initialPath = land?.getAttribute("d");

    fireEvent.pointerDown(globe, {
      pointerId: 1,
      clientX: 100,
      clientY: 100,
      button: 0,
      isPrimary: true,
    });
    fireEvent.pointerMove(globe, { pointerId: 1, clientX: 140, clientY: 100 });

    await waitFor(() => expect(land?.getAttribute("d")).not.toBe(initialPath));
    expect(onUserRotationChange).toHaveBeenCalledWith([2, -20, 0]);
  });

  it("supports keyboard rotation", async () => {
    const onUserRotationChange = vi.fn();
    const { getByRole } = render(
      <GlobeMap
        aria-label="Keyboard globe"
        onUserRotationChange={onUserRotationChange}
      />,
    );
    const globe = getByRole("group", { name: "Keyboard globe" });

    await userEvent.type(globe, "{ArrowRight}{ArrowUp}");

    expect(onUserRotationChange).toHaveBeenNthCalledWith(1, [0, -20, 0]);
    expect(onUserRotationChange).toHaveBeenNthCalledWith(2, [0, -10, 0]);
  });

  it("does not expose informational markers as buttons", () => {
    const { container, getByRole, queryByRole } = render(
      <GlobeMap
        markers={[{ name: "London", latitude: 51.5, longitude: -0.12 }]}
      />,
    );

    expect(queryByRole("button", { name: /London:/ })).toBeNull();
    const marker = container.querySelector("[data-globe-marker]");
    expect(marker?.getAttribute("aria-hidden")).toBe("true");
    expect(marker?.getAttribute("tabindex")).toBeNull();
    expect(
      getByRole("list", { name: "Interactive globe map locations" })
        .textContent,
    ).toContain("London: 51.50, -0.12");
  });

  it("renders markers above the outline and fades them at the horizon", () => {
    const { container } = render(
      <GlobeMap
        defaultRotation={[0, 0, 0]}
        markers={[{ name: "Edge", latitude: 0, longitude: 80 }]}
      />,
    );
    const outline = container.querySelector("[data-globe-outline]");
    const marker = container.querySelector("[data-globe-marker]");
    const opacity = Number(marker?.getAttribute("opacity"));

    expect(outline?.nextElementSibling).toBe(marker);
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
  });

  it("calls onMarkerClick when a marker is clicked", async () => {
    const user = userEvent.setup();
    const onMarkerClick = vi.fn();
    const { getByRole } = render(
      <GlobeMap
        markers={[{ name: "London", latitude: 51.5, longitude: -0.12 }]}
        onMarkerClick={onMarkerClick}
      />,
    );

    await user.click(getByRole("button", { name: /London:/ }));
    expect(onMarkerClick).toHaveBeenCalledWith(
      expect.objectContaining({ name: "London" }),
    );
  });
});

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
