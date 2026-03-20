import { forwardRef, useState } from "react";
import { Flow } from "@cloudflare/kumo";
import { CaretDownIcon, SidebarSimpleIcon } from "@phosphor-icons/react";

const ExpandableNode = forwardRef<
  HTMLLIElement,
  { title: string; children: React.ReactNode }
>(function ExpandableNode({ title, children, ...props }, ref) {
  const [open, setOpen] = useState(false);
  return (
    <li
      ref={ref}
      {...props}
      className="rounded-lg shadow bg-kumo-base ring ring-kumo-line overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-kumo-default"
      >
        {title}
        <CaretDownIcon
          className={`size-4 text-kumo-subtle transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-kumo-line px-3 py-2 text-sm text-kumo-subtle">
          {children}
        </div>
      )}
    </li>
  );
});

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
      <Flow.Parallel>
        <Flow.Node>HTTP Trigger</Flow.Node>
        <Flow.Node>Cron Trigger</Flow.Node>
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

/** Flow diagram with disabled nodes */
export function FlowDisabledDemo() {
  return (
    <Flow>
      <Flow.Node>Request</Flow.Node>
      <Flow.Parallel>
        <Flow.Node>Primary Handler</Flow.Node>
        <Flow.Node disabled>Backup Handler (disabled)</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>Response</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with right-aligned parallel nodes */
export function FlowParallelAlignEndDemo() {
  return (
    <Flow>
      <Flow.Node>Start</Flow.Node>
      <Flow.Parallel align="end">
        <Flow.Node>Short</Flow.Node>
        <Flow.Node>Medium Length</Flow.Node>
        <Flow.Node>Very Long Node Name</Flow.Node>
      </Flow.Parallel>
      <Flow.Node>End</Flow.Node>
    </Flow>
  );
}

/** Flow diagram with parallel branches containing nested node sequences */
export function FlowParallelNestedListDemo() {
  return (
    <Flow>
      <Flow.Parallel>
        <Flow.List>
          <Flow.Node>Client Users</Flow.Node>
          <Flow.Node>Engineering Team Access</Flow.Node>
        </Flow.List>
        <Flow.List>
          <Flow.Parallel>
            <Flow.Node>All Authenticated Users</Flow.Node>
            <Flow.Node>Client Users</Flow.Node>
            <Flow.Node>Site Users</Flow.Node>
          </Flow.Parallel>
          <Flow.Node>Contractor Access</Flow.Node>
        </Flow.List>
      </Flow.Parallel>
      <Flow.Node>Destinations</Flow.Node>
    </Flow>
  );
}

/**
 * Repro: connector lines misalign when a sidebar shifts the layout.
 * Toggle the sidebar to see connectors jump out of place (the bug) or
 * stay aligned (after the fix). Scroll the page while the sidebar is
 * open to trigger the same stale-rect issue.
 */
export function FlowSidebarBugDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-lg ring ring-kumo-line bg-kumo-base min-h-64 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-kumo-line px-3 py-2 shrink-0">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-kumo-default hover:bg-kumo-elevated transition-colors"
        >
          <SidebarSimpleIcon className="size-4" />
          {sidebarOpen ? "Close sidebar" : "Open sidebar"}
        </button>
        <span className="text-xs text-kumo-subtle">
          Toggle the sidebar — connectors should stay aligned
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div
          className="shrink-0 overflow-hidden transition-[width] duration-300 border-r border-kumo-line bg-kumo-elevated"
          style={{ width: sidebarOpen ? 160 : 0 }}
        >
          <div className="w-40 p-3 space-y-1">
            <p className="text-xs font-semibold text-kumo-subtle uppercase tracking-wide mb-2">
              Sidebar
            </p>
            {["Overview", "Settings", "Logs", "Analytics"].map((item) => (
              <div
                key={item}
                className="rounded px-2 py-1 text-sm text-kumo-default hover:bg-kumo-base cursor-default"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Main content with Flow — fixed height forces inner scroll */}
        <div className="flex-1 overflow-auto p-4 h-48">
          <Flow>
            <Flow.Node>HTTP Request</Flow.Node>
            <Flow.Parallel>
              <Flow.Node>Auth Check</Flow.Node>
              <Flow.Node>Rate Limit</Flow.Node>
              <Flow.Node>Cache Lookup</Flow.Node>
            </Flow.Parallel>
            <Flow.Node>Route Handler</Flow.Node>
            <Flow.Parallel>
              <Flow.Node>Log</Flow.Node>
              <Flow.Node>Respond</Flow.Node>
            </Flow.Parallel>
          </Flow>
        </div>
      </div>
    </div>
  );
}

/** Flow diagram with expandable nodes in a parallel group */
export function FlowExpandableDemo() {
  return (
    <Flow>
      <Flow.Node>Incoming Request</Flow.Node>
      <Flow.Parallel>
        <Flow.Node
          render={
            <ExpandableNode title="Auth Service">
              <p>Validates JWT tokens and session cookies.</p>
              <p className="mt-1">
                Connects to identity provider via OAuth 2.0.
              </p>
            </ExpandableNode>
          }
        />
        <Flow.Node
          render={
            <ExpandableNode title="Rate Limiter">
              <p>Enforces per-IP request limits.</p>
              <p className="mt-1">Sliding window: 100 req/min.</p>
            </ExpandableNode>
          }
        />
      </Flow.Parallel>
      <Flow.Node>Route to Origin</Flow.Node>
    </Flow>
  );
}
