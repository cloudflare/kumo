import { useState } from "react";
import { describe, expect, test } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { DatePicker } from "./date-picker";
import type { DateRange } from "react-day-picker";

function getRangeDay(calendar: Element, date: string) {
  const cell = calendar.querySelector<HTMLElement>(`[data-day="${date}"]`);
  const button = cell?.querySelector<HTMLButtonElement>("button");
  if (!cell || !button) {
    throw new Error(`DatePicker test day not found: ${date}`);
  }
  return { cell, button };
}

for (const mode of ["light", "dark"]) {
  for (const theme of ["kumo", "fedramp"]) {
    describe(`DatePicker outside-month ranges (${theme}, ${mode})`, () => {
      test.each([
        {
          name: "next-month endpoints",
          from: new Date(2026, 9, 1),
          to: new Date(2026, 9, 2),
          dates: ["2026-10-01", "2026-10-02"],
        },
        {
          name: "previous-month endpoints",
          from: new Date(2026, 8, 29),
          to: new Date(2026, 8, 30),
          dates: ["2026-09-29", "2026-09-30"],
        },
        {
          name: "range crossing the month boundary",
          from: new Date(2026, 8, 29),
          to: new Date(2026, 9, 3),
          dates: [
            "2026-09-29",
            "2026-09-30",
            "2026-10-01",
            "2026-10-02",
            "2026-10-03",
          ],
        },
        {
          name: "same-day range",
          from: new Date(2026, 9, 1),
          to: new Date(2026, 9, 1),
          dates: ["2026-10-01"],
        },
      ])(
        "uses a secondary highlight for $name",
        async ({ from, to, dates }) => {
          const { getByRole, getByTestId } = await render(
            <div data-mode={mode} data-theme={theme}>
              <div
                data-testid="secondary-range-colors"
                style={{
                  backgroundColor: "var(--color-kumo-tint)",
                  color: "var(--text-color-kumo-default)",
                }}
              />
              <DatePicker
                mode="range"
                defaultMonth={new Date(2026, 8, 1)}
                numberOfMonths={2}
                selected={{ from, to }}
                animate={false}
              />
            </div>,
          );

          const calendars = [
            getByRole("grid", { name: "September 2026" }).element(),
            getByRole("grid", { name: "October 2026" }).element(),
          ];
          const secondaryColors = getComputedStyle(
            getByTestId("secondary-range-colors").element(),
          );

          for (const date of dates) {
            const days = calendars.map((calendar) =>
              getRangeDay(calendar, date),
            );
            const outside = days.find((day) =>
              day.cell.hasAttribute("data-outside"),
            );
            const inside = days.find(
              (day) => !day.cell.hasAttribute("data-outside"),
            );
            if (!outside || !inside) {
              throw new Error(`DatePicker test needs both copies of ${date}`);
            }

            expect(getComputedStyle(outside.cell).backgroundColor).toBe(
              secondaryColors.backgroundColor,
            );
            expect(getComputedStyle(outside.cell).backgroundColor).not.toBe(
              getComputedStyle(inside.cell).backgroundColor,
            );
            expect(getComputedStyle(outside.button).color).toBe(
              secondaryColors.color,
            );
            expect(getComputedStyle(outside.button).opacity).toBe("1");
            expect(outside.button).toBeEnabled();
            expect(outside.cell).toHaveAttribute("aria-selected", "true");
            expect(inside.cell).toHaveAttribute("aria-selected", "true");
          }
        },
      );
    });
  }
}

function InteractiveRangePicker() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 9, 1),
    to: new Date(2026, 9, 2),
  });

  return (
    <DatePicker
      mode="range"
      defaultMonth={new Date(2026, 8, 1)}
      numberOfMonths={2}
      selected={range}
      onChange={setRange}
      animate={false}
    />
  );
}

describe("DatePicker outside-month interaction", () => {
  test("allows selection from a secondary range endpoint", async () => {
    const { getByRole } = await render(<InteractiveRangePicker />);
    const september = getByRole("grid", { name: "September 2026" });
    const october = getByRole("grid", { name: "October 2026" });

    await september
      .getByRole("button", { name: "Thursday, October 1st, 2026, selected" })
      .click();

    expect(
      getRangeDay(september.element(), "2026-10-02").cell,
    ).not.toHaveAttribute("aria-selected");
    expect(
      getRangeDay(october.element(), "2026-10-02").cell,
    ).not.toHaveAttribute("aria-selected");
    expect(getRangeDay(september.element(), "2026-10-01").cell).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(getRangeDay(october.element(), "2026-10-01").cell).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("preserves a visible keyboard focus indicator", async () => {
    const { getByRole } = await render(<InteractiveRangePicker />);
    const { button } = getRangeDay(
      getByRole("grid", { name: "September 2026" }).element(),
      "2026-10-01",
    );

    await userEvent.keyboard("{Tab}");
    button.focus();

    expect(button).toHaveFocus();
    expect(button.matches(":focus-visible")).toBe(true);
    expect(getComputedStyle(button).boxShadow).not.toBe("none");
  });

  test("keeps disabled outside dates unavailable", async () => {
    const { getByRole } = await render(
      <DatePicker
        mode="range"
        defaultMonth={new Date(2026, 8, 1)}
        numberOfMonths={2}
        selected={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 2) }}
        disabled={new Date(2026, 9, 2)}
        animate={false}
      />,
    );

    const { button } = getRangeDay(
      getByRole("grid", { name: "September 2026" }).element(),
      "2026-10-02",
    );
    expect(button).toBeDisabled();
    expect(getComputedStyle(button).opacity).toBe("0.4");
  });
});
