import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { useNode, type RectLike } from "./diagram";

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
   * Custom element to render instead of the default styled node.
   * When provided, completely replaces the default element.
   */
  render?: ReactElement;
  children?: ReactNode;
};

export const FlowNode = forwardRef<HTMLElement, FlowNodeProps>(
  function FlowNode({ render, children }, ref) {
    const nodeRef = useRef<HTMLElement>(null);
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

    const mergedRef = mergeRefs(ref, nodeRef);

    let element: ReactElement;
    if (render && isValidElement(render)) {
      // When render prop is provided, clone it with ref and data attributes
      const renderProps = render.props as { children?: ReactNode };
      element = cloneElement(render, {
        ref: mergedRef,
        "data-node-index": index,
        "data-node-id": id,
        children: renderProps.children ?? children,
      } as React.HTMLAttributes<HTMLElement> & { ref: React.Ref<HTMLElement> });
    } else {
      // Default element
      element = (
        <li
          ref={mergedRef}
          className="py-2 px-3 rounded-md shadow bg-kumo-base ring ring-kumo-line"
          data-node-index={index}
          data-node-id={id}
        >
          {children}
        </li>
      );
    }

    return (
      <FlowNodeAnchorContext.Provider
        value={useMemo(
          () => ({
            registerStartAnchor: (anchorRef) => {
              startAnchorRef.current = anchorRef;
            },
            registerEndAnchor: (anchorRef) => {
              endAnchorRef.current = anchorRef;
            },
          }),
          [],
        )}
      >
        {element}
      </FlowNodeAnchorContext.Provider>
    );
  },
);

FlowNode.displayName = "Flow.Node";

type FlowNodeAnchorContextType = {
  registerStartAnchor: (ref: HTMLElement | null) => void;
  registerEndAnchor: (ref: HTMLElement | null) => void;
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
    const anchorRef = useRef<HTMLElement>(null);

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

    const mergedRef = mergeRefs(ref, anchorRef);

    if (render && isValidElement(render)) {
      // When render prop is provided, clone it with ref
      const renderProps = render.props as { children?: ReactNode };
      return cloneElement(render, {
        ref: mergedRef,
        children: renderProps.children ?? children,
      } as React.HTMLAttributes<HTMLElement> & { ref: React.Ref<HTMLElement> });
    }

    // Default element
    return <div ref={mergedRef}>{children}</div>;
  },
);

FlowAnchor.displayName = "Flow.Anchor";
