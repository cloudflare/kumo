import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useTableOfContentsActiveId } from "./use-table-of-contents-active-id";

// Mock IntersectionObserver: records observed targets and lets tests drive
// intersection changes through the real observer callback.
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  observed: Element[] = [];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observed.push(el);
  }

  unobserve(el: Element) {
    this.observed = this.observed.filter((o) => o !== el);
  }

  disconnect() {
    this.observed = [];
  }

  /** Simulate entries changing intersection state. */
  intersect(changes: [Element, boolean][]) {
    this.callback(
      changes.map(
        ([target, isIntersecting]) =>
          ({ target, isIntersecting }) as IntersectionObserverEntry,
      ),
      this as unknown as IntersectionObserver,
    );
  }
}

function latestObserver() {
  return MockIntersectionObserver.instances.at(-1)!;
}

/** Create section anchor elements in the document, in order. */
function addSections(ids: string[]) {
  return ids.map((id) => {
    const el = document.createElement("h2");
    el.id = id;
    document.body.appendChild(el);
    return el;
  });
}

describe("useTableOfContentsActiveId", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    window.location.hash = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("starts with no active section and observes nothing for empty ids", () => {
    const { result } = renderHook(() =>
      useTableOfContentsActiveId({ ids: [] }),
    );

    expect(result.current.activeId).toBeNull();
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("is SSR-safe: does not touch the DOM during render", () => {
    // Constructing the observer during render (rather than in an effect) was
    // the original sin that forced consumers to client:only. Renders must not
    // create observers — only the mount effect may.
    const { result } = renderHook(() =>
      useTableOfContentsActiveId({ ids: [] }),
    );
    expect(result.current.activeId).toBeNull();
  });

  it("activates the topmost intersecting section in document order", () => {
    const [one, two] = addSections(["one", "two"]);
    const { result } = renderHook(() =>
      useTableOfContentsActiveId({ ids: ["one", "two"] }),
    );

    expect(latestObserver().observed).toEqual([one, two]);

    act(() => latestObserver().intersect([[two, true]]));
    expect(result.current.activeId).toBe("two");

    // Both visible → topmost (document order) wins.
    act(() => latestObserver().intersect([[one, true]]));
    expect(result.current.activeId).toBe("one");
  });

  it("keeps the last active section when nothing intersects", () => {
    const [one] = addSections(["one", "two"]);
    const { result } = renderHook(() =>
      useTableOfContentsActiveId({ ids: ["one", "two"] }),
    );

    act(() => latestObserver().intersect([[one, true]]));
    act(() => latestObserver().intersect([[one, false]]));

    expect(result.current.activeId).toBe("one");
  });

  it("applies offset as a negative top rootMargin", () => {
    addSections(["one"]);
    renderHook(() => useTableOfContentsActiveId({ ids: ["one"], offset: 64 }));

    expect(latestObserver().options?.rootMargin).toBe("-64px 0px 0px 0px");
  });

  it("pins the selected section and ignores scrollspy while scrolling", () => {
    vi.useFakeTimers();
    try {
      const [one, , three] = addSections(["one", "two", "three"]);
      const { result } = renderHook(() =>
        useTableOfContentsActiveId({ ids: ["one", "two", "three"] }),
      );

      act(() => latestObserver().intersect([[one, true]]));
      expect(result.current.activeId).toBe("one");

      act(() => result.current.selectSection("three"));
      expect(result.current.activeId).toBe("three");

      // Smooth scroll in flight: scroll events keep pushing the settle
      // deadline back, and scrollspy reports don't win over the pin.
      act(() => {
        window.dispatchEvent(new Event("scroll"));
        vi.advanceTimersByTime(100);
        window.dispatchEvent(new Event("scroll"));
        latestObserver().intersect([[three, false]]);
        latestObserver().intersect([[one, true]]);
      });
      expect(result.current.activeId).toBe("three");
    } finally {
      vi.useRealTimers();
    }
  });

  it("resumes scrollspy once scrolling settles (no scrollend needed)", () => {
    vi.useFakeTimers();
    try {
      const [one] = addSections(["one", "two", "three"]);
      const { result } = renderHook(() =>
        useTableOfContentsActiveId({ ids: ["one", "two", "three"] }),
      );

      act(() => result.current.selectSection("three"));

      // 150ms of scroll quiet → unpinned; the next scrollspy report wins.
      act(() => {
        vi.advanceTimersByTime(200);
      });
      act(() => latestObserver().intersect([[one, true]]));

      expect(result.current.activeId).toBe("one");
    } finally {
      vi.useRealTimers();
    }
  });

  it("selects the section from location.hash on mount and hashchange", () => {
    addSections(["one", "two"]);
    window.location.hash = "#two";

    const { result } = renderHook(() =>
      useTableOfContentsActiveId({ ids: ["one", "two"] }),
    );
    expect(result.current.activeId).toBe("two");

    act(() => {
      window.location.hash = "#one";
      window.dispatchEvent(new Event("hashchange"));
    });
    expect(result.current.activeId).toBe("one");
  });

  it("ignores hashes that aren't tracked sections", () => {
    addSections(["one"]);
    window.location.hash = "#footnote-3";

    const { result } = renderHook(() =>
      useTableOfContentsActiveId({ ids: ["one"] }),
    );
    expect(result.current.activeId).toBeNull();
  });

  it("does not react to the hash when trackHash is disabled", () => {
    addSections(["one", "two"]);
    window.location.hash = "#two";

    const { result } = renderHook(() =>
      useTableOfContentsActiveId({ ids: ["one", "two"], trackHash: false }),
    );
    expect(result.current.activeId).toBeNull();
  });

  it("rebuilds the observer when ids change", () => {
    const [, two] = addSections(["one", "two"]);
    const { rerender } = renderHook(
      ({ ids }) => useTableOfContentsActiveId({ ids }),
      { initialProps: { ids: ["one"] } },
    );

    const firstObserver = latestObserver();
    rerender({ ids: ["one", "two"] });

    expect(firstObserver.observed).toEqual([]); // disconnected
    expect(latestObserver()).not.toBe(firstObserver);
    expect(latestObserver().observed).toContain(two);
  });

  it("tears down pending unpin work on unmount without firing stray timers", () => {
    vi.useFakeTimers();
    try {
      const { result, unmount } = renderHook(() =>
        useTableOfContentsActiveId({ ids: [] }),
      );

      act(() => result.current.selectSection("three"));

      expect(() => {
        unmount();
        window.dispatchEvent(new Event("scroll"));
        vi.advanceTimersByTime(1000);
      }).not.toThrow();
    } finally {
      vi.useRealTimers();
    }
  });
});
