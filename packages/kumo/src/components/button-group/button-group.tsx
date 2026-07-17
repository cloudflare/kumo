import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";

/**
 * ButtonGroup variant definitions. Controls how child buttons are laid out and
 * joined together.
 */
export const KUMO_BUTTON_GROUP_VARIANTS = {
  orientation: {
    horizontal: {
      classes: cn(
        "flex-row",
        // Flatten the inner edges so buttons read as one joined control while
        // the outer corners keep each button's own size-appropriate radius.
        "[&>*:not(:first-child)]:rounded-l-none",
        "[&>*:not(:last-child)]:rounded-r-none",
        // Overlap borders/rings by 1px so adjacent buttons share a single seam
        // instead of doubling up to a 2px line.
        "[&>*:not(:first-child)]:-ml-px",
      ),
      description: "Lay buttons out in a horizontal row.",
    },
    vertical: {
      classes: cn(
        "flex-col",
        "[&>*:not(:first-child)]:rounded-t-none",
        "[&>*:not(:last-child)]:rounded-b-none",
        "[&>*:not(:first-child)]:-mt-px",
      ),
      description: "Stack buttons vertically into a column.",
    },
  },
} as const;

export const KUMO_BUTTON_GROUP_DEFAULT_VARIANTS = {
  orientation: "horizontal",
} as const;

/** Base classes shared by every ButtonGroup, regardless of orientation. */
export const KUMO_BUTTON_GROUP_STYLING = {
  baseClasses: cn(
    // `isolate` keeps child z-index changes contained; `w-max` shrinks the
    // group to its content so it doesn't stretch across its container.
    "relative isolate inline-flex w-max",
    // Give every child a stacking context so the lifts below take effect.
    "[&>*]:relative",
    // Lift the interacted button above its neighbours so its focus/hover ring
    // isn't clipped by the -1px overlap.
    "[&>*:hover]:z-10 [&>*:focus]:z-10 [&>*:focus-visible]:z-10",
  ),
} as const;

export type KumoButtonGroupOrientation =
  keyof typeof KUMO_BUTTON_GROUP_VARIANTS.orientation;

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Layout direction of the grouped buttons.
   * - `"horizontal"` — buttons sit side by side (default)
   * - `"vertical"` — buttons stack in a column
   * @default "horizontal"
   */
  orientation?: KumoButtonGroupOrientation;
  /** Additional CSS classes merged via `cn()`. Use kumo semantic tokens only. */
  className?: string;
  /** Buttons to join together. Typically `Button` / `LinkButton` elements. */
  children?: ReactNode;
}

/**
 * Visually joins a set of related buttons into a single segmented control.
 *
 * Children keep their own variant, size, and shape — ButtonGroup only handles
 * the layout: it flattens the inner corners and overlaps borders so adjacent
 * buttons share one seam. Works for both action rows and split buttons (a
 * primary action next to a dropdown trigger).
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="secondary">Day</Button>
 *   <Button variant="secondary">Week</Button>
 *   <Button variant="secondary">Month</Button>
 * </ButtonGroup>
 * ```
 *
 * @example Split button
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="primary">Deploy</Button>
 *   <Button variant="primary" shape="square" aria-label="More options">
 *     <CaretDownIcon />
 *   </Button>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    { orientation = "horizontal", className, children, role, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role={role ?? "group"}
        data-kumo-component="ButtonGroup"
        className={cn(
          KUMO_BUTTON_GROUP_STYLING.baseClasses,
          resolveVariant(
            KUMO_BUTTON_GROUP_VARIANTS.orientation,
            orientation,
            KUMO_BUTTON_GROUP_DEFAULT_VARIANTS.orientation,
          ).classes,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";
