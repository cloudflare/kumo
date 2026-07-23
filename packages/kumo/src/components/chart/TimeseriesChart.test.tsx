import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { TimeseriesChart } from "./TimeseriesChart";

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
});

describe("TimeseriesChart", () => {
  it("server-renders without browser globals", () => {
    const mockEcharts = createMockEcharts();
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;

    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);

    try {
      expect(() =>
        renderToString(
          <TimeseriesChart
            echarts={mockEcharts as any}
            data={[
              {
                name: "Requests",
                color: "#4290F0",
                data: [[1, 10]],
              },
            ]}
          />,
        ),
      ).not.toThrow();
    } finally {
      vi.stubGlobal("window", originalWindow);
      vi.stubGlobal("document", originalDocument);
    }
  });

  it("closes the tooltip when leaving the chart after a context menu interaction", async () => {
    const mockChart = createMockChart();
    const mockEcharts = createMockEcharts(mockChart);

    render(
      <TimeseriesChart
        echarts={mockEcharts as any}
        data={[
          {
            name: "Requests",
            color: "#4290F0",
            data: [[1, 10]],
          },
        ]}
      />,
    );

    const updateAxisPointer = mockChart.on.mock.calls.find(
      (call) => call[0] === "updateaxispointer",
    )?.[1];
    expect(updateAxisPointer).toBeTypeOf("function");

    await act(() => updateAxisPointer({ axesInfo: [{ value: 1 }] }));
    expect(await screen.findByText("Requests")).not.toBeNull();

    const trigger = document.querySelector("[data-base-ui-tooltip-trigger]");
    expect(trigger).toBeInstanceOf(HTMLElement);
    fireEvent.contextMenu(trigger as HTMLElement);
    expect(screen.queryByText("Requests")).not.toBeNull();

    await act(() => updateAxisPointer({ axesInfo: [{ value: 1 }] }));
    expect(await screen.findByText("Requests")).not.toBeNull();

    vi.spyOn(trigger as HTMLElement, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 100, 100),
    );
    fireEvent.mouseMove(window, { clientX: 101, clientY: 50 });

    expect(screen.queryByText("Requests")).toBeNull();
  });

  it("reactivates brush-to-zoom after a notMerge option update", async () => {
    const mockChart = createMockChart();
    const mockEcharts = createMockEcharts(mockChart);
    const onTimeRangeChange = vi.fn();
    const optionUpdateBehavior = { notMerge: true };

    const { rerender } = render(
      <TimeseriesChart
        echarts={mockEcharts as any}
        data={[
          {
            name: "Requests",
            color: "#4290F0",
            data: [[1, 10]],
          },
        ]}
        markers={[{ timestamp: 1, label: "Deployment" }]}
        onTimeRangeChange={onTimeRangeChange}
        optionUpdateBehavior={optionUpdateBehavior}
      />,
    );

    await waitFor(() =>
      expect(mockChart.dispatchAction).toHaveBeenCalledWith({
        type: "takeGlobalCursor",
        key: "brush",
        brushOption: {
          brushType: "lineX",
          brushMode: "single",
        },
      }),
    );
    mockChart.dispatchAction.mockClear();

    rerender(
      <TimeseriesChart
        echarts={mockEcharts as any}
        data={[
          {
            name: "Requests",
            color: "#4290F0",
            data: [
              [1, 10],
              [2, 20],
            ],
          },
        ]}
        markers={[{ timestamp: 1, label: "Deployment" }]}
        onTimeRangeChange={onTimeRangeChange}
        optionUpdateBehavior={optionUpdateBehavior}
      />,
    );

    await waitFor(() =>
      expect(mockChart.dispatchAction).toHaveBeenCalledWith({
        type: "takeGlobalCursor",
        key: "brush",
        brushOption: {
          brushType: "lineX",
          brushMode: "single",
        },
      }),
    );
  });
});
