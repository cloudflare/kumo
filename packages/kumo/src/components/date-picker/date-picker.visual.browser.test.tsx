import { useState } from "react";
import { describe, expect, test } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { DatePicker } from "./date-picker";
import type { DateRange } from "react-day-picker";

function getDateCell(calendar: Element, date: string) {
  const cell = calendar.querySelector<HTMLElement>(`[data-day="${date}"]`);
  if (!cell) {
    throw new Error(`DatePicker test date cell not found: ${date}`);
  }
  return cell;
}

function getDateButton(calendar: Element, date: string) {
  const button = getDateCell(calendar, date).querySelector<HTMLButtonElement>(
    "button",
  );
  if (!button) {
    throw new Error(`DatePicker test date button not found: ${date}`);
  }
  return button;
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
        "shows each selected date only once for $name",
        async ({ from, to, dates }) => {
          const { getByRole } = await render(
            <div data-mode={mode} data-theme={theme}>
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

          for (const calendar of calendars) {
            const outsideCells = calendar.querySelectorAll("[data-outside]");
            expect(outsideCells.length).toBeGreaterThan(0);
            for (const cell of outsideCells) {
              expect(cell).not.toBeVisible();
              expect(cell).toHaveTextContent("");
              expect(cell.querySelector("button")).toBeNull();
            }
          }

          for (const date of dates) {
            const cells = calendars.map((calendar) =>
              getDateCell(calendar, date),
            );
            const visibleCells = cells.filter(
              (cell) => getComputedStyle(cell).visibility !== "hidden",
            );
            expect(visibleCells).toHaveLength(1);
            for (const cell of visibleCells) {
              expect(cell).toHaveAttribute("aria-selected", "true");
              expect(cell.querySelector("button")).toBeEnabled();
              expect(cell.querySelector("button")).toBeVisible();
            }
          }

          const startCalendar = calendars.find(
            (calendar) =>
              !getDateCell(calendar, dates[0]).hasAttribute("data-outside"),
          );
          const endCalendar = calendars.find(
            (calendar) =>
              !getDateCell(calendar, dates[dates.length - 1]).hasAttribute(
                "data-outside",
              ),
          );
          if (!startCalendar || !endCalendar) {
            throw new Error("DatePicker test endpoint calendars not found");
          }
          const start = getDateCell(startCalendar, dates[0]);
          const end = getDateCell(endCalendar, dates[dates.length - 1]);
          expect(getComputedStyle(start).backgroundColor).not.toBe(
            "rgba(0, 0, 0, 0)",
          );
          expect(getComputedStyle(end).backgroundColor).toBe(
            getComputedStyle(start).backgroundColor,
          );
          expect(
            getComputedStyle(
              getDateButton(endCalendar, dates[dates.length - 1]),
            ).color,
          ).toBe(
            getComputedStyle(getDateButton(startCalendar, dates[0])).color,
          );
        },
      );
    });
  }
}

function InteractiveRangePicker({ min }: { min?: number }) {
  const [range, setRange] = useState<DateRange>();
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

describe("DatePicker multi-month interaction", () => {
  test.each([
    { direction: "forward", start: "2026-09-29", end: "2026-10-03", min: 0 },
    { direction: "backward", start: "2026-10-03", end: "2026-09-29", min: 0 },
    { direction: "forward", start: "2026-09-29", end: "2026-10-03", min: 2 },
    { direction: "backward", start: "2026-10-03", end: "2026-09-29", min: 2 },
  ])(
    "selects a range $direction across panels with min=$min",
    async ({ start, end, min }) => {
      const { getByRole } = await render(<InteractiveRangePicker min={min} />);
      const september = getByRole("grid", { name: "September 2026" }).element();
      const october = getByRole("grid", { name: "October 2026" }).element();
      const startCalendar = start.startsWith("2026-09") ? september : october;
      const endCalendar = end.startsWith("2026-09") ? september : october;

      await userEvent.click(getDateButton(startCalendar, start));
      await userEvent.click(getDateButton(endCalendar, end));

      for (const date of ["2026-09-29", "2026-09-30"]) {
        expect(getDateCell(september, date)).toHaveAttribute(
          "aria-selected",
          "true",
        );
        expect(getDateCell(october, date)).not.toBeVisible();
      }
      for (const date of ["2026-10-01", "2026-10-02", "2026-10-03"]) {
        expect(getDateCell(october, date)).toHaveAttribute(
          "aria-selected",
          "true",
        );
        expect(getDateCell(september, date)).not.toBeVisible();
      }
    },
  );

  test("supports uncontrolled keyboard selection across the month boundary", async () => {
    const { getByRole } = await render(
      <DatePicker
        mode="range"
        defaultMonth={new Date(2026, 8, 1)}
        numberOfMonths={2}
        animate={false}
      />,
    );
    const september = getByRole("grid", { name: "September 2026" }).element();
    const october = getByRole("grid", { name: "October 2026" }).element();
    const start = getDateButton(september, "2026-09-30");
    const end = getDateButton(october, "2026-10-01");

    start.focus();
    await userEvent.keyboard("{Enter}{ArrowRight}");

    expect(end).toHaveFocus();
    expect(end.matches(":focus-visible")).toBe(true);
    expect(getComputedStyle(end).boxShadow).not.toBe("none");

    await userEvent.keyboard("{Enter}");

    expect(getDateCell(september, "2026-09-30")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(getDateCell(october, "2026-10-01")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("keeps outside dates hidden after navigating to the next month", async () => {
    const { getByRole } = await render(<InteractiveRangePicker />);

    await getByRole("button", { name: "Go to the Next Month" }).click();

    const october = getByRole("grid", { name: "October 2026" }).element();
    const november = getByRole("grid", { name: "November 2026" }).element();
    expect(getDateCell(october, "2026-09-30")).not.toBeVisible();
    expect(getDateCell(november, "2026-12-01")).not.toBeVisible();
    expect(getDateButton(october, "2026-10-01")).toBeVisible();
    expect(getDateButton(november, "2026-11-01")).toBeVisible();
  });

  test("keeps disabled in-month dates unavailable", async () => {
    const { getByRole } = await render(
      <DatePicker
        mode="range"
        defaultMonth={new Date(2026, 8, 1)}
        numberOfMonths={2}
        disabled={new Date(2026, 9, 2)}
        animate={false}
      />,
    );
    const october = getByRole("grid", { name: "October 2026" }).element();

    expect(getDateButton(october, "2026-10-02")).toBeDisabled();
  });
});

describe("DatePicker outside-day configuration", () => {
  test.each(["single", "multiple", "range"] as const)(
    "hides outside dates in multi-month %s mode",
    async (mode) => {
      const { getByRole } = await render(
        <DatePicker
          mode={mode}
          required={false}
          defaultMonth={new Date(2026, 8, 1)}
          numberOfMonths={3}
          animate={false}
        />,
      );
      const september = getByRole("grid", { name: "September 2026" }).element();
      const october = getByRole("grid", { name: "October 2026" }).element();
      const november = getByRole("grid", { name: "November 2026" }).element();

      expect(getDateCell(september, "2026-10-01")).not.toBeVisible();
      expect(getDateCell(october, "2026-09-30")).not.toBeVisible();
      expect(getDateCell(november, "2026-12-01")).not.toBeVisible();
    },
  );

  test.each([undefined, 1])(
    "preserves outside dates in a single-month view with numberOfMonths=%s",
    async (numberOfMonths) => {
      const { getByRole } = await render(
        <DatePicker
          mode="single"
          defaultMonth={new Date(2026, 8, 1)}
          numberOfMonths={numberOfMonths}
          animate={false}
        />,
      );
      const september = getByRole("grid", { name: "September 2026" }).element();

      expect(getDateButton(september, "2026-10-01")).toBeVisible();
    },
  );

  test("allows opting into outside dates in a multi-month view", async () => {
    const { getByRole } = await render(
      <DatePicker
        mode="range"
        defaultMonth={new Date(2026, 8, 1)}
        numberOfMonths={2}
        showOutsideDays
        animate={false}
      />,
    );
    const september = getByRole("grid", { name: "September 2026" }).element();
    const october = getByRole("grid", { name: "October 2026" }).element();

    expect(getDateButton(september, "2026-10-01")).toBeVisible();
    expect(getDateButton(october, "2026-10-01")).toBeVisible();
  });

  test("allows hiding outside dates in a single-month view", async () => {
    const { getByRole } = await render(
      <DatePicker
        mode="single"
        defaultMonth={new Date(2026, 8, 1)}
        showOutsideDays={false}
        animate={false}
      />,
    );
    const september = getByRole("grid", { name: "September 2026" }).element();

    expect(getDateCell(september, "2026-10-01")).not.toBeVisible();
    expect(
      getDateCell(september, "2026-10-01").querySelector("button"),
    ).toBeNull();
  });
});
