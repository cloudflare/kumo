/**
 * Type declarations for virtual:kumo-colors module.
 * Provides color token data parsed from CSS files.
 */
declare module "virtual:kumo-colors" {
  export type TokenType = "semantic" | "global" | "override";

  export interface ColorToken {
    /** Token name with -- prefix (e.g., "--color-surface") */
    name: string;
    /** Light mode value */
    light: string;
    /** Dark mode value */
    dark: string;
    /** Theme this token belongs to */
    theme: string;
    /** Token type: semantic, global, or override */
    tokenType: TokenType;
  }

  /** All color tokens parsed from CSS files */
  export const kumoColors: ColorToken[];
}
