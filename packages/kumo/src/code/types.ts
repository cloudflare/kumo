/**
 * Supported languages for syntax highlighting.
 *
 * Kumo bundles a curated subset of Shiki languages to keep bundle size small.
 * These cover the most common use cases for documentation and code snippets.
 *
 * If you need additional languages, use Shiki directly with fine-grained imports.
 */
export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "json"
  | "jsonc"
  | "html"
  | "css"
  | "python"
  | "yaml"
  | "markdown"
  | "graphql"
  | "sql"
  | "bash"
  | "shell"
  | "diff";

/**
 * Shiki engine choice for syntax highlighting.
 * - `"javascript"` — Smaller bundle (~50KB), slightly less accurate
 * - `"wasm"` — Larger bundle (~180KB), VS Code-accurate highlighting
 */
export type ShikiEngine = "javascript" | "wasm";

/**
 * Localized labels for the copy button.
 */
export interface CodeHighlightedLabels {
  /** Label for copy button (default: "Copy") */
  copy?: string;
  /** Label shown after copying (default: "Copied!") */
  copied?: string;
}

/**
 * Props for ShikiProvider component.
 */
export interface ShikiProviderProps {
  /**
   * Highlighting engine choice.
   * - `"javascript"` — Smaller, faster to load (~50KB gzipped)
   * - `"wasm"` — Larger but more accurate (~180KB gzipped)
   */
  engine: ShikiEngine;

  /**
   * Languages to support. Only these languages will be loaded.
   * Must be from the supported language set.
   * @example ['tsx', 'typescript', 'bash', 'json']
   */
  languages: SupportedLanguage[];

  /**
   * Localized labels for UI elements (copy button, etc.).
   * Can be overridden at the component level.
   * @example { copy: "Copier", copied: "Copié!" }
   */
  labels?: CodeHighlightedLabels;

  /** React children */
  children: React.ReactNode;
}

/**
 * Return value from useShikiHighlighter hook.
 */
export interface UseShikiHighlighterResult {
  /**
   * Highlight code and return HTML string.
   * Returns `null` if highlighter is not ready or highlighting fails.
   * When `null` is returned, render the code as plain text.
   */
  highlight: (code: string, lang: SupportedLanguage) => string | null;

  /** True while Shiki is loading */
  isLoading: boolean;

  /** True when highlight() is safe to call */
  isReady: boolean;

  /** Error if Shiki initialization failed */
  error: Error | null;

  /** Localized labels from provider */
  labels: CodeHighlightedLabels;
}

/**
 * Props for CodeHighlighted component.
 */
export interface CodeHighlightedProps {
  /** Source code to display */
  code: string;

  /**
   * Language identifier for syntax highlighting.
   * Must be included in the ShikiProvider's `languages` array.
   */
  lang: SupportedLanguage;

  /** Display line numbers */
  showLineNumbers?: boolean;

  /**
   * Lines to visually emphasize (1-indexed).
   * @example [1, 5, 6]
   */
  highlightLines?: number[];

  /** Show copy-to-clipboard button */
  showCopyButton?: boolean;

  /**
   * Override provider labels for this instance.
   * @example { copy: "Copy code", copied: "Done!" }
   */
  labels?: CodeHighlightedLabels;

  /** Additional CSS classes */
  className?: string;
}

// Re-export for backwards compatibility (deprecated, use SupportedLanguage instead)
/** @deprecated Use SupportedLanguage instead */
export type BundledLanguage = SupportedLanguage;
