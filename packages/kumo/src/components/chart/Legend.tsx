import { cn } from "../../utils";

interface LegendItemProps {
  name: string;
  color: string;
  value: string;
  unit?: string;
  inactive?: boolean;
}

function LargeItem({ color, value, name, unit, inactive }: LegendItemProps) {
  return (
    <div className="inline-flex flex-col gap-2 min-w-42 py-2">
      <div className="flex items-center gap-2">
        <span
          className={cn("size-2 rounded-full inline-block", {
            "opacity-50": inactive,
          })}
          style={{ backgroundColor: color }}
        />
        <span className={cn("text-xs", { "opacity-50": inactive })}>
          {name}
        </span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span
          className={cn("text-lg font-medium leading-none", {
            "opacity-50": inactive,
          })}
        >
          {value}
        </span>
        {unit && (
          <span
            className={cn("text-xs text-kumo-subtle leading-none", {
              "opacity-50": inactive,
            })}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function SmallItem({ color, value, name, inactive }: LegendItemProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn("size-2 rounded-full inline-block", {
          "opacity-50": inactive,
        })}
        style={{ backgroundColor: color }}
      />
      <span className={cn("text-xs", { "opacity-50": inactive })}>{name}</span>
      <span className={cn("text-xs font-medium", { "opacity-50": inactive })}>
        {value}
      </span>
    </div>
  );
}

export const ChartLegend = {
  SmallItem,
  LargeItem,
};
