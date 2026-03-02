import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useState, useEffect } from "react";
import { Flow } from "./index";

function shouldHaveIndex(element: Element, index: number) {
  expect(element.getAttribute("data-node-index")).toBe(String(index));
}

describe("Flow", () => {
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
                className="rounded-full size-4 bg-kumo-ring"
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
