import { createContext } from "react";
import type { Highlighter } from "shiki";
import type {
  ShikiThemeConfig,
  BundledLanguage,
  CodeHighlightedLabels,
} from "./types";

export interface ShikiContextValue {
  /** The initialized Shiki highlighter instance */
  highlighter: Highlighter | null;

  /** True while Shiki is loading */
  isLoading: boolean;

  /** Error if initialization failed */
  error: Error | null;

  /** Configured themes */
  themes: ShikiThemeConfig;

  /** Configured languages */
  languages: BundledLanguage[];

  /** Localized labels for UI elements */
  labels: CodeHighlightedLabels;
}

export const ShikiContext = createContext<ShikiContextValue | null>(null);
