import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@cloudflare/kumo";
import { CaretDown } from "@phosphor-icons/react";

export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

interface TableOfContentsProps {
  /** Static headings (MDX pages). Omit to scrape from the DOM (.astro pages). */
  headings?: TocHeading[];
  /**
   * - `"sidebar"` (default) — vertical list with active indicator bar
   * - `"select"` — native `<select>` jump menu for compact layouts
   */
  layout?: "sidebar" | "select";
}

/**
 * Scrape h2 elements from the rendered `.kumo-prose` container.
 * Only runs client-side for .astro pages that don't pass headings statically.
 */
function scrapeHeadings(): TocHeading[] {
  if (typeof document === "undefined") return [];

  const content = document.querySelector(".kumo-prose");
  if (!content) return [];

  return Array.from(content.querySelectorAll("h2"))
    .filter((el) => el.id)
    .map((el) => ({
      depth: 2,
      slug: el.id,
      text: el.textContent?.trim() ?? "",
    }));
}

export function TableOfContents({
  headings: headingsProp,
  layout = "sidebar",
}: TableOfContentsProps) {
  const headings = useMemo(() => {
    if (headingsProp && headingsProp.length > 0) {
      return headingsProp.filter((h) => h.depth <= 2);
    }
    return scrapeHeadings();
  }, [headingsProp]);

  const [activeId, setActiveId] = useState<string>(headings[0]?.slug ?? "");

  // When a TOC link is clicked we temporarily suppress the observer so the
  // active state doesn't flicker as the page scrolls to the target heading.
  const suppressObserverRef = useRef(false);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clean up the suppression timer on unmount.
  useEffect(() => () => clearTimeout(suppressTimerRef.current), []);

  const handleClick = useCallback((slug: string) => {
    setActiveId(slug);
    suppressObserverRef.current = true;
    clearTimeout(suppressTimerRef.current);
    suppressTimerRef.current = setTimeout(() => {
      suppressObserverRef.current = false;
    }, 1000);
  }, []);

  // Callback ref: wire up the IntersectionObserver when the <nav> mounts.
  const navRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node || headings.length === 0) return;

      const elements = headings
        .map((h) => document.getElementById(h.slug))
        .filter((el): el is HTMLElement => el !== null);

      if (elements.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (suppressObserverRef.current) return;

          const visible = entries
            .filter((e) => e.isIntersecting)
            .toSorted(
              (a, b) =>
                (a.target as HTMLElement).offsetTop -
                (b.target as HTMLElement).offsetTop,
            );

          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
            return;
          }

          // No headings visible -- clamp to first or last based on scroll position.
          const first = document.getElementById(headings[0].slug);
          const last = document.getElementById(headings.at(-1)!.slug);

          if (first && window.scrollY < first.offsetTop) {
            setActiveId(headings[0].slug);
          } else if (last && window.scrollY >= last.offsetTop) {
            setActiveId(headings.at(-1)!.slug);
          }
        },
        { rootMargin: "-10% 0px -70% 0px", threshold: [0, 1] },
      );

      for (const el of elements) observer.observe(el);

      // Disconnect when the node unmounts (React will call the ref with null).
      return () => observer.disconnect();
    },
    [headings],
  );

  if (headings.length === 0) return null;

  // Compact jump menu for smaller screens
  if (layout === "select") {
    return (
      <nav aria-label="Table of contents" ref={navRef} className="relative">
        <select
          aria-label="Jump to section"
          value={activeId}
          onChange={(e) => {
            const slug = e.target.value;
            handleClick(slug);
            document
              .getElementById(slug)
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-full appearance-none rounded-lg border border-kumo-hairline bg-kumo-base px-4 py-2.5 pr-10 text-sm text-kumo-default"
        >
          {headings.map((heading) => (
            <option key={heading.slug} value={heading.slug}>
              {heading.text}
            </option>
          ))}
        </select>
        <CaretDown
          size={16}
          weight="bold"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-kumo-subtle"
        />
      </nav>
    );
  }

  // Sidebar layout (default)
  return (
    <section>
      <p className="mb-3 text-xs font-semibold tracking-wide text-kumo-subtle uppercase">
        On this page
      </p>
      <nav
        aria-label="Table of contents"
        className="relative space-y-1.5 before:absolute before:inset-y-0 before:left-0.5 before:w-px before:bg-kumo-hairline"
        ref={navRef}
      >
        {headings.map((heading) => {
          const isActive = activeId === heading.slug;
          return (
            <a
              key={heading.slug}
              href={`#${heading.slug}`}
              onClick={() => handleClick(heading.slug)}
              className={cn(
                "group relative block truncate rounded-md py-1 pl-5 text-sm no-underline transition-all duration-500",
                isActive
                  ? "text-kumo-default font-medium"
                  : "text-kumo-subtle hover:bg-kumo-tint hover:text-kumo-default hover:font-medium",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0.5 w-0.5 rounded-full transition-all duration-200",
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
