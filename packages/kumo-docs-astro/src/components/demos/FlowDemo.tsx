import { Flow } from "@cloudflare/kumo";

/** Basic flow diagram with sequential nodes */
export function FlowBasicDemo() {
  return (
    <Flow>
      <Flow.Node>Step 1</Flow.Node>
      <Flow.Node>Step 2</Flow.Node>
      <Flow.Node>Step 3</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with parallel branching */
export function FlowParallelDemo() {
  return (
    <Flow>
      <Flow.Node>Start</Flow.Node>
      <Flow.Parallel>
        <Flow.Node>Branch A</Flow.Node>
        <Flow.Node>Branch B</Flow.Node>
        <Flow.Node>Branch C</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>End</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with custom node styling using render prop */
export function FlowCustomContentDemo() {
  return (
    <Flow>
      <Flow.Node render={<li className="rounded-full size-4 bg-kumo-ring" />} />
      <Flow.Node
        render={
          <li className="bg-kumo-contrast text-kumo-inverse rounded-lg font-medium py-2 px-3">
            my-worker
          </li>
        }
      />
    </Flow>
  );
}

/** Complex flow diagram example */
export function FlowComplexDemo() {
  return (
    <Flow>
      <Flow.Node>Trigger</Flow.Node>
      <Flow.Parallel>
        <Flow.Node>Validate Input</Flow.Node>
        <Flow.Node>Check Cache</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>Process Request</Flow.Node>
      <Flow.Parallel>
        <Flow.Node>Log Analytics</Flow.Node>
        <Flow.Node>Update Cache</Flow.Node>
        <Flow.Node>Send Notification</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>Complete</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with custom anchor points */
export function FlowAnchorDemo() {
  return (
    <Flow>
      <Flow.Node>Load balancer</Flow.Node>
      <Flow.Node
        render={
          <li className="shadow-none rounded-lg ring ring-kumo-line bg-kumo-overlay">
            <Flow.Anchor
              type="end"
              render={
                <div className="text-kumo-subtle h-10 flex items-center px-2.5">
                  my-worker
                </div>
              }
            />
            <Flow.Anchor
              type="start"
              render={
                <div className="bg-kumo-base rounded ring ring-kumo-line shadow px-2 py-1.5 m-1.5 mt-0">
                  Bindings
                  <span className="text-kumo-subtle w-5 ml-3">2</span>
                </div>
              }
            />
          </li>
        }
      />
      <Flow.Parallel>
        <Flow.Node>DATABASE</Flow.Node>
        <Flow.Node>OTHER_SERVICE</Flow.Node>
      </Flow.Parallel>
    </Flow>
  );
}

/** Flow diagram with vertically centered nodes */
export function FlowCenteredDemo() {
  return (
    <Flow align="center">
      <Flow.Node render={<li className="rounded-full size-4 bg-kumo-ring" />} />
      <Flow.Node>my-worker</Flow.Node>
      <Flow.Node
        render={
          <li className="py-6 px-3 rounded-md shadow bg-kumo-base ring ring-kumo-line">
            Taller node
          </li>
        }
      />
    </Flow>
  );
}

/** Large flow diagram demonstrating panning */
export function FlowPanningDemo() {
  return (
    <Flow className="rounded-lg border border-kumo-line">
      <Flow.Node>Start</Flow.Node>
      <Flow.Node>Authenticate</Flow.Node>
      <Flow.Node>Validate</Flow.Node>
      <Flow.Node>Transform</Flow.Node>
      <Flow.Node>Process</Flow.Node>
      <Flow.Node>Store</Flow.Node>
      <Flow.Node>Notify</Flow.Node>
      <Flow.Node>Log</Flow.Node>
      <Flow.Node>Complete</Flow.Node>
      <Flow.Node>End</Flow.Node>
    </Flow>
  );
}
