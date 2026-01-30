/**
 * Kumo Theme Configuration
 *
 * Single source of truth for all semantic color tokens and typography.
 * This config is used to generate:
 * - theme-kumo.css (base theme)
 * - theme-fedramp.css (fedramp overrides)
 * - Any future theme files
 *
 * Token naming:
 * - Key = current token name used in codebase
 * - newName = future name (empty string = no migration planned)
 */

import type { ThemeConfig } from "./types.js";

export const THEME_CONFIG: ThemeConfig = {
  /**
   * Text color tokens
   * Used with: text-{token}
   * CSS variable: --text-color-{token}
   */
  text: {
    "kumo-default": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-900, oklch(21% 0.006 285.885))",
          dark: "var(--color-neutral-100, oklch(97% 0 0))",
        },
      },
    },
    "kumo-inverse": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-100, oklch(97% 0 0))",
          dark: "var(--color-neutral-900, oklch(20.5% 0 0))",
        },
      },
    },
    "kumo-strong": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-600, oklch(43.9% 0 0))",
          dark: "var(--color-neutral-400, oklch(70.8% 0 0))",
        },
      },
    },
    "kumo-subtle": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-500, oklch(55.6% 0 0))",
          dark: "var(--color-neutral-50, oklch(98.5% 0 0))",
        },
      },
    },
    "kumo-inactive": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-400, oklch(70.8% 0 0))",
          dark: "var(--color-neutral-400, oklch(70.8% 0 0))",
        },
      },
    },
    "kumo-brand": {
      newName: "",
      theme: {
        kumo: {
          light: "#f6821f",
          dark: "#f6821f",
        },
      },
    },
    "kumo-link": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-blue-800, oklch(42.4% 0.199 265.638))",
          dark: "var(--color-blue-400, oklch(70.7% 0.165 254.624))",
        },
      },
    },
    "kumo-success": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-green-500, oklch(72.3% 0.219 149.579))",
          dark: "var(--color-green-500, oklch(72.3% 0.219 149.579))",
        },
      },
    },
    "kumo-danger": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-red-500, oklch(63.7% 0.237 25.331))",
          dark: "var(--color-red-400, oklch(70.4% 0.191 22.216))",
        },
      },
    },
    "kumo-warning": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-yellow-800, oklch(47.6% 0.114 61.907))",
          dark: "var(--color-yellow-400, oklch(85.2% 0.199 91.936))",
        },
      },
    },
  },

  /**
   * Color tokens
   * Used with: bg-{token}, border-{token}, ring-{token}, etc.
   * CSS variable: --color-{token}
   */
  color: {
    "kumo-base": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-white, #fff)",
          dark: "var(--color-black, #000)",
        },
        fedramp: {
          light: "#5b697c",
          dark: "#5b697c",
        },
      },
    },
    "kumo-elevated": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-25, oklch(0.99 0 0))",
          dark: "var(--color-neutral-950, oklch(14.5% 0 0))",
        },
      },
    },
    "kumo-recessed": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-250, oklch(0.9 0 0))",
          dark: "var(--color-neutral-750, oklch(0.31 0 0))",
        },
      },
    },
    "kumo-overlay": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-50, oklch(98.5% 0 0))",
          dark: "var(--color-neutral-800, oklch(26.9% 0 0))",
        },
      },
    },
    "kumo-contrast": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-900, oklch(20.5% 0 0))",
          dark: "var(--color-neutral-100, oklch(97% 0 0))",
        },
      },
    },
    "kumo-control": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-white, #fff)",
          dark: "var(--color-neutral-900, oklch(21% 0.006 285.885))",
        },
      },
    },
    "kumo-tint": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-150, oklch(0.96 0 0))",
          dark: "var(--color-neutral-850, oklch(0.23 0 0))",
        },
      },
    },
    "kumo-interact": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-300, oklch(87% 0 0))",
          dark: "var(--color-neutral-700, oklch(37.1% 0 0))",
        },
      },
    },
    "kumo-fill": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-200, oklch(92.2% 0 0))",
          dark: "var(--color-neutral-800, oklch(26.9% 0 0))",
        },
      },
    },
    "kumo-fill-hover": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-200, oklch(92.2% 0 0))",
          dark: "var(--color-neutral-700, oklch(37.1% 0 0))",
        },
      },
    },
    "kumo-brand": {
      newName: "",
      theme: {
        kumo: {
          light: "oklch(0.5772 0.2324 260)",
          dark: "oklch(0.5772 0.2324 260)",
        },
      },
    },
    "kumo-brand-hover": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-blue-700, oklch(48.8% 0.243 264.376))",
          dark: "var(--color-blue-700, oklch(48.8% 0.243 264.376))",
        },
      },
    },
    "kumo-line": {
      newName: "",
      theme: {
        kumo: {
          light: "oklch(14.5% 0 0 / 0.1)",
          dark: "var(--color-neutral-800, oklch(26.9% 0 0))",
        },
      },
    },
    "kumo-ring": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-400, oklch(70.8% 0 0))",
          dark: "var(--color-neutral-600, oklch(43.9% 0 0))",
        },
        fedramp: {
          light: "#c8d4e5",
          dark: "#c8d4e5",
        },
      },
    },
    "kumo-tip-shadow": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-gray-200, oklch(92.8% 0.006 264.531))",
          dark: "transparent",
        },
      },
    },
    "kumo-tip-stroke": {
      newName: "",
      theme: {
        kumo: {
          light: "transparent",
          dark: "var(--color-neutral-800, oklch(26.9% 0 0))",
        },
      },
    },
    "kumo-info": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-blue-500, oklch(62.3% 0.214 259.815))",
          dark: "var(--color-blue-700, oklch(48.8% 0.243 264.376))",
        },
      },
    },
    "kumo-info-tint": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-blue-300, oklch(80.9% 0.105 251.813))",
          dark: "var(--color-blue-900, oklch(37.9% 0.146 265.522))",
        },
      },
    },
    "kumo-warning": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-yellow-500, oklch(79.5% 0.184 86.047))",
          dark: "var(--color-yellow-700, oklch(55.4% 0.135 66.442))",
        },
      },
    },
    "kumo-warning-tint": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-yellow-300, oklch(90.5% 0.182 98.111))",
          dark: "var(--color-yellow-900, oklch(42.1% 0.095 57.708))",
        },
      },
    },
    "kumo-danger": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-red-500, oklch(63.7% 0.237 25.331))",
          dark: "var(--color-red-700, oklch(50.5% 0.213 27.518))",
        },
      },
    },
    "kumo-danger-tint": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-red-300, oklch(80.8% 0.114 19.571))",
          dark: "var(--color-red-900, oklch(39.6% 0.141 25.723))",
        },
      },
    },
  },

  /**
   * Typography tokens
   * Used with: text-{size} utilities
   * CSS variables: --text-{size}, --text-{size}--line-height
   *
   * Note: Typography is NOT theme-dependent (no light/dark mode).
   * Values are the same across color modes but may differ per theme.
   */
  typography: {
    xs: {
      newName: "",
      theme: {
        kumo: "12px",
      },
    },
    "xs--line-height": {
      newName: "",
      theme: {
        kumo: "calc(1 / 0.75)",
      },
    },
    sm: {
      newName: "",
      theme: {
        kumo: "13px",
      },
    },
    "sm--line-height": {
      newName: "",
      theme: {
        kumo: "calc(1 / 0.85)",
      },
    },
    base: {
      newName: "",
      theme: {
        kumo: "14px",
      },
    },
    "base--line-height": {
      newName: "",
      theme: {
        kumo: "calc(1.25 / 0.875)",
      },
    },
    lg: {
      newName: "",
      theme: {
        kumo: "16px",
      },
    },
    "lg--line-height": {
      newName: "",
      theme: {
        kumo: "calc(1.25 / 1)",
      },
    },
  },
};

/** List of all available themes */
export const AVAILABLE_THEMES = ["kumo", "fedramp"] as const;
export type AvailableTheme = (typeof AVAILABLE_THEMES)[number];
