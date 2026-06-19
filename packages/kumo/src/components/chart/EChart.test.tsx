import type * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Chart } from "./EChart";

const createMockChart = () => ({
  setOption: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
});

const createMockEcharts = (mockChart = createMockChart()) => ({
  init: vi.fn(() => mockChart),
});

const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(
  window,
  "matchMedia",
);
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function restoreMatchMedia() {
  if (originalMatchMediaDescriptor) {
    Object.defineProperty(window, "matchMedia", originalMatchMediaDescriptor);
  } else {
    Reflect.deleteProperty(window, "matchMedia");
  }
}

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    get matches() {
      return matches;
    },
    media: REDUCED_MOTION_QUERY,
    onchange: null,
    addEventListener: vi.fn(
      (eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        if (eventName === "change") listeners.add(listener);
      },
    ),
    removeEventListener: vi.fn(
      (eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        if (eventName === "change") listeners.delete(listener);
      },
    ),
    addListener: vi.fn((listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    }),
    removeListener: vi.fn((listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    }),
  } as unknown as MediaQueryList;

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn(() => mediaQueryList),
  });

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = {
        matches: nextMatches,
        media: REDUCED_MOTION_QUERY,
      } as MediaQueryListEvent;
      for (const listener of listeners) listener(event);
    },
  };
}

afterEach(() => {
  restoreMatchMedia();
});

describe("Chart accessibility", () => {
  it("applies an accessible name and description to the chart wrapper", () => {
    const mockChart = createMockChart();
    const mockEcharts = createMockEcharts(mockChart);

    render(
      <Chart
        echarts={mockEcharts as unknown as typeof echarts}
        options={{ series: [] }}
        ariaLabel="Requests over time"
        ariaDescription="Shows the request rate for the last hour."
      />,
    );

    const chart = screen.getByRole("img", { name: "Requests over time" });
    const descriptionId = chart.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId ?? "")?.textContent).toBe(
      "Shows the request rate for the last hour.",
    );
    expect(mockChart.setOption.mock.calls[0][0].aria).toMatchObject({
      enabled: true,
      label: { description: "Shows the request rate for the last hour." },
    });
  });

  it("merges ECharts aria options without overwriting user-provided aria", () => {
    const mockChart = createMockChart();
    const mockEcharts = createMockEcharts(mockChart);

    render(
      <Chart
        echarts={mockEcharts as unknown as typeof echarts}
        options={{
          aria: {
            enabled: false,
            label: {
              description: "User-provided ECharts description",
            },
          },
          series: [],
        }}
        ariaLabel="Requests over time"
        ariaDescription="Wrapper description"
      />,
    );

    expect(mockChart.setOption.mock.calls[0][0].aria).toMatchObject({
      enabled: false,
      label: { description: "User-provided ECharts description" },
    });
    const chart = screen.getByRole("img", { name: "Requests over time" });
    const descriptionId = chart.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId ?? "")?.textContent).toBe(
      "Wrapper description",
    );
  });
});

describe("Chart reduced motion", () => {
  it("disables ECharts animation without removing other animation options", () => {
    mockMatchMedia(true);
    const mockChart = createMockChart();
    const mockEcharts = createMockEcharts(mockChart);

    render(
      <Chart
        echarts={mockEcharts as unknown as typeof echarts}
        options={{
          animation: true,
          animationDuration: 1_000,
          series: [
            { type: "bar", data: [1], animation: true },
          ] as EChartsOption["series"],
        }}
      />,
    );

    const options = mockChart.setOption.mock.calls[0][0];
    expect(options.animation).toBe(false);
    expect(options.animationDuration).toBe(1_000);
    expect(options.series[0]).toMatchObject({
      animation: false,
      data: [1],
      type: "bar",
    });
  });

  it("updates chart options when the reduced-motion preference changes", () => {
    const reducedMotion = mockMatchMedia(false);
    const mockChart = createMockChart();
    const mockEcharts = createMockEcharts(mockChart);

    render(
      <Chart
        echarts={mockEcharts as unknown as typeof echarts}
        options={{ animation: true, series: [] }}
      />,
    );

    expect(mockChart.setOption.mock.calls.at(-1)?.[0].animation).toBe(true);

    act(() => {
      reducedMotion.setMatches(true);
    });

    expect(mockChart.setOption.mock.calls.at(-1)?.[0].animation).toBe(false);
  });
});
