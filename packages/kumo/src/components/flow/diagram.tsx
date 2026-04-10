import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import { cn } from "../../utils/cn";
import { Connectors, type Connector } from "./connectors";
import {
  DescendantsProvider,
  useDescendantIndex,
  useDescendants,
  useOptionalDescendantsContext,
  type DescendantInfo,
} from "./use-children";

const DEFAULT_PADDING = {
  y: 64,
  x: 16,
};

function isEventFromNode(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("[data-node-id]") !== null;
}

/** Minimum scrollbar thumb size in percentage to ensure visibility */
const MIN_SCROLLBAR_THUMB_SIZE = 10;

// Vertical orientation is currently a no-op
type Orientation = "horizontal" | "vertical";
type Align = "start" | "center";

interface DiagramContextValue {
  orientation: Orientation;
  align: Align;
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** Ref to the canvas viewport wrapper element */
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}

const DiagramContext = createContext<DiagramContextValue | null>(null);

export function useDiagramContext(): DiagramContextValue {
  const context = useContext(DiagramContext);
  if (context === null) {
    throw new Error("useDiagramContext must be used within a FlowDiagram");
  }
  return context;
}

interface FlowDiagramProps {
  orientation?: Orientation;
  /**
   * Controls vertical alignment of nodes in horizontal orientation.
   * - `start`: Nodes align to the top (default)
   * - `center`: Nodes are vertically centered
   */
  align?: Align;
  /**
   * Whether to render the pannable canvas wrapper.
   * - `true`: Renders with pannable canvas, scrollbars, and pan gestures (default)
   * - `false`: Renders only the node list without canvas wrapper
   */
  canvas?: boolean;
  /**
   * Padding around the diagram content within the canvas.
   * - `x`: Horizontal padding in pixels (default: 16)
   * - `y`: Vertical padding in pixels (default: 64)
   */
  padding?: { x?: number; y?: number };
  /**
   * Callback fired when the overflow state changes.
   * Called with `{ x: boolean, y: boolean }` indicating overflow in each axis.
   */
  onOverflowChange?: (overflow: { x: boolean; y: boolean }) => void;
  className?: string;
  children?: ReactNode;
}

export function FlowDiagram({
  orientation = "horizontal",
  align = "start",
  canvas = true,
  padding: requestedPadding,
  onOverflowChange,
  className,
  children,
}: FlowDiagramProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const padding = {
    x: requestedPadding?.x ?? DEFAULT_PADDING.x,
    y: requestedPadding?.y ?? DEFAULT_PADDING.y,
  };

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [bounds, setBounds] = useState<{ x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState<{
    viewportWidth: number;
    viewportHeight: number;
    contentWidth: number;
    contentHeight: number;
  } | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [canPan, setCanPan] = useState(false);

  useEffect(() => {
    if (!canvas) return;
    if (!wrapperRef.current || !contentRef.current) return;

    const measureBounds = () => {
      if (!wrapperRef.current || !contentRef.current) return;

      const wrapper = wrapperRef.current.getBoundingClientRect();
      const content = contentRef.current.getBoundingClientRect();

      const availableWidth = wrapper.width - padding.x * 2;
      const availableHeight = wrapper.height - padding.y * 2;

      setBounds({
        x: Math.min(0, availableWidth - content.width),
        y: Math.min(0, availableHeight - content.height),
      });

      setDimensions({
        viewportWidth: availableWidth,
        viewportHeight: availableHeight,
        contentWidth: content.width,
        contentHeight: content.height,
      });

      const isXOverflow = content.width > availableWidth;
      const isYOverflow = content.height > availableHeight;

      setCanPan(isXOverflow || isYOverflow);
      onOverflowChange?.({ x: isXOverflow, y: isYOverflow });
    };

    measureBounds();

    const resizeObserver = new ResizeObserver(measureBounds);
    resizeObserver.observe(wrapperRef.current);
    resizeObserver.observe(contentRef.current);

    return () => resizeObserver.disconnect();
  }, [padding.x, padding.y, canvas, onOverflowChange]);

  useEffect(() => {
    if (!canvas) return;
    if (!bounds) return;

    /**
     * It's possible for the content to resize after the user panned. If we're
     * at the edge of the pan and the content gets smaller, then we've "panned
     * too far". In this case, we transition the pan back to the new bounds.
     */
    if (x.get() < bounds.x) {
      x.set(bounds.x);
    }
    if (y.get() < bounds.y) {
      y.set(bounds.y);
    }
  }, [bounds, x, y, canvas]);

  useEffect(() => {
    if (!canvas) return;
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [canvas]);

  // Handle wheel/scroll events for panning
  useEffect(() => {
    if (!canvas) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e: WheelEvent) => {
      if (!bounds) return;

      const canScrollX = bounds.x < 0;
      const canScrollY = bounds.y < 0;

      if (!canScrollX && !canScrollY) return;

      e.preventDefault();

      if (canScrollY) {
        const newY = Math.max(bounds.y, Math.min(0, y.get() - e.deltaY));
        y.set(newY);
      }

      if (canScrollX) {
        const newX = Math.max(bounds.x, Math.min(0, x.get() - e.deltaX));
        x.set(newX);
      }
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", handleWheel);
  }, [canvas, bounds, x, y]);

  const handlePanStart = (e: PointerEvent) => {
    if (isEventFromNode(e.target)) return;
    setIsPanning(true);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  };

  const handlePan = (_: PointerEvent, info: PanInfo) => {
    if (!bounds || !isPanning) return;
    x.set(Math.max(bounds.x, Math.min(0, x.get() + info.delta.x)));
    y.set(Math.max(bounds.y, Math.min(0, y.get() + info.delta.y)));
  };

  const handlePanEnd = () => {
    if (!isPanning) return;
    setIsPanning(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  // Calculate scrollbar dimensions
  const canScrollX = bounds && bounds.x < 0;
  const canScrollY = bounds && bounds.y < 0;

  const scrollThumbWidth =
    dimensions && dimensions.contentWidth > 0 && dimensions.viewportWidth > 0
      ? Math.max(
          MIN_SCROLLBAR_THUMB_SIZE,
          (dimensions.viewportWidth / dimensions.contentWidth) * 100,
        )
      : 0;
  const scrollThumbHeight =
    dimensions && dimensions.contentHeight > 0 && dimensions.viewportHeight > 0
      ? Math.max(
          MIN_SCROLLBAR_THUMB_SIZE,
          (dimensions.viewportHeight / dimensions.contentHeight) * 100,
        )
      : 0;

  // Transform pan position to scrollbar thumb position (as percentage)
  const scrollbarXPercent = useTransform(
    x,
    [0, bounds?.x ?? 0],
    [0, 100 - scrollThumbWidth],
  );
  const scrollbarYPercent = useTransform(
    y,
    [0, bounds?.y ?? 0],
    [0, 100 - scrollThumbHeight],
  );

  const scrollTop = useMotionTemplate`${scrollbarYPercent}%`;
  const scrollLeft = useMotionTemplate`${scrollbarXPercent}%`;

  const contextValue = useMemo(
    () => ({ orientation, align, x, y, wrapperRef }),
    [orientation, align, x, y],
  );

  return (
    <DiagramContext.Provider value={contextValue}>
      <motion.div
        ref={wrapperRef}
        className={cn("relative overflow-hidden grow isolate group", className)}
        style={{
          paddingTop: padding.y,
          paddingBottom: padding.y,
          paddingLeft: padding.x,
          paddingRight: padding.x,
          cursor: canPan && !isPanning ? "grab" : undefined,
        }}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
      >
        <motion.div
          data-testid="flow-contents"
          ref={contentRef}
          className="w-max mx-auto"
          style={{ x, y }}
        >
          <FlowNodeList>{children}</FlowNodeList>
        </motion.div>

        {/* Vertical scrollbar */}
        {canScrollY && (
          <div className="absolute right-1 top-1 bottom-1 w-1.5 rounded-full bg-kumo-hairline/50 opacity-0 group-hover:opacity-100">
            <motion.div
              className="absolute w-full rounded-full bg-kumo-fill"
              style={{
                height: `${scrollThumbHeight}%`,
                top: scrollTop,
              }}
            />
          </div>
        )}

        {/* Horizontal scrollbar */}
        {canScrollX && (
          <div className="absolute bottom-1 left-1 right-1 h-1.5 rounded-full bg-kumo-hairline/50 opacity-0 group-hover:opacity-100">
            <motion.div
              className="absolute h-full rounded-full bg-kumo-fill"
              style={{
                width: `${scrollThumbWidth}%`,
                left: scrollLeft,
              }}
            />
          </div>
        )}
      </motion.div>
    </DiagramContext.Provider>
  );
}

// ---

export type RectLike = {
  x: number;
  y: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type NodeData = {
  parallel?: boolean;
  disabled?: boolean;
  start?: RectLike | null;
  end?: RectLike | null;
};

export const useNodeGroup = () => useDescendants<NodeData>();

export const useNode = (props: NodeData, id?: string) =>
  useDescendantIndex<NodeData>(props, id);

/**
 * Hook to optionally register as a node if within a parent descendants context.
 * Returns registration info if registered, or null if no parent context exists.
 */
export const useOptionalNode = (props: NodeData) => {
  const parentContext = useOptionalDescendantsContext<NodeData>();
  const id = useId();

  // Claim render order during render if we have a parent context
  const renderOrder = parentContext?.claimRenderOrder(id) ?? -1;

  const unregisterRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!parentContext?.register) return;

    const { unregister } = parentContext.register(id, renderOrder, props);

    if (!unregisterRef.current) {
      unregisterRef.current = unregister;
    }

    return () => {
      if (unregisterRef.current) {
        unregisterRef.current();
        unregisterRef.current = null;
      }
    };
  }, [id, renderOrder, props, parentContext?.register]);

  if (!parentContext) return null;

  const index = parentContext.descendants.findIndex((d) => d.id === id);
  return { index, id };
};

export const getNodeRect = (
  node: DescendantInfo<NodeData> | undefined,
  { type = "start" }: { type?: "start" | "end" },
): RectLike | null => {
  if (!node) return null;
  return node.props[type] ?? null;
};

export function FlowNodeList({ children }: { children: ReactNode }) {
  const { orientation, align } = useDiagramContext();
  const descendants = useNodeGroup();
  const containerRef = useRef<HTMLDivElement>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);

  const computeConnectors = useCallback(() => {
    const edges: Connector[] = [];
    const nodes = descendants.descendants;
    const containerRect = containerRef.current?.getBoundingClientRect();

    const offsetX = containerRect?.left ?? 0;
    const offsetY = containerRect?.top ?? 0;

    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i];
      const nextNode = nodes[i + 1];

      if (currentNode.props?.parallel || nextNode.props?.parallel) continue;

      const currentRect = getNodeRect(currentNode, { type: "start" });
      const nextRect = getNodeRect(nextNode, { type: "end" });

      if (currentRect && nextRect) {
        const isDisabled =
          currentNode.props.disabled || nextNode.props.disabled;
        edges.push({
          x1: currentRect.left - offsetX + currentRect.width,
          y1: currentRect.top - offsetY + currentRect.height / 2,
          x2: nextRect.left - offsetX,
          y2: nextRect.top - offsetY + nextRect.height / 2,
          disabled: isDisabled,
          single: true,
          fromId: currentNode.id,
          toId: nextNode.id,
        });
      }
    }

    setConnectors(edges);
  }, [descendants.descendants]);

  /**
   * Recompute connectors after layout so that containerRect and node rects are
   * read in the same synchronous pass — preventing stale-rect mismatches.
   */
  useLayoutEffect(() => {
    computeConnectors();
  }, [computeConnectors]);

  /**
   * Recompute on scroll/resize: the container shifts in the viewport without
   * any ResizeObserver firing, so we must re-read all rects explicitly.
   */
  useEffect(() => {
    window.addEventListener("scroll", computeConnectors, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", computeConnectors, { passive: true });
    return () => {
      window.removeEventListener("scroll", computeConnectors, {
        capture: true,
      });
      window.removeEventListener("resize", computeConnectors);
    };
  }, [computeConnectors]);

  // Get the first and last node's anchor points for parent registration
  const firstNode = descendants.descendants[0];
  const lastNode = descendants.descendants[descendants.descendants.length - 1];

  // Use the first node's "end" anchor as our "end" (incoming connector point)
  // Use the last node's "start" anchor as our "start" (outgoing connector point)
  const endAnchor = firstNode?.props?.end ?? null;
  const startAnchor = lastNode?.props?.start ?? null;

  const nodeProps = useMemo(
    () => ({
      parallel: false,
      disabled: false,
      start: startAnchor,
      end: endAnchor,
    }),
    [JSON.stringify(startAnchor), JSON.stringify(endAnchor)],
  );

  // Register with parent context if we're nested (e.g., inside Flow.Parallel)
  useOptionalNode(nodeProps);

  return (
    <DescendantsProvider value={descendants}>
      <div className="relative" ref={containerRef}>
        <ul
          className={cn(
            "ml-0 list-none",
            orientation === "vertical"
              ? "grid auto-rows-min gap-16"
              : "flex gap-16",
            orientation === "horizontal" &&
              (align === "center" ? "items-center" : "items-start"),
          )}
        >
          {children}
        </ul>
        <div className="absolute inset-0 pointer-events-none">
          <Connectors connectors={connectors} orientation={orientation} />
        </div>
      </div>
    </DescendantsProvider>
  );
}
