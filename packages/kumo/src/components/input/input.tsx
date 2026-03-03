import { cn } from "../../utils/cn";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { Field, type FieldErrorMatch } from "../field/field";

/** Input size and variant definitions mapping names to their Tailwind classes. */
export const KUMO_INPUT_VARIANTS = {
  size: {
    xs: {
      classes: "h-5 gap-1 rounded-sm px-1.5 text-xs",
      description: "Extra small input for compact UIs",
    },
    sm: {
      classes: "h-6.5 gap-1 rounded-md px-2 text-xs",
      description: "Small input for secondary fields",
    },
    base: {
      classes: "h-9 gap-1.5 rounded-lg px-3 text-base",
      description: "Default input size",
    },
    lg: {
      classes: "h-10 gap-2 rounded-lg px-4 text-base",
      description: "Large input for prominent fields",
    },
  },
  variant: {
    default: {
      classes: "focus:ring-kumo-ring",
      description: "Default input appearance",
    },
    error: {
      classes: "!ring-kumo-danger focus:ring-kumo-danger",
      description: "Error state for validation failures",
    },
  },
} as const;

export const KUMO_INPUT_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

export const KUMO_INPUT_STYLING = {
  dimensions: {
    xs: { height: 20, paddingX: 6, fontSize: 12, borderRadius: 2, width: 160 },
    sm: { height: 26, paddingX: 8, fontSize: 12, borderRadius: 6, width: 200 },
    base: {
      height: 36,
      paddingX: 12,
      fontSize: 16,
      borderRadius: 8,
      width: 280,
    },
    lg: { height: 40, paddingX: 16, fontSize: 16, borderRadius: 8, width: 320 },
  },
  baseTokens: {
    background: "color-secondary",
    text: "text-color-surface",
    placeholder: "text-color-muted",
    ring: "color-border",
  },
  stateTokens: {
    focus: { ring: "color-active" },
    error: { ring: "color-error" },
    disabled: { opacity: 0.5, text: "text-color-muted" },
  },
} as const;

// Derived types from KUMO_INPUT_VARIANTS
export type KumoInputSize = keyof typeof KUMO_INPUT_VARIANTS.size;
export type KumoInputVariant = keyof typeof KUMO_INPUT_VARIANTS.variant;

export interface KumoInputVariantsProps {
  /**
   * Input size.
   * - `"xs"` — Extra small for compact UIs
   * - `"sm"` — Small for secondary fields
   * - `"base"` — Default size
   * - `"lg"` — Large for prominent fields
   * @default "base"
   */
  size?: KumoInputSize;
  /**
   * Visual variant.
   * - `"default"` — Standard input
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: KumoInputVariant;
  parentFocusIndicator?: boolean;
  focusIndicator?: boolean;
}

// Omit native `size` attribute (number) to avoid conflict with our custom `size` variant
type BaseInputProps = Omit<ComponentPropsWithoutRef<typeof BaseInput>, "size">;

export function inputVariants({
  variant = KUMO_INPUT_DEFAULT_VARIANTS.variant,
  size = KUMO_INPUT_DEFAULT_VARIANTS.size,
  parentFocusIndicator = false,
  focusIndicator = false,
}: KumoInputVariantsProps = {}) {
  return cn(
    // Base styles
    "border-0 bg-kumo-control text-kumo-default ring ring-kumo-line",
    // Disabled state and placeholder styles
    "outline-none placeholder:text-kumo-subtle disabled:text-kumo-subtle",
    // Apply size styles from KUMO_INPUT_VARIANTS
    KUMO_INPUT_VARIANTS.size[size].classes,
    // Apply variant styles from KUMO_INPUT_VARIANTS
    KUMO_INPUT_VARIANTS.variant[variant].classes,
    // Focus state handling
    parentFocusIndicator && "[&:has(:focus-within)]:ring-kumo-ring",
    focusIndicator && "focus:ring-kumo-ring",
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    className,
    size = "base",
    variant = "default",
    label,
    labelTooltip,
    description,
    error,
    ...inputProps
  } = props;

  // Extract required from inputProps to pass to Field for label decoration
  const { required } = inputProps;

  // A11y enforcement: warn in dev if no accessible name provided
  if (process.env.NODE_ENV !== "production") {
    const hasLabel = Boolean(label);
    const hasPlaceholderAndAriaLabel = Boolean(
      inputProps.placeholder && inputProps["aria-label"],
    );
    const hasAriaLabelledBy = Boolean(inputProps["aria-labelledby"]);

    if (!hasLabel && !hasPlaceholderAndAriaLabel && !hasAriaLabelledBy) {
      console.warn(
        "[Kumo Input]: Input must have an accessible name. Provide either:\n" +
          "  - label prop: <Input label='Email' />\n" +
          "  - placeholder + aria-label: <Input placeholder='Email' aria-label='Email address' />\n" +
          "  - aria-labelledby for custom label association",
      );
    }
  }

  const input = (
    <BaseInput
      ref={ref}
      className={cn(
        inputVariants({ size, variant, focusIndicator: true }),
        className,
      )}
      {...inputProps}
    />
  );

  // Render with Field wrapper if label is provided
  if (label) {
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
        {input}
      </Field>
    );
  }

  // Render bare input without Field wrapper
  return input;
});

Input.displayName = "Input";

/**
 * Input component props with accessibility guidance.
 *
 * **Accessible Name Required:** Input should have one of:
 * 1. `label` prop (recommended) - enables Field wrapper with label/description/error
 * 2. `placeholder` + `aria-label` - for bare inputs with visual placeholder
 * 3. `aria-labelledby` - for custom label association
 *
 * Missing accessible names will trigger console warnings in development.
 *
 * @example
 * // Recommended: Built-in Field wrapper
 * <Input label="Email" placeholder="you@example.com" />
 *
 * @example
 * // Bare input with placeholder and aria-label
 * <Input placeholder="Search..." aria-label="Search products" />
 *
 * @example
 * // Custom label association
 * <label id="email-label">Email</label>
 * <Input aria-labelledby="email-label" />
 *
 * @example
 * // With description and error
 * <Input
 *   label="Password"
 *   description="Must be at least 8 characters"
 *   error="Password is too short"
 *   variant="error"
 * />
 */
export type InputProps = Pick<KumoInputVariantsProps, "size" | "variant"> &
  BaseInputProps & {
    /** Label content for the input (enables Field wrapper) - can be a string or any React node */
    label?: ReactNode;
    /** Tooltip content to display next to the label via an info icon */
    labelTooltip?: ReactNode;
    /** Helper text displayed below the input */
    description?: ReactNode;
    /** Error message or validation error object */
    error?: string | { message: ReactNode; match: FieldErrorMatch };
  };
