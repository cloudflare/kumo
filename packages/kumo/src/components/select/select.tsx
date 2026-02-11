import { Select as SelectBase } from "@base-ui/react/select";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";
import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { buttonVariants } from "../button";
import { SkeletonLine } from "../loader";
import { Field, type FieldErrorMatch } from "../field/field";

/** Select variant definitions (currently empty, reserved for future additions). */
export const KUMO_SELECT_VARIANTS = {
  // Select currently has no variant options but structure is ready for future additions
} as const;

export const KUMO_SELECT_DEFAULT_VARIANTS = {} as const;

/**
 * Select component styling metadata for Figma plugin code generation
 * Extracted from select.tsx implementation (source of truth)
 */
export const KUMO_SELECT_STYLING = {
  trigger: {
    height: 36, // h-9
    paddingX: 12, // px-3
    borderRadius: 8, // rounded-lg
    background: "color-secondary",
    text: "text-color-surface",
    ring: "color-border",
    fontSize: 16, // text-base
    fontWeight: 400, // font-normal
  },
  stateTokens: {
    focus: { ring: "color-active" },
    disabled: { opacity: 0.5 },
  },
  icons: {
    caret: { name: "ph-caret-up-down", size: 20 },
    check: { name: "ph-check", size: 20 },
  },
  popup: {
    background: "color-secondary",
    ring: "color-border",
    borderRadius: 8, // rounded-lg
    padding: 6, // p-1.5
  },
  option: {
    paddingX: 8, // px-2
    paddingY: 6, // py-1.5
    borderRadius: 4, // rounded
    fontSize: 16, // text-base
    highlightBackground: "color-surface-secondary",
  },
} as const;

// Derived types from KUMO_SELECT_VARIANTS
export interface KumoSelectVariantsProps {}

export function selectVariants(_props: KumoSelectVariantsProps = {}) {
  return cn(
    buttonVariants(),
    "justify-between font-normal",
    "outline-none focus:opacity-100 focus-visible:ring-1 focus-visible:ring-kumo-ring *:in-focus:opacity-100",
  );
}

type SelectPropsGeneric<
  T,
  Multiple extends boolean | undefined = false,
> = SelectBase.Root.Props<T, Multiple> &
  KumoSelectVariantsProps & {
    multiple?: Multiple;
    renderValue?: (value: Multiple extends true ? T[] : T) => ReactNode;
    className?: string;
    /** Label content for the select (enables Field wrapper) - can be a string or any React node */
    label?: ReactNode;
    /** Visually hide the label (sr-only). Set to `false` for a visible label. @default true */
    hideLabel?: boolean;
    placeholder?: string;
    loading?: boolean;
    /** Tooltip content to display next to the label via an info icon */
    labelTooltip?: ReactNode;
    /** Helper text displayed below the select */
    description?: ReactNode;
    /** Error message or validation error object */
    error?: string | { message: ReactNode; match: FieldErrorMatch };
  };

/**
 * Select component props.
 *
 * @example
 * ```tsx
 * <Select label="Country" onValueChange={setValue}>
 *   <Select.Option value="us">United States</Select.Option>
 *   <Select.Option value="uk">United Kingdom</Select.Option>
 * </Select>
 * ```
 */
export interface SelectProps {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Label content for the select (enables Field wrapper) — can be a string or any React node. */
  label?: ReactNode;
  /**
   * Visually hide the label while keeping it accessible to screen readers.
   * Set to `false` to show a visible label above the select via the Field wrapper.
   * @default true
   */
  hideLabel?: boolean;
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** When `true`, shows a skeleton loader in place of the selected value. */
  loading?: boolean;
  /** Whether the select is disabled. */
  disabled?: boolean;
  /** Whether the select is required. When `false`, shows "(optional)" text. */
  required?: boolean;
  /** Tooltip content displayed next to the label via an info icon. */
  labelTooltip?: ReactNode;
  /** Currently selected value (controlled mode). */
  value?: unknown;
  /** Initial value for uncontrolled mode. */
  defaultValue?: unknown;
  /** Callback fired when the selected value changes. */
  onValueChange?: (value: unknown) => void;
  /** Enable multi-select mode. */
  multiple?: boolean;
  /** `Select.Option` elements to render in the dropdown. */
  children?: ReactNode;
  /** Helper text displayed below the select. */
  description?: ReactNode;
  /** Error message string or validation error object with `match` key. */
  error?: string | { message: ReactNode; match: FieldErrorMatch };
}

/**
 * Dropdown for selecting a value from a list of options.
 * Wraps Base UI Select with Kumo styling and optional Field integration.
 *
 * @example
 * ```tsx
 * <Select label="Fruit" onValueChange={setFruit}>
 *   <Select.Option value="apple">Apple</Select.Option>
 *   <Select.Option value="banana">Banana</Select.Option>
 * </Select>
 * ```
 */
export function Select<T, Multiple extends boolean | undefined = false>({
  children,
  className,
  renderValue,
  label,
  hideLabel = true,
  placeholder,
  loading,
  labelTooltip,
  description,
  error,
  required,
  ...props
}: SelectPropsGeneric<T, Multiple> & { required?: boolean }) {
  const labelId = useId();
  const propLookup = props as Record<string, unknown>;
  const ariaLabel = propLookup["aria-label"] as string | undefined;
  const ariaLabelledby = propLookup["aria-labelledby"] as string | undefined;
  // For aria-label, use string label or placeholder (ReactNode labels can't be used for aria-label)
  const fallbackLabel = typeof label === "string" ? label : placeholder;

  // Use Field wrapper when label is provided and not hidden
  const useFieldWrapper = label && !hideLabel;
  const triggerLabelledBy = useFieldWrapper
    ? undefined
    : (ariaLabelledby ?? (label ? labelId : undefined));
  const triggerAriaLabel =
    ariaLabel ?? (!triggerLabelledBy ? fallbackLabel : undefined);

  // Placeholder must be provide via the items props
  // We need to fake the items or do some transformation
  let items = props.items;
  if (placeholder) {
    if (!items) {
      items = [
        {
          value: null as T,
          label: placeholder,
        },
      ];
    } else if (typeof items === "object") {
      items = [
        {
          value: null as T,
          label: placeholder,
        },
        ...Object.entries(items).map(([key, value]) => ({
          value: key as T,
          label: value,
        })),
      ];
    } else if (Array.isArray(items)) {
      items = [
        {
          value: null as T,
          label: placeholder,
        },
        ...items,
      ];
    }
  }

  const selectControl = (
    <SelectBase.Root
      {...props}
      items={items}
      disabled={loading || props.disabled}
    >
      <SelectBase.Trigger
        className={cn(
          buttonVariants(),
          "justify-between font-normal",
          "outline-none focus:opacity-100 focus-visible:ring-1 focus-visible:ring-kumo-ring *:in-focus:opacity-100",
          props.disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        aria-label={triggerAriaLabel}
        aria-labelledby={triggerLabelledBy}
      >
        {loading ? (
          <SkeletonLine className="w-32" />
        ) : (
          <SelectBase.Value>{renderValue}</SelectBase.Value>
        )}
        <SelectBase.Icon className="flex items-center">
          <CaretUpDownIcon />
        </SelectBase.Icon>
      </SelectBase.Trigger>
      <SelectBase.Portal>
        <SelectBase.Positioner className="z-50">
          <SelectBase.Popup
            className={cn(
              "z-50 overflow-hidden bg-kumo-control text-kumo-default", // background
              "rounded-lg shadow-lg ring ring-kumo-line", // border part
              // 3px adjustment to account for padding + border differences
              "min-w-[calc(var(--anchor-width)+3px)] p-1.5", // spacing
            )}
          >
            {children}
          </SelectBase.Popup>
        </SelectBase.Positioner>
      </SelectBase.Portal>
    </SelectBase.Root>
  );

  // Use Field wrapper when label is provided and not hidden
  if (useFieldWrapper) {
    return (
      <Field
        label={label}
        required={required}
        labelTooltip={labelTooltip}
        description={description}
        error={
          error
            ? typeof error === "string"
              ? { message: error, match: true }
              : error
            : undefined
        }
      >
        {selectControl}
      </Field>
    );
  }

  // Render with standalone label when label is hidden (sr-only)
  return (
    <>
      {label && (
        <span id={labelId} className="sr-only">
          {label}
        </span>
      )}
      {selectControl}
    </>
  );
}

type OptionProps<T> = {
  children: ReactNode;
  value: T;
};

function Option<T>({ children, value }: OptionProps<T>) {
  return (
    <SelectBase.Item
      value={value}
      className="group flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1.5 text-base data-highlighted:bg-kumo-overlay"
    >
      <SelectBase.ItemText>{children}</SelectBase.ItemText>
      <SelectBase.ItemIndicator>
        <CheckIcon />
      </SelectBase.ItemIndicator>
    </SelectBase.Item>
  );
}

Select.Option = Option;
