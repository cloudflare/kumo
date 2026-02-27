"use client";

import { useState, useCallback, useMemo, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { Button } from "../components/button";
import { useShikiHighlighter } from "./use-shiki-highlighter";
import type { CodeHighlightedProps } from "./types";

/**
 * Syntax-highlighted code block powered by Shiki.
 *
 * Must be used within a ShikiProvider. While Shiki is loading,
 * displays code as plain text (no layout shift, immediately readable).
 *
 * @example
 * ```tsx
 * import { ShikiProvider, CodeHighlighted } from "@cloudflare/kumo/code";
 *
 * <ShikiProvider
 *   engine="javascript"
 *   languages={['tsx', 'bash']}
 *   themes={{ light: 'github-light', dark: 'github-dark' }}
 * >
 *   <CodeHighlighted
 *     code={`const greeting = "Hello!";`}
 *     lang="tsx"
 *     showLineNumbers
 *     showCopyButton
 *   />
 * </ShikiProvider>
 * ```
 */
export function CodeHighlighted({
  code,
  lang,
  theme,
  showLineNumbers = false,
  highlightLines,
  showCopyButton = false,
  className,
}: CodeHighlightedProps): ReactNode {
  const { highlight, isLoading, error } = useShikiHighlighter();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[Kumo CodeHighlighted] Failed to copy to clipboard:", err);
    }
  }, [code]);

  // Get highlighted HTML (or null if not ready/failed)
  const html = highlight(code, lang, theme ? { theme } : undefined);

  // Count lines for line numbers
  const lineCount = useMemo(() => code.split("\n").length, [code]);

  // Detect single-line code for layout adjustments
  const isSingleLine = lineCount === 1;

  // Container styles - use flex layout for single-line with copy button
  const containerClasses = cn(
    "relative min-w-0 rounded-md border border-kumo-fill bg-kumo-base",
    showCopyButton && isSingleLine && "flex items-center",
    className,
  );

  // Copy button - inline for single-line, absolute for multi-line
  const copyButton = showCopyButton ? (
    <div
      className={cn(
        isSingleLine
          ? "shrink-0 border-l border-kumo-fill px-2"
          : "absolute right-2 top-2",
      )}
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        aria-label={copied ? "Copied!" : "Copy code"}
      >
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  ) : null;

  // Line numbers column
  const lineNumbers =
    showLineNumbers && !isSingleLine ? (
      <div
        className="kumo-line-numbers shrink-0 select-none border-r border-kumo-fill py-4 pr-3 text-right font-mono text-sm text-kumo-subtle"
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="leading-relaxed">
            {i + 1}
          </div>
        ))}
      </div>
    ) : null;

  // Error state — still show code, just log the error
  if (error) {
    console.error("[Kumo CodeHighlighted] Shiki initialization error:", error);
  }

  // Loading or failed to highlight — show plain text
  if (isLoading || html === null) {
    return (
      <div className={containerClasses}>
        {lineNumbers && (
          <div className="flex">
            {lineNumbers}
            <pre className="min-w-0 flex-1 overflow-x-auto p-4 font-mono text-sm leading-relaxed text-kumo-strong">
              <code>{code}</code>
            </pre>
          </div>
        )}
        {!lineNumbers && (
          <pre className="min-w-0 flex-1 overflow-x-auto p-4 font-mono text-sm leading-relaxed text-kumo-strong">
            <code>{code}</code>
          </pre>
        )}
        {copyButton}
      </div>
    );
  }

  // Highlighted code
  return (
    <div className={containerClasses}>
      {lineNumbers && (
        <div className="flex">
          {lineNumbers}
          <div
            className="kumo-shiki min-w-0 flex-1 overflow-x-auto [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed [&>pre]:!bg-transparent"
            dangerouslySetInnerHTML={{
              __html: processHighlightedHtml(html, highlightLines),
            }}
          />
        </div>
      )}
      {!lineNumbers && (
        <div
          className="kumo-shiki min-w-0 flex-1 overflow-x-auto [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed [&>pre]:!bg-transparent"
          dangerouslySetInnerHTML={{
            __html: processHighlightedHtml(html, highlightLines),
          }}
        />
      )}
      {copyButton}
    </div>
  );
}

CodeHighlighted.displayName = "CodeHighlighted";

/**
 * Process Shiki's HTML output to add line highlighting classes.
 * Does NOT modify Shiki's token structure - only adds classes to line spans.
 */
function processHighlightedHtml(
  html: string,
  highlightLines?: number[],
): string {
  // Line numbers are not yet supported - would require more complex approach
  // For now, only handle line highlighting which just adds a class

  if (!highlightLines?.length) {
    return html;
  }

  const highlightSet = new Set(highlightLines);
  let lineNumber = 0;

  // Only add the highlight class to lines, don't restructure the HTML
  return html.replace(/<span class="line">/g, () => {
    lineNumber++;
    const isHighlighted = highlightSet.has(lineNumber);
    return isHighlighted
      ? '<span class="line line-highlighted">'
      : '<span class="line">';
  });
}
