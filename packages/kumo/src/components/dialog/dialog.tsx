import type { CSSProperties, FC, ReactNode } from "react";
import { Dialog as DialogBase } from "@base-ui/react/dialog";
import { Surface } from "../surface";
import { cn } from "../../utils/cn";

export const KUMO_DIALOG_VARIANTS = {
  size: {
    base: {
      classes: "min-w-96",
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
  size?: KumoDialogSize;
}

export function dialogVariants({
  size = KUMO_DIALOG_DEFAULT_VARIANTS.size,
}: KumoDialogVariantsProps = {}) {
  return cn(
    // Base styles
    "shadow-m z-modal fixed top-1/2 left-1/2 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-kumo-base text-kumo-default duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0",
    // Apply size from KUMO_DIALOG_VARIANTS
    KUMO_DIALOG_VARIANTS.size[size].classes,
  );
}

export type DialogProps = KumoDialogVariantsProps & {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
};

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
