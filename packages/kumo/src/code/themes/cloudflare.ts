import type { ThemeRegistration } from "shiki";

/**
 * Cloudflare light theme for Shiki.
 *
 * Designed to complement Kumo's semantic color tokens.
 * Based on GitHub Light with Cloudflare brand adjustments.
 */
export const cloudflare: ThemeRegistration = {
  name: "cloudflare",
  type: "light",
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#1f2328",
    "editorLineNumber.foreground": "#8c959f",
    "editorLineNumber.activeForeground": "#1f2328",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "#6e7781",
        fontStyle: "italic",
      },
    },
    {
      scope: ["string", "string.quoted"],
      settings: {
        foreground: "#0a3069",
      },
    },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: {
        foreground: "#0550ae",
      },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: {
        foreground: "#cf222e",
      },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: {
        foreground: "#8250df",
      },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.type"],
      settings: {
        foreground: "#953800",
      },
    },
    {
      scope: ["variable", "entity.name.variable"],
      settings: {
        foreground: "#953800",
      },
    },
    {
      scope: ["entity.name.tag"],
      settings: {
        foreground: "#116329",
      },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: "#0550ae",
      },
    },
    {
      scope: ["punctuation"],
      settings: {
        foreground: "#1f2328",
      },
    },
    {
      scope: ["meta.jsx.children", "meta.tsx.children"],
      settings: {
        foreground: "#1f2328",
      },
    },
  ],
};
