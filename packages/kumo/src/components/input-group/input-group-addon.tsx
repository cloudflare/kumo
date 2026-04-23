import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import {
  useInputGroupContext,
  INPUT_GROUP_SIZE,
  InputGroupAddonContext,
} from "./context";
import { Button } from "./input-group-button";

export interface InputGroupAddonProps {
  /** Position relative to the input. @default "start" */
  align?: "start" | "end";
  /** Additional CSS classes. */
  className?: string;
  /** Addon content: icons, buttons, spinners, text. */
  children?: ReactNode;
}

/**
 * Container for icons, text, or compact buttons positioned at the start or end
 * of the input. Automatically sizes icon children to match the input size.
 */
export const Addon = forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ align = "start", className, children }, ref) => {
    const context = useInputGroupContext("Addon");

    const size = context?.size ?? "base";
    const tokens = INPUT_GROUP_SIZE[size];

    // Inject size into direct icon children that don't already have one set.
    // Skips buttons (which have their own size handling) and non-element nodes.
    // Also tracks whether a Button is present so we can reduce outer padding.
    let containsButton = false;
    const sizedChildren = Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      if (child.type === Button) {
        containsButton = true;
        return child;
      }
      const props = child.props as { size?: unknown };
      if (props.size !== undefined) return child;
      return cloneElement(child as ReactElement<{ size?: number }>, {
        size: tokens.iconSize,
      });
    });

    // Always use flex-based positioning. CSS order controls visual placement.
    return (
      <div
        ref={ref}
        data-slot={
          align === "start"
            ? "input-group-addon-start"
            : "input-group-addon-end"
        }
        className={cn(
          "relative z-[1] pointer-events-none flex shrink-0 items-center gap-1.5",
          "text-kumo-subtle",
          tokens.fontSize,
          "*:pointer-events-auto",
          align === "start"
            ? cn(
                "-order-1",
                containsButton
                  ? tokens.addonButtonOuterStart
                  : tokens.addonOuterStart,
                "pr-0",
              )
            : cn(
                "order-1",
                "pl-0",
                containsButton
                  ? tokens.addonButtonOuterEnd
                  : tokens.addonOuterEnd,
              ),
          className,
        )}
      >
        <InputGroupAddonContext.Provider value={true}>
          {sizedChildren}
        </InputGroupAddonContext.Provider>
      </div>
    );
  },
);
Addon.displayName = "InputGroup.Addon";
