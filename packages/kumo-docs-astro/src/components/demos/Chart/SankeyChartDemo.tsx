import { useState, useMemo } from "react";
import {
  SankeyChart,
  ChartPalette,
  type SankeyTooltipParams,
  type SankeyNodeData,
} from "@cloudflare/kumo";
import * as echarts from "echarts/core";
import { SankeyChart as SankeyChartType } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useIsDarkMode } from "~/lib/use-is-dark-mode";

echarts.use([SankeyChartType, TooltipComponent, CanvasRenderer]);

/** Escape HTML special characters to prevent XSS in custom tooltips */
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const basicNodes = [
  { name: "Users", value: 103600, color: ChartPalette.categorical(0) },
  { name: "Networks", value: 84100, color: ChartPalette.categorical(1) },
  { name: "Devices", value: 50800, color: ChartPalette.categorical(2) },
  { name: "Other", value: 2000, color: ChartPalette.categorical(3) },
  { name: "Apps", value: 122600, color: ChartPalette.categorical(4) },
  { name: "Tunnels", value: 87800, color: ChartPalette.categorical(5) },
  { name: "BYOIP", value: 29500, color: ChartPalette.categorical(6) },
  { name: "Other Target", value: 600, color: ChartPalette.categorical(7) },
];

const basicLinks = [
  { source: 0, target: 4, value: 80000 },
  { source: 0, target: 5, value: 20000 },
  { source: 0, target: 6, value: 3600 },
  { source: 1, target: 4, value: 30000 },
  { source: 1, target: 5, value: 50000 },
  { source: 1, target: 6, value: 4100 },
  { source: 2, target: 4, value: 10000 },
  { source: 2, target: 5, value: 15000 },
  { source: 2, target: 6, value: 20000 },
  { source: 2, target: 7, value: 5800 },
  { source: 3, target: 5, value: 1400 },
  { source: 3, target: 7, value: 600 },
];

export function SankeyChartBasicDemo() {
  const isDarkMode = useIsDarkMode();
  return (
    <SankeyChart
      echarts={echarts}
      nodes={basicNodes}
      links={basicLinks}
      height={350}
      isDarkMode={isDarkMode}
    />
  );
}

/** Compact preview for the charts index card */
export function SankeyChartPreviewDemo() {
  const isDarkMode = useIsDarkMode();
  const previewNodes = [
    { name: "A", color: ChartPalette.categorical(0) },
    { name: "B", color: ChartPalette.categorical(1) },
    { name: "C", color: ChartPalette.categorical(2) },
    { name: "X", color: ChartPalette.categorical(3) },
    { name: "Y", color: ChartPalette.categorical(4) },
  ];

  const previewLinks = [
    { source: 0, target: 3, value: 30 },
    { source: 0, target: 4, value: 20 },
    { source: 1, target: 3, value: 25 },
    { source: 1, target: 4, value: 15 },
    { source: 2, target: 4, value: 35 },
  ];

  return (
    <SankeyChart
      echarts={echarts}
      nodes={previewNodes}
      links={previewLinks}
      height={200}
      showTooltip={false}
      isDarkMode={isDarkMode}
    />
  );
}

const multiLevelNodes = [
  { name: "Input 1", color: ChartPalette.categorical(0) },
  { name: "Input 2", color: ChartPalette.categorical(1) },
  { name: "Process A", color: ChartPalette.categorical(2) },
  { name: "Process B", color: ChartPalette.categorical(3) },
  { name: "Output X", color: ChartPalette.categorical(4) },
  { name: "Output Y", color: ChartPalette.categorical(5) },
];

const multiLevelLinks = [
  { source: 0, target: 2, value: 40 },
  { source: 0, target: 3, value: 20 },
  { source: 1, target: 2, value: 30 },
  { source: 1, target: 3, value: 35 },
  { source: 2, target: 4, value: 50 },
  { source: 2, target: 5, value: 20 },
  { source: 3, target: 4, value: 25 },
  { source: 3, target: 5, value: 30 },
];

export function SankeyChartMultiLevelDemo() {
  const isDarkMode = useIsDarkMode();
  return (
    <SankeyChart
      echarts={echarts}
      nodes={multiLevelNodes}
      links={multiLevelLinks}
      height={350}
      nodeWidth={20}
      nodePadding={15}
      isDarkMode={isDarkMode}
    />
  );
}

export function SankeyChartCustomColorsDemo() {
  const isDarkMode = useIsDarkMode();
  const nodes = [
    { name: "Revenue", color: ChartPalette.categorical(0) },
    { name: "Costs", color: ChartPalette.semantic("Attention") },
    { name: "Profit", color: ChartPalette.categorical(2) },
    { name: "Taxes", color: ChartPalette.semantic("Warning") },
    { name: "Net Income", color: ChartPalette.categorical(4) },
  ];

  const links = [
    { source: 0, target: 2, value: 70 },
    { source: 1, target: 2, value: -30 },
    { source: 2, target: 3, value: 15 },
    { source: 2, target: 4, value: 55 },
  ];

  return (
    <SankeyChart
      echarts={echarts}
      nodes={nodes}
      links={links}
      height={250}
      linkOpacity={0.6}
      isDarkMode={isDarkMode}
    />
  );
}

/** Demo with detailed tooltip data */
export function SankeyChartTooltipDemo() {
  const isDarkMode = useIsDarkMode();
  const nodes: SankeyNodeData[] = [
    {
      name: "Apps",
      value: 122600,
      color: ChartPalette.categorical(0),
      tooltipData: { Apps: 166, Sessions: 122600 },
    },
    {
      name: "Tunnels",
      value: 31800,
      color: ChartPalette.categorical(1),
      tooltipData: { Tunnels: 42, Sessions: 31800 },
    },
    {
      name: "Users",
      value: 103600,
      color: ChartPalette.categorical(2),
      tooltipData: { Users: 1250, Sessions: 103600 },
    },
    {
      name: "Devices",
      value: 50800,
      color: ChartPalette.categorical(3),
      tooltipData: { Devices: 890, Sessions: 50800 },
    },
  ];

  const links = [
    { source: 2, target: 0, value: 80000 },
    { source: 2, target: 1, value: 23600 },
    { source: 3, target: 0, value: 42600 },
    { source: 3, target: 1, value: 8200 },
  ];

  return (
    <SankeyChart
      echarts={echarts}
      nodes={nodes}
      links={links}
      height={300}
      isDarkMode={isDarkMode}
    />
  );
}

/** Demo with custom rich tooltip formatter */
export function SankeyChartRichTooltipDemo() {
  const isDarkMode = useIsDarkMode();
  const nodes: SankeyNodeData[] = [
    {
      name: "Apps",
      value: 122600,
      color: ChartPalette.categorical(0),
      tooltipData: { Apps: 166, Sessions: 122600 },
    },
    {
      name: "Tunnels",
      value: 31800,
      color: ChartPalette.categorical(1),
      tooltipData: { Tunnels: 42, Sessions: 31800 },
    },
    {
      name: "Users",
      value: 103600,
      color: ChartPalette.categorical(2),
      tooltipData: { Users: 1250, Sessions: 103600 },
    },
    {
      name: "Devices",
      value: 50800,
      color: ChartPalette.categorical(3),
      tooltipData: { Devices: 890, Sessions: 50800 },
    },
  ];

  const links = [
    { source: 2, target: 0, value: 80000 },
    { source: 2, target: 1, value: 23600 },
    { source: 3, target: 0, value: 42600 },
    { source: 3, target: 1, value: 8200 },
  ];

  const customTooltip = (params: SankeyTooltipParams) => {
    if (params.type === "node" && params.node) {
      const { tooltipData } = params.node;
      const safeName = escapeHtml(params.name);
      let html = `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${params.color}"></span>
        <strong>${safeName}</strong>
      </div>`;

      if (tooltipData) {
        for (const [key, val] of Object.entries(tooltipData)) {
          const safeKey = escapeHtml(key);
          const formatted =
            typeof val === "number"
              ? val.toLocaleString()
              : escapeHtml(String(val));
          html += `<div style="display:flex;justify-content:space-between;gap:16px;">
            <span>${safeKey}</span><strong>${formatted}</strong>
          </div>`;
        }
      }
      return html;
    }

    if (params.type === "link" && params.link) {
      const safeSource = escapeHtml(params.link.source);
      const safeTarget = escapeHtml(params.link.target);
      return `${safeSource} → ${safeTarget}: <strong>${params.link.value.toLocaleString()}</strong>`;
    }

    return "";
  };

  return (
    <SankeyChart
      echarts={echarts}
      nodes={nodes}
      links={links}
      height={300}
      tooltipFormatter={customTooltip}
      isDarkMode={isDarkMode}
    />
  );
}

export function SankeyChartInteractiveDemo() {
  const isDarkMode = useIsDarkMode();
  const handleNodeClick = (node: { name: string }) => {
    console.log("Node clicked:", node.name);
  };

  const handleLinkClick = (link: {
    source: number;
    target: number;
    value: number;
  }) => {
    console.log("Link clicked:", link);
  };

  return (
    <SankeyChart
      echarts={echarts}
      nodes={basicNodes}
      links={basicLinks}
      height={350}
      onNodeClick={handleNodeClick}
      onLinkClick={handleLinkClick}
      isDarkMode={isDarkMode}
    />
  );
}

/** Demo showing drill-down behavior by filtering data on node click */
export function SankeyChartDrillDownDemo() {
  const isDarkMode = useIsDarkMode();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  // Full dataset
  const allNodes = [
    { name: "Users", value: 103600, color: ChartPalette.categorical(0) },
    { name: "Networks", value: 84100, color: ChartPalette.categorical(1) },
    { name: "Devices", value: 50800, color: ChartPalette.categorical(2) },
    { name: "Apps", value: 122600, color: ChartPalette.categorical(3) },
    { name: "Tunnels", value: 87800, color: ChartPalette.categorical(4) },
    { name: "BYOIP", value: 29500, color: ChartPalette.categorical(5) },
  ];

  const allLinks = [
    { source: 0, target: 3, value: 80000 },
    { source: 0, target: 4, value: 20000 },
    { source: 0, target: 5, value: 3600 },
    { source: 1, target: 3, value: 30000 },
    { source: 1, target: 4, value: 50000 },
    { source: 1, target: 5, value: 4100 },
    { source: 2, target: 3, value: 12600 },
    { source: 2, target: 4, value: 17800 },
    { source: 2, target: 5, value: 20400 },
  ];

  // Source and target node names
  const sourceNames = ["Users", "Networks", "Devices"];
  const targetNames = ["Apps", "Tunnels", "BYOIP"];

  // Compute filtered nodes and links together to avoid circular dependencies
  // and properly recalculate node values based on filtered links
  const { filteredNodes, filteredLinks } = useMemo(() => {
    if (!selectedSource && !selectedTarget) {
      return { filteredNodes: allNodes, filteredLinks: allLinks };
    }

    // First, determine which links to include
    let relevantLinks = allLinks;
    if (selectedSource && selectedTarget) {
      const sourceIdx = allNodes.findIndex((n) => n.name === selectedSource);
      const targetIdx = allNodes.findIndex((n) => n.name === selectedTarget);
      relevantLinks = allLinks.filter(
        (l) => l.source === sourceIdx && l.target === targetIdx,
      );
    } else if (selectedSource) {
      const sourceIdx = allNodes.findIndex((n) => n.name === selectedSource);
      relevantLinks = allLinks.filter((l) => l.source === sourceIdx);
    } else if (selectedTarget) {
      const targetIdx = allNodes.findIndex((n) => n.name === selectedTarget);
      relevantLinks = allLinks.filter((l) => l.target === targetIdx);
    }

    // Determine which nodes are involved in the relevant links
    const involvedNodeIndices = new Set<number>();
    for (const link of relevantLinks) {
      involvedNodeIndices.add(link.source);
      involvedNodeIndices.add(link.target);
    }

    // Build filtered nodes with recalculated values based on link flow
    const nodeValueMap = new Map<string, number>();
    for (const link of relevantLinks) {
      const sourceName = allNodes[link.source]?.name;
      const targetName = allNodes[link.target]?.name;
      if (sourceName) {
        nodeValueMap.set(
          sourceName,
          (nodeValueMap.get(sourceName) ?? 0) + link.value,
        );
      }
      if (targetName) {
        nodeValueMap.set(
          targetName,
          (nodeValueMap.get(targetName) ?? 0) + link.value,
        );
      }
    }

    const nodes = allNodes
      .filter((_, idx) => involvedNodeIndices.has(idx))
      .map((node) => ({
        ...node,
        value: nodeValueMap.get(node.name) ?? node.value,
      }));

    // Remap link indices to the new filtered node array
    const nodeIndexMap = new Map(nodes.map((n, idx) => [n.name, idx]));
    const links = relevantLinks.map((link) => ({
      ...link,
      source: nodeIndexMap.get(allNodes[link.source]?.name ?? "") ?? 0,
      target: nodeIndexMap.get(allNodes[link.target]?.name ?? "") ?? 0,
    }));

    return { filteredNodes: nodes, filteredLinks: links };
  }, [selectedSource, selectedTarget]);

  const handleNodeClick = (node: { name: string }) => {
    if (sourceNames.includes(node.name)) {
      // Toggle source selection
      setSelectedSource((prev) => (prev === node.name ? null : node.name));
    } else if (targetNames.includes(node.name)) {
      // Toggle target selection
      setSelectedTarget((prev) => (prev === node.name ? null : node.name));
    }
  };

  const resetFilters = () => {
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  const hasSelection = selectedSource || selectedTarget;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-kumo-subtle">
        <span>
          {hasSelection
            ? `Showing: ${[selectedSource, selectedTarget].filter(Boolean).join(" → ")}`
            : "Click a node to filter"}
        </span>
        {hasSelection && (
          <button
            onClick={resetFilters}
            className="text-kumo-brand hover:underline"
          >
            Reset
          </button>
        )}
      </div>
      <SankeyChart
        echarts={echarts}
        nodes={filteredNodes}
        links={filteredLinks}
        height={300}
        onNodeClick={handleNodeClick}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
