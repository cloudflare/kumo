import { describe, test, expect } from "vitest";
import { render } from "vitest-browser-react";
import { parseSVG, makeAbsolute } from "svg-path-parser";
import { forwardRef, useState, type ReactNode } from "react";
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

    test("updates connectors when an expandable node changes size", async () => {
      const { container, getByText, getByTestId } = await render(
        <Flow>
          <Flow.Node id="start">Start</Flow.Node>
          <Flow.Parallel>
            <Flow.Node
              id="expandable"
              render={
                <ExpandableNode title="Toggle Me">
                  <p>Extra content that makes the node taller.</p>
                </ExpandableNode>
              }
            />
            <Flow.Node id="sibling">Sibling</Flow.Node>
          </Flow.Parallel>
          <Flow.Node id="end">End</Flow.Node>
        </Flow>,
      );

      // Wait for initial render
      await Promise.all([
        expect.element(getByText("Toggle Me")).toBeVisible(),
        expect.element(getByText("Sibling")).toBeVisible(),
        expect.element(getByText("End")).toBeVisible(),
      ]);

      // Capture the connector endpoint for the collapsed state
      const pathBeforeExpand = getPathEndpointsForConnector(
        container,
        "start",
        "expandable",
      );

      // Expand the node by clicking the button
      await getByText("Toggle Me").click();
      await expect
        .element(getByText("Extra content that makes the node taller."))
        .toBeVisible();

      // Wait for paint to finish
      await waitForNextFrame();

      // The expandable node is now taller, so connectors should update.
      // Re-assert that all connectors still point at the correct node
      // positions after the resize.
      const expandableNode = getByTestId("expandable").element();
      const endNode = getByTestId("end").element();
      const startNode = getByTestId("start").element();

      assertPathConnects({
        container,
        fromNode: startNode,
        toNode: expandableNode,
        fromId: "start",
        toId: "expandable",
      });

      assertPathConnects({
        container,
        fromNode: expandableNode,
        toNode: endNode,
        fromId: "expandable",
        toId: "end",
      });

      // Verify the connector endpoint actually moved (the expanded node is
      // taller so its vertical center shifts)
      const pathAfterExpand = getPathEndpointsForConnector(
        container,
        "start",
        "expandable",
      );
      expect(
        pathBeforeExpand.end.y !== pathAfterExpand.end.y,
        `connector endpoint y should change after expand (before: ${pathBeforeExpand.end.y}, after: ${pathAfterExpand.end.y})`,
      ).toBe(true);
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

    test("does not render incoming connectors when there is no node before a parallel group", async () => {
      const { container, getByText } = await render(
        <Flow>
          <Flow.Parallel>
            <Flow.Node id="branch-a">Branch A</Flow.Node>
            <Flow.Node id="branch-b">Branch B</Flow.Node>
          </Flow.Parallel>
          <Flow.Node id="end">End</Flow.Node>
        </Flow>,
      );

      await Promise.all([
        expect.element(getByText("Branch A")).toBeVisible(),
        expect.element(getByText("Branch B")).toBeVisible(),
        expect.element(getByText("End")).toBeVisible(),
      ]);

      // Outgoing connectors (branch → end) should still exist
      assertPathExists(container, "branch-a", "end");
      assertPathExists(container, "branch-b", "end");

      // No incoming connectors should exist since nothing precedes the
      // parallel group. Query for any path whose testid ends with the
      // branch ids as the target (i.e. "*-branch-a", "*-branch-b").
      assertNoPathEndingWith(container, "branch-a");
      assertNoPathEndingWith(container, "branch-b");
    });

    test("does not render outgoing connectors when there is no node after a parallel group", async () => {
      const { container, getByText } = await render(
        <Flow>
          <Flow.Node id="start">Start</Flow.Node>
          <Flow.Parallel>
            <Flow.Node id="branch-a">Branch A</Flow.Node>
            <Flow.Node id="branch-b">Branch B</Flow.Node>
          </Flow.Parallel>
        </Flow>,
      );

      await Promise.all([
        expect.element(getByText("Start")).toBeVisible(),
        expect.element(getByText("Branch A")).toBeVisible(),
        expect.element(getByText("Branch B")).toBeVisible(),
      ]);

      // Incoming connectors (start → branch) should still exist
      assertPathExists(container, "start", "branch-a");
      assertPathExists(container, "start", "branch-b");

      // No outgoing connectors should exist since nothing follows the
      // parallel group. Query for any path whose testid starts with the
      // branch ids as the source (i.e. "branch-a-*", "branch-b-*").
      assertNoPathStartingWith(container, "branch-a");
      assertNoPathStartingWith(container, "branch-b");
    });
  });
});

// ---------------------------------------------------------------------------
// Test components
// ---------------------------------------------------------------------------

/**
 * A simple expandable node used for testing dynamic node resizing.
 * Clicking the button toggles a content panel, changing the node's height.
 */
const ExpandableNode = forwardRef<
  HTMLLIElement,
  { title: string; children: ReactNode }
>(function ExpandableNode({ title, children, ...props }, ref) {
  const [open, setOpen] = useState(false);
  return (
    <li
      ref={ref}
      {...props}
      className="rounded-lg bg-kumo-base ring ring-kumo-line overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium"
      >
        {title}
      </button>
      {open && (
        <div className="border-t border-kumo-line px-3 py-2 text-sm">
          {children}
        </div>
      )}
    </li>
  );
});

// ---------------------------------------------------------------------------
// Test utilities for connector assertions
// ---------------------------------------------------------------------------

const waitForNextFrame = async () =>
  new Promise((p) => requestAnimationFrame(p));

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
 * Look up the connector path between two nodes and return its parsed start/end
 * points. Useful for comparing positions before and after a DOM change.
 */
function getPathEndpointsForConnector(
  container: Element,
  fromId: string,
  toId: string,
) {
  const path = container.querySelector(`path[data-testid="${fromId}-${toId}"]`);
  expect(
    path,
    `expected path[data-testid="${fromId}-${toId}"] to exist`,
  ).toBeTruthy();
  const d = path!.getAttribute("d")!;
  expect(d).toBeTruthy();
  return getPathEndpoints(d);
}

/**
 * Assert that a connector path with `data-testid="{fromId}-{toId}"` exists.
 */
function assertPathExists(container: Element, fromId: string, toId: string) {
  const path = container.querySelector(`path[data-testid="${fromId}-${toId}"]`);
  expect(
    path,
    `expected path[data-testid="${fromId}-${toId}"] to exist`,
  ).toBeTruthy();
}

/**
 * Assert that no connector path has `toId` as its target. This checks that
 * no `data-testid` attribute ends with `-{toId}`.
 */
function assertNoPathEndingWith(container: Element, toId: string) {
  const paths = container.querySelectorAll("path[data-testid]");
  for (const path of paths) {
    const testId = path.getAttribute("data-testid")!;
    expect(
      testId.endsWith(`-${toId}`),
      `unexpected incoming connector "${testId}" targeting "${toId}"`,
    ).toBe(false);
  }
}

/**
 * Assert that no connector path has `fromId` as its source. This checks that
 * no `data-testid` attribute starts with `{fromId}-`.
 */
function assertNoPathStartingWith(container: Element, fromId: string) {
  const paths = container.querySelectorAll("path[data-testid]");
  for (const path of paths) {
    const testId = path.getAttribute("data-testid")!;
    expect(
      testId.startsWith(`${fromId}-`),
      `unexpected outgoing connector "${testId}" originating from "${fromId}"`,
    ).toBe(false);
  }
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
