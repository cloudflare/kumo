import { Switch as BaseSwitch } from "@base-ui/react/switch";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type Ref,
  type ReactNode,
  createContext,
  useContext,
} from "react";
import { cn } from "../../utils/cn";
import { Field } from "../field/field";
import { Fieldset } from "@base-ui/react/fieldset";

/** Switch size and variant definitions mapping names to their Tailwind classes. */
export const KUMO_SWITCH_VARIANTS = {
  size: {
    sm: {
      classes: "h-5.5 w-8.5",
      description: "Small switch for compact UIs",
    },
    base: {
      classes: "h-6.5 w-10.5",
      description: "Default switch size",
    },
    lg: {
      classes: "h-7.5 w-12.5",
      description: "Large switch for prominent toggles",
    },
  },
  variant: {
    default: {
      classes: "",
      description: "Default switch appearance",
    },
    error: {
      classes: "ring-kumo-danger",
      description: "Error state for validation failures",
    },
  },
} as const;

export const KUMO_SWITCH_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

// Derived types from KUMO_SWITCH_VARIANTS
export type KumoSwitchSize = keyof typeof KUMO_SWITCH_VARIANTS.size;
export type KumoSwitchVariant = keyof typeof KUMO_SWITCH_VARIANTS.variant;

export interface KumoSwitchVariantsProps {
  /**
   * Switch size.
   * - `"sm"` — Small for compact UIs
   * - `"base"` — Default size
   * - `"lg"` — Large for prominent toggles
   * @default "base"
   */
  size?: KumoSwitchSize;
  /**
   * Visual variant.
   * - `"default"` — Standard switch appearance
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: KumoSwitchVariant;
}

export function switchVariants({
  size = KUMO_SWITCH_DEFAULT_VARIANTS.size,
  variant = KUMO_SWITCH_DEFAULT_VARIANTS.variant,
}: KumoSwitchVariantsProps = {}) {
  return cn(
    KUMO_SWITCH_VARIANTS.size[size].classes,
    KUMO_SWITCH_VARIANTS.variant[variant].classes,
  );
}

// Legacy type aliases for backwards compatibility
export type SwitchSize = KumoSwitchSize;
export type SwitchVariant = KumoSwitchVariant;

// Context for passing controlFirst from Group to Items
const SwitchGroupContext = createContext<{ controlFirst: boolean }>({
  controlFirst: true,
});

/**
 * Single switch component props (with built-in Field)
 *
 * Usage patterns:
 *
 * Basic usage:
 * ```tsx
 * <Switch label="Enable notifications" checked={true} onCheckedChange={setChecked} />
 * ```
 *
 * Label first layout:
 * ```tsx
 * <Switch label="Dark mode" checked={false} onCheckedChange={setChecked} controlFirst={false} />
 * ```
 *
 * Error variant (visual only, no error text):
 * ```tsx
 * <Switch label="Required setting" variant="error" checked={false} onCheckedChange={setChecked} />
 * ```
 *
 * @property {string} label - Label text for the switch (Field wrapper is built-in)
 * @property {boolean} [controlFirst] - When true (default), switch appears before label
 */
export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** Visual variant: "default" or "error" for validation failures (visual only, no error text) */
  variant?: SwitchVariant;
  /** Label content for the switch (Field wrapper is built-in) - can be a string or any React node. Optional when used standalone for visual-only purposes. */
  label?: ReactNode;
  /** Tooltip content to display next to the label via an info icon */
  labelTooltip?: ReactNode;
  /**
   * Whether the switch is required.
   * When explicitly false, shows "(optional)" text after the label.
   */
  required?: boolean;
  /** When true (default), switch appears before label. When false, label appears before switch. */
  controlFirst?: boolean;
  size?: KumoSwitchSize;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  transitioning?: boolean;
};

/**
 * Switch group component props (with built-in Fieldset)
 *
 * Usage:
 * ```tsx
 * <Switch.Group
 *   legend="Notification settings"
 *   error="You must enable at least one notification type"
 * >
 *   <Switch.Item label="Email notifications" value="email" />
 *   <Switch.Item label="SMS notifications" value="sms" />
 * </Switch.Group>
 * ```
 */
export interface SwitchGroupProps {
  /** Legend text for the group */
  legend: string;
  /** Child Switch.Item components */
  children: ReactNode;
  /** Error message for the group (only appears in groups, not single switches) */
  error?: string;
  /** Helper text for the group */
  description?: ReactNode;
  /** Whether all switches in the group are disabled */
  disabled?: boolean;
  /** When true (default), switch appears before label. When false, label appears before switch. */
  controlFirst?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Individual switch item within a group
 */
export type SwitchItemProps = {
  /** Visual variant: "default" or "error" for validation failures */
  variant?: SwitchVariant;
  /** Label text displayed next to switch */
  label: string;
  /** Additional CSS classes for the label wrapper */
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: KumoSwitchSize;
  transitioning?: boolean;
};

// Single switch with built-in Field
const SwitchBase = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      disabled,
      size = "base",
      variant = "default",
      label,
      labelTooltip,
      required,
      controlFirst = true,
      onCheckedChange,
      transitioning,
      ...props
    },
    ref,
  ) => {
    // For aria-label, only use string labels (ReactNode labels can't be used for aria-label)
    const ariaLabelFallback = typeof label === "string" ? label : "Switch";
    const switchControl = (
      <BaseSwitch.Root
        ref={ref}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        nativeButton
        render={(rootProps, state) => {
          const {
            ref: rootRef,
            className: baseClassName,
            role: baseRole,
            "aria-checked": _ariaChecked,
            "aria-pressed": _ariaPressed,
            ...restRootProps
          } = rootProps as typeof rootProps & {
            ref?: Ref<HTMLButtonElement>;
            className?: string;
            role?: string;
            "aria-checked"?: boolean;
            "aria-pressed"?: boolean;
          };

          const mergedClassName = cn(
            "interactive flex items-center gap-2 rounded-full border border-transparent bg-kumo-recessed p-1 transition-colors",
            switchVariants({ size, variant }),
            {
              "bg-kumo-brand": state.checked && !disabled && variant !== "error",
              "bg-kumo-danger": state.checked && !disabled && variant === "error",
              "hover:bg-kumo-brand-hover":
                state.checked &&
                !transitioning &&
                !disabled &&
                variant !== "error",
              "hover:bg-kumo-danger/90":
                state.checked &&
                !transitioning &&
                !disabled &&
                variant === "error",
              "hover:bg-kumo-interact": !state.checked && !transitioning && !disabled,
              "cursor-not-allowed opacity-50": disabled,
            },
            transitioning ? "cursor-wait" : !disabled ? "cursor-pointer" : "",
            className,
            baseClassName,
          );

          const role =
            (props.role as string | undefined) ?? baseRole ?? "switch";
          const checkedA11yProps =
            role === "switch"
              ? { "aria-checked": state.checked }
              : { "aria-pressed": state.checked };

          return (
            <button
              {...restRootProps}
              {...props}
              ref={rootRef}
              type="button"
              role={role}
              {...checkedA11yProps}
              aria-busy={transitioning || undefined}
              aria-label={props["aria-label"] ?? ariaLabelFallback}
              className={mergedClassName}
            >
              <BaseSwitch.Thumb
                className={cn(
                  "pointer-events-none aspect-square h-full rounded-full bg-white transition-all",
                  {
                    "translate-x-full rtl:translate-x-[-100%]": state.checked,
                  },
                )}
              />
            </button>
          );
        }}
      />
    );

    // Wrap in Field (built-in) - no description for single switches
    // If no label provided, return bare switch (for use in other components)
    if (!label) {
      return switchControl;
    }

    return (
      <Field
        label={label}
        required={required}
        labelTooltip={labelTooltip}
        controlFirst={controlFirst}
      >
        {switchControl}
      </Field>
    );
  },
);

SwitchBase.displayName = "Switch";

// Switch.Item for use within Switch.Group
const SwitchItem = forwardRef<HTMLButtonElement, SwitchItemProps>(
  (
    {
      className,
      checked,
      disabled,
      size = "base",
      variant = "default",
      label,
      onCheckedChange,
      transitioning,
    },
    ref,
  ) => {
    const { controlFirst } = useContext(SwitchGroupContext);

    return (
      <label
        className={cn(
          "relative inline-flex items-center gap-2",
          // Control first (default): switch before label
          // Label first: label before switch using flex-row-reverse
          !controlFirst && "flex-row-reverse justify-end",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className,
        )}
      >
        <BaseSwitch.Root
          ref={ref}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
          nativeButton
          render={(rootProps, state) => {
            const {
              ref: rootRef,
              className: baseClassName,
              role: baseRole,
              "aria-checked": _ariaChecked,
              "aria-pressed": _ariaPressed,
              ...restRootProps
            } = rootProps as typeof rootProps & {
              ref?: Ref<HTMLButtonElement>;
              className?: string;
              role?: string;
              "aria-checked"?: boolean;
              "aria-pressed"?: boolean;
            };

            const mergedClassName = cn(
              "interactive flex items-center gap-2 rounded-full border border-transparent bg-kumo-recessed p-1 transition-colors",
              switchVariants({ size, variant }),
              {
                "bg-kumo-brand": state.checked && !disabled && variant !== "error",
                "bg-kumo-danger": state.checked && !disabled && variant === "error",
                "hover:bg-kumo-brand-hover":
                  state.checked &&
                  !transitioning &&
                  !disabled &&
                  variant !== "error",
                "hover:bg-kumo-danger/90":
                  state.checked &&
                  !transitioning &&
                  !disabled &&
                  variant === "error",
                "hover:bg-kumo-interact": !state.checked && !transitioning && !disabled,
                "cursor-not-allowed opacity-50": disabled,
              },
              transitioning ? "cursor-wait" : !disabled ? "cursor-pointer" : "",
              baseClassName,
            );

            const role = baseRole ?? "switch";
            const checkedA11yProps =
              role === "switch"
                ? { "aria-checked": state.checked }
                : { "aria-pressed": state.checked };

            return (
              <button
                {...restRootProps}
                ref={rootRef}
                type="button"
                role={role}
                {...checkedA11yProps}
                aria-busy={transitioning || undefined}
                className={mergedClassName}
              >
                <BaseSwitch.Thumb
                  className={cn(
                    "pointer-events-none aspect-square h-full rounded-full bg-white transition-all",
                    {
                      "translate-x-full rtl:translate-x-[-100%]": state.checked,
                    },
                  )}
                />
              </button>
            );
          }}
        />
        <span className="text-base font-medium text-kumo-default">{label}</span>
      </label>
    );
  },
);

SwitchItem.displayName = "Switch.Item";

// Switch.Group with built-in Fieldset
function SwitchGroup({
  legend,
  children,
  error,
  description,
  disabled,
  controlFirst = true,
  className,
}: SwitchGroupProps) {
  return (
    <SwitchGroupContext.Provider value={{ controlFirst }}>
      <Fieldset.Root
        className={cn(
          "flex flex-col gap-4 rounded-lg border border-kumo-line p-4",
          className,
        )}
        disabled={disabled}
      >
        <Fieldset.Legend className="text-lg font-medium text-kumo-default">
          {legend}
        </Fieldset.Legend>
        <div className="flex flex-col gap-2">{children}</div>
        {error && <p className="text-sm text-kumo-danger">{error}</p>}
        {description && <p className="text-sm text-kumo-subtle">{description}</p>}
      </Fieldset.Root>
    </SwitchGroupContext.Provider>
  );
}

// Compound component
export const Switch = Object.assign(SwitchBase, {
  Item: SwitchItem,
  Group: SwitchGroup,
});

Switch.displayName = "Switch";
