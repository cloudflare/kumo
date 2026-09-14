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
    // Give every child a stacking context so keyboard-focused controls can
    // lift above the adjacent seam, including tooltip-wrapped buttons.
    "[&>*]:relative [&>*:focus-visible]:z-10 [&>*:has(:focus-visible)]:z-10",
    // Each kumo Button carries its own `shadow-xs`. Inside a group those
    // shadows overlap at the seams and make the middle button look elevated /
    // boxed. Drop the per-button shadows so the group reads as one flat,
    // uniform control (the shared rings provide all the definition needed).
    "[&>*>:is(button,a)]:shadow-none [&>:is(button,a)]:shadow-none",
    // Join controls by child position rather than element type so mixed Button
    // and LinkButton groups retain the correct outer corners. The one-level
    // descendant selectors support Button's tooltip wrapper.
    "[&>*:not(:first-child):is(button,a)]:rounded-s-none",
    "[&>*:not(:last-child):is(button,a)]:rounded-e-none",
    "[&>*:not(:first-child)>:is(button,a)]:rounded-s-none",
    "[&>*:not(:last-child)>:is(button,a)]:rounded-e-none",
    // Overlap borders/rings by 1px so adjacent buttons share a single seam
    // instead of doubling up to a 2px line. Logical utilities support RTL.
    "[&>*:not(:first-child)]:-ms-px",
  ),
} as const;

export interface ButtonGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "role"
> {
  /** Additional CSS classes merged via `cn()`. Use kumo semantic tokens only. */
  className?: string;
  /**
   * The tightly-coupled controls to join. Typically two `Button`s: a primary
   * action and a dropdown trigger (a "split button").
   */
  children?: ReactNode;
}

/**
 * Joins a small set of tightly-coupled buttons into a single control — most
 * commonly a **split button**: a primary action next to a dropdown trigger for
 * related, secondary actions.
 *
 * Children keep their own variant, size, and shape — ButtonGroup only handles
 * the layout: it flattens the inner corners and overlaps borders so the buttons
 * share one seam. Renders `role="group"` so assistive technology treats the
 * buttons as a related set (pair it with an `aria-label`).
 *
 * For grouping multiple *independent* buttons or inputs (e.g. a formatting bar
 * or a page-level set of actions), use `Toolbar` instead — it provides the
 * correct roaming-focus keyboard semantics for a toolbar.
 *
 * @example Split button
 * ```tsx
 * <ButtonGroup aria-label="Deploy">
 *   <Button variant="primary">Deploy</Button>
 *   <DropdownMenu>
 *     <DropdownMenu.Trigger
 *       render={
 *         <Button variant="primary" shape="square" aria-label="More deploy options">
 *           <CaretDownIcon />
 *         </Button>
 *       }
 *     />
 *     <DropdownMenu.Content>
 *       <DropdownMenu.Item>Deploy to staging</DropdownMenu.Item>
 *     </DropdownMenu.Content>
 *   </DropdownMenu>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        role="group"
        data-kumo-component="ButtonGroup"
        className={cn(KUMO_BUTTON_GROUP_STYLING.baseClasses, className)}
      >
        {children}
      </div>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";
