export type Language = {
  value: string;
  label: string;
  emoji: string;
};

export const languages: Language[] = [
  { value: "en", label: "English", emoji: "🇬🇧" },
  { value: "cs", label: "Čeština", emoji: "🇨🇿" },
  { value: "de", label: "Deutsch", emoji: "🇩🇪" },
  { value: "es", label: "Español", emoji: "🇪🇸" },
  { value: "fr", label: "Français", emoji: "🇫🇷" },
  { value: "it", label: "Italiano", emoji: "🇮🇹" },
  { value: "pt-BR", label: "Português (Brasil)", emoji: "🇧🇷" },
  { value: "pt-PT", label: "Português (Portugal)", emoji: "🇵🇹" },
  { value: "sv", label: "Svenska", emoji: "🇸🇪" },
  { value: "vi", label: "Tiếng Việt", emoji: "🇻🇳" },
  { value: "tr", label: "Türkçe", emoji: "🇹🇷" },
  { value: "ru", label: "Русский", emoji: "🇷🇺" },
  { value: "ja", label: "日本語", emoji: "🇯🇵" },
  { value: "ko", label: "한국어", emoji: "🇰🇷" },
  { value: "zh-Hans", label: "简体中文", emoji: "🇨🇳" },
  { value: "zh-Hant", label: "繁體中文", emoji: "🇹🇼" },
];
