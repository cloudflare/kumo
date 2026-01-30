import { forwardRef, createContext, useContext, type ReactNode } from "react";
import { CheckIcon, MinusIcon } from "@phosphor-icons/react";
import { cn } from "../../utils/cn";
import { Label } from "../label";
import { Fieldset } from "@base-ui/react/fieldset";
import { Field as FieldBase } from "@base-ui/react/field";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import {
  Checkbox as BaseCheckbox,
  type CheckboxRootChangeEventDetails,
} from "@base-ui/react/checkbox";

export const KUMO_CHECKBOX_VARIANTS = {
  variant: {
    default: {
      classes: "[&:focus-within>span]:ring-kumo-ring [&:hover>span]:ring-kumo-ring",
      description: "Default checkbox appearance",
    },
    error: {
      classes: "[&>span]:ring-kumo-danger",
      description: "Error state for validation failures",
    },
  },
} as const;

export const KUMO_CHECKBOX_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

// Derived types from KUMO_CHECKBOX_VARIANTS
export type KumoCheckboxVariant = keyof typeof KUMO_CHECKBOX_VARIANTS.variant;

export interface KumoCheckboxVariantsProps {
  variant?: KumoCheckboxVariant;
}

export function checkboxVariants({
  variant = KUMO_CHECKBOX_DEFAULT_VARIANTS.variant,
}: KumoCheckboxVariantsProps = {}) {
  return cn(KUMO_CHECKBOX_VARIANTS.variant[variant].classes);
}

// Legacy type alias for backwards compatibility
export type CheckboxVariant = KumoCheckboxVariant;

// Context for passing controlFirst from Group to Items
const CheckboxGroupContext = createContext<{ controlFirst: boolean }>({
  controlFirst: true,
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
  onCheckedChange?: (checked: boolean) => void;
  /** @deprecated Use onCheckedChange instead */
  onValueChange?: (checked: boolean) => void;
  /** @deprecated Use onCheckedChange instead */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
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
export interface CheckboxGroupProps {
  /** Legend text for the group */
  legend: string;
  /** Child Checkbox.Item components */
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
  /** When true (default), checkbox appears before label. When false, label appears before checkbox. */
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
  /** Label text displayed next to checkbox */
  label: string;
  /** Value of the checkbox (required when used in Checkbox.Group) */
  value?: string;
  /** Additional CSS classes for the label wrapper */
  className?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  /** Callback when the checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** @deprecated Use onCheckedChange instead */
  onValueChange?: (checked: boolean) => void;
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
      onValueChange,
      onChange,
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

    // Handle onCheckedChange (preferred) and deprecated onValueChange/onChange
    const handleCheckedChange = (
      newChecked: boolean,
      eventDetails: CheckboxRootChangeEventDetails,
    ) => {
      onCheckedChange?.(newChecked);
      onValueChange?.(newChecked);
      if (onChange) {
        // Backwards compatibility: extend native event with target.checked
        // so existing code using `e.target.checked` continues to work
        const event = Object.assign(eventDetails.event, {
          target: { checked: newChecked },
        });
        onChange(event as never);
      }
    };

    const checkboxControl = (
      <BaseCheckbox.Root
        ref={ref}
        name={name}
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-sm border-0 bg-kumo-base ring",
          variant === "error" ? "ring-kumo-danger" : "ring-kumo-line",
          !disabled && "hover:ring-kumo-ring focus-visible:ring-kumo-ring",
          "data-[checked]:bg-kumo-contrast data-[indeterminate]:bg-kumo-contrast",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...props}
      >
        <BaseCheckbox.Indicator
          className="flex items-center justify-center text-kumo-inverse"
          render={(renderProps, state) => {
            const Icon = state.indeterminate ? MinusIcon : CheckIcon;
            return (
              <span {...renderProps}>
                {(state.checked || state.indeterminate) && (
                  <Icon weight="bold" size={12} />
                )}
              </span>
            );
          }}
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
            "inline-flex items-center gap-2",
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
      label,
      value,
      onCheckedChange,
      onValueChange,
      name,
    },
    ref,
  ) => {
    const { controlFirst } = useContext(CheckboxGroupContext);

    // Handle onCheckedChange (preferred) and deprecated onValueChange
    const handleCheckedChange = (newChecked: boolean) => {
      onCheckedChange?.(newChecked);
      onValueChange?.(newChecked);
    };

    return (
      <label
        className={cn(
          "relative inline-flex items-center gap-2",
          // Control first (default): checkbox before label
          // Label first: label before checkbox using flex-row-reverse
          !controlFirst && "flex-row-reverse justify-end",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className,
        )}
      >
        <BaseCheckbox.Root
          ref={ref}
          value={value}
          name={name}
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
          onCheckedChange={handleCheckedChange}
          className={cn(
            "peer flex h-4 w-4 items-center justify-center rounded-sm border-0 bg-kumo-base ring",
            variant === "error" ? "ring-kumo-danger" : "ring-kumo-line",
            !disabled &&
              "group-hover:ring-kumo-ring hover:ring-kumo-ring focus-visible:ring-kumo-ring",
            "data-[checked]:bg-kumo-contrast data-[indeterminate]:bg-kumo-contrast",
          )}
        >
          <BaseCheckbox.Indicator
            className="flex items-center justify-center text-kumo-inverse"
            render={(props, state) => {
              const Icon = state.indeterminate ? MinusIcon : CheckIcon;
              return (
                <span {...props}>
                  {(state.checked || state.indeterminate) && (
                    <Icon weight="bold" size={12} />
                  )}
                </span>
              );
            }}
          />
        </BaseCheckbox.Root>
        <span className="text-base font-medium text-kumo-default">{label}</span>
      </label>
    );
  },
);

CheckboxItem.displayName = "Checkbox.Item";

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
  controlFirst = true,
  className,
}: CheckboxGroupProps) {
  return (
    <CheckboxGroupContext.Provider value={{ controlFirst }}>
      <BaseCheckboxGroup
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        allValues={allValues}
        disabled={disabled}
      >
        <Fieldset.Root
          className={cn(
            "flex flex-col gap-4 rounded-lg border border-kumo-line p-4",
            className,
          )}
        >
          <Fieldset.Legend className="text-lg font-medium text-kumo-default">
            {legend}
          </Fieldset.Legend>
          <div className="flex flex-col gap-2">{children}</div>
          {error && <p className="text-sm text-kumo-danger">{error}</p>}
          {description && <p className="text-sm text-kumo-subtle">{description}</p>}
        </Fieldset.Root>
      </BaseCheckboxGroup>
    </CheckboxGroupContext.Provider>
  );
}

// Compound component
export const Checkbox = Object.assign(CheckboxBase, {
  Item: CheckboxItem,
  Group: CheckboxGroup,
});

Checkbox.displayName = "Checkbox";
