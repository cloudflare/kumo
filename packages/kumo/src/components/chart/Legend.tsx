interface LegendItemProps {
  name: string;
  color: string;
  value: string;
  unit?: string;
}

function LargeItem({ color, value, name, unit }: LegendItemProps) {
  return (
    <div className="inline-flex flex-col gap-2 min-w-42 py-2">
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-full inline-block"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs">{name}</span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-medium leading-none">{value}</span>
        {unit && (
          <span className="text-xs text-kumo-subtle leading-none">{unit}</span>
        )}
      </div>
    </div>
  );
}

function SmallItem({ color, value, name }: LegendItemProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="size-2 rounded-full inline-block"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs">{name}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

export const ChartLegend = {
  SmallItem,
  LargeItem,
};
