import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import {
  DayPicker,
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
export function DatePicker({
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
          "rdp-root select-none rounded-xl bg-kumo-base",
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
