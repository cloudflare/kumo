import type { BundledLanguage, BundledTheme, ThemeRegistration } from "shiki";

/**
 * Shiki engine choice for syntax highlighting.
 * - `"javascript"` — Smaller bundle (~50KB), slightly less accurate
 * - `"wasm"` — Larger bundle (~180KB), VS Code-accurate highlighting
 */
export type ShikiEngine = "javascript" | "wasm";

/**
 * Theme configuration for light and dark modes.
 */
export interface ShikiThemeConfig {
  /** Theme for light mode */
  light: BundledTheme | ThemeRegistration;
  /** Theme for dark mode */
  dark: BundledTheme | ThemeRegistration;
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
   * @example ['tsx', 'typescript', 'bash', 'json']
   */
  languages: BundledLanguage[];

  /**
   * Theme configuration for light and dark modes.
   * @example { light: 'github-light', dark: 'github-dark' }
   */
  themes: ShikiThemeConfig;

  /** React children */
  children: React.ReactNode;
}

/**
 * Options for the highlight function.
 */
export interface HighlightOptions {
  /** Override the theme for this specific highlight call */
  theme?: BundledTheme | ThemeRegistration;
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
  highlight: (
    code: string,
    lang: BundledLanguage,
    options?: HighlightOptions,
  ) => string | null;

  /** True while Shiki is loading */
  isLoading: boolean;

  /** True when highlight() is safe to call */
  isReady: boolean;

  /** Error if Shiki initialization failed */
  error: Error | null;
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
  lang: BundledLanguage;

  /**
   * Override provider theme for this instance.
   */
  theme?: BundledTheme | ThemeRegistration;

  /** Display line numbers */
  showLineNumbers?: boolean;

  /**
   * Lines to visually emphasize (1-indexed).
   * @example [1, 5, 6]
   */
  highlightLines?: number[];

  /** Show copy-to-clipboard button */
  showCopyButton?: boolean;

  /** Additional CSS classes */
  className?: string;
}

// Re-export useful Shiki types for consumers
export type { BundledLanguage, BundledTheme, ThemeRegistration } from "shiki";
