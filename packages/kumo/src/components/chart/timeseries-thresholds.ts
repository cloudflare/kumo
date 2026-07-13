export interface TimeseriesThreshold {
  /** Y-axis value where the threshold line is rendered. */
  value: number;
  /** Optional label shown on/near the threshold line. */
  label?: string;
  /** Threshold line and label color. */
  color: string;
}

export function buildTimeseriesThresholdAnnotations(
  thresholds: TimeseriesThreshold[] | undefined,
) {
  if (!thresholds?.length) return undefined;

  return {
    markLine: {
      symbol: "none" as const,
      silent: true,
      animation: false,
      z: 9,
      lineStyle: {
        type: "dashed" as const,
        width: 1,
      },
      blur: {
        lineStyle: { opacity: 1 },
        label: { opacity: 1 },
      },
      label: {
        show: true,
        position: "insideEndTop" as const,
        formatter: (params: { name?: string }) => params.name ?? "",
      },
      data: thresholds.map((threshold) => ({
        name: threshold.label,
        yAxis: threshold.value,
        lineStyle: {
          color: threshold.color,
          width: 1,
          type: "dashed" as const,
        },
        blur: {
          lineStyle: { opacity: 1 },
          label: { opacity: 1 },
        },
        label: {
          show: Boolean(threshold.label),
          color: threshold.color,
        },
      })),
    },
  };
}

export function getThresholdValueExtent(
  thresholds: TimeseriesThreshold[] | undefined,
): { min: number; max: number } | undefined {
  if (!thresholds?.length) return undefined;

  const values = thresholds.map((threshold) => threshold.value);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
