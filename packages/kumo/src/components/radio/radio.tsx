import { forwardRef, createContext, useContext, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Fieldset } from "@base-ui/react/fieldset";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";

/** Radio variant definitions mapping variant names to their Tailwind classes. */
export const KUMO_RADIO_VARIANTS = {
  variant: {
    default: {
      classes: "ring-kumo-line",
      description: "Default radio appearance",
    },
    error: {
      classes: "ring-kumo-danger",
      description: "Error state for validation failures",
    },
  },
  appearance: {
    default: {
      classes: "",
      description: "Standard inline radio item",
    },
    card: {
      classes:
        "rounded-lg border border-kumo-ring bg-kumo-base p-3 transition-colors hover:bg-kumo-tint has-[[data-checked]]:border-kumo-interact has-[[data-checked]]:bg-kumo-tint",
      description:
        "Choice card appearance with border, padding, and highlighted selection state",
    },
  },
} as const;

export const KUMO_RADIO_DEFAULT_VARIANTS = {
  variant: "default",
  appearance: "default",
} as const;

// Derived types from KUMO_RADIO_VARIANTS
export type KumoRadioVariant = keyof typeof KUMO_RADIO_VARIANTS.variant;
export type KumoRadioAppearance = keyof typeof KUMO_RADIO_VARIANTS.appearance;

export interface KumoRadioVariantsProps {
  /**
   * Visual variant.
   * - `"default"` — Standard radio appearance
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: KumoRadioVariant;
  /**
   * Visual appearance.
   * - `"default"` — Standard inline radio item
   * - `"card"` — Choice card with border, padding, and highlighted selection state
   * @default "default"
   */
  appearance?: KumoRadioAppearance;
}

export function radioVariants({
  variant = KUMO_RADIO_DEFAULT_VARIANTS.variant,
  appearance = KUMO_RADIO_DEFAULT_VARIANTS.appearance,
}: KumoRadioVariantsProps = {}) {
  return cn(
    KUMO_RADIO_VARIANTS.variant[variant].classes,
    KUMO_RADIO_VARIANTS.appearance[appearance].classes,
  );
}

// Legacy type alias for backwards compatibility
export type RadioVariant = KumoRadioVariant;

/** Position of the radio control relative to its label */
export type RadioControlPosition = "start" | "end";

// Context for passing controlPosition and appearance from Group to Items
const RadioGroupContext = createContext<{
  controlPosition: RadioControlPosition;
  appearance: KumoRadioAppearance;
}>({
  controlPosition: "start",
  appearance: "default",
});

/**
 * Radio group component props (with built-in Fieldset and RadioGroup)
 *
 * @example
 * // Basic usage
 * ```tsx
 * <Radio.Group legend="Notification preference" defaultValue="email">
 *   <Radio.Item label="Email" value="email" />
 *   <Radio.Item label="SMS" value="sms" />
 *   <Radio.Item label="Push" value="push" />
 * </Radio.Group>
 * ```
 *
 * @example
 * // Horizontal layout
 * ```tsx
 * <Radio.Group legend="Size" orientation="horizontal" defaultValue="md">
 *   <Radio.Item label="Small" value="sm" />
 *   <Radio.Item label="Medium" value="md" />
 *   <Radio.Item label="Large" value="lg" />
 * </Radio.Group>
 * ```
 *
 * @example
 * // With error and description
 * ```tsx
 * <Radio.Group
 *   legend="Payment method"
 *   error="Please select a payment method"
 *   description="Choose how you'd like to pay"
 * >
 *   <Radio.Item label="Credit Card" value="card" />
 *   <Radio.Item label="PayPal" value="paypal" />
 * </Radio.Group>
 * ```
 *
 * @example
 * // Controlled
 * ```tsx
 * const [value, setValue] = useState("email");
 * <Radio.Group legend="Contact" value={value} onValueChange={setValue}>
 *   <Radio.Item label="Email" value="email" />
 *   <Radio.Item label="Phone" value="phone" />
 * </Radio.Group>
 * ```
 *
 * @example
 * // Label before radio (controlPosition="end")
 * ```tsx
 * <Radio.Group legend="Options" controlPosition="end" defaultValue="a">
 *   <Radio.Item label="Option A" value="a" />
 *   <Radio.Item label="Option B" value="b" />
 * </Radio.Group>
 * ```
 */
export interface RadioGroupProps {
  /** Legend text for the group (required for accessibility) */
  legend: string;
  /** Child Radio.Item components */
  children: ReactNode;
  /** Layout direction of the radio items */
  orientation?: "vertical" | "horizontal";
  /**
   * Visual appearance applied to all Radio.Item children.
   * - `"default"` — Standard inline radio items
   * - `"card"` — Choice card with border, padding, and highlighted selection state
   *
   * Individual items can override this with their own `appearance` prop.
   * @default "default"
   */
  appearance?: KumoRadioAppearance;
  /** Error message for the group */
  error?: string;
  /** Helper text for the group */
  description?: ReactNode;
  /** Value of the radio that should be initially selected (uncontrolled) */
  defaultValue?: string;
  /** Value of the radio that should be selected (controlled) */
  value?: string;
  /** Event handler called when radio value changes */
  onValueChange?: (value: string) => void;
  /** Whether all radios in the group are disabled */
  disabled?: boolean;
  /** Position of radio control relative to label: "start" (default) puts radio before label, "end" puts label before radio. Note: In card appearance, the control is always positioned at the end. */
  controlPosition?: RadioControlPosition;
  /** Form submission name for the radio group */
  name?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Individual radio item within a group
 *
 * @example
 * ```tsx
 * <Radio.Item label="Option A" value="a" />
 * ```
 *
 * @example
 * // Disabled item
 * ```tsx
 * <Radio.Item label="Unavailable" value="unavailable" disabled />
 * ```
 */
export type RadioItemProps = {
  /** Visual variant: "default" or "error" for validation failures */
  variant?: RadioVariant;
  /**
   * Visual appearance of the radio item.
   * - `"default"` — Standard inline radio item
   * - `"card"` — Choice card with border, padding, and highlighted selection state
   *
   * When set on an individual item, overrides the group-level `appearance`.
   * @default "default"
   */
  appearance?: KumoRadioAppearance;
  /** Label text displayed next to radio (required) */
  label: string;
  /** Description text displayed below the label (only visible in card appearance) */
  description?: ReactNode;
  /** Value of the radio (required) */
  value: string;
  /** Additional CSS classes for the label wrapper */
  className?: string;
  /** Whether the radio is disabled */
  disabled?: boolean;
};

// Radio.Item for use within Radio.Group
const RadioItem = forwardRef<HTMLButtonElement, RadioItemProps>(
  (
    {
      className,
      disabled,
      variant = "default",
      appearance: appearanceProp,
      label,
      description,
      value,
    },
    ref,
  ) => {
    const { controlPosition, appearance: groupAppearance } =
      useContext(RadioGroupContext);
    const appearance = appearanceProp ?? groupAppearance;
    const isCard = appearance === "card";

    // In card mode, default to "end" (radio on the right); otherwise follow group setting
    const effectiveControlPosition = isCard ? "end" : controlPosition;

    if (isCard) {
      return (
        <label
          className={cn(
            "m-0 group relative flex items-start gap-3 rounded-lg border border-kumo-ring bg-kumo-base p-3 transition-colors has-[[data-checked]]:border-kumo-interact has-[[data-checked]]:bg-kumo-tint",
            variant === "error" &&
              "border-kumo-danger has-[[data-checked]]:border-kumo-danger has-[[data-checked]]:bg-kumo-base",
            disabled
              ? "cursor-not-allowed opacity-50"
              : cn(
                  "has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50 cursor-pointer",
                  variant !== "error" &&
                    "hover:not-has-[[data-disabled]]:bg-kumo-tint",
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
          <BaseRadio.Root
            ref={ref}
            value={value}
            disabled={disabled}
            className={cn(
              "relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-0 bg-kumo-base ring",
              variant === "error" ? "ring-kumo-danger" : "ring-kumo-line",
              !disabled &&
                variant !== "error" &&
                "group-hover:ring-kumo-ring focus-visible:ring-kumo-ring focus-visible:outline-offset-3",
              !disabled &&
                variant === "error" &&
                "focus-visible:ring-kumo-danger focus-visible:outline-offset-3",
              "data-[checked]:bg-kumo-contrast",
            )}
          >
            <BaseRadio.Indicator
              keepMounted
              className="flex items-center justify-center"
            >
              <span className="h-2 w-2 rounded-full bg-kumo-base" />
            </BaseRadio.Indicator>
          </BaseRadio.Root>
        </label>
      );
    }

    return (
      <label
        className={cn(
          "m-0 group relative inline-flex items-center gap-2",
          // "start" (default): radio before label
          // "end": label before radio using flex-row-reverse
          effectiveControlPosition === "end" && "flex-row-reverse justify-end",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className,
        )}
      >
        <BaseRadio.Root
          ref={ref}
          value={value}
          disabled={disabled}
          className={cn(
            "relative flex h-4 w-4 items-center justify-center rounded-full border-0 bg-kumo-base ring after:absolute after:-inset-x-3 after:-inset-y-2",
            variant === "error" ? "ring-kumo-danger" : "ring-kumo-line",
            !disabled &&
              variant !== "error" &&
              "group-hover:ring-kumo-ring focus-visible:ring-kumo-ring focus-visible:outline-offset-3",
            !disabled &&
              variant === "error" &&
              "focus-visible:ring-kumo-danger focus-visible:outline-offset-3",
            "data-[checked]:bg-kumo-contrast",
          )}
        >
          <BaseRadio.Indicator
            keepMounted
            className="flex items-center justify-center"
          >
            <span className="h-2 w-2 rounded-full bg-kumo-base" />
          </BaseRadio.Indicator>
        </BaseRadio.Root>
        <span className="text-base text-kumo-default">{label}</span>
      </label>
    );
  },
);

RadioItem.displayName = "Radio.Item";

// Radio.Group with built-in Fieldset and RadioGroup
function RadioGroup({
  legend,
  children,
  orientation = "vertical",
  appearance = "default",
  error,
  description,
  defaultValue,
  value,
  onValueChange,
  disabled,
  controlPosition = "start",
  name,
  className,
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ controlPosition, appearance }}>
      <BaseRadioGroup
        defaultValue={defaultValue}
        value={value}
        onValueChange={(newValue) => onValueChange?.(newValue)}
        disabled={disabled}
        name={name}
      >
        <Fieldset.Root
          disabled={disabled}
          className={cn("flex flex-col gap-4", className)}
        >
          <Fieldset.Legend className="text-base font-medium text-kumo-default">
            {legend}
          </Fieldset.Legend>
          <div
            className={cn(
              orientation === "vertical"
                ? cn("flex flex-col", appearance === "card" ? "gap-3" : "gap-2")
                : appearance === "card"
                  ? "grid grid-cols-2 gap-3"
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
      </BaseRadioGroup>
    </RadioGroupContext.Provider>
  );
}

RadioGroup.displayName = "Radio.Group";

// Export RadioGroup directly for external usage
export { RadioGroup };

/**
 * Radio — radio button group for single-select choices.
 *
 * Compound component: `Radio.Group` (with built-in Fieldset) and `Radio.Item`.
 * Built on `@base-ui/react/radio-group` + `@base-ui/react/radio`.
 *
 * @example
 * ```tsx
 * <Radio.Group legend="Notification preference" defaultValue="email">
 *   <Radio.Item label="Email" value="email" />
 *   <Radio.Item label="SMS" value="sms" />
 *   <Radio.Item label="Push" value="push" />
 * </Radio.Group>
 * ```
 */
export const Radio = Object.assign(RadioGroup, {
  Item: RadioItem,
  Group: RadioGroup,
});
