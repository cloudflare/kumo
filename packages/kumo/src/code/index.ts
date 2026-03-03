/**
 * Shiki-powered syntax highlighting for Kumo.
 *
 * This module is intentionally separate from the main `@cloudflare/kumo` export
 * to avoid bundling Shiki (~65-250KB) for consumers who don't need it.
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
 *
 * @packageDocumentation
 */

// Components
export { ShikiProvider } from "./provider";
export { CodeHighlighted } from "./code-highlighted";

// Hook
export { useShikiHighlighter } from "./use-shiki-highlighter";

// Types
export type {
  ShikiProviderProps,
  CodeHighlightedProps,
  UseShikiHighlighterResult,
  ShikiEngine,
  BundledLanguage,
} from "./types";
