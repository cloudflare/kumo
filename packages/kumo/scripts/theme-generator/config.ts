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
          dark: "var(--color-kumo-neutral-50, oklch(97.5% 0 0))",
        },
      },
    },
    "kumo-inactive": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-400, oklch(70.8% 0 0))",
          dark: "var(--color-neutral-600, oklch(70.8% 0 0))",
        },
      },
    },
    "kumo-placeholder": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-neutral-400, oklch(70.8% 0 0))",
          dark: "var(--color-neutral-500, oklch(55.6% 0 0))",
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
    "kumo-info": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-blue-700, oklch(48.8% 0.243 264.376))",
          dark: "var(--color-blue-400, oklch(70.7% 0.165 254.624))",
        },
      },
    },
    "kumo-success": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-green-500, oklch(72.3% 0.219 149.579))",
          dark: "var(--color-green-400, oklch(79.2% 0.209 151.711))",
        },
      },
    },
    "kumo-danger": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-red-700, oklch(50.5% 0.213 27.518))",
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

    /*
     * Badge text color tokens
     * Subtle variants need colored text; inverted needs flipping text
     */
    "kumo-badge-red-subtle": {
      newName: "",
      description: "Text color for subtle red badge",
      theme: {
        kumo: {
          light: "var(--color-red-800, oklch(44.4% 0.177 26.899))",
          dark: "var(--color-red-200, oklch(88.5% 0.062 18.334))",
        },
      },
    },
    "kumo-badge-orange-subtle": {
      newName: "",
      description: "Text color for subtle orange badge",
      theme: {
        kumo: {
          light: "var(--color-orange-800, oklch(47% 0.157 37.304))",
          dark: "var(--color-orange-200, oklch(90.1% 0.076 70.697))",
        },
      },
    },
    "kumo-badge-yellow-subtle": {
      newName: "",
      description: "Text color for subtle yellow badge",
      theme: {
        kumo: {
          light: "var(--color-yellow-800, oklch(47.6% 0.114 61.907))",
          dark: "var(--color-yellow-200, oklch(94.5% 0.129 101.54))",
        },
      },
    },
    "kumo-badge-green-subtle": {
      newName: "",
      description: "Text color for subtle green badge",
      theme: {
        kumo: {
          light: "var(--color-emerald-800, oklch(43.2% 0.095 166.913))",
          dark: "var(--color-emerald-200, oklch(90.5% 0.093 164.15))",
        },
      },
    },
    "kumo-badge-teal-subtle": {
      newName: "",
      description: "Text color for subtle teal badge",
      theme: {
        kumo: {
          light: "var(--color-teal-800, oklch(43.7% 0.078 188.216))",
          dark: "var(--color-teal-200, oklch(91% 0.096 180.426))",
        },
      },
    },
    "kumo-badge-blue-subtle": {
      newName: "",
      description: "Text color for subtle blue badge",
      theme: {
        kumo: {
          light: "var(--color-blue-800, oklch(42.4% 0.199 265.638))",
          dark: "var(--color-blue-200, oklch(88.2% 0.059 254.128))",
        },
      },
    },
    "kumo-badge-neutral-subtle": {
      newName: "",
      description: "Text color for subtle neutral badge",
      theme: {
        kumo: {
          light: "var(--color-neutral-800, oklch(26.9% 0 0))",
          dark: "var(--color-neutral-200, oklch(92.2% 0 0))",
        },
      },
    },
    "kumo-badge-inverted": {
      newName: "",
      description: "Text color for inverted badge (white in light, black in dark)",
      theme: {
        kumo: {
          light: "var(--color-white, #fff)",
          dark: "var(--color-black, #000)",
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
    "kumo-surface": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-kumo-neutral-25, oklch(99% 0 0))",
          dark: "var(--color-kumo-neutral-975, oklch(8.5% 0 0))",
        },
        fedramp: {
          light: "#5b697c",
          dark: "#5b697c",
        },
      },
    },
    "kumo-recessed": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-kumo-neutral-50, oklch(96.5% 0 0))",
          dark: "var(--color-kumo-neutral-925, oklch(18% 0 0))",
        },
      },
    },
    "kumo-base": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-white, #fff)",
          dark: "var(--color-kumo-neutral-850, oklch(22.4% 0 0))",
        },
        fedramp: {
          light: "#5b697c",
          dark: "#5b697c",
        },
      },
    },
    "kumo-tint": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-kumo-neutral-75, oklch(96.7% 0 0))",
          dark: "var(--color-kumo-neutral-800, oklch(26.9% 0 0))",
        },
      },
    },
    "kumo-contrast": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-kumo-neutral-975, oklch(8.5% 0 0))",
          dark: "var(--color-kumo-neutral-25, oklch(99% 0 0))",
        },
      },
    },
    /**
     * TO DEPRECIATE
     * In an effort to reduce the amount of greyscale tokens used in Kumo & Stratus, these tokens will be replaced and depreciated
     */
    "kumo-elevated": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-kumo-neutral-25, oklch(98.5% 0 0))",
          dark: "var(--color-neutral-950, oklch(14.5% 0 0))",
        },
      },
    },
    "kumo-overlay": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-kumo-neutral-50, oklch(97.5% 0 0))",
          dark: "var(--color-neutral-800, oklch(26.9% 0 0))",
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
          light: "var(--color-kumo-neutral-150, oklch(93.5% 0 0))",
          dark: "var(--color-neutral-700, oklch(37.1% 0 0))",
        },
        fedramp: {
          light: "#c8d4e5",
          dark: "#c8d4e5",
        },
      },
    },
    "kumo-shadow-edge": {
      newName: "",
      description: "Tight spread shadow color for control thumbs/knobs",
      theme: {
        kumo: {
          light: "oklch(0% 0 0 / 0.12)",
          dark: "oklch(100% 0 0 / 0.1)",
        },
      },
    },
    "kumo-shadow-drop": {
      newName: "",
      description: "Drop shadow color for control thumbs/knobs",
      theme: {
        kumo: {
          light: "oklch(0% 0 0 / 0.08)",
          dark: "oklch(0% 0 0 / 0.3)",
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
          dark: "var(--color-blue-400, oklch(70.7% 0.165 254.624))",
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
    "kumo-success": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-green-500, oklch(72.3% 0.219 149.579))",
          dark: "var(--color-green-700, oklch(52.7% 0.154 150.069))",
        },
      },
    },
    "kumo-success-tint": {
      newName: "",
      theme: {
        kumo: {
          light: "var(--color-green-300, oklch(87.1% 0.15 154.449))",
          dark: "var(--color-green-900, oklch(39.3% 0.095 152.535))",
        },
      },
    },

    /*
     * Badge color tokens
     * Solid variants: vivid background, white text
     * Subtle variants: tinted background, darker text (flips in dark mode)
     */

    // Red
    "kumo-badge-red": {
      newName: "",
      description: "Red badge background",
      theme: {
        kumo: {
          light: "var(--color-red-600, oklch(57.7% 0.245 27.325))",
          dark: "var(--color-red-700, oklch(50.5% 0.213 27.518))",
        },
      },
    },
    "kumo-badge-red-subtle": {
      newName: "",
      description: "Subtle red badge background",
      theme: {
        kumo: {
          light: "var(--color-red-100, oklch(93.6% 0.032 17.717))",
          dark: "var(--color-red-900, oklch(39.6% 0.141 25.723))",
        },
      },
    },

    // Orange
    "kumo-badge-orange": {
      newName: "",
      description: "Orange badge background",
      theme: {
        kumo: {
          light: "var(--color-orange-600, oklch(64.6% 0.222 41.116))",
          dark: "var(--color-orange-700, oklch(55.3% 0.195 38.402))",
        },
      },
    },
    "kumo-badge-orange-subtle": {
      newName: "",
      description: "Subtle orange badge background",
      theme: {
        kumo: {
          light: "var(--color-orange-100, oklch(95.4% 0.038 75.164))",
          dark: "var(--color-orange-900, oklch(40.8% 0.123 38.172))",
        },
      },
    },

    // Yellow
    "kumo-badge-yellow": {
      newName: "",
      description: "Yellow badge background",
      theme: {
        kumo: {
          light: "var(--color-yellow-600, oklch(68.1% 0.162 75.834))",
          dark: "var(--color-yellow-700, oklch(55.4% 0.135 66.442))",
        },
      },
    },
    "kumo-badge-yellow-subtle": {
      newName: "",
      description: "Subtle yellow badge background",
      theme: {
        kumo: {
          light: "var(--color-yellow-100, oklch(97.3% 0.071 103.193))",
          dark: "var(--color-yellow-900, oklch(42.1% 0.095 57.708))",
        },
      },
    },

    // Green (emerald scale)
    "kumo-badge-green": {
      newName: "",
      description: "Green badge background",
      theme: {
        kumo: {
          light: "var(--color-emerald-600, oklch(59.6% 0.145 163.225))",
          dark: "var(--color-emerald-700, oklch(50.8% 0.118 165.612))",
        },
      },
    },
    "kumo-badge-green-subtle": {
      newName: "",
      description: "Subtle green badge background",
      theme: {
        kumo: {
          light: "var(--color-emerald-100, oklch(95% 0.052 163.051))",
          dark: "var(--color-emerald-900, oklch(37.8% 0.077 168.94))",
        },
      },
    },

    // Teal
    "kumo-badge-teal": {
      newName: "",
      description: "Teal badge background",
      theme: {
        kumo: {
          light: "var(--color-teal-600, oklch(60% 0.118 184.704))",
          dark: "var(--color-teal-700, oklch(51.1% 0.096 186.391))",
        },
      },
    },
    "kumo-badge-teal-subtle": {
      newName: "",
      description: "Subtle teal badge background",
      theme: {
        kumo: {
          light: "var(--color-teal-100, oklch(95.3% 0.051 180.801))",
          dark: "var(--color-teal-900, oklch(38.6% 0.063 188.416))",
        },
      },
    },

    // Blue
    "kumo-badge-blue": {
      newName: "",
      description: "Blue badge background",
      theme: {
        kumo: {
          light: "var(--color-blue-600, oklch(54.6% 0.245 262.881))",
          dark: "var(--color-blue-700, oklch(48.8% 0.243 264.376))",
        },
      },
    },
    "kumo-badge-blue-subtle": {
      newName: "",
      description: "Subtle blue badge background",
      theme: {
        kumo: {
          light: "var(--color-blue-100, oklch(93.2% 0.032 255.585))",
          dark: "var(--color-blue-900, oklch(37.9% 0.146 265.522))",
        },
      },
    },

    // Neutral
    "kumo-badge-neutral": {
      newName: "",
      description: "Neutral badge background",
      theme: {
        kumo: {
          light: "var(--color-neutral-600, oklch(43.9% 0 0))",
          dark: "var(--color-neutral-600, oklch(43.9% 0 0))",
        },
      },
    },
    // NOTE: kumo-badge-neutral-subtle omitted — same pair as kumo-fill.
    // Badge uses bg-kumo-fill instead.

    // Inverted
    "kumo-badge-inverted": {
      newName: "",
      description: "Inverted badge background (near-black in light, white in dark)",
      theme: {
        kumo: {
          light: "var(--color-neutral-950, oklch(14.5% 0 0))",
          dark: "var(--color-white, #fff)",
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
