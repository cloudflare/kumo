import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
