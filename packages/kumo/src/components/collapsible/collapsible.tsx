import { Collapsible as CollapsibleBase } from "@base-ui/react/collapsible";
import { CaretDownIcon } from "@phosphor-icons/react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

// =============================================================================
// Variants
// =============================================================================

export const KUMO_COLLAPSIBLE_VARIANTS = {} as const;

export const KUMO_COLLAPSIBLE_DEFAULT_VARIANTS = {} as const;

export interface KumoCollapsibleVariantsProps {}

export function collapsibleVariants(_props: KumoCollapsibleVariantsProps = {}) {
  return cn();
}

// =============================================================================
// Collapsible Root
// =============================================================================

type BaseRootProps = ComponentPropsWithoutRef<typeof CollapsibleBase.Root>;

export interface CollapsibleRootProps extends BaseRootProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Root component that manages collapsible state.
 *
 * @example
 * ```tsx
 * <Collapsible.Root open={open} onOpenChange={setOpen}>
 *   <Collapsible.Trigger>Toggle</Collapsible.Trigger>
 *   <Collapsible.Panel>Content</Collapsible.Panel>
 * </Collapsible.Root>
 * ```
 */
function CollapsibleRoot({ className, ...props }: CollapsibleRootProps) {
  return <CollapsibleBase.Root className={className} {...props} />;
}

CollapsibleRoot.displayName = "Collapsible.Root";

// =============================================================================
// Collapsible Trigger
// =============================================================================

type BaseTriggerProps = ComponentPropsWithoutRef<
  typeof CollapsibleBase.Trigger
>;

export interface CollapsibleTriggerProps extends BaseTriggerProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Button that toggles the collapsible panel visibility.
 * Use the `render` prop to customize the trigger element.
 *
 * @example
 * ```tsx
 * // Default button
 * <Collapsible.Trigger>Show more</Collapsible.Trigger>
 *
 * // Custom trigger element
 * <Collapsible.Trigger render={<Button variant="ghost" />}>
 *   Toggle details
 * </Collapsible.Trigger>
 * ```
 */
const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ className, ...props }, ref) => {
    return (
      <CollapsibleBase.Trigger
        ref={ref}
        className={cn("cursor-pointer", className)}
        {...props}
      />
    );
  },
);

CollapsibleTrigger.displayName = "Collapsible.Trigger";

// =============================================================================
// Collapsible Panel
// =============================================================================

type BasePanelProps = ComponentPropsWithoutRef<typeof CollapsibleBase.Panel>;

export interface CollapsiblePanelProps extends BasePanelProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Container for collapsible content. Renders when the collapsible is open.
 *
 * @example
 * ```tsx
 * <Collapsible.Panel className="mt-2 space-y-4">
 *   <Text>Revealed content here</Text>
 * </Collapsible.Panel>
 * ```
 */
const CollapsiblePanel = forwardRef<HTMLDivElement, CollapsiblePanelProps>(
  ({ className, ...props }, ref) => {
    return (
      <CollapsibleBase.Panel
        ref={ref}
        className={className}
        {...props}
      />
    );
  },
);

CollapsiblePanel.displayName = "Collapsible.Panel";

// =============================================================================
// Default Trigger (Migration Affordance)
// =============================================================================

export interface CollapsibleDefaultTriggerProps {
  /** Label text displayed in the trigger */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pre-styled trigger with text label and animated caret icon.
 * Provides the same visual style as the previous Collapsible API.
 *
 * Use this for quick migration or when you want the default Kumo style.
 *
 * @example
 * ```tsx
 * <Collapsible.Root>
 *   <Collapsible.DefaultTrigger>Show details</Collapsible.DefaultTrigger>
 *   <Collapsible.Panel>Content</Collapsible.Panel>
 * </Collapsible.Root>
 * ```
 */
const CollapsibleDefaultTrigger = forwardRef<
  HTMLButtonElement,
  CollapsibleDefaultTriggerProps
>(({ children, className }, ref) => {
  return (
    <CollapsibleBase.Trigger
      ref={ref}
      className={cn(
        // Defensive resets to prevent global button styles from polluting the trigger
        "bg-transparent border-none shadow-none p-0 m-0",
        // Base styles for the trigger
        "flex cursor-pointer items-center gap-1 text-sm text-kumo-link select-none",
        className,
      )}
    >
      {children}{" "}
      <CaretDownIcon className="h-4 w-4 transition-transform [[data-panel-open]_&]:rotate-180" />
    </CollapsibleBase.Trigger>
  );
});

CollapsibleDefaultTrigger.displayName = "Collapsible.DefaultTrigger";

// =============================================================================
// Default Panel (Migration Affordance)
// =============================================================================

export interface CollapsibleDefaultPanelProps extends BasePanelProps {
  /** Panel content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pre-styled panel with left border accent and standard spacing.
 * Provides the same visual style as the previous Collapsible API.
 *
 * @example
 * ```tsx
 * <Collapsible.Root>
 *   <Collapsible.DefaultTrigger>Show details</Collapsible.DefaultTrigger>
 *   <Collapsible.DefaultPanel>
 *     <Text>Content with default styling</Text>
 *   </Collapsible.DefaultPanel>
 * </Collapsible.Root>
 * ```
 */
const CollapsibleDefaultPanel = forwardRef<
  HTMLDivElement,
  CollapsibleDefaultPanelProps
>(({ children, className, ...props }, ref) => {
  return (
    <CollapsibleBase.Panel
      ref={ref}
      className={cn("my-2 space-y-4 border-l-2 border-kumo-fill pl-4", className)}
      {...props}
    >
      {children}
    </CollapsibleBase.Panel>
  );
});

CollapsibleDefaultPanel.displayName = "Collapsible.DefaultPanel";

// =============================================================================
// Compound Component Export
// =============================================================================

/**
 * Collapsible — a composable disclosure component for showing/hiding content.
 *
 * Built on Base UI's Collapsible with full composition support.
 *
 * ## Basic Usage
 *
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Collapsible.Root open={open} onOpenChange={setOpen}>
 *   <Collapsible.Trigger render={<Button variant="ghost" />}>
 *     Show details
 *   </Collapsible.Trigger>
 *   <Collapsible.Panel className="mt-2">
 *     <Text>Hidden content revealed when expanded.</Text>
 *   </Collapsible.Panel>
 * </Collapsible.Root>
 * ```
 *
 * ## With Default Styling
 *
 * Use `DefaultTrigger` and `DefaultPanel` for the classic Kumo style:
 *
 * ```tsx
 * <Collapsible.Root>
 *   <Collapsible.DefaultTrigger>Show details</Collapsible.DefaultTrigger>
 *   <Collapsible.DefaultPanel>
 *     <Text>Content with border-left accent</Text>
 *   </Collapsible.DefaultPanel>
 * </Collapsible.Root>
 * ```
 *
 * ## Controlled Accordion Pattern
 *
 * ```tsx
 * const [activeIndex, setActiveIndex] = useState<number | null>(null);
 *
 * {items.map((item, i) => (
 *   <Collapsible.Root
 *     key={i}
 *     open={activeIndex === i}
 *     onOpenChange={(open) => setActiveIndex(open ? i : null)}
 *   >
 *     <Collapsible.DefaultTrigger>{item.title}</Collapsible.DefaultTrigger>
 *     <Collapsible.DefaultPanel>{item.content}</Collapsible.DefaultPanel>
 *   </Collapsible.Root>
 * ))}
 * ```
 */
export const Collapsible = Object.assign(CollapsibleRoot, {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Panel: CollapsiblePanel,
  DefaultTrigger: CollapsibleDefaultTrigger,
  DefaultPanel: CollapsibleDefaultPanel,
});

// =============================================================================
// Type Exports
// =============================================================================

export type CollapsibleProps = CollapsibleRootProps;
