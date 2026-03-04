import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker } from "./color-picker";

describe("ColorPicker", () => {
  it("renders current hex value by default", () => {
    render(<ColorPicker value="#336699" />);
    expect(screen.getByText("#336699")).toBeTruthy();
  });

  it("commits hex input on Enter", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#336699" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button"));
    const input = screen.getByLabelText("Hex color value");

    fireEvent.change(input, { target: { value: "#ffffff" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("#FFFFFF");
  });

  it("hides trigger hex label when showValue is false", () => {
    render(<ColorPicker value="#123abc" showValue={false} />);
    expect(screen.queryByText("#123abc")).toBeNull();
  });

  it("respects disabled state on trigger", () => {
    render(<ColorPicker value="#123abc" disabled />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });
});
