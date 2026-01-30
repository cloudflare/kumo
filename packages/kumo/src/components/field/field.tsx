import { Field as FieldBase } from "@base-ui/react/field";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Label } from "../label";

export const KUMO_FIELD_VARIANTS = {
  // Field currently has no variant options but structure is ready for future additions
} as const;

export const KUMO_FIELD_DEFAULT_VARIANTS = {} as const;

// Derived types from KUMO_FIELD_VARIANTS
export interface KumoFieldVariantsProps {
  /**
   * When true, places the control (checkbox/switch) before the label visually.
   * When false (default), places the label before the control.
   * Used to support different layout patterns (e.g., iOS-style toggles on the right).
   */
  controlFirst?: boolean;
}

export function fieldVariants({
  controlFirst = false,
}: KumoFieldVariantsProps = {}) {
  return cn(
    // Base styles - vertical layout (default)
    "grid gap-2",

    // Horizontal layout for checkbox and switch
    // Default: Grid auto-reverses in RTL (desired)
    "has-[input[type=checkbox]]:grid-cols-[auto_1fr] has-[input[type=checkbox]]:items-center",
    "has-[[role=switch]]:grid-cols-[auto_1fr] has-[[role=switch]]:items-center",

    // Control first: use flexbox with row-reverse to flip visual order without affecting text direction
    // flex-row-reverse in LTR: Control→Label, in RTL: Label→Control (opposite of grid default)
    controlFirst && [
      "has-[input[type=checkbox]]:flex has-[input[type=checkbox]]:flex-row-reverse has-[input[type=checkbox]]:flex-wrap has-[input[type=checkbox]]:items-center",
      "has-[[role=switch]]:flex has-[[role=switch]]:flex-row-reverse has-[[role=switch]]:flex-wrap has-[[role=switch]]:items-center",
      "[&>label]:flex-1",
    ],
  );
}

/**
 * Match type for field validation errors.
 * Can be a boolean or a key from the browser's ValidityState interface.
 * Source: BaseErrorProps["match"] (ComponentPropsWithoutRef<typeof FieldBase.Error>)
 */
export type FieldErrorMatch =
  | boolean
  | "badInput"
  | "customError"
  | "patternMismatch"
  | "rangeOverflow"
  | "rangeUnderflow"
  | "stepMismatch"
  | "tooLong"
  | "tooShort"
  | "typeMismatch"
  | "valid"
  | "valueMissing";

export interface FieldProps extends KumoFieldVariantsProps {
  children: ReactNode;
  /** The label content - can be a string or any React node */
  label: ReactNode;
  /**
   * When explicitly false, shows gray "(optional)" text after the label.
   * When true or undefined, no indicator is shown.
   */
  required?: boolean;
  /** Tooltip content to display next to the label via an info icon */
  labelTooltip?: ReactNode;
  error?: {
    message: ReactNode;
    match: FieldErrorMatch;
  };
  description?: ReactNode;
  controlFirst?: boolean;
}

export function Field({
  children,
  label,
  required,
  labelTooltip,
  error,
  description,
  controlFirst = false,
}: FieldProps) {
  // Show "(optional)" when required is explicitly false
  const showOptional = required === false;

  return (
    <FieldBase.Root className={fieldVariants({ controlFirst })}>
      <FieldBase.Label className="text-base font-medium text-kumo-default">
        <Label showOptional={showOptional} tooltip={labelTooltip} asContent>
          {label}
        </Label>
      </FieldBase.Label>
      {children}
      {error ? (
        <FieldBase.Error
          className={cn(
            "text-sm text-kumo-danger",
            // Span full width in horizontal layout
            "col-span-full",
          )}
          match={error.match}
        >
          {error.message}
        </FieldBase.Error>
      ) : (
        description && (
          <FieldBase.Description
            className={cn(
              "text-sm leading-snug text-kumo-subtle",
              // Span full width in horizontal layout
              "col-span-full",
            )}
          >
            {description}
          </FieldBase.Description>
        )
      )}
    </FieldBase.Root>
  );
}
