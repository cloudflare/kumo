import { describe, it, expect, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Slider } from "./slider";

describe("Slider", () => {
  it("should have correct display name", () => {
    expect(Slider.displayName).toBe("Slider");
  });

  it("labels the thumb with the visible label", () => {
    render(<Slider label="Volume" defaultValue={40} />);

    const thumb = screen.getByLabelText("Volume", { selector: "input" });
    expect(thumb.getAttribute("type")).toBe("range");
    expect(thumb.getAttribute("aria-valuenow")).toBe("40");
  });

  it("renders one thumb per value for a range", () => {
    render(
      <Slider
        defaultValue={[25, 75]}
        getAriaLabel={(index) => (index === 0 ? "Minimum" : "Maximum")}
      />,
    );

    expect(screen.getByLabelText("Minimum").getAttribute("aria-valuenow")).toBe(
      "25",
    );
    expect(screen.getByLabelText("Maximum").getAttribute("aria-valuenow")).toBe(
      "75",
    );
  });

  it("shows the value badges and the min and max labels by default", () => {
    render(<Slider label="Count" defaultValue={2} max={5} />);

    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("hides the value badges and range labels when turned off", () => {
    render(
      <Slider
        label="Count"
        defaultValue={2}
        max={5}
        showValue={false}
        showRange={false}
      />,
    );

    expect(screen.queryByText("2")).toBeNull();
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.queryByText("5")).toBeNull();
  });

  it("formats values with the format option", () => {
    render(
      <Slider
        label="Share"
        defaultValue={0.5}
        min={0}
        max={1}
        step={0.1}
        format={{ style: "percent" }}
      />,
    );

    expect(screen.getByText("50%")).toBeTruthy();
    expect(screen.getByText("0%")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
  });

  it("reports changes from the keyboard", () => {
    const onValueChange = vi.fn();
    render(
      <Slider label="Volume" defaultValue={40} onValueChange={onValueChange} />,
    );

    fireEvent.keyDown(screen.getByLabelText("Volume", { selector: "input" }), {
      key: "ArrowRight",
    });

    expect(onValueChange.mock.calls[0]?.[0]).toBe(41);
  });

  it("applies the size variant to the track", () => {
    const { container } = render(
      <Slider label="Volume" defaultValue={40} size="sm" />,
    );

    expect(container.querySelector(".h-6")).toBeTruthy();
  });
});
