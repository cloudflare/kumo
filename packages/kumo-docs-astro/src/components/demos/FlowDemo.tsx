import { FlowDiagram, FlowNode, FlowParallelNode } from "@cloudflare/kumo";

/** Basic flow diagram with sequential nodes */
export function FlowBasicDemo() {
  return (
    <FlowDiagram>
      <FlowNode>Step 1</FlowNode>
      <FlowNode>Step 2</FlowNode>
      <FlowNode>Step 3</FlowNode>
    </FlowDiagram>
  );
}

/** Flow diagram with parallel branching */
export function FlowParallelDemo() {
  return (
    <FlowDiagram>
      <FlowNode>Start</FlowNode>
      <FlowParallelNode>
        <FlowNode>Branch A</FlowNode>
        <FlowNode>Branch B</FlowNode>
        <FlowNode>Branch C</FlowNode>
      </FlowParallelNode>
      <FlowNode>End</FlowNode>
    </FlowDiagram>
  );
}

/** Flow diagram with custom node content */
export function FlowCustomContentDemo() {
  return (
    <FlowDiagram>
      <FlowNode className="rounded-full size-4 p-0 shadow-none ring-0 bg-kumo-ring" />
      <FlowNode className="bg-kumo-contrast ring-0 shadow-none text-kumo-inverse rounded-lg font-medium">
        <p>my-worker</p>
      </FlowNode>
    </FlowDiagram>
  );
}

/** Complex flow diagram example */
export function FlowComplexDemo() {
  return (
    <FlowDiagram>
      <FlowNode>Trigger</FlowNode>
      <FlowParallelNode>
        <FlowNode>Validate Input</FlowNode>
        <FlowNode>Check Cache</FlowNode>
      </FlowParallelNode>
      <FlowNode>Process Request</FlowNode>
      <FlowParallelNode>
        <FlowNode>Log Analytics</FlowNode>
        <FlowNode>Update Cache</FlowNode>
        <FlowNode>Send Notification</FlowNode>
      </FlowParallelNode>
      <FlowNode>Complete</FlowNode>
    </FlowDiagram>
  );
}

/** Flow diagram with custom anchor points */
export function FlowAnchorDemo() {
  return (
    <FlowDiagram>
      <FlowNode>Load balancer</FlowNode>
      <FlowNode className="shadow-none bg-kumo-overlay p-0">
        <FlowNode.Anchor
          type="end"
          className="text-kumo-subtle h-10 flex items-center px-2.5"
        >
          my-worker
        </FlowNode.Anchor>
        <FlowNode.Anchor
          type="start"
          className="bg-kumo-base rounded ring ring-kumo-line shadow px-2 py-1.5 m-1.5 mt-0"
        >
          Bindings
          <span className="text-kumo-subtle w-5 ml-3">2</span>
        </FlowNode.Anchor>
      </FlowNode>
      <FlowParallelNode>
        <FlowNode>DATABASE</FlowNode>
        <FlowNode>OTHER_SERVICE</FlowNode>
      </FlowParallelNode>
    </FlowDiagram>
  );
}

/** Large flow diagram demonstrating panning */
export function FlowPanningDemo() {
  return (
    <FlowDiagram className="rounded-lg border border-kumo-line">
      <FlowNode>Start</FlowNode>
      <FlowNode>Authenticate</FlowNode>
      <FlowNode>Validate</FlowNode>
      <FlowNode>Transform</FlowNode>
      <FlowNode>Process</FlowNode>
      <FlowNode>Store</FlowNode>
      <FlowNode>Notify</FlowNode>
      <FlowNode>Log</FlowNode>
      <FlowNode>Complete</FlowNode>
      <FlowNode>End</FlowNode>
    </FlowDiagram>
  );
}
