import type { ThemeRegistration } from "shiki";

/**
 * Cloudflare dark theme for Shiki.
 *
 * Designed to complement Kumo's semantic color tokens in dark mode.
 * Based on GitHub Dark with Cloudflare brand adjustments.
 */
export const cloudflareDark: ThemeRegistration = {
  name: "cloudflare-dark",
  type: "dark",
  colors: {
    "editor.background": "#0d1117",
    "editor.foreground": "#e6edf3",
    "editorLineNumber.foreground": "#7d8590",
    "editorLineNumber.activeForeground": "#e6edf3",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "#8b949e",
        fontStyle: "italic",
      },
    },
    {
      scope: ["string", "string.quoted"],
      settings: {
        foreground: "#a5d6ff",
      },
    },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: {
        foreground: "#79c0ff",
      },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: {
        foreground: "#ff7b72",
      },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: {
        foreground: "#d2a8ff",
      },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.type"],
      settings: {
        foreground: "#ffa657",
      },
    },
    {
      scope: ["variable", "entity.name.variable"],
      settings: {
        foreground: "#ffa657",
      },
    },
    {
      scope: ["entity.name.tag"],
      settings: {
        foreground: "#7ee787",
      },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: "#79c0ff",
      },
    },
    {
      scope: ["punctuation"],
      settings: {
        foreground: "#e6edf3",
      },
    },
    {
      scope: ["meta.jsx.children", "meta.tsx.children"],
      settings: {
        foreground: "#e6edf3",
      },
    },
  ],
};
