import type { CSSProperties, ReactNode } from "react";
import { Dialog as DialogBase } from "@base-ui-components/react";
import { Surface } from "../surface/surface";
import { cn } from "../utils";

export const DialogRoot = DialogBase.Root;
export const DialogTrigger = DialogBase.Trigger;
export const DialogTitle = DialogBase.Title;
export const DialogDescription = DialogBase.Description;
export const DialogClose = DialogBase.Close;

export function Dialog({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <DialogBase.Portal>
      <DialogBase.Backdrop className="fixed inset-0 bg-neutral-100 dark:bg-black opacity-80 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <Surface
        as={DialogBase.Popup}
        className={cn(
          `fixed left-1/2 min-w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-xl bg-surface dark:bg-surface-secondary dark:text-white text-neutral-900 duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 overflow-hidden shadow-m top-8 z-modal`,
          className
        )}
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
