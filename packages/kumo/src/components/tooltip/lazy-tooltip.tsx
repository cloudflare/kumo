import React from "react";
import type { Tooltip as TooltipComponent, TooltipProps } from "./tooltip";

/*
 * `Tooltip` for components that need one only for an optional prop, such as
 * `Button`'s `title` and `Label`'s `tooltip`. A static import would put Base
 * UI's tooltip and floating-ui (about 129 KB minified) in every bundle that
 * contains those components, so the tooltip code loads the first time a
 * trigger mounts instead. Until it arrives, the trigger renders alone.
 */

let loadedTooltip: typeof TooltipComponent | null = null;
let pendingLoad: Promise<void> | null = null;
const listeners = new Set<() => void>();

function loadTooltip() {
  if (loadedTooltip || pendingLoad) return;
  pendingLoad = import("./tooltip").then(
    (module) => {
      loadedTooltip = module.Tooltip;
      for (const listener of listeners) listener();
    },
    (error: unknown) => {
      // The trigger still works without its tooltip. Let the next trigger
      // retry, and rethrow so the failure reaches the console.
      pendingLoad = null;
      throw error;
    },
  );
}

function subscribe(onLoad: () => void) {
  listeners.add(onLoad);
  loadTooltip();
  return () => {
    listeners.delete(onLoad);
  };
}

const getTooltip = () => loadedTooltip;
// The server and the hydration render always output the trigger alone, so the
// first client render matches the server markup.
const getServerTooltip = () => null;

type TriggerRef = React.Ref<HTMLElement> | undefined;

/** React 19 passes `ref` as a prop; React 18 keeps it on the element. */
function getElementRef(element: React.ReactElement): TriggerRef {
  return Number.parseInt(React.version, 10) >= 19
    ? (element.props as { ref?: TriggerRef }).ref
    : (element as unknown as { ref?: TriggerRef }).ref;
}

/**
 * Wraps the trigger's own ref. When the tooltip arrives, the trigger remounts,
 * because Base UI's `Tooltip.Trigger` has to render it. If the old trigger had
 * focus, the new one takes it, so keyboard users don't lose their place.
 */
function useTriggerRef(elementRef: TriggerRef) {
  const node = React.useRef<HTMLElement | null>(null);
  const hadFocus = React.useRef(false);
  const cleanup = React.useRef<(() => void) | null>(null);

  return React.useCallback(
    (next: HTMLElement | null) => {
      if (next === null) {
        // React detaches a ref before it removes the element, so the element
        // still has focus here if it had it before. getRootNode() is the
        // shadow root when the trigger renders inside one.
        const previous = node.current;
        hadFocus.current =
          previous !== null &&
          (previous.getRootNode() as Document | ShadowRoot).activeElement ===
            previous;
      } else {
        const active = next.ownerDocument.activeElement;
        if (
          hadFocus.current &&
          (active === null || active === next.ownerDocument.body)
        ) {
          next.focus({ preventScroll: true });
        }
        hadFocus.current = false;
      }
      node.current = next;

      if (typeof elementRef === "function") {
        if (next === null) {
          if (cleanup.current) cleanup.current();
          else elementRef(null);
          cleanup.current = null;
        } else {
          const result: unknown = elementRef(next);
          cleanup.current =
            typeof result === "function" ? (result as () => void) : null;
        }
      } else if (elementRef) {
        (elementRef as React.MutableRefObject<HTMLElement | null>).current =
          next;
      }
    },
    [elementRef],
  );
}

export type LazyTooltipProps = Omit<
  TooltipProps,
  "asChild" | "children" | "render"
> & {
  /** The trigger element. It renders alone until the tooltip code loads. */
  render: React.ReactElement;
  /** Rendered inside the trigger element. */
  children?: React.ReactNode;
};

/** Renders `Tooltip` once its code has loaded, and the trigger alone before. */
export function LazyTooltip({ render, children, ...props }: LazyTooltipProps) {
  const Tooltip = React.useSyncExternalStore(
    subscribe,
    getTooltip,
    getServerTooltip,
  );
  const ref = useTriggerRef(getElementRef(render));
  const trigger = React.cloneElement(
    render as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>,
    { ref },
  );

  if (Tooltip) {
    return (
      <Tooltip {...props} render={trigger}>
        {children}
      </Tooltip>
    );
  }
  // Base UI renders the trigger's children inside the render element.
  return children === undefined
    ? trigger
    : React.cloneElement(trigger, undefined, children);
}
