import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { useFlowStateContext, useNode, type NodeData } from "./diagram";

type AnchorType = "start" | "end" | "both";

// Utility to merge refs
function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

/**
 * FlowNode component props.
 *
 * @example Default styling
 * ```tsx
 * <Flow.Node>Step 1</Flow.Node>
 * ```
 *
 * @example Custom render - completely replaces the default element
 * ```tsx
 * <Flow.Node render={<div className="custom-node">Custom content</div>} />
 * ```
 */
export type FlowNodeProps = {
  /**
   * Optional identifier for the node. When provided, used as the
   * `data-node-id` attribute instead of the auto-generated React id.
   */
  id?: string;
  /**
   * Custom element to render instead of the default styled node.
   * When provided, completely replaces the default element.
   */
  render?: ReactElement;
  children?: ReactNode;
  /**
   * When true, any connector linking to this node will be greyed out.
   */
  disabled?: boolean;
};

export const FlowNode = forwardRef<HTMLElement, FlowNodeProps>(
  function FlowNode({ id: idProp, render, children, disabled = false }, ref) {
    const nodeRef = useRef<HTMLElement>(null);

    const nodeProps = useMemo((): NodeData => ({ kind: "node" }), []);
    const { index, id } = useNode(nodeProps, idProp);
    const { reportNode, removeNode, nodePositions } = useFlowStateContext();

    // Refs that FlowAnchor children write into. Read by reportSize so that
    // anchor offsets are always included in the same reportNode call —
    // avoiding the state-batching race where reportAnchor fires before the
    // node entry exists in the nodes map.
    const startAnchorOffsetRef = useRef<number | undefined>(undefined);
    const endAnchorOffsetRef = useRef<number | undefined>(undefined);

    const reportSize = useCallback(() => {
      if (!nodeRef.current) return;
      const { width, height } = nodeRef.current.getBoundingClientRect();
      reportNode(id, {
        width,
        height,
        disabled,
        startAnchorOffset: startAnchorOffsetRef.current,
        endAnchorOffset: endAnchorOffsetRef.current,
      });
    }, [reportNode, id, disabled]);

    useLayoutEffect(() => {
      if (!nodeRef.current) return;
      const observer = new ResizeObserver(reportSize);
      observer.observe(nodeRef.current);
      reportSize();
      return () => {
        observer.disconnect();
        removeNode(id);
      };
    }, [reportSize, removeNode, id]);

    const registerAnchor = useCallback(
      (type: AnchorType, el: HTMLElement | null) => {
        const writeOffsets = (offset: number | undefined) => {
          if (type === "start" || type === "both")
            startAnchorOffsetRef.current = offset;
          if (type === "end" || type === "both")
            endAnchorOffsetRef.current = offset;
        };

        if (!el) {
          writeOffsets(undefined);
          reportSize();
          return;
        }

        const measure = () => {
          if (!nodeRef.current) return;
          const anchorRect = el.getBoundingClientRect();
          const nodeRect = nodeRef.current.getBoundingClientRect();
          writeOffsets(anchorRect.top - nodeRect.top + anchorRect.height / 2);
          reportSize();
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
      },
      // reportSize is stable within a render cycle; it changes only when
      // id/disabled/reportNode change, which also triggers FlowNode's own
      // ResizeObserver to re-report. Safe to omit here.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [id],
    );

    const anchorContext = useMemo(() => ({ registerAnchor }), [registerAnchor]);

    const position = nodePositions[id];
    const mergedRef = mergeRefs(ref, nodeRef);

    const positionStyle: React.CSSProperties = position
      ? { position: "absolute", top: position.y, left: position.x }
      : { opacity: 0 };

    let element: ReactElement;
    if (render && isValidElement(render)) {
      const renderProps = render.props as {
        children?: ReactNode;
        style?: React.CSSProperties;
        "data-testid"?: string;
      };
      element = cloneElement(render, {
        ref: mergedRef,
        "data-node-index": index,
        "data-node-id": id,
        "data-testid": renderProps["data-testid"] ?? id,
        "aria-hidden": position ? undefined : true,
        style: {
          ...positionStyle,
          cursor: "default",
          ...renderProps.style,
        },
        children: renderProps.children ?? children,
      } as React.HTMLAttributes<HTMLElement> & { ref: React.Ref<HTMLElement> });
    } else {
      element = (
        <li
          ref={mergedRef}
          className="py-2 px-3 rounded-md shadow bg-kumo-base ring ring-kumo-line absolute cursor-default"
          style={positionStyle}
          data-node-index={index}
          data-node-id={id}
          data-testid={id}
          aria-hidden={position ? undefined : "true"}
        >
          {children}
        </li>
      );
    }

    return (
      <FlowNodeAnchorContext.Provider value={anchorContext}>
        {element}
      </FlowNodeAnchorContext.Provider>
    );
  },
);

FlowNode.displayName = "Flow.Node";

// =============================================================================
// FlowAnchor
// =============================================================================

type FlowNodeAnchorContextType = {
  registerAnchor: (
    type: AnchorType,
    el: HTMLElement | null,
  ) => (() => void) | undefined;
};

const FlowNodeAnchorContext = createContext<FlowNodeAnchorContextType | null>(
  null,
);

/**
 * FlowAnchor component props.
 *
 * @example Default (unstyled div)
 * ```tsx
 * <Flow.Anchor type="start">Anchor content</Flow.Anchor>
 * ```
 *
 * @example Custom render - completely replaces the default element
 * ```tsx
 * <Flow.Anchor type="end" render={<span className="custom-anchor">Custom anchor</span>} />
 * ```
 */
export type FlowAnchorProps = {
  /**
   * Determines if the anchor should serve as a "start" point for the
   * _next_ connector or the "end" point for the _previous_ connector.
   * When omitted, it serves as both the start and end points.
   */
  type?: "start" | "end";
  /**
   * Custom element to render instead of the default div.
   * When provided, completely replaces the default element.
   */
  render?: ReactElement;
  children?: ReactNode;
};

export const FlowAnchor = forwardRef<HTMLElement, FlowAnchorProps>(
  function FlowAnchor({ type, render, children }, ref) {
    const context = useContext(FlowNodeAnchorContext);

    if (!context) {
      throw new Error("Flow.Anchor must be used within Flow.Node");
    }

    const anchorRef = useRef<HTMLElement>(null);
    const mergedRef = mergeRefs(ref, anchorRef);

    const { registerAnchor } = context;
    const anchorType = type ?? "both";

    useLayoutEffect(() => {
      const el = anchorRef.current;
      if (!el) return;
      const cleanup = registerAnchor(anchorType, el);
      return () => {
        cleanup?.();
        registerAnchor(anchorType, null);
      };
      // registerAnchor is stable (memoized in FlowNode); anchorType is
      // unlikely to change at runtime but including it is correct.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anchorType, registerAnchor]);

    if (render && isValidElement(render)) {
      const renderProps = render.props as { children?: ReactNode };
      return cloneElement(render, {
        ref: mergedRef,
        children: renderProps.children ?? children,
      } as React.HTMLAttributes<HTMLElement> & { ref: React.Ref<HTMLElement> });
    }

    return <div ref={mergedRef as React.Ref<HTMLDivElement>}>{children}</div>;
  },
);

FlowAnchor.displayName = "Flow.Anchor";
