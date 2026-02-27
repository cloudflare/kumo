"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { ShikiContext, type ShikiContextValue } from "./context";
import type { ShikiProviderProps, BundledLanguage } from "./types";

/**
 * Provider component that initializes and manages Shiki highlighting.
 *
 * Shiki is lazy-loaded on first render — no JavaScript is downloaded
 * until this provider mounts. While loading, child components can
 * render code as plain text.
 *
 * Uses hardcoded themes: `github-light` for light mode, `vesper` for dark mode.
 *
 * @example
 * ```tsx
 * import { ShikiProvider, CodeHighlighted } from "@cloudflare/kumo/code";
 *
 * function App() {
 *   return (
 *     <ShikiProvider
 *       engine="javascript"
 *       languages={['tsx', 'bash', 'json']}
 *     >
 *       <CodeHighlighted code="const x = 1;" lang="tsx" />
 *     </ShikiProvider>
 *   );
 * }
 * ```
 */
const DEFAULT_LABELS = {
  copy: "Copy",
  copied: "Copied!",
};

export function ShikiProvider({
  engine,
  languages,
  labels,
  children,
}: ShikiProviderProps): ReactNode {
  const [state, setState] = useState<{
    highlighter: ShikiContextValue["highlighter"];
    isLoading: boolean;
    error: Error | null;
  }>({
    highlighter: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function initializeShiki() {
      try {
        // Dynamic import — Shiki is only loaded when this effect runs
        const { createHighlighter } = await import("shiki");

        // Load the appropriate engine
        const engineInstance =
          engine === "wasm"
            ? await import("shiki/engine/oniguruma").then((m) =>
                m.createOnigurumaEngine(import("shiki/wasm")),
              )
            : await import("shiki/engine/javascript").then((m) =>
                m.createJavaScriptRegexEngine(),
              );

        const highlighter = await createHighlighter({
          themes: ["github-light", "vesper"],
          langs: languages,
          engine: engineInstance,
        });

        if (!cancelled) {
          setState({
            highlighter,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            highlighter: null,
            isLoading: false,
            error:
              err instanceof Error ? err : new Error("Failed to load Shiki"),
          });
        }
      }
    }

    void initializeShiki();

    return () => {
      cancelled = true;
    };
  }, [engine, languages]);

  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );

  const contextValue = useMemo<ShikiContextValue>(
    () => ({
      highlighter: state.highlighter,
      isLoading: state.isLoading,
      error: state.error,
      languages: languages as BundledLanguage[],
      labels: mergedLabels,
    }),
    [state.highlighter, state.isLoading, state.error, languages, mergedLabels],
  );

  return (
    <ShikiContext.Provider value={contextValue}>
      {children}
    </ShikiContext.Provider>
  );
}

ShikiProvider.displayName = "ShikiProvider";
