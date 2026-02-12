import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import {
  DayPicker,
  type DayPickerProps,
  type CustomComponents,
} from "react-day-picker";
import { cn } from "../../utils/cn";

/**
 * Custom Chevron component using Phosphor icons
 */
const Chevron: CustomComponents["Chevron"] = ({ orientation, ...props }) => {
  const Icon = orientation === "left" ? CaretLeftIcon : CaretRightIcon;
  return <Icon size={16} {...props} />;
};

/**
 * DatePicker props - extends all react-day-picker props.
 */
export type DatePickerProps = DayPickerProps & {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
};

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
 * <DatePicker mode="single" selected={date} onSelect={setDate} />
 *
 * // Multiple date selection
 * const [dates, setDates] = useState<Date[]>([]);
 * <DatePicker mode="multiple" selected={dates} onSelect={setDates} max={5} />
 *
 * // Date range selection
 * const [range, setRange] = useState<DateRange>();
 * <DatePicker mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
 * ```
 */
export function DatePicker({
  className,
  classNames,
  ...props
}: DatePickerProps) {
  return (
    <DayPicker
      showOutsideDays
      animate
      {...props}
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
