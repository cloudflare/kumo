import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { FocusEvent, KeyboardEvent, MouseEvent, ReactNode } from "react";
import {
  DayPicker,
  type ClassNames,
  type CustomComponents,
  type DateRange,
  type DayEventHandler,
  type Formatters,
  type Labels,
  type Matcher,
  type Modifiers,
  type MonthChangeEventHandler,
  type Numerals,
} from "react-day-picker";
import type { Locale } from "react-day-picker";
import { cn } from "../../utils/cn";

/** Icon size for navigation chevrons */
const ICON_SIZE = 16;

/**
 * Generate Kumo-styled class names for DayPicker.
 * We add Kumo classes alongside the default rdp- classes (which come from getDefaultClassNames).
 * The rdp styles in kumo.css handle all the visual styling.
 */
function getKumoClassNames(): Partial<ClassNames> {
  // Only override root to add Kumo wrapper styles - everything else uses defaults
  return {
    root: cn("rdp-root", "select-none rounded-xl bg-kumo-base"),
  };
}

/**
 * Custom Chevron component using Phosphor icons
 */
function createChevronComponent(iconSize: number): CustomComponents["Chevron"] {
  return function Chevron({ orientation, ...props }) {
    const Icon = orientation === "left" ? CaretLeftIcon : CaretRightIcon;
    return <Icon size={iconSize} {...props} />;
  };
}

/**
 * Event handler type for date selection.
 */
export type DatePickerSelectHandler<T> = (
  selected: T,
  triggerDate: Date,
  modifiers: Modifiers,
  e: MouseEvent | KeyboardEvent,
) => void;

/**
 * Base props shared by all DatePicker modes.
 */
interface DatePickerBaseProps {
  // === Month/Navigation ===
  /**
   * The month to display. Use with `onMonthChange` for controlled mode.
   */
  month?: Date;
  /**
   * The initial month to display. Use for uncontrolled mode.
   * @default Current month
   */
  defaultMonth?: Date;
  /**
   * Callback when the displayed month changes.
   */
  onMonthChange?: MonthChangeEventHandler;
  /**
   * The number of months to display.
   * @default 1
   */
  numberOfMonths?: number;
  /**
   * The earliest month to navigate to.
   */
  startMonth?: Date;
  /**
   * The latest month to navigate to.
   */
  endMonth?: Date;
  /**
   * Hide the navigation buttons. Use `disableNavigation` to disable navigation entirely.
   * @default false
   */
  hideNavigation?: boolean;
  /**
   * Disable navigation between months. This won't hide the buttons; use `hideNavigation` for that.
   * @default false
   */
  disableNavigation?: boolean;
  /**
   * Paginate month navigation, displaying `numberOfMonths` at a time.
   * @default false
   */
  pagedNavigation?: boolean;
  /**
   * Render months in reversed order when `numberOfMonths` is set.
   * @default false
   */
  reverseMonths?: boolean;
  /**
   * Event handler when the next month button is clicked.
   */
  onNextClick?: MonthChangeEventHandler;
  /**
   * Event handler when the previous month button is clicked.
   */
  onPrevClick?: MonthChangeEventHandler;

  // === Caption/Dropdowns ===
  /**
   * Layout for the month/year caption.
   * - `"label"` — Display as text label (default)
   * - `"dropdown"` — Dropdowns for both month and year
   * - `"dropdown-months"` — Dropdown only for month
   * - `"dropdown-years"` — Dropdown only for year
   * @default "label"
   */
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
  /**
   * Reverse the order of years in the dropdown.
   * @default false
   */
  reverseYears?: boolean;

  // === Localization ===
  /**
   * The locale for formatting dates. Also determines week start day.
   * Import from `date-fns/locale` (e.g., `import { fr } from "date-fns/locale"`).
   */
  locale?: Locale;
  /**
   * Override the first day of the week (0 = Sunday, 1 = Monday, etc.).
   * If not set, uses the locale's default.
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * The IANA time zone to use for dates (e.g., "America/New_York").
   */
  timeZone?: string;
  /**
   * The day of January that is always in the first week of the year.
   */
  firstWeekContainsDate?: 1 | 4;
  /**
   * Use ISO week dates instead of locale setting. Ignores `weekStartsOn` and `firstWeekContainsDate`.
   * @default false
   */
  ISOWeek?: boolean;
  /**
   * Display weeks following the broadcast calendar format. Weeks always start on Monday.
   * @default false
   */
  broadcastCalendar?: boolean;
  /**
   * The numeral system to use when formatting dates.
   * @default "latn"
   */
  numerals?: Numerals;
  /**
   * The text direction of the calendar. Use `ltr` or `rtl`.
   */
  dir?: string;
  /**
   * Add the language tag to the container element.
   */
  lang?: string;

  // === Display Options ===
  /**
   * Show week numbers in the calendar.
   * @default false
   */
  showWeekNumber?: boolean;
  /**
   * Show days from the previous/next months.
   * @default true
   */
  showOutsideDays?: boolean;
  /**
   * Always show 6 weeks per month, even if some weeks are from adjacent months.
   * @default false
   */
  fixedWeeks?: boolean;
  /**
   * Hide the row displaying weekday headers.
   * @default false
   */
  hideWeekdays?: boolean;
  /**
   * Enable smooth animations when changing months.
   * @default true
   */
  animate?: boolean;

  // === Modifiers ===
  /**
   * Dates that cannot be selected (grayed out).
   * Can be a date, array of dates, date range, or function.
   */
  disabled?: Matcher | Matcher[];
  /**
   * Dates that are hidden from the calendar.
   */
  hidden?: Matcher | Matcher[];
  /**
   * Custom modifiers to apply to dates.
   * @example { booked: [new Date(2025, 0, 15), new Date(2025, 0, 20)] }
   */
  modifiers?: Record<string, Matcher | Matcher[]>;
  /**
   * Class names to apply for custom modifiers.
   * @example { booked: "bg-red-100 text-red-800" }
   */
  modifiersClassNames?: Record<string, string>;
  /**
   * Override today's date. Useful for testing or displaying a different "current" date.
   */
  today?: Date;

  // === Formatting & Labels ===
  /**
   * Custom formatters for dates. Override to customize date display.
   * @see https://daypicker.dev/docs/translation#custom-formatters
   */
  formatters?: Partial<Formatters>;
  /**
   * Custom labels for accessibility. Override to customize aria-label attributes.
   * @see https://daypicker.dev/docs/translation#aria-labels
   */
  labels?: Partial<Labels>;

  // === Day Event Handlers ===
  /**
   * Event handler when a day is clicked.
   */
  onDayClick?: DayEventHandler<MouseEvent>;
  /**
   * Event handler when a day receives focus.
   */
  onDayFocus?: DayEventHandler<FocusEvent>;
  /**
   * Event handler when a day loses focus.
   */
  onDayBlur?: DayEventHandler<FocusEvent>;
  /**
   * Event handler when a key is pressed on a day.
   */
  onDayKeyDown?: DayEventHandler<KeyboardEvent>;
  /**
   * Event handler when the mouse enters a day.
   */
  onDayMouseEnter?: DayEventHandler<MouseEvent>;
  /**
   * Event handler when the mouse leaves a day.
   */
  onDayMouseLeave?: DayEventHandler<MouseEvent>;

  // === Accessibility ===
  /**
   * When set, DayPicker will focus the first selected day (if set) or today's date.
   * Use for improved accessibility after user actions.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * The aria-label attribute for the calendar container.
   */
  "aria-label"?: string;
  /**
   * The aria-labelledby attribute for the calendar container.
   */
  "aria-labelledby"?: string;

  // === Other ===
  /**
   * Content to render in the calendar footer.
   */
  footer?: ReactNode;
  /**
   * Additional CSS classes merged via `cn()`.
   */
  className?: string;
  /**
   * A unique id to add to the root element.
   */
  id?: string;
  /**
   * Add a title attribute to the container element.
   */
  title?: string;
  /**
   * A cryptographic nonce for Content Security Policy.
   */
  nonce?: string;
}

/**
 * Props for single date selection mode.
 *
 * @example
 * ```tsx
 * <DatePicker
 *   mode="single"
 *   selected={date}
 *   onSelect={setDate}
 * />
 * ```
 */
export interface DatePickerSingleProps extends DatePickerBaseProps {
  /**
   * Selection mode: select a single date.
   */
  mode: "single";
  /**
   * Whether a selection is required (prevents deselection).
   * @default false
   */
  required?: boolean;
  /**
   * The currently selected date.
   */
  selected?: Date;
  /**
   * Callback when a date is selected or deselected.
   */
  onSelect?: DatePickerSelectHandler<Date | undefined>;
}

/**
 * Props for multiple date selection mode.
 *
 * @example
 * ```tsx
 * <DatePicker
 *   mode="multiple"
 *   selected={dates}
 *   onSelect={setDates}
 *   max={5}
 * />
 * ```
 */
export interface DatePickerMultipleProps extends DatePickerBaseProps {
  /**
   * Selection mode: select multiple dates.
   */
  mode: "multiple";
  /**
   * Whether at least one selection is required.
   * @default false
   */
  required?: boolean;
  /**
   * The currently selected dates.
   */
  selected?: Date[];
  /**
   * Callback when dates are selected or deselected.
   */
  onSelect?: DatePickerSelectHandler<Date[] | undefined>;
  /**
   * Minimum number of dates that must be selected.
   */
  min?: number;
  /**
   * Maximum number of dates that can be selected.
   */
  max?: number;
}

/**
 * Props for date range selection mode.
 *
 * @example
 * ```tsx
 * <DatePicker
 *   mode="range"
 *   selected={range}
 *   onSelect={setRange}
 *   numberOfMonths={2}
 * />
 * ```
 */
export interface DatePickerRangeProps extends DatePickerBaseProps {
  /**
   * Selection mode: select a date range.
   */
  mode: "range";
  /**
   * Whether a range selection is required.
   * @default false
   */
  required?: boolean;
  /**
   * The currently selected date range.
   */
  selected?: DateRange;
  /**
   * Callback when the range is selected or cleared.
   */
  onSelect?: DatePickerSelectHandler<DateRange | undefined>;
  /**
   * Minimum number of days in the range (nights).
   */
  min?: number;
  /**
   * Maximum number of days in the range (nights).
   */
  max?: number;
  /**
   * Reset the range if it includes a disabled date.
   * @default false
   */
  excludeDisabled?: boolean;
}

/**
 * DatePicker component props - discriminated union of all selection modes.
 */
export type DatePickerProps =
  | DatePickerSingleProps
  | DatePickerMultipleProps
  | DatePickerRangeProps;

/**
 * DatePicker — a date selection calendar.
 *
 * Built on [react-day-picker](https://daypicker.dev) with Kumo styling.
 * Supports three selection modes: single, multiple, and range.
 *
 * **Features:**
 * - Three selection modes: single, multiple, range
 * - Multiple month display with `numberOfMonths`
 * - Localization via date-fns locales
 * - Timezone support
 * - Custom date modifiers for highlighting events
 * - Accessible keyboard navigation
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
export function DatePicker(props: DatePickerProps) {
  const {
    // Kumo-specific
    className,

    // Month/Navigation
    month,
    defaultMonth,
    onMonthChange,
    numberOfMonths = 1,
    startMonth,
    endMonth,
    hideNavigation = false,
    disableNavigation = false,
    pagedNavigation,
    reverseMonths,
    onNextClick,
    onPrevClick,

    // Caption/Dropdowns
    captionLayout,
    reverseYears,

    // Localization
    locale,
    weekStartsOn,
    timeZone,
    firstWeekContainsDate,
    ISOWeek,
    broadcastCalendar,
    numerals,
    dir,
    lang,

    // Display Options
    showWeekNumber = false,
    showOutsideDays = true,
    fixedWeeks = false,
    hideWeekdays,
    animate = true,

    // Modifiers
    disabled,
    hidden,
    modifiers,
    modifiersClassNames,
    today,

    // Formatting & Labels
    formatters,
    labels,

    // Day Event Handlers
    onDayClick,
    onDayFocus,
    onDayBlur,
    onDayKeyDown,
    onDayMouseEnter,
    onDayMouseLeave,

    // Accessibility
    autoFocus,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,

    // Other
    footer,
    id,
    title,
    nonce,

    // mode, required, selected, onSelect are handled by buildModeProps
  } = props;

  const classNames = getKumoClassNames();

  // Create custom components with correct icon size
  const components: Partial<CustomComponents> = {
    Chevron: createChevronComponent(ICON_SIZE),
  };

  // Build mode-specific props
  const modeProps = buildModeProps(props);

  return (
    <DayPicker
      // Mode props
      {...modeProps}
      // Month/Navigation
      month={month}
      defaultMonth={defaultMonth}
      onMonthChange={onMonthChange}
      numberOfMonths={numberOfMonths}
      startMonth={startMonth}
      endMonth={endMonth}
      hideNavigation={hideNavigation}
      disableNavigation={disableNavigation}
      pagedNavigation={pagedNavigation}
      reverseMonths={reverseMonths}
      onNextClick={onNextClick}
      onPrevClick={onPrevClick}
      // Caption/Dropdowns
      captionLayout={captionLayout}
      reverseYears={reverseYears}
      // Localization
      locale={locale}
      weekStartsOn={weekStartsOn}
      timeZone={timeZone}
      firstWeekContainsDate={firstWeekContainsDate}
      ISOWeek={ISOWeek}
      broadcastCalendar={broadcastCalendar}
      numerals={numerals}
      dir={dir}
      lang={lang}
      // Display Options
      showWeekNumber={showWeekNumber}
      showOutsideDays={showOutsideDays}
      fixedWeeks={fixedWeeks}
      hideWeekdays={hideWeekdays}
      animate={animate}
      // Modifiers
      disabled={disabled}
      hidden={hidden}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      today={today}
      // Formatting & Labels
      formatters={formatters}
      labels={labels}
      // Day Event Handlers
      onDayClick={onDayClick}
      onDayFocus={onDayFocus}
      onDayBlur={onDayBlur}
      onDayKeyDown={onDayKeyDown}
      onDayMouseEnter={onDayMouseEnter}
      onDayMouseLeave={onDayMouseLeave}
      // Accessibility
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      // Other
      footer={footer}
      id={id}
      title={title}
      nonce={nonce}
      // Styling (Kumo handles this)
      classNames={{
        ...classNames,
        root: cn(classNames.root, className),
      }}
      components={components}
    />
  );
}

/**
 * Build mode-specific props for DayPicker based on the selection mode.
 */
function buildModeProps(props: DatePickerProps) {
  switch (props.mode) {
    case "single":
      return {
        mode: "single" as const,
        required: props.required,
        selected: props.selected,
        onSelect: props.onSelect,
      };
    case "multiple":
      return {
        mode: "multiple" as const,
        required: props.required,
        selected: props.selected,
        onSelect: props.onSelect,
        min: props.min,
        max: props.max,
      };
    case "range":
      return {
        mode: "range" as const,
        required: props.required,
        selected: props.selected,
        onSelect: props.onSelect,
        min: props.min,
        max: props.max,
        excludeDisabled: props.excludeDisabled,
      };
  }
}

DatePicker.displayName = "DatePicker";

export default DatePicker;
