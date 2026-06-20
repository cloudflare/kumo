import { Children, isValidElement, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { StepIndexContext } from "./wizard";
import type { WizardStepProps } from "./wizard-step";

export interface WizardStepsProps {
  /** Step children — should be `Wizard.Step` elements. */
  children: ReactNode;
  /** Additional CSS classes for the step container. */
  className?: string;
}

/**
 * Container for wizard steps. Provides the stacking context where
 * steps are absolutely positioned and animated.
 *
 * Each child receives its render-order index via `StepIndexContext`
 * so `Wizard.Step` can read it without `cloneElement`.
 *
 * Steps with `when={false}` are excluded before indexing, so the
 * remaining active steps get contiguous 0-based indices.
 *
 * @example
 * ```tsx
 * <Wizard.Steps>
 *   <Wizard.Step stepKey="first">...</Wizard.Step>
 *   <Wizard.Step stepKey="second" when={showSecond}>...</Wizard.Step>
 *   <Wizard.Step stepKey="third">...</Wizard.Step>
 * </Wizard.Steps>
 * ```
 */
function WizardSteps({ children, className }: WizardStepsProps) {
  // Filter out falsy children (from {cond && <Step>}) and steps with when={false}.
  const activeChildren = Children.toArray(children)
    .filter(isValidElement)
    .filter((child) => {
      const props = child.props as Partial<WizardStepProps>;
      return props.when !== false;
    });

  const indexedChildren = activeChildren.map((child, index) => {
    const props = child.props as Partial<WizardStepProps>;
    return (
      <StepIndexContext.Provider key={props.stepKey ?? index} value={index}>
        {child}
      </StepIndexContext.Provider>
    );
  });

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      data-kumo-component="Wizard"
      data-kumo-part="steps"
    >
      {indexedChildren}
    </div>
  );
}

WizardSteps.displayName = "Wizard.Steps";

export { WizardSteps };
