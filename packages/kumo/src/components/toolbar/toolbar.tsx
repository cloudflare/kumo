import React, { createContext, useContext } from "react";
import { cn } from "../../utils/cn";

export const KUMO_TOOLBAR_VARIANTS = {
  size: {
    xs: {
      classes: "text-xs",
      description: "Extra small toolbar for compact UIs",
    },
    sm: {
      classes: "text-xs",
      description: "Small toolbar for secondary controls",
    },
    base: {
      classes: "text-base",
      description: "Default toolbar size",
    },
    lg: {
      classes: "text-base",
      description: "Large toolbar for prominent controls",
    },
  },
} as const;

export const KUMO_TOOLBAR_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type ToolbarSize = keyof typeof KUMO_TOOLBAR_VARIANTS.size;

export interface ToolbarControlContextValue {
  size: ToolbarSize;
}

export interface ToolbarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Toolbar controls and non-control content rendered as one grouped card. */
  children: React.ReactNode;
  /** Locks every toolbar control to this size. */
  size?: ToolbarSize;
}

export interface ToolbarControlProps {
  /** Control element that should receive toolbar sizing and grouped styling. */
  render: React.ReactElement;
}

export const ToolbarControlContext = createContext<ToolbarControlContextValue | null>(
  null,
);

const ToolbarSizeContext = createContext<{ size: ToolbarSize }>({
  size: KUMO_TOOLBAR_DEFAULT_VARIANTS.size,
});

export function useToolbarControlContext() {
  return useContext(ToolbarControlContext);
}

export function toolbarControlClassName(className?: string) {
  return cn(
    "relative min-w-0 border-0 bg-transparent shadow-none ring-0 focus:z-2 focus-within:z-2 focus-visible:z-2",
    "rounded-none first:rounded-l-lg last:rounded-r-lg only:rounded-lg",
    "not-first:border-l not-first:border-kumo-line",
    "focus:ring-kumo-focus/50 focus:ring-[1.5px] focus-visible:ring-2 focus-visible:ring-kumo-brand",
    className,
  );
}

/**
 * Groups explicit toolbar controls into one compact card with shared sizing and
 * internal separators. Only controls rendered through `Toolbar.Control` receive
 * toolbar overrides.
 */
const Root = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      children,
      className,
      size = KUMO_TOOLBAR_DEFAULT_VARIANTS.size,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-kumo-component="Toolbar"
        className={cn(
          "inline-flex w-fit items-stretch rounded-lg ring ring-kumo-line bg-kumo-control shadow-xs",
          KUMO_TOOLBAR_VARIANTS.size[size].classes,
          className,
        )}
        {...props}
      >
        <ToolbarControlContext.Provider value={null}>
          {children}
        </ToolbarControlContext.Provider>
      </div>
    );
  },
);

Root.displayName = "Toolbar";

const Control = ({ render }: ToolbarControlProps) => {
  const toolbar = useContext(ToolbarSizeContext);

  return (
    <ToolbarControlContext.Provider value={{ size: toolbar.size }}>
      {render}
    </ToolbarControlContext.Provider>
  );
};

Control.displayName = "Toolbar.Control";

export const Toolbar = Object.assign(
  React.forwardRef<HTMLDivElement, ToolbarProps>(
    (
      {
        children,
        className,
        size = KUMO_TOOLBAR_DEFAULT_VARIANTS.size,
        ...props
      },
      ref,
    ) => {
      return (
        <ToolbarSizeContext.Provider value={{ size }}>
          <Root ref={ref} className={className} size={size} {...props}>
            {children}
          </Root>
        </ToolbarSizeContext.Provider>
      );
    },
  ),
  { Control },
);

Toolbar.displayName = "Toolbar";
