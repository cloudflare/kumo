"use client";

import { useContext, useCallback } from "react";
import { ShikiContext } from "./context";
import type {
  UseShikiHighlighterResult,
  BundledLanguage,
  HighlightOptions,
} from "./types";

/**
 * Hook for accessing Shiki highlighting in custom implementations.
 *
 * Must be used within a ShikiProvider.
 *
 * @example
 * ```tsx
 * import { useShikiHighlighter } from "@cloudflare/kumo/code";
 *
 * function CustomCodeBlock({ code, lang }) {
 *   const { highlight, isLoading, isReady, error } = useShikiHighlighter();
 *
 *   if (error) {
 *     return <div>Failed to load highlighter</div>;
 *   }
 *
 *   if (isLoading) {
 *     return <pre><code>{code}</code></pre>;
 *   }
 *
 *   const html = highlight(code, lang);
 *
 *   // null means highlighting failed — render plain text
 *   if (html === null) {
 *     return <pre><code>{code}</code></pre>;
 *   }
 *
 *   return <pre dangerouslySetInnerHTML={{ __html: html }} />;
 * }
 * ```
 */
export function useShikiHighlighter(): UseShikiHighlighterResult {
  const context = useContext(ShikiContext);

  if (!context) {
    throw new Error(
      "useShikiHighlighter must be used within a ShikiProvider. " +
        "Wrap your app with <ShikiProvider> from '@cloudflare/kumo/code'.",
    );
  }

  const { highlighter, isLoading, error, themes, languages, labels } = context;

  const highlight = useCallback(
    (
      code: string,
      lang: BundledLanguage,
      options?: HighlightOptions,
    ): string | null => {
      if (!highlighter) {
        return null;
      }

      // Check if the language is supported
      if (!languages.includes(lang)) {
        console.warn(
          `[Kumo CodeHighlighted] Language "${lang}" is not in the ShikiProvider's languages list. ` +
            `Add it to the languages array: languages={[...existing, '${lang}']}. ` +
            `Rendering as plain text.`,
        );
        return null;
      }

      try {
        // Use dual theme for light/dark mode support
        const html = highlighter.codeToHtml(code, {
          lang,
          themes: {
            light: options?.theme ?? themes.light,
            dark: options?.theme ?? themes.dark,
          },
        });

        return html;
      } catch (err) {
        console.warn(
          `[Kumo CodeHighlighted] Failed to highlight code with language "${lang}":`,
          err,
        );
        return null;
      }
    },
    [highlighter, themes, languages],
  );

  return {
    highlight,
    isLoading,
    isReady: !isLoading && highlighter !== null,
    error,
    labels,
  };
}
