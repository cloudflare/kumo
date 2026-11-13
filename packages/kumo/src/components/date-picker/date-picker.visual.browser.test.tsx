import { useState } from "react";
import { describe, expect, test } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { DatePicker } from "./date-picker";
import type { DateRange, DayButtonProps, DayProps } from "react-day-picker";
import { el } from "react-day-picker/locale";

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
          // The endpoint fill is on the day buttons; the cells only carry
          // the range band.
          const start = getDateButton(startCalendar, dates[0]);
          const end = getDateButton(endCalendar, dates[dates.length - 1]);
          expect(getComputedStyle(start).backgroundColor).not.toBe(
            "rgba(0, 0, 0, 0)",
          );
          expect(getComputedStyle(end).backgroundColor).toBe(
            getComputedStyle(start).backgroundColor,
          );
          expect(getComputedStyle(end).color).toBe(
            getComputedStyle(start).color,
          );
        },
      );
    });
  }
}

function getRoundedSides(button: HTMLElement) {
  const { borderTopLeftRadius, borderTopRightRadius } =
    getComputedStyle(button);
  return {
    left: borderTopLeftRadius !== "0px",
    right: borderTopRightRadius !== "0px",
  };
}

function hasBand(cell: HTMLElement) {
  return getComputedStyle(cell).backgroundImage !== "none";
}

describe("DatePicker range corners", () => {
  // October 2026 starts on a Thursday, so the 10th ends a week and the 11th
  // starts the next one.
  test.each([
    {
      name: "squares the ends where they meet the band",
      from: 13,
      to: 15,
      dir: "ltr",
      start: { left: true, right: false },
      end: { left: false, right: true },
      bands: [true, true],
    },
    {
      name: "mirrors the corners in RTL",
      from: 13,
      to: 15,
      dir: "rtl",
      start: { left: false, right: true },
      end: { left: true, right: false },
      bands: [true, true],
    },
    {
      name: "keeps a one-day range round",
      from: 14,
      to: 14,
      dir: "ltr",
      start: { left: true, right: true },
      end: { left: true, right: true },
      bands: [false, false],
    },
    {
      name: "keeps a start at the end of a week round",
      from: 10,
      to: 13,
      dir: "ltr",
      start: { left: true, right: true },
      end: { left: false, right: true },
      bands: [false, true],
    },
    {
      name: "keeps an end at the start of a week round",
      from: 7,
      to: 11,
      dir: "ltr",
      start: { left: true, right: false },
      end: { left: true, right: true },
      bands: [true, false],
    },
  ])("$name", async ({ from, to, dir, start, end, bands }) => {
    const { getByRole } = await render(
      <DatePicker
        mode="range"
        defaultMonth={new Date(2026, 9, 1)}
        selected={{ from: new Date(2026, 9, from), to: new Date(2026, 9, to) }}
        dir={dir}
        animate={false}
      />,
    );
    const october = getByRole("grid", { name: "October 2026" }).element();
    const toIso = (day: number) => `2026-10-${String(day).padStart(2, "0")}`;

    expect(getRoundedSides(getDateButton(october, toIso(from)))).toEqual(start);
    expect(getRoundedSides(getDateButton(october, toIso(to)))).toEqual(end);
    expect([
      hasBand(getDateCell(october, toIso(from))),
      hasBand(getDateCell(october, toIso(to))),
    ]).toEqual(bands);
  });
});

function CustomDayButton({
  day: _day,
  modifiers: _modifiers,
  ...props
}: DayButtonProps) {
  return <button {...props} />;
}

function WrappedDayButton({
  day: _day,
  modifiers: _modifiers,
  ...props
}: DayButtonProps) {
  return (
    <span>
      <button {...props} />
    </span>
  );
}

function CustomDay({ day: _day, modifiers: _modifiers, ...props }: DayProps) {
  return <td {...props} />;
}

/** Converts any CSS color to sRGB channels by painting it on a canvas. */
function toRgb(color: string) {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) {
    throw new Error("DatePicker test canvas not available");
  }
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
}

function getLuminance(color: string) {
  const [r, g, b] = toRgb(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrast(foreground: string, background: string) {
  const [lighter, darker] = [
    getLuminance(foreground),
    getLuminance(background),
  ].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const OCTOBER_RANGE = { from: new Date(2026, 9, 9), to: new Date(2026, 9, 20) };

describe("DatePicker day styles", () => {
  test.each([
    { name: "a custom DayButton", components: { DayButton: CustomDayButton } },
    {
      name: "a wrapped DayButton",
      components: { DayButton: WrappedDayButton },
    },
    { name: "a custom Day", components: { Day: CustomDay } },
  ])("keeps selection styles with $name", async ({ components }) => {
    const { getByRole } = await render(
      <DatePicker
        mode="range"
        defaultMonth={new Date(2026, 9, 1)}
        selected={OCTOBER_RANGE}
        components={components}
        animate={false}
      />,
    );
    const october = getByRole("grid", { name: "October 2026" }).element();
    const start = getComputedStyle(getDateButton(october, "2026-10-09"));
    const middle = getComputedStyle(getDateButton(october, "2026-10-14"));

    expect(start.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(start.borderTopRightRadius).toBe("0px");
    expect(middle.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(
      getComputedStyle(getDateCell(october, "2026-10-14")).backgroundColor,
    ).not.toBe("rgba(0, 0, 0, 0)");
  });

  test.each([
    { mode: "light", darker: true },
    { mode: "dark", darker: false },
  ])(
    "shows a hover on days inside a range ($mode)",
    async ({ mode, darker }) => {
      const { getByRole } = await render(
        <div data-mode={mode}>
          <DatePicker
            mode="range"
            defaultMonth={new Date(2026, 9, 1)}
            selected={OCTOBER_RANGE}
            animate={false}
          />
        </div>,
      );
      const october = getByRole("grid", { name: "October 2026" }).element();
      const middle = getDateButton(october, "2026-10-14");
      middle.style.transition = "none";
      await userEvent.hover(middle);

      const band = getComputedStyle(
        getDateCell(october, "2026-10-14"),
      ).backgroundColor;
      const hover = getComputedStyle(middle).backgroundColor;
      // Visible against the band, and darker than it in light mode so it
      // doesn't read as a hole.
      expect(getContrast(hover, band)).toBeGreaterThan(1.1);
      expect(getLuminance(hover) < getLuminance(band)).toBe(darker);
    },
  );

  test.each(["light", "dark"])(
    "keeps today's date readable (%s)",
    async (mode) => {
      const { getByRole } = await render(
        <div data-mode={mode}>
          <DatePicker
            mode="single"
            defaultMonth={new Date(2026, 9, 1)}
            today={new Date(2026, 9, 14)}
            animate={false}
          />
        </div>,
      );
      const october = getByRole("grid", { name: "October 2026" }).element();
      const root = october.closest(".rdp-root");
      if (!root) {
        throw new Error("DatePicker test root not found");
      }
      const today = getComputedStyle(getDateButton(october, "2026-10-14"));

      expect(today.fontWeight).toBe("600");
      expect(
        getContrast(today.color, getComputedStyle(root).backgroundColor),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  test("keeps a disabled today findable", async () => {
    const today = new Date(2026, 9, 14);
    const { getByRole } = await render(
      <DatePicker
        mode="single"
        defaultMonth={new Date(2026, 9, 1)}
        today={today}
        disabled={[today, new Date(2026, 9, 15)]}
        animate={false}
      />,
    );
    const october = getByRole("grid", { name: "October 2026" }).element();
    const disabledToday = getComputedStyle(
      getDateButton(october, "2026-10-14"),
    );
    const disabledDay = getComputedStyle(getDateButton(october, "2026-10-15"));

    expect(disabledToday.color).toBe(disabledDay.color);
    expect(disabledToday.fontWeight).toBe("600");
  });

  test("dims days from other months like disabled days", async () => {
    const { getByRole } = await render(
      <DatePicker
        mode="single"
        defaultMonth={new Date(2026, 9, 1)}
        disabled={new Date(2026, 9, 10)}
        animate={false}
      />,
    );
    const october = getByRole("grid", { name: "October 2026" }).element();

    expect(getComputedStyle(getDateButton(october, "2026-09-30")).color).toBe(
      getComputedStyle(getDateButton(october, "2026-10-10")).color,
    );
  });

  test("rounds the band on the outer side where weeks wrap in RTL", async () => {
    const { getByRole } = await render(
      <DatePicker
        mode="range"
        defaultMonth={new Date(2026, 9, 1)}
        selected={OCTOBER_RANGE}
        dir="rtl"
        animate={false}
      />,
    );
    const october = getByRole("grid", { name: "October 2026" }).element();

    // The 11th starts a week and the 17th ends one. In RTL, weeks start on
    // the right.
    expect(getRoundedSides(getDateCell(october, "2026-10-11"))).toEqual({
      left: false,
      right: true,
    });
    expect(getRoundedSides(getDateCell(october, "2026-10-17"))).toEqual({
      left: true,
      right: false,
    });
  });

  test('places the navLayout="around" buttons beside the caption', async () => {
    const { getByRole } = await render(
      <DatePicker
        mode="single"
        defaultMonth={new Date(2026, 9, 1)}
        navLayout="around"
        animate={false}
      />,
    );
    const october = getByRole("grid", { name: "October 2026" }).element();
    const month = october.closest(".rdp-month");
    const label = month?.querySelector(".rdp-caption_label");
    if (!month || !label) {
      throw new Error("DatePicker test month caption not found");
    }
    const [monthBox, labelBox, previousBox, nextBox] = [
      month,
      label,
      getByRole("button", { name: "Go to the Previous Month" }).element(),
      getByRole("button", { name: "Go to the Next Month" }).element(),
    ].map((element) => element.getBoundingClientRect());
    const middleY = (box: DOMRect) => (box.top + box.bottom) / 2;
    const middleX = (box: DOMRect) => (box.left + box.right) / 2;

    expect(Math.abs(middleY(previousBox) - middleY(labelBox))).toBeLessThan(2);
    expect(Math.abs(middleY(nextBox) - middleY(labelBox))).toBeLessThan(2);
    expect(previousBox.right).toBeLessThanOrEqual(labelBox.left);
    expect(nextBox.left).toBeGreaterThanOrEqual(labelBox.right);
    expect(Math.abs(middleX(labelBox) - middleX(monthBox))).toBeLessThan(2);
  });

  test('flips the nav chevrons in RTL, but not the navLayout="around" ones', async () => {
    // react-day-picker already swaps the around buttons' chevrons in RTL, but
    // not the nav's.
    const { getByRole } = await render(
      <>
        <DatePicker
          mode="single"
          defaultMonth={new Date(2026, 9, 1)}
          dir="rtl"
          animate={false}
        />
        <DatePicker
          mode="single"
          defaultMonth={new Date(2026, 10, 1)}
          dir="rtl"
          navLayout="around"
          animate={false}
        />
      </>,
    );
    const getPreviousChevron = (month: string) => {
      const chevron = getByRole("grid", { name: month })
        .element()
        .closest(".rdp-root")
        ?.querySelector(".rdp-button_previous svg");
      if (!chevron) {
        throw new Error("DatePicker test chevron not found");
      }
      return getComputedStyle(chevron);
    };

    expect(getPreviousChevron("October 2026").rotate).toBe("180deg");
    expect(getPreviousChevron("November 2026").rotate).toBe("none");
  });

  test("keeps the nav buttons clickable beside a long dropdown caption", async () => {
    // "Φεβρουάριος 2026" in dropdowns is wider than the space beside the nav.
    await render(
      <DatePicker
        mode="single"
        captionLayout="dropdown"
        locale={el}
        defaultMonth={new Date(2026, 1, 1)}
        startMonth={new Date(2020, 0)}
        endMonth={new Date(2030, 11)}
        animate={false}
      />,
    );
    const previous = document.querySelector(".rdp-button_previous");
    if (!previous) {
      throw new Error("DatePicker test previous button not found");
    }
    const box = previous.getBoundingClientRect();
    const target = document.elementFromPoint(
      box.left + 4,
      box.top + box.height / 2,
    );

    expect(target !== null && previous.contains(target)).toBe(true);
  });

  test('places the navLayout="after" buttons at the end of the last caption', async () => {
    const { getByRole } = await render(
      <DatePicker
        mode="range"
        defaultMonth={new Date(2026, 9, 1)}
        numberOfMonths={2}
        navLayout="after"
        animate={false}
      />,
    );
    const november = getByRole("grid", { name: "November 2026" }).element();
    const label = november
      .closest(".rdp-month")
      ?.querySelector(".rdp-caption_label");
    if (!label) {
      throw new Error("DatePicker test month caption not found");
    }
    const labelBox = label.getBoundingClientRect();
    const previous = getByRole("button", { name: "Go to the Previous Month" });
    const previousBox = previous.element().getBoundingClientRect();

    expect(
      Math.abs(
        (previousBox.top + previousBox.bottom) / 2 -
          (labelBox.top + labelBox.bottom) / 2,
      ),
    ).toBeLessThan(2);
    expect(previousBox.left).toBeGreaterThanOrEqual(labelBox.right);
    await previous.click();
    expect(
      getByRole("grid", { name: "September 2026" }).element(),
    ).toBeVisible();
  });
});

describe("DatePicker surface", () => {
  test("leaves spacing to its container", async () => {
    const { getByRole } = await render(
      <>
        <DatePicker
          mode="single"
          defaultMonth={new Date(2026, 9, 1)}
          animate={false}
        />
        <DatePicker
          mode="single"
          defaultMonth={new Date(2026, 10, 1)}
          className="p-3"
          animate={false}
        />
      </>,
    );
    const getRootStyle = (month: string) => {
      const root = getByRole("grid", { name: month })
        .element()
        .closest(".rdp-root");
      if (!root) {
        throw new Error("DatePicker test root not found");
      }
      return getComputedStyle(root);
    };

    expect(getRootStyle("October 2026").padding).toBe("0px");
    expect(getRootStyle("November 2026").padding).toBe("12px");
  });

  test("keeps its text size whatever the text size around it", async () => {
    const { getByRole } = await render(
      <>
        <div style={{ fontSize: 20 }}>
          <DatePicker
            mode="single"
            defaultMonth={new Date(2026, 9, 1)}
            footer="Footer"
            animate={false}
          />
        </div>
        <div style={{ fontSize: 10 }}>
          <DatePicker
            mode="single"
            defaultMonth={new Date(2026, 10, 1)}
            footer="Footer"
            animate={false}
          />
        </div>
      </>,
    );
    const getFooterSize = (month: string) => {
      const footer = getByRole("grid", { name: month })
        .element()
        .closest(".rdp-root")
        ?.querySelector(".rdp-footer");
      if (!footer) {
        throw new Error("DatePicker test footer not found");
      }
      return getComputedStyle(footer).fontSize;
    };

    expect(getFooterSize("October 2026")).toBe(getFooterSize("November 2026"));
  });
});

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
