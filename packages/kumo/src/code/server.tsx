/**
 * Server-side utilities for Shiki syntax highlighting.
 *
 * Use these in SSR frameworks (Next.js, Astro, Remix) or build-time scripts.
 * These functions are async and should NOT be imported in client bundles.
 *
 * Uses hardcoded themes: `github-light` for light mode, `vesper` for dark mode.
 *
 * @example
 * ```tsx
 * // Next.js RSC
 * import { highlightCode, CodeBlock } from "@cloudflare/kumo/code/server";
 *
 * export default async function Page() {
 *   const html = await highlightCode(`const x = 1;`, "tsx");
 *   return <CodeBlock html={html} />;
 * }
 * ```
 */

import type { Highlighter, BundledLanguage } from "shiki";
import type { ShikiEngine } from "./types";
import type { ReactNode } from "react";

export interface HighlightCodeOptions {
  /** Highlighting engine (default: "javascript") */
  engine?: ShikiEngine;
}

export interface CreateHighlighterOptions {
  /** Highlighting engine (default: "javascript") */
  engine?: ShikiEngine;
  /** Languages to support */
  languages: BundledLanguage[];
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
 * For multiple highlights, use `createServerHighlighter` instead.
 *
 * Uses hardcoded themes: `github-light` for light mode, `vesper` for dark mode.
 *
 * @example
 * ```tsx
 * const html = await highlightCode(code, "tsx");
 * ```
 */
export async function highlightCode(
  code: string,
  lang: BundledLanguage,
  options: HighlightCodeOptions = {},
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
    themes: ["github-light", "vesper"],
    langs: [lang],
    engine: engineInstance,
  });

  const html = highlighter.codeToHtml(code, {
    lang,
    themes: {
      light: "github-light",
      dark: "vesper",
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
 * Uses hardcoded themes: `github-light` for light mode, `vesper` for dark mode.
 *
 * @example
 * ```tsx
 * const highlighter = await createServerHighlighter({
 *   languages: ["tsx", "bash", "json"],
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
    themes: ["github-light", "vesper"],
    langs: options.languages,
    engine: engineInstance,
  });

  return {
    highlight: (code: string, lang: BundledLanguage): string => {
      return highlighter.codeToHtml(code, {
        lang,
        themes: {
          light: "github-light",
          dark: "vesper",
        },
      });
    },
    dispose: () => {
      highlighter.dispose();
    },
  };
}

/**
 * Props for the CodeBlock component.
 */
export interface CodeBlockProps {
  /** Pre-rendered HTML from highlightCode() or createServerHighlighter().highlight() */
  html: string;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Server component that wraps highlighted code HTML with proper styling.
 *
 * Use this with `highlightCode()` or `createServerHighlighter().highlight()`
 * to render syntax-highlighted code blocks with consistent Kumo styling.
 *
 * @example
 * ```tsx
 * import { highlightCode, CodeBlock } from "@cloudflare/kumo/code/server";
 *
 * export default async function Page() {
 *   const html = await highlightCode(`const x = 1;`, "tsx");
 *   return <CodeBlock html={html} />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With createServerHighlighter for multiple blocks
 * const highlighter = await createServerHighlighter({ languages: ["tsx", "bash"] });
 *
 * return (
 *   <>
 *     <CodeBlock html={highlighter.highlight(code1, "tsx")} />
 *     <CodeBlock html={highlighter.highlight(code2, "bash")} />
 *   </>
 * );
 *
 * highlighter.dispose();
 * ```
 */
export function CodeBlock({ html, className }: CodeBlockProps): ReactNode {
  const containerClass = className
    ? `group relative w-full min-w-0 rounded-md border border-kumo-fill bg-kumo-base ${className}`
    : "group relative w-full min-w-0 rounded-md border border-kumo-fill bg-kumo-base";

  return (
    <div className={containerClass}>
      <div className="overflow-x-auto">
        <div
          className="kumo-shiki [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
