import { describe, expect, it } from "vite-plus/test";
import { render } from "@testing-library/react";
import { DatePicker } from "./date-picker";

const OCTOBER_2026 = new Date(2026, 9, 1);

function getRoot(container: HTMLElement) {
  const root = container.querySelector<HTMLElement>(".rdp-root");
  if (!root) {
    throw new Error("DatePicker root not found");
  }
  return root;
}

function getDayButton(container: HTMLElement, isoDate: string) {
  const button = container.querySelector<HTMLButtonElement>(
    `[data-day="${isoDate}"] button`,
  );
  if (!button) {
    throw new Error(`DatePicker day button not found: ${isoDate}`);
  }
  return button;
}

describe("DatePicker surface", () => {
  it("leaves spacing to its container", () => {
    // No internal padding on purpose: consumers place it in a Popover or a
    // page layout and set the spacing there, without overriding ours.
    const { container } = render(<DatePicker mode="single" />);
    expect(getRoot(container).className).not.toMatch(/(^|\s)p[xytrbse]?-/);
  });

  it("applies padding passed through className", () => {
    const { container } = render(<DatePicker mode="single" className="p-3" />);
    expect(getRoot(container).className).toMatch(/(^|\s)p-3(\s|$)/);
  });

  it("sets text-sm so it renders the same inline and in a Popover", () => {
    // The caption and weekday labels inherit their size from the root.
    const { container } = render(<DatePicker mode="single" />);
    expect(getRoot(container).className).toMatch(/(^|\s)text-sm(\s|$)/);
  });
});

describe("DatePicker day states", () => {
  it("marks a single selection", () => {
    const { container } = render(
      <DatePicker
        mode="single"
        defaultMonth={OCTOBER_2026}
        selected={new Date(2026, 9, 15)}
      />,
    );
    expect(getDayButton(container, "2026-10-15").dataset.selectedSingle).toBe(
      "true",
    );
    expect(
      getDayButton(container, "2026-10-16").dataset.selectedSingle,
    ).toBeUndefined();
  });

  it("marks the ends and the middle of a range", () => {
    const { container } = render(
      <DatePicker
        mode="range"
        defaultMonth={OCTOBER_2026}
        selected={{ from: new Date(2026, 9, 21), to: new Date(2026, 9, 24) }}
      />,
    );
    const middle = getDayButton(container, "2026-10-22");
    expect(getDayButton(container, "2026-10-21").dataset.rangeStart).toBe(
      "true",
    );
    expect(middle.dataset.rangeMiddle).toBe("true");
    expect(getDayButton(container, "2026-10-24").dataset.rangeEnd).toBe("true");
    // Days inside a range get the band, not the single-selection fill.
    expect(middle.dataset.selectedSingle).toBeUndefined();
  });

  it("highlights today only while it isn't selected", () => {
    const today = new Date(2026, 9, 28);
    const unselected = render(
      <DatePicker mode="single" defaultMonth={OCTOBER_2026} today={today} />,
    );
    expect(getDayButton(unselected.container, "2026-10-28").dataset.today).toBe(
      "true",
    );
    unselected.unmount();

    // Without onChange, react-day-picker reads `selected` only on mount.
    const selected = render(
      <DatePicker
        mode="single"
        defaultMonth={OCTOBER_2026}
        today={today}
        selected={today}
      />,
    );
    expect(
      getDayButton(selected.container, "2026-10-28").dataset.today,
    ).toBeUndefined();
  });
});
