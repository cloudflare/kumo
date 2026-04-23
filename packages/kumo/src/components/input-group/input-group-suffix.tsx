import { forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useInputGroupContext, INPUT_GROUP_SIZE } from "./context";

export interface InputGroupSuffixProps {
  /** Additional CSS classes. */
  className?: string;
  /** Suffix content (e.g., ".workers.dev"). */
  children?: ReactNode;
}

/**
 * Inline suffix that flows seamlessly next to the typed input value.
 * Input width adjusts automatically via CSS `field-sizing: content`.
 */
export const Suffix = forwardRef<HTMLDivElement, InputGroupSuffixProps>(
  ({ className, children }, ref) => {
    const context = useInputGroupContext("Suffix");

    const size = context?.size ?? "base";
    const tokens = INPUT_GROUP_SIZE[size];

    return (
      <div
        ref={ref}
        data-slot="input-group-suffix"
        className={cn(
          "pointer-events-none flex min-w-0 grow select-none items-center text-kumo-subtle",
          tokens.fontSize,
          tokens.suffixPad,
          className,
        )}
      >
        <span className="truncate">{children}</span>
      </div>
    );
  },
);
Suffix.displayName = "InputGroup.Suffix";
