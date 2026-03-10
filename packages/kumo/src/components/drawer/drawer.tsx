import { DrawerPreview as DrawerBase } from "@base-ui/react/drawer";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { Surface } from "../surface";
import { cn } from "../../utils/cn";

/** Drawer direction variant definitions mapping directions to popup placement classes. */
export const KUMO_DRAWER_VARIANTS = {
  swipeDirection: {
    right: {
      classes:
        "top-0 right-0 h-full w-full max-w-[32rem] rounded-l-xl data-closed:translate-x-full data-starting-style:translate-x-full",
      description: "Drawer appears from the right edge",
    },
    left: {
      classes:
        "top-0 left-0 h-full w-full max-w-[32rem] rounded-r-xl data-closed:-translate-x-full data-starting-style:-translate-x-full",
      description: "Drawer appears from the left edge",
    },
    down: {
      classes:
        "right-0 bottom-0 left-0 min-h-[50svh] max-h-[85vh] rounded-t-xl data-closed:translate-y-full data-starting-style:translate-y-full",
      description: "Drawer appears from the bottom edge",
    },
    up: {
      classes:
        "top-0 right-0 left-0 min-h-[50svh] max-h-[85vh] rounded-b-xl data-closed:-translate-y-full data-starting-style:-translate-y-full",
      description: "Drawer appears from the top edge",
    },
  },
} as const;

export const KUMO_DRAWER_DEFAULT_VARIANTS = {
  swipeDirection: "right",
} as const;

// Derived types from KUMO_DRAWER_VARIANTS
export type KumoDrawerSwipeDirection = keyof typeof KUMO_DRAWER_VARIANTS.swipeDirection;

export interface KumoDrawerVariantsProps {
  /**
   * Direction used by the drawer for placement and swipe dismissal.
   * - `"right"` — Drawer opens from the right edge
   * - `"left"` — Drawer opens from the left edge
   * - `"down"` — Drawer opens from the bottom edge
   * - `"up"` — Drawer opens from the top edge
   * @default "right"
   */
  swipeDirection?: KumoDrawerSwipeDirection;
}

export function drawerVariants({
  swipeDirection = KUMO_DRAWER_DEFAULT_VARIANTS.swipeDirection,
}: KumoDrawerVariantsProps = {}) {
  return cn(
    "fixed z-50 overflow-auto bg-kumo-base text-kumo-default shadow-m outline outline-kumo-fill will-change-transform",
    "transition-transform ease-out duration-300 data-closed:ease-in data-closed:duration-250 motion-reduce:transition-none",
    "data-starting-style:opacity-100 data-ending-style:opacity-100",
    KUMO_DRAWER_VARIANTS.swipeDirection[swipeDirection].classes,
  );
}

type BaseDrawerRootProps = ComponentPropsWithoutRef<typeof DrawerBase.Root>;

export type DrawerRootProps = Omit<BaseDrawerRootProps, "swipeDirection"> & KumoDrawerVariantsProps;

function DrawerRoot({
  children,
  swipeDirection = KUMO_DRAWER_DEFAULT_VARIANTS.swipeDirection,
  ...props
}: DrawerRootProps) {
  return (
    <DrawerBase.Root swipeDirection={swipeDirection} {...props}>
      {children}
    </DrawerBase.Root>
  );
}

DrawerRoot.displayName = "Drawer.Root";

type BaseDrawerTriggerProps = ComponentPropsWithoutRef<typeof DrawerBase.Trigger>;

export type DrawerTriggerProps = BaseDrawerTriggerProps;

function DrawerTrigger({ children, ...props }: DrawerTriggerProps) {
  return <DrawerBase.Trigger {...props}>{children}</DrawerBase.Trigger>;
}

DrawerTrigger.displayName = "Drawer.Trigger";

type BaseDrawerTitleProps = ComponentPropsWithoutRef<typeof DrawerBase.Title>;

export type DrawerTitleProps = BaseDrawerTitleProps;

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <DrawerBase.Title
      className={cn("text-lg font-semibold text-kumo-default", className)}
      {...props}
    />
  );
}

DrawerTitle.displayName = "Drawer.Title";

type BaseDrawerDescriptionProps = ComponentPropsWithoutRef<typeof DrawerBase.Description>;

export type DrawerDescriptionProps = BaseDrawerDescriptionProps;

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerBase.Description className={cn("text-sm text-kumo-subtle", className)} {...props} />
  );
}

DrawerDescription.displayName = "Drawer.Description";

type BaseDrawerCloseProps = ComponentPropsWithoutRef<typeof DrawerBase.Close>;

export type DrawerCloseProps = BaseDrawerCloseProps;

function DrawerClose({ children, ...props }: DrawerCloseProps) {
  return <DrawerBase.Close {...props}>{children}</DrawerBase.Close>;
}

DrawerClose.displayName = "Drawer.Close";

export type DrawerActionsProps = ComponentPropsWithoutRef<"div">;

function DrawerActions({ className, ...props }: DrawerActionsProps) {
  return (
    <div
      className={cn(
        "order-last sticky bottom-0 z-10 mt-auto flex items-center justify-end gap-2 border-t border-kumo-fill bg-kumo-base pt-6",
        "mx-[calc(var(--kumo-drawer-actions-inset,1.5rem)*-1)] px-(--kumo-drawer-actions-inset,1.5rem) pb-(--kumo-drawer-actions-bottom-inset,0)",
        className,
      )}
      {...props}
    />
  );
}

DrawerActions.displayName = "Drawer.Actions";

export type DrawerFooterProps = DrawerActionsProps;

function DrawerFooter(props: DrawerFooterProps) {
  return <DrawerActions {...props} />;
}

DrawerFooter.displayName = "Drawer.Footer";

/** Drawer content panel props. */
export interface DrawerProps extends KumoDrawerVariantsProps {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Drawer body content. */
  children: ReactNode;
  /** Inline styles. */
  style?: CSSProperties;
}

function DrawerContent({
  className,
  children,
  style,
  swipeDirection = KUMO_DRAWER_DEFAULT_VARIANTS.swipeDirection,
}: DrawerProps) {
  return (
    <DrawerBase.Portal>
      <DrawerBase.Backdrop className='fixed inset-0 bg-kumo-overlay opacity-80 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0' />
      <Surface
        as={DrawerBase.Popup}
        className={cn(
          drawerVariants({ swipeDirection }),
          "flex flex-col [--kumo-drawer-actions-inset:1.5rem] [--kumo-drawer-actions-bottom-inset:0]",
          className,
        )}
        style={style}
      >
        {children}
      </Surface>
    </DrawerBase.Portal>
  );
}

DrawerContent.displayName = "Drawer";

const Drawer = Object.assign(DrawerContent, {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
  Actions: DrawerActions,
  Footer: DrawerFooter,
});

export {
  Drawer,
  DrawerRoot,
  DrawerTrigger,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerActions,
  DrawerFooter,
};
