// =============================================================================
// Types
// =============================================================================

export type TreeNode =
  | { kind: "list"; children: TreeNode[] }
  | { kind: "parallel"; children: TreeNode[]; align?: "end" }
  | { kind: "node"; id: string };

export type FlowAlign = "start" | "center";
export type FlowOrientation = "horizontal" | "vertical";

export type FlowState = {
  nodes: {
    [id: string]: {
      width: number;
      height: number;
      disabled?: boolean;
      /** Y offset from the node's top edge to the outgoing anchor's midpoint. */
      startAnchorOffset?: number;
      /** Y offset from the node's top edge to the incoming anchor's midpoint. */
      endAnchorOffset?: number;
    };
  };
  tree: TreeNode;
  align: FlowAlign;
  orientation: FlowOrientation;
};

export type Edges = [string, string][];
export type NodePositions = Record<string, { x: number; y: number }>;
export type DiagramRect = { width: number; height: number };

// =============================================================================
// computeEdges
// =============================================================================

/**
 * Computes edges between flow nodes from the tree stored in FlowState.
 *
 * Rules (from spec):
 * 1. Adjacent `node` entries in a list are connected directly.
 * 2. A `node` adjacent to a `parallel` group connects to all of that group's
 *    immediate entry/exit points.
 * 3. Adjacent `parallel` groups are NOT connected to one another.
 * 4. A `list` group connects externally to its first and last node only.
 *
 * The function is pure — it does not access the DOM and has no side effects.
 */
export function computeEdges(flowState: FlowState): Edges {
  const edges: Edges = [];
  collectEdges(flowState.tree, edges);
  return edges;
}

/**
 * Returns the IDs of "entry points" for a tree node — the first node(s) that
 * would receive an incoming edge when something connects into this subtree.
 */
function entryIds(node: TreeNode): string[] {
  if (node.kind === "node") return [node.id];
  if (node.kind === "parallel") {
    return node.children.flatMap((child) => entryIds(child));
  }
  // list: only the first child is the entry point
  if (node.children.length === 0) return [];
  return entryIds(node.children[0]);
}

/**
 * Returns the IDs of "exit points" for a tree node — the last node(s) that
 * would emit an outgoing edge when something connects out of this subtree.
 */
function exitIds(node: TreeNode): string[] {
  if (node.kind === "node") return [node.id];
  if (node.kind === "parallel") {
    return node.children.flatMap((child) => exitIds(child));
  }
  // list: only the last child is the exit point
  if (node.children.length === 0) return [];
  return exitIds(node.children[node.children.length - 1]);
}

/**
 * Recursively processes a tree node, collecting edges into `edges`.
 */
function collectEdges(node: TreeNode, edges: Edges) {
  if (node.kind === "node") return;

  if (node.kind === "parallel") {
    for (const child of node.children) {
      collectEdges(child, edges);
    }
    return;
  }

  // node.kind === "list": recurse children, then connect adjacent pairs
  for (const child of node.children) {
    collectEdges(child, edges);
  }

  for (let i = 0; i < node.children.length - 1; i++) {
    const current = node.children[i];
    const next = node.children[i + 1];

    // Rule 3: adjacent parallel groups are not connected
    if (current.kind === "parallel" && next.kind === "parallel") continue;

    for (const from of exitIds(current)) {
      for (const to of entryIds(next)) {
        edges.push([from, to]);
      }
    }
  }
}

// =============================================================================
// computePositions
// =============================================================================

/**
 * Computes pixel positions for every node in the flow.
 *
 * - Horizontal flows lay lists left-to-right and parallel branches top-to-bottom.
 * - Vertical flows lay lists top-to-bottom and parallel branches left-to-right.
 * - `columnGap` controls primary-axis list spacing; `rowGap` controls branch spacing.
 *
 * Returns a map of node ID → `{ x, y }` (top-left corner, relative to the
 * flow container origin).
 *
 * This function is pure — it does not access the DOM.
 */
export function computePositions(
  flowState: FlowState,
  { columnGap = 64, rowGap = 16 } = {},
): NodePositions {
  const positions: NodePositions = {};
  const align = flowState.align;
  const orientation = flowState.orientation;

  /**
   * Recursively lay out a subtree, writing absolute positions into `out`.
   *
   * @returns `{ width, height }` — the bounding box of this subtree
   */
  function layout(
    node: TreeNode,
    originX: number,
    originY: number,
    out: NodePositions,
  ): { width: number; height: number } {
    if (node.kind === "node") {
      const measured = flowState.nodes[node.id];
      const w = measured?.width ?? 0;
      const h = measured?.height ?? 0;
      out[node.id] = { x: originX, y: originY };
      return { width: w, height: h };
    }

    if (node.kind === "list") {
      if (orientation === "vertical") {
        if (align === "center") {
          const sizes = node.children.map((child) => layout(child, 0, 0, {}));
          const columnWidth = sizes.reduce(
            (max, s) => Math.max(max, s.width),
            0,
          );

          let cursorY = originY;
          for (let i = 0; i < node.children.length; i++) {
            const childX = originX + (columnWidth - sizes[i].width) / 2;
            layout(node.children[i], childX, cursorY, out);
            cursorY += sizes[i].height;
            if (i < node.children.length - 1) cursorY += columnGap;
          }

          return { width: columnWidth, height: cursorY - originY };
        }

        let cursorY = originY;
        let totalWidth = 0;

        for (let i = 0; i < node.children.length; i++) {
          const { width, height } = layout(
            node.children[i],
            originX,
            cursorY,
            out,
          );
          cursorY += height;
          if (i < node.children.length - 1) cursorY += columnGap;
          totalWidth = Math.max(totalWidth, width);
        }

        return { width: totalWidth, height: cursorY - originY };
      }

      if (align === "center") {
        // Two-pass: measure each child into a scratch map to get heights,
        // then position with vertical centering into `out`.
        const sizes = node.children.map((child) => layout(child, 0, 0, {}));
        const rowHeight = sizes.reduce((max, s) => Math.max(max, s.height), 0);

        let cursorX = originX;
        for (let i = 0; i < node.children.length; i++) {
          const childY = originY + (rowHeight - sizes[i].height) / 2;
          layout(node.children[i], cursorX, childY, out);
          cursorX += sizes[i].width;
          if (i < node.children.length - 1) cursorX += columnGap;
        }

        return { width: cursorX - originX, height: rowHeight };
      }

      // Default (align === "start"): place children left-to-right at originY
      let cursorX = originX;
      let totalHeight = 0;

      for (let i = 0; i < node.children.length; i++) {
        const { width, height } = layout(
          node.children[i],
          cursorX,
          originY,
          out,
        );
        cursorX += width;
        if (i < node.children.length - 1) cursorX += columnGap;
        totalHeight = Math.max(totalHeight, height);
      }

      return { width: cursorX - originX, height: totalHeight };
    }

    // node.kind === "parallel": place children top-to-bottom
    if (orientation === "vertical") {
      if (node.align === "end") {
        const sizes = node.children.map((child) => layout(child, 0, 0, {}));
        const maxHeight = sizes.reduce((max, s) => Math.max(max, s.height), 0);

        let cursorX = originX;
        for (let i = 0; i < node.children.length; i++) {
          const childY = originY + maxHeight - sizes[i].height;
          layout(node.children[i], cursorX, childY, out);
          cursorX += sizes[i].width;
          if (i < node.children.length - 1) cursorX += rowGap;
        }

        return { width: cursorX - originX, height: maxHeight };
      }

      let cursorX = originX;
      let maxHeight = 0;

      for (let i = 0; i < node.children.length; i++) {
        const { width, height } = layout(
          node.children[i],
          cursorX,
          originY,
          out,
        );
        maxHeight = Math.max(maxHeight, height);
        cursorX += width;
        if (i < node.children.length - 1) cursorX += rowGap;
      }

      return { width: cursorX - originX, height: maxHeight };
    }

    if (node.align === "end") {
      // Two-pass: measure widths first, then position right-aligned.
      const sizes = node.children.map((child) => layout(child, 0, 0, {}));
      const maxWidth = sizes.reduce((max, s) => Math.max(max, s.width), 0);

      let cursorY = originY;
      for (let i = 0; i < node.children.length; i++) {
        const childX = originX + maxWidth - sizes[i].width;
        layout(node.children[i], childX, cursorY, out);
        cursorY += sizes[i].height;
        if (i < node.children.length - 1) cursorY += rowGap;
      }

      return { width: maxWidth, height: cursorY - originY };
    }

    let cursorY = originY;
    let maxWidth = 0;

    for (let i = 0; i < node.children.length; i++) {
      const { width, height } = layout(node.children[i], originX, cursorY, out);
      maxWidth = Math.max(maxWidth, width);
      cursorY += height;
      if (i < node.children.length - 1) cursorY += rowGap;
    }

    return { width: maxWidth, height: cursorY - originY };
  }

  layout(flowState.tree, 0, 0, positions);

  return positions;
}

// =============================================================================
// computeDiagramRect
// =============================================================================

/**
 * Returns the bounding rectangle of the entire diagram.
 *
 * - `width`  = x of the rightmost node's left edge + that node's width
 * - `height` = y of the bottommost node's top edge + that node's height
 *
 * This function is pure — it does not access the DOM.
 */
export function computeDiagramRect(
  positions: NodePositions,
  flowState: FlowState,
): DiagramRect {
  let width = 0;
  let height = 0;

  for (const [id, pos] of Object.entries(positions)) {
    const node = flowState.nodes[id];
    if (!node) continue;
    width = Math.max(width, pos.x + node.width);
    height = Math.max(height, pos.y + node.height);
  }

  return { width, height };
}
