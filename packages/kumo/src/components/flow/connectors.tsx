import { forwardRef, useId, type ReactNode } from "react";

export interface Connector {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isBottom?: boolean;
}

type ConnectorsProps = {
  connectors: Connector[];
  children?: ReactNode;
} & Omit<PathProps, "isBottom">;

type PathProps = Partial<{
  cornerRadius: number;
  midOffset: number;
  arrowheadOffset: number;
  isBottom: boolean;
  single: boolean;
  orientation: "vertical" | "horizontal";
}>;

/**
 * Maximum vertical/horizontal distance between anchor points where the line
 * would render as straight. Below this number, the line will be drawn as a
 * straight line.
 */
const FLAT_THRESHOLD = 2;

export function createRoundedPath(
  { x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number },
  {
    cornerRadius: maxCornerRadius = 8,
    midOffset = 32,
    arrowheadOffset = 8,
    isBottom = false,
    single = false,
    orientation = "vertical",
  }: PathProps = {},
) {
  /**
   * Cap the corner radius to half the vertical/horizontal distance between the
   * anchor points so the line still looks smooth even in small gaps.
   */
  const cornerRadius = Math.min(
    maxCornerRadius,
    Math.abs(orientation === "horizontal" ? (y2 - y1) / 2 : (x2 - x1) / 2),
  );
  if (orientation === "horizontal") {
    if (Math.abs(y2 - y1) <= FLAT_THRESHOLD)
      return `M ${x1} ${y1} L ${x2 - arrowheadOffset} ${y2}`;

    // Horizontal orientation: horizontal → vertical → horizontal
    // verticalOffset is used as horizontalOffset (distance from x2 where we turn)
    const verticalX = x2 - midOffset;
    const isGoingRight = x2 > x1;
    const horizontalSign = isGoingRight ? 1 : -1;
    const isGoingDown = y2 > y1;
    const verticalSign = isGoingDown ? 1 : -1;

    // First horizontal segment stops before the first corner
    const firstHorizontalEnd = verticalX - horizontalSign * cornerRadius;
    // Vertical segment starts after the first corner
    const verticalStart = y1 + verticalSign * cornerRadius;
    // Vertical segment stops before the second corner
    const verticalEnd = y2 - verticalSign * cornerRadius;
    // Second horizontal segment starts after the second corner
    const secondHorizontalStart = verticalX + horizontalSign * cornerRadius;
    // Path ends before the arrowhead (on x-axis)
    const pathEndX = x2 - horizontalSign * arrowheadOffset;

    const bottomCurveCommands = [
      `L ${firstHorizontalEnd} ${y1}`,
      `Q ${verticalX} ${y1} ${verticalX} ${verticalStart}`,
      `L ${verticalX} ${y2}`,
    ];

    const topCurveCommands = [
      single
        ? `L ${firstHorizontalEnd} ${y1} Q ${verticalX} ${y1} ${verticalX} ${verticalStart}`
        : `L ${verticalX} ${y1}`,
      `L ${verticalX} ${verticalEnd}`,
      `Q ${verticalX} ${y2} ${secondHorizontalStart} ${y2}`,
    ];

    const commands = [
      `M ${x1} ${y1}`,
      isBottom ? [...bottomCurveCommands] : [...topCurveCommands],
      `L ${pathEndX} ${y2}`,
    ];

    return commands.join(" ");
  }

  if (Math.abs(x2 - x1) <= FLAT_THRESHOLD)
    return `M ${x1} ${y1} L ${x2} ${y2 - arrowheadOffset}`;

  // Vertical orientation: vertical → horizontal → vertical
  // Vertical offset before turning horizontally
  const horizontalY = y2 - midOffset;
  const isGoingRight = x2 > x1;
  const horizontalSign = isGoingRight ? 1 : -1;
  const isGoingDown = y2 > y1;
  const verticalSign = isGoingDown ? 1 : -1;

  // First vertical segment stops before the first corner (going down)
  const firstVerticalEnd = horizontalY - cornerRadius;
  // Horizontal segment starts after the first corner
  const horizontalStart = x1 + horizontalSign * cornerRadius;
  // Horizontal segment stops before the second corner
  const horizontalEnd = x2 - horizontalSign * cornerRadius;
  // Second vertical segment starts after the second corner (going down)
  const secondVerticalStart = horizontalY + cornerRadius;
  // Path ends before the arrowhead
  const pathEndY = y2 - verticalSign * arrowheadOffset;

  const bottomCurveCommands = [
    `L ${x1} ${firstVerticalEnd}`,
    `Q ${x1} ${horizontalY} ${horizontalStart} ${horizontalY}`,
    `L ${x2} ${horizontalY}`,
  ];

  const topCurveCommands = [
    `L ${x1} ${horizontalY}`,
    `L ${horizontalEnd} ${horizontalY}`,
    `Q ${x2} ${horizontalY} ${x2} ${secondVerticalStart}`,
  ];

  const commands = [
    `M ${x1} ${y1}`, // Move the cursor to the starting point
    isBottom ? [...bottomCurveCommands] : [...topCurveCommands],
    `L ${x2} ${pathEndY}`, // Draw the final line to the end point
  ];

  return commands.join(" ");
}

export const Connectors = forwardRef<SVGSVGElement, ConnectorsProps>(
  function Connectors({ connectors, children, ...pathProps }, svgRef) {
    const id = useId();
    return (
      <svg
        width="100%"
        height="100%"
        aria-hidden="true"
        className="text-kumo-inactive overflow-visible"
        ref={svgRef}
      >
        <defs>
          <marker
            id={id}
            markerWidth="8"
            markerHeight="8"
            refX="0"
            refY="4"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d="M 0,1.5 Q 0,0 1.5,0 Q 3.5,1 5.8,3.2 Q 6.5,4 5.8,4.8 Q 3.5,7 1.5,8 Q 0,8 0,6.5 Z"
              fill="currentColor"
              stroke="none"
            />
          </marker>
        </defs>
        {connectors.map((connector, index) => {
          const path = createRoundedPath(connector, {
            isBottom: connector.isBottom,
            ...pathProps,
          });
          return (
            <path
              key={index}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              markerEnd={`url(#${id})`}
              data-index={index}
            />
          );
        })}
        {children}
      </svg>
    );
  },
);
