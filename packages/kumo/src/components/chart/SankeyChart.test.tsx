import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  SankeyChart,
  type SankeyNodeData,
  type SankeyLinkData,
} from "./SankeyChart";

// Mock ECharts instance
const createMockChart = () => ({
  setOption: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
});

const createMockEcharts = (mockChart = createMockChart()) => ({
  init: vi.fn(() => mockChart),
});

describe("SankeyChart", () => {
  const baseNodes: SankeyNodeData[] = [
    { name: "Source A", value: 100 },
    { name: "Source B", value: 50 },
    { name: "Target X", value: 80 },
    { name: "Target Y", value: 70 },
  ];

  const baseLinks: SankeyLinkData[] = [
    { source: 0, target: 2, value: 60 },
    { source: 0, target: 3, value: 40 },
    { source: 1, target: 2, value: 20 },
    { source: 1, target: 3, value: 30 },
  ];

  describe("rendering", () => {
    it("renders without crashing with minimal props", () => {
      const mockEcharts = createMockEcharts();
      const { container } = render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
        />,
      );
      expect(container.firstChild).toBeTruthy();
      expect(mockEcharts.init).toHaveBeenCalled();
    });

    it("applies custom height", () => {
      const mockEcharts = createMockEcharts();
      const { container } = render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
          height={500}
        />,
      );
      const div = container.firstChild as HTMLElement;
      expect(div.style.height).toBe("500px");
    });

    it("applies custom className", () => {
      const mockEcharts = createMockEcharts();
      const { container } = render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
          className="custom-class"
        />,
      );
      const div = container.firstChild as HTMLElement;
      expect(div.classList.contains("custom-class")).toBe(true);
    });

    it("handles empty nodes array", () => {
      const mockEcharts = createMockEcharts();
      const { container } = render(
        <SankeyChart echarts={mockEcharts as any} nodes={[]} links={[]} />,
      );
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("ECharts options", () => {
    it("passes correct series type to ECharts", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
        />,
      );

      expect(mockChart.setOption).toHaveBeenCalled();
      const options = mockChart.setOption.mock.calls[0][0];
      expect(options.series[0].type).toBe("sankey");
    });

    it("maps node indices to names in links", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      const echartsLinks = options.series[0].links;

      expect(echartsLinks[0].source).toBe("Source A");
      expect(echartsLinks[0].target).toBe("Target X");
      expect(echartsLinks[0].value).toBe(60);
    });

    it("applies defaultNodeColor when node has no explicit color", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: "Node" }]}
          links={[]}
          defaultNodeColor="#ff0000"
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      expect(options.series[0].data[0].itemStyle.color).toBe("#ff0000");
    });

    it("uses node.color over defaultNodeColor", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: "Node", color: "#00ff00" }]}
          links={[]}
          defaultNodeColor="#ff0000"
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      expect(options.series[0].data[0].itemStyle.color).toBe("#00ff00");
    });

    it("disables tooltip when showTooltip is false", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
          showTooltip={false}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      expect(options.tooltip).toBeUndefined();
    });

    it("applies nodeWidth and nodePadding", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
          nodeWidth={20}
          nodePadding={15}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      expect(options.series[0].nodeWidth).toBe(20);
      expect(options.series[0].nodeGap).toBe(15);
    });

    it("uses gray link color when linkColor is 'gray'", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
          linkColor="gray"
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      expect(options.series[0].lineStyle.color).toBe("#d1d5db");
      expect(options.series[0].lineStyle.opacity).toBe(0.4);
    });

    it("uses gradient link color when linkColor is 'gradient'", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
          linkColor="gradient"
          linkOpacity={0.7}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      expect(options.series[0].lineStyle.color).toBe("source");
      expect(options.series[0].lineStyle.opacity).toBe(0.7);
    });
  });

  describe("click handlers", () => {
    it("registers click event handler when onNodeClick is provided", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);
      const onNodeClick = vi.fn();

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
          onNodeClick={onNodeClick}
        />,
      );

      expect(mockChart.on).toHaveBeenCalledWith("click", expect.any(Function));
    });

    it("onNodeClick receives correct node data with all original properties", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);
      const onNodeClick = vi.fn();

      const nodesWithExtras: SankeyNodeData[] = [
        {
          name: "Node A",
          id: "node-a",
          value: 100,
          isDrillable: true,
          childCount: 5,
        },
        { name: "Node B" },
      ];

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={nodesWithExtras}
          links={[]}
          onNodeClick={onNodeClick}
        />,
      );

      // Get the click handler that was registered
      const clickHandler = mockChart.on.mock.calls.find(
        (call) => call[0] === "click",
      )?.[1];

      // Simulate a node click event
      clickHandler({
        dataType: "node",
        name: "Node A",
      });

      expect(onNodeClick).toHaveBeenCalledWith({
        name: "Node A",
        id: "node-a",
        value: 100,
        isDrillable: true,
        childCount: 5,
      });
    });

    it("onLinkClick receives correct link data with original properties preserved", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);
      const onLinkClick = vi.fn();

      const linksWithExtras: SankeyLinkData[] = [
        { source: 0, target: 1, value: 100, id: "link-1", isDrillable: true },
      ];

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: "A" }, { name: "B" }]}
          links={linksWithExtras}
          onLinkClick={onLinkClick}
        />,
      );

      const clickHandler = mockChart.on.mock.calls.find(
        (call) => call[0] === "click",
      )?.[1];

      // Simulate an edge click event
      clickHandler({
        dataType: "edge",
        data: { source: "A", target: "B" },
        value: 100,
      });

      expect(onLinkClick).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 0,
          target: 1,
          value: 100,
          id: "link-1",
          isDrillable: true,
        }),
      );
    });

    it("does not call onLinkClick when source node not found", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);
      const onLinkClick = vi.fn();

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: "A" }, { name: "B" }]}
          links={[{ source: 0, target: 1, value: 100 }]}
          onLinkClick={onLinkClick}
        />,
      );

      const clickHandler = mockChart.on.mock.calls.find(
        (call) => call[0] === "click",
      )?.[1];

      // Simulate click with unknown source
      clickHandler({
        dataType: "edge",
        data: { source: "Unknown", target: "B" },
        value: 100,
      });

      expect(onLinkClick).not.toHaveBeenCalled();
    });

    it("does not call handlers when not provided", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
        />,
      );

      const clickHandler = mockChart.on.mock.calls.find(
        (call) => call[0] === "click",
      )?.[1];

      // Should not throw when clicking without handlers
      expect(() => {
        clickHandler({ dataType: "node", name: "Source A" });
        clickHandler({
          dataType: "edge",
          data: { source: "Source A", target: "Target X" },
          value: 60,
        });
      }).not.toThrow();
    });
  });

  describe("formatValue", () => {
    it("uses default toLocaleString formatter", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: "Node", value: 1234567 }]}
          links={[]}
          showNodeValues={true}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      const formatter = options.series[0].label.formatter;

      // Call the formatter with a node that has a value
      const result = formatter({ name: "Node" });
      expect(result).toContain("1,234,567");
    });

    it("uses custom formatValue function", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);
      const customFormatter = (value: number) => `$${value}`;

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: "Node", value: 100 }]}
          links={[]}
          showNodeValues={true}
          formatValue={customFormatter}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      const formatter = options.series[0].label.formatter;

      const result = formatter({ name: "Node" });
      expect(result).toContain("$100");
    });
  });

  describe("tooltipFormatter", () => {
    it("calls custom tooltipFormatter for node tooltips", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);
      const customTooltip = vi.fn(() => "<div>Custom</div>");

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: "Node", value: 100 }]}
          links={[]}
          tooltipFormatter={customTooltip}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      const formatter = options.tooltip.formatter;

      formatter({ dataType: "node", name: "Node", color: "#000" });

      expect(customTooltip).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "node",
          name: "Node",
        }),
      );
    });

    it("calls custom tooltipFormatter for link tooltips", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);
      const customTooltip = vi.fn(() => "<div>Custom</div>");

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: "A" }, { name: "B" }]}
          links={[{ source: 0, target: 1, value: 50 }]}
          tooltipFormatter={customTooltip}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      const formatter = options.tooltip.formatter;

      formatter({
        dataType: "edge",
        data: { source: "A", target: "B", value: 50 },
      });

      expect(customTooltip).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "link",
          name: "A → B",
          link: { source: "A", target: "B", value: 50 },
        }),
      );
    });
  });

  describe("dark mode", () => {
    it("initializes ECharts with dark theme when isDarkMode is true", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={baseNodes}
          links={baseLinks}
          isDarkMode={true}
        />,
      );

      expect(mockEcharts.init).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        "dark",
      );
    });
  });
});

describe("security utilities", () => {
  // These are internal functions, but we test them indirectly through the component

  describe("escapeHtml (via tooltip)", () => {
    it("escapes HTML special characters in node names", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: '<script>alert("xss")</script>' }]}
          links={[]}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      const formatter = options.tooltip.formatter;

      const result = formatter({
        dataType: "node",
        name: '<script>alert("xss")</script>',
        color: "#000",
      });

      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;");
    });
  });

  describe("sanitizeColor (via tooltip)", () => {
    it("accepts valid hex colors", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: "Node", color: "#ff0000" }]}
          links={[]}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      const formatter = options.tooltip.formatter;

      const result = formatter({
        dataType: "node",
        name: "Node",
        color: "#ff0000",
      });

      expect(result).toContain("#ff0000");
    });

    it("rejects invalid color values and uses fallback", () => {
      const mockChart = createMockChart();
      const mockEcharts = createMockEcharts(mockChart);

      render(
        <SankeyChart
          echarts={mockEcharts as any}
          nodes={[{ name: "Node", color: "javascript:alert(1)" }]}
          links={[]}
        />,
      );

      const options = mockChart.setOption.mock.calls[0][0];
      const formatter = options.tooltip.formatter;

      const result = formatter({
        dataType: "node",
        name: "Node",
      });

      // Should use fallback color #666, not the malicious value
      expect(result).toContain("#666");
      expect(result).not.toContain("javascript:");
    });
  });
});
