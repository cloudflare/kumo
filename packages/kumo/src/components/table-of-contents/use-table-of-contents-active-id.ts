import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { useScrollspy } from "./use-scrollspy";

/**
 * Tracks whether the window is mid-scroll so a click-driven `active` state
 * isn't immediately overwritten by scrollspy before the smooth scroll lands.
 */
function useIsScrolling() {
  const isScrolling = useRef(false);

  useEffect(() => {
    const markScrolling = () => {
      isScrolling.current = true;
    };
    const markStopped = () => {
      isScrolling.current = false;
    };

    window.addEventListener("scroll", markScrolling, { passive: true });
    window.addEventListener("scrollend", markStopped);

    return () => {
      window.removeEventListener("scroll", markScrolling);
      window.removeEventListener("scrollend", markStopped);
    };
  }, []);

  return isScrolling;
}

export interface UseTableOfContentsActiveIdOptions {
  /**
   * The section anchor elements (or refs) to observe, in document order.
   * `null` is treated as "not resolved yet" — nothing is observed until the
   * consumer supplies elements.
   */
  targets: (Element | RefObject<Element>)[] | null;
  /**
   * Distance in px from the top of the scrolling `<main>` to the scrollspy
   * activation line — typically the fixed header height so the topmost section
   * actually in view is the one highlighted. Measured once on mount.
   *
   * @default 0
   */
  offset?: number;
}

export interface UseTableOfContentsActiveId {
  /** The id of the section currently considered active, or `null`. */
  activeId: string | null;
  /**
   * Force a section active (a ToC click or hash deep-link), temporarily
   * pausing scrollspy so the chosen section sticks even when it's too short to
   * reach the activation line. Scrollspy resumes once the smooth scroll ends.
   */
  selectSection: (id: string) => void;
}

const SCROLL_DEBOUNCE_TIMEOUT = 50;

/**
 * Table-of-contents scroll-tracking orchestration.
 *
 * Derives the currently-active section from scroll position via an
 * `IntersectionObserver` (see {@link useScrollspy}), and exposes a
 * `selectSection` action that pins a section on click / hash deep-link.
 *
 * The `TableOfContents` component itself is purely presentational — pair this
 * hook with it to drive the `active` prop of each item, so the active-section
 * behavior stays consistent (and isn't re-implemented per consumer).
 *
 * The consumer owns resolving `targets` (from a DOM scan of `<a href>` anchors,
 * an explicit id list, etc.) and deciding when to call `selectSection` (a
 * `location.hash` effect, an `onClick`, a `hashchange` listener, …). This hook
 * owns only the scrollspy / hash mode-switching.
 *
 * @example
 * ```tsx
 * const { activeId, selectSection } = useTableOfContentsActiveId({
 *   targets: sectionElements,
 *   offset: HEADER_HEIGHT,
 * });
 *
 * <TableOfContents.Item
 *   href="#intro"
 *   active={activeId === "intro"}
 *   onClick={() => selectSection("intro")}
 * >
 *   Introduction
 * </TableOfContents.Item>
 * ```
 */
export function useTableOfContentsActiveId({
  targets,
  offset = 0,
}: UseTableOfContentsActiveIdOptions): UseTableOfContentsActiveId {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rootMargin, setRootMargin] = useState("0px 0px 0px 0px");
  const mode = useRef<"scrollspy" | "hash">("scrollspy");
  const isScrolling = useIsScrolling();

  // Push the activation line down past the fixed header, measured from <main>.
  useLayoutEffect(() => {
    const root = document.querySelector("main");

    if (root) {
      const rootTop = root.getBoundingClientRect().top;
      const scrollY = document.documentElement.scrollTop;

      setRootMargin(`-${rootTop + scrollY + 1 + offset}px 0px 0px 0px`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTargetElement = useScrollspy(targets, { rootMargin });

  useEffect(() => {
    if (mode.current === "scrollspy" && activeTargetElement) {
      setActiveId(activeTargetElement.id);
    }
  }, [activeTargetElement]);

  // Track the pending "restore scrollspy" work so it can be torn down on
  // unmount and superseded on rapid repeated clicks (no listener build-up).
  const restoreTimeout = useRef<number | undefined>(undefined);
  const restoreListener = useRef<(() => void) | null>(null);

  const clearPendingRestore = useCallback(() => {
    if (restoreTimeout.current !== undefined) {
      window.clearTimeout(restoreTimeout.current);
      restoreTimeout.current = undefined;
    }
    if (restoreListener.current) {
      document.removeEventListener("scrollend", restoreListener.current);
      restoreListener.current = null;
    }
  }, []);

  const selectSection = useCallback(
    (id: string) => {
      clearPendingRestore();
      mode.current = "hash";
      setActiveId(id);

      const restoreScrollspy = () => {
        restoreTimeout.current = window.setTimeout(() => {
          restoreTimeout.current = undefined;

          if (isScrolling.current) {
            restoreListener.current = restoreScrollspy;
            document.addEventListener("scrollend", restoreScrollspy, {
              once: true,
            });
          } else {
            mode.current = "scrollspy";
          }
        }, SCROLL_DEBOUNCE_TIMEOUT);
      };

      restoreScrollspy();
    },
    [clearPendingRestore, isScrolling],
  );

  useEffect(() => clearPendingRestore, [clearPendingRestore]);

  return { activeId, selectSection };
}
