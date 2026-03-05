import { describe, test, expect } from "vitest";
import { render } from "vitest-browser-react";
import { parseSVG, makeAbsolute } from "svg-path-parser";
import { Flow } from ".";

describe("Flow Integration", () => {
  test("renders a sequence of nodes", async () => {
    const { getByText } = await render(
      <Flow>
        <Flow.Node>Node 1</Flow.Node>
        <Flow.Node>Node 2</Flow.Node>
      </Flow>,
    );
    await Promise.all([
      expect.element(getByText("Node 1")).toBeVisible(),
      expect.element(getByText("Node 2")).toBeVisible(),
    ]);
  });

  describe("paths", () => {
    test("renders a link from node 1 to node 2", async () => {
      const { container, getByText } = await render(
        <Flow>
          <Flow.Node id="node-1">Node 1</Flow.Node>
          <Flow.Node id="node-2">Node 2</Flow.Node>
        </Flow>,
      );

      await Promise.all([
        expect.element(getByText("Node 1")).toBeVisible(),
        expect.element(getByText("Node 2")).toBeVisible(),
      ]);

      assertPathConnects({
        container,
        fromNode: getByText("Node 1").element(),
        toNode: getByText("Node 2").element(),
        fromId: "node-1",
        toId: "node-2",
      });
    });

    test("renders connectors for parallel branches", async () => {
      const { container, getByText, getByTestId } = await render(
        <Flow>
          <Flow.Node id="start">Start</Flow.Node>
          <Flow.Parallel>
            <Flow.Node id="branch-a">Branch A</Flow.Node>
            <Flow.Node id="branch-b">Branch B</Flow.Node>
          </Flow.Parallel>
          <Flow.Node id="end">End</Flow.Node>
        </Flow>,
      );

      await Promise.all([
        expect.element(getByText("Start")).toBeVisible(),
        expect.element(getByText("Branch A")).toBeVisible(),
        expect.element(getByText("Branch B")).toBeVisible(),
        expect.element(getByText("End")).toBeVisible(),
      ]);

      const cases = [
        { from: "start", to: "branch-a" },
        { from: "start", to: "branch-b" },
        { from: "branch-a", to: "end" },
        { from: "branch-b", to: "end" },
      ];

      for (const { from, to } of cases) {
        const [startNode, endNode] = [
          getByTestId(from).element(),
          getByTestId(to).element(),
        ];
        assertPathConnects({
          container,
          fromNode: startNode,
          toNode: endNode,
          fromId: from,
          toId: to,
        });
      }
    });
  });
});

// ---------------------------------------------------------------------------
// Test utilities for connector assertions
// ---------------------------------------------------------------------------

/**
 * Parse an SVG path's `d` attribute and return the absolute start and end
 * points. Uses `makeAbsolute` from svg-path-parser so the result is correct
 * regardless of whether the path uses relative or absolute commands, curves,
 * arcs, or any other SVG path syntax.
 */
function getPathEndpoints(d: string) {
  // createRoundedPath joins nested arrays which inserts commas between
  // subcommands (e.g. "L 3 4,Q 5 6 7 8"). Replace commas with spaces so
  // the parser can handle it.
  const commands = makeAbsolute(parseSVG(d.replace(/,/g, " ")));
  const first = commands[0];
  const last = commands[commands.length - 1];
  return {
    start: { x: first.x, y: first.y },
    end: { x: last.x, y: last.y },
  };
}

/**
 * Returns true when `a` is within `tolerance` pixels of `b` in both axes.
 */
function isCloseTo(
  a: { x: number; y: number },
  b: { x: number; y: number },
  tolerance = 10,
) {
  return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
}

function rightCenter(rect: { right: number; top: number; bottom: number }) {
  return { x: rect.right, y: (rect.top + rect.bottom) / 2 };
}

function leftCenter(rect: { left: number; top: number; bottom: number }) {
  return { x: rect.left, y: (rect.top + rect.bottom) / 2 };
}

/**
 * Translate a DOMRect into the local coordinate space of a container element.
 */
function toLocalRect(rect: DOMRect, container: DOMRect) {
  return {
    left: rect.left - container.left,
    top: rect.top - container.top,
    right: rect.right - container.left,
    bottom: rect.bottom - container.top,
  };
}

/**
 * Assert that a connector path starts at the right-center of `fromNode` and
 * ends at the left-center of `toNode`.
 *
 * Looks up the `<path>` element via its `data-testid="{fromId}-{toId}"` and
 * resolves the SVG coordinate space from the closest relative container.
 */
function assertPathConnects({
  container,
  fromNode,
  toNode,
  fromId,
  toId,
}: {
  container: Element;
  fromNode: Element;
  toNode: Element;
  fromId: string;
  toId: string;
}) {
  const path = container.querySelector(`path[data-testid="${fromId}-${toId}"]`);
  expect(
    path,
    `expected path[data-testid="${fromId}-${toId}"] to exist`,
  ).toBeTruthy();

  const d = path!.getAttribute("d")!;
  expect(d).toBeTruthy();

  const svgContainer = path!.closest("svg")!.closest("[class*='relative']")!;
  const containerRect = svgContainer.getBoundingClientRect();

  const localFrom = toLocalRect(
    fromNode.getBoundingClientRect(),
    containerRect,
  );
  const localTo = toLocalRect(toNode.getBoundingClientRect(), containerRect);

  const { start, end } = getPathEndpoints(d);

  expect(
    isCloseTo(start, rightCenter(localFrom)),
    `path start ${JSON.stringify(start)} should be close to right-center of fromNode ${JSON.stringify(rightCenter(localFrom))}`,
  ).toBe(true);
  expect(
    isCloseTo(end, leftCenter(localTo)),
    `path end ${JSON.stringify(end)} should be close to left-center of toNode ${JSON.stringify(leftCenter(localTo))}`,
  ).toBe(true);
}
