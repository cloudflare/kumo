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

enum ChartSemanticLightColors {
  Attention = "#FC574A",
  Warning = "#F8A054",
  Neutral = "#82B6FF",
  NeutralLight = "#B9D6FF",
  Disabled = "#B6B6B6",
  DisabledLight = "#D9D9D9",
}

enum ChartSemanticDarkColors {
  Attention = "#FC574AE6",
  Warning = "#F8A054E6",
  Neutral = "#82B6FFE6",
  NeutralLight = "#B9D6FFE6",
  Disabled = "#B6B6B6E6",
  DisabledLight = "#D9D9D9E6",
}

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

export class ChartPalette {
  static semantic(
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

  static color(index: number, isDarkMode = false) {
    return isDarkMode
      ? CHART_DARK_COLORS[index % CHART_DARK_COLORS.length]
      : CHART_LIGHT_COLORS[index % CHART_LIGHT_COLORS.length];
  }

  static orangeShade(index: number, count: number) {
    return shadingColor("#f8a054", index, count);
  }

  static grayShade(index: number, count: number) {
    return shadingColor("#eee", index, count);
  }

  static blueShade(index: number, count: number) {
    return shadingColor("#0051C3", index, count);
  }
}

function shadingColor(baseHex: string, index: number, count: number) {
  const c = Math.max(1, Math.floor(count));
  const i = ((index % c) + c) % c;

  const { r, g, b } = hexToRgb(baseHex);
  const { h, s } = rgbToHsl(r, g, b);

  // Lightness range (tweak to taste)
  const maxL = clamp01(0.72); // lighter
  const minL = clamp01(0.42); // darker

  const t = c === 1 ? 0.5 : i / (c - 1);
  const l = maxL + (minL - maxL) * t;

  // Canvas (and ECharts) will accept hsl() strings
  const hh = Math.round(h);
  const ss = Math.round(s * 100);
  const ll = Math.round(l * 100);
  return `hsl(${hh}, ${ss}%, ${ll}%)`;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

// returns h in [0..360), s/l in [0..1]
function rgbToHsl(r: number, g: number, b: number) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;

  let h = 0;
  const l = (max + min) / 2;

  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  if (d !== 0) {
    switch (max) {
      case rr:
        h = ((gg - bb) / d) % 6;
        break;
      case gg:
        h = (bb - rr) / d + 2;
        break;
      default:
        h = (rr - gg) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}
