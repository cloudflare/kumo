import { createRef } from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { geoContains, geoOrthographic, geoPath } from "d3-geo";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { GlobeMap } from "./GlobeMap";
import { BubbleMap, ChoroplethMap, type MapGeoJson } from "./Maps";
import { GLOBE_LAND } from "./globe-land";

const createMockChart = () => ({
  setOption: vi.fn(),
  dispatchAction: vi.fn(),
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
  it("uses correctly oriented generated land geometry", () => {
    expect(geoContains(GLOBE_LAND, [-0.12, 51.5])).toBe(true);
    expect(geoContains(GLOBE_LAND, [0, 0])).toBe(false);
    expect(geoContains(GLOBE_LAND, [-140, 0])).toBe(false);
  });

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
    expect(landPath).toBeTruthy();
    const landPattern = globe.querySelector("pattern");
    expect(landPattern).not.toBeNull();
    expect(landPattern?.querySelector("line")?.getAttribute("stroke")).toBe(
      "var(--text-color-kumo-subtle)",
    );
    expect(
      landPattern?.querySelector("line")?.getAttribute("stroke-opacity"),
    ).toBe("0.75");
    expect(
      globe.querySelector('[data-land-style="hatched"]')?.getAttribute("fill"),
    ).toBe(`url(#${landPattern?.id})`);
    expect(globe.querySelector("[data-globe-marker-visual]")).not.toBeNull();
    expect(globe.querySelector("[data-globe-marker-hit-area]")).not.toBeNull();
    // Borderless by default, like BubbleMap.
    const visual = globe.querySelector("[data-globe-marker-visual]");
    expect(visual?.getAttribute("stroke")).toBeNull();
    expect(visual?.getAttribute("stroke-width")).toBeNull();
    expect(globe.querySelector(".stroke-kumo-base")).toBeNull();

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

  it("keeps auto-rotating after pointer focus but pauses for keyboard use", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    try {
      const { getByRole } = render(
        <GlobeMap
          aria-label="Spinning globe"
          autoRotate
          autoRotateSpeed={60}
        />,
      );
      const globe = getByRole("group", { name: "Spinning globe" });
      const land = globe.querySelector('[data-land-style="hatched"]');
      if (!land) throw new Error("Expected land path");
      vi.spyOn(globe, "matches").mockImplementation(
        (selector) => selector !== ":focus-visible",
      );

      fireEvent.focus(globe);
      const focusedPath = land.getAttribute("d");
      await waitFor(() => expect(land.getAttribute("d")).not.toBe(focusedPath));

      fireEvent.keyDown(globe, { key: "ArrowRight" });
      await new Promise((resolve) => setTimeout(resolve, 50));
      const pausedPath = land.getAttribute("d");
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(land.getAttribute("d")).toBe(pausedPath);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("pauses auto-rotation while a mouse hovers the globe", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    try {
      const { getByRole } = render(
        <GlobeMap
          aria-label="Hover globe"
          autoRotate
          autoRotateSpeed={60}
          markers={[{ name: "LHR", latitude: 51.5, longitude: -0.12 }]}
        />,
      );
      const globe = getByRole("group", { name: "Hover globe" });
      const land = globe.querySelector('[data-land-style="hatched"]');
      const hoverArea = globe.querySelector("[data-globe-hover-area]");
      if (!land || !hoverArea) throw new Error("Expected globe parts");

      fireEvent.pointerEnter(hoverArea, { pointerType: "mouse" });
      await new Promise((resolve) => setTimeout(resolve, 50));
      const pausedPath = land.getAttribute("d");
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(land.getAttribute("d")).toBe(pausedPath);

      fireEvent.pointerLeave(hoverArea, { pointerType: "mouse" });
      await waitFor(() => expect(land.getAttribute("d")).not.toBe(pausedPath));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps a decorative globe spinning under the mouse", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    try {
      const { getByRole } = render(
        <GlobeMap
          aria-label="Decorative globe"
          autoRotate
          autoRotateSpeed={60}
        />,
      );
      const globe = getByRole("group", { name: "Decorative globe" });
      const land = globe.querySelector('[data-land-style="hatched"]');
      const hoverArea = globe.querySelector("[data-globe-hover-area]");
      if (!land || !hoverArea) throw new Error("Expected globe parts");

      fireEvent.pointerEnter(hoverArea, { pointerType: "mouse" });
      const initialPath = land.getAttribute("d");
      await waitFor(() => expect(land.getAttribute("d")).not.toBe(initialPath));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("does not pause auto-rotation for touch pointers", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    try {
      const { getByRole } = render(
        <GlobeMap aria-label="Touch globe" autoRotate autoRotateSpeed={60} />,
      );
      const globe = getByRole("group", { name: "Touch globe" });
      const land = globe.querySelector('[data-land-style="hatched"]');
      const hoverArea = globe.querySelector("[data-globe-hover-area]");
      if (!land || !hoverArea) throw new Error("Expected globe parts");

      fireEvent.pointerEnter(hoverArea, { pointerType: "touch" });
      const initialPath = land.getAttribute("d");
      await waitFor(() => expect(land.getAttribute("d")).not.toBe(initialPath));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("sizes markers with a value as area-proportional bubbles", () => {
    const { container } = render(
      <GlobeMap
        defaultRotation={[0, 0, 0]}
        minRadius={4}
        maxRadius={16}
        markers={[
          { name: "Small", latitude: 0, longitude: 10, value: 25 },
          { name: "Large", latitude: 0, longitude: -10, value: 100 },
          { name: "Plain", latitude: 10, longitude: 0 },
          { name: "Fixed", latitude: -10, longitude: 0, value: 100, radius: 3 },
        ]}
      />,
    );
    const visuals = [
      ...container.querySelectorAll("[data-globe-marker-visual]"),
    ].map((circle) => circle.getAttribute("r"));

    // Draw order is largest first: Large (16), Small (4 + sqrt(0.25) * 12 = 10),
    // Plain (markerRadius default 7), Fixed (explicit radius 3).
    expect(visuals).toEqual(["16", "10", "7", "3"]);
  });

  it("uses bubbleSize when provided", () => {
    const { container } = render(
      <GlobeMap
        defaultRotation={[0, 0, 0]}
        bubbleSize={(value) => value / 10}
        markers={[{ name: "A", latitude: 0, longitude: 0, value: 50 }]}
      />,
    );
    expect(
      container.querySelector("[data-globe-marker-visual]")?.getAttribute("r"),
    ).toBe("5");
  });

  it("formats marker values in the tooltip and screen-reader list", () => {
    const { container, getByRole } = render(
      <GlobeMap
        defaultRotation={[0, 0, 0]}
        valueFormat={(value) => `${value} req/s`}
        markers={[
          {
            name: "LHR",
            description: "London",
            latitude: 0,
            longitude: 0,
            value: 1200,
          },
        ]}
      />,
    );
    expect(
      getByRole("list", { name: "Interactive globe map locations" })
        .textContent,
    ).toBe("LHR: London, 1200 req/s");

    const marker = container.querySelector("[data-globe-marker]");
    if (!marker) throw new Error("Expected a visible globe marker");
    fireEvent.pointerEnter(marker, { pointerType: "mouse" });
    const tooltip = getByRole("tooltip");
    expect(tooltip.textContent).toContain("London");
    expect(tooltip.textContent).toContain("1200 req/s");
  });

  it("applies marker opacity and border props", () => {
    const { container } = render(
      <GlobeMap
        defaultRotation={[0, 0, 0]}
        markerOpacity={0.6}
        markerBorderColor="white"
        markerBorderWidth={1}
        markers={[{ name: "A", latitude: 0, longitude: 0, value: 1 }]}
      />,
    );
    const visual = container.querySelector("[data-globe-marker-visual]");
    expect(visual?.getAttribute("fill-opacity")).toBe("0.6");
    expect(visual?.getAttribute("stroke")).toBe("white");
    expect(visual?.getAttribute("stroke-width")).toBe("1");
    expect(visual?.getAttribute("class")).not.toContain("stroke-kumo-base");
  });

  it("uses the base surface border colour when only a width is set", () => {
    const { container } = render(
      <GlobeMap
        defaultRotation={[0, 0, 0]}
        markerBorderWidth={2}
        markers={[{ name: "A", latitude: 0, longitude: 0 }]}
      />,
    );
    const visual = container.querySelector("[data-globe-marker-visual]");
    expect(visual?.getAttribute("stroke-width")).toBe("2");
    expect(visual?.getAttribute("class")).toContain("stroke-kumo-base");
  });

  it("only disables touch gestures while dragging is enabled", () => {
    const { getByLabelText, rerender } = render(
      <GlobeMap aria-label="Static globe" draggable={false} />,
    );

    expect(getByLabelText("Static globe").getAttribute("class")).not.toContain(
      "touch-none",
    );

    rerender(<GlobeMap aria-label="Draggable globe" />);
    expect(getByLabelText("Draggable globe").getAttribute("class")).toContain(
      "touch-none",
    );
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
    // Not clickable, so it inherits the globe's grab cursor.
    expect(marker?.getAttribute("class")).not.toContain("cursor-pointer");
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

  it("gives markers a larger hover target without changing their visual size", () => {
    const { container } = render(
      <GlobeMap
        markerRadius={7}
        markers={[{ name: "London", latitude: 51.5, longitude: -0.12 }]}
      />,
    );
    const visual = container.querySelector("[data-globe-marker-visual]");
    const hitArea = container.querySelector("[data-globe-marker-hit-area]");

    expect(visual?.getAttribute("r")).toBe("7");
    expect(hitArea?.getAttribute("r")).toBe("15");
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
    expect(
      getByRole("button", { name: /London:/ }).getAttribute("class"),
    ).toContain("cursor-pointer");
  });

  describe("tooltip placement", () => {
    // Container 400px wide; tooltip measures 100 x 24.
    const hoverMarkerAt = (visual: DOMRect) => {
      vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(
        100,
      );
      vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(
        24,
      );
      vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(
        400,
      );
      const utils = render(
        <GlobeMap
          markers={[
            {
              name: "ICN",
              description: "Seoul",
              latitude: 51.5,
              longitude: -0.12,
              value: 24810,
            },
          ]}
          valueFormat={(value) => `${(value / 1000).toFixed(2)}k`}
        />,
      );
      const marker = utils.container.querySelector<SVGGElement>(
        "[data-globe-marker]",
      );
      const circle = marker?.querySelector("[data-globe-marker-visual]");
      const svg = marker?.ownerSVGElement;
      if (!marker || !circle || !svg) throw new Error("Expected a marker");
      vi.spyOn(svg, "getBoundingClientRect").mockReturnValue(
        new DOMRect(10, 20, 400, 400),
      );
      vi.spyOn(circle, "getBoundingClientRect").mockReturnValue(visual);
      fireEvent.pointerEnter(marker, { pointerType: "mouse" });
      return { ...utils, marker, tooltip: utils.getByRole("tooltip") };
    };

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("renders a compact single-row tooltip", () => {
      const { tooltip } = hoverMarkerAt(new DOMRect(190, 220, 20, 20));
      expect(tooltip.className).toContain("whitespace-nowrap");
      expect(tooltip.className).not.toContain("flex-col");
      expect(tooltip.textContent).toBe("Seoul (ICN)24.81k");
      expect(tooltip.style.visibility).toBe("visible");
    });

    it("sits above the visible bubble without following the pointer", () => {
      const { container, marker, tooltip } = hoverMarkerAt(
        new DOMRect(190, 220, 20, 20),
      );
      // Centre x = 200 - 10 = 190; left = 190 - 100 / 2.
      expect(tooltip.style.left).toBe("140px");
      // Bubble top = 200; top = 200 - 6 gap - 24 height.
      expect(tooltip.style.top).toBe("170px");

      const initialStyle = tooltip.getAttribute("style");
      fireEvent.pointerMove(marker, { clientX: 300, clientY: 300 });
      expect(tooltip.getAttribute("style")).toBe(initialStyle);

      fireEvent.pointerLeave(marker);
      expect(container.querySelector('[role="tooltip"]')).toBeNull();
    });

    it("flips below the bubble when it would be cut off at the top", () => {
      const { tooltip } = hoverMarkerAt(new DOMRect(190, 30, 20, 20));
      // Bubble bottom = 50 - 20 = 30; top = 30 + 6 gap.
      expect(tooltip.style.top).toBe("36px");
    });

    it("clamps horizontally inside the container", () => {
      const left = hoverMarkerAt(new DOMRect(12, 220, 10, 10));
      expect(left.tooltip.style.left).toBe("4px");
      left.unmount();

      const right = hoverMarkerAt(new DOMRect(400, 220, 10, 10));
      // 400 container - 100 width - 4 padding.
      expect(right.tooltip.style.left).toBe("296px");
    });
  });

  describe("regions (choropleth)", () => {
    /** 10° square centred on a point, wound counter-clockwise (RFC 7946). */
    const square = (name: string, longitude: number, latitude = 0) => ({
      type: "Feature" as const,
      properties: { name },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [longitude - 5, latitude - 5],
            [longitude + 5, latitude - 5],
            [longitude + 5, latitude + 5],
            [longitude - 5, latitude + 5],
            [longitude - 5, latitude - 5],
          ],
        ],
      },
    });
    const regionGeoJson: MapGeoJson = {
      type: "FeatureCollection",
      features: [
        square("Low", 0),
        square("Mid", 0, 20),
        square("High", 20),
        square("NoData", -20),
        square("FarSide", 180),
      ],
    };
    const regions = [
      { name: "Low", value: 0 },
      { name: "Mid", value: 50 },
      { name: "High", value: 100 },
      { name: "FarSide", value: 10 },
    ];
    const renderRegions = (
      props: Partial<Parameters<typeof GlobeMap>[0]> = {},
    ) =>
      render(
        <GlobeMap
          aria-label="Choropleth globe"
          defaultRotation={[0, 0, 0]}
          regionGeoJson={regionGeoJson}
          regions={regions}
          regionColorRange={["#000000", "#ffffff"]}
          {...props}
        />,
      );
    const regionPath = (container: HTMLElement, name: string) =>
      container.querySelector(`[data-globe-region="${name}"]`);
    const regionStroke = (container: HTMLElement, name: string) => {
      const fill = regionPath(container, name)?.getAttribute("fill") ?? "";
      const id = /^url\(#(.+)\)$/.exec(fill)?.[1];
      return [...container.querySelectorAll("pattern")]
        .find((pattern) => pattern.id === id)
        ?.querySelector("line")
        ?.getAttribute("stroke");
    };

    it("draws only visible regions that have data", () => {
      const { container } = renderRegions();
      expect(regionPath(container, "Low")).not.toBeNull();
      expect(regionPath(container, "Mid")).not.toBeNull();
      expect(regionPath(container, "High")).not.toBeNull();
      expect(regionPath(container, "NoData")).toBeNull();
      expect(regionPath(container, "FarSide")).toBeNull();
    });

    it("fixes RFC 7946 winding so a region covers only itself", () => {
      const { container } = renderRegions();
      const d = regionPath(container, "Low")?.getAttribute("d") ?? "";
      const numbers = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
      expect(numbers.length).toBeGreaterThan(0);
      // A 10° square at the globe centre spans ~±26px around (320, 320),
      // not the whole sphere.
      for (const value of numbers) {
        expect(Math.abs(value - 320)).toBeLessThan(40);
      }
    });

    it("matches the clipped projection in front and at the horizon", () => {
      const clipped = geoPath(
        geoOrthographic()
          .translate([320, 320])
          .scale(302)
          .clipAngle(90)
          .rotate([0, 0, 0]),
      ).digits(1);
      const numbers = (d: string | null | undefined) =>
        (d?.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
      const features = [square("Front", 10), square("Edge", 88)];
      const { container } = renderRegions({
        regionGeoJson: { type: "FeatureCollection", features },
        regions: [
          { name: "Front", value: 1 },
          { name: "Edge", value: 2 },
        ],
      });
      for (const feature of features) {
        const ring = feature.geometry.coordinates[0]!;
        const expected = numbers(
          clipped({
            type: "Polygon",
            coordinates: [[...ring].reverse()],
          }),
        );
        const actual = numbers(
          regionPath(container, feature.properties.name)?.getAttribute("d"),
        );
        expect(actual).toHaveLength(expected.length);
        actual.forEach((value, i) =>
          expect(Math.abs(value - expected[i]!)).toBeLessThanOrEqual(0.1),
        );
      }
    });

    it("colours region hatching along the colour range by value", () => {
      const { container } = renderRegions();
      expect(regionStroke(container, "Low")).toBe("#000000");
      expect(regionStroke(container, "Mid")).toBe("#808080");
      expect(regionStroke(container, "High")).toBe("#ffffff");
    });

    it("lets a region override its colour", () => {
      const { container } = renderRegions({
        regions: [{ name: "Low", value: 1, color: "tomato" }],
      });
      expect(regionStroke(container, "Low")).toBe("tomato");
    });

    it("shows a compact tooltip without outlining the hovered region", () => {
      const { container, getByRole, queryByRole } = renderRegions({
        valueFormat: (value) => `${value}k`,
      });
      const high = regionPath(container, "High");
      if (!high) throw new Error("Expected the High region");

      fireEvent.pointerEnter(high, { pointerType: "mouse" });
      expect(getByRole("tooltip").textContent).toBe("High100k");
      expect(high.getAttribute("stroke")).toBeNull();

      fireEvent.pointerLeave(high, { pointerType: "mouse" });
      expect(queryByRole("tooltip")).toBeNull();
    });

    it("shows a region label instead of the join key", () => {
      const { container, getByRole } = renderRegions({
        regions: [{ name: "High", label: "Highland", value: 5 }],
      });
      const high = regionPath(container, "High");
      if (!high) throw new Error("Expected the High region");
      fireEvent.pointerEnter(high, { pointerType: "mouse" });
      expect(getByRole("tooltip").textContent).toBe("Highland5");
      expect(
        getByRole("list", { name: "Choropleth globe regions" }).textContent,
      ).toBe("Highland: 5");
    });

    it("joins on numeric feature properties", () => {
      const numeric: MapGeoJson = {
        type: "FeatureCollection",
        features: [{ ...square("ignored", 0), properties: { iso_n3: 356 } }],
      };
      const { container } = renderRegions({
        regionGeoJson: numeric,
        regionNameProperty: "iso_n3",
        regions: [{ name: "356", label: "India", value: 1 }],
      });
      expect(regionPath(container, "356")).not.toBeNull();
    });

    it("lists matched regions for screen readers", () => {
      const { getByRole } = renderRegions();
      const items = [
        ...getByRole("list", { name: "Choropleth globe regions" }).children,
      ].map((item) => item.textContent);
      expect(items).toEqual(["Low: 0", "Mid: 50", "High: 100", "FarSide: 10"]);
    });

    it("focuses an active region: rotates to it, bolds it, shows its tooltip", async () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      try {
        const { container, getByRole } = renderRegions({
          activeRegion: "High",
          valueFormat: (value) => `${value}k`,
        });
        // Reduced motion: jumps straight to centre High (lon 20, lat 0).
        await waitFor(() =>
          expect(getByRole("tooltip").textContent).toBe("High100k"),
        );
        const d = regionPath(container, "High")?.getAttribute("d") ?? "";
        const numbers = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
        for (const value of numbers) {
          expect(Math.abs(value - 320)).toBeLessThan(40);
        }
        const fill = regionPath(container, "High")?.getAttribute("fill") ?? "";
        const id = /^url\(#(.+)\)$/.exec(fill)?.[1];
        const line = [...container.querySelectorAll("pattern")]
          .find((pattern) => pattern.id === id)
          ?.querySelector("line");
        expect(line?.getAttribute("stroke-width")).toBe("2.5");
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });

  describe("controlled active marker", () => {
    const markers = [
      { name: "LHR", description: "London", latitude: 51.5, longitude: -0.12 },
      {
        name: "SIN",
        description: "Singapore",
        latitude: 1.35,
        longitude: 103.8,
      },
    ];
    const activeVisual = (container: HTMLElement) =>
      container.querySelector(
        "[data-globe-marker-active] [data-globe-marker-visual]",
      );

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("rotates to the active marker, highlights it and shows its tooltip", async () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const { container, getByRole } = render(
        <GlobeMap markers={markers} activeMarker="SIN" />,
      );
      await waitFor(() =>
        expect(getByRole("tooltip").textContent).toBe("Singapore (SIN)"),
      );
      const position = /translate\(([-\d.]+) ([-\d.]+)\)/
        .exec(
          activeVisual(container)?.parentElement?.getAttribute("transform") ??
            "",
        )
        ?.slice(1)
        .map(Number);
      expect(position?.[0]).toBeCloseTo(320, 0);
      expect(position?.[1]).toBeCloseTo(320, 0);
      expect(
        container.querySelector(
          "[data-globe-marker-active] [data-globe-marker-halo]",
        ),
      ).not.toBeNull();
      // The active marker is drawn last, on top of the others.
      const all = container.querySelectorAll("[data-globe-marker]");
      expect(
        all[all.length - 1]?.hasAttribute("data-globe-marker-active"),
      ).toBe(true);
    });

    it("clears the highlight and tooltip when set back to null", async () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const { container, queryByRole, rerender } = render(
        <GlobeMap markers={markers} activeMarker="LHR" />,
      );
      await waitFor(() => expect(queryByRole("tooltip")).not.toBeNull());
      rerender(<GlobeMap markers={markers} activeMarker={null} />);
      await waitFor(() => expect(queryByRole("tooltip")).toBeNull(), {
        timeout: 2000,
      });
      expect(container.querySelector("[data-globe-marker-halo]")).toBeNull();
    });

    it("applies the initial active marker without waiting for activeDelay", () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const { container } = render(
        <GlobeMap markers={markers} activeMarker="LHR" activeDelay={10_000} />,
      );
      expect(
        container.querySelector("[data-globe-marker-halo]"),
      ).not.toBeNull();
    });

    it("debounces active changes so only the settled item is focused", async () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const { container, getByRole, rerender } = render(
        <GlobeMap markers={markers} activeDelay={60} />,
      );
      // Sweep across items faster than the delay: nothing is focused yet.
      rerender(
        <GlobeMap markers={markers} activeMarker="SIN" activeDelay={60} />,
      );
      rerender(
        <GlobeMap markers={markers} activeMarker="LHR" activeDelay={60} />,
      );
      expect(container.querySelector("[data-globe-marker-active]")).toBeNull();

      // Only the item the pointer rests on is focused.
      await waitFor(() =>
        expect(getByRole("tooltip").textContent).toBe("London (LHR)"),
      );
      expect(
        container.querySelectorAll("[data-globe-marker-active]"),
      ).toHaveLength(1);
    });

    it("uses a shorter delay when moving between items", async () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const { getByRole, rerender } = render(
        <GlobeMap markers={markers} activeMarker="LHR" activeDelay={1000} />,
      );
      await waitFor(() =>
        expect(getByRole("tooltip").textContent).toBe("London (LHR)"),
      );
      const start = performance.now();
      rerender(
        <GlobeMap markers={markers} activeMarker="SIN" activeDelay={1000} />,
      );
      expect(getByRole("tooltip").textContent).toBe("London (LHR)");
      await waitFor(() =>
        expect(getByRole("tooltip").textContent).toBe("Singapore (SIN)"),
      );
      expect(performance.now() - start).toBeLessThan(600);
    });

    it("waits the full delay again after clearing", async () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const { container, rerender } = render(
        <GlobeMap markers={markers} activeMarker="LHR" activeDelay={400} />,
      );
      const halo = () => container.querySelector("[data-globe-marker-halo]");
      rerender(
        <GlobeMap markers={markers} activeMarker={null} activeDelay={400} />,
      );
      rerender(
        <GlobeMap markers={markers} activeMarker="SIN" activeDelay={400} />,
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(halo()).toBeNull();
      await waitFor(() => expect(halo()).not.toBeNull(), { timeout: 1000 });
    });

    it("clears immediately and cancels a pending item", async () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const { container, queryByRole, rerender } = render(
        <GlobeMap markers={markers} activeMarker="LHR" activeDelay={50} />,
      );
      const halo = () => container.querySelector("[data-globe-marker-halo]");
      expect(halo()).not.toBeNull();

      // Leaving clears on the same render: no waiting.
      rerender(
        <GlobeMap markers={markers} activeMarker={null} activeDelay={50} />,
      );
      expect(halo()).toBeNull();
      expect(queryByRole("tooltip")).toBeNull();

      // Hover an item, then leave before it settles: it never gets focused.
      rerender(
        <GlobeMap markers={markers} activeMarker="SIN" activeDelay={50} />,
      );
      rerender(
        <GlobeMap markers={markers} activeMarker={null} activeDelay={50} />,
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(halo()).toBeNull();

      // Coming back waits the full delay again.
      rerender(
        <GlobeMap markers={markers} activeMarker="LHR" activeDelay={50} />,
      );
      expect(halo()).toBeNull();
      await waitFor(() => expect(halo()).not.toBeNull());
    });

    it("doesn't flash the tooltip when the same item is focused again", async () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const { queryByRole, rerender } = render(
        <GlobeMap markers={markers} activeMarker="LHR" activeDelay={0} />,
      );
      await waitFor(() => expect(queryByRole("tooltip")).not.toBeNull());

      rerender(
        <GlobeMap markers={markers} activeMarker={null} activeDelay={0} />,
      );
      rerender(
        <GlobeMap markers={markers} activeMarker="LHR" activeDelay={0} />,
      );
      // Not shown until the globe has rotated there again.
      expect(queryByRole("tooltip")).toBeNull();
      await waitFor(() => expect(queryByRole("tooltip")).not.toBeNull());
    });

    it("keeps user rotation when an inline callback changes", async () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const firstCallback = vi.fn();
      const latestCallback = vi.fn();
      const renderGlobe = (callback: typeof firstCallback) => (
        <GlobeMap
          markers={markers}
          activeMarker="LHR"
          onUserRotationChange={(rotation) => callback(rotation)}
        />
      );
      const { container, getByRole, rerender } = render(
        renderGlobe(firstCallback),
      );
      await waitFor(() => expect(getByRole("tooltip")).toBeTruthy());
      const globe = container.querySelector("svg")!;
      const land = container.querySelector('[data-land-style="hatched"]')!;
      fireEvent.keyDown(globe, { key: "ArrowRight" });
      const userPath = land.getAttribute("d");

      rerender(renderGlobe(latestCallback));
      await act(async () => {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
      });
      expect(land.getAttribute("d")).toBe(userPath);
      fireEvent.keyDown(globe, { key: "ArrowRight" });
      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(latestCallback).toHaveBeenCalledTimes(1);
    });

    it("reacts immediately with activeDelay={0}", () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const { container, rerender } = render(
        <GlobeMap markers={markers} activeDelay={0} />,
      );
      rerender(
        <GlobeMap markers={markers} activeMarker="LHR" activeDelay={0} />,
      );
      expect(
        container.querySelector("[data-globe-marker-halo]"),
      ).not.toBeNull();
    });

    it("animates to the active marker and keeps auto-rotation paused", async () => {
      vi.stubGlobal("IntersectionObserver", undefined);
      const { container, getByRole } = render(
        <GlobeMap
          markers={markers}
          activeMarker="SIN"
          autoRotate
          autoRotateSpeed={60}
        />,
      );
      await waitFor(
        () => expect(getByRole("tooltip").textContent).toBe("Singapore (SIN)"),
        { timeout: 2000 },
      );
      const land = container.querySelector('[data-land-style="hatched"]');
      const arrivedPath = land?.getAttribute("d");
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(land?.getAttribute("d")).toBe(arrivedPath);
    });

    it("moves the hatch pattern with the globe so lines don't crawl", () => {
      const { container, getByRole } = render(
        <GlobeMap aria-label="Hatch globe" landHatchSpacing={10} />,
      );
      const transform = () =>
        container.querySelector("pattern")?.getAttribute("patternTransform");
      const offsetX = () =>
        Number(/translate\(([-\d.]+) /.exec(transform() ?? "")?.[1]);
      const before = offsetX();
      fireEvent.keyDown(getByRole("group", { name: "Hatch globe" }), {
        key: "ArrowRight",
      });
      // +10° longitude moves land at the centre by 10 × (π/180) × 302 ≈ 52.71
      // view-box px; 45° lines repeat every 10 × √2 ≈ 14.14.
      const period = 10 * Math.SQRT2;
      const expected = (before + 52.709 + period) % period;
      expect(offsetX()).toBeCloseTo(expected, 1);
      expect(transform()).toContain("rotate(-45)");
    });
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

describe("controlled active item on flat maps", () => {
  const actions = (mockChart: ReturnType<typeof createMockChart>) =>
    mockChart.dispatchAction.mock.calls.map(([action]) => action);

  it("highlights a BubbleMap bubble and shows its tooltip", async () => {
    const mockChart = createMockChart();
    const mockEcharts = createMockEcharts(mockChart);
    const props = {
      echarts: mockEcharts as any,
      geoJson,
      data,
      lng: "lon" as const,
      lat: "lat" as const,
      name: "city" as const,
      value: "requests" as const,
    };
    const { rerender } = render(<BubbleMap {...props} activeIndex={1} />);

    await waitFor(() =>
      expect(actions(mockChart)).toContainEqual({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: 1,
      }),
    );
    expect(actions(mockChart)).toContainEqual({
      type: "highlight",
      seriesIndex: 0,
      dataIndex: 1,
    });

    mockChart.dispatchAction.mockClear();
    rerender(<BubbleMap {...props} activeIndex={null} />);
    await waitFor(
      () => expect(actions(mockChart)).toContainEqual({ type: "hideTip" }),
      { timeout: 2000 },
    );
    expect(actions(mockChart)).toContainEqual({
      type: "downplay",
      seriesIndex: 0,
    });
  });

  it("debounces activeIndex so only the settled bubble is highlighted", async () => {
    const mockChart = createMockChart();
    const props = {
      echarts: createMockEcharts(mockChart) as any,
      geoJson,
      data,
      lng: "lon" as const,
      lat: "lat" as const,
      value: "requests" as const,
      activeDelay: 60,
    };
    const { rerender } = render(<BubbleMap {...props} />);
    await waitFor(() => expect(mockChart.setOption).toHaveBeenCalled());

    rerender(<BubbleMap {...props} activeIndex={0} />);
    rerender(<BubbleMap {...props} activeIndex={1} />);
    await waitFor(() =>
      expect(actions(mockChart)).toContainEqual({
        type: "highlight",
        seriesIndex: 0,
        dataIndex: 1,
      }),
    );
    expect(actions(mockChart)).not.toContainEqual({
      type: "highlight",
      seriesIndex: 0,
      dataIndex: 0,
    });
  });

  it("doesn't call setOption again when a parent re-renders with inline callbacks", async () => {
    const mockChart = createMockChart();
    const mockEcharts = createMockEcharts(mockChart) as any;
    const renderMap = (activeIndex: number | null) => (
      <BubbleMap
        echarts={mockEcharts}
        geoJson={geoJson}
        data={data}
        lng="lon"
        lat="lat"
        value={(row) => row.requests}
        valueFormat={(v) => `${v} req`}
        activeIndex={activeIndex}
      />
    );
    const { rerender } = render(renderMap(null));
    await waitFor(() => expect(mockChart.setOption).toHaveBeenCalled());
    // The first re-render drops `geo` once it has been applied (by design).
    rerender(renderMap(null));
    await new Promise((resolve) => setTimeout(resolve, 20));
    const calls = mockChart.setOption.mock.calls.length;

    rerender(renderMap(0));
    rerender(renderMap(1));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockChart.setOption).toHaveBeenCalledTimes(calls);
  });

  it("ignores out-of-range indexes and never dispatches without an active item", async () => {
    const mockChart = createMockChart();
    render(
      <BubbleMap
        echarts={createMockEcharts(mockChart) as any}
        geoJson={geoJson}
        data={data}
        lng="lon"
        lat="lat"
        value="requests"
        activeIndex={5}
      />,
    );
    await waitFor(() => expect(mockChart.setOption).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockChart.dispatchAction).not.toHaveBeenCalled();
  });

  it("highlights a ChoroplethMap region by name", async () => {
    const mockChart = createMockChart();
    render(
      <ChoroplethMap
        echarts={createMockEcharts(mockChart) as any}
        geoJson={geoJson}
        data={[{ country: "United States", requests: 10 }]}
        name="country"
        value="requests"
        activeRegion="United States"
      />,
    );
    await waitFor(() =>
      expect(actions(mockChart)).toContainEqual({
        type: "showTip",
        seriesIndex: 0,
        name: "United States",
      }),
    );
    expect(actions(mockChart)).toContainEqual({
      type: "highlight",
      seriesIndex: 0,
      name: "United States",
    });
  });

  it.each(["missing from geometry", "missing from data"])(
    "clears the previous tooltip when the new region is %s",
    async (missing) => {
      const mockChart = createMockChart();
      const props = {
        echarts: createMockEcharts(mockChart) as any,
        geoJson: {
          ...geoJson,
          features:
            missing === "missing from data"
              ? [
                  ...geoJson.features,
                  {
                    ...geoJson.features[0],
                    properties: { name: "Missing" },
                  },
                ]
              : geoJson.features,
        },
        data:
          missing === "missing from geometry"
            ? [
                { country: "United States", requests: 10 },
                { country: "Missing", requests: 20 },
              ]
            : [{ country: "United States", requests: 10 }],
        name: "country" as const,
        value: "requests" as const,
        activeDelay: 0,
      };
      const { rerender } = render(
        <ChoroplethMap {...props} activeRegion="United States" />,
      );
      await waitFor(() =>
        expect(actions(mockChart)).toContainEqual({
          type: "showTip",
          seriesIndex: 0,
          name: "United States",
        }),
      );
      mockChart.dispatchAction.mockClear();

      rerender(<ChoroplethMap {...props} activeRegion="Missing" />);
      await waitFor(() =>
        expect(actions(mockChart)).toContainEqual({ type: "hideTip" }),
      );
      expect(actions(mockChart)).not.toContainEqual({
        type: "showTip",
        seriesIndex: 0,
        name: "Missing",
      });
    },
  );

  it("re-shows the active tooltip when the pointer leaves the chart", async () => {
    const mockChart = createMockChart();
    render(
      <ChoroplethMap
        echarts={createMockEcharts(mockChart) as any}
        geoJson={geoJson}
        data={[{ country: "United States", requests: 10 }]}
        name="country"
        value="requests"
        activeRegion="United States"
      />,
    );
    await waitFor(() => expect(mockChart.dispatchAction).toHaveBeenCalled());
    const globalout = mockChart.on.mock.calls.find(
      ([event]) => event === "globalout",
    )?.[1] as (() => void) | undefined;
    expect(globalout).toBeDefined();

    mockChart.dispatchAction.mockClear();
    globalout?.();
    expect(actions(mockChart)).toContainEqual({
      type: "showTip",
      seriesIndex: 0,
      name: "United States",
    });
  });
});

describe("live flat-map tooltips", () => {
  it.each([
    ["bubbles", "valueFormat", "controlled"],
    ["bubbles", "tooltipFormatter", "controlled"],
    ["regions", "valueFormat", "controlled"],
    ["regions", "tooltipFormatter", "controlled"],
    ["bubbles", "valueFormat", "hovered"],
    ["bubbles", "tooltipFormatter", "hovered"],
    ["regions", "valueFormat", "hovered"],
    ["regions", "tooltipFormatter", "hovered"],
  ])(
    "refreshes %s %s while %s without rebuilding chart options",
    async (kind, formatting, interaction) => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart) as any;
      const regionData = [{ country: "United States", requests: 10 }];
      let visibleHtml = "";
      const showTooltip = (dataIndex: number) => {
        const options = mockChart.setOption.mock.calls.at(-1)![0];
        const point = options.series[0].data[dataIndex];
        visibleHtml = options.tooltip.formatter({
          name: point.name,
          value: point.value,
          data: point,
          seriesIndex: 0,
          dataIndex,
        });
      };
      // Model ECharts evaluating its formatter when showTip is dispatched.
      mockChart.dispatchAction.mockImplementation((action) => {
        if (action.type === "showTip") showTooltip(action.dataIndex ?? 0);
        if (action.type === "hideTip") visibleHtml = "";
      });
      const renderMap = (unit: string) => {
        const formatters =
          formatting === "valueFormat"
            ? { valueFormat: (value: number) => `${value} ${unit}` }
            : {
                tooltipFormatter: (row: { requests: number }) =>
                  `${row.requests} ${unit}`,
              };
        return kind === "bubbles" ? (
          <BubbleMap
            echarts={mockEcharts}
            geoJson={geoJson}
            data={data}
            lng="lon"
            lat="lat"
            value="requests"
            activeIndex={interaction === "controlled" ? 0 : null}
            {...formatters}
          />
        ) : (
          <ChoroplethMap
            echarts={mockEcharts}
            geoJson={geoJson}
            data={regionData}
            name="country"
            value="requests"
            activeRegion={interaction === "controlled" ? "United States" : null}
            {...formatters}
          />
        );
      };
      const { rerender } = render(renderMap("requests"));
      // Complete the initial view handoff before checking option stability.
      rerender(renderMap("requests"));
      await act(async () => {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
      });
      if (interaction === "hovered") showTooltip(0);
      expect(visibleHtml).toContain("10 requests");
      const optionCalls = mockChart.setOption.mock.calls.length;
      mockChart.dispatchAction.mockClear();

      // Equivalent inline functions shouldn't refresh the tooltip either.
      rerender(renderMap("requests"));
      expect(mockChart.dispatchAction).not.toHaveBeenCalled();
      rerender(renderMap("req/s"));
      expect(visibleHtml).toContain("10 req/s");
      expect(mockChart.setOption).toHaveBeenCalledTimes(optionCalls);

      // Once dismissed, changing formatters must not reopen the tooltip.
      if (interaction === "controlled") {
        // Clearing the active item dismisses the controlled tooltip.
        interaction = "hovered";
        rerender(renderMap("req/s"));
        await act(async () => {
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
        });
      } else {
        const globalout = mockChart.on.mock.calls.find(
          ([event]) => event === "globalout",
        )![1];
        await act(() => globalout());
      }
      mockChart.dispatchAction.mockClear();
      rerender(renderMap("updated"));
      expect(mockChart.dispatchAction).not.toHaveBeenCalled();
    },
  );
});
