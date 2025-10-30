import { Tooltip as TooltipBase } from "@base-ui-components/react/tooltip";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export const TooltipProvider = TooltipBase.Provider;

type BaseTooltipProps = ComponentPropsWithoutRef<typeof TooltipBase.Root>;

type PositionerProps = ComponentPropsWithoutRef<typeof TooltipBase.Positioner>;

type TriggerProps = ComponentPropsWithoutRef<typeof TooltipBase.Trigger>;

type TooltipProps = BaseTooltipProps & {
  align?: PositionerProps["align"];
  side?: PositionerProps["side"];
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
        {asChild ? undefined : children}
      </TooltipBase.Trigger>
      <TooltipBase.Portal>
        <TooltipBase.Positioner align={align} side={side} sideOffset={10}>
          <TooltipBase.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-neutral-900 text-neutral-100 px-2.5 py-1.5 text-sm shadow-lg shadow-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            <TooltipBase.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
              <ArrowSvg />
            </TooltipBase.Arrow>
            {content}
          </TooltipBase.Popup>
        </TooltipBase.Positioner>
      </TooltipBase.Portal>
    </TooltipBase.Root>
  );
}

function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-neutral-900"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-gray-200 dark:fill-neutral-800 dark:fill-none"
      />
    </svg>
  );
}
