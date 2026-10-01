import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { createContext, useContext, useState, type ReactElement } from "react";
import {
  Day,
  DayPicker,
  useDayPicker,
  type DateRange,
  type OnSelectHandler,
  type CustomComponents,
  type PropsBase,
  type PropsSingle,
  type PropsSingleRequired,
  type PropsMulti,
  type PropsMultiRequired,
  type PropsRange,
  type PropsRangeRequired,
} from "react-day-picker";
import { cn } from "../../utils/cn";

/**
 * Custom Chevron component using Phosphor icons
 */
const Chevron: CustomComponents["Chevron"] = ({ orientation, ...props }) => {
  const Icon = orientation === "left" ? CaretLeftIcon : CaretRightIcon;
  return <Icon size={16} {...props} />;
};

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
export function DatePicker(props: DatePickerProps): ReactElement {
  return props.mode === "range" ? (
    <RangeDatePicker {...props} />
  ) : (
    <DatePickerCalendar {...props} />
  );
}

const RangePanelContext = createContext<{
  readonly primaryMonth: string | undefined;
  readonly DayComponent: CustomComponents["Day"];
}>({ primaryMonth: undefined, DayComponent: Day });

/** Keep the underlying day component's semantics and handlers intact. */
const RangePanelDay: CustomComponents["Day"] = (props) => {
  const { primaryMonth, DayComponent } = useContext(RangePanelContext);
  const { months } = useDayPicker();
  const primaryMonthVisible = months.some(
    (month) => props.day.dateLib.format(month.date, "yyyy-MM") === primaryMonth,
  );
  const secondary = primaryMonthVisible
    ? props.day.displayMonthId !== primaryMonth
    : props.day.outside;

  return (
    <DayComponent
      {...props}
      data-kumo-display-month={props.day.displayMonthId}
      data-kumo-range-emphasis={
        props.modifiers.selected
          ? secondary
            ? "secondary"
            : "primary"
          : undefined
      }
    />
  );
};

type RangeSelectionOrigin = {
  readonly month: string;
  readonly range: DateRange;
};

/** Range selection emphasis follows the first panel used, not the date's month. */
function RangeDatePicker(props: RangeProps | RangeRequiredProps) {
  const [internalRange, setInternalRange] = useState(props.selected);
  const [origin, setOrigin] = useState<RangeSelectionOrigin>();
  const selected = props.onChange ? props.selected : internalRange;
  // A preset or external reset has no clicked panel: fall back to in-month emphasis.
  const originMatchesSelection =
    origin !== undefined &&
    origin.range.from?.getTime() === selected?.from?.getTime() &&
    origin.range.to?.getTime() === selected?.to?.getTime();
  if (origin && !originMatchesSelection) {
    setOrigin(undefined);
  }

  const handleRangeSelect: OnSelectHandler<DateRange | undefined> = (
    range,
    triggerDate,
    modifiers,
    event,
  ) => {
    const month =
      event.currentTarget instanceof HTMLElement
        ? event.currentTarget
            .closest("[data-kumo-display-month]")
            ?.getAttribute("data-kumo-display-month")
        : undefined;
    if (range && month) {
      // DayPicker starts/restarts a range with one date (or an open end with min > 0).
      const startingRange =
        range.from?.getTime() === triggerDate.getTime() &&
        (range.to === undefined ||
          range.to.getTime() === triggerDate.getTime());
      setOrigin({
        month: !startingRange && originMatchesSelection ? origin.month : month,
        range,
      });
    } else {
      setOrigin(undefined);
    }

    if (!props.onChange) {
      setInternalRange(range);
    } else if (props.required) {
      if (range) props.onChange(range, triggerDate, modifiers, event);
    } else {
      props.onChange(range, triggerDate, modifiers, event);
    }
  };

  return (
    <RangePanelContext.Provider
      value={{
        primaryMonth: originMatchesSelection ? origin.month : undefined,
        DayComponent: props.components?.Day ?? Day,
      }}
    >
      <DatePickerCalendar
        {...props}
        selected={selected}
        onChange={handleRangeSelect}
        components={{ ...props.components, Day: RangePanelDay }}
      />
    </RangePanelContext.Provider>
  );
}

function DatePickerCalendar({
  className,
  classNames,
  onChange,
  ...props
}: DatePickerProps) {
  return (
    <DayPicker
      showOutsideDays
      animate
      {...props}
      onSelect={onChange as never}
      classNames={{
        ...classNames,
        root: cn(
          "rdp-root rounded-xl bg-kumo-base select-none",
          classNames?.root,
          className,
        ),
      }}
      components={{
        Chevron,
        ...props.components,
      }}
    />
  );
}

DatePicker.displayName = "DatePicker";
