import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";

export const KUMO_NAVIGATE_EVENT = "kumo:navigate";
export const KUMO_PREFETCH_EVENT = "kumo:prefetch";

export type KumoLinkEventSource = "click" | "hover" | "focus";

export type KumoLinkEventDetail = {
  href: string;
  anchor: HTMLAnchorElement;
  nativeEvent: Event;
  source: KumoLinkEventSource;
};

export class KumoNavigateEvent extends CustomEvent<KumoLinkEventDetail> {
  constructor(detail: KumoLinkEventDetail) {
    super(KUMO_NAVIGATE_EVENT, {
      bubbles: true,
      cancelable: true,
      detail,
    });
  }
}

export class KumoPrefetchEvent extends CustomEvent<KumoLinkEventDetail> {
  constructor(detail: KumoLinkEventDetail) {
    super(KUMO_PREFETCH_EVENT, {
      bubbles: true,
      cancelable: false,
      detail,
    });
  }
}

export type UseClientRoutingHandlers = {
  onNavigate?: (href: string, event: KumoNavigateEvent) => void;
  onPrefetch?: (href: string, event: KumoPrefetchEvent) => void;
};

export type UseClientRoutingOptions = {
  target?: EventTarget | null;
};

export function shouldUseClientRouter(
  anchor: HTMLAnchorElement,
  event?: Pick<
    MouseEvent | ReactMouseEvent<HTMLAnchorElement>,
    | "defaultPrevented"
    | "metaKey"
    | "ctrlKey"
    | "shiftKey"
    | "altKey"
    | "button"
  >,
): boolean {
  if (!anchor.href) return false;
  if (anchor.hasAttribute("download")) return false;

  const target = anchor.getAttribute("target");
  if (target && target !== "_self") return false;

  const rawHref = anchor.getAttribute("href");
  if (!rawHref || rawHref.startsWith("#")) return false;

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.origin !== window.location.origin) return false;

  if (!event) return true;
  if (event.defaultPrevented) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  if (event.button !== 0) return false;

  return true;
}

/**
 * Bridge Kumo link events to an application router.
 *
 * Listens for `kumo:navigate` and `kumo:prefetch` on `options.target ?? window`.
 * Call `event.preventDefault()` inside `onNavigate` to accept the router
 * handoff and suppress native anchor navigation. If `onNavigate` does not
 * cancel the custom event, the browser handles the link normally.
 *
 * @example
 * useClientRouting({
 *   onNavigate(href, event) {
 *     if (!router.canHandle(href)) {
 *       return;
 *     }
 *     event.preventDefault();
 *     router.navigate(href);
 *   },
 *   onPrefetch(href) {
 *     router.prefetch?.(href);
 *   },
 * });
 */
export function useClientRouting(
  handlers: UseClientRoutingHandlers,
  options: UseClientRoutingOptions = {},
): void {
  const onNavigateRef = useRef(handlers.onNavigate);
  const onPrefetchRef = useRef(handlers.onPrefetch);

  onNavigateRef.current = handlers.onNavigate;
  onPrefetchRef.current = handlers.onPrefetch;

  useEffect(() => {
    const target =
      options.target === null
        ? null
        : (options.target ?? (typeof window !== "undefined" ? window : null));

    if (!target) {
      return;
    }

    function handlePrefetch(nativeEvent: Event) {
      const event = nativeEvent as KumoPrefetchEvent;
      const href = event.detail?.href;

      if (!href) return;

      onPrefetchRef.current?.(href, event);
    }

    function handleNavigate(nativeEvent: Event) {
      const event = nativeEvent as KumoNavigateEvent;
      const href = event.detail?.href;

      if (!href) return;

      onNavigateRef.current?.(href, event);

      if (event.defaultPrevented) {
        event.stopImmediatePropagation();
      }
    }

    target.addEventListener(
      KUMO_PREFETCH_EVENT,
      handlePrefetch as EventListener,
    );
    target.addEventListener(
      KUMO_NAVIGATE_EVENT,
      handleNavigate as EventListener,
    );

    return () => {
      target.removeEventListener(
        KUMO_PREFETCH_EVENT,
        handlePrefetch as EventListener,
      );
      target.removeEventListener(
        KUMO_NAVIGATE_EVENT,
        handleNavigate as EventListener,
      );
    };
  }, [options.target]);
}
