import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

/**
 * ButtonGroup has no visual variants — it's a horizontal layout wrapper. The
 * required exports are kept for the Kumo variant standard.
 */
export const KUMO_BUTTON_GROUP_VARIANTS = {} as const;

export const KUMO_BUTTON_GROUP_DEFAULT_VARIANTS = {} as const;

/** Base classes shared by every ButtonGroup. */
export const KUMO_BUTTON_GROUP_STYLING = {
  baseClasses: cn(
    // `isolate` keeps child z-index changes contained; `w-max` shrinks the
    // group to its content so it doesn't stretch across its container.
    "relative isolate inline-flex w-max flex-row",
    // Give every child a stacking context so the lift below takes effect.
    "[&>*]:relative",
    // Each kumo Button carries its own `shadow-xs`. Inside a group those
    // shadows overlap at the seams and make the middle button look elevated /
    // boxed. Drop the per-button shadows so the group reads as one flat,
    // uniform control (the shared rings provide all the definition needed).
    "[&>*]:shadow-none",
    // Only lift on keyboard focus, so the 2px focus ring isn't clipped by the
    // -1px overlap. We deliberately do NOT lift on hover: restacking on hover
    // would make the shared 1px seam visibly jump by a pixel depending on which
    // button is hovered. Leaving the stacking order fixed (later sibling paints
    // on top) keeps the seam stable.
    "[&>*:focus-visible]:z-10",
    // Join the buttons. Scope to real controls (`button` / `a`) via `of-type`
    // so that any element a child injects at runtime — e.g. a dropdown's popup,
    // backdrop, or focus guards when it opens — can't change which control is
    // treated as first/last and accidentally un-round the outer corners.
    // Flatten the inner edges; keep each end's own size-appropriate radius.
    "[&>button:not(:first-of-type)]:rounded-l-none",
    "[&>button:not(:last-of-type)]:rounded-r-none",
    "[&>a:not(:first-of-type)]:rounded-l-none",
    "[&>a:not(:last-of-type)]:rounded-r-none",
    // Overlap borders/rings by 1px so adjacent buttons share a single seam
    // instead of doubling up to a 2px line.
    "[&>button:not(:first-of-type)]:-ml-px",
    "[&>a:not(:first-of-type)]:-ml-px",
  ),
} as const;

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes merged via `cn()`. Use kumo semantic tokens only. */
  className?: string;
  /** Buttons to join together. Typically `Button` / `LinkButton` elements. */
  children?: ReactNode;
}

/**
 * Visually joins a set of related buttons into a single horizontal segmented
 * control.
 *
 * Children keep their own variant, size, and shape — ButtonGroup only handles
 * the layout: it flattens the inner corners and overlaps borders so adjacent
 * buttons share one seam. Works for action rows, icon toolbars, and split
 * buttons (a primary action next to a dropdown trigger).
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
  ({ className, children, role, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={role ?? "group"}
        data-kumo-component="ButtonGroup"
        className={cn(KUMO_BUTTON_GROUP_STYLING.baseClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";
