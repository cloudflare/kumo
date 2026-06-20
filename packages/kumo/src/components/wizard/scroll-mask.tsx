import type { CSSProperties, PropsWithChildren } from "react";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { cn } from "../../utils/cn";

interface ScrollMaskProps {
  className?: string;
  /**
   * Size of the fade gradient in pixels.
   * @default 36
   */
  maskSize?: number;
  /** Additional classes for the outer ScrollArea.Root wrapper. */
  rootClassName?: string;
  style?: CSSProperties;
}

/**
 * Internal scroll container with gradient fade at overflowing edges.
 *
 * Wraps Base UI's ScrollArea — it sets `--scroll-area-overflow-y-start` and
 * `--scroll-area-overflow-y-end` CSS variables on the viewport representing
 * the scroll overflow distance (px) at each edge. A `mask-image` gradient
 * consumes them to smoothly fade content as the user scrolls.
 *
 * Not exported publicly — wizard-internal only.
 */
export function ScrollMask({
  children,
  className,
  maskSize = 36,
  rootClassName,
  style,
}: PropsWithChildren<ScrollMaskProps>) {
  return (
    <ScrollArea.Root
      className={cn("relative flex min-h-0 flex-1 flex-col", rootClassName)}
    >
      <ScrollArea.Viewport
        className={cn("min-h-0 flex-1 overflow-y-auto", className)}
        style={{
          ...style,
          // maskImage placed after spread so callers cannot override the fade.
          maskImage: `linear-gradient(
            to bottom,
            transparent 0,
            black min(${maskSize}px, var(--scroll-area-overflow-y-start, ${maskSize}px)),
            black calc(100% - min(${maskSize}px, var(--scroll-area-overflow-y-end, ${maskSize}px))),
            transparent 100%
          )`,
          maskRepeat: "no-repeat",
        }}
      >
        {children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className={cn(
          "my-1.5 mr-0.5 w-2 p-px",
          "opacity-0 transition-opacity data-hovering:opacity-100 data-scrolling:opacity-100",
        )}
      >
        <ScrollArea.Thumb
          className={cn(
            "w-full rounded-full bg-kumo-contrast",
            "opacity-10 hover:opacity-20 active:opacity-30 transition-opacity",
          )}
        />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

ScrollMask.displayName = "WizardScrollMask";
