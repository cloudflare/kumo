export {
  WizardRoot,
  useWizard,
  KUMO_WIZARD_VARIANTS,
  KUMO_WIZARD_DEFAULT_VARIANTS,
  type WizardVariant,
  type UseWizardReturn,
  type WizardProps,
  type WizardStepItem,
  type WizardLabels,
  type WizardPreviousStepNavigation,
} from "./wizard";
export { WizardStep, type WizardStepProps } from "./wizard-step";
export { WizardSteps, type WizardStepsProps } from "./wizard-steps";
export { WizardPage, type WizardPageProps } from "./wizard-page";
export { WizardSidebar, type WizardSidebarProps } from "./wizard-sidebar";
export {
  WizardFullscreen,
  WizardCloseButton,
  type WizardFullscreenProps,
  type WizardCloseButtonProps,
  type WizardFullscreenLabels,
} from "./wizard-fullscreen";
export { WizardGrid, type WizardGridProps } from "./wizard-grid";
export { type WizardWidth } from "./wizard-shared";
export { useWizardGrid, type UseWizardGridReturn } from "./use-wizard-grid";

import { WizardRoot as _WizardRoot } from "./wizard";
import { WizardStep } from "./wizard-step";
import { WizardSteps } from "./wizard-steps";
import { WizardPage } from "./wizard-page";
import { WizardSidebar } from "./wizard-sidebar";
import { WizardFullscreen, WizardCloseButton } from "./wizard-fullscreen";
import { WizardGrid } from "./wizard-grid";
export const Wizard = Object.assign(_WizardRoot, {
  CloseButton: WizardCloseButton,
  Sidebar: WizardSidebar,
  Step: WizardStep,
  Steps: WizardSteps,
  Page: WizardPage,
  Fullscreen: WizardFullscreen,
  Grid: WizardGrid,
});
