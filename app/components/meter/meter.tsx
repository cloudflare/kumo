import { Meter as BaseMeter } from "@base-ui-components/react/meter";
import { type ComponentPropsWithoutRef } from "react";
import { cn } from "../utils";

type RootProps = ComponentPropsWithoutRef<typeof BaseMeter.Root>;

interface MeterProps extends RootProps {
  label: string;
  showValue?: boolean;
  trackClassName?: string;
  indicatorClassName?: string;
}

export default function Meter({
  value,
  label,
  showValue = true,
  className,
  trackClassName,
  indicatorClassName,
  ...props
}: MeterProps) {
  return (
    <BaseMeter.Root
      value={value}
      {...props}
      className={cn("flex flex-col gap-2 w-full", className)}
    >
      <div className="flex items-center justify-between gap-4">
        <BaseMeter.Label className="text-xs text-neutral-600 dark:text-neutral-400">
          {label}
        </BaseMeter.Label>
        {showValue && (
          <BaseMeter.Value className="text-sm font-medium text-neutral-900 dark:text-neutral-100 tabular-nums" />
        )}
      </div>
      <BaseMeter.Track
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800",
          trackClassName
        )}
      >
        <BaseMeter.Indicator
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-blue-500 via-blue-500 to-blue-600 transition-[width] duration-300 ease-out",
            indicatorClassName
          )}
        />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}