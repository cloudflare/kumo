import React, { createContext, useContext } from "react";
import { cn } from "../../utils/cn";

export const KUMO_CONTROL_GROUP_VARIANTS = {
  size: {
    xs: {
      classes: "text-xs",
      description: "Extra small control group for compact UIs",
    },
    sm: {
      classes: "text-xs",
      description: "Small control group for secondary controls",
    },
    base: {
      classes: "text-base",
      description: "Default control group size",
    },
    lg: {
      classes: "text-base",
      description: "Large control group for prominent controls",
    },
  },
} as const;

export const KUMO_CONTROL_GROUP_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type ControlGroupSize = keyof typeof KUMO_CONTROL_GROUP_VARIANTS.size;

export interface ControlGroupContextValue {
  size: ControlGroupSize;
}

export interface ControlGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Controls rendered as one grouped card. */
  children: React.ReactNode;
  /** Locks every child control to this size. */
  size?: ControlGroupSize;
}

export const ControlGroupContext = createContext<ControlGroupContextValue | null>(
  null,
);

export function useControlGroupContext() {
  return useContext(ControlGroupContext);
}

export function controlGroupItemClassName(className?: string) {
  return cn(
    "relative min-w-0 border-0 bg-transparent shadow-none ring-0 focus:z-2 focus-within:z-2 focus-visible:z-2",
    "rounded-none first:rounded-l-lg last:rounded-r-lg only:rounded-lg",
    "not-first:border-l not-first:border-kumo-line",
    "focus:ring-kumo-focus/50 focus:ring-[1.5px] focus-visible:ring-2 focus-visible:ring-kumo-brand",
    className,
  );
}

/**
 * Groups adjacent form controls into one compact card with shared sizing and
 * internal separators.
 */
export const ControlGroup = React.forwardRef<HTMLDivElement, ControlGroupProps>(
  (
    {
      children,
      className,
      size = KUMO_CONTROL_GROUP_DEFAULT_VARIANTS.size,
      ...props
    },
    ref,
  ) => {
    return (
      <ControlGroupContext.Provider value={{ size }}>
        <div
          ref={ref}
          data-kumo-component="ControlGroup"
          className={cn(
            "inline-flex w-fit items-stretch rounded-lg ring ring-kumo-line bg-kumo-control shadow-xs",
            KUMO_CONTROL_GROUP_VARIANTS.size[size].classes,
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </ControlGroupContext.Provider>
    );
  },
);

ControlGroup.displayName = "ControlGroup";
