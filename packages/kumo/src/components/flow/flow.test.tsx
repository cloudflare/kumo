import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useState, useEffect } from "react";
import { createRoundedPath } from "./connectors";
import { Flow } from "./index";
import { computeEdges } from "./flow-layout";
import type { FlowState, TreeNode } from "./flow-layout";

function shouldHaveIndex(element: Element, index: number) {
  expect(element.getAttribute("data-node-index")).toBe(String(index));
}

describe("Flow", () => {
  describe("connector paths", () => {
    it("serializes SVG path commands without array commas for Firefox", () => {
      const path = createRoundedPath(
        { x1: 0, y1: 17, x2: 56, y2: 71 },
        { orientation: "horizontal", single: false },
      );

      expect(path).toBe("M 0 17 L 32 17 L 32 63 Q 32 71 40 71 L 48 71");
      expect(path).not.toContain(",");
    });

    it("routes vertical paths through a horizontal mid-segment", () => {
      const path = createRoundedPath(
        { x1: 17, y1: 0, x2: 71, y2: 56 },
        { orientation: "vertical", single: false },
      );

      expect(path).toContain("M 17 0");
      expect(path).not.toContain(",");
    });

    it("rounds both corners for single vertical connector paths", () => {
      const path = createRoundedPath(
        { x1: 0, y1: 0, x2: 56, y2: 71 },
        { orientation: "vertical", single: true },
      );

      expect(path).toBe(
        "M 0 0 L 0 31 Q 0 39 8 39 L 48 39 Q 56 39 56 47 L 56 63",
      );
      expect(path).not.toContain(",");
    });
  });

  describe("Vertical orientation", () => {
    it("renders sequential nodes top-to-bottom in a column", () => {
      render(
        <Flow orientation="vertical">
          <Flow.Node>Step 1</Flow.Node>
          <Flow.Node>Step 2</Flow.Node>
          <Flow.Node>Step 3</Flow.Node>
        </Flow>,
      );

      const list = screen.getByText("Step 1").closest("ul");
      expect(list?.className).toContain("flex-col");
    });
  });

  describe("Compound component API", () => {
    it("exposes Node sub-component", () => {
      expect(Flow.Node).toBeDefined();
      expect(Flow.Node.displayName).toBe("Flow.Node");
    });

    it("exposes Parallel sub-component", () => {
      expect(Flow.Parallel).toBeDefined();
    });

    it("exposes List sub-component", () => {
      expect(Flow.List).toBeDefined();
    });

    it("exposes Anchor sub-component", () => {
      expect(Flow.Anchor).toBeDefined();
      expect(Flow.Anchor.displayName).toBe("Flow.Anchor");
    });
  });

  describe("Basic sequential flow", () => {
    it("renders sequential nodes with text content", () => {
      render(
        <Flow>
          <Flow.Node>Step 1</Flow.Node>
          <Flow.Node>Step 2</Flow.Node>
          <Flow.Node>Step 3</Flow.Node>
        </Flow>,
      );

      expect(screen.getByText("Step 1")).toBeTruthy();
      expect(screen.getByText("Step 2")).toBeTruthy();
      expect(screen.getByText("Step 3")).toBeTruthy();
    });

    it("renders nodes as list items by default", () => {
      render(
        <Flow>
          <Flow.Node>Step 1</Flow.Node>
          <Flow.Node>Step 2</Flow.Node>
        </Flow>,
      );

      const items = screen.getAllByRole("listitem");
      expect(items.length).toBe(2);
    });

    it("assigns data-node-index attributes to nodes", () => {
      render(
        <Flow>
          <Flow.Node>First</Flow.Node>
          <Flow.Node>Second</Flow.Node>
        </Flow>,
      );

      shouldHaveIndex(screen.getByText("First"), 0);
      shouldHaveIndex(screen.getByText("Second"), 1);
    });

    it("assigns data-node-id attributes to nodes", () => {
      render(
        <Flow>
          <Flow.Node>Node A</Flow.Node>
        </Flow>,
      );

      const node = screen.getByText("Node A");
      expect(node.getAttribute("data-node-id")).toBeTruthy();
    });

    it("uses a custom id prop as data-node-id when provided", () => {
      render(
        <Flow>
          <Flow.Node id="my-custom-id">Custom ID Node</Flow.Node>
        </Flow>,
      );

      const node = screen.getByText("Custom ID Node");
      expect(node.getAttribute("data-node-id")).toBe("my-custom-id");
    });

    it("uses a custom id on render prop elements", () => {
      render(
        <Flow>
          <Flow.Node
            id="render-custom-id"
            render={<li data-testid="custom-render">Custom</li>}
          />
        </Flow>,
      );

      const node = screen.getByTestId("custom-render");
      expect(node.getAttribute("data-node-id")).toBe("render-custom-id");
    });

    it("falls back to a generated id when no id prop is provided", () => {
      render(
        <Flow>
          <Flow.Node>Auto ID</Flow.Node>
        </Flow>,
      );

      const node = screen.getByText("Auto ID");
      const nodeId = node.getAttribute("data-node-id");
      expect(nodeId).toBeTruthy();
      expect(nodeId).not.toBe("");
    });
  });

  it("renders parallel branches alongside sequential nodes", () => {
    render(
      <Flow>
        <Flow.Node>Start</Flow.Node>
        <Flow.Parallel>
          <Flow.Node>Branch A</Flow.Node>
          <Flow.Node>Branch B</Flow.Node>
          <Flow.Node>Branch C</Flow.Node>
        </Flow.Parallel>
        <Flow.Node>End</Flow.Node>
      </Flow>,
    );

    shouldHaveIndex(screen.getByText("Start"), 0);
    shouldHaveIndex(screen.getByText("Branch A"), 0);
    shouldHaveIndex(screen.getByText("Branch B"), 1);
    shouldHaveIndex(screen.getByText("Branch C"), 2);
    shouldHaveIndex(screen.getByText("End"), 2);
  });

  describe("Custom node rendering", () => {
    it("renders custom elements via the render prop", () => {
      render(
        <Flow>
          <Flow.Node
            render={
              <li
                data-testid="custom-circle"
                className="rounded-full size-4 bg-kumo-hairline"
              />
            }
          />
          <Flow.Node
            render={
              <li
                data-testid="custom-label"
                className="bg-kumo-contrast text-kumo-inverse rounded-lg font-medium py-2 px-3"
              >
                my-worker
              </li>
            }
          />
        </Flow>,
      );

      expect(screen.getByTestId("custom-circle")).toBeTruthy();
      expect(screen.getByTestId("custom-label")).toBeTruthy();
      expect(screen.getByText("my-worker")).toBeTruthy();
    });

    it("preserves custom className on render prop elements", () => {
      render(
        <Flow>
          <Flow.Node
            render={<li data-testid="styled" className="my-custom-class" />}
          />
        </Flow>,
      );

      const node = screen.getByTestId("styled");
      expect(node.className).toContain("my-custom-class");
    });

    it("injects data-node-index and data-node-id into render prop elements", () => {
      render(
        <Flow>
          <Flow.Node render={<li data-testid="custom">Custom</li>} />
        </Flow>,
      );

      const node = screen.getByTestId("custom");
      shouldHaveIndex(node, 0);
      expect(node.getAttribute("data-node-id")).toBeTruthy();
    });
  });

  describe("Flow.Anchor", () => {
    it("renders anchor content within a node", () => {
      render(
        <Flow>
          <Flow.Node
            render={
              <li>
                <Flow.Anchor type="end">
                  <div>my-worker</div>
                </Flow.Anchor>
                <Flow.Anchor type="start">
                  <div>Bindings</div>
                </Flow.Anchor>
              </li>
            }
          />
        </Flow>,
      );

      expect(screen.getByText("my-worker")).toBeTruthy();
      expect(screen.getByText("Bindings")).toBeTruthy();
    });

    it("renders anchor with custom render prop", () => {
      render(
        <Flow>
          <Flow.Node
            render={
              <li>
                <Flow.Anchor
                  type="end"
                  render={<div data-testid="end-anchor">End content</div>}
                />
                <Flow.Anchor
                  type="start"
                  render={<div data-testid="start-anchor">Start content</div>}
                />
              </li>
            }
          />
        </Flow>,
      );

      expect(screen.getByTestId("end-anchor")).toBeTruthy();
      expect(screen.getByTestId("start-anchor")).toBeTruthy();
    });

    it("throws when used outside Flow.Node", () => {
      expect(() => {
        render(
          <Flow>
            <Flow.Anchor type="start">Orphaned anchor</Flow.Anchor>
          </Flow>,
        );
      }).toThrow("Flow.Anchor must be used within Flow.Node");
    });
  });

  describe("Disabled nodes", () => {
    it("renders disabled and enabled nodes", () => {
      render(
        <Flow>
          <Flow.Node>Request</Flow.Node>
          <Flow.Parallel>
            <Flow.Node>Primary Handler</Flow.Node>
            <Flow.Node disabled>Backup Handler (disabled)</Flow.Node>
          </Flow.Parallel>
          <Flow.Node>Response</Flow.Node>
        </Flow>,
      );
      expect(screen.getByText("Backup Handler (disabled)")).toBeTruthy();
    });
  });

  describe("Nested list in a parallel node", () => {
    it("renders nested Flow.List branches inside Flow.Parallel", () => {
      render(
        <Flow>
          <Flow.Parallel>
            <Flow.List>
              <Flow.Node>Client Users</Flow.Node>
              <Flow.Node>Engineering Team Access</Flow.Node>
            </Flow.List>
            <Flow.List>
              <Flow.Parallel>
                <Flow.Node>All Authenticated Users</Flow.Node>
                <Flow.Node>Client Users 2</Flow.Node>
                <Flow.Node>Site Users</Flow.Node>
              </Flow.Parallel>
              <Flow.Node>Contractor Access</Flow.Node>
            </Flow.List>
          </Flow.Parallel>
          <Flow.Node>Destinations</Flow.Node>
        </Flow>,
      );

      // All nodes from both lists are rendered
      expect(screen.getByText("Client Users")).toBeTruthy();
      expect(screen.getByText("Engineering Team Access")).toBeTruthy();
      expect(screen.getByText("All Authenticated Users")).toBeTruthy();
      expect(screen.getByText("Client Users 2")).toBeTruthy();
      expect(screen.getByText("Site Users")).toBeTruthy();
      expect(screen.getByText("Contractor Access")).toBeTruthy();
      expect(screen.getByText("Destinations")).toBeTruthy();
    });

    it("renders a nested parallel inside a list within a parallel", () => {
      render(
        <Flow>
          <Flow.Parallel>
            <Flow.List>
              <Flow.Parallel>
                <Flow.Node>Inner Branch A</Flow.Node>
                <Flow.Node>Inner Branch B</Flow.Node>
              </Flow.Parallel>
              <Flow.Node>After Inner Parallel</Flow.Node>
            </Flow.List>
          </Flow.Parallel>
          <Flow.Node>Final</Flow.Node>
        </Flow>,
      );

      expect(screen.getByText("Inner Branch A")).toBeTruthy();
      expect(screen.getByText("Inner Branch B")).toBeTruthy();
      expect(screen.getByText("After Inner Parallel")).toBeTruthy();
      expect(screen.getByText("Final")).toBeTruthy();
    });
  });

  it("reindexes nodes when children appear asynchronously", async () => {
    function AsyncFlow() {
      const [showDelayed, setShowDelayed] = useState(false);

      useEffect(() => {
        const timer = setTimeout(() => setShowDelayed(true), 100);
        return () => clearTimeout(timer);
      }, []);

      return (
        <Flow>
          {showDelayed && <Flow.Node>after 100ms</Flow.Node>}
          <Flow.Node>immediate</Flow.Node>
        </Flow>
      );
    }

    render(<AsyncFlow />);

    // Initially only "immediate" is rendered at index 0
    shouldHaveIndex(screen.getByText("immediate"), 0);
    expect(screen.queryByText("after 100ms")).toBeNull();

    // After the timeout, "after 100ms" appears before "immediate"
    await act(() => new Promise((r) => setTimeout(r, 150)));

    shouldHaveIndex(screen.getByText("after 100ms"), 0);
    shouldHaveIndex(screen.getByText("immediate"), 1);
  });
});

// ============================================================================
// Helpers for computeEdges unit tests
// ============================================================================

function makeState(tree: TreeNode): FlowState {
  return { nodes: {}, tree, align: "start", orientation: "horizontal" };
}

function node(id: string): TreeNode {
  return { kind: "node", id };
}

function parallel(children: TreeNode[]): TreeNode {
  return { kind: "parallel", children };
}

function list(children: TreeNode[]): TreeNode {
  return { kind: "list", children };
}

/** Returns edges as a Set of "from—to" strings for easy assertion. */
function edgeSet(state: FlowState): Set<string> {
  return new Set(computeEdges(state).map(([from, to]) => `${from}—${to}`));
}

describe("computeEdges", () => {
  describe("Rule 1: adjacent nodes are connected", () => {
    it("connects two sequential nodes", () => {
      const edges = edgeSet(makeState(list([node("A"), node("B")])));
      expect(edges).toEqual(new Set(["A—B"]));
    });

    it("connects three sequential nodes", () => {
      const edges = edgeSet(makeState(list([node("A"), node("B"), node("C")])));
      expect(edges).toEqual(new Set(["A—B", "B—C"]));
    });

    it("returns no edges for a single node", () => {
      expect(edgeSet(makeState(list([node("A")])))).toEqual(new Set());
    });

    it("returns no edges for an empty list", () => {
      expect(edgeSet(makeState(list([])))).toEqual(new Set());
    });
  });

  describe("Rule 2: node adjacent to parallel connects to all branches", () => {
    it("connects preceding node to all parallel children", () => {
      const edges = edgeSet(
        makeState(
          list([node("A"), parallel([node("B1"), node("B2")]), node("C")]),
        ),
      );
      expect(edges.has("A—B1")).toBe(true);
      expect(edges.has("A—B2")).toBe(true);
    });

    it("connects all parallel children to the following node", () => {
      const edges = edgeSet(
        makeState(
          list([node("A"), parallel([node("B1"), node("B2")]), node("C")]),
        ),
      );
      expect(edges.has("B1—C")).toBe(true);
      expect(edges.has("B2—C")).toBe(true);
    });

    it("produces exactly the right edge set for A -> [B1,B2] -> C", () => {
      const edges = edgeSet(
        makeState(
          list([node("A"), parallel([node("B1"), node("B2")]), node("C")]),
        ),
      );
      expect(edges).toEqual(new Set(["A—B1", "A—B2", "B1—C", "B2—C"]));
    });
  });

  describe("Rule 3: adjacent parallel groups are not connected", () => {
    it("skips edges between two adjacent parallel groups", () => {
      const edges = edgeSet(
        makeState(
          list([
            node("A"),
            parallel([node("B1"), node("B2")]),
            parallel([node("C1"), node("C2")]),
            node("D"),
          ]),
        ),
      );
      expect(edges.has("B1—C1")).toBe(false);
      expect(edges.has("B1—C2")).toBe(false);
      expect(edges.has("B2—C1")).toBe(false);
      expect(edges.has("B2—C2")).toBe(false);
    });

    it("produces exactly the right edge set for A -> [B1,B2] | [C1,C2] -> D", () => {
      const edges = edgeSet(
        makeState(
          list([
            node("A"),
            parallel([node("B1"), node("B2")]),
            parallel([node("C1"), node("C2")]),
            node("D"),
          ]),
        ),
      );
      expect(edges).toEqual(new Set(["A—B1", "A—B2", "C1—D", "C2—D"]));
    });
  });

  describe("Rule 4: list connects externally via first and last child only", () => {
    it("connects preceding node to first list child only", () => {
      const edges = edgeSet(
        makeState(list([node("A"), list([node("B1"), node("B2")]), node("C")])),
      );
      expect(edges.has("A—B1")).toBe(true);
      expect(edges.has("A—B2")).toBe(false);
    });

    it("connects last list child to following node only", () => {
      const edges = edgeSet(
        makeState(list([node("A"), list([node("B1"), node("B2")]), node("C")])),
      );
      expect(edges.has("B2—C")).toBe(true);
      expect(edges.has("B1—C")).toBe(false);
    });

    it("produces exactly the right edge set for spec example 4", () => {
      // A -> Parallel([List[B1,B2], C1]) -> D
      const edges = edgeSet(
        makeState(
          list([
            node("A"),
            parallel([list([node("B1"), node("B2")]), node("C1")]),
            node("D"),
          ]),
        ),
      );
      expect(edges).toEqual(new Set(["A—B1", "A—C1", "B1—B2", "B2—D", "C1—D"]));
    });
  });
});
