import { CaretDownIcon } from "@phosphor-icons/react";
import { type PropsWithChildren, forwardRef, useCallback, useId } from "react";
import { cn } from "../../utils/cn";

export const KUMO_COLLAPSIBLE_VARIANTS = {} as const;

export const KUMO_COLLAPSIBLE_DEFAULT_VARIANTS = {} as const;

export interface KumoCollapsibleVariantsProps {}

export function collapsibleVariants(_props: KumoCollapsibleVariantsProps = {}) {
  return cn(
    // Base styles for the trigger
    "flex cursor-pointer items-center gap-1 text-sm text-kumo-link select-none",
  );
}

export type CollapsibleProps = PropsWithChildren<
  KumoCollapsibleVariantsProps & {
    /** Text label displayed in the trigger button */
    label: string;
    /** Whether the collapsible content is visible */
    open?: boolean;
    /** Callback fired when the open state changes */
    onOpenChange?: (open: boolean) => void;
    /** Additional CSS classes for the content panel */
    className?: string;
  }
>;

/**
 * Collapsible component for showing/hiding content.
 *
 * Features:
 * - Animated chevron indicator (rotates 180° when open)
 * - Accessible with aria-expanded and aria-controls
 * - Content panel with left border accent
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Collapsible label="Show details" open={open} onOpenChange={setOpen}>
 *   <Text>Hidden content revealed when expanded.</Text>
 * </Collapsible>
 * ```
 *
 * @example Controlled accordion pattern
 * ```tsx
 * const [activeIndex, setActiveIndex] = useState<number | null>(null);
 *
 * {items.map((item, i) => (
 *   <Collapsible
 *     key={i}
 *     label={item.title}
 *     open={activeIndex === i}
 *     onOpenChange={(open) => setActiveIndex(open ? i : null)}
 *   >
 *     {item.content}
 *   </Collapsible>
 * ))}
 * ```
 */
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ label, open, onOpenChange, children, className }, ref) => {
    const contentId = useId();

    const handleOpen = useCallback(() => {
      onOpenChange?.(!open);
    }, [open, onOpenChange]);

    return (
      <div ref={ref}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          className={collapsibleVariants()}
          onClick={handleOpen}
        >
          {label}{" "}
          <CaretDownIcon
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </button>
        {open && (
          <div
            id={contentId}
            className={cn(
              "my-2 space-y-4 border-l-2 border-kumo-fill pl-4",
              className,
            )}
          >
            {children}
          </div>
        )}
      </div>
    );
  },
);

Collapsible.displayName = "Collapsible";
