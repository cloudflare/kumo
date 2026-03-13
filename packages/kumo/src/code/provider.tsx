"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { ShikiContext, type ShikiContextValue } from "./context";
import type { ShikiProviderProps, SupportedLanguage } from "./types";

/**
 * Pre-bundled languages - only these languages are included in the Kumo bundle.
 * Using fine-grained imports from @shikijs/langs to minimize bundle size.
 */
const BUNDLED_LANGS: Record<
  SupportedLanguage,
  () => Promise<{ default: unknown }>
> = {
  javascript: () => import("@shikijs/langs/javascript"),
  typescript: () => import("@shikijs/langs/typescript"),
  jsx: () => import("@shikijs/langs/jsx"),
  tsx: () => import("@shikijs/langs/tsx"),
  json: () => import("@shikijs/langs/json"),
  jsonc: () => import("@shikijs/langs/jsonc"),
  html: () => import("@shikijs/langs/html"),
  css: () => import("@shikijs/langs/css"),
  python: () => import("@shikijs/langs/python"),
  yaml: () => import("@shikijs/langs/yaml"),
  markdown: () => import("@shikijs/langs/markdown"),
  graphql: () => import("@shikijs/langs/graphql"),
  sql: () => import("@shikijs/langs/sql"),
  bash: () => import("@shikijs/langs/bash"),
  shell: () => import("@shikijs/langs/shellscript"),
  diff: () => import("@shikijs/langs/diff"),
};

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
        // Dynamic import of shiki/core — only loads the core, not all languages
        const { createHighlighterCore } = await import("shiki/core");

        // Load the appropriate engine
        const engineInstance =
          engine === "wasm"
            ? await import("shiki/engine/oniguruma").then((m) =>
                m.createOnigurumaEngine(import("shiki/wasm")),
              )
            : await import("shiki/engine/javascript").then((m) =>
                m.createJavaScriptRegexEngine(),
              );

        // Load themes
        const [githubLight, vesper] = await Promise.all([
          import("@shikijs/themes/github-light"),
          import("@shikijs/themes/vesper"),
        ]);

        // Load only the requested languages from our bundled set
        const validLanguages = languages.filter(
          (lang): lang is SupportedLanguage => lang in BUNDLED_LANGS,
        );

        const langModules = await Promise.all(
          validLanguages.map((lang) => BUNDLED_LANGS[lang]()),
        );

        const highlighter = await createHighlighterCore({
          themes: [githubLight.default, vesper.default],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          langs: langModules.map((m) => m.default) as any,
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
      languages: languages as SupportedLanguage[],
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
