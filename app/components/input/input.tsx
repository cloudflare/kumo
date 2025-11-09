import { cn } from "../utils";
import { forwardRef, type ComponentPropsWithoutRef, useId } from "react";
import { Input as BaseInput } from "@base-ui-components/react/input";

interface KumoInputVariantsProps {
  variant?: "default" | "error";
  size?: "xs" | "sm" | "base" | "lg";
  parentFocusIndicator?: boolean;
  focusIndicator?: boolean;
}

// Omit native `size` attribute (number) to avoid conflict with our custom `size` variant
type BaseInputProps = Omit<ComponentPropsWithoutRef<typeof BaseInput>, "size">;

const sizeStyles = {
  xs: "h-5 gap-1 rounded-sm px-1.5 text-xs",
  sm: "h-6.5 gap-1 rounded-md px-2 text-xs",
  base: "h-9 gap-1.5 rounded-lg px-3 text-base",
  lg: "h-10 gap-2 rounded-lg px-4 text-base",
};

const variantStyles = {
  default: "focus:ring-active",
  error: "!ring-destructive focus:ring-destructive",
};

export function inputVariants({
  variant = "default",
  size = "base",
  parentFocusIndicator = false,
  focusIndicator = false,
}: KumoInputVariantsProps = {}) {
  return cn(
    // Base styles
    "bg-surface dark:bg-neutral-900 ring ring-neutral-950/10 dark:ring-neutral-800 text-surface",
    // Disabled state and placeholder styles
    "placeholder:text-muted disabled:text-muted outline-none",
    // Apply size styles
    sizeStyles[size],
    // Apply variant styles
    variantStyles[variant],
    // Focus state handling
    parentFocusIndicator && "[&:has(:focus-within)]:ring-active",
    focusIndicator && "focus:ring-active"
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    className,
    size = "base",
    variant = "default",
    label,
    hideLabel = true,
    id,
    ...inputProps
  } = props;
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <>
      {label && (
        <label
          htmlFor={inputId}
          className={hideLabel ? "sr-only" : "block text-sm font-medium text-surface"}
        >
          {label}
        </label>
      )}
      <BaseInput
        ref={ref}
        id={inputId}
        className={cn(
          inputVariants({ size, variant, focusIndicator: true }),
          className
        )}
        {...inputProps}
      />
    </>
  );
});

Input.displayName = "Input";

export type InputProps = Pick<KumoInputVariantsProps, "size" | "variant"> &
  BaseInputProps & {
    label?: string;
    hideLabel?: boolean;
  };
