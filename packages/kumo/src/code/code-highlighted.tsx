"use client";

import React, { useState, useCallback, useMemo } from "react";
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
 * Uses hardcoded themes: `github-light` for light mode, `vesper` for dark mode.
 *
 * @example
 * ```tsx
 * import { ShikiProvider, CodeHighlighted } from "@cloudflare/kumo/code";
 *
 * <ShikiProvider
 *   engine="javascript"
 *   languages={['tsx', 'bash']}
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
  showLineNumbers = false,
  highlightLines,
  showCopyButton = false,
  labels: labelOverrides,
  className,
}: CodeHighlightedProps): React.JSX.Element {
  const {
    highlight,
    isLoading,
    error,
    labels: providerLabels,
  } = useShikiHighlighter();
  const [copied, setCopied] = useState(false);

  // Merge provider labels with component-level overrides
  const labels = useMemo(
    () => ({ ...providerLabels, ...labelOverrides }),
    [providerLabels, labelOverrides],
  );

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
  const html = highlight(code, lang);

  // Count lines for line numbers
  const lineCount = useMemo(() => code.split("\n").length, [code]);

  // Detect single-line code for layout adjustments
  const isSingleLine = lineCount === 1;

  // Container styles - use flex layout for single-line with copy button
  // Includes defensive resets (m-0, p-0) to prevent global CSS pollution
  const containerClasses = cn(
    "group relative m-0 w-full min-w-0 rounded-md border border-kumo-fill bg-kumo-base p-0",
    showCopyButton && isSingleLine && "flex items-center",
    className,
  );

  // Copy button - inline for single-line, absolute for multi-line
  // Hidden until hover (or when showing "Copied!" feedback)
  const copyButton = showCopyButton ? (
    <div
      className={cn(
        isSingleLine ? "shrink-0 px-2" : "absolute right-2 top-2",
        !copied && "opacity-0 transition-opacity group-hover:opacity-100",
      )}
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        aria-label={copied ? labels.copied : labels.copy}
      >
        {copied ? labels.copied : labels.copy}
      </Button>
    </div>
  ) : null;

  // Line numbers column
  const lineNumbers =
    showLineNumbers && !isSingleLine ? (
      <div
        className="kumo-line-numbers shrink-0 select-none py-4 pr-4 text-right font-mono text-sm opacity-40"
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
            <pre className="!m-0 min-w-0 flex-1 overflow-x-auto !p-4 font-mono text-sm leading-relaxed text-kumo-strong">
              <code className="!m-0 !p-0">{code}</code>
            </pre>
          </div>
        )}
        {!lineNumbers && (
          <pre className="!m-0 min-w-0 flex-1 overflow-x-auto !p-4 font-mono text-sm leading-relaxed text-kumo-strong">
            <code className="!m-0 !p-0">{code}</code>
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
        <div className="flex w-full">
          {lineNumbers}
          <div className="min-w-0 flex-1 overflow-x-auto">
            <div
              className="kumo-shiki [&>pre]:!m-0 [&>pre]:!border-0 [&>pre]:!rounded-none [&>pre]:!bg-transparent [&>pre]:!p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed [&_code]:!m-0 [&_code]:!p-0 [&_code]:!bg-transparent [&_code]:!border-0"
              dangerouslySetInnerHTML={{
                __html: processHighlightedHtml(html, highlightLines),
              }}
            />
          </div>
        </div>
      )}
      {!lineNumbers && (
        <div className="overflow-x-auto">
          <div
            className="kumo-shiki [&>pre]:!m-0 [&>pre]:!border-0 [&>pre]:!rounded-none [&>pre]:!bg-transparent [&>pre]:!p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed [&_code]:!m-0 [&_code]:!p-0 [&_code]:!bg-transparent [&_code]:!border-0"
            dangerouslySetInnerHTML={{
              __html: processHighlightedHtml(html, highlightLines),
            }}
          />
        </div>
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
