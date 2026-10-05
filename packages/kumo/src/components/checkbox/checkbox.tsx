import { forwardRef, createContext, useContext, type ReactNode } from "react";
import { CheckIcon, MinusIcon } from "@phosphor-icons/react";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";
import { Label } from "../label";
import { Fieldset } from "@base-ui/react/fieldset";
import { Field as FieldBase } from "@base-ui/react/field";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";

/** Event details passed to onCheckedChange callback. Re-exported from Base UI. */
export type CheckboxChangeEventDetails = Parameters<
  NonNullable<BaseCheckbox.Root.Props["onCheckedChange"]>
>[1];

/** Checkbox variant definitions mapping variant names to their Tailwind classes. */
export const KUMO_CHECKBOX_VARIANTS = {
  variant: {
    default: {
      classes:
        "[&:focus-within>span]:ring-kumo-focus [&:hover>span]:ring-kumo-hairline",
      description: "Default checkbox appearance",
    },
    error: {
      classes: "[&>span]:ring-kumo-danger",
      description: "Error state for validation failures",
    },
  },
  appearance: {
    default: {
      classes: "",
      description: "Standard inline checkbox item",
    },
    card: {
      classes:
        "rounded-lg border border-kumo-hairline bg-kumo-base p-3 hover:not-has-[[data-checked]]:bg-kumo-elevated has-[[data-checked]]:border-kumo-interact has-[[data-checked]]:bg-kumo-tint",
      description:
        "Choice card appearance with border, padding, and highlighted selection state",
    },
  },
} as const;

export const KUMO_CHECKBOX_DEFAULT_VARIANTS = {
  variant: "default",
  appearance: "default",
} as const;

// Derived types from KUMO_CHECKBOX_VARIANTS
export type KumoCheckboxVariant = keyof typeof KUMO_CHECKBOX_VARIANTS.variant;
export type KumoCheckboxAppearance =
  keyof typeof KUMO_CHECKBOX_VARIANTS.appearance;

export interface KumoCheckboxVariantsProps {
  /**
   * Visual variant.
   * - `"default"` — Standard checkbox appearance
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: KumoCheckboxVariant;
  /**
   * Visual appearance.
   * - `"default"` — Standard inline checkbox item
   * - `"card"` — Choice card with border, padding, and highlighted selection state
   * @default "default"
   */
  appearance?: KumoCheckboxAppearance;
}

export function checkboxVariants({
  variant = KUMO_CHECKBOX_DEFAULT_VARIANTS.variant,
  appearance = KUMO_CHECKBOX_DEFAULT_VARIANTS.appearance,
}: KumoCheckboxVariantsProps = {}) {
  return cn(
    resolveVariant(
      KUMO_CHECKBOX_VARIANTS.variant,
      variant,
      KUMO_CHECKBOX_DEFAULT_VARIANTS.variant,
    ).classes,
    resolveVariant(
      KUMO_CHECKBOX_VARIANTS.appearance,
      appearance,
      KUMO_CHECKBOX_DEFAULT_VARIANTS.appearance,
    ).classes,
  );
}

// Legacy type alias for backwards compatibility
export type CheckboxVariant = KumoCheckboxVariant;

// Context for passing controlFirst, appearance, and orientation from Group to
// Items. `controlFirst` may be undefined so each item can fall back to an
// appearance-appropriate default (control first for default, last for card).
// `orientation` is null outside a Checkbox.Group.
const CheckboxGroupContext = createContext<{
  controlFirst: boolean | undefined;
  appearance: KumoCheckboxAppearance;
  orientation: "vertical" | "horizontal" | null;
}>({
  controlFirst: undefined,
  appearance: "default",
  orientation: null,
});

/**
 * Single checkbox component props with accessibility guidance.
 *
 * **Accessible Name Required:** Checkbox should have one of:
 * 1. `label` prop (recommended) - built-in Field wrapper with horizontal layout
 * 2. `aria-label` - for checkboxes without visible label
 * 3. `aria-labelledby` - for custom label association
 *
 * **Note:** When used inside Checkbox.Group or Dropdown, label is optional (parent provides context).
 *
 * Missing accessible names will trigger console warnings in development (unless inside a group).
 *
 * @example
 * // Recommended: Built-in Field wrapper with label
 * <Checkbox label="Accept terms and conditions" />
 *
 * @example
 * // Control-first layout (checkbox before label)
 * <Checkbox label="Remember me" controlFirst={true} />
 *
 * @example
 * // Label-first layout (label before checkbox)
 * <Checkbox label="Enable notifications" controlFirst={false} />
 *
 * @example
 * // Error variant (visual only, no error text for single checkboxes)
 * <Checkbox label="Required field" variant="error" />
 *
 * @example
 * // Without visible label (aria-label required)
 * <Checkbox aria-label="Select all items" />
 *
 * @example
 * // Custom label association
 * <label id="terms-label">I accept the terms</label>
 * <Checkbox aria-labelledby="terms-label" />
 *
 * @example
 * // Inside Checkbox.Group (label optional)
 * <Checkbox.Group legend="Preferences">
 *   <Checkbox.Item value="email" label="Email notifications" />
 *   <Checkbox.Item value="sms" label="SMS notifications" />
 * </Checkbox.Group>
 */
export type CheckboxProps = {
  /** Visual variant: "default" or "error" for validation failures (visual only, no error text) */
  variant?: CheckboxVariant;
  /** Label content for the checkbox (enables built-in Field wrapper) - can be a string or any React node */
  label?: ReactNode;
  /** Tooltip content to display next to the label via an info icon */
  labelTooltip?: ReactNode;
  /** When true (default), checkbox appears before label. When false, label appears before checkbox. */
  controlFirst?: boolean;
  /** Whether the checkbox is checked (controlled) */
  checked?: boolean;
  /** Whether the checkbox is in indeterminate state */
  indeterminate?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Callback when the checked state changes */
  onCheckedChange?: BaseCheckbox.Root.Props["onCheckedChange"];
  /** Name for form submission */
  name?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional class name */
  className?: string;
  /** Accessible label when no visible label is provided */
  "aria-label"?: string;
  /** ID of element that labels this checkbox */
  "aria-labelledby"?: string;
};

/**
 * Checkbox group component props (with built-in Fieldset and CheckboxGroup)
 *
 * Usage:
 * ```tsx
 * <Checkbox.Group
 *   legend="Choose preferences"
 *   defaultValue={['email']}
 *   error="You must select at least one option"
 * >
 *   <Checkbox.Item label="Email notifications" value="email" />
 *   <Checkbox.Item label="SMS notifications" value="sms" />
 * </Checkbox.Group>
 * ```
 */
/**
 * Props for Checkbox.Legend — a composable sub-component for labeling a Checkbox.Group.
 *
 * Place as a direct child of `<Checkbox.Group>` to provide a styled, accessible legend.
 * Accepts `className` for full styling control (e.g. `className="sr-only"` to visually hide).
 *
 * @example
 * ```tsx
 * <Checkbox.Group>
 *   <Checkbox.Legend className="sr-only">Preferences</Checkbox.Legend>
 *   <Checkbox.Item label="Email" value="email" />
 * </Checkbox.Group>
 * ```
 */
export interface CheckboxLegendProps {
  /** Legend content */
  children: ReactNode;
  /** Additional CSS classes (e.g. "sr-only" to visually hide the legend) */
  className?: string;
}

export interface CheckboxGroupProps {
  /**
   * Legend text for the group.
   * For more control over legend styling, omit this prop and use `<Checkbox.Legend>` as a child instead.
   */
  legend?: string;
  /** Child Checkbox.Item components (and optionally a Checkbox.Legend) */
  children: ReactNode;
  /** Error message for the group (only appears in groups, not single checkboxes) */
  error?: string;
  /** Helper text for the group */
  description?: ReactNode;
  /** Values of checkboxes that should be initially checked (uncontrolled) */
  defaultValue?: string[];
  /** Values of checkboxes that should be checked (controlled) */
  value?: string[];
  /** Event handler called when checkbox values change */
  onValueChange?: (value: string[]) => void;
  /** All possible checkbox values (required for parent checkbox pattern) */
  allValues?: string[];
  /** Whether all checkboxes in the group are disabled */
  disabled?: boolean;
  /** Layout direction of the checkbox items */
  orientation?: "vertical" | "horizontal";
  /**
   * Visual appearance applied to all Checkbox.Item children.
   * - `"default"` — Standard inline checkbox items
   * - `"card"` — Choice card with border, padding, and highlighted selection state
   *
   * Individual items can override this with their own `appearance` prop.
   * @default "default"
   */
  appearance?: KumoCheckboxAppearance;
  /** When true, checkbox appears before label. When false, label appears before checkbox. Defaults to true for default appearance and false for card appearance. */
  controlFirst?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Individual checkbox item within a group
 */
export type CheckboxItemProps = {
  /** Visual variant: "default" or "error" for validation failures */
  variant?: CheckboxVariant;
  /**
   * Visual appearance of the checkbox item.
   * - `"default"` — Standard inline checkbox item
   * - `"card"` — Choice card with border, padding, and highlighted selection state
   *
   * When set on an individual item, overrides the group-level `appearance`.
   * @default "default"
   */
  appearance?: KumoCheckboxAppearance;
  /** Label text displayed next to checkbox */
  label: string;
  /** Description text displayed below the label (only visible in card appearance) */
  description?: ReactNode;
  /** Value of the checkbox (required when used in Checkbox.Group) */
  value?: string;
  /** Additional CSS classes for the label wrapper */
  className?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  /** Callback when the checked state changes */
  onCheckedChange?: BaseCheckbox.Root.Props["onCheckedChange"];
  name?: string;
};

// Single checkbox with built-in Field
const CheckboxBase = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked,
      indeterminate,
      disabled,
      variant = "default",
      label,
      labelTooltip,
      controlFirst = true,
      onCheckedChange,
      required,
      name,
      ...props
    },
    ref,
  ) => {
    // A11y enforcement: warn in dev if no accessible name provided
    if (process.env.NODE_ENV !== "production") {
      const hasLabel = Boolean(label);
      const hasAriaLabel = Boolean(props["aria-label"]);
      const hasAriaLabelledBy = Boolean(props["aria-labelledby"]);

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        console.warn(
          "[Kumo Checkbox]: Checkbox must have an accessible name. Provide either:\n" +
            "  - label prop: <Checkbox label='Accept terms' />\n" +
            "  - aria-label: <Checkbox aria-label='Select item' />\n" +
            "  - aria-labelledby for custom label association\n" +
            "  Note: When used inside Checkbox.Group, label is optional",
        );
      }
    }

    const checkboxControl = (
      <BaseCheckbox.Root
        ref={ref}
        data-kumo-component="Checkbox"
        name={name}
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className={cn(
          "relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-0 bg-kumo-base ring after:absolute after:-inset-x-3 after:-inset-y-2 focus:outline-none",
          label && "mt-0.5",
          variant === "error" ? "ring-kumo-danger" : "ring-kumo-hairline",
          !disabled &&
            "hover:ring-kumo-hairline focus:ring-2 focus:ring-kumo-focus focus-visible:ring-2 focus-visible:ring-kumo-brand",
          "data-[checked]:bg-kumo-contrast data-[checked]:ring-kumo-contrast data-[indeterminate]:bg-kumo-contrast data-[indeterminate]:ring-kumo-contrast",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...props}
      >
        <BaseCheckbox.Indicator
          keepMounted
          className="flex items-center justify-center text-kumo-inverse data-[unchecked]:invisible"
          render={(renderProps, state) => (
            <span {...renderProps}>
              {state.indeterminate ? (
                <MinusIcon weight="bold" size={12} />
              ) : (
                <CheckIcon weight="bold" size={12} />
              )}
            </span>
          )}
        />
      </BaseCheckbox.Root>
    );

    // If no label provided, return bare checkbox (for use in other components like Dropdown)
    if (!label) {
      return checkboxControl;
    }

    // Use Field.Root + Field.Label enclosing pattern for proper a11y association
    // See: https://base-ui.com/react/components/field
    return (
      <FieldBase.Root className="inline-flex">
        <FieldBase.Label
          className={cn(
            "!m-0 inline-flex !min-h-0 items-start gap-2 !text-base",
            controlFirst ? "flex-row" : "flex-row-reverse justify-end",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          {checkboxControl}
          <Label
            showOptional={required === false}
            tooltip={labelTooltip}
            asContent
          >
            {label}
          </Label>
        </FieldBase.Label>
      </FieldBase.Root>
    );
  },
);

CheckboxBase.displayName = "Checkbox";

// Checkbox.Item for use within Checkbox.Group
const CheckboxItem = forwardRef<HTMLButtonElement, CheckboxItemProps>(
  (
    {
      className,
      checked,
      indeterminate,
      disabled,
      variant = "default",
      appearance: appearanceProp,
      label,
      description,
      value,
      onCheckedChange,
      name,
    },
    ref,
  ) => {
    const {
      controlFirst: groupControlFirst,
      appearance: groupAppearance,
      orientation,
    } = useContext(CheckboxGroupContext);
    const appearance = appearanceProp ?? groupAppearance;
    const isCard = appearance === "card";
    // Fall back to an appearance-appropriate default when controlFirst is not
    // provided: card puts the checkbox last (right), default puts it first.
    const controlFirst = groupControlFirst ?? !isCard;
    // Card items in a card group render as cells of one shared card; the group
    // draws the outer border and each cell draws its own dividers.
    const isJoined =
      isCard && groupAppearance === "card" && orientation !== null;

    const indicator = (
      <BaseCheckbox.Indicator
        keepMounted
        className="flex items-center justify-center text-kumo-inverse data-[unchecked]:invisible"
        render={(renderProps, state) => (
          <span {...renderProps}>
            {state.indeterminate ? (
              <MinusIcon weight="bold" size={12} />
            ) : (
              <CheckIcon weight="bold" size={12} />
            )}
          </span>
        )}
      />
    );

    if (isCard) {
      return (
        <label
          data-kumo-component="Checkbox"
          data-kumo-part="item-label"
          className={cn(
            "group relative m-0 flex items-start gap-3 bg-kumo-base p-3 has-[[data-checked]]:bg-kumo-tint",
            isJoined
              ? cn(
                  // bg-clip-padding keeps the checked tint from darkening the
                  // translucent dividers.
                  "border-b border-kumo-line bg-clip-padding last:border-b-0",
                  // Two-column grid: the left column draws the column divider
                  // (unless it's a lone last item), and the last row drops its
                  // bottom divider.
                  orientation === "horizontal" &&
                    "odd:border-r [&:last-child:nth-child(odd)]:border-r-0 [&:nth-last-child(2):nth-child(odd)]:border-b-0",
                )
              : "rounded-lg border border-kumo-hairline has-[[data-checked]]:border-kumo-interact",
            controlFirst && "flex-row-reverse",
            variant === "error" &&
              cn(
                "has-[[data-checked]]:bg-kumo-base",
                !isJoined &&
                  "border-kumo-danger has-[[data-checked]]:border-kumo-danger",
              ),
            disabled
              ? "cursor-not-allowed opacity-50"
              : cn(
                  "cursor-pointer has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50",
                  // The checked row keeps its tint while hovered.
                  variant !== "error" &&
                    "hover:not-has-[[data-disabled]]:not-has-[[data-checked]]:bg-kumo-elevated",
                ),
            className,
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-base font-medium text-kumo-default">
              {label}
            </span>
            {description && (
              <span className="text-sm text-kumo-subtle">{description}</span>
            )}
          </div>
          <BaseCheckbox.Root
            ref={ref}
            data-kumo-component="Checkbox"
            data-kumo-part="item"
            value={value}
            name={name}
            checked={checked}
            indeterminate={indeterminate}
            disabled={disabled}
            onCheckedChange={onCheckedChange}
            className={cn(
              "relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-0 bg-kumo-base ring focus:ring-kumo-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
              variant === "error" ? "ring-kumo-danger" : "ring-kumo-line",
              !disabled &&
                variant !== "error" &&
                "group-hover:ring-kumo-hairline",
              "data-[checked]:bg-kumo-contrast data-[checked]:ring-kumo-contrast data-[indeterminate]:bg-kumo-contrast data-[indeterminate]:ring-kumo-contrast",
            )}
          >
            {indicator}
          </BaseCheckbox.Root>
        </label>
      );
    }

    return (
      <label
        data-kumo-component="Checkbox"
        data-kumo-part="item-label"
        className={cn(
          "relative m-0 inline-flex items-start gap-2",
          // Control first (default): checkbox before label
          // Label first: label before checkbox using flex-row-reverse
          !controlFirst && "flex-row-reverse justify-end",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className,
        )}
      >
        <BaseCheckbox.Root
          ref={ref}
          data-kumo-component="Checkbox"
          data-kumo-part="item"
          value={value}
          name={name}
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
          className={cn(
            "peer relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-0 bg-kumo-base ring after:absolute after:-inset-x-3 after:-inset-y-2",
            variant === "error" ? "ring-kumo-danger" : "ring-kumo-hairline",
            !disabled &&
              "group-hover:ring-kumo-hairline hover:ring-kumo-hairline focus:ring-2 focus:ring-kumo-focus focus-visible:ring-2 focus-visible:ring-kumo-brand",
            "data-[checked]:bg-kumo-contrast data-[checked]:ring-kumo-contrast data-[indeterminate]:bg-kumo-contrast data-[indeterminate]:ring-kumo-contrast",
          )}
        >
          {indicator}
        </BaseCheckbox.Root>
        <span className="text-base text-kumo-default">{label}</span>
      </label>
    );
  },
);

CheckboxItem.displayName = "Checkbox.Item";

// Checkbox.Legend — composable legend sub-component for Checkbox.Group
function CheckboxLegend({ children, className }: CheckboxLegendProps) {
  return (
    <Fieldset.Legend
      className={cn("text-base font-medium text-kumo-default", className)}
    >
      {children}
    </Fieldset.Legend>
  );
}

CheckboxLegend.displayName = "Checkbox.Legend";

// Checkbox.Group with built-in Fieldset and CheckboxGroup
function CheckboxGroup({
  legend,
  children,
  error,
  description,
  defaultValue,
  value,
  onValueChange,
  allValues,
  disabled,
  orientation = "vertical",
  appearance = "default",
  controlFirst,
  className,
}: CheckboxGroupProps) {
  return (
    <CheckboxGroupContext.Provider
      value={{ controlFirst, appearance, orientation }}
    >
      <BaseCheckboxGroup
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        allValues={allValues}
        disabled={disabled}
      >
        <Fieldset.Root
          className={cn(
            "flex flex-col p-0",
            // Card groups match Field's label-to-control gap.
            appearance === "card" ? "gap-2" : "gap-4",
            className,
          )}
        >
          {legend && (
            <Fieldset.Legend className="text-base font-medium text-kumo-default">
              {legend}
            </Fieldset.Legend>
          )}
          <div
            className={cn(
              orientation === "vertical"
                ? appearance === "card"
                  ? "flex flex-col overflow-hidden rounded-lg ring ring-kumo-line"
                  : "flex flex-col gap-2"
                : appearance === "card"
                  ? "grid grid-cols-2 overflow-hidden rounded-lg bg-kumo-base ring ring-kumo-line"
                  : "flex flex-row flex-wrap gap-2",
            )}
          >
            {children}
          </div>
          {error && <p className="text-sm text-kumo-danger">{error}</p>}
          {description && (
            <p className="text-sm text-kumo-subtle">{description}</p>
          )}
        </Fieldset.Root>
      </BaseCheckboxGroup>
    </CheckboxGroupContext.Provider>
  );
}

// Compound component
export const Checkbox = Object.assign(CheckboxBase, {
  Item: CheckboxItem,
  Group: CheckboxGroup,
  Legend: CheckboxLegend,
});

Checkbox.displayName = "Checkbox";
