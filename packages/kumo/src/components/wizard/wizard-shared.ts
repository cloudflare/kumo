/** Wizard card width preset. */
export type WizardWidth = "narrow" | "wide";

/**
 * Maps width presets to CSS values for `--wizard-card-max-width`.
 * Set by `Wizard.Fullscreen`; consumed by `Wizard` and `Wizard.Grid` via CSS variable.
 */
export const widthValueMap: Record<WizardWidth, string> = {
  narrow: "38rem",
  wide: "48rem",
};
