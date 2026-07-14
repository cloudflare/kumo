export interface TimeseriesMarker {
  /** Unix timestamp in milliseconds. */
  timestamp: number;
  /** Short label shown on/near the marker. */
  label?: string;
  /** Optional longer tooltip/body text. */
  description?: string;
  /** Optional marker color. Defaults to a neutral/subtle chart color. */
  color?: string;
  /** Optional line style. Defaults to dashed. */
  lineStyle?: "solid" | "dashed" | "dotted";
}

export interface TimeseriesMarkerCluster {
  timestamp: number;
  label?: string;
  color?: string;
  lineStyle?: TimeseriesMarker["lineStyle"];
  markers: TimeseriesMarker[];
}

export interface TimeseriesMarkerAnnotationStyle {
  color: string;
  labelBackgroundColor: string;
}

export function buildTimeseriesMarkerAnnotations(
  clusters: TimeseriesMarkerCluster[],
  style: TimeseriesMarkerAnnotationStyle,
) {
  if (clusters.length === 0) return undefined;

  const labelStyle = {
    backgroundColor: style.labelBackgroundColor,
    padding: [2, 4],
    borderRadius: 6,
    shadowBlur: 8,
    shadowColor: style.labelBackgroundColor,
  };

  return {
    markLine: {
      symbol: "none" as const,
      silent: false,
      animation: false,
      z: 10,
      lineStyle: {
        type: "dashed" as const,
        color: style.color,
        width: 1,
      },
      emphasis: {
        lineStyle: { width: 2 },
      },
      blur: {
        lineStyle: { opacity: 1 },
        label: { opacity: 1 },
      },
      label: {
        show: true,
        formatter: (params: { name?: string }) => params.name ?? "",
        position: "insideEndTop" as const,
        color: style.color,
        ...labelStyle,
      },
      data: clusters.map((cluster) => ({
        name: cluster.label,
        xAxis: cluster.timestamp,
        lineStyle: {
          type: cluster.lineStyle ?? "dashed",
          color: cluster.color ?? style.color,
          width: 1,
        },
        emphasis: {
          lineStyle: { width: 2 },
        },
        blur: {
          lineStyle: { opacity: 1 },
          label: { opacity: 1 },
        },
        label: {
          show: Boolean(cluster.label),
          color: cluster.color ?? style.color,
          ...labelStyle,
        },
        tooltip: { marker: cluster },
      })),
    },
  };
}

export function clusterTimeseriesMarkers(
  markers: TimeseriesMarker[] | undefined,
  interval: number,
): TimeseriesMarkerCluster[] {
  if (!markers?.length) return [];

  const sorted = [...markers].sort((a, b) => a.timestamp - b.timestamp);
  const clusters: TimeseriesMarker[][] = [];

  for (const marker of sorted) {
    const previous = clusters.at(-1);
    if (
      previous &&
      marker.timestamp - previous[previous.length - 1].timestamp <= interval
    ) {
      previous.push(marker);
    } else {
      clusters.push([marker]);
    }
  }

  return clusters.map((cluster) => {
    const first = cluster[0];
    return {
      timestamp: first.timestamp,
      label: cluster.length === 1 ? first.label : `${cluster.length} changes`,
      color: first.color,
      lineStyle: first.lineStyle,
      markers: cluster,
    };
  });
}

export function getApproximateMarkerClusterInterval(
  timestamps: number[],
  tickCount: number,
): number {
  if (timestamps.length < 2) return 0;
  return (Math.max(...timestamps) - Math.min(...timestamps)) / tickCount;
}

export function getTimeseriesMarkerFromEvent(params: {
  componentType?: string;
  data?: { tooltip?: { marker?: TimeseriesMarkerCluster } };
}): TimeseriesMarkerCluster | undefined {
  if (params.componentType !== "markLine") {
    return undefined;
  }
  return params.data?.tooltip?.marker;
}
