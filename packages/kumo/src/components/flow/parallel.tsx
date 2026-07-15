import { useEffect, useMemo, type ReactNode } from "react";
import { useNode, useNodeGroup, useFlowStateContext } from "./diagram";
import { DescendantsProvider } from "./use-children";

type FlowParallelNodeProps = {
  children: ReactNode;
  /** When "end", each branch is right-aligned to the widest branch. */
  align?: "end";
};

export function FlowParallelNode({ children, align }: FlowParallelNodeProps) {
  const descendants = useNodeGroup();
  const { reportDescendants } = useFlowStateContext();

  // Only structural info (kind, id, children) is keyed — not DOM rects —
  // to avoid re-computing on every measurement update.
  const structuralKey = JSON.stringify(
    descendants.descendants.map((d) => ({
      id: d.id,
      kind: d.props.kind,
      children: d.props.kind !== "node" ? d.props.children : undefined,
    })),
  );

  const nodeProps = useMemo(
    () => ({
      kind: "parallel" as const,
      children: descendants.descendants.map((d) => d.id),
      align,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [structuralKey, align],
  );

  const { index, id } = useNode(nodeProps);

  // Report our immediate descendants upward so FlowDiagram can reconstruct
  // the full tree for this parallel branch.
  useEffect(() => {
    reportDescendants(id, descendants.descendants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structuralKey, reportDescendants, id]);

  return (
    <li data-node-index={index}>
      <DescendantsProvider value={descendants}>{children}</DescendantsProvider>
    </li>
  );
}
