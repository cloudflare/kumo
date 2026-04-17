import type { DescendantInfo } from "./use-children";
import type { NodeData } from "./diagram";

/**
 * Computes edges between flow nodes based on the component hierarchy encoded
 * in the flat `descendants` array.
 *
 * Rules (from spec):
 * 1. Adjacent `node` entries are connected directly.
 * 2. A `node` adjacent to a `parallel` group connects to all of that group's
 *    immediate children (first child for incoming, last child for outgoing).
 * 3. Adjacent `parallel` groups are NOT connected to one another.
 * 4. A `list` group connects externally to its first and last child only.
 *
 * Edges are returned as a `Set<string>` where each entry is formatted as
 * `"<from>—<to>"` (using an em dash as the separator).
 *
 * The function is pure — it does not access the DOM and has no side effects.
 */
export function computeEdges(
  descendants: DescendantInfo<NodeData>[],
): Set<string> {
  const edges = new Set<string>();

  function addEdge(from: string, to: string) {
    edges.add(`${from}—${to}`);
  }

  /**
   * Returns the IDs that act as "exit points" (outgoing connection targets)
   * for a given descendant. For a plain node this is just [id]. For a
   * parallel/list group it's the last child of each branch.
   */
  function exitIds(d: DescendantInfo<NodeData>): string[] {
    if (d.props.kind === "node") return [d.id];
    if (d.props.kind === "parallel") {
      // Each child is a branch; last node of each branch is an exit point.
      // Since children are ordered, the last child is d.props.children[last].
      // For a parallel group the children are the direct children registered
      // under it — each child is itself either a node, list, or nested parallel.
      // At this level we simply return all children as exit points because each
      // branch ends at its own last node (which it reports as its child ID).
      return d.props.children;
    }
    if (d.props.kind === "list") {
      // A list connects externally only via its last child.
      const last = d.props.children[d.props.children.length - 1];
      return last ? [last] : [];
    }
    return [];
  }

  /**
   * Returns the IDs that act as "entry points" (incoming connection sources)
   * for a given descendant. For a plain node this is just [id]. For a
   * parallel/list group it's the first child of each branch.
   */
  function entryIds(d: DescendantInfo<NodeData>): string[] {
    if (d.props.kind === "node") return [d.id];
    if (d.props.kind === "parallel") {
      return d.props.children;
    }
    if (d.props.kind === "list") {
      const first = d.props.children[0];
      return first ? [first] : [];
    }
    return [];
  }

  for (let i = 0; i < descendants.length - 1; i++) {
    const current = descendants[i];
    const next = descendants[i + 1];

    // Rule 3: adjacent parallel groups are not connected.
    if (current.props.kind === "parallel" && next.props.kind === "parallel") {
      continue;
    }

    const froms = exitIds(current);
    const tos = entryIds(next);

    for (const from of froms) {
      for (const to of tos) {
        addEdge(from, to);
      }
    }
  }

  return edges;
}
