import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type UIEvent,
} from "react";
import { Drawer as DrawerBase } from "@base-ui/react/drawer";
import { ScrollArea as ScrollAreaBase } from "@base-ui/react/scroll-area";
import { useMediaQuery } from "@base-ui/react/unstable-use-media-query";
import { X } from "@phosphor-icons/react";
import { Button } from "../button/button";
import { LayerCard } from "../layer-card/layer-card";
import { Text } from "../text/text";
import { cn } from "../../utils/cn";

export const KUMO_LAYER_DIALOG_VARIANTS = {
  verticalAlign: {
    top: {
      classes: "sm:items-start sm:pt-16",
      description: "Align the desktop dialog near the top of the viewport",
    },
    center: {
      classes: "sm:items-center",
      description: "Center the desktop dialog vertically",
    },
  },
} as const;

export const KUMO_LAYER_DIALOG_DEFAULT_VARIANTS = {
  verticalAlign: "center",
} as const;

export type KumoLayerDialogVerticalAlign =
  keyof typeof KUMO_LAYER_DIALOG_VARIANTS.verticalAlign;

const DesktopContext = createContext(false);
const DismissDisabledContext = createContext(false);
const AlertContext = createContext(false);

type RootProps = ComponentPropsWithoutRef<typeof DrawerBase.Root>;

export type LayerDialogRootProps = RootProps & {
  /** Prevent every user-initiated dismissal while dialog work is pending. */
  dismissDisabled?: boolean;
};

function LayerDialogRoot({
  children,
  dismissDisabled = false,
  onOpenChange,
  disablePointerDismissal,
  ...props
}: LayerDialogRootProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)", {
    defaultMatches: false,
  });
  const isAlert = useContext(AlertContext);

  const handleOpenChange: NonNullable<RootProps["onOpenChange"]> = (
    open,
    eventDetails,
  ) => {
    if (
      !open &&
      (dismissDisabled || (isAlert && eventDetails.reason !== "close-press"))
    ) {
      eventDetails.cancel();
      return;
    }

    onOpenChange?.(open, eventDetails);
  };

  const rootProps = {
    ...props,
    disablePointerDismissal:
      disablePointerDismissal || dismissDisabled || isAlert,
    onOpenChange: handleOpenChange,
  };

  return (
    <DesktopContext.Provider value={isDesktop}>
      <DismissDisabledContext.Provider value={dismissDisabled}>
        <DrawerBase.Root {...rootProps}>{children}</DrawerBase.Root>
      </DismissDisabledContext.Provider>
    </DesktopContext.Provider>
  );
}

LayerDialogRoot.displayName = "LayerDialog.Root";

/** A confirmation dialog that requires the user to choose an explicit action. */
function LayerDialogAlert(props: LayerDialogRootProps) {
  return (
    <AlertContext.Provider value>
      <LayerDialogRoot {...props} />
    </AlertContext.Provider>
  );
}

LayerDialogAlert.displayName = "LayerDialog.Alert";

export type LayerDialogTriggerProps = ComponentPropsWithoutRef<
  typeof DrawerBase.Trigger
>;

function LayerDialogTrigger(props: LayerDialogTriggerProps) {
  return <DrawerBase.Trigger {...props} />;
}

LayerDialogTrigger.displayName = "LayerDialog.Trigger";

export interface LayerDialogContentProps {
  children: ReactNode;
  /** Desktop-only positioning. Mobile dialogs always remain bottom sheets. */
  verticalAlign?: KumoLayerDialogVerticalAlign;
}

function LayerDialogContent({
  children,
  verticalAlign = KUMO_LAYER_DIALOG_DEFAULT_VARIANTS.verticalAlign,
}: LayerDialogContentProps) {
  const isDesktop = useContext(DesktopContext);
  const dismissDisabled = useContext(DismissDisabledContext);
  const isAlert = useContext(AlertContext);
  const childArray = Children.toArray(children);
  const title = childArray.find(
    (child) => isValidElement(child) && child.type === LayerDialogTitle,
  );
  const body = childArray.find(
    (child) => isValidElement(child) && child.type === LayerDialogBody,
  );
  const actions = childArray.find(
    (child) => isValidElement(child) && child.type === LayerDialogActions,
  );
  const titleCount = childArray.filter(
    (child) => isValidElement(child) && child.type === LayerDialogTitle,
  ).length;
  const bodyCount = childArray.filter(
    (child) => isValidElement(child) && child.type === LayerDialogBody,
  ).length;
  const actionsCount = childArray.filter(
    (child) => isValidElement(child) && child.type === LayerDialogActions,
  ).length;
  const hasInvalidChildren = childArray.some(
    (child) =>
      !isValidElement(child) ||
      (child.type !== LayerDialogTitle &&
        child.type !== LayerDialogBody &&
        child.type !== LayerDialogActions),
  );

  if (
    hasInvalidChildren ||
    !title ||
    !body ||
    (isAlert && !actions) ||
    titleCount !== 1 ||
    bodyCount !== 1 ||
    actionsCount > 1
  ) {
    throw new Error(
      isAlert
        ? "LayerDialog.Alert requires exactly one direct LayerDialog.Title, LayerDialog.Body, and LayerDialog.Actions."
        : "LayerDialog.Content requires exactly one direct LayerDialog.Title and LayerDialog.Body, with an optional direct LayerDialog.Actions.",
    );
  }

  const renderedBody = cloneElement(
    body as ReactElement<LayerDialogBodyProps>,
    { title, showCloseButton: !actions },
  );

  return (
    <DrawerBase.Portal>
      <DrawerBase.Backdrop className="fixed inset-0 bg-kumo-recessed opacity-80 transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:opacity-0 data-[ending-style]:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-[starting-style]:opacity-0 data-[swiping]:duration-0 motion-reduce:transition-none sm:duration-200 sm:data-[ending-style]:duration-200" />
      <DrawerBase.Viewport
        className={cn(
          "fixed inset-0 flex items-end justify-center",
          KUMO_LAYER_DIALOG_VARIANTS.verticalAlign[verticalAlign].classes,
        )}
        data-base-ui-swipe-ignore={
          isDesktop || dismissDisabled || isAlert ? "" : undefined
        }
      >
        <DrawerBase.Popup
          render={isAlert ? <div role="alertdialog" /> : <div />}
          className="fixed inset-x-0 bottom-0 flex max-h-[85dvh] min-h-0 w-full max-w-none [transform:translate3d(0,var(--drawer-swipe-movement-y,0px),0)] transform-gpu overflow-visible transition-[transform,opacity] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform outline-none data-[ending-style]:[transform:translate3d(0,100%,0)] data-[ending-style]:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-[starting-style]:[transform:translate3d(0,100%,0)] data-[swiping]:duration-0 data-[swiping]:select-none motion-reduce:transition-none sm:static sm:max-h-[calc(100dvh-3rem)] sm:max-w-md sm:[transform:translate3d(0,0,0)] sm:duration-200 sm:data-[ending-style]:[transform:translate3d(0,8px,0)] sm:data-[ending-style]:opacity-0 sm:data-[ending-style]:duration-200 sm:data-[starting-style]:[transform:translate3d(0,8px,0)] sm:data-[starting-style]:opacity-0"
        >
          <LayerCard className="shadow-m flex max-h-[85dvh] min-h-0 w-full flex-col overflow-hidden rounded-none bg-kumo-elevated p-1.5 max-sm:shadow-xs max-sm:ring-0 sm:max-h-[calc(100dvh-3rem)] sm:rounded-xl">
            {!isDesktop && !isAlert && (
              <div aria-hidden className="flex justify-center pt-1.5 pb-3">
                <div className="h-1 w-10 rounded-full bg-kumo-fill" />
              </div>
            )}
            <DrawerBase.Content className="flex min-h-0 flex-col overflow-visible">
              {renderedBody}
              {actions}
            </DrawerBase.Content>
          </LayerCard>
        </DrawerBase.Popup>
      </DrawerBase.Viewport>
    </DrawerBase.Portal>
  );
}

LayerDialogContent.displayName = "LayerDialog.Content";

export interface LayerDialogTitleProps {
  children: ReactNode;
}

function LayerDialogTitle({ children }: LayerDialogTitleProps) {
  const title = (props: ComponentPropsWithoutRef<"h2">) => (
    <Text {...props} as="h2" variant="heading3">
      {children}
    </Text>
  );

  return <DrawerBase.Title render={title} />;
}

LayerDialogTitle.displayName = "LayerDialog.Title";

export interface LayerDialogBodyProps {
  children: ReactNode;
  title?: ReactNode;
  showCloseButton?: boolean;
}

function LayerDialogBody({
  children,
  title,
  showCloseButton = false,
}: LayerDialogBodyProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const dismissDisabled = useContext(DismissDisabledContext);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setHasScrolled(event.currentTarget.scrollTop > 8);
  };

  return (
    <LayerCard.Primary className="min-h-0 flex-1 !gap-0 overflow-hidden border border-kumo-line !p-0 !ring-0">
      <div
        className={cn(
          "z-10 flex shrink-0 items-center justify-between gap-4 bg-kumo-base px-4 py-4 transition-[border-color]",
          hasScrolled
            ? "border-b border-kumo-line"
            : "border-b border-transparent",
        )}
      >
        <div className="min-w-0">{title}</div>
        {showCloseButton && <LayerDialogIconClose disabled={dismissDisabled} />}
      </div>
      <ScrollAreaBase.Root className="relative flex min-h-0 flex-1 flex-col">
        <ScrollAreaBase.Viewport
          className="min-h-0 flex-1 overscroll-contain [mask-image:linear-gradient(to_bottom,transparent_0,black_min(24px,var(--scroll-area-overflow-y-start,24px)),black_calc(100%-min(24px,var(--scroll-area-overflow-y-end,24px))),transparent_100%)]"
          onScroll={handleScroll}
        >
          <ScrollAreaBase.Content className="px-4 pb-4">
            {children}
          </ScrollAreaBase.Content>
        </ScrollAreaBase.Viewport>
        <ScrollAreaBase.Scrollbar
          keepMounted
          orientation="vertical"
          className="my-1.5 mr-0.5 hidden w-2 p-px opacity-0 transition-opacity data-[has-overflow-y]:block data-[hovering]:opacity-100 data-[scrolling]:opacity-100"
        >
          <ScrollAreaBase.Thumb className="w-full rounded-full bg-kumo-contrast opacity-10 transition-opacity hover:opacity-20 active:opacity-30" />
        </ScrollAreaBase.Scrollbar>
      </ScrollAreaBase.Root>
    </LayerCard.Primary>
  );
}

LayerDialogBody.displayName = "LayerDialog.Body";

function LayerDialogIconClose({ disabled }: { disabled: boolean }) {
  const close = (closeProps: ComponentPropsWithoutRef<"button">) => (
    <Button
      {...closeProps}
      aria-label="Close dialog"
      disabled={disabled}
      icon={X}
      shape="square"
      size="sm"
      variant="ghost"
    />
  );

  return <DrawerBase.Close render={close} />;
}

export type LayerDialogPrimaryProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "className"
> & {
  children: ReactNode;
  loading?: boolean;
};

export interface LayerDialogActionsProps {
  children: ReactElement<LayerDialogPrimaryProps>;
  /** Use cancellation wording for a workflow that has an explicit cancel outcome. */
  dismissLabel?: "close" | "cancel";
}

function LayerDialogPrimary({
  children,
  loading,
  ...props
}: LayerDialogPrimaryProps) {
  const isAlert = useContext(AlertContext);

  return (
    <Button
      {...props}
      loading={loading}
      variant={isAlert ? "destructive" : "primary"}
    >
      {children}
    </Button>
  );
}

LayerDialogPrimary.displayName = "LayerDialog.Actions.Primary";

const LayerDialogActions = Object.assign(
  function LayerDialogActions({
    children,
    dismissLabel,
  }: LayerDialogActionsProps) {
    const dismissDisabled = useContext(DismissDisabledContext);
    const isAlert = useContext(AlertContext);
    const label = dismissLabel ?? (isAlert ? "cancel" : "close");

    if (!isValidElement(children) || children.type !== LayerDialogPrimary) {
      throw new Error(
        "LayerDialog.Actions requires exactly one direct LayerDialog.Actions.Primary.",
      );
    }

    return (
      <div className="flex w-full shrink-0 items-center justify-between gap-2 pt-2 pb-1">
        <LayerDialogDismiss disabled={dismissDisabled} label={label} />
        {children}
      </div>
    );
  },
  {
    Primary: LayerDialogPrimary,
    displayName: "LayerDialog.Actions",
  },
);

function LayerDialogDismiss({
  disabled,
  label,
}: {
  disabled: boolean;
  label: "close" | "cancel";
}) {
  const close = (closeProps: ComponentPropsWithoutRef<"button">) => (
    <Button {...closeProps} disabled={disabled} variant="ghost">
      {label === "cancel" ? "Cancel" : "Close"}
    </Button>
  );

  return <DrawerBase.Close render={close} />;
}

const LayerDialog = Object.assign(LayerDialogRoot, {
  Root: LayerDialogRoot,
  Alert: LayerDialogAlert,
  Trigger: LayerDialogTrigger,
  Content: LayerDialogContent,
  Title: LayerDialogTitle,
  Body: LayerDialogBody,
  Actions: LayerDialogActions,
});

export {
  LayerDialog,
  LayerDialogRoot,
  LayerDialogAlert,
  LayerDialogTrigger,
  LayerDialogContent,
  LayerDialogTitle,
  LayerDialogBody,
  LayerDialogActions,
};
