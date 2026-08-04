"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ShikiContext, type ShikiContextValue } from "./context";
import { LANGUAGE_ALIASES } from "./types";
import type {
  ShikiProviderProps,
  SupportedLanguage,
  LanguageAlias,
} from "./types";

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
  hcl: () => import("@shikijs/langs/hcl"),
  toml: () => import("@shikijs/langs/toml"),
};

/**
 * Normalize a language identifier to its canonical SupportedLanguage name.
 * Returns the canonical name if the input is a known alias or already canonical,
 * otherwise returns null.
 */
export function normalizeLanguage(lang: string): SupportedLanguage | null {
  if (lang in BUNDLED_LANGS) return lang as SupportedLanguage;
  if (lang in LANGUAGE_ALIASES) return LANGUAGE_ALIASES[lang as LanguageAlias];
  return null;
}

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
}: ShikiProviderProps): React.JSX.Element {
  const [state, setState] = useState<{
    highlighter: ShikiContextValue["highlighter"];
    isLoading: boolean;
    error: Error | null;
    languages: SupportedLanguage[];
  }>({
    highlighter: null,
    isLoading: true,
    error: null,
    languages: [],
  });

  // Equivalent inline `languages` arrays must not re-create the highlighter
  const languageKey = [
    ...new Set(
      languages
        .map((lang) => normalizeLanguage(lang))
        .filter((lang): lang is SupportedLanguage => lang !== null),
    ),
  ]
    .sort()
    .join(",");

  useEffect(() => {
    let cancelled = false;
    let ownedHighlighter: ShikiContextValue["highlighter"] = null;

    const validLanguages = languageKey
      ? (languageKey.split(",") as SupportedLanguage[])
      : [];

    // Children must fall back to plain text, not use the disposed instance —
    // and a retry after a failed init must not keep showing the stale error
    setState((prev) =>
      prev.highlighter || prev.error
        ? { highlighter: null, isLoading: true, error: null, languages: [] }
        : prev,
    );

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

        const langModules = await Promise.all(
          validLanguages.map((lang) => BUNDLED_LANGS[lang]()),
        );

        const highlighter = await createHighlighterCore({
          themes: [githubLight.default, vesper.default],

          langs: langModules.map((m) => m.default) as any,
          engine: engineInstance,
        });

        if (cancelled) {
          highlighter.dispose();
          return;
        }

        ownedHighlighter = highlighter;
        setState({
          highlighter,
          isLoading: false,
          error: null,
          languages: validLanguages,
        });
      } catch (err) {
        if (!cancelled) {
          setState({
            highlighter: null,
            isLoading: false,
            error:
              err instanceof Error ? err : new Error("Failed to load Shiki"),
            languages: [],
          });
        }
      }
    }

    void initializeShiki();

    return () => {
      cancelled = true;
      ownedHighlighter?.dispose();
    };
  }, [engine, languageKey]);

  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );

  const contextValue = useMemo<ShikiContextValue>(
    () => ({
      highlighter: state.highlighter,
      isLoading: state.isLoading,
      error: state.error,
      languages: state.languages,
      labels: mergedLabels,
    }),
    [
      state.highlighter,
      state.isLoading,
      state.error,
      state.languages,
      mergedLabels,
    ],
  );

  return (
    <ShikiContext.Provider value={contextValue}>
      {children}
    </ShikiContext.Provider>
  );
}

ShikiProvider.displayName = "ShikiProvider";
