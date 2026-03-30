import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@cloudflare/kumo";

export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

interface TableOfContentsProps {
  /** Static headings (MDX pages). Omit to scrape from the DOM (.astro pages). */
  headings?: TocHeading[];
}

export function TableOfContents({
  headings: headingsProp,
}: TableOfContentsProps) {
  const headings = useMemo(
    () => {
      if (headingsProp && headingsProp.length > 0) return headingsProp;
      if (typeof document === "undefined") return [];

      const content = document.querySelector(".kumo-prose");
      if (!content) return [];

      return Array.from(content.querySelectorAll("h2, h3"))
        .filter((el) => el.id)
        .map((el) => ({
          depth: el.tagName === "H2" ? 2 : 3,
          slug: el.id,
          text: el.textContent?.trim() ?? "",
        }));
    },
    [headingsProp],
  );

  const observedHeadings = useMemo(
    () => headings.filter((heading) => heading.depth <= 2),
    [headings],
  );

  const [activeId, setActiveId] = useState<string>(
    observedHeadings[0]?.slug ?? "",
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setObserverRoot = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || observedHeadings.length === 0) return;

      setActiveId(observedHeadings[0]?.slug ?? "");

      const elements = observedHeadings
        .map((heading) => document.getElementById(heading.slug))
        .filter((element): element is HTMLElement => element !== null);

      if (elements.length === 0) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (scrollingRef.current) return;

          const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .toSorted(
              (a, b) =>
                (a.target as HTMLElement).offsetTop -
                (b.target as HTMLElement).offsetTop,
            );

          if (visibleEntries.length > 0) {
            setActiveId(visibleEntries[0].target.id);
            return;
          }

          // No headings visible: clamp to first or last depending on scroll position.
          const firstElement = document.getElementById(
            observedHeadings[0]?.slug ?? "",
          );
          const lastElement = document.getElementById(
            observedHeadings.at(-1)?.slug ?? "",
          );

          if (firstElement && window.scrollY < firstElement.offsetTop) {
            setActiveId(observedHeadings[0]?.slug ?? "");
          } else if (lastElement && window.scrollY >= lastElement.offsetTop) {
            setActiveId(observedHeadings.at(-1)?.slug ?? "");
          }
        },
        {
          rootMargin: "-10% 0px -70% 0px",
          threshold: [0, 1],
        },
      );

      for (const element of elements) {
        observerRef.current.observe(element);
      }
    },
    [observedHeadings],
  );

  if (observedHeadings.length === 0) return null;

  return (
    <section>
      <p className="mb-3 text-xs font-semibold tracking-wide text-kumo-subtle uppercase">
        On this page
      </p>
      <nav
        aria-label="Table of contents"
        className="relative space-y-1.5 before:absolute before:top-0 before:bottom-0 before:left-0.5 before:w-px before:bg-kumo-line"
        ref={setObserverRoot}
      >
        {observedHeadings.map((heading) => {
          const isActive = activeId === heading.slug;
          return (
            <a
              key={heading.slug}
              href={`#${heading.slug}`}
              onClick={() => {
                setActiveId(heading.slug);
                scrollingRef.current = true;
                if (scrollTimerRef.current)
                  clearTimeout(scrollTimerRef.current);
                scrollTimerRef.current = setTimeout(() => {
                  scrollingRef.current = false;
                }, 1000);
              }}
              className={cn(
                "group relative block rounded-md py-1 pl-5 text-sm no-underline transition-all duration-500",
                isActive
                  ? "text-kumo-default font-medium"
                  : "text-kumo-subtle hover:bg-kumo-tint hover:text-kumo-default hover:font-medium",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-0 bottom-0 left-0.5 w-0.5 rounded-full transition-all duration-200",
                  isActive
                    ? "bg-kumo-brand opacity-100"
                    : "bg-kumo-brand opacity-0 group-hover:opacity-60",
                )}
              />
              <span className="block min-w-0 leading-5">{heading.text}</span>
            </a>
          );
        })}
      </nav>
    </section>
  );
}
