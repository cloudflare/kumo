import { inputVariants } from "./input";
import { cn } from "../../utils/cn";
import { useCallback, type ReactNode } from "react";
import * as React from "react";
import { Field as FieldBase } from "@base-ui/react/field";
import { Field as KumoField, type FieldErrorMatch } from "../field/field";

export const InputArea = React.forwardRef<HTMLTextAreaElement, InputAreaProps>(
  (props, ref) => {
    const {
      className,
      onValueChange,
      size = "base",
      variant: variantProp,
      onChange,
      label,
      labelTooltip,
      description,
      error,
      ...inputProps
    } = props;

    // Deprecation warning for variant="error"
    if (process.env.NODE_ENV !== "production" && variantProp === "error") {
      console.warn(
        '[Kumo InputArea]: variant="error" is deprecated. ' +
          "Error styling is now automatically applied when the `error` prop is truthy. " +
          "Simply remove the variant prop and pass an error message instead.",
      );
    }

    // Auto-apply error styling when error prop is truthy
    // Explicit variant prop takes precedence for backwards compatibility
    const variant = variantProp ?? (error ? "error" : "default");

    // Extract required from inputProps to pass to Field for label decoration
    const { required } = inputProps;
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event);
        onValueChange?.(event.target.value);
      },
      [onChange, onValueChange],
    );

    const textareaClassName = cn(
      inputVariants({ size, variant, focusIndicator: true }),
      "h-auto py-2", // Input variant always comes with size, but it does not apply for textarea
      className,
    );

    // Render with Field wrapper if label is provided
    // Use FieldBase.Control with render callback to ensure proper label-textarea association.
    // The render callback receives props with the correct id/aria-labelledby from Field context.
    if (label) {
      return (
        <KumoField
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
          <FieldBase.Control
            render={(controlProps) => (
              <textarea
                {...controlProps}
                ref={ref}
                className={textareaClassName}
                onChange={handleChange}
                {...inputProps}
              />
            )}
          />
        </KumoField>
      );
    }

    // Render bare textarea without Field wrapper
    return (
      <textarea
        ref={ref}
        className={textareaClassName}
        onChange={handleChange}
        {...inputProps}
      />
    );
  },
);

InputArea.displayName = "InputArea";

/** Alias for InputArea — provided for discoverability when migrating from other libraries */
export const Textarea = InputArea;

/**
 * InputArea component props
 * @property {ReactNode} [label] - Label content for the textarea (enables Field wrapper)
 * @property {ReactNode} [description] - Helper text displayed below the textarea
 * @property {string | { message: ReactNode, match: FieldErrorMatch }} [error] - Error message or validation error object
 */
export type InputAreaProps = {
  onValueChange?: (value: string) => void;
  variant?: "default" | "error";
  size?: "xs" | "sm" | "base" | "lg";
  // Then other custom props
  children?: React.ReactNode;
  className?: string;
  /** Label content for the textarea (enables Field wrapper) - can be a string or any React node */
  label?: ReactNode;
  /** Tooltip content to display next to the label via an info icon */
  labelTooltip?: ReactNode;
  /** Helper text displayed below the textarea */
  description?: ReactNode;
  /** Error message or validation error object */
  error?: string | { message: ReactNode; match: FieldErrorMatch };

  // Finally, spread the native input props (least important)
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">;
