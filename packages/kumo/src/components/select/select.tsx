import { Select as SelectBase } from "@base-ui/react/select";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";
import { forwardRef, useId } from "react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { buttonVariants } from "../button";
import { KUMO_INPUT_VARIANTS, type KumoInputSize } from "../input/input";
import { SkeletonLine } from "../loader";
import { Field, type FieldErrorMatch } from "../field/field";
import {
  usePortalContainer,
  type PortalContainer,
} from "../../utils/portal-provider";

/** Select variant definitions. */
export const KUMO_SELECT_VARIANTS = {
  size: KUMO_INPUT_VARIANTS.size,
} as const;

export const KUMO_SELECT_DEFAULT_VARIANTS = {
  size: "base",
} as const;

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
export type KumoSelectSize = keyof typeof KUMO_SELECT_VARIANTS.size;

export interface KumoSelectVariantsProps {
  /**
   * Size of the select trigger. Matches Input component sizes.
   * - `"xs"` — Extra small for compact UIs (h-5 / 20px)
   * - `"sm"` — Small for secondary fields (h-6.5 / 26px)
   * - `"base"` — Default size (h-9 / 36px)
   * - `"lg"` — Large for prominent fields (h-10 / 40px)
   * @default "base"
   */
  size?: KumoSelectSize;
}

export function selectVariants({
  size = KUMO_SELECT_DEFAULT_VARIANTS.size,
}: KumoSelectVariantsProps = {}) {
  return cn(
    buttonVariants({ size }),
    "justify-between font-normal",
    "focus:opacity-100 focus-visible:ring-1 focus-visible:ring-kumo-hairline *:in-focus:opacity-100",
  );
}

const triggerIconStyles: Record<
  KumoInputSize,
  { iconSize: number; className: string }
> = {
  xs: { iconSize: 12, className: "text-kumo-subtle" },
  sm: { iconSize: 14, className: "text-kumo-subtle" },
  base: { iconSize: 16, className: "text-kumo-subtle" },
  lg: { iconSize: 18, className: "text-kumo-subtle" },
};

/**
 * Shape for items that carry extra metadata (disabled state, tooltip).
 * Plain `ReactNode` values are still supported for backward compatibility.
 */
export interface SelectItemDescriptor {
  /** Display label for the option. */
  label: ReactNode;
  /** When `true`, the option cannot be selected. */
  disabled?: boolean;
}

/** Value type accepted by the `items` object-map prop. */
export type SelectItemValue = ReactNode | SelectItemDescriptor;

function isItemDescriptor(
  value: SelectItemValue,
): value is SelectItemDescriptor {
  if (value === null || value === undefined) return false;
  if (typeof value !== "object" || Array.isArray(value)) return false;
  // React elements have $$typeof — exclude them
  if ("$$typeof" in (value as object)) return false;
  // Promises are not descriptors
  if (value instanceof Promise) return false;
  // Must have a defined label (not just the key existing)
  const candidate = value as unknown as Record<string, unknown>;
  return "label" in candidate && candidate.label !== undefined;
}

/**
 * Normalizes items to array format for Base UI.
 * Object maps are converted to array format so Base UI can properly
 * handle value matching and placeholder display.
 */
function normalizeItems<T>(
  items:
    | Record<string, SelectItemValue>
    | ReadonlyArray<{ label: ReactNode; value: T }>,
): ReadonlyArray<{ label: ReactNode; value: T }> {
  if (Array.isArray(items)) {
    return items;
  }
  // Convert object map to array format
  return Object.entries(items).map(([key, entry]) => ({
    value: key as T,
    label: isItemDescriptor(entry) ? entry.label : entry,
  }));
}

/**
 * Auto-generates Select.Option elements from items prop.
 * Only used when children are not explicitly provided.
 * Filters out null values (typically used for placeholders).
 */
function renderOptionsFromItems<T>(
  items:
    | Record<string, SelectItemValue>
    | ReadonlyArray<{ label: ReactNode; value: T }>,
): ReactNode {
  const normalizedItems = normalizeItems(items);

  // Build a lookup for disabled metadata from object-map items.
  // Object-map keys are always strings (Record<string, ...>), so the lookup
  // uses string keys. The array form ({ label, value }[]) does not support
  // descriptors — consumers should use the children API for that case.
  const disabledLookup = new Map<string, { disabled?: boolean }>();
  if (!Array.isArray(items)) {
    for (const [key, entry] of Object.entries(items)) {
      if (isItemDescriptor(entry)) {
        disabledLookup.set(key, { disabled: entry.disabled });
      }
    }
  }

  // Filter out null values and render options
  return normalizedItems
    .filter((item) => item.value !== null)
    .map((item, index) => {
      const key =
        typeof item.value === "string" ? item.value : `option-${index}`;
      // When items is an object-map, value is always a string key from
      // Object.entries. When items is an array, disabledLookup is empty.
      const meta =
        typeof item.value === "string"
          ? disabledLookup.get(item.value)
          : undefined;

      return (
        <Option key={key} value={item.value} disabled={meta?.disabled}>
          {item.label}
        </Option>
      );
    });
}

type SelectPropsGeneric<T, Multiple extends boolean | undefined = false> = Omit<
  SelectBase.Root.Props<T, Multiple>,
  "items"
> &
  KumoSelectVariantsProps & {
    multiple?: Multiple;
    renderValue?: (value: Multiple extends true ? T[] : T) => ReactNode;
    className?: string;
    /**
     * Data structure of items rendered in the popup.
     * Accepts a plain object map (`{ key: "Label" }`) or an array of `{ label, value }`.
     *
     * Object-map values can be a `ReactNode` (backward-compatible) **or** a
     * `SelectItemDescriptor` for extra metadata:
     *
     * ```tsx
     * items={{
     *   apple: "Apple",
     *   banana: { label: "Banana", disabled: true, disabledReason: "Out of season" },
     * }}
     * ```
     */
    items?:
      | Record<string, SelectItemValue>
      | ReadonlyArray<{ label: ReactNode; value: T }>;
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
  /** Size of the select trigger. Matches Input component sizes. */
  size?: KumoSelectSize;
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
 * Select.Option component props.
 */
export interface SelectOptionProps {
  /** The option content. */
  children: ReactNode;
  /** The value associated with this option. */
  value: unknown;
  /** When `true`, the option cannot be selected. */
  disabled?: boolean;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
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
  size = KUMO_SELECT_DEFAULT_VARIANTS.size,
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

  // Exclude Kumo-extended `items` from Base UI spread — we pass `normalizedItems` instead
  const { items: _items, ...baseProps } = props;

  const selectControl = (
    <SelectBase.Root
      {...baseProps}
      items={normalizedItems}
      disabled={loading || props.disabled}
    >
      <SelectBase.Trigger
        className={cn(
          selectVariants({ size }),
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
            className="min-w-0 truncate data-[placeholder]:text-kumo-placeholder"
          >
            {renderValue}
          </SelectBase.Value>
        )}
        <SelectBase.Icon
          className={cn(
            "flex shrink-0 items-center",
            triggerIconStyles[size].className,
          )}
        >
          <CaretUpDownIcon
            size={triggerIconStyles[size].iconSize}
            className="fill-current"
          />
        </SelectBase.Icon>
      </SelectBase.Trigger>
      <SelectBase.Portal container={container}>
        <SelectBase.Positioner>
          <SelectBase.Popup
            className={cn(
              "flex flex-col",
              "max-h-[var(--available-height)] bg-kumo-base text-kumo-default",
              "rounded-lg shadow-lg ring ring-kumo-line",
              "min-w-[calc(var(--anchor-width)+3px)] py-1.5",
            )}
          >
            <SelectBase.List
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-none scroll-pt-2 scroll-pb-2",
              )}
            >
              {renderedChildren}
            </SelectBase.List>
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
  /** When `true`, the option cannot be selected. */
  disabled?: boolean;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
};

function Option<T>({ children, value, disabled, className }: OptionProps<T>) {
  return (
    <SelectBase.Item
      value={value}
      disabled={disabled}
      className={cn(
        "group mx-1.5 flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1.5 text-base data-highlighted:bg-kumo-tint",
        "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
    >
      <SelectBase.ItemText>{children}</SelectBase.ItemText>
      <SelectBase.ItemIndicator>
        <CheckIcon />
      </SelectBase.ItemIndicator>
    </SelectBase.Item>
  );
}

// --- Select.Group ---

type GroupProps = {
  children: ReactNode;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
};

/**
 * Groups related options together with an accessible `role="group"`.
 * Use with `Select.GroupLabel` to provide a visible heading for the group.
 *
 * @example
 * ```tsx
 * <Select.Group>
 *   <Select.GroupLabel>Fruits</Select.GroupLabel>
 *   <Select.Option value="apple">Apple</Select.Option>
 * </Select.Group>
 * ```
 */
const Group = forwardRef<HTMLDivElement, GroupProps>(
  ({ children, className }, ref) => (
    <SelectBase.Group ref={ref} className={cn(className)}>
      {children}
    </SelectBase.Group>
  ),
);
Group.displayName = "Select.Group";

// --- Select.GroupLabel ---

type GroupLabelProps = {
  children: ReactNode;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
};

/**
 * A visible heading for a `Select.Group`.
 * Automatically associated with its parent group for accessibility.
 *
 * @example
 * ```tsx
 * <Select.Group>
 *   <Select.GroupLabel>Available</Select.GroupLabel>
 *   <Select.Option value="a">Option A</Select.Option>
 * </Select.Group>
 * ```
 */
const GroupLabel = forwardRef<HTMLDivElement, GroupLabelProps>(
  ({ children, className }, ref) => (
    <SelectBase.GroupLabel
      ref={ref}
      className={cn(
        "px-3.5 py-1.5 text-sm font-semibold text-kumo-subtle",
        className,
      )}
    >
      {children}
    </SelectBase.GroupLabel>
  ),
);
GroupLabel.displayName = "Select.GroupLabel";

// --- Select.Separator ---

type SeparatorProps = {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
};

/**
 * A visual divider between option groups.
 *
 * @example
 * ```tsx
 * <Select.Option value="a">Option A</Select.Option>
 * <Select.Separator />
 * <Select.Option value="b">Option B</Select.Option>
 * ```
 */
const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className }, ref) => (
    <SelectBase.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-kumo-hairline", className)}
    />
  ),
);
Separator.displayName = "Select.Separator";

// --- Assign sub-components ---

Select.Option = Option;
Select.Group = Group;
Select.GroupLabel = GroupLabel;
Select.Separator = Separator;

(Select.Option as { displayName?: string }).displayName = "Select.Option";
