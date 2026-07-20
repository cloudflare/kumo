import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

function isElement(value: unknown): value is Element {
  return value instanceof Element;
}

function resolveRefs(maybeRefs: (Element | RefObject<Element>)[]): Element[] {
  return maybeRefs
    .map((maybeRef) =>
      maybeRef && typeof maybeRef === "object" && "current" in maybeRef
        ? maybeRef.current
        : maybeRef,
    )
    .filter(isElement);
}

/**
 * Thin wrapper around `IntersectionObserver` whose lifecycle is tied to the
 * observer options. A fresh observer is created whenever the callback or the
 * options change, and disconnected on cleanup.
 */
function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  { root, rootMargin, threshold }: IntersectionObserverInit = {},
): IntersectionObserver {
  const observer = useRef<IntersectionObserver | null>(null);

  function getObserver() {
    if (observer.current === null) {
      observer.current = new IntersectionObserver(callback, {
        root,
        rootMargin,
        threshold,
      });
    }

    return observer.current;
  }

  useEffect(() => {
    observer.current = new IntersectionObserver(callback, {
      root,
      rootMargin,
      threshold,
    });

    return () => {
      observer.current?.disconnect();
    };
  }, [callback, root, rootMargin, threshold]);

  return getObserver();
}

/**
 * Reports the first of the supplied elements that is currently intersecting the
 * viewport (as narrowed by `options.rootMargin`), in document order. Backing
 * primitive for table-of-contents scroll tracking.
 *
 * Accepts either resolved `Element`s or React refs. Pass `null` to observe
 * nothing until the targets are resolved.
 */
export function useScrollspy(
  elementsOrRefs: (Element | RefObject<Element>)[] | null,
  options: IntersectionObserverInit,
): Element | null {
  const elements = useRef<Element[]>([]);

  useEffect(() => {
    elements.current = elementsOrRefs ? resolveRefs(elementsOrRefs) : [];
  }, [elementsOrRefs]);

  const cachedEntries = useRef<WeakMap<
    Element,
    IntersectionObserverEntry
  > | null>(null);

  const [activeElement, setActiveElement] = useState<Element | null>(null);

  const callback = useCallback<IntersectionObserverCallback>((entries) => {
    if (cachedEntries.current === null) {
      cachedEntries.current = new WeakMap();
    }

    for (const entry of entries) {
      cachedEntries.current?.set(entry.target, entry);
    }

    const firstIntersection = elements.current.find(
      (element) => cachedEntries.current?.get(element)?.isIntersecting,
    );

    if (firstIntersection) {
      setActiveElement(firstIntersection);
    }
  }, []);

  const observer = useIntersectionObserver(callback, options);

  useEffect(() => {
    const _elements = elements.current;

    _elements.forEach((element) => {
      if (isElement(element)) {
        observer.observe(element);
      }
    });

    return () => {
      _elements.forEach((element) => {
        if (isElement(element)) {
          observer.unobserve(element);
        }
      });
    };
  }, [observer, elementsOrRefs]);

  return activeElement;
}
