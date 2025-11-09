import React from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "../utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  description?: string;
}

export const inputClasses = cn(
  "flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border border-neutral-500 hover:opacity-90"
);

const selectedInputClasses =
  "dark:border-neutral-400 border-neutral-600 dark:bg-neutral-100 bg-neutral-900";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  checked?: boolean;
  label?: string;
  onValueChange?: (checked: boolean) => void;
};

export const Checkbox = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      checked,
      onValueChange,
      label,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <label
        className={cn(
          "inline-flex! m-0! items-center gap-2 cursor-pointer",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => {
            onValueChange?.(e.target.checked);
            onChange?.(e);
          }}
          {...props}
        />

        <div
          aria-hidden
          className={cn(
            inputClasses,
            checked ? selectedInputClasses : "",
            disabled && "opacity-75 cursor-not-allowed",
            className
          )}
        >
          {checked && (
            <CheckIcon
              size={12}
              weight="bold"
              className="m-auto text-neutral-100 dark:text-neutral-900"
            />
          )}
        </div>
        {label && (
          <span className="select-none" aria-hidden={false}>
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
