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
      classes: "ring-destructive",
      description: "Error state for validation failures",
    },
  },
} as const;

export const KUMO_RADIO_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

// Derived types from KUMO_RADIO_VARIANTS
export type KumoRadioVariant = keyof typeof KUMO_RADIO_VARIANTS.variant;

export interface KumoRadioVariantsProps {
  /**
   * Visual variant.
   * - `"default"` — Standard radio appearance
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: KumoRadioVariant;
}

export function radioVariants({
  variant = KUMO_RADIO_DEFAULT_VARIANTS.variant,
}: KumoRadioVariantsProps = {}) {
  return cn(KUMO_RADIO_VARIANTS.variant[variant].classes);
}

// Legacy type alias for backwards compatibility
export type RadioVariant = KumoRadioVariant;

/** Position of the radio control relative to its label */
export type RadioControlPosition = "start" | "end";

// Context for passing controlPosition from Group to Items
const RadioGroupContext = createContext<{
  controlPosition: RadioControlPosition;
}>({
  controlPosition: "start",
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
  /** Position of radio control relative to label: "start" (default) puts radio before label, "end" puts label before radio */
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
  /** Label text displayed next to radio (required) */
  label: string;
  /** Value of the radio (required) */
  value: string;
  /** Additional CSS classes for the label wrapper */
  className?: string;
  /** Whether the radio is disabled */
  disabled?: boolean;
};

// Radio.Item for use within Radio.Group
const RadioItem = forwardRef<HTMLButtonElement, RadioItemProps>(
  ({ className, disabled, variant = "default", label, value }, ref) => {
    const { controlPosition } = useContext(RadioGroupContext);

    return (
      <label
        className={cn(
          "group relative inline-flex items-center gap-2",
          // "start" (default): radio before label
          // "end": label before radio using flex-row-reverse
          controlPosition === "end" && "flex-row-reverse justify-end",
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
              "group-hover:ring-kumo-ring focus-visible:ring-kumo-ring focus-visible:outline-offset-3",
            "data-checked:bg-kumo-contrast",
          )}
        >
          <BaseRadio.Indicator className="flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-kumo-base" />
          </BaseRadio.Indicator>
        </BaseRadio.Root>
        <span className="text-base font-medium text-kumo-default">{label}</span>
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
    <RadioGroupContext.Provider value={{ controlPosition }}>
      <BaseRadioGroup
        defaultValue={defaultValue}
        value={value}
        onValueChange={(newValue) => onValueChange?.(newValue as string)}
        disabled={disabled}
        name={name}
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
          <div
            className={cn(
              "flex gap-2",
              orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
            )}
          >
            {children}
          </div>
          {error && <p className="text-sm text-kumo-danger">{error}</p>}
          {description && <p className="text-sm text-kumo-subtle">{description}</p>}
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
export const Radio = {
  Item: RadioItem,
  Group: RadioGroup,
};
