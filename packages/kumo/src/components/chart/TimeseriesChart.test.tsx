import type * as echarts from "echarts/core";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TimeseriesChart } from "./TimeseriesChart";

const createMockEcharts = () => ({
  init: vi.fn(),
});

const chartData = [
  {
    name: "Requests",
    data: [
      [1_700_000_000_000, 10],
      [1_700_000_060_000, 20],
      [1_700_000_120_000, 30],
    ] as [number, number][],
    color: "#086FFF",
  },
];

describe("TimeseriesChart accessibility", () => {
  it("announces the loading state with localized text", () => {
    const mockEcharts = createMockEcharts();
    const { container } = render(
      <TimeseriesChart
        echarts={mockEcharts as unknown as typeof echarts}
        data={[]}
        loading
        loadingText="Loading request metrics"
      />,
    );

    expect(screen.getByRole("status").textContent).toBe(
      "Loading request metrics",
    );
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(mockEcharts.init).not.toHaveBeenCalled();
  });

  it("applies the selected range with pointer-operable fallback controls", async () => {
    const user = userEvent.setup();
    const mockEcharts = createMockEcharts();
    const onTimeRangeChange = vi.fn();

    render(
      <TimeseriesChart
        echarts={mockEcharts as unknown as typeof echarts}
        data={chartData}
        loading
        onTimeRangeChange={onTimeRangeChange}
        timeRangeControlsFormat={(timestamp) => `Timestamp ${timestamp}`}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText("Start"),
      String(chartData[0].data[1][0]),
    );
    await user.selectOptions(
      screen.getByLabelText("End"),
      String(chartData[0].data[2][0]),
    );
    await user.click(screen.getByRole("button", { name: "Apply range" }));

    expect(onTimeRangeChange).toHaveBeenCalledWith(
      chartData[0].data[1][0],
      chartData[0].data[2][0],
    );
  });

  it("provides a keyboard-operable full-range preset", async () => {
    const user = userEvent.setup();
    const mockEcharts = createMockEcharts();
    const onTimeRangeChange = vi.fn();

    render(
      <TimeseriesChart
        echarts={mockEcharts as unknown as typeof echarts}
        data={chartData}
        loading
        onTimeRangeChange={onTimeRangeChange}
      />,
    );

    const fullRangeButton = screen.getByRole("button", {
      name: "Use full range",
    });
    await act(async () => {
      fullRangeButton.focus();
    });
    await user.keyboard("{Enter}");

    expect(onTimeRangeChange).toHaveBeenCalledWith(
      chartData[0].data[0][0],
      chartData[0].data[2][0],
    );
  });

  it("renders localized fallback labels and timestamp options", () => {
    const mockEcharts = createMockEcharts();

    render(
      <TimeseriesChart
        echarts={mockEcharts as unknown as typeof echarts}
        data={chartData}
        loading
        onTimeRangeChange={vi.fn()}
        timeRangeControlsLabels={{
          groupLabel: "Zeitraum auswählen",
          instructions: "Start und Ende auswählen, dann anwenden.",
          startLabel: "Von",
          endLabel: "Bis",
          applyLabel: "Anwenden",
          fullRangeLabel: "Gesamter Zeitraum",
          emptyLabel: "Keine Zeitstempel verfügbar",
        }}
        timeRangeControlsFormat={(timestamp) => `Zeitpunkt ${timestamp}`}
      />,
    );

    expect(
      screen.getByRole("form", { name: "Zeitraum auswählen" }),
    ).toBeTruthy();
    expect(
      screen.getByText("Start und Ende auswählen, dann anwenden."),
    ).toBeTruthy();
    expect(screen.getByLabelText("Von")).toBeTruthy();
    expect(screen.getByLabelText("Bis")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Anwenden" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Gesamter Zeitraum" }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("option", {
        name: `Zeitpunkt ${chartData[0].data[0][0]}`,
      }),
    ).toHaveLength(2);
  });
});
