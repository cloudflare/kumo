import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MetricCard } from "./metric-card";

const CustomIcon = ({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    data-testid="custom-icon"
    width={size}
    height={size}
    className={className}
  />
);

describe("MetricCard", () => {
  // Rendering

  it("renders label, value, and unit", () => {
    render(<MetricCard label="Error Rate" value="0.3" unit="%" />);
    expect(screen.getByText("Error Rate")).toBeTruthy();
    expect(screen.getByText("0.3")).toBeTruthy();
    expect(screen.getByText("%")).toBeTruthy();
  });

  it("renders as a div by default", () => {
    const { container } = render(<MetricCard label="Requests" value="1.2M" />);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("renders value text without variant color classes", () => {
    const { getByText } = render(
      <MetricCard label="Errors" value="42" />,
    );
    const valueEl = getByText("42");
    expect(valueEl.className).toContain("text-xl");
    expect(valueEl.className).toContain("font-semibold");
    expect(valueEl.className).not.toContain("text-kumo-success");
    expect(valueEl.className).not.toContain("text-kumo-danger");
    expect(valueEl.className).not.toContain("text-kumo-warning");
  });

  // Polymorphic element

  it("renders as an anchor when href is provided", () => {
    const { container } = render(
      <MetricCard label="Requests" value="1.2M" href="/metrics" />,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.getAttribute("href")).toBe("/metrics");
  });

  it("renders as a button when onClick is provided and fires the handler", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { container } = render(
      <MetricCard label="Requests" value="1.2M" onClick={handleClick} />,
    );
    expect(container.firstElementChild?.tagName).toBe("BUTTON");
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders as an anchor when both href and onClick are provided", () => {
    const { container } = render(
      <MetricCard
        label="Requests"
        value="1.2M"
        href="/metrics"
        onClick={() => {}}
      />,
    );
    expect(container.firstElementChild?.tagName).toBe("A");
  });

  // Trend indicator

  it("renders trend label with correct color for default and lessIsBetter", () => {
    const { container: upGood } = render(
      <MetricCard
        label="Traffic"
        value="1.2M"
        trend={{ direction: "up", label: "5%" }}
      />,
    );
    expect(screen.getByText("5%")).toBeTruthy();
    expect(upGood.querySelector(".text-kumo-success")).toBeTruthy();

    const { container: downBad } = render(
      <MetricCard
        label="Requests"
        value="800K"
        trend={{ direction: "down", label: "5%" }}
      />,
    );
    expect(downBad.querySelector(".text-kumo-danger")).toBeTruthy();

    const { container: downGood } = render(
      <MetricCard
        label="Errors"
        value="12"
        trend={{ direction: "down", label: "5%", lessIsBetter: true }}
      />,
    );
    expect(downGood.querySelector(".text-kumo-success")).toBeTruthy();

    const { container: upBad } = render(
      <MetricCard
        label="Latency"
        value="142"
        trend={{ direction: "up", label: "5%", lessIsBetter: true }}
      />,
    );
    expect(upBad.querySelector(".text-kumo-danger")).toBeTruthy();
  });

  it("renders neutral trend without color emphasis", () => {
    const { container } = render(
      <MetricCard
        label="Stable"
        value="99.9"
        trend={{ direction: "neutral", label: "0%" }}
      />,
    );
    expect(screen.getByText("0%")).toBeTruthy();
    expect(container.querySelector(".text-xs.text-kumo-subtle")).toBeTruthy();
  });

  // Sparkline

  it("renders sparkline SVG when data is provided", () => {
    const { container } = render(
      <MetricCard
        label="Requests"
        value="1.2M"
        sparkline={{ data: [10, 20, 30, 40, 50] }}
      />,
    );
    expect(container.querySelector("svg[aria-hidden='true']")).toBeTruthy();

    // Verify spline paths are used (not polyline/polygon)
    expect(container.querySelector("svg path")).toBeTruthy();
    expect(container.querySelector("svg polyline")).toBeNull();
    expect(container.querySelector("svg polygon")).toBeNull();
  });

  it("does not render sparkline when data is empty", () => {
    const { container } = render(
      <MetricCard label="Requests" value="1.2M" sparkline={{ data: [] }} />,
    );
    expect(container.querySelectorAll("svg").length).toBe(0);
  });

  // Loading state

  it("shows label and hides value, trend, and sparkline when loading", () => {
    const { container } = render(
      <MetricCard
        label="Requests"
        value="1.2M"
        loading
        trend={{ direction: "up", label: "13.8%" }}
        sparkline={{ data: [10, 20, 30] }}
      />,
    );
    expect(screen.getByText("Requests")).toBeTruthy();
    expect(screen.queryByText("1.2M")).toBeNull();
    expect(screen.queryByText("13.8%")).toBeNull();
    expect(container.querySelector("svg[aria-hidden='true']")).toBeNull();
  });

  // Error state

  it("shows em-dash and hides unit, trend, and sparkline when error", () => {
    const { container } = render(
      <MetricCard
        label="Rate"
        value="0.3"
        unit="%"
        error
        trend={{ direction: "up", label: "13.8%" }}
        sparkline={{ data: [10, 20, 30] }}
      />,
    );
    expect(screen.getByText("Rate")).toBeTruthy();
    expect(screen.queryByText("0.3")).toBeNull();
    expect(screen.queryByText("%")).toBeNull();
    expect(screen.getByText("\u2014")).toBeTruthy();
    expect(screen.queryByText("13.8%")).toBeNull();
    expect(container.querySelector("svg[aria-hidden='true']")).toBeNull();
  });

  // Optional value

  it("allows omitting value when loading", () => {
    render(<MetricCard label="Requests" loading />);
    expect(screen.getByText("Requests")).toBeTruthy();
  });

  it("allows omitting value when error is true", () => {
    render(<MetricCard label="Requests" error />);
    expect(screen.getByText("Requests")).toBeTruthy();
    expect(screen.getByText("\u2014")).toBeTruthy();
  });

  it("renders nothing when value is omitted and neither loading nor error", () => {
    const { container } = render(<MetricCard label="Requests" />);
    expect(screen.getByText("Requests")).toBeTruthy();
    // The value span should be present but empty
    const valueSpan = container.querySelector(".text-xl.font-semibold");
    expect(valueSpan).toBeTruthy();
    expect(valueSpan?.textContent).toBe("");
  });

  // ReactNode value

  it("renders ReactNode value without typography wrapper", () => {
    const { container } = render(
      <MetricCard
        label="Health"
        value={<span data-testid="badge">Healthy</span>}
      />,
    );
    expect(screen.getByText("Healthy")).toBeTruthy();
    // Should NOT be wrapped in the typography span
    expect(container.querySelector(".text-xl.font-semibold")).toBeNull();
    // The ReactNode should render directly
    expect(container.querySelector('[data-testid="badge"]')).toBeTruthy();
  });

  it("applies items-center alignment for ReactNode values", () => {
    const { container } = render(
      <MetricCard
        label="Status"
        value={<span>Active</span>}
      />,
    );
    const valueRow = container.querySelector(".items-center.gap-2");
    expect(valueRow).toBeTruthy();
  });

  it("applies items-baseline alignment for string values", () => {
    const { container } = render(
      <MetricCard label="Count" value="42" />,
    );
    const valueRow = container.querySelector(".items-baseline.gap-2");
    expect(valueRow).toBeTruthy();
  });

  it("hides unit when value is a ReactNode", () => {
    render(
      <MetricCard
        label="Health"
        value={<span>Healthy</span>}
        unit="%"
      />,
    );
    expect(screen.getByText("Healthy")).toBeTruthy();
    expect(screen.queryByText("%")).toBeNull();
  });

  it("shows unit when value is a string", () => {
    render(<MetricCard label="Rate" value="0.3" unit="%" />);
    expect(screen.getByText("0.3")).toBeTruthy();
    expect(screen.getByText("%")).toBeTruthy();
  });

  it("renders ReactNode value with trend indicator", () => {
    render(
      <MetricCard
        label="Health"
        value={<span>Healthy</span>}
        trend={{ direction: "up", label: "5%" }}
      />,
    );
    expect(screen.getByText("Healthy")).toBeTruthy();
    expect(screen.getByText("5%")).toBeTruthy();
  });

  it("wraps string values with typography classes", () => {
    const { container } = render(
      <MetricCard label="Requests" value="1.2M" />,
    );
    const valueSpan = container.querySelector(".text-xl.font-semibold.tabular-nums");
    expect(valueSpan).toBeTruthy();
    expect(valueSpan?.textContent).toBe("1.2M");
  });

  it("treats number values as text values with typography wrapper", () => {
    const { container } = render(
      <MetricCard label="Count" value={42 as unknown as string} />,
    );
    // Number is treated as a text value so it gets the typography span
    const valueSpan = container.querySelector(".text-xl.font-semibold");
    expect(valueSpan).toBeTruthy();
  });

  // Tooltip

  it("renders an accessible tooltip button when tooltip is provided", () => {
    render(
      <MetricCard
        label="Requests"
        value="1.2M"
        tooltip="Total HTTP requests"
      />,
    );
    expect(
      screen.getByRole("button", { name: "More information" }),
    ).toBeTruthy();
  });

  it("renders a custom tooltip icon that inherits the label color", () => {
    const { container } = render(
      <MetricCard
        label="Requests"
        value="1.2M"
        tooltip="Help text"
        tooltipIcon={CustomIcon}
      />,
    );
    expect(container.querySelector('[data-testid="custom-icon"]')).toBeTruthy();
    // The trigger button carries text-kumo-subtle so icons inherit via currentColor
    const triggerButton = screen.getByRole("button", {
      name: "More information",
    });
    expect(triggerButton.className).toContain("text-kumo-subtle");
  });

  // Props and ref forwarding

  it("forwards className and rest props to the root element", () => {
    const { container } = render(
      <MetricCard
        label="Test"
        value="42"
        className="my-class"
        data-testid="my-metric"
      />,
    );
    const root = container.firstElementChild;
    expect(root?.className).toContain("my-class");
    expect(root?.getAttribute("data-testid")).toBe("my-metric");
  });

  it("forwards ref to the root element", () => {
    const ref = vi.fn();
    render(<MetricCard ref={ref} label="Requests" value="1.2M" />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  // lessIsBetter and isNeutral

  it("renders neutral color when isNeutral is true regardless of direction", () => {
    const { container } = render(
      <MetricCard
        label="Uptime"
        value="99.99%"
        trend={{ direction: "up", label: "0.0%", isNeutral: true }}
      />,
    );
    const trend = container.querySelector(".text-xs.text-kumo-subtle");
    expect(trend).toBeTruthy();
    expect(container.querySelector(".text-kumo-success")).toBeNull();
  });

  it("renders ArrowRightIcon for neutral direction", () => {
    const { container } = render(
      <MetricCard
        label="Uptime"
        value="99.99%"
        trend={{ direction: "neutral", label: "0.0%" }}
      />,
    );
    // Neutral direction should render an icon alongside the label
    // Use .text-xs to distinguish the trend indicator from the label text
    const trendSpan = container.querySelector(".text-xs.text-kumo-subtle");
    expect(trendSpan).toBeTruthy();
    expect(trendSpan?.querySelector("svg")).toBeTruthy();
  });

  it("inverts trend colors when lessIsBetter is true", () => {
    const { container: downGood } = render(
      <MetricCard
        label="CPU"
        value="3.2"
        unit="ms"
        trend={{ direction: "down", label: "8%", lessIsBetter: true }}
      />,
    );
    expect(downGood.querySelector(".text-kumo-success")).toBeTruthy();

    const { container: upBad } = render(
      <MetricCard
        label="CPU"
        value="3.2"
        unit="ms"
        trend={{ direction: "up", label: "8%", lessIsBetter: true }}
      />,
    );
    expect(upBad.querySelector(".text-kumo-danger")).toBeTruthy();
  });
});
