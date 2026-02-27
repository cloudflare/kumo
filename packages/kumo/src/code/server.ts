/**
 * Server-side utilities for Shiki syntax highlighting.
 *
 * Use these in SSR frameworks (Next.js, Astro, Remix) or build-time scripts.
 * These functions are async and should NOT be imported in client bundles.
 *
 * @example
 * ```tsx
 * // Next.js RSC
 * import { highlightCode } from "@cloudflare/kumo/code/server";
 *
 * export default async function Page() {
 *   const html = await highlightCode(`const x = 1;`, "tsx", {
 *     themes: { light: "github-light", dark: "github-dark" },
 *   });
 *
 *   return <pre dangerouslySetInnerHTML={{ __html: html }} />;
 * }
 * ```
 */

import type {
  Highlighter,
  BundledLanguage,
  BundledTheme,
  ThemeRegistration,
} from "shiki";
import type { ShikiEngine } from "./types";

export interface HighlightCodeOptions {
  /** Highlighting engine (default: "javascript") */
  engine?: ShikiEngine;
  /** Themes for light and dark modes */
  themes: {
    light: BundledTheme | ThemeRegistration;
    dark: BundledTheme | ThemeRegistration;
  };
}

export interface CreateHighlighterOptions {
  /** Highlighting engine (default: "javascript") */
  engine?: ShikiEngine;
  /** Languages to support */
  languages: BundledLanguage[];
  /** Themes to load */
  themes: (BundledTheme | ThemeRegistration)[];
}

export interface ServerHighlighter {
  /** Highlight code and return HTML string */
  highlight: (code: string, lang: BundledLanguage) => string;
  /** Dispose the highlighter when done */
  dispose: () => void;
}

/**
 * One-off highlighting for a single code snippet.
 *
 * Creates a highlighter, highlights the code, and disposes.
 * For multiple highlights, use `createHighlighter` instead.
 *
 * @example
 * ```tsx
 * const html = await highlightCode(code, "tsx", {
 *   themes: { light: "cloudflare", dark: "cloudflare-dark" },
 * });
 * ```
 */
export async function highlightCode(
  code: string,
  lang: BundledLanguage,
  options: HighlightCodeOptions,
): Promise<string> {
  const { createHighlighter } = await import("shiki");

  const engine = options.engine ?? "javascript";
  const engineInstance =
    engine === "wasm"
      ? await import("shiki/engine/oniguruma").then((m) =>
          m.createOnigurumaEngine(import("shiki/wasm")),
        )
      : await import("shiki/engine/javascript").then((m) =>
          m.createJavaScriptRegexEngine(),
        );

  const highlighter = await createHighlighter({
    themes: [options.themes.light, options.themes.dark],
    langs: [lang],
    engine: engineInstance,
  });

  const html = highlighter.codeToHtml(code, {
    lang,
    themes: {
      light: options.themes.light,
      dark: options.themes.dark,
    },
  });

  highlighter.dispose();

  return html;
}

/**
 * Create a reusable highlighter for multiple code snippets.
 *
 * More efficient than `highlightCode` when highlighting multiple snippets.
 * Remember to call `dispose()` when done.
 *
 * @example
 * ```tsx
 * const highlighter = await createServerHighlighter({
 *   languages: ["tsx", "bash", "json"],
 *   themes: ["cloudflare", "cloudflare-dark"],
 * });
 *
 * const html1 = highlighter.highlight(code1, "tsx");
 * const html2 = highlighter.highlight(code2, "bash");
 *
 * highlighter.dispose();
 * ```
 */
export async function createServerHighlighter(
  options: CreateHighlighterOptions,
): Promise<ServerHighlighter> {
  const { createHighlighter } = await import("shiki");

  const engine = options.engine ?? "javascript";
  const engineInstance =
    engine === "wasm"
      ? await import("shiki/engine/oniguruma").then((m) =>
          m.createOnigurumaEngine(import("shiki/wasm")),
        )
      : await import("shiki/engine/javascript").then((m) =>
          m.createJavaScriptRegexEngine(),
        );

  const highlighter: Highlighter = await createHighlighter({
    themes: options.themes,
    langs: options.languages,
    engine: engineInstance,
  });

  // Get the first two themes for light/dark
  const [lightTheme, darkTheme] = options.themes;

  return {
    highlight: (code: string, lang: BundledLanguage): string => {
      return highlighter.codeToHtml(code, {
        lang,
        themes: {
          light: lightTheme,
          dark: darkTheme,
        },
      });
    },
    dispose: () => {
      highlighter.dispose();
    },
  };
}
