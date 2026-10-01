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

function InteractiveRangePicker({
  initialRange = { from: new Date(2026, 9, 1), to: new Date(2026, 9, 2) },
  min,
}: {
  initialRange?: DateRange | undefined;
  min?: number;
}) {
  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  return (
    <DatePicker
      mode="range"
      defaultMonth={new Date(2026, 8, 1)}
      numberOfMonths={2}
      selected={range}
      onChange={setRange}
      min={min}
      animate={false}
    />
  );
}

for (const mode of ["light", "dark"]) {
  for (const theme of ["kumo", "fedramp"]) {
    describe(`DatePicker selection panel order (${theme}, ${mode})`, () => {
      test.each(["September 2026", "October 2026"])(
        "keeps the first selection panel primary when starting in %s",
        async (primaryMonth) => {
          const { getByRole, getByTestId } = await render(
            <div data-mode={mode} data-theme={theme}>
              <div
                data-testid="primary-range-colors"
                style={{
                  backgroundColor:
                    mode === "light" ? "oklch(20.5% 0 0)" : "oklch(97% 0 0)",
                  color:
                    mode === "light" ? "oklch(97% 0 0)" : "oklch(20.5% 0 0)",
                }}
              />
              <div
                data-testid="secondary-range-colors"
                style={{
                  backgroundColor: "var(--color-kumo-tint)",
                  color: "var(--text-color-kumo-default)",
                }}
              />
              <InteractiveRangePicker initialRange={{ from: undefined }} />
            </div>,
          );
          const primaryColors = getComputedStyle(
            getByTestId("primary-range-colors").element(),
          );
          const secondaryColors = getComputedStyle(
            getByTestId("secondary-range-colors").element(),
          );
          const primary = getByRole("grid", { name: primaryMonth });
          const secondary = getByRole("grid", {
            name:
              primaryMonth === "September 2026"
                ? "October 2026"
                : "September 2026",
          });

          await primary
            .getByRole("button", { name: "Thursday, October 1st, 2026" })
            .click();
          const firstPrimary = getRangeDay(primary.element(), "2026-10-01");
          const firstSecondary = getRangeDay(secondary.element(), "2026-10-01");
          expect(getComputedStyle(firstPrimary.cell).backgroundColor).not.toBe(
            getComputedStyle(firstSecondary.cell).backgroundColor,
          );
          expect(getComputedStyle(firstPrimary.button).opacity).toBe("1");
          expect(getComputedStyle(firstPrimary.cell).backgroundColor).toBe(
            primaryColors.backgroundColor,
          );
          await expect
            .poll(() => getComputedStyle(firstPrimary.button).color)
            .toBe(primaryColors.color);
          expect(getComputedStyle(firstSecondary.cell).backgroundColor).toBe(
            secondaryColors.backgroundColor,
          );
          await expect
            .poll(() => getComputedStyle(firstSecondary.button).color)
            .toBe(secondaryColors.color);

          await secondary
            .getByRole("button", { name: "Friday, October 2nd, 2026" })
            .click();
          for (const date of ["2026-10-01", "2026-10-02"]) {
            const primaryDay = getRangeDay(primary.element(), date);
            const secondaryDay = getRangeDay(secondary.element(), date);
            expect(getComputedStyle(primaryDay.cell).backgroundColor).toBe(
              primaryColors.backgroundColor,
            );
            await expect
              .poll(() => getComputedStyle(primaryDay.button).color)
              .toBe(primaryColors.color);
            expect(getComputedStyle(secondaryDay.cell).backgroundColor).toBe(
              secondaryColors.backgroundColor,
            );
            await expect
              .poll(() => getComputedStyle(secondaryDay.button).color)
              .toBe(secondaryColors.color);
            expect(
              getComputedStyle(secondaryDay.cell).backgroundColor,
            ).not.toBe(getComputedStyle(primaryDay.cell).backgroundColor);
            expect(primaryDay.cell).toHaveAttribute("aria-selected", "true");
            expect(secondaryDay.cell).toHaveAttribute("aria-selected", "true");
          }
        },
      );
    });
  }
}

describe("DatePicker range-origin lifecycle", () => {
  test.each([0, 2])(
    "retains the origin across a month-spanning range with min=%s",
    async (min) => {
      const { getByRole } = await render(
        <InteractiveRangePicker initialRange={{ from: undefined }} min={min} />,
      );
      const september = getByRole("grid", { name: "September 2026" });
      const october = getByRole("grid", { name: "October 2026" });

      await september
        .getByRole("button", { name: "Tuesday, September 29th, 2026" })
        .click();
      await october
        .getByRole("button", { name: "Saturday, October 3rd, 2026" })
        .click();

      for (const date of [
        "2026-09-29",
        "2026-09-30",
        "2026-10-01",
        "2026-10-02",
        "2026-10-03",
      ]) {
        expect(getRangeDay(september.element(), date).cell).toHaveAttribute(
          "data-kumo-range-emphasis",
          "primary",
        );
        expect(getRangeDay(october.element(), date).cell).toHaveAttribute(
          "data-kumo-range-emphasis",
          "secondary",
        );
      }
    },
  );

  test("switches origin when a new range starts in the other panel", async () => {
    const { getByRole } = await render(
      <InteractiveRangePicker initialRange={{ from: undefined }} />,
    );
    const september = getByRole("grid", { name: "September 2026" });
    const october = getByRole("grid", { name: "October 2026" });
    await september
      .getByRole("button", { name: "Thursday, October 1st, 2026" })
      .click();
    await september
      .getByRole("button", { name: "Friday, October 2nd, 2026" })
      .click();

    await october
      .getByRole("button", { name: "Thursday, October 1st, 2026, selected" })
      .click();

    expect(getRangeDay(october.element(), "2026-10-01").cell).toHaveAttribute(
      "data-kumo-range-emphasis",
      "primary",
    );
    expect(getRangeDay(september.element(), "2026-10-01").cell).toHaveAttribute(
      "data-kumo-range-emphasis",
      "secondary",
    );
  });

  test("supports uncontrolled selection and keyboard activation", async () => {
    const { getByRole } = await render(
      <DatePicker
        mode="range"
        defaultMonth={new Date(2026, 8, 1)}
        numberOfMonths={2}
        animate={false}
      />,
    );
    const september = getByRole("grid", { name: "September 2026" });
    const october = getByRole("grid", { name: "October 2026" });
    const start = getRangeDay(september.element(), "2026-10-01").button;
    const end = getRangeDay(october.element(), "2026-10-02").button;
    start.focus();
    await userEvent.keyboard("{Enter}");
    end.focus();
    await userEvent.keyboard("{Enter}");

    expect(getRangeDay(september.element(), "2026-10-02").cell).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(getRangeDay(september.element(), "2026-10-02").cell).toHaveAttribute(
      "data-kumo-range-emphasis",
      "primary",
    );
    expect(getRangeDay(october.element(), "2026-10-02").cell).toHaveAttribute(
      "data-kumo-range-emphasis",
      "secondary",
    );
  });

  test("uses in-month emphasis for an external preset instead of retaining stale origin", async () => {
    function RangeWithPreset() {
      const [range, setRange] = useState<DateRange>();
      return (
        <>
          <button
            onClick={() =>
              setRange({ from: new Date(2026, 9, 1), to: new Date(2026, 9, 3) })
            }
          >
            Apply preset
          </button>
          <DatePicker
            mode="range"
            defaultMonth={new Date(2026, 8, 1)}
            numberOfMonths={2}
            selected={range}
            onChange={setRange}
            animate={false}
          />
        </>
      );
    }
    const { getByRole } = await render(<RangeWithPreset />);
    const september = getByRole("grid", { name: "September 2026" });
    const october = getByRole("grid", { name: "October 2026" });
    await september
      .getByRole("button", { name: "Thursday, October 1st, 2026" })
      .click();
    await september
      .getByRole("button", { name: "Friday, October 2nd, 2026" })
      .click();

    await getByRole("button", { name: "Apply preset" }).click();

    expect(getRangeDay(september.element(), "2026-10-01").cell).toHaveAttribute(
      "data-kumo-range-emphasis",
      "secondary",
    );
    expect(getRangeDay(october.element(), "2026-10-01").cell).toHaveAttribute(
      "data-kumo-range-emphasis",
      "primary",
    );
  });

  test("restores in-month emphasis when navigating away from the origin month", async () => {
    const { getByRole } = await render(
      <InteractiveRangePicker initialRange={{ from: undefined }} />,
    );
    const september = getByRole("grid", { name: "September 2026" });
    await september
      .getByRole("button", { name: "Thursday, October 1st, 2026" })
      .click();
    await september
      .getByRole("button", { name: "Friday, October 2nd, 2026" })
      .click();

    await getByRole("button", { name: "Go to the Next Month" }).click();

    expect(
      getRangeDay(
        getByRole("grid", { name: "October 2026" }).element(),
        "2026-10-01",
      ).cell,
    ).toHaveAttribute("data-kumo-range-emphasis", "primary");
  });
});

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
