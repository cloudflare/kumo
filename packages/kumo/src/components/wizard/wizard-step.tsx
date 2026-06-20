import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";
import { StepContext, StepIndexContext, useWizardInternal } from "./wizard";

// Card-stack animation variants for fullscreen wizard steps. Combined with `origin-bottom` on the step element so `scale` pivots at the bottom edge. `y: -110%` pushes the previous step further up so only a small sliver peeks above the active card.
const stepVariantsConfig = {
  current: {
    y: 0,
    scale: 1,
    opacity: 1,
    zIndex: 30,
  },
  previous: {
    y: "-110%",
    scale: 0.85,
    opacity: 0.5,
    zIndex: 0,
  },
  beforePrevious: {
    y: "-210%",
    scale: 1,
    opacity: 0,
    zIndex: 0,
  },
  after: {
    y: "200%",
    scale: 1,
    opacity: 0,
    zIndex: 0,
  },
} as const;

/** Determines the animation variant for a step based on its position relative to the current step. */
function getStepVariant(index: number, currentStep: number) {
  if (index === currentStep) return "current";
  if (index === currentStep - 1) return "previous";
  if (index < currentStep - 1) return "beforePrevious";
  return "after";
}

export interface WizardStepProps {
  /** Step content — typically a `Wizard.Page`. */
  children: ReactNode;
  /** Whether to hide this step from the sidebar. @default false */
  hideFromSidebar?: boolean;
  /** Label shown in the sidebar navigation. */
  label?: string;
  /** Unique key for this step. Avoid `key` since it's a React reserved prop. */
  stepKey: string;
  /**
   * Whether this step is active in the current flow. When `false`, the step
   * is excluded from rendering, indexing, sidebar, and navigation — as if it
   * were not declared. Use for declarative branching instead of `{cond && <Step>}`.
   * @default true
   */
  when?: boolean;
}

/**
 * Individual step definition within a Wizard.
 *
 * Registers itself with the Wizard context on mount and unregisters on unmount.
 * Renders its children wrapped in a `motion.div` with card-stack animation variants.
 *
 * @example
 * ```tsx
 * <Wizard.Step stepKey="details" label="Details">
 *   <Wizard.Page title="Enter details" footer={<Button>Next</Button>}>
 *     <form>...</form>
 *   </Wizard.Page>
 * </Wizard.Step>
 * ```
 */
const WizardStep = forwardRef<HTMLDivElement, WizardStepProps>(
  function WizardStep(
    { children, hideFromSidebar = false, label, stepKey },
    ref,
  ) {
    const {
      step,
      onStepChange,
      previousStepNavigation,
      registerStep,
      unregisterStep,
      shouldReduceMotion,
      isAnimating,
      setIsAnimating,
      activeStepFocusable,
      stepElementsRef,
      currentStepRef,
      labels,
    } = useWizardInternal();

    // Index provided by WizardSteps via context (replaces cloneElement injection)
    const index = useContext(StepIndexContext);

    // Register/unregister step metadata with the wizard context
    useEffect(() => {
      registerStep({ key: stepKey, label, hideFromSidebar, order: index });
      return () => unregisterStep(stepKey);
    }, [stepKey, label, hideFromSidebar, index, registerStep, unregisterStep]);

    const stepVariants = stepVariantsConfig;

    // Ref callback to register this step's DOM element
    const stepRefCallback = useCallback(
      (element: HTMLDivElement | null) => {
        if (element) {
          stepElementsRef.current.set(index, element);
        } else {
          stepElementsRef.current.delete(index);
        }
        // Sync forwarded ref
        if (typeof ref === "function") {
          ref(element);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current =
            element;
        }
      },
      [index, ref, stepElementsRef],
    );

    const focusStepContainer = useCallback(() => {
      if (currentStepRef.current) {
        currentStepRef.current.focus({ preventScroll: true });
      }
    }, [currentStepRef]);

    // Handle animation complete — focus step container after animation finishes
    const handleAnimationComplete = useCallback(() => {
      if (index === step) {
        setIsAnimating(false);
        focusStepContainer();
      }
    }, [index, step, setIsAnimating, focusStepContainer]);

    const isActive = index === step;
    const isPrevious = index === step - 1;
    const isPreviousStepNavigationEnabled =
      previousStepNavigation === "enabled";

    const stepContextValue = useMemo(() => ({ isActive }), [isActive]);

    return (
      <motion.div
        animate={getStepVariant(index, step)}
        // Hide non-current/non-previous steps from screen readers (WCAG 2.1 SC 1.3.1, 4.1.2)
        aria-hidden={!isActive && !isPrevious}
        aria-label={
          isPrevious && isPreviousStepNavigationEnabled
            ? labels.goBackTo(label || labels.previousStep)
            : undefined
        }
        className={cn(
          // Position card at the grid-line offset. origin-bottom makes scale(0.85) pivot at the bottom edge so the previous-step peek is consistent regardless of card height.
          "absolute inset-x-0 top-(--wizard-content-top,180px) origin-bottom px-2 pb-8 outline-none sm:px-6",
          // Previous step with navigation enabled: go-back affordance on the wrapper
          isPrevious &&
            isPreviousStepNavigationEnabled &&
            "hover:opacity-100 focus:opacity-100 cursor-pointer after:pointer-events-none after:absolute after:inset-x-2 after:top-0 after:bottom-8 after:rounded-xl after:ring-1 after:ring-transparent after:transition-all sm:after:inset-x-6 focus-visible:after:ring-kumo-interact",
          // Future steps are non-interactive
          index > step && "pointer-events-none",
          // Prevent text selection on non-active steps (decorative peek)
          !isActive && "select-none",
          isAnimating && "animating",
        )}
        data-kumo-component="Wizard"
        data-kumo-part="step"
        data-step-active={isActive ? "" : undefined}
        data-step-key={stepKey}
        initial={false}
        onAnimationComplete={handleAnimationComplete}
        onClick={() => {
          if (!isPreviousStepNavigationEnabled) return;
          // Only the immediately-previous step is an interactive go-back target
          if (isPrevious) {
            onStepChange(index);
          }
        }}
        onKeyDown={(e) => {
          if (isPrevious && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            if (isPreviousStepNavigationEnabled) {
              onStepChange(index);
            }
          }
        }}
        ref={stepRefCallback}
        role={
          isPrevious && isPreviousStepNavigationEnabled ? "button" : undefined
        }
        // Tab order: only active and previous steps are focusable
        tabIndex={
          isActive
            ? activeStepFocusable
              ? 0
              : -1
            : isPrevious && isPreviousStepNavigationEnabled
              ? 0
              : -1
        }
        transition={{
          type: "tween",
          duration: shouldReduceMotion ? 0 : 0.6,
          ease: [0.3, 1, 0.35, 1],
        }}
        variants={stepVariants}
      >
        <StepContext.Provider value={stepContextValue}>
          <div
            className={!isActive ? "pointer-events-none" : undefined}
            // React 18's runtime drops the boolean inert prop (only React 19 honors it), so pass a string to render the attribute in both
            inert={!isActive ? ("true" as unknown as boolean) : undefined}
          >
            {children}
          </div>
        </StepContext.Provider>
      </motion.div>
    );
  },
);

WizardStep.displayName = "Wizard.Step";

export { WizardStep };
