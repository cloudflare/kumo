import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChartLegend } from "./Legend";

describe("ChartLegend semantics", () => {
  it("renders static small legend items as plain content", () => {
    const onPointerEnter = vi.fn();
    const { container } = render(
      <ChartLegend.SmallItem
        name="Requests"
        color="#086FFF"
        value="1,234"
        onPointerEnter={onPointerEnter}
      />,
    );

    const item = container.firstElementChild as HTMLElement;
    expect(item.tagName).toBe("DIV");
    expect(item.getAttribute("role")).toBeNull();
    expect(item.getAttribute("tabindex")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders static large legend items as plain content", () => {
    const { container } = render(
      <ChartLegend.LargeItem
        name="Latency"
        color="#CF7EE9"
        value="42"
        unit="ms"
      />,
    );

    const item = container.firstElementChild as HTMLElement;
    expect(item.tagName).toBe("DIV");
    expect(item.getAttribute("role")).toBeNull();
    expect(item.getAttribute("tabindex")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders interactive legend items as native buttons", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <ChartLegend.SmallItem
        name="Requests"
        color="#086FFF"
        value="1,234"
        onClick={onClick}
      />,
    );

    const button = screen.getByRole("button", { name: /Requests.*1,234/ });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("tabindex")).toBeNull();
    expect(button.tabIndex).toBe(0);

    await user.click(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("exposes active pressed state by default for interactive legend items", () => {
    render(
      <ChartLegend.SmallItem
        name="Requests"
        color="#086FFF"
        value="1,234"
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("adds a non-layout 24px hit area to interactive small legend items", () => {
    render(
      <ChartLegend.SmallItem
        name="Requests"
        color="#086FFF"
        value="1,234"
        onClick={vi.fn()}
      />,
    );

    const classes = screen.getByRole("button").className;
    expect(classes).toContain("before:min-h-6");
    expect(classes).toContain("before:min-w-6");
    expect(classes).not.toContain("min-h-6 min-w-6");
  });

  it("exposes inactive state for interactive legend items", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <ChartLegend.LargeItem
        name="Latency"
        color="#CF7EE9"
        value="42"
        inactive
        onClick={onClick}
      />,
    );

    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
      "false",
    );

    rerender(
      <ChartLegend.LargeItem
        name="Latency"
        color="#CF7EE9"
        value="42"
        inactive={false}
        onClick={onClick}
      />,
    );

    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
      "true",
    );
  });
});
