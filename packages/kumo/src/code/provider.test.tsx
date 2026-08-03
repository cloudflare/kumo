import { describe, expect, it, vi, beforeEach } from "vite-plus/test";
import { useState } from "react";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { ShikiProvider } from "./provider";
import { CodeHighlighted } from "./code-highlighted";
import type { LanguageInput } from "./types";
import { useShikiHighlighter } from "./use-shiki-highlighter";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("shiki/core", () => ({
  createHighlighterCore: vi.fn(),
}));

vi.mock("shiki/engine/javascript", () => ({
  createJavaScriptRegexEngine: vi.fn().mockReturnValue({ type: "js-engine" }),
}));

vi.mock("shiki/engine/oniguruma", () => ({
  createOnigurumaEngine: vi.fn().mockReturnValue({ type: "wasm-engine" }),
}));

vi.mock("@shikijs/themes/github-light", () => ({
  default: { name: "github-light" },
}));

vi.mock("@shikijs/themes/vesper", () => ({
  default: { name: "vesper" },
}));

const mockLang = { default: { id: "mock" } };

vi.mock("@shikijs/langs/javascript", () => mockLang);
vi.mock("@shikijs/langs/typescript", () => mockLang);
vi.mock("@shikijs/langs/jsx", () => mockLang);
vi.mock("@shikijs/langs/tsx", () => mockLang);
vi.mock("@shikijs/langs/json", () => mockLang);
vi.mock("@shikijs/langs/jsonc", () => mockLang);
vi.mock("@shikijs/langs/html", () => mockLang);
vi.mock("@shikijs/langs/css", () => mockLang);
vi.mock("@shikijs/langs/python", () => mockLang);
vi.mock("@shikijs/langs/yaml", () => mockLang);
vi.mock("@shikijs/langs/markdown", () => mockLang);
vi.mock("@shikijs/langs/graphql", () => mockLang);
vi.mock("@shikijs/langs/sql", () => mockLang);
vi.mock("@shikijs/langs/bash", () => mockLang);
vi.mock("@shikijs/langs/shellscript", () => mockLang);
vi.mock("@shikijs/langs/diff", () => mockLang);
vi.mock("@shikijs/langs/hcl", () => mockLang);
vi.mock("@shikijs/langs/toml", () => mockLang);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ShikiProvider", () => {
  let mockHighlighter: {
    codeToHtml: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockHighlighter = {
      codeToHtml: vi.fn(),
      dispose: vi.fn(),
    };
    vi.mocked(createHighlighterCore).mockClear();
    vi.mocked(createHighlighterCore).mockResolvedValue(mockHighlighter as any);
    vi.mocked(createJavaScriptRegexEngine).mockClear();
    vi.mocked(createOnigurumaEngine).mockClear();
  });

  it("initializes with a single language", async () => {
    render(
      <ShikiProvider engine="javascript" languages={["javascript"]}>
        <div data-testid="child">child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    const call = vi.mocked(createHighlighterCore).mock.calls[0];
    const options = call[0] as { langs: unknown[] };
    expect(options.langs).toHaveLength(1);
  });

  it("deduplicates canonical languages", async () => {
    render(
      <ShikiProvider
        engine="javascript"
        languages={["javascript", "typescript", "javascript", "typescript"]}
      >
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    const call = vi.mocked(createHighlighterCore).mock.calls[0];
    const options = call[0] as { langs: unknown[] };
    expect(options.langs).toHaveLength(2);
  });

  it("deduplicates aliases that resolve to the same canonical language", async () => {
    render(
      <ShikiProvider
        engine="javascript"
        languages={["js", "javascript", "cjs", "mjs"]}
      >
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    const call = vi.mocked(createHighlighterCore).mock.calls[0];
    const options = call[0] as { langs: unknown[] };
    // All JS variants should collapse to a single "javascript" grammar
    expect(options.langs).toHaveLength(1);
  });

  it("deduplicates mixed aliases and canonical names", async () => {
    render(
      <ShikiProvider
        engine="javascript"
        languages={["js", "ts", "javascript", "typescript", "sh", "bash"]}
      >
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    const call = vi.mocked(createHighlighterCore).mock.calls[0];
    const options = call[0] as { langs: unknown[] };
    // Should collapse to: javascript, typescript, bash = 3 unique
    expect(options.langs).toHaveLength(3);
  });

  it("filters out unknown languages silently", async () => {
    render(
      <ShikiProvider
        engine="javascript"
        languages={
          ["javascript", "rust", "typescript", "go"] as LanguageInput[]
        }
      >
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    const call = vi.mocked(createHighlighterCore).mock.calls[0];
    const options = call[0] as { langs: unknown[] };
    // Only javascript and typescript should remain
    expect(options.langs).toHaveLength(2);
  });

  it("handles empty languages array gracefully", async () => {
    render(
      <ShikiProvider engine="javascript" languages={[]}>
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    const call = vi.mocked(createHighlighterCore).mock.calls[0];
    const options = call[0] as { langs: unknown[] };
    expect(options.langs).toHaveLength(0);
  });

  it("loads all requested unique languages", async () => {
    render(
      <ShikiProvider
        engine="javascript"
        languages={[
          "javascript",
          "typescript",
          "tsx",
          "jsx",
          "json",
          "html",
          "css",
        ]}
      >
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    const call = vi.mocked(createHighlighterCore).mock.calls[0];
    const options = call[0] as { langs: unknown[] };
    expect(options.langs).toHaveLength(7);
  });

  it("uses javascript engine when engine='javascript'", async () => {
    render(
      <ShikiProvider engine="javascript" languages={["javascript"]}>
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    expect(createJavaScriptRegexEngine).toHaveBeenCalledTimes(1);
  });

  it("uses wasm engine when engine='wasm'", async () => {
    render(
      <ShikiProvider engine="wasm" languages={["javascript"]}>
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    expect(createOnigurumaEngine).toHaveBeenCalledTimes(1);
  });

  it("does not reinitialize for an equivalent inline languages array", async () => {
    const { rerender } = render(
      <ShikiProvider engine="javascript" languages={["ts", "js"]}>
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    // New array identity, different order and aliasing — same canonical set
    rerender(
      <ShikiProvider
        engine="javascript"
        languages={["javascript", "typescript"]}
      >
        <div>child</div>
      </ShikiProvider>,
    );

    // An effect re-run would dispose synchronously during cleanup, so this
    // catches it without racing the async init path
    expect(mockHighlighter.dispose).not.toHaveBeenCalled();

    // Flush the async init path before asserting nothing new started
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(createHighlighterCore).toHaveBeenCalledTimes(1);
  });

  it("reinitializes and disposes the old highlighter when languages change", async () => {
    const { rerender } = render(
      <ShikiProvider engine="javascript" languages={["javascript"]}>
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    rerender(
      <ShikiProvider engine="javascript" languages={["javascript", "python"]}>
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(2);
    });
    expect(mockHighlighter.dispose).toHaveBeenCalledTimes(1);
  });

  it("disposes the highlighter on unmount", async () => {
    const { unmount } = render(
      <ShikiProvider engine="javascript" languages={["javascript"]}>
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    unmount();
    await waitFor(() => {
      expect(mockHighlighter.dispose).toHaveBeenCalledTimes(1);
    });
  });

  it("disposes a highlighter that resolves after unmount", async () => {
    let resolveCreate: (value: unknown) => void = () => {};
    vi.mocked(createHighlighterCore).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }) as any,
    );

    const { unmount } = render(
      <ShikiProvider engine="javascript" languages={["javascript"]}>
        <div>child</div>
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    });

    unmount();
    resolveCreate(mockHighlighter);

    await waitFor(() => {
      expect(mockHighlighter.dispose).toHaveBeenCalledTimes(1);
    });
  });

  it("clears a stale error when reinitializing after a failed init", async () => {
    vi.mocked(createHighlighterCore).mockRejectedValueOnce(new Error("boom"));

    function StateProbe() {
      const { isLoading, error, isReady } = useShikiHighlighter();
      const status = error ? "error" : isLoading ? "loading" : "ready";
      return <div data-testid="probe">{isReady ? "ready" : status}</div>;
    }

    const { rerender } = render(
      <ShikiProvider engine="javascript" languages={["javascript"]}>
        <StateProbe />
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("probe").textContent).toBe("error");
    });

    // A language change retries — the stale error must clear immediately
    rerender(
      <ShikiProvider engine="javascript" languages={["javascript", "python"]}>
        <StateProbe />
      </ShikiProvider>,
    );
    expect(screen.getByTestId("probe").textContent).toBe("loading");

    await waitFor(() => {
      expect(screen.getByTestId("probe").textContent).toBe("ready");
    });
  });

  it("does not re-highlight when an unrelated parent state changes", async () => {
    mockHighlighter.codeToHtml.mockReturnValue(
      '<pre><code><span class="line">const x = 1;</span></code></pre>',
    );

    function Wrapper() {
      const [count, setCount] = useState(0);
      return (
        <div>
          <button onClick={() => setCount((c) => c + 1)}>bump {count}</button>
          <CodeHighlighted code="const x = 1;" lang="javascript" />
        </div>
      );
    }

    render(
      <ShikiProvider engine="javascript" languages={["javascript"]}>
        <Wrapper />
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(mockHighlighter.codeToHtml).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: /bump/ }));
    expect(mockHighlighter.codeToHtml).toHaveBeenCalledTimes(1);
  });

  it("exposes normalized languages in context so hook alias resolution works end-to-end", async () => {
    // This is the integration test for the bug where the context stores raw
    // aliases (e.g., ["js", "ts"]) but the hook normalizes to canonical names
    // (e.g., "javascript") and checks languages.includes("javascript") → false.

    function HighlightConsumer() {
      const { highlight, isReady } = useShikiHighlighter();
      if (!isReady) return <div data-testid="status">loading</div>;
      const result = highlight("const x = 1;", "js");
      return (
        <div data-testid="status">{result === null ? "failed" : "ok"}</div>
      );
    }

    render(
      <ShikiProvider engine="javascript" languages={["js", "ts"]}>
        <HighlightConsumer />
      </ShikiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("ok");
    });
  });
});
