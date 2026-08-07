import { createContext, useContext } from "react";
import { cn } from "../../utils/cn";

export interface ToolbarControlContextValue {
  /** The root control is disabled and should be excluded from activation. */
  disabled: boolean;
  /** Whether a disabled control remains in the toolbar's roving focus order. */
  focusableWhenDisabled?: boolean;
}

const ToolbarControlContext = createContext<ToolbarControlContextValue | null>(
  null,
);

export const ToolbarControlProvider = ToolbarControlContext.Provider;

/** Returns adapter state only for controls rendered through a Toolbar wrapper. */
export function useToolbarControlContext() {
  return useContext(ToolbarControlContext);
}

/** Removes a standalone control surface when its Toolbar wrapper owns it. */
export function toolbarInnerControlClassName(className?: string) {
  return cn(
    "rounded-none border-0 bg-transparent shadow-none ring-0",
    "focus-within:ring-0 focus:ring-0 focus-visible:ring-0",
    className,
  );
}
