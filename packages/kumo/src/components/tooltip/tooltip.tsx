import { Tooltip as TooltipBase } from "@base-ui/react/tooltip";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../../utils/cn";

export const KUMO_TOOLTIP_VARIANTS = {
  side: {
    top: {
      classes: "",
      description: "Tooltip appears above the trigger",
    },
    bottom: {
      classes: "",
      description: "Tooltip appears below the trigger",
    },
    left: {
      classes: "",
      description: "Tooltip appears to the left of the trigger",
    },
    right: {
      classes: "",
      description: "Tooltip appears to the right of the trigger",
    },
  },
} as const;

export const KUMO_TOOLTIP_DEFAULT_VARIANTS = {
  side: "top",
} as const;

// Derived types from KUMO_TOOLTIP_VARIANTS
export type KumoTooltipSide = keyof typeof KUMO_TOOLTIP_VARIANTS.side;

export interface KumoTooltipVariantsProps {
  side?: KumoTooltipSide;
}

export function tooltipVariants({
  side = KUMO_TOOLTIP_DEFAULT_VARIANTS.side,
}: KumoTooltipVariantsProps = {}) {
  return cn(
    // Base styles
    "flex origin-[var(--transform-origin)] flex-col rounded-md bg-kumo-base px-2.5 py-1.5 text-sm text-kumo-default",
    "shadow-lg shadow-kumo-tip-shadow outline outline-1 outline-kumo-fill",
    "transition-[transform,opacity] duration-150",
    "data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
    "data-[ending-style]:scale-90 data-[ending-style]:opacity-0",
    "data-[instant]:duration-0",
    // Apply side-specific styles (currently none, but extensible)
    KUMO_TOOLTIP_VARIANTS.side[side].classes,
  );
}

export const TooltipProvider = TooltipBase.Provider;

type BaseTooltipProps = ComponentPropsWithoutRef<typeof TooltipBase.Root>;

type TriggerProps = ComponentPropsWithoutRef<typeof TooltipBase.Trigger>;

/** Alignment options for tooltip positioning. Source: PositionerProps["align"] */
type TooltipAlign = "start" | "center" | "end";

export type TooltipProps = BaseTooltipProps &
  KumoTooltipVariantsProps & {
    align?: TooltipAlign;
    asChild?: boolean;
    className?: string;
    content: ReactNode;
  };

export function Tooltip({
  content,
  children,
  align,
  asChild,
  side,
  className,
  ...props
}: TooltipProps) {
  return (
    <TooltipBase.Root {...props}>
      <TooltipBase.Trigger
        className={className}
        render={asChild ? (children as TriggerProps["render"]) : undefined}
      >
        {asChild ? undefined : (children as ReactNode)}
      </TooltipBase.Trigger>
      <TooltipBase.Portal>
        <TooltipBase.Positioner align={align} side={side} sideOffset={10}>
          <TooltipBase.Popup
            className={cn(
              "flex origin-[var(--transform-origin)] flex-col rounded-md bg-kumo-base px-2.5 py-1.5 text-sm text-kumo-default",
              "shadow-lg shadow-kumo-tip-shadow outline outline-kumo-fill",
              "transition-[transform,opacity] duration-150",
              "data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-90 data-[ending-style]:opacity-0",
              "data-[instant]:duration-0",
              "kumo-tooltip-popup",
            )}
          >
            <TooltipBase.Arrow
              className={cn(
                "flex",
                "data-[side=bottom]:top-[-8px]",
                "data-[side=left]:right-[-13px] data-[side=left]:rotate-90",
                "data-[side=right]:left-[-13px] data-[side=right]:-rotate-90",
                "data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180",
              )}
            >
              <ArrowSvg />
            </TooltipBase.Arrow>
            {content}
          </TooltipBase.Popup>
        </TooltipBase.Positioner>
      </TooltipBase.Portal>
    </TooltipBase.Root>
  );
}

/**
 * Arrow SVG with three paths for proper border rendering in both light and dark modes.
 * This approach matches Base UI's tooltip implementation.
 *
 * The three paths are:
 * 1. ArrowFill - The main arrow body, matches tooltip background
 * 2. ArrowOuterStroke - Border visible in light mode only (transparent in dark)
 * 3. ArrowInnerStroke - Border visible in dark mode only (transparent in light)
 *
 * This is necessary because the outer and inner stroke paths have different geometries,
 * and using both ensures the arrow border aligns perfectly with the tooltip's outline
 * in both color modes.
 *
 * @see https://base-ui.com/react/components/tooltip
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
