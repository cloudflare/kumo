import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { ShikiContext, type ShikiContextValue } from "./context";
import { useShikiHighlighter } from "./use-shiki-highlighter";

function createMockHighlighter() {
  return {
    codeToHtml: vi.fn((code: string) => `<pre>${code}</pre>`),
  };
}

function wrapper(contextValue: ShikiContextValue) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ShikiContext.Provider value={contextValue}>
        {children}
      </ShikiContext.Provider>
    );
  };
}

describe("useShikiHighlighter", () => {
  it("throws when used outside ShikiProvider", () => {
    expect(() => renderHook(() => useShikiHighlighter())).toThrow(
      /useShikiHighlighter must be used within a ShikiProvider/,
    );
  });

  it("returns null when highlighter is not ready", () => {
    const { result } = renderHook(() => useShikiHighlighter(), {
      wrapper: wrapper({
        highlighter: null,
        isLoading: true,
        error: null,
        languages: ["javascript", "typescript"],
        labels: { copy: "Copy", copied: "Copied!" },
      }),
    });

    expect(result.current.highlight("const x = 1;", "javascript")).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isReady).toBe(false);
  });

  it("normalizes language aliases before calling codeToHtml", () => {
    const mockHighlighter = createMockHighlighter();

    const { result } = renderHook(() => useShikiHighlighter(), {
      wrapper: wrapper({
        highlighter: mockHighlighter as any,
        isLoading: false,
        error: null,
        languages: ["javascript", "typescript", "bash"],
        labels: { copy: "Copy", copied: "Copied!" },
      }),
    });

    result.current.highlight("const x = 1;", "js");
    expect(mockHighlighter.codeToHtml).toHaveBeenCalledWith(
      "const x = 1;",
      expect.objectContaining({ lang: "javascript" }),
    );

    result.current.highlight("const x = 1;", "ts");
    expect(mockHighlighter.codeToHtml).toHaveBeenCalledWith(
      "const x = 1;",
      expect.objectContaining({ lang: "typescript" }),
    );

    result.current.highlight("echo hello", "sh");
    expect(mockHighlighter.codeToHtml).toHaveBeenCalledWith(
      "echo hello",
      expect.objectContaining({ lang: "bash" }),
    );
  });

  it("passes canonical language directly to codeToHtml", () => {
    const mockHighlighter = createMockHighlighter();

    const { result } = renderHook(() => useShikiHighlighter(), {
      wrapper: wrapper({
        highlighter: mockHighlighter as any,
        isLoading: false,
        error: null,
        languages: ["javascript", "typescript"],
        labels: { copy: "Copy", copied: "Copied!" },
      }),
    });

    result.current.highlight("const x = 1;", "javascript");
    expect(mockHighlighter.codeToHtml).toHaveBeenCalledWith(
      "const x = 1;",
      expect.objectContaining({ lang: "javascript" }),
    );
  });

  it("returns null and warns when normalized language is not in languages list", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockHighlighter = createMockHighlighter();

    const { result } = renderHook(() => useShikiHighlighter(), {
      wrapper: wrapper({
        highlighter: mockHighlighter as any,
        isLoading: false,
        error: null,
        languages: ["typescript"],
        labels: { copy: "Copy", copied: "Copied!" },
      }),
    });

    // Alias that normalizes to a language NOT in the list
    const html = result.current.highlight("const x = 1;", "js");
    expect(html).toBeNull();
    expect(mockHighlighter.codeToHtml).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Language "js" is not in the ShikiProvider\'s languages list'),
    );

    warnSpy.mockRestore();
  });

  it("returns null and warns for unknown languages", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockHighlighter = createMockHighlighter();

    const { result } = renderHook(() => useShikiHighlighter(), {
      wrapper: wrapper({
        highlighter: mockHighlighter as any,
        isLoading: false,
        error: null,
        languages: ["javascript"],
        labels: { copy: "Copy", copied: "Copied!" },
      }),
    });

    const html = result.current.highlight("fn main() {}", "rust");
    expect(html).toBeNull();
    expect(mockHighlighter.codeToHtml).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Language "rust" is not in the ShikiProvider\'s languages list'),
    );

    warnSpy.mockRestore();
  });

  it("calls codeToHtml with dual theme config", () => {
    const mockHighlighter = createMockHighlighter();

    const { result } = renderHook(() => useShikiHighlighter(), {
      wrapper: wrapper({
        highlighter: mockHighlighter as any,
        isLoading: false,
        error: null,
        languages: ["javascript"],
        labels: { copy: "Copy", copied: "Copied!" },
      }),
    });

    result.current.highlight("const x = 1;", "javascript");
    expect(mockHighlighter.codeToHtml).toHaveBeenCalledWith(
      "const x = 1;",
      {
        lang: "javascript",
        themes: {
          light: "github-light",
          dark: "vesper",
        },
      },
    );
  });

  it("returns null and warns when codeToHtml throws", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockHighlighter = {
      codeToHtml: vi.fn(() => {
        throw new Error("highlight error");
      }),
    };

    const { result } = renderHook(() => useShikiHighlighter(), {
      wrapper: wrapper({
        highlighter: mockHighlighter as any,
        isLoading: false,
        error: null,
        languages: ["javascript"],
        labels: { copy: "Copy", copied: "Copied!" },
      }),
    });

    const html = result.current.highlight("const x = 1;", "javascript");
    expect(html).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to highlight code with language "javascript"'),
      expect.any(Error),
    );

    warnSpy.mockRestore();
  });

  it("exposes isReady as true when highlighter is loaded", () => {
    const { result } = renderHook(() => useShikiHighlighter(), {
      wrapper: wrapper({
        highlighter: createMockHighlighter() as any,
        isLoading: false,
        error: null,
        languages: ["javascript"],
        labels: { copy: "Copy", copied: "Copied!" },
      }),
    });

    expect(result.current.isReady).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("exposes labels from provider", () => {
    const { result } = renderHook(() => useShikiHighlighter(), {
      wrapper: wrapper({
        highlighter: createMockHighlighter() as any,
        isLoading: false,
        error: null,
        languages: ["javascript"],
        labels: { copy: "Custom Copy", copied: "Custom Copied!" },
      }),
    });

    expect(result.current.labels).toEqual({
      copy: "Custom Copy",
      copied: "Custom Copied!",
    });
  });
});
