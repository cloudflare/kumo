import { CaretDownIcon } from "@phosphor-icons/react";
import { type PropsWithChildren, useCallback } from "react";
import { cn } from "../utils";

type ExpandableProps = PropsWithChildren<{
  title: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}>;

export function Expandable({
  title,
  open,
  onOpenChange,
  children,
  className,
}: ExpandableProps) {
  const handleOpen = useCallback(() => {
    onOpenChange?.(!open);
  }, [open, onOpenChange]);

  return (
    <div>
      <div
        className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 cursor-pointer select-none"
        onClick={handleOpen}
      >
        {title}{" "}
        <CaretDownIcon
          className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
        />
      </div>
      {open && (
        <div
          className={cn(
            "pl-4 space-y-4 border-l-2 border-color my-2",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
