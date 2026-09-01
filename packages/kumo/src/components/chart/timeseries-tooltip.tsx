import { memo } from "react";
import type { TimeseriesMarker } from "./timeseries-markers";

export interface TooltipRow {
  name: string;
  value: number;
  color: string;
}

export interface SeriesTooltipState {
  type: "series";
  ts: number;
  rows: TooltipRow[];
  hiddenCount: number;
}

export interface MarkerTooltipState {
  type: "marker";
  ts: number;
  color: string;
  markers: TimeseriesMarker[];
  rows: TooltipRow[];
  hiddenCount: number;
}

export type TooltipState = SeriesTooltipState | MarkerTooltipState;

export interface TooltipContentProps {
  state: TooltipState;
  formatValue?: (v: number) => string;
  formatTimestamp: (ts: number | string | Date) => string;
}

export const TooltipContent = memo(function TooltipContent({
  state,
  formatValue,
  formatTimestamp,
}: TooltipContentProps) {
  if (state.type === "marker") {
    return (
      <MarkerTooltipContent
        state={state}
        formatValue={formatValue}
        formatTimestamp={formatTimestamp}
      />
    );
  }

  return (
    <>
      <div className="mb-1 text-xs font-semibold text-kumo-default">
        {formatTimestamp(state.ts)}
      </div>
      <SeriesTooltipRows
        rows={state.rows}
        hiddenCount={state.hiddenCount}
        formatValue={formatValue}
      />
    </>
  );
});

function MarkerTooltipContent({
  state,
  formatValue,
  formatTimestamp,
}: {
  state: MarkerTooltipState;
  formatValue?: (v: number) => string;
  formatTimestamp: (ts: number | string | Date) => string;
}) {
  return (
    <>
      {state.markers.length === 1 && (
        <div className="mb-1 text-xs font-semibold text-kumo-default">
          {formatTimestamp(state.markers[0].timestamp)}
        </div>
      )}
      <div className="space-y-1">
        {state.markers.map((marker, index) => (
          <div key={`${marker.timestamp}-${marker.label}-${index}`}>
            <div className="flex items-center gap-2 text-xs text-kumo-default">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: marker.color ?? state.color }}
              />
              <span className="font-medium">
                {marker.label ?? "Reference marker"}
              </span>
              {state.markers.length > 1 && (
                <span className="text-kumo-subtle">
                  {formatTimestamp(marker.timestamp)}
                </span>
              )}
            </div>
            {marker.description && (
              <div className="mt-0.5 ml-5 text-xs text-kumo-default">
                {marker.description}
              </div>
            )}
          </div>
        ))}
      </div>
      {state.rows.length > 0 && (
        <div className="mt-2 border-t border-kumo-line pt-2">
          <SeriesTooltipRows
            rows={state.rows}
            hiddenCount={state.hiddenCount}
            formatValue={formatValue}
          />
        </div>
      )}
    </>
  );
}

function SeriesTooltipRows({
  rows,
  hiddenCount,
  formatValue,
}: {
  rows: TooltipRow[];
  hiddenCount: number;
  formatValue?: (v: number) => string;
}) {
  return (
    <>
      {rows.map((row) => (
        <div
          key={row.name}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span
              className="truncate text-xs font-medium text-kumo-default"
              title={row.name}
            >
              {row.name}
            </span>
          </div>
          <span className="shrink-0 text-xs font-semibold text-kumo-default">
            {formatValue
              ? formatValue(row.value)
              : formatDefaultValue(row.value)}
          </span>
        </div>
      ))}
      {hiddenCount > 0 && (
        <div className="mt-1 text-xs text-kumo-subtle">+{hiddenCount} more</div>
      )}
    </>
  );
}

const defaultNumberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 3,
});

function formatDefaultValue(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return defaultNumberFormat.format(value);
}
