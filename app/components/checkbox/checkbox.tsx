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

export const Checkbox = ({
  className,
  checked,
  onValueChange,
  size,
  label,
  ...props
}: InputProps) => {
  return (
    <label className="!inline-flex !m-0 items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={(e) => {
          onValueChange?.(e.target.checked);
        }}
      />

      <div
        className={cn(
          inputClasses,
          checked ? selectedInputClasses : "",
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
      {label && <span className="select-none">{label}</span>}
    </label>
  );
};

Checkbox.displayName = "Checkbox";
