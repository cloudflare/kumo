import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Connectors, type Connector } from "./connectors";
import {
  getNodeRect,
  useDiagramContext,
  useNode,
  useNodeGroup,
  type RectLike,
} from "./diagram";
import { DescendantsProvider } from "./use-children";

function getStartAndEndPoints({
  container,
  previous,
  next,
  orientation,
}: {
  container: RectLike;
  previous: RectLike | null;
  next: RectLike | null;
  orientation: "vertical" | "horizontal";
}): {
  start: { x: number; y: number };
  end: { x: number; y: number };
} {
  if (orientation === "vertical") {
    // we ignore previous/next calculations for vertical orientations for now
    return {
      start: {
        x: container.width / 2,
        y: 0,
      },
      end: {
        x: container.width / 2,
        y: container.height,
      },
    };
  }
  // Default to midpoints
  let start = {
    x: 0,
    y: container.height / 2,
  };
  let end = {
    x: container.width,
    y: container.height / 2,
  };
  if (previous) {
    start.y = previous.top - container.top + previous.height / 2;
  }
  if (next) {
    end.y = next.top - container.top + next.height / 2;
  }
  return { start, end };
}

type FlowParallelNodeProps = {
  children: ReactNode;
  /**
   * Controls alignment of nodes within the parallel group.
   * - `start`: Nodes align to the left (default)
   * - `end`: Nodes align to the right
   */
  align?: "start" | "end";
};

export function FlowParallelNode({
  children,
  align = "start",
}: FlowParallelNodeProps) {
  const { orientation } = useDiagramContext();
  const descendants = useNodeGroup();

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);
  const [measurements, setMeasurements] = useState<DOMRect | null>(null);

  const { index, getPrevious, getNext } = useNode(
    useMemo(
      () => ({ parallel: true, start: measurements, end: measurements }),
      [measurements],
    ),
  );

  /**
   * This effect intentionally has no dependencies because we want it to run on
   * every render to ensure measurements are always up to date.
   */
  useEffect(() => {
    if (!contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    setMeasurements((m) => {
      if (JSON.stringify(m) === JSON.stringify(rect)) return m;
      return rect;
    });
  });

  const measure = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    const [prevNode, nextNode] = [getPrevious(), getNext()];
    const previousNodeRect = getNodeRect(prevNode, { type: "start" });
    const nextNodeRect = getNodeRect(nextNode, { type: "end" });

    const { start, end } = getStartAndEndPoints({
      container: containerRect,
      previous: previousNodeRect,
      next: nextNodeRect,
      orientation,
    });

    // First pass: collect all branch points to determine directions
    const incomingBranchPoints: { y: number }[] = [];
    const outgoingBranchPoints: { y: number }[] = [];

    for (const descendant of descendants.descendants) {
      const { props } = descendant;
      const [endAnchorRect, startAnchorRect] = [props.end, props.start];

      if (previousNodeRect && endAnchorRect) {
        const anchorCenter =
          orientation === "horizontal"
            ? endAnchorRect.top - containerRect.top + endAnchorRect.height / 2
            : endAnchorRect.left - containerRect.left + endAnchorRect.width / 2;
        incomingBranchPoints.push({ y: anchorCenter });
      }

      if (nextNodeRect && startAnchorRect) {
        const anchorCenter =
          orientation === "horizontal"
            ? startAnchorRect.top -
              containerRect.top +
              startAnchorRect.height / 2
            : startAnchorRect.left -
              containerRect.left +
              startAnchorRect.width / 2;
        outgoingBranchPoints.push({ y: anchorCenter });
      }
    }

    // Determine if we need junctions based on branch directions
    // A junction is needed if connections branch in different directions
    // (including inline vs above/below)
    const FLAT_THRESHOLD = 2;

    const hasIncomingJunction = (() => {
      if (incomingBranchPoints.length <= 1) return false;
      const hasAbove = incomingBranchPoints.some(
        (p) => p.y < start.y - FLAT_THRESHOLD,
      );
      const hasBelow = incomingBranchPoints.some(
        (p) => p.y > start.y + FLAT_THRESHOLD,
      );
      const hasInline = incomingBranchPoints.some(
        (p) => Math.abs(p.y - start.y) <= FLAT_THRESHOLD,
      );
      // Junction needed if connections go in different directions
      const directions = [hasAbove, hasBelow, hasInline].filter(Boolean).length;
      return directions > 1;
    })();

    const hasOutgoingJunction = (() => {
      if (outgoingBranchPoints.length <= 1) return false;
      const hasAbove = outgoingBranchPoints.some(
        (p) => p.y < end.y - FLAT_THRESHOLD,
      );
      const hasBelow = outgoingBranchPoints.some(
        (p) => p.y > end.y + FLAT_THRESHOLD,
      );
      const hasInline = outgoingBranchPoints.some(
        (p) => Math.abs(p.y - end.y) <= FLAT_THRESHOLD,
      );
      // Junction needed if connections go in different directions
      const directions = [hasAbove, hasBelow, hasInline].filter(Boolean).length;
      return directions > 1;
    })();

    // Second pass: create connectors with single prop based on junction presence
    const newConnectors = descendants.descendants.flatMap((descendant) => {
      const { props } = descendant;
      const connectors: Connector[] = [];

      const [endAnchorRect, startAnchorRect] = [props.end, props.start];
      const isDescendantDisabled = props.disabled;

      if (previousNodeRect && endAnchorRect) {
        let branchStart: { x: number; y: number };
        switch (orientation) {
          case "vertical": {
            const anchorCenter =
              endAnchorRect.left - containerRect.left + endAnchorRect.width / 2;
            branchStart = {
              x: anchorCenter,
              y: endAnchorRect.top - containerRect.top,
            };
            break;
          }
          case "horizontal": {
            const anchorCenter =
              endAnchorRect.top - containerRect.top + endAnchorRect.height / 2;
            branchStart = {
              x: endAnchorRect.left - containerRect.left,
              y: anchorCenter,
            };
            break;
          }
          default:
            throw new Error(`Unknown orientation: ${orientation as string}`);
        }
        connectors.push({
          x1: start.x,
          y1: start.y,
          x2: branchStart.x,
          y2: branchStart.y,
          isBottom: false,
          disabled: prevNode?.props.disabled || isDescendantDisabled,
          single: !hasIncomingJunction,
        });
      }

      if (nextNodeRect && startAnchorRect) {
        let branchEnd: { x: number; y: number };
        switch (orientation) {
          case "vertical": {
            const anchorCenter =
              startAnchorRect.left -
              containerRect.left +
              startAnchorRect.width / 2;
            branchEnd = {
              x: anchorCenter,
              y: startAnchorRect.bottom - containerRect.top,
            };
            break;
          }
          case "horizontal": {
            const anchorCenter =
              startAnchorRect.top -
              containerRect.top +
              startAnchorRect.height / 2;
            branchEnd = {
              x: startAnchorRect.right - containerRect.left,
              y: anchorCenter,
            };
            break;
          }
          default:
            throw new Error(`Unknown orientation: ${orientation as string}`);
        }
        connectors.push({
          x1: branchEnd.x,
          y1: branchEnd.y,
          x2: end.x,
          y2: end.y,
          isBottom: true,
          disabled: isDescendantDisabled || nextNode?.props.disabled,
          single: !hasOutgoingJunction,
        });
      }

      return connectors;
    });

    return {
      connectors: newConnectors,
      junctions: {
        start:
          previousNodeRect && hasIncomingJunction
            ? {
                x: orientation === "vertical" ? start.x : start.x + 32,
                y: orientation === "vertical" ? start.y + 32 : start.y,
              }
            : undefined,
        end:
          nextNodeRect && hasOutgoingJunction
            ? {
                x: orientation === "vertical" ? end.x : end.x - 32,
                y: orientation === "vertical" ? end.y - 32 : end.y,
              }
            : undefined,
      },
      containerRect: containerRect,
    };
  };

  const links = measure();

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        orientation === "horizontal" ? "px-16 -mx-16" : "py-16 -my-16",
      )}
      data-node-index={index}
    >
      <div className="absolute inset-0 pointer-events-none z-10">
        {links && (
          <Connectors connectors={links.connectors} orientation={orientation}>
            {links.junctions?.start && (
              <g
                transform={`translate(${links.junctions.start.x} ${links.junctions.start.y})`}
              >
                <JunctionBox />
              </g>
            )}
            {links.junctions?.end && (
              <g
                transform={`translate(${links.junctions.end.x} ${links.junctions.end.y})`}
              >
                <JunctionBox />
              </g>
            )}
          </Connectors>
        )}
      </div>
      <ul
        className={cn(
          "gap-5 list-none flex",
          align === "start" ? "items-start" : "items-end",
          orientation === "horizontal"
            ? "flex-col ml-0"
            : "gap-5 w-fit mx-auto",
        )}
        ref={contentRef}
      >
        <DescendantsProvider value={descendants}>
          {children}
        </DescendantsProvider>
      </ul>
    </div>
  );
}

function JunctionBox({ size = 6 }) {
  const halfSize = size / 2;
  return (
    <rect
      x={-halfSize}
      y={-halfSize}
      width={size}
      height={size}
      fill="currentColor"
      rx="1"
    />
  );
}
