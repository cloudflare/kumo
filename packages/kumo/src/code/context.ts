import { createContext } from "react";
import type { HighlighterCore } from "shiki/core";
import type { SupportedLanguage, CodeHighlightedLabels } from "./types";

export interface ShikiContextValue {
  /** The initialized Shiki highlighter instance */
  highlighter: HighlighterCore | null;

  /** True while Shiki is loading */
  isLoading: boolean;

  /** Error if initialization failed */
  error: Error | null;

  /** Configured languages */
  languages: SupportedLanguage[];

  /** Localized labels for UI elements */
  labels: CodeHighlightedLabels;
}

export const ShikiContext = createContext<ShikiContextValue | null>(null);
