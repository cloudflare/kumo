import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useRef,
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
import { resolveVariant } from "../../utils/resolve-variant";
import {
  usePortalContainer,
  type PortalContainer,
} from "../../utils/portal-provider";

export const KUMO_LAYER_DIALOG_VARIANTS = {
  size: {
    sm: {
      classes: "sm:max-w-md",
      description: "Compact desktop dialog width (448px)",
    },
    base: {
      classes: "sm:max-w-xl",
      description: "Default desktop dialog width (576px)",
    },
    lg: {
      classes: "sm:max-w-2xl",
      description: "Large desktop dialog width (672px)",
    },
    xl: {
      classes: "sm:max-w-3xl",
      description: "Extra large desktop dialog width (768px)",
    },
  },
  verticalAlign: {
    top: {
      classes: "sm:items-start sm:pt-16 sm:pb-6",
      description: "Align the desktop dialog near the top of the viewport",
    },
    center: {
      classes: "sm:items-center sm:py-6",
      description: "Center the desktop dialog vertically",
    },
  },
} as const;

export const KUMO_LAYER_DIALOG_DEFAULT_VARIANTS = {
  size: "base",
  verticalAlign: "center",
} as const;

export type KumoLayerDialogSize = keyof typeof KUMO_LAYER_DIALOG_VARIANTS.size;
export type KumoLayerDialogVerticalAlign =
  keyof typeof KUMO_LAYER_DIALOG_VARIANTS.verticalAlign;

const DesktopContext = createContext(false);
const DismissDisabledContext = createContext(false);
const AlertContext = createContext(false);

/**
 * Slots that `LayerDialog.Content` hands to `LayerDialog.Body` so the title
 * frame, optional description, and automatic X render inside the body surface.
 * Private on purpose: consumers compose these as siblings, never as Body props.
 */
interface BodySlots {
  title: ReactNode;
  description: ReactNode;
  showCloseButton: boolean;
}

const BodySlotsContext = createContext<BodySlots>({
  title: null,
  description: null,
  showCloseButton: false,
});

type RootProps = ComponentPropsWithoutRef<typeof DrawerBase.Root>;

export type LayerDialogRootProps = RootProps & {
  /** Prevent every user-initiated dismissal while dialog work is pending. */
  dismissDisabled?: boolean;
};

/** Props for `LayerDialog` / `LayerDialog.Root`. */
export type LayerDialogProps = LayerDialogRootProps;

/**
 * Close reasons that originate from the user. Programmatic closes
 * (`actionsRef.current.close()`, controlled `open` changes) are never blocked.
 */
const USER_DISMISSAL_REASONS: ReadonlySet<string> = new Set([
  "close-press",
  "close-watcher",
  "escape-key",
  "outside-press",
  "swipe",
  "trigger-press",
]);

function LayerDialogRootImpl({
  alert,
  children,
  dismissDisabled = false,
  onOpenChange,
  disablePointerDismissal,
  modal,
  ...props
}: LayerDialogRootProps & { alert: boolean }) {
  const isDesktop = useMediaQuery("(min-width: 640px)", {
    defaultMatches: false,
  });

  const handleOpenChange: NonNullable<RootProps["onOpenChange"]> = (
    open,
    eventDetails,
  ) => {
    if (
      !open &&
      dismissDisabled &&
      USER_DISMISSAL_REASONS.has(eventDetails.reason)
    ) {
      eventDetails.cancel();
      return;
    }

    onOpenChange?.(open, eventDetails);
  };

  // Mirrors Base UI's AlertDialog.Root: alerts are always modal and never
  // dismiss on outside press, while Escape still closes them.
  const rootProps = {
    ...props,
    disablePointerDismissal:
      alert || dismissDisabled || disablePointerDismissal,
    modal: alert ? true : modal,
    onOpenChange: handleOpenChange,
  };

  return (
    <AlertContext.Provider value={alert}>
      <DesktopContext.Provider value={isDesktop}>
        <DismissDisabledContext.Provider value={dismissDisabled}>
          <DrawerBase.Root {...rootProps}>{children}</DrawerBase.Root>
        </DismissDisabledContext.Provider>
      </DesktopContext.Provider>
    </AlertContext.Provider>
  );
}

function LayerDialogRoot(props: LayerDialogRootProps) {
  return <LayerDialogRootImpl {...props} alert={false} />;
}

LayerDialogRoot.displayName = "LayerDialog.Root";

/** A confirmation dialog that requires the user to choose an explicit action. */
function LayerDialogAlert(props: LayerDialogRootProps) {
  return <LayerDialogRootImpl {...props} alert />;
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
  /**
   * Container element for the portal. Overrides `KumoPortalProvider` context.
   * @default document.body (or KumoPortalProvider container if set)
   */
  container?: PortalContainer;
  /** Desktop-only width. Mobile dialogs always remain full-width. */
  size?: KumoLayerDialogSize;
  /** Desktop-only positioning. Mobile dialogs always remain bottom sheets. */
  verticalAlign?: KumoLayerDialogVerticalAlign;
}

type SlotType =
  | typeof LayerDialogTitle
  | typeof LayerDialogDescription
  | typeof LayerDialogBody
  | typeof LayerDialogActions;

function collectSlot(children: ReactNode[], type: SlotType) {
  const matches = children.filter(
    (child) => isValidElement(child) && child.type === type,
  );
  return { element: matches[0], count: matches.length };
}

function LayerDialogContent({
  children,
  container: containerProp,
  size = KUMO_LAYER_DIALOG_DEFAULT_VARIANTS.size,
  verticalAlign = KUMO_LAYER_DIALOG_DEFAULT_VARIANTS.verticalAlign,
}: LayerDialogContentProps) {
  const contextContainer = usePortalContainer();
  const container = containerProp ?? contextContainer ?? undefined;
  const isDesktop = useContext(DesktopContext);
  const dismissDisabled = useContext(DismissDisabledContext);
  const isAlert = useContext(AlertContext);
  const childArray = Children.toArray(children);
  const title = collectSlot(childArray, LayerDialogTitle);
  const description = collectSlot(childArray, LayerDialogDescription);
  const body = collectSlot(childArray, LayerDialogBody);
  const actions = collectSlot(childArray, LayerDialogActions);
  const hasInvalidChildren = childArray.some(
    (child) =>
      !isValidElement(child) ||
      (child.type !== LayerDialogTitle &&
        child.type !== LayerDialogDescription &&
        child.type !== LayerDialogBody &&
        child.type !== LayerDialogActions),
  );

  if (
    hasInvalidChildren ||
    title.count !== 1 ||
    body.count !== 1 ||
    description.count > 1 ||
    actions.count > 1 ||
    (isAlert && actions.count !== 1)
  ) {
    throw new Error(
      isAlert
        ? "LayerDialog.Alert requires exactly one direct LayerDialog.Title, LayerDialog.Body, and LayerDialog.Actions, with an optional direct LayerDialog.Description."
        : "LayerDialog.Content requires exactly one direct LayerDialog.Title and LayerDialog.Body, with an optional direct LayerDialog.Description and LayerDialog.Actions.",
    );
  }

  const sizeConfig = resolveVariant(
    KUMO_LAYER_DIALOG_VARIANTS.size,
    size,
    KUMO_LAYER_DIALOG_DEFAULT_VARIANTS.size,
  );
  const verticalAlignConfig = resolveVariant(
    KUMO_LAYER_DIALOG_VARIANTS.verticalAlign,
    verticalAlign,
    KUMO_LAYER_DIALOG_DEFAULT_VARIANTS.verticalAlign,
  );

  const bodySlots: BodySlots = {
    title: title.element,
    description: description.element ?? null,
    showCloseButton: actions.count === 0,
  };

  return (
    <DrawerBase.Portal container={container}>
      <DrawerBase.Backdrop className="fixed inset-0 bg-kumo-recessed opacity-80 transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:opacity-0 data-[ending-style]:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-[starting-style]:opacity-0 data-[swiping]:duration-0 motion-reduce:transition-none sm:duration-200 sm:data-[ending-style]:duration-200" />
      {/*
        Desktop sizing contract: the viewport owns the vertical breathing room
        (via the verticalAlign variant) and the popup fills it with
        `max-h-full`, so the cap can never drift from the alignment padding.
        Mobile sheets are bottom-anchored and capped at 85dvh instead.
      */}
      <DrawerBase.Viewport
        className={cn(
          "fixed inset-0 flex items-end justify-center sm:px-4",
          verticalAlignConfig.classes,
        )}
        data-base-ui-swipe-ignore={
          isDesktop || dismissDisabled || isAlert ? "" : undefined
        }
      >
        <DrawerBase.Popup
          render={isAlert ? <div role="alertdialog" /> : <div />}
          className={cn(
            "fixed inset-x-0 bottom-0 flex max-h-[85dvh] min-h-0 w-full max-w-none [transform:translate3d(0,var(--drawer-swipe-movement-y,0px),0)] transform-gpu overflow-visible transition-[transform,opacity] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform outline-none data-[ending-style]:[transform:translate3d(0,100%,0)] data-[ending-style]:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-[starting-style]:[transform:translate3d(0,100%,0)] data-[swiping]:duration-0 data-[swiping]:select-none motion-reduce:transition-none sm:static sm:max-h-full sm:[transform:translate3d(0,0,0)] sm:duration-200 sm:data-[ending-style]:[transform:translate3d(0,8px,0)] sm:data-[ending-style]:opacity-0 sm:data-[ending-style]:duration-200 sm:data-[starting-style]:[transform:translate3d(0,8px,0)] sm:data-[starting-style]:opacity-0",
            sizeConfig.classes,
          )}
        >
          <LayerCard className="flex max-h-[85dvh] min-h-0 w-full flex-col overflow-hidden rounded-none bg-kumo-elevated p-1.5 shadow-[0_20px_25px_-5px_rgb(0_0_0/0.03),0_8px_10px_-6px_rgb(0_0_0/0.03)] max-sm:border-t max-sm:border-kumo-hairline max-sm:shadow-xs max-sm:ring-0 sm:max-h-full sm:rounded-xl">
            {!isDesktop && !isAlert && (
              <div aria-hidden className="flex justify-center pt-1.5 pb-3">
                <div className="h-1 w-10 rounded-full bg-kumo-fill" />
              </div>
            )}
            <DrawerBase.Content className="flex min-h-0 flex-col overflow-visible">
              <BodySlotsContext.Provider value={bodySlots}>
                {body.element}
              </BodySlotsContext.Provider>
              {actions.element}
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
    <Text {...props} as="h2" variant="heading">
      {children}
    </Text>
  );

  return <DrawerBase.Title render={title} />;
}

LayerDialogTitle.displayName = "LayerDialog.Title";

export interface LayerDialogDescriptionProps {
  children: ReactNode;
}

/**
 * Optional supporting copy rendered directly beneath the title inside the
 * sticky title frame. Also becomes the dialog's accessible description.
 */
function LayerDialogDescription({ children }: LayerDialogDescriptionProps) {
  const description = (props: ComponentPropsWithoutRef<"p">) => (
    <Text {...props} as="p" variant="secondary">
      {children}
    </Text>
  );

  return <DrawerBase.Description render={description} />;
}

LayerDialogDescription.displayName = "LayerDialog.Description";

export interface LayerDialogBodyProps {
  children: ReactNode;
}

/** Scroll distance before the header shows its divider and condenses. */
const SCROLL_THRESHOLD = 8;
/** Overflow that must remain after the description collapses (see handleScroll). */
const CONDENSE_MIN_OVERFLOW = 16;

function LayerDialogBody({ children }: LayerDialogBodyProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const descriptionClipRef = useRef<HTMLDivElement>(null);
  const dismissDisabled = useContext(DismissDisabledContext);
  const { title, description, showCloseButton } = useContext(BodySlotsContext);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const scrolled = scrollTop > SCROLL_THRESHOLD;
    setHasScrolled(scrolled);

    if (!scrolled) {
      setCondensed(false);
      return;
    }
    if (condensed) return;

    // Collapsing the description hands its height to the viewport, which
    // shrinks the scroll range. If the content only barely overflows, that
    // shrink would clamp scrollTop back under the threshold and re-expand the
    // description, so only condense when enough overflow survives the collapse.
    // Scroll events fire after layout, so this offsetHeight read is free.
    const descriptionHeight = descriptionClipRef.current?.offsetHeight ?? 0;
    const overflowAfterCollapse =
      scrollHeight - clientHeight - descriptionHeight;
    if (overflowAfterCollapse > CONDENSE_MIN_OVERFLOW) setCondensed(true);
  };

  // Without an explicit Description slot, the body copy describes the dialog
  // so assistive tech still announces the consequence text for alerts.
  const content = description ? (
    children
  ) : (
    <DrawerBase.Description render={<div />}>{children}</DrawerBase.Description>
  );

  return (
    <LayerCard.Primary className="min-h-0 flex-1 !gap-0 overflow-hidden border border-kumo-line !p-0 !ring-0">
      <div
        className={cn(
          "z-10 flex shrink-0 items-start justify-between gap-4 bg-kumo-base px-4 py-4 transition-[border-color]",
          hasScrolled
            ? "border-b border-kumo-line"
            : "border-b border-transparent",
        )}
      >
        <div className="flex min-w-0 flex-col">
          {title}
          {description && (
            // grid-template-rows 1fr -> 0fr animates an auto-height row, which
            // plain height cannot. The description stays in the DOM so
            // aria-describedby keeps working while it is clipped.
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                condensed
                  ? "grid-rows-[0fr] opacity-0"
                  : "grid-rows-[1fr] opacity-100",
              )}
              data-condensed={condensed || undefined}
            >
              <div ref={descriptionClipRef} className="min-h-0 overflow-hidden">
                <div className="pt-1">{description}</div>
              </div>
            </div>
          )}
        </div>
        {showCloseButton && <LayerDialogIconClose disabled={dismissDisabled} />}
      </div>
      <ScrollAreaBase.Root className="relative flex min-h-0 flex-1 flex-col">
        <ScrollAreaBase.Viewport
          className="min-h-0 flex-1 overscroll-none [mask-image:linear-gradient(to_bottom,transparent_0,black_min(24px,var(--scroll-area-overflow-y-start,24px)),black_calc(100%-min(24px,var(--scroll-area-overflow-y-end,24px))),transparent_100%)]"
          onScroll={handleScroll}
        >
          <ScrollAreaBase.Content className="px-4 pb-4">
            {content}
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
  /**
   * Visual emphasis of the primary action. Use `destructive` when confirming
   * an irreversible action such as a delete.
   * @default "primary"
   */
  variant?: KumoLayerDialogPrimaryVariant;
};

export type KumoLayerDialogPrimaryVariant = "primary" | "destructive";

export interface LayerDialogActionsProps {
  children: ReactElement<LayerDialogPrimaryProps>;
  /** Use cancellation wording for a workflow that has an explicit cancel outcome. */
  dismissLabel?: "close" | "cancel";
}

function LayerDialogPrimary({
  children,
  loading,
  variant = "primary",
  ...props
}: LayerDialogPrimaryProps) {
  return (
    <Button {...props} loading={loading} variant={variant}>
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
    const label = isAlert ? "cancel" : (dismissLabel ?? "close");

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
  Description: LayerDialogDescription,
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
  LayerDialogDescription,
  LayerDialogBody,
  LayerDialogActions,
};
