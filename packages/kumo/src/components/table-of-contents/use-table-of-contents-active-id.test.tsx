import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useTableOfContentsActiveId } from "./use-table-of-contents-active-id";

// useScrollspy owns the IntersectionObserver wiring (covered by its own tests).
// Stub it so these tests can drive which element scrollspy reports as active and
// focus on what this hook owns: reflecting scrollspy while in scrollspy mode,
// pinning a section on selectSection (hash mode), and resuming scrollspy after
// the smooth-scroll debounce.
let mockScrollspyActive: Element | null = null;
vi.mock("./use-scrollspy", () => ({
  useScrollspy: () => mockScrollspyActive,
}));

// A minimal stand-in for an observed anchor element — the hook only reads `.id`.
const el = (id: string) => ({ id }) as Element;

describe("useTableOfContentsActiveId", () => {
  beforeEach(() => {
    mockScrollspyActive = null;
  });

  it("starts with no active section", () => {
    const { result } = renderHook(() =>
      useTableOfContentsActiveId({ targets: [] }),
    );

    expect(result.current.activeId).toBeNull();
  });

  it("tracks the section reported by scrollspy while in scrollspy mode", () => {
    const { result, rerender } = renderHook(() =>
      useTableOfContentsActiveId({ targets: [] }),
    );

    act(() => {
      mockScrollspyActive = el("one");
      rerender();
    });
    expect(result.current.activeId).toBe("one");

    act(() => {
      mockScrollspyActive = el("two");
      rerender();
    });
    expect(result.current.activeId).toBe("two");
  });

  it("pins the selected section and ignores scrollspy until it resumes", () => {
    vi.useFakeTimers();

    try {
      const { result, rerender } = renderHook(() =>
        useTableOfContentsActiveId({ targets: [] }),
      );

      act(() => {
        mockScrollspyActive = el("one");
        rerender();
      });
      expect(result.current.activeId).toBe("one");

      // A click / deep-link pins the chosen section immediately.
      act(() => {
        result.current.selectSection("three");
      });
      expect(result.current.activeId).toBe("three");

      // Scrollspy now reports a different section, but hash mode wins.
      act(() => {
        mockScrollspyActive = el("two");
        rerender();
      });
      expect(result.current.activeId).toBe("three");
    } finally {
      vi.useRealTimers();
    }
  });

  it("resumes scrollspy tracking once the smooth-scroll debounce elapses", () => {
    vi.useFakeTimers();

    try {
      const { result, rerender } = renderHook(() =>
        useTableOfContentsActiveId({ targets: [] }),
      );

      act(() => {
        result.current.selectSection("three");
      });
      expect(result.current.activeId).toBe("three");

      // Not scrolling, so after the debounce the hook returns to scrollspy mode.
      act(() => {
        vi.advanceTimersByTime(50);
      });

      act(() => {
        mockScrollspyActive = el("two");
        rerender();
      });
      expect(result.current.activeId).toBe("two");
    } finally {
      vi.useRealTimers();
    }
  });

  it("tears down a pending restore on unmount without firing stray timers", () => {
    vi.useFakeTimers();

    try {
      const { result, unmount } = renderHook(() =>
        useTableOfContentsActiveId({ targets: [] }),
      );

      act(() => {
        result.current.selectSection("three");
      });

      expect(() => {
        unmount();
        vi.advanceTimersByTime(1000);
      }).not.toThrow();
    } finally {
      vi.useRealTimers();
    }
  });
});
