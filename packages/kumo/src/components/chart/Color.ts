/**
 * Categorical colors for light mode — used when assigning colors to data series
 * by index (e.g. the first series gets Blue, the second gets Violet, etc.).
 */
enum ChartCategoricalLightColors {
  Blue = "#086FFF",
  Violet = "#CF7EE9",
  Cyan = "#73CEE6",
  Indigo = "#5B5FEF",
  LightBlue = "#82B6FF",
  Pink = "#F5609F",
  Indigo3 = "#C2BDF3",
  Violet2 = "#8D1EB1",
  Violet3 = "#EBCAF6",
  Indigo2 = "#7366E4",
}

/**
 * Categorical colors for dark mode — same hues as the light palette but with
 * `E6` alpha (90% opacity) appended to soften contrast on dark backgrounds.
 */
enum ChartCategoricalDarkColors {
  Blue = "#086FFFE6",
  Violet = "#CF7EE9E6",
  Cyan = "#73CEE6E6",
  Indigo = "#5B5FEFE6",
  LightBlue = "#82B6FFE6",
  Pink = "#F5609FE6",
  Indigo3 = "#C2BDF3E6",
  Violet2 = "#8D1EB1E6",
  Violet3 = "#EBCAF6E6",
  Indigo2 = "#7366E4E6",
}

/**
 * Semantic colors for light mode — used to convey meaning (status, severity)
 * rather than just distinguishing series. Use via `ChartPalette.semantic()`.
 */
enum ChartSemanticLightColors {
  Attention = "#FC574A",
  Warning = "#F8A054",
  Neutral = "#82B6FF",
  NeutralLight = "#B9D6FF",
  Disabled = "#B6B6B6",
  DisabledLight = "#D9D9D9",
}

/**
 * Semantic colors for dark mode — same meanings as the light palette but with
 * `E6` alpha (90% opacity) for dark backgrounds.
 */
enum ChartSemanticDarkColors {
  Attention = "#FC574AE6",
  Warning = "#F8A054E6",
  Neutral = "#82B6FFE6",
  NeutralLight = "#B9D6FFE6",
  Disabled = "#B6B6B6E6",
  DisabledLight = "#D9D9D9E6",
}

/**
 * Ordered list of categorical colors for light mode, indexed by series position.
 * Used as the default ECharts color palette when `isDarkMode` is `false`.
 */
export const CHART_LIGHT_COLORS = [
  ChartCategoricalLightColors.Blue,
  ChartCategoricalLightColors.Violet,
  ChartCategoricalLightColors.Cyan,
  ChartCategoricalLightColors.Indigo,
  ChartCategoricalLightColors.LightBlue,
  ChartCategoricalLightColors.Pink,
  ChartCategoricalLightColors.Indigo3,
  ChartCategoricalLightColors.Violet2,
  ChartCategoricalLightColors.Violet3,
  ChartCategoricalLightColors.Indigo2,
];

/**
 * Ordered list of categorical colors for dark mode, indexed by series position.
 * Used as the default ECharts color palette when `isDarkMode` is `true`.
 */
export const CHART_DARK_COLORS = [
  ChartCategoricalDarkColors.Blue,
  ChartCategoricalDarkColors.Violet,
  ChartCategoricalDarkColors.Cyan,
  ChartCategoricalDarkColors.Indigo,
  ChartCategoricalDarkColors.LightBlue,
  ChartCategoricalDarkColors.Pink,
  ChartCategoricalDarkColors.Indigo3,
  ChartCategoricalDarkColors.Violet2,
  ChartCategoricalDarkColors.Violet3,
  ChartCategoricalDarkColors.Indigo2,
];

/**
 * Utilities for resolving Kumo chart colors by semantic name or series index.
 * Both functions accept an `isDarkMode` flag and return the appropriate hex color.
 */
export namespace ChartPalette {
  /**
   * Returns the hex color for a named semantic value (status, severity, etc.).
   *
   * @example
   * ```ts
   * ChartPalette.semantic("Attention")           // "#FC574A" (light)
   * ChartPalette.semantic("Warning", true)       // "#F8A054E6" (dark)
   * ```
   */
  export function semantic(
    name:
      | "Attention"
      | "Warning"
      | "Neutral"
      | "NeutralLight"
      | "Disabled"
      | "DisabledLight",
    isDarkMode = false,
  ) {
    return isDarkMode
      ? ChartSemanticDarkColors[name]
      : ChartSemanticLightColors[name];
  }

  /**
   * Returns the categorical color for a given series index.
   * Wraps around via modulo when `index` exceeds the palette length (10 colors).
   *
   * @example
   * ```ts
   * ChartPalette.color(0)        // Blue (light)
   * ChartPalette.color(0, true)  // Blue with E6 alpha (dark)
   * ChartPalette.color(10)       // wraps back to Blue
   * ```
   */
  export function color(index: number, isDarkMode = false) {
    return isDarkMode
      ? CHART_DARK_COLORS[index % CHART_DARK_COLORS.length]
      : CHART_LIGHT_COLORS[index % CHART_LIGHT_COLORS.length];
  }
}
