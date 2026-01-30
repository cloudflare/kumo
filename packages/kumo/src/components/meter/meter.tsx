import { Meter as BaseMeter } from "@base-ui/react/meter";
import { type ComponentPropsWithoutRef } from "react";
import { cn } from "../../utils/cn";

export const KUMO_METER_VARIANTS = {
  // Meter currently has no variant options but structure is ready for future additions
} as const;

export const KUMO_METER_DEFAULT_VARIANTS = {} as const;

// Derived types from KUMO_METER_VARIANTS
export interface KumoMeterVariantsProps {}

export function meterVariants(_props: KumoMeterVariantsProps = {}) {
  return cn(
    // Base styles
    "flex w-full flex-col gap-2",
  );
}

type RootProps = ComponentPropsWithoutRef<typeof BaseMeter.Root>;

export interface MeterProps extends RootProps, KumoMeterVariantsProps {
  customValue?: string;
  label: string;
  showValue?: boolean;
  trackClassName?: string;
  indicatorClassName?: string;
}

export function Meter({
  value,
  customValue,
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
      className={cn("flex w-full flex-col gap-2", className)}
    >
      <div className="flex items-center justify-between gap-4">
        <BaseMeter.Label className="text-xs text-kumo-strong">
          {label}
        </BaseMeter.Label>
        {customValue ? (
          <span className="text-sm font-medium text-kumo-default tabular-nums">
            {customValue}
          </span>
        ) : (
          <>
            {showValue && (
              <BaseMeter.Value className="text-sm font-medium text-kumo-default tabular-nums" />
            )}
          </>
        )}
      </div>
      <BaseMeter.Track
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-kumo-fill",
          trackClassName,
        )}
      >
        <BaseMeter.Indicator
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-kumo-brand via-kumo-brand to-kumo-brand transition-[width] duration-300 ease-out",
            indicatorClassName,
          )}
        />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
