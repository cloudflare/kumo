/**
 * Kumo Theme Generator Types
 *
 * Defines the structure for semantic color tokens and typography that can be themed.
 */

/** Light and dark mode color values */
export type ColorMode = {
  light: string;
  dark: string;
};

/** Theme-specific color overrides (kumo is required, others are optional) */
export type ThemeColors = {
  kumo: ColorMode;
  fedramp?: ColorMode;
  [themeName: string]: ColorMode | undefined;
};

/** Definition of a single semantic token */
export type TokenDefinition = {
  /** New name for the token (for future migration) */
  newName: string;
  /** Theme-specific color values */
  theme: ThemeColors;
  /** Optional description for documentation */
  description?: string;
};

/** Text color tokens (used with text-* utilities) */
export type TextTokens = {
  [tokenName: string]: TokenDefinition;
};

/** Color tokens (used with bg-*, border-*, ring-*, etc.) */
export type ColorTokens = {
  [tokenName: string]: TokenDefinition;
};

/** Theme-specific typography values (kumo is required, others are optional) */
export type ThemeTypography = {
  kumo: string;
  fedramp?: string;
  [themeName: string]: string | undefined;
};

/** Definition of a single typography token (font size or line height) */
export type TypographyTokenDefinition = {
  /** New name for the token (for future migration) */
  newName: string;
  /** Theme-specific typography values */
  theme: ThemeTypography;
  /** Optional description for documentation */
  description?: string;
};

/** Typography tokens for text sizes and line heights */
export type TypographyTokens = {
  [tokenName: string]: TypographyTokenDefinition;
};

/** Complete theme configuration */
export type ThemeConfig = {
  /** Text color tokens */
  text: TextTokens;
  /** General color tokens (bg, border, ring, etc.) */
  color: ColorTokens;
  /** Typography tokens (font sizes and line heights) */
  typography?: TypographyTokens;
};

/** Output options for CSS generation */
export type GeneratorOptions = {
  /** Output directory for generated CSS files */
  outputDir: string;
  /** Whether to use the new token names (for migration) */
  useNewNames?: boolean;
  /** Themes to generate (defaults to all) */
  themes?: string[];
};

/** Mapping from old token names to new names (for codemod) */
export type TokenRenameMap = {
  text: Record<string, string>;
  color: Record<string, string>;
};
