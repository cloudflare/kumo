import type * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { useMemo, useCallback } from "react";
import { Chart, type ChartEvents } from "./EChart";
import { ChartPalette } from "./Color";

export interface SankeyNodeData {
  id?: string;
  name: string;
  color?: string;
  /** Optional value/count to display above the node label */
  value?: number;
  /** Additional data to show in tooltip (e.g., { Apps: 166, Sessions: 122600 }) */
  tooltipData?: Record<string, number | string>;
  isDrillable?: boolean;
  childCount?: number;
}

export interface SankeyLinkData {
  id?: string;
  source: number;
  target: number;
  value: number;
  isDrillable?: boolean;
}

export type DrillTarget =
  | { type: "node"; nodeId: string }
  | { type: "link"; sourceId: string; targetId: string };

export interface DrillSelection {
  id: string;
  type: "node" | "link";
  label: string;
  depth: number;
}

export interface DrillDownContext {
  selections: DrillSelection[];
  isMultiSelect: boolean;
}

export interface SankeyData {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
}

/** Parameters passed to the tooltip formatter */
export interface SankeyTooltipParams {
  type: "node" | "link";
  name: string;
  node?: SankeyNodeData;
  link?: { source: string; target: string; value: number };
  color?: string;
}

export interface SankeyChartProps {
  /**
   * The ECharts core instance imported by the consumer.
   * Passed in rather than imported directly so the consumer controls which
   * ECharts modules are bundled (tree-shaking).
   */
  echarts: typeof echarts;
  /** Array of nodes in the Sankey diagram */
  nodes: SankeyNodeData[];
  /** Array of links connecting nodes by index */
  links: SankeyLinkData[];
  /** Height of the chart in pixels */
  height?: number;
  /** Show node values above labels (default: true if any node has a value) */
  showNodeValues?: boolean;
  /** Format function for node values (default: toLocaleString) */
  formatValue?: (value: number) => string;
  /** Custom tooltip formatter. Return HTML string or empty string to hide tooltip. */
  tooltipFormatter?: (params: SankeyTooltipParams) => string;
  nodeWidth?: number;
  nodePadding?: number;
  showTooltip?: boolean;
  defaultNodeColor?: string;
  /** Link fill style: 'gradient' blends source to target colors, 'gray' uses flat gray */
  linkColor?: "gradient" | "gray";
  linkOpacity?: number;
  className?: string;
  isDarkMode?: boolean;
  onNodeClick?: (node: SankeyNodeData) => void;
  onLinkClick?: (link: SankeyLinkData) => void;
}

const defaultFormatValue = (value: number) => value.toLocaleString();

/** Type guard for ECharts tooltip params */
interface TooltipParams {
  dataType?: string;
  name?: string;
  data?: { source?: string; target?: string; value?: number };
  value?: number | number[];
  color?: string;
}

function isTooltipParams(params: unknown): params is TooltipParams {
  return typeof params === "object" && params !== null;
}

/** Escape HTML special characters to prevent XSS in tooltips */
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Escape ECharts rich text metacharacters to prevent formatting issues.
 * Rich text syntax uses {styleName|text}, so | and } must be escaped.
 */
const escapeRichText = (str: string): string =>
  str.replace(/[{}|]/g, (char) => `\\${char}`);

/**
 * Sanitize a CSS color value to prevent injection attacks.
 * Only allows valid hex colors, rgb/rgba, hsl/hsla, and named colors.
 */
const sanitizeColor = (color: string): string => {
  const fallback = "#666";
  if (!color || typeof color !== "string") return fallback;

  // Hex colors: #RGB, #RRGGBB, #RRGGBBAA
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) {
    return color;
  }

  // rgb/rgba: rgb(0,0,0) or rgba(0,0,0,0.5)
  if (
    /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*[\d.]+\s*)?\)$/i.test(
      color,
    )
  ) {
    return color;
  }

  // hsl/hsla: hsl(0,0%,0%) or hsla(0,0%,0%,0.5)
  if (
    /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*[\d.]+\s*)?\)$/i.test(
      color,
    )
  ) {
    return color;
  }

  // Named colors (basic set) - only alphanumeric, no special chars
  if (/^[a-z]{3,20}$/i.test(color)) {
    return color;
  }

  return fallback;
};

export function SankeyChart({
  echarts,
  nodes,
  links,
  height = 400,
  nodeWidth = 8,
  nodePadding = 10,
  showTooltip: enableTooltip = true,
  showNodeValues,
  formatValue = defaultFormatValue,
  tooltipFormatter,
  defaultNodeColor,
  linkColor = "gradient",
  linkOpacity = 0.5,
  className,
  isDarkMode,
  onNodeClick,
  onLinkClick,
}: SankeyChartProps) {
  const hasNodeValues = nodes.some((n) => n.value !== undefined);
  const shouldShowValues = showNodeValues ?? hasNodeValues;
  const options = useMemo<EChartsOption>(() => {
    const labelColor = ChartPalette.text("primary", isDarkMode);
    const secondaryColor = ChartPalette.text("secondary", isDarkMode);
    // Build a map of node name to original node data for tooltip access
    const nodeDataMap = new Map(nodes.map((n) => [n.name, n]));

    const echartsNodes = nodes.map((node, index) => ({
      name: node.name,
      value: node.value,
      itemStyle: {
        color:
          node.color ??
          defaultNodeColor ??
          ChartPalette.categorical(index, isDarkMode),
      },
    }));

    const echartsLinks = links.map((link) => ({
      source: nodes[link.source]?.name ?? "",
      target: nodes[link.target]?.name ?? "",
      value: link.value,
    }));

    return {
      animation: true,
      animationDuration: 500,
      animationDurationUpdate: 300,
      animationEasingUpdate: "cubicInOut",
      tooltip: enableTooltip
        ? {
            trigger: "item",
            triggerOn: "mousemove",
            dangerousHtmlFormatter: (params: unknown) => {
              if (!isTooltipParams(params)) return "";

              if (params.dataType === "node" && params.name) {
                const nodeData = nodeDataMap.get(params.name);
                const color = sanitizeColor(
                  nodeData?.color ?? params.color ?? "#666",
                );

                // Use custom formatter if provided
                if (tooltipFormatter) {
                  return tooltipFormatter({
                    type: "node",
                    name: params.name,
                    node: nodeData,
                    color,
                  });
                }

                // Default node tooltip
                const safeName = escapeHtml(params.name);
                return `<div style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color}"></span><strong>${safeName}</strong></div>`;
              }

              if (params.dataType === "edge" && params.data) {
                const { source, target, value } = params.data;

                // Use custom formatter if provided
                if (tooltipFormatter) {
                  return tooltipFormatter({
                    type: "link",
                    name: `${source} → ${target}`,
                    link: {
                      source: source ?? "",
                      target: target ?? "",
                      value: value ?? 0,
                    },
                  });
                }

                // Get colors for source and target nodes
                const sourceNode = nodeDataMap.get(source ?? "");
                const targetNode = nodeDataMap.get(target ?? "");
                const sourceColor = sanitizeColor(sourceNode?.color ?? "#666");
                const targetColor = sanitizeColor(targetNode?.color ?? "#666");

                // Default link tooltip with colored dots
                const safeSource = escapeHtml(source ?? "");
                const safeTarget = escapeHtml(target ?? "");
                return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${sourceColor}"></span>
                  <strong>${safeSource}</strong>
                  <span style="color:${secondaryColor}">→</span>
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${targetColor}"></span>
                  <strong>${safeTarget}</strong>
                </div>
                <strong>${value !== undefined ? escapeHtml(formatValue(value)) : ""}</strong>`;
              }

              return "";
            },
          }
        : undefined,
      series: [
        {
          type: "sankey",
          data: echartsNodes,
          links: echartsLinks,
          draggable: false,
          emphasis: {
            focus: "adjacency",
          },
          nodeWidth,
          nodeGap: nodePadding,
          lineStyle: {
            color: linkColor === "gradient" ? "source" : "#d1d5db",
            opacity: linkColor === "gradient" ? linkOpacity : 0.4,
            curveness: 0.5,
          },
          label: {
            show: true,
            color: labelColor,
            fontSize: 12,
            formatter: shouldShowValues
              ? (params: { name?: string }) => {
                  const name = params.name ?? "";
                  const nodeData = nodeDataMap.get(name);
                  const safeName = escapeRichText(name);
                  if (nodeData?.value !== undefined) {
                    return `{value|${escapeRichText(formatValue(nodeData.value))}}\n{name|${safeName}}`;
                  }
                  return safeName;
                }
              : undefined,
            rich: shouldShowValues
              ? {
                  value: {
                    fontSize: 11,
                    color: labelColor,
                    lineHeight: 16,
                  },
                  name: {
                    fontSize: 12,
                    color: labelColor,
                    fontWeight: 700,
                  },
                }
              : undefined,
          },
        },
      ],
    };
  }, [
    nodes,
    links,
    enableTooltip,
    nodeWidth,
    nodePadding,
    defaultNodeColor,
    isDarkMode,
    linkColor,
    linkOpacity,
    shouldShowValues,
    formatValue,
    tooltipFormatter,
  ]);

  const handleClick = useCallback(
    (params: Parameters<ChartEvents["click"]>[0]) => {
      if (params.dataType === "node" && onNodeClick && params.name) {
        const nodeIndex = nodes.findIndex((n) => n.name === params.name);
        const originalNode = nodeIndex >= 0 ? nodes[nodeIndex] : null;

        const nodeData: SankeyNodeData = {
          ...originalNode,
          name: params.name,
        };
        onNodeClick(nodeData);
      } else if (params.dataType === "edge" && onLinkClick && params.data) {
        const data = params.data;
        const source =
          typeof data === "object" && data !== null && "source" in data
            ? String(data.source)
            : "";
        const target =
          typeof data === "object" && data !== null && "target" in data
            ? String(data.target)
            : "";
        const sourceIndex = nodes.findIndex((n) => n.name === source);
        const targetIndex = nodes.findIndex((n) => n.name === target);

        if (sourceIndex === -1 || targetIndex === -1) return;

        const rawValue = params.value;
        const value =
          typeof rawValue === "number"
            ? rawValue
            : Array.isArray(rawValue) && typeof rawValue[0] === "number"
              ? rawValue[0]
              : 0;

        // Find original link to preserve id and isDrillable properties
        const originalLink = links.find(
          (l) => l.source === sourceIndex && l.target === targetIndex,
        );
        onLinkClick({
          ...originalLink,
          source: sourceIndex,
          target: targetIndex,
          value,
        });
      }
    },
    [nodes, links, onNodeClick, onLinkClick],
  );

  const onEvents = useMemo<Partial<ChartEvents>>(
    () => ({
      click: handleClick,
    }),
    [handleClick],
  );

  return (
    <Chart
      echarts={echarts}
      options={options}
      className={className}
      isDarkMode={isDarkMode}
      height={height}
      onEvents={onEvents}
    />
  );
}

SankeyChart.displayName = "SankeyChart";
