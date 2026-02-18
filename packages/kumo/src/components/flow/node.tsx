import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import { useNode, type RectLike } from "./diagram";

/**
 * FlowNode component props.
 *
 * @example Default styling
 * ```tsx
 * <Flow.Node>Step 1</Flow.Node>
 * ```
 *
 * @example Custom render
 * ```tsx
 * <Flow.Node render={<div className="custom-node">Custom content</div>} />
 * ```
 */
export type FlowNodeProps = useRender.ComponentProps<"li">;

const FlowNodeBase = forwardRef<HTMLLIElement, FlowNodeProps>(function FlowNode(
  { render, ...props },
  ref,
) {
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

  const defaultProps = {
    className: "py-2 px-3 rounded-md shadow bg-kumo-base ring ring-kumo-line",
    "data-node-index": index,
    "data-node-id": id,
  };

  const element = useRender({
    defaultTagName: "li",
    render,
    ref: [ref, nodeRef],
    props: mergeProps(defaultProps, props),
  });

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
});

FlowNodeBase.displayName = "Flow.Node";

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
 * @example Default styling
 * ```tsx
 * <Flow.Anchor type="start">Anchor content</Flow.Anchor>
 * ```
 *
 * @example Custom render
 * ```tsx
 * <Flow.Anchor type="end" render={<span className="custom-anchor">Custom anchor</span>} />
 * ```
 */
export type FlowAnchorProps = useRender.ComponentProps<"div"> & {
  /**
   * Determines if the anchor should serve as a "start" point for the
   * _next_ connector or the "end" point for the _previous_ connector.
   * When omitted, it serves as both the start and end points.
   */
  type?: "start" | "end";
};

export const FlowAnchor = forwardRef<HTMLDivElement, FlowAnchorProps>(
  function FlowAnchor({ type, render, ...props }, ref) {
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

    const element = useRender({
      defaultTagName: "div",
      render,
      ref: [ref, anchorRef],
      props,
    });

    return element;
  },
);

FlowAnchor.displayName = "Flow.Anchor";

// Compound component with Anchor subcomponent (for backwards compatibility)
export const FlowNode = Object.assign(FlowNodeBase, {
  Anchor: FlowAnchor,
});
