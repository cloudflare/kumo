import { Popover as PopoverBase } from "@base-ui/react/popover";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../../utils/cn";

/** Popover side variant definitions mapping positions to their Tailwind classes. */
export const KUMO_POPOVER_VARIANTS = {
  side: {
    top: {
      classes: "",
      description: "Popover appears above the trigger",
    },
    bottom: {
      classes: "",
      description: "Popover appears below the trigger",
    },
    left: {
      classes: "",
      description: "Popover appears to the left of the trigger",
    },
    right: {
      classes: "",
      description: "Popover appears to the right of the trigger",
    },
  },
} as const;

export const KUMO_POPOVER_DEFAULT_VARIANTS = {
  side: "bottom",
} as const;

// Derived types from KUMO_POPOVER_VARIANTS
export type KumoPopoverSide = keyof typeof KUMO_POPOVER_VARIANTS.side;

export interface KumoPopoverVariantsProps {
  /**
   * Which side of the trigger the popover appears on.
   * - `"top"` — Above the trigger
   * - `"bottom"` — Below the trigger
   * - `"left"` — Left of the trigger
   * - `"right"` — Right of the trigger
   * @default "bottom"
   */
  side?: KumoPopoverSide;
}

// ============================================================================
// Popover Root
// ============================================================================

type BasePopoverRootProps = ComponentPropsWithoutRef<typeof PopoverBase.Root>;

export type PopoverRootProps = BasePopoverRootProps;

function PopoverRoot({ children, ...props }: PopoverRootProps) {
  return <PopoverBase.Root {...props}>{children}</PopoverBase.Root>;
}

PopoverRoot.displayName = "Popover";

// ============================================================================
// Popover Trigger
// ============================================================================

type BasePopoverTriggerProps = ComponentPropsWithoutRef<
  typeof PopoverBase.Trigger
>;

export type PopoverTriggerProps = BasePopoverTriggerProps & {
  /** When true, the trigger element will be the child element */
  asChild?: boolean;
};

function PopoverTrigger({
  children,
  className,
  asChild,
  ...props
}: PopoverTriggerProps) {
  return (
    <PopoverBase.Trigger
      className={className}
      render={
        asChild ? (children as BasePopoverTriggerProps["render"]) : undefined
      }
      {...props}
    >
      {asChild ? undefined : children}
    </PopoverBase.Trigger>
  );
}

PopoverTrigger.displayName = "Popover.Trigger";

// ============================================================================
// Popover Content
// ============================================================================

/** Alignment options for popover positioning */
type PopoverAlign = "start" | "center" | "end";

/**
 * Popover content panel props.
 *
 * @example
 * ```tsx
 * <Popover.Content side="top" align="start" sideOffset={12}>
 *   <p>Popover body</p>
 * </Popover.Content>
 * ```
 */
export type PopoverContentProps = KumoPopoverVariantsProps & {
  /**
   * How to align the popover relative to the trigger.
   * @default "center"
   */
  align?: PopoverAlign;
  /**
   * Distance between the trigger and the popover in pixels.
   * @default 8
   */
  sideOffset?: number;
  /**
   * Additional offset along the alignment axis in pixels.
   * @default 0
   */
  alignOffset?: number;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Content to render inside the popover. */
  children?: ReactNode;
};

function PopoverContent({
  children,
  side = KUMO_POPOVER_DEFAULT_VARIANTS.side,
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
  className,
}: PopoverContentProps) {
  return (
    <PopoverBase.Portal>
      <PopoverBase.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverBase.Popup
          className={cn(
            "flex origin-(--transform-origin) flex-col rounded-lg bg-kumo-base px-4 py-3 text-sm text-kumo-default",
            "shadow-lg shadow-kumo-tip-shadow outline outline-kumo-fill",
            "transition-[transform,scale,opacity] duration-150",
            "data-starting-style:scale-90 data-starting-style:opacity-0",
            "data-ending-style:scale-90 data-ending-style:opacity-0",
            "data-instant:duration-0",
            "kumo-popover-popup",
            className,
          )}
        >
          <PopoverBase.Arrow
            className={cn(
              "flex",
              "data-[side=bottom]:-top-2",
              "data-[side=left]:right-[-13px] data-[side=left]:rotate-90",
              "data-[side=right]:left-[-13px] data-[side=right]:-rotate-90",
              "data-[side=top]:-bottom-2 data-[side=top]:rotate-180",
            )}
          >
            <ArrowSvg />
          </PopoverBase.Arrow>
          {children}
        </PopoverBase.Popup>
      </PopoverBase.Positioner>
    </PopoverBase.Portal>
  );
}

PopoverContent.displayName = "Popover.Content";

// ============================================================================
// Popover Title
// ============================================================================

type BasePopoverTitleProps = ComponentPropsWithoutRef<typeof PopoverBase.Title>;

export type PopoverTitleProps = BasePopoverTitleProps;

function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <PopoverBase.Title
      className={cn("m-0 text-base leading-6 font-medium", className)}
      {...props}
    />
  );
}

PopoverTitle.displayName = "Popover.Title";

// ============================================================================
// Popover Description
// ============================================================================

type BasePopoverDescriptionProps = ComponentPropsWithoutRef<
  typeof PopoverBase.Description
>;

export type PopoverDescriptionProps = BasePopoverDescriptionProps;

function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return (
    <PopoverBase.Description
      className={cn("m-0 text-base leading-6 text-kumo-subtle", className)}
      {...props}
    />
  );
}

PopoverDescription.displayName = "Popover.Description";

// ============================================================================
// Popover Close
// ============================================================================

type BasePopoverCloseProps = ComponentPropsWithoutRef<typeof PopoverBase.Close>;

export type PopoverCloseProps = BasePopoverCloseProps & {
  /** When true, the close element will be the child element */
  asChild?: boolean;
};

function PopoverClose({
  children,
  className,
  asChild,
  ...props
}: PopoverCloseProps) {
  return (
    <PopoverBase.Close
      className={className}
      render={
        asChild ? (children as BasePopoverCloseProps["render"]) : undefined
      }
      {...props}
    >
      {asChild ? undefined : children}
    </PopoverBase.Close>
  );
}

PopoverClose.displayName = "Popover.Close";

// ============================================================================
// Arrow SVG
// ============================================================================

/**
 * Arrow SVG with three paths for proper border rendering in both light and dark modes.
 * This approach matches Base UI's popover/tooltip implementation.
 *
 * The three paths are:
 * 1. ArrowFill - The main arrow body, matches popover background
 * 2. ArrowOuterStroke - Border visible in light mode only (transparent in dark)
 * 3. ArrowInnerStroke - Border visible in dark mode only (transparent in light)
 *
 * This is necessary because the outer and inner stroke paths have different geometries,
 * and using both ensures the arrow border aligns perfectly with the popover's outline
 * in both color modes.
 *
 * @see https://base-ui.com/react/components/popover
 */
function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-kumo-base"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-kumo-tip-shadow"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="fill-kumo-tip-stroke"
      />
    </svg>
  );
}

// ============================================================================
// Compound Component Export
// ============================================================================

/**
 * Popover component for displaying accessible popup content anchored to a trigger.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <Popover.Trigger asChild>
 *     <Button>Open</Button>
 *   </Popover.Trigger>
 *   <Popover.Content>
 *     <Popover.Title>Notifications</Popover.Title>
 *     <Popover.Description>You are all caught up!</Popover.Description>
 *   </Popover.Content>
 * </Popover>
 * ```
 *
 * @see https://base-ui.com/react/components/popover
 */
export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
});

// Export sub-components for direct access and type inference
export {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
};
