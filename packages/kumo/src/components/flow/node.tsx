import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNode, type RectLike } from "./diagram";
import { cn } from "../../utils/cn";

type FlowNodeProps = {
  className?: string;
  children?: ReactNode;
};

export function FlowNode({ className, children }: FlowNodeProps) {
  const nodeRef = useRef<HTMLLIElement>(null);
  const startAnchorRef = useRef<HTMLElement | null>(null);
  const endAnchorRef = useRef<HTMLElement | null>(null);
  const [measurements, setMeasurements] = useState<{
    start: RectLike | null;
    end: RectLike | null;
  }>({ start: null, end: null });

  const nodeProps = useMemo(
    () => ({
      parallel: false,
      ...measurements,
    }),
    [measurements],
  );

  const { index, id } = useNode(nodeProps);

  /**
   * This effect intentionally has no dependencies because we want it to run on
   * every render to ensure measurements are always up to date.
   */
  useEffect(() => {
    if (!nodeRef.current) return;

    const rect = nodeRef.current.getBoundingClientRect();
    const nodeRect = rect;

    let startRect: RectLike = nodeRect;
    let endRect: RectLike = nodeRect;

    if (startAnchorRef.current) {
      startRect = startAnchorRef.current.getBoundingClientRect();
    }

    if (endAnchorRef.current) {
      endRect = endAnchorRef.current.getBoundingClientRect();
    }

    setMeasurements((m) => {
      const newVal = { start: startRect, end: endRect };
      if (JSON.stringify(m) === JSON.stringify(newVal)) return m;
      return newVal;
    });
  });

  return (
    <FlowNodeAnchorContext.Provider
      value={useMemo(
        () => ({
          registerStartAnchor: (ref) => {
            startAnchorRef.current = ref;
          },
          registerEndAnchor: (ref) => {
            endAnchorRef.current = ref;
          },
        }),
        [],
      )}
    >
      <li
        className={cn(
          "py-2 px-3 rounded-md shadow bg-kumo-base ring ring-kumo-line",
          className,
        )}
        data-node-index={index}
        data-node-id={id}
        ref={nodeRef}
      >
        {children}
      </li>
    </FlowNodeAnchorContext.Provider>
  );
}

type FlowNodeAnchorContextType = {
  registerStartAnchor: (ref: HTMLElement | null) => void;
  registerEndAnchor: (ref: HTMLElement | null) => void;
};

const FlowNodeAnchorContext = createContext<FlowNodeAnchorContextType | null>(
  null,
);

type FlowNodeAnchorProps = {
  /**
   * Determines if the anchor should serve as a "start" point for the
   * _next_ connector or the "end" point for the _previous_ connector.
   * When omitted, it serves as both the start and end points.
   */
  type?: "start" | "end";
  className?: string;
  children?: ReactNode;
};

export function FlowAnchor({ type, className, children }: FlowNodeAnchorProps) {
  const context = useContext(FlowNodeAnchorContext);
  const anchorRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error("Flow.Anchor must be used within Flow.Node");
  }

  useEffect(() => {
    if (!anchorRef.current) {
      return;
    }

    if (type === "start" || type === undefined) {
      context.registerStartAnchor(anchorRef.current);
    }
    if (type === "end" || type === undefined) {
      context.registerEndAnchor(anchorRef.current);
    }

    return () => {
      if (type === "start" || type === undefined) {
        context.registerStartAnchor(null);
      }
      if (type === "end" || type === undefined) {
        context.registerEndAnchor(null);
      }
    };
  }, [type, context.registerStartAnchor, context.registerEndAnchor]);

  return (
    <div ref={anchorRef} className={className}>
      {children}
    </div>
  );
}

FlowNode.Anchor = FlowAnchor;
