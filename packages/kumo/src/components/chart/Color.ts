/**
 * Categorical colors for light mode — used when assigning colors to data series
 * by index (e.g. the first series gets Blue, the second gets Violet, etc.).
 */
enum ChartCategoricalLightColors {
  Blue = "#4290F0",
  Yellow = "#F5B647",
  Pink = "#E8649D",
  Purple = "#8D58EE",
  Teal = "#50C3B6",
  Orange = "#D37536",
}

/**
 * Categorical colors for dark mode
 */
enum ChartCategoricalDarkColors {
  Blue = "#4290F0",
  Yellow = "#EEB720",
  Pink = "#E8649D",
  Purple = "#8D58EE",
  Teal = "#50C3B6",
  Orange = "#D37536",
}

/**
 * Semantic colors for light mode — used to convey meaning (status, severity)
 * rather than just distinguishing series. Use via `ChartPalette.semantic()`.
 */
enum ChartSemanticLightColors {
  Attention = "#FC574A",
  Warning = "#F8A054",
  Success = "#00A63E",
  Neutral = "#B9D6FF",
  Disabled = "#CBCBCB",
  Skeleton = "#DDDDDD",
}

/**
 * Semantic colors for dark mode
 */
enum ChartSemanticDarkColors {
  Attention = "#FC574A",
  Warning = "#F8A054",
  Success = "#00A63E",
  Neutral = "#8EC5FF",
  Disabled = "#878787",
  Skeleton = "#5C5C5C",
}

export type ChartSemanticColorName =
  | "Attention"
  | "Warning"
  | "Success"
  | "Neutral"
  | "Disabled"
  | "Skeleton";

/**
 * Sequential color palettes for light mode with the colour in position #2 of the array as the base.
 */
const sequentialLight = {
  blues: ["#E1EAF4", "#8EBCF6", "#4290F0", "#0E58B4", "#03254F"],
};

/**
 * Sequential color palettes for dark mode. These are the reverse of the light mode palettes using the same base color (position 2).
 */
const sequentialDark = {
  blues: ["#03254F", "#0E58B4", "#4290F0", "#A6BFDD", "#E1EAF4"],
};

/**
 * Ordered list of categorical colors for light mode, indexed by series position.
 * Used as the default ECharts color palette when `isDarkMode` is `false`.
 */
export const CHART_LIGHT_COLORS = [
  ChartCategoricalLightColors.Blue,
  ChartCategoricalLightColors.Yellow,
  ChartCategoricalLightColors.Pink,
  ChartCategoricalLightColors.Purple,
  ChartCategoricalLightColors.Teal,
  ChartCategoricalLightColors.Orange,
];

/**
 * Ordered list of categorical colors for dark mode, indexed by series position.
 * Used as the default ECharts color palette when `isDarkMode` is `true`.
 */
export const CHART_DARK_COLORS = [
  ChartCategoricalDarkColors.Blue,
  ChartCategoricalDarkColors.Yellow,
  ChartCategoricalDarkColors.Pink,
  ChartCategoricalDarkColors.Purple,
  ChartCategoricalDarkColors.Teal,
  ChartCategoricalDarkColors.Orange,
];

/**
 * Utilities for resolving Kumo chart colors by semantic name or series index.
 * All functions accept an `isDarkMode` flag and return the appropriate color string.
 */
export namespace ChartPalette {
  /**
   * Returns the hex color for a named semantic value (status, severity, etc.).
   *
   * @example
   * ```ts
   * ChartPalette.semantic("Attention")           // "#FC574A" (light)
   * ChartPalette.semantic("Warning", true)       // "#F8A054" (dark)
   * ```
   */
  export function semantic(
    name: ChartSemanticColorName,
    isDarkMode = false,
  ): string {
    return isDarkMode
      ? ChartSemanticDarkColors[name]
      : ChartSemanticLightColors[name];
  }

  /**
   * Returns the categorical color for a given series index.
   * Wraps around via modulo when `index` exceeds the palette length (6 colors).
   *
   * @example
   * ```ts
   * ChartPalette.categorical(0)        // Blue (light)
   * ChartPalette.categorical(0, true)  // Blue (dark)
   * ChartPalette.categorical(6)        // wraps back to Blue
   * ```
   */
  export function categorical(index: number, isDarkMode = false): string {
    return isDarkMode
      ? CHART_DARK_COLORS[index % CHART_DARK_COLORS.length]
      : CHART_LIGHT_COLORS[index % CHART_LIGHT_COLORS.length];
  }

  /**
   * Returns all steps of a named sequential palette as an array.
   *
   * @example
   * ```ts
   * ChartPalette.sequential("blues")        // 5-step array (light)
   * ChartPalette.sequential("blues", true)  // 5-step array (dark)
   * ```
   */
  export function sequential(
    palette: keyof typeof sequentialLight,
    isDarkMode = false,
  ): string[] {
    return isDarkMode
      ? [...sequentialDark[palette]]
      : [...sequentialLight[palette]];
  }
}
