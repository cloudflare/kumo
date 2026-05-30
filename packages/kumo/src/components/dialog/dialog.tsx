import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Dialog as DialogBase } from "@base-ui/react/dialog";
import { AlertDialog as AlertDialogBase } from "@base-ui/react/alert-dialog";
import { LayerCard } from "../layer-card";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";
import {
  usePortalContainer,
  type PortalContainer,
} from "../../utils/portal-provider";

/** Dialog size variant definitions mapping sizes to their minimum widths. */
export const KUMO_DIALOG_VARIANTS = {
  size: {
    base: {
      classes: "sm:min-w-96",
      description: "Default dialog width",
    },
    sm: {
      classes: "min-w-72",
      description: "Small dialog for simple confirmations",
    },
    lg: {
      classes: "min-w-[32rem]",
      description: "Large dialog for complex content",
    },
    xl: {
      classes: "min-w-[48rem]",
      description: "Extra large dialog for detailed views",
    },
    "2xl": {
      classes: "min-w-[64rem]",
      description:
        "Wide dialog for data-dense layouts (tables, side-by-side forms)",
    },
  },
  role: {
    dialog: {
      classes: "",
      description: "Standard dialog for general-purpose modals",
    },
    alertdialog: {
      classes: "",
      description:
        "Alert dialog for confirmation flows requiring explicit user acknowledgment",
    },
  },
  verticalAlign: {
    center: {
      classes: "top-1/2 -translate-y-1/2",
      description: "Vertically centered in the viewport (default)",
    },
    top: {
      classes: "",
      description:
        "Anchored to the top of the viewport. Use `topOffset` to set the gap from the top edge (defaults to 0).",
    },
  },
} as const;

export const KUMO_DIALOG_DEFAULT_VARIANTS = {
  size: "base",
  role: "dialog",
  verticalAlign: "center",
} as const;

export const KUMO_DIALOG_STYLING = {
  dimensions: {
    sm: {
      width: 350,
      titleSize: 20,
      descSize: 16,
      padding: 16,
      gap: 8,
      buttonSize: "sm",
    },
    base: {
      width: 384,
      titleSize: 20,
      descSize: 16,
      padding: 24,
      gap: 16,
      buttonSize: "base",
    },
    lg: {
      width: 512,
      titleSize: 20,
      descSize: 16,
      padding: 24,
      gap: 16,
      buttonSize: "base",
    },
    xl: {
      width: 768,
      titleSize: 20,
      descSize: 16,
      padding: 24,
      gap: 16,
      buttonSize: "base",
    },
    "2xl": {
      width: 1024,
      titleSize: 20,
      descSize: 16,
      padding: 24,
      gap: 16,
      buttonSize: "base",
    },
  },
  baseTokens: {
    background: "color-surface",
    text: "text-color-surface",
    borderRadius: 12,
    shadow: "shadow-m",
  },
  backdrop: {
    background: "color-surface-secondary",
    opacity: 0.8,
  },
  header: {
    title: { fontWeight: 600, color: "text-color-surface" },
    closeIcon: { name: "ph-x", size: 20, color: "text-color-muted" },
  },
  description: {
    fontWeight: 400,
    color: "text-color-muted",
  },
  buttons: {
    primary: { background: "color-primary", text: "white" },
    secondary: { ring: "color-border", text: "text-color-surface" },
  },
} as const;

// Derived types from KUMO_DIALOG_VARIANTS
export type KumoDialogSize = keyof typeof KUMO_DIALOG_VARIANTS.size;
export type KumoDialogRole = keyof typeof KUMO_DIALOG_VARIANTS.role;
export type KumoDialogVerticalAlign =
  keyof typeof KUMO_DIALOG_VARIANTS.verticalAlign;

export interface KumoDialogVariantsProps {
  /**
   * Dialog width.
   * - `"sm"` — Small (min 288px) for simple confirmations
   * - `"base"` — Default (min 384px)
   * - `"lg"` — Large (min 512px) for complex content
   * - `"xl"` — Extra large (min 768px) for detailed views
   * - `"2xl"` — Wide (min 1024px) for data-dense layouts (tables, side-by-side forms)
   * @default "base"
   */
  size?: KumoDialogSize;
  /**
   * Vertical alignment of the dialog within the viewport.
   * - `"center"` — Vertically centered (default).
   * - `"top"` — Anchored to the top of the viewport. Combine with `topOffset` to set the gap from the top edge.
   * @default "center"
   */
  verticalAlign?: KumoDialogVerticalAlign;
  /**
   * Distance in pixels from the top of the viewport when `verticalAlign="top"`.
   * Ignored when `verticalAlign="center"`. Use this to clear a fixed header (e.g. `topOffset={49}` for a 49px navbar).
   * @default 0
   */
  topOffset?: number;
}

// ============================================================================
// Dialog Role Context
// ============================================================================

const DialogRoleContext = createContext<KumoDialogRole>("dialog");

function useDialogRole() {
  return useContext(DialogRoleContext);
}

export function dialogVariants({
  size = KUMO_DIALOG_DEFAULT_VARIANTS.size,
  verticalAlign = KUMO_DIALOG_DEFAULT_VARIANTS.verticalAlign,
}: KumoDialogVariantsProps = {}) {
  return cn(
    // Base styles (horizontal centering + sizing constraints common to all alignments)
    "shadow-m ring ring-kumo-line fixed left-1/2 w-full sm:w-auto max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] -translate-x-1/2 overflow-hidden rounded-xl bg-kumo-base text-kumo-default duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0",
    // Apply size from KUMO_DIALOG_VARIANTS
    resolveVariant(
      KUMO_DIALOG_VARIANTS.size,
      size,
      KUMO_DIALOG_DEFAULT_VARIANTS.size,
    ).classes,
    // Apply vertical alignment (`center` adds top-1/2 + -translate-y-1/2; `top` is offset via inline style)
    resolveVariant(
      KUMO_DIALOG_VARIANTS.verticalAlign,
      verticalAlign,
      KUMO_DIALOG_DEFAULT_VARIANTS.verticalAlign,
    ).classes,
  );
}

/**
 * Dialog component props — the modal content panel.
 *
 * @example
 * ```tsx
 * <Dialog.Root>
 *   <Dialog.Trigger render={(p) => <Button {...p}>Open</Button>} />
 *   <Dialog className="p-8">
 *     <Dialog.Title>Confirm Action</Dialog.Title>
 *     <Dialog.Description>Are you sure?</Dialog.Description>
 *     <Dialog.Close render={(p) => <Button {...p}>Cancel</Button>} />
 *   </Dialog>
 * </Dialog.Root>
 * ```
 */
export type DialogProps = KumoDialogVariantsProps & {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Dialog content (typically Title, Description, Close, and action buttons). */
  children: ReactNode;
  /** Inline styles. */
  style?: CSSProperties;
  /**
   * Container element for the portal. Use this to render the dialog inside
   * a Shadow DOM or custom container. Overrides `KumoPortalProvider` context.
   * @default document.body (or KumoPortalProvider container if set)
   */
  container?: PortalContainer;
};

/**
 * Modal dialog overlay with backdrop. Compound component with `Dialog.Root`,
 * `Dialog.Trigger`, `Dialog.Title`, `Dialog.Description`, and `Dialog.Close`.
 *
 * @example
 * ```tsx
 * <Dialog.Root>
 *   <Dialog.Trigger render={(p) => <Button {...p}>Delete</Button>} />
 *   <Dialog className="p-8">
 *     <Dialog.Title>Delete Item</Dialog.Title>
 *     <Dialog.Description>This action cannot be undone.</Dialog.Description>
 *     <Dialog.Close render={(p) => <Button variant="destructive" {...p}>Delete</Button>} />
 *   </Dialog>
 * </Dialog.Root>
 * ```
 *
 * @example Alert Dialog for destructive actions
 * ```tsx
 * <Dialog.Root role="alertdialog">
 *   <Dialog.Trigger render={(p) => <Button variant="destructive" {...p}>Delete Project</Button>} />
 *   <Dialog className="p-8">
 *     <Dialog.Title>Delete Project?</Dialog.Title>
 *     <Dialog.Description>This action cannot be undone.</Dialog.Description>
 *     <Dialog.Close render={(p) => <Button variant="secondary" {...p}>Cancel</Button>} />
 *     <Dialog.Close render={(p) => <Button variant="destructive" {...p}>Delete</Button>} />
 *   </Dialog>
 * </Dialog.Root>
 * ```
 */
function DialogContent({
  className,
  children,
  style,
  size = KUMO_DIALOG_DEFAULT_VARIANTS.size,
  verticalAlign = KUMO_DIALOG_DEFAULT_VARIANTS.verticalAlign,
  topOffset,
  container: containerProp,
}: DialogProps) {
  const role = useDialogRole();
  const contextContainer = usePortalContainer();
  const container = containerProp ?? contextContainer ?? undefined;

  const BasePortal =
    role === "alertdialog" ? AlertDialogBase.Portal : DialogBase.Portal;
  const BaseBackdrop =
    role === "alertdialog" ? AlertDialogBase.Backdrop : DialogBase.Backdrop;
  const BasePopup =
    role === "alertdialog" ? AlertDialogBase.Popup : DialogBase.Popup;

  // When verticalAlign="top", apply an inline `top` so callers can clear a
  // fixed header (e.g. topOffset={49} for a 49px navbar). `center` ignores
  // topOffset because the variant's class string already pins top:50%.
  const positionStyle: CSSProperties =
    verticalAlign === "top" ? { top: `${topOffset ?? 0}px` } : {};

  return (
    <BasePortal container={container}>
      <BaseBackdrop className="fixed inset-0 bg-kumo-recessed opacity-80 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <LayerCard
        render={<BasePopup />}
        className={cn(dialogVariants({ size, verticalAlign }), className)}
        style={
          {
            transitionProperty: "scale, opacity",
            transitionTimingFunction:
              "var(--default-transition-timing-function)",
            "--tw-shadow":
              "0 20px 25px -5px rgb(0 0 0 / 0.03), 0 8px 10px -6px rgb(0 0 0 / 0.03)",
            ...positionStyle,
            ...style,
          } as CSSProperties
        }
      >
        {children}
      </LayerCard>
    </BasePortal>
  );
}

// ============================================================================
// Dialog Root
// ============================================================================

type BaseDialogRootProps = ComponentPropsWithoutRef<typeof DialogBase.Root>;
type BaseAlertDialogRootProps = ComponentPropsWithoutRef<
  typeof AlertDialogBase.Root
>;

/**
 * `onOpenChange` reasons that represent user-initiated dismissal of an open
 * dialog. When `busy={true}`, these are swallowed so a Save / Submit handler
 * in flight cannot be cancelled by accident.
 *
 * `triggerPress`, `imperativeAction`, and `none` are intentionally NOT
 * swallowed: callers may still close the dialog programmatically (e.g. after
 * the async work completes and clears `busy`), and the trigger button is
 * usually disabled by the busy UI anyway.
 *
 * These string values come from base-ui's REASONS constants
 * (`@base-ui/react/internals/reasons`). They aren't imported directly because
 * base-ui marks the `internals` path as private — the values are part of the
 * stable public surface via the `DialogRootChangeEventReason` type union, but
 * the constants live in an internal module. If base-ui ever renames a reason,
 * the `DISMISSAL_REASONS` runtime check would silently miss it; the
 * accompanying dialog tests cover all four reasons to catch that drift.
 */
const DISMISSAL_REASONS = new Set<string>([
  "outside-press",
  "escape-key",
  "close-press",
  "focus-out",
]);

/**
 * `busy` prop description shared between standard and alert dialog roots.
 * Kept in one place so `Dialog.Root` and `Dialog.Root role="alertdialog"`
 * stay in sync.
 */
type BusyProp = {
  /**
   * When `true`, blocks user-initiated dismissal (Escape key, outside click,
   * focus-out, and any `<Dialog.Close>` button presses). Use this while an
   * async action triggered from inside the dialog is in flight, so a stray
   * keystroke or backdrop click cannot abandon a Save mid-flight.
   *
   * Programmatic close (`open={false}` from the parent, or `actionsRef.close()`)
   * still works, so the dialog can be dismissed when the async work resolves.
   *
   * @default false
   */
  busy?: boolean;
};

type StandardDialogRootProps = BaseDialogRootProps &
  BusyProp & {
    /**
     * The ARIA role for the dialog.
     * - `"dialog"` — Standard dialog for general-purpose modals. Dismissible via outside click by default.
     * - `"alertdialog"` — Alert dialog for destructive or confirmation flows. Not dismissible via outside click.
     *
     * Use `role="alertdialog"` for:
     * - Destructive actions (delete, discard, remove)
     * - Confirmation dialogs requiring explicit user acknowledgment
     * - Actions that cannot be undone
     *
     * @default "dialog"
     */
    role?: "dialog";
  };

type AlertDialogRootProps = BaseAlertDialogRootProps &
  BusyProp & {
    role: "alertdialog";
  };

export type DialogRootProps = StandardDialogRootProps | AlertDialogRootProps;

/**
 * Wraps a user-supplied `onOpenChange` to swallow dismissal events when
 * `busy` is true. The base-ui `details.reason` is the source of truth; we
 * match against `DISMISSAL_REASONS` so we don't accidentally block
 * programmatic closes.
 */
function makeBusyAwareOpenChange<TDetails extends { reason?: string | null }>(
  busy: boolean | undefined,
  original: ((open: boolean, details: TDetails) => void) | undefined,
) {
  if (!busy) return original;
  return (open: boolean, details: TDetails) => {
    if (!open && details?.reason && DISMISSAL_REASONS.has(details.reason)) {
      return;
    }
    original?.(open, details);
  };
}

function DialogRoot(props: DialogRootProps) {
  if (props.role === "alertdialog") {
    const { children, role, busy, onOpenChange, ...rootProps } = props;

    return (
      <DialogRoleContext.Provider value={role}>
        <AlertDialogBase.Root
          {...rootProps}
          onOpenChange={makeBusyAwareOpenChange(busy, onOpenChange)}
        >
          {children}
        </AlertDialogBase.Root>
      </DialogRoleContext.Provider>
    );
  }

  const {
    children,
    role = KUMO_DIALOG_DEFAULT_VARIANTS.role,
    busy,
    onOpenChange,
    ...rootProps
  } = props;

  return (
    <DialogRoleContext.Provider value={role}>
      <DialogBase.Root
        {...rootProps}
        onOpenChange={makeBusyAwareOpenChange(busy, onOpenChange)}
      >
        {children}
      </DialogBase.Root>
    </DialogRoleContext.Provider>
  );
}

DialogRoot.displayName = "Dialog.Root";

// ============================================================================
// Dialog Trigger
// ============================================================================

type BaseDialogTriggerProps = ComponentPropsWithoutRef<
  typeof DialogBase.Trigger
>;
type BaseAlertDialogTriggerProps = ComponentPropsWithoutRef<
  typeof AlertDialogBase.Trigger
>;

export type DialogTriggerProps =
  | BaseDialogTriggerProps
  | BaseAlertDialogTriggerProps;

function DialogTrigger({ children, ...props }: DialogTriggerProps) {
  const role = useDialogRole();

  if (role === "alertdialog") {
    return (
      <AlertDialogBase.Trigger
        data-kumo-component="Dialog"
        data-kumo-part="trigger"
        {...(props as BaseAlertDialogTriggerProps)}
      >
        {children}
      </AlertDialogBase.Trigger>
    );
  }

  return (
    <DialogBase.Trigger
      data-kumo-component="Dialog"
      data-kumo-part="trigger"
      {...props}
    >
      {children}
    </DialogBase.Trigger>
  );
}

DialogTrigger.displayName = "Dialog.Trigger";

// ============================================================================
// Dialog Title
// ============================================================================

type BaseDialogTitleProps = ComponentPropsWithoutRef<typeof DialogBase.Title>;

export type DialogTitleProps = BaseDialogTitleProps;

function DialogTitle({ className, ...props }: DialogTitleProps) {
  const role = useDialogRole();
  const BaseTitle =
    role === "alertdialog" ? AlertDialogBase.Title : DialogBase.Title;
  return <BaseTitle className={className} {...props} />;
}

DialogTitle.displayName = "Dialog.Title";

// ============================================================================
// Dialog Description
// ============================================================================

type BaseDialogDescriptionProps = ComponentPropsWithoutRef<
  typeof DialogBase.Description
>;

export type DialogDescriptionProps = BaseDialogDescriptionProps;

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  const role = useDialogRole();
  const BaseDescription =
    role === "alertdialog"
      ? AlertDialogBase.Description
      : DialogBase.Description;
  return <BaseDescription className={className} {...props} />;
}

DialogDescription.displayName = "Dialog.Description";

// ============================================================================
// Dialog Close
// ============================================================================

type BaseDialogCloseProps = ComponentPropsWithoutRef<typeof DialogBase.Close>;

export type DialogCloseProps = BaseDialogCloseProps;

function DialogClose({ children, ...props }: DialogCloseProps) {
  const role = useDialogRole();
  const BaseClose =
    role === "alertdialog" ? AlertDialogBase.Close : DialogBase.Close;
  return (
    <BaseClose data-kumo-component="Dialog" data-kumo-part="close" {...props}>
      {children}
    </BaseClose>
  );
}

DialogClose.displayName = "Dialog.Close";

// ============================================================================
// Compound Component Export
// ============================================================================

const Dialog = Object.assign(DialogContent, {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
});

export {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
