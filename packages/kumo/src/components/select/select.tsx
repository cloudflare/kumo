import { Select as SelectBase } from "@base-ui/react/select";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";
import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { buttonVariants } from "../button";
import { SkeletonLine } from "../loader";
import { Field, type FieldErrorMatch } from "../field/field";
import {
  usePortalContainer,
  type PortalContainer,
} from "../../utils/portal-provider";

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
    "focus:opacity-100 focus-visible:ring-1 focus-visible:ring-kumo-ring *:in-focus:opacity-100",
  );
}

/**
 * Normalizes items to array format for Base UI.
 * Object maps are converted to array format so Base UI can properly
 * handle value matching and placeholder display.
 */
function normalizeItems<T>(
  items:
    | Record<string, ReactNode>
    | ReadonlyArray<{ label: ReactNode; value: T }>,
): ReadonlyArray<{ label: ReactNode; value: T }> {
  if (Array.isArray(items)) {
    return items;
  }
  // Convert object map to array format
  return Object.entries(items).map(([key, label]) => ({
    value: key as T,
    label,
  }));
}

/**
 * Auto-generates Select.Option elements from items prop.
 * Only used when children are not explicitly provided.
 * Filters out null values (typically used for placeholders).
 */
function renderOptionsFromItems<T>(
  items:
    | Record<string, ReactNode>
    | ReadonlyArray<{ label: ReactNode; value: T }>,
): ReactNode {
  const normalizedItems = normalizeItems(items);

  // Filter out null values and render options
  return normalizedItems
    .filter((item) => item.value !== null)
    .map((item, index) => (
      <Option
        key={typeof item.value === "string" ? item.value : `option-${index}`}
        value={item.value}
      >
        {item.label}
      </Option>
    ));
}

type SelectPropsGeneric<
  T,
  Multiple extends boolean | undefined = false,
> = SelectBase.Root.Props<T, Multiple> &
  KumoSelectVariantsProps & {
    multiple?: Multiple;
    renderValue?: (value: Multiple extends true ? T[] : T) => ReactNode;
    className?: string;
    /**
     * Label content for the select.
     * When provided, enables the Field wrapper with a visible label.
     * For accessibility without a visible label, use `aria-label` instead.
     */
    label?: ReactNode;
    /**
     * @deprecated Use `aria-label` for hidden labels instead of `label` + `hideLabel={true}`.
     * When `label` is provided without `hideLabel`, the label is now visible by default (matching Input behavior).
     * This prop will be removed in a future version.
     */
    hideLabel?: boolean;
    placeholder?: string;
    loading?: boolean;
    /** Tooltip content to display next to the label via an info icon */
    labelTooltip?: ReactNode;
    /** Helper text displayed below the select */
    description?: ReactNode;
    /** Error message or validation error object */
    error?: string | { message: ReactNode; match: FieldErrorMatch };
    /**
     * Container element for the portal. Use this to render the select inside
     * a Shadow DOM or custom container. Overrides `KumoPortalProvider` context.
     * @default document.body (or KumoPortalProvider container if set)
     */
    container?: PortalContainer;
  };

/**
 * Select component props.
 *
 * **Accessible Name Required:** Select should have one of:
 * 1. `label` prop (recommended) - enables Field wrapper with visible label
 * 2. `aria-label` - for selects without visible label (accessibility-only)
 * 3. `aria-labelledby` - for custom label association
 *
 * @example
 * ```tsx
 * // With visible label (recommended)
 * <Select label="Country" onValueChange={setValue}>
 *   <Select.Option value="us">United States</Select.Option>
 *   <Select.Option value="uk">United Kingdom</Select.Option>
 * </Select>
 *
 * // Without visible label (use aria-label for accessibility)
 * <Select aria-label="Select a country" onValueChange={setValue}>
 *   <Select.Option value="us">United States</Select.Option>
 * </Select>
 * ```
 */
export interface SelectProps {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /**
   * Label content for the select.
   * When provided, enables the Field wrapper with a visible label above the select.
   * For accessibility without a visible label, use `aria-label` instead.
   */
  label?: ReactNode;
  /**
   * @deprecated Use `aria-label` for hidden labels instead of `label` + `hideLabel={true}`.
   * When `label` is provided without `hideLabel`, the label is now visible by default (matching Input behavior).
   * This prop will be removed in a future version.
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
  hideLabel,
  placeholder,
  loading,
  labelTooltip,
  description,
  error,
  required,
  container: containerProp,
  ...props
}: SelectPropsGeneric<T, Multiple> & { required?: boolean }) {
  const labelId = useId();
  const contextContainer = usePortalContainer();
  const container = containerProp ?? contextContainer ?? undefined;
  const propLookup = props as Record<string, unknown>;
  const ariaLabel = propLookup["aria-label"] as string | undefined;
  const ariaLabelledby = propLookup["aria-labelledby"] as string | undefined;
  // For aria-label, use string label or placeholder (ReactNode labels can't be used for aria-label)
  const fallbackLabel = typeof label === "string" ? label : placeholder;

  // Deprecation warning for hideLabel
  if (process.env.NODE_ENV !== "production" && hideLabel !== undefined) {
    console.warn(
      "[Kumo Select]: `hideLabel` is deprecated. For hidden labels, use `aria-label` instead of `label` + `hideLabel={true}`.\n" +
        "  Migration:\n" +
        '  - For visible labels: <Select label="Country" /> (hideLabel no longer needed)\n' +
        '  - For hidden labels: <Select aria-label="Select a country" /> (remove label and hideLabel)',
    );
  }

  // New behavior: label presence determines Field wrapper visibility (like Input)
  // hideLabel is only respected for backward compatibility when explicitly set to true
  const useFieldWrapper = label && hideLabel !== true;
  const triggerLabelledBy = useFieldWrapper
    ? undefined
    : (ariaLabelledby ?? (label ? labelId : undefined));
  const triggerAriaLabel =
    ariaLabel ?? (!triggerLabelledBy ? fallbackLabel : undefined);

  // Normalize items to array format for Base UI compatibility
  // This fixes placeholder not showing with object map items
  const normalizedItems = props.items ? normalizeItems(props.items) : undefined;

  // Auto-render children from items if children not provided
  const renderedChildren =
    children ?? (props.items ? renderOptionsFromItems(props.items) : null);

  const selectControl = (
    <SelectBase.Root
      {...props}
      items={normalizedItems}
      disabled={loading || props.disabled}
    >
      <SelectBase.Trigger
        className={cn(
          buttonVariants(),
          "justify-between font-normal",
          "focus:opacity-100 focus-visible:ring-1 focus-visible:ring-kumo-ring *:in-focus:opacity-100",
          props.disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        aria-label={triggerAriaLabel}
        aria-labelledby={triggerLabelledBy}
      >
        {loading ? (
          <SkeletonLine className="w-32" />
        ) : (
          <SelectBase.Value
            placeholder={placeholder}
            className="min-w-0 truncate"
          >
            {renderValue}
          </SelectBase.Value>
        )}
        <SelectBase.Icon className="flex shrink-0 items-center">
          <CaretUpDownIcon />
        </SelectBase.Icon>
      </SelectBase.Trigger>
      <SelectBase.Portal container={container}>
        <SelectBase.Positioner>
          <SelectBase.Popup
            className={cn(
              "overflow-hidden bg-kumo-base text-kumo-default", // background
              "rounded-lg shadow-lg ring ring-kumo-ring", // border part
              // 3px adjustment to account for padding + border differences
              "min-w-[calc(var(--anchor-width)+3px)] p-1.5", // spacing
            )}
          >
            {renderedChildren}
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
  // Still show description/error for accessibility and UX
  const normalizedError = error
    ? typeof error === "string"
      ? { message: error, match: true as const }
      : error
    : undefined;

  return (
    <div className="grid gap-2">
      {label && (
        <span id={labelId} className="sr-only">
          {label}
        </span>
      )}
      {selectControl}
      {normalizedError ? (
        <span className="text-sm text-kumo-danger">
          {normalizedError.message}
        </span>
      ) : (
        description && (
          <span className="text-sm leading-snug text-kumo-subtle">
            {description}
          </span>
        )
      )}
    </div>
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
      className="group flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1.5 text-base data-highlighted:bg-kumo-tint"
    >
      <SelectBase.ItemText>{children}</SelectBase.ItemText>
      <SelectBase.ItemIndicator>
        <CheckIcon />
      </SelectBase.ItemIndicator>
    </SelectBase.Item>
  );
}

Select.Option = Option;
