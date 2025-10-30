import { Select as SelectBase } from "@base-ui-components/react/select";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils";
import { buttonVariants } from "../button/button";

type SelectProps = ComponentPropsWithoutRef<typeof SelectBase.Root> & {
  renderValue?: (value: string | null) => ReactNode;
  className?: string;
};

export function Select({
  children,
  className,
  renderValue,
  ...props
}: SelectProps) {
  return (
    <SelectBase.Root {...props}>
      <SelectBase.Trigger
        className={cn(
          buttonVariants(),
          "font-normal justify-between",
          "focus-visible:ring-active outline-none focus:opacity-100 focus-visible:ring-1 *:in-focus:opacity-100",
          className
        )}
      >
        <SelectBase.Value>{renderValue}</SelectBase.Value>
        <SelectBase.Icon>
          <CaretUpDownIcon />
        </SelectBase.Icon>
      </SelectBase.Trigger>
      <SelectBase.Portal>
        <SelectBase.Positioner>
          <SelectBase.Popup
            className={cn(
              "z-50 bg-surface dark:bg-neutral-900 text-surface overflow-hidden", // background
              "ring ring-neutral-950/10 dark:ring-neutral-800 shadow-lg rounded-lg", // border part
              // 3px adjustment to account for padding + border differences
              "min-w-[calc(var(--anchor-width)+3px)] p-1.5" // spacing
            )}
          >
            {children}
          </SelectBase.Popup>
        </SelectBase.Positioner>
      </SelectBase.Portal>
    </SelectBase.Root>
  );
}

export function Option({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) {
  return (
    <SelectBase.Item
      value={value}
      className="data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-800 px-2 rounded py-1.5 text-base flex items-center justify-between gap-2 group cursor-pointer"
    >
      <SelectBase.ItemText>{children}</SelectBase.ItemText>
      <SelectBase.ItemIndicator>
        <CheckIcon />
      </SelectBase.ItemIndicator>
    </SelectBase.Item>
  );
}
