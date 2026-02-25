import {
  createContext,
  useContext,
  useEffect,
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
  type DescendantInfo,
} from "./use-children";

const PAN_SPACING = {
  y: 64,
  x: 16,
};

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
  className?: string;
  children?: ReactNode;
}

export function FlowDiagram({
  orientation = "horizontal",
  align = "start",
  className,
  children,
}: FlowDiagramProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    if (!wrapperRef.current || !contentRef.current) return;

    const measureBounds = () => {
      if (!wrapperRef.current || !contentRef.current) return;

      const wrapper = wrapperRef.current.getBoundingClientRect();
      const content = contentRef.current.getBoundingClientRect();

      const availableWidth = wrapper.width - PAN_SPACING.x * 2;
      const availableHeight = wrapper.height - PAN_SPACING.y * 2;

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

      setCanPan(
        content.width > availableWidth || content.height > availableHeight,
      );
    };

    measureBounds();

    const resizeObserver = new ResizeObserver(measureBounds);
    resizeObserver.observe(wrapperRef.current);
    resizeObserver.observe(contentRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
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
  }, [bounds, x, y]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  // Handle wheel/scroll events for panning
  useEffect(() => {
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
  }, [bounds, x, y]);

  const isEventFromNode = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    return target.closest("[data-node-id]") !== null;
  };

  const handlePanStart = (e: PointerEvent) => {
    if (isEventFromNode(e)) return;
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
        className={cn(
          "relative overflow-hidden py-16 px-4 grow isolate group",
          className,
        )}
        style={{
          cursor: canPan && !isPanning ? "grab" : undefined,
        }}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
      >
        <motion.div ref={contentRef} className="w-max mx-auto" style={{ x, y }}>
          <FlowNodeList>{children}</FlowNodeList>
        </motion.div>

        {/* Vertical scrollbar */}
        {canScrollY && (
          <div className="absolute right-1 top-4 bottom-4 w-1.5 rounded-full bg-kumo-line/50 opacity-0 group-hover:opacity-100">
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
          <div className="absolute bottom-1 left-4 right-4 h-1.5 rounded-full bg-kumo-line/50 opacity-0 group-hover:opacity-100">
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

export const useNode = (props: NodeData) => useDescendantIndex<NodeData>(props);

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

  const connectors = useMemo(() => {
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
        });
      }
    }

    return edges;
  }, [descendants.descendants]);

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
