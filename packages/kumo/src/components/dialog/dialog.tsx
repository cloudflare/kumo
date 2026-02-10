import type { CSSProperties, FC, ReactNode } from "react";
import { Dialog as DialogBase } from "@base-ui/react/dialog";
import { Surface } from "../surface";
import { cn } from "../../utils/cn";

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
  },
} as const;

export const KUMO_DIALOG_DEFAULT_VARIANTS = {
  size: "base",
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

export interface KumoDialogVariantsProps {
  /**
   * Dialog width.
   * - `"sm"` — Small (min 288px) for simple confirmations
   * - `"base"` — Default (min 384px)
   * - `"lg"` — Large (min 512px) for complex content
   * - `"xl"` — Extra large (min 768px) for detailed views
   * @default "base"
   */
  size?: KumoDialogSize;
}

export function dialogVariants({
  size = KUMO_DIALOG_DEFAULT_VARIANTS.size,
}: KumoDialogVariantsProps = {}) {
  return cn(
    // Base styles
    "shadow-m z-modal fixed top-1/2 left-1/2 w-full sm:w-auto max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-kumo-base text-kumo-default duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0",
    // Apply size from KUMO_DIALOG_VARIANTS
    KUMO_DIALOG_VARIANTS.size[size].classes,
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
 */
function DialogContent({
  className,
  children,
  style,
  size = KUMO_DIALOG_DEFAULT_VARIANTS.size,
}: DialogProps) {
  return (
    <DialogBase.Portal>
      <DialogBase.Backdrop className="z-modal fixed inset-0 bg-kumo-overlay opacity-80 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <Surface
        as={DialogBase.Popup}
        className={cn(dialogVariants({ size }), className)}
        style={
          {
            transitionProperty: "scale, opacity",
            transitionTimingFunction:
              "var(--default-transition-timing-function)",
            "--tw-shadow":
              "0 20px 25px -5px rgb(0 0 0 / 0.03), 0 8px 10px -6px rgb(0 0 0 / 0.03)",
            ...style,
          } as CSSProperties
        }
      >
        {children}
      </Surface>
    </DialogBase.Portal>
  );
}

type DialogComponent = FC<DialogProps> & {
  Root: typeof DialogBase.Root;
  Trigger: typeof DialogBase.Trigger;
  Title: typeof DialogBase.Title;
  Description: typeof DialogBase.Description;
  Close: typeof DialogBase.Close;
};

const Dialog = Object.assign(DialogContent, {
  Root: DialogBase.Root,
  Trigger: DialogBase.Trigger,
  Title: DialogBase.Title,
  Description: DialogBase.Description,
  Close: DialogBase.Close,
}) as DialogComponent;

const DialogRoot = Dialog.Root;
const DialogTrigger = Dialog.Trigger;
const DialogTitle = Dialog.Title;
const DialogDescription = Dialog.Description;
const DialogClose = Dialog.Close;

export {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
