import { FlowDiagram, FlowNodeList } from "./diagram";
import { FlowNode } from "./node";
import { FlowParallelNode } from "./parallel";

/**
 * Flow - Components for visualizing workflows and data flows.
 *
 * @example
 * ```tsx
 * <Flow>
 *   <Flow.Node>Step 1</Flow.Node>
 *   <Flow.Node>Step 2</Flow.Node>
 *   <Flow.Parallel>
 *     <Flow.Node>Branch A</Flow.Node>
 *     <Flow.Node>Branch B</Flow.Node>
 *   </Flow.Parallel>
 *   <Flow.Node>Step 3</Flow.Node>
 * </Flow>
 * ```
 */
const Flow = Object.assign(FlowDiagram, {
  Node: FlowNode,
  Parallel: FlowParallelNode,
  List: FlowNodeList,
});

export { Flow };

// Also export individual components for backwards compatibility
export { FlowDiagram, FlowNodeList } from "./diagram";
export { FlowNode } from "./node";
export { FlowParallelNode } from "./parallel";
