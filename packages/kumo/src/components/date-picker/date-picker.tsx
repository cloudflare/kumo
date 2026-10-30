import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
} from "@phosphor-icons/react";
import { useMemo, type ReactElement } from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type CustomComponents,
  type DayProps,
  type PropsBase,
  type PropsSingle,
  type PropsSingleRequired,
  type PropsMulti,
  type PropsMultiRequired,
  type PropsRange,
  type PropsRangeRequired,
} from "react-day-picker";
import { cn } from "../../utils/cn";
import { buttonVariants } from "../button/button";

const CHEVRON_ICONS = {
  left: CaretLeftIcon,
  right: CaretRightIcon,
  up: CaretUpIcon,
  down: CaretDownIcon,
};

/**
 * Custom Chevron component using Phosphor icons
 */
const Chevron: CustomComponents["Chevron"] = ({
  className,
  orientation = "left",
}) => {
  const Icon = CHEVRON_ICONS[orientation];
  return <Icon size={16} className={className} aria-hidden />;
};

/**
 * Renders the day cell, or a custom `Day`, with markers for where it sits in
 * a selected range. Day buttons take their styles from their cell, so a
 * custom `DayButton` keeps them, and so does a custom `Day` that passes its
 * props on.
 */
function withRangeMarkers(CustomDay?: CustomComponents["Day"]) {
  return function Day({ day, modifiers, ...props }: DayProps) {
    const markers = {
      "data-range-start": modifiers.range_start || undefined,
      "data-range-middle": modifiers.range_middle || undefined,
      "data-range-end": modifiers.range_end || undefined,
    };
    return CustomDay ? (
      <CustomDay day={day} modifiers={modifiers} {...props} {...markers} />
    ) : (
      <td {...props} {...markers} />
    );
  };
}

/** Square ghost buttons the size of a day square. */
const navButtonClassName = cn(
  buttonVariants({ variant: "ghost", shape: "square" }),
  "size-(--cell-size) rounded-md aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
);

// Each state is read from the day's cell: react-day-picker's data-selected,
// data-today, data-outside and data-disabled, plus the range markers above.
// The button can sit anywhere inside the cell, so a custom DayButton that
// wraps it keeps the styles.
const dayButtonClassName = cn(
  "flex size-(--cell-size) items-center justify-center rounded-md text-base text-kumo-default tabular-nums transition-colors outline-none",
  "cursor-pointer hover:bg-kumo-tint",
  "focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-kumo-brand",
  "[td[data-day][data-disabled]_&]:cursor-not-allowed [td[data-day][data-disabled]_&]:text-kumo-inactive [td[data-day][data-disabled]_&]:hover:bg-transparent",
  // Days from other months are as quiet as disabled ones.
  "[td[data-day][data-outside]:not([data-selected])_&]:text-kumo-inactive",
  // Today keeps its weight when disabled, so it can still be found.
  "[td[data-day][data-today]:not([data-selected],[data-outside])_&]:font-semibold [td[data-day][data-today]:not([data-selected],[data-outside],[data-disabled])_&]:text-kumo-link",
  // Selected days are filled, except the days inside a range, which show the
  // band painted on their cells.
  "[td[data-day][data-selected]:not([data-range-middle])_&]:bg-kumo-contrast [td[data-day][data-selected]:not([data-range-middle])_&]:text-kumo-inverse [td[data-day][data-selected]:not([data-range-middle])_&]:hover:bg-kumo-contrast",
  "[td[data-day][data-range-middle]:not([data-disabled])_&]:hover:bg-kumo-interact",
  // Range ends are square on the side that meets the band. A one-day range,
  // or an end at the edge of a week, has no band beside it, so it stays round.
  "[td[data-day][data-range-start]:not([data-range-end],:last-of-type)_&]:rounded-e-none",
  "[td[data-day][data-range-end]:not([data-range-start],:first-of-type)_&]:rounded-s-none",
);

/** Base props shared across all DatePicker modes */
type BaseProps = Omit<PropsBase, "classNames"> & {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Custom class names for internal elements */
  classNames?: PropsBase["classNames"];
};

/** Single date selection (optional) */
type SingleProps = BaseProps &
  Omit<PropsSingle, "onSelect" | "classNames"> & {
    onChange?: PropsSingle["onSelect"];
  };

/** Single date selection (required) */
type SingleRequiredProps = BaseProps &
  Omit<PropsSingleRequired, "onSelect" | "classNames"> & {
    onChange?: PropsSingleRequired["onSelect"];
  };

/** Multiple date selection (optional) */
type MultipleProps = BaseProps &
  Omit<PropsMulti, "onSelect" | "classNames"> & {
    onChange?: PropsMulti["onSelect"];
  };

/** Multiple date selection (required) */
type MultipleRequiredProps = BaseProps &
  Omit<PropsMultiRequired, "onSelect" | "classNames"> & {
    onChange?: PropsMultiRequired["onSelect"];
  };

/** Date range selection (optional) */
type RangeProps = BaseProps &
  Omit<PropsRange, "onSelect" | "classNames"> & {
    onChange?: PropsRange["onSelect"];
  };

/** Date range selection (required) */
type RangeRequiredProps = BaseProps &
  Omit<PropsRangeRequired, "onSelect" | "classNames"> & {
    onChange?: PropsRangeRequired["onSelect"];
  };

/**
 * DatePicker props - discriminated union based on `mode`.
 * Uses `onChange` instead of `onSelect` for Kumo consistency.
 * Full type inference is preserved via the discriminated union.
 */
export type DatePickerProps =
  | SingleProps
  | SingleRequiredProps
  | MultipleProps
  | MultipleRequiredProps
  | RangeProps
  | RangeRequiredProps;

/**
 * DatePicker — a date selection calendar.
 *
 * Built on [react-day-picker](https://daypicker.dev) with Kumo styling.
 * Supports three selection modes: single, multiple, and range.
 * Outside-month dates are hidden by default in multi-month views to avoid duplicates.
 * Set `showOutsideDays` to override this behavior.
 *
 * DatePicker has no internal padding, so it fits a Popover or a page layout
 * without overrides. The container sets the spacing, e.g.
 * `<Popover.Content className="p-3">`, or `className="p-3"` on its own.
 *
 * @example
 * ```tsx
 * // Single date selection
 * const [date, setDate] = useState<Date>();
 * <DatePicker mode="single" selected={date} onChange={setDate} />
 *
 * // Multiple date selection
 * const [dates, setDates] = useState<Date[]>([]);
 * <DatePicker mode="multiple" selected={dates} onChange={setDates} max={5} />
 *
 * // Date range selection
 * const [range, setRange] = useState<DateRange>();
 * <DatePicker mode="range" selected={range} onChange={setRange} numberOfMonths={2} />
 * ```
 */
export function DatePicker({
  className,
  classNames,
  onChange,
  ...props
}: DatePickerProps): ReactElement {
  const defaults = getDefaultClassNames();
  const hasDropdowns = props.captionLayout?.startsWith("dropdown") ?? false;
  const hasNavAround = props.navLayout === "around";
  const customDay = props.components?.Day;
  const Day = useMemo(() => withRangeMarkers(customDay), [customDay]);

  return (
    <DayPicker
      showOutsideDays={(props.numberOfMonths ?? 1) === 1}
      animate
      {...props}
      onSelect={onChange as never}
      classNames={{
        // Days are --cell-size squares centered in --cell-width columns, so
        // they get a little air on each side while the nav buttons, weekday
        // labels and days still share one grid.
        // isolate keeps the nav's and focused days' z-index inside the
        // calendar.
        months: cn(
          defaults.months,
          "relative isolate flex flex-col gap-4 sm:flex-row",
        ),
        // navLayout="after" and "around" render the buttons inside a month,
        // so the month positions them. Otherwise it stays unpositioned, so it
        // doesn't cover the nav.
        month: cn(
          defaults.month,
          "flex flex-col gap-3",
          props.navLayout && "relative",
        ),
        // Both buttons sit together at the end of the header, so switching
        // months is a short mouse trip. The inset matches the columns' side
        // air, so the last button lines up with the last day square and the
        // caption with the first. The buttons sit above the caption, so a
        // long month name in a dropdown can't cover them. The nav's chevrons
        // don't follow the text direction, so they flip in RTL;
        // navLayout="around" flips its own.
        nav: cn(
          defaults.nav,
          "absolute end-0.5 top-0 z-1 flex items-center gap-1 rtl:[&_svg]:rotate-180",
        ),
        button_previous: cn(
          defaults.button_previous,
          navButtonClassName,
          hasNavAround && "absolute start-0.5 top-0 z-1",
        ),
        button_next: cn(
          defaults.button_next,
          navButtonClassName,
          hasNavAround && "absolute end-0.5 top-0 z-1",
        ),
        month_caption: cn(
          defaults.month_caption,
          "flex h-(--cell-size) items-center px-0.5",
          hasNavAround && "justify-center px-(--cell-size)",
        ),
        caption_label: cn(
          defaults.caption_label,
          "text-base font-medium text-kumo-default",
          hasDropdowns &&
            "flex h-7 items-center gap-1 rounded-md ps-2 pe-1 [&>svg]:text-kumo-subtle",
        ),
        dropdowns: cn(defaults.dropdowns, "flex items-center gap-1.5"),
        dropdown_root: cn(
          defaults.dropdown_root,
          "relative rounded-md ring ring-kumo-line has-focus-visible:ring-2 has-focus-visible:ring-kumo-brand",
        ),
        dropdown: cn(
          defaults.dropdown,
          "absolute inset-0 cursor-pointer opacity-0",
        ),
        month_grid: cn(defaults.month_grid, "border-collapse"),
        weekdays: cn(defaults.weekdays, "flex"),
        weekday: cn(
          defaults.weekday,
          "flex h-5 w-(--cell-width) items-center justify-center text-xs font-normal text-kumo-subtle",
        ),
        week: cn(defaults.week, "mt-2 flex"),
        week_number_header: cn(defaults.week_number_header, "w-(--cell-width)"),
        week_number: cn(
          defaults.week_number,
          "flex h-(--cell-size) w-(--cell-width) items-center justify-center text-xs text-kumo-subtle",
        ),
        // The range band is painted on the cells: full width in the middle,
        // the inner half at each end so it meets the end squares, and
        // rounded where a week wraps, so it reads as one continuous strip.
        // Days are td elements, so first-of-type skips a week number cell.
        day: cn(
          defaults.day,
          "relative flex h-(--cell-size) w-(--cell-width) justify-center p-0 text-center",
          "data-selected:first-of-type:rounded-s-md data-selected:last-of-type:rounded-e-md",
          // A range that starts and ends on the same day has no band.
          "data-range-start:data-range-end:bg-none",
        ),
        day_button: cn(defaults.day_button, dayButtonClassName),
        range_start: cn(
          defaults.range_start,
          "bg-linear-to-r from-transparent from-50% to-kumo-fill to-50% last-of-type:bg-none rtl:bg-linear-to-l",
        ),
        range_middle: cn(defaults.range_middle, "bg-kumo-fill"),
        range_end: cn(
          defaults.range_end,
          "bg-linear-to-l from-transparent from-50% to-kumo-fill to-50% first-of-type:bg-none rtl:bg-linear-to-r",
        ),
        hidden: cn(defaults.hidden, "invisible"),
        footer: cn(defaults.footer, "w-0 min-w-full pt-3"),
        ...classNames,
        root: cn(
          defaults.root,
          "w-fit rounded-xl bg-kumo-base text-sm select-none [--cell-size:--spacing(8)] [--cell-width:--spacing(9)]",
          classNames?.root,
          className,
        ),
      }}
      components={{
        Chevron,
        ...props.components,
        Day,
      }}
    />
  );
}

DatePicker.displayName = "DatePicker";
