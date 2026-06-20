import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../../utils/cn";
import { useWizardFullscreen } from "./wizard-fullscreen";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

// Catalog metadata for the Wizard component (follows the KUMO_*_VARIANTS convention).
export const KUMO_WIZARD_VARIANTS = {
  variant: {
    fullscreen: {
      classes: "",
      description: "Fullscreen wizard with focus trap",
    },
  },
} as const;

export const KUMO_WIZARD_DEFAULT_VARIANTS = {
  variant: "fullscreen",
} as const;

export type WizardVariant = keyof typeof KUMO_WIZARD_VARIANTS.variant;

// Labels for internationalization of Wizard aria-labels. All fields are optional with English defaults.
export interface WizardLabels {
  // Builds the aria-label for a previous step's go-back affordance.
  // Receives the step's `label` prop (or the `previousStep` fallback).
  // @default (stepLabel) => `Go back to ${stepLabel}`
  goBackTo?: (stepLabel: string) => string;
  // Fallback label when a step has no `label` prop. @default "previous step"
  previousStep?: string;
}

const DEFAULT_WIZARD_LABELS = {
  goBackTo: (stepLabel: string) => `Go back to ${stepLabel}`,
  previousStep: "previous step",
};

export interface WizardStepItem {
  key: string;
  label?: string;
  hideFromSidebar?: boolean;
}

interface WizardRegisteredStepItem extends WizardStepItem {
  order: number;
}

export type WizardPreviousStepNavigation = "enabled" | "disabled";

export interface WizardContextValue {
  step: number;
  /** Key of the current active step, or `undefined` if no steps are registered yet. */
  stepKey: string | undefined;
  onStepChange: (step: number) => void;
  /** Navigate to a step by its `stepKey`. No-op if the key is not mounted. */
  goToStep: (key: string) => void;
  /** Advance to the next mounted step. No-op if already on the last step. */
  next: () => void;
  /** Go back to the previous mounted step. No-op if already on the first step. */
  back: () => void;
  previousStepNavigation: WizardPreviousStepNavigation;
  totalSteps: number;
  items: WizardStepItem[];
  registerStep: (item: WizardRegisteredStepItem) => void;
  unregisterStep: (key: string) => void;
  /** Whether motion should be suppressed (prefers-reduced-motion). */
  shouldReduceMotion: boolean | null;
  /** Whether a step animation is in progress. */
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
  /** Whether the active step container is tabbable. */
  activeStepFocusable: boolean;
  setActiveStepFocusable: (focusable: boolean) => void;
  /** Map of step index → DOM element, for focus management. */
  stepElementsRef: { current: Map<number, HTMLDivElement> };
  /** Ref to the current active step element. */
  currentStepRef: React.RefObject<HTMLDivElement | null>;
  /** Whether an `onBeforeStepChange` guard is pending. */
  isChangingStep: boolean;
  /** Whether the wizard is on its last step. */
  isLastStep: boolean;
  /** Whether the wizard is on its first step. */
  isFirstStep: boolean;
  /** Triggers `onComplete` when on the last step. */
  complete: () => void;
  /** Programmatically close the wizard (calls `Wizard.Fullscreen`'s `onClose`). No-op if no `onClose` is set. */
  close: () => void;
  // Resolved i18n labels for step accessible names.
  labels: { goBackTo: (stepLabel: string) => string; previousStep: string };
}

const WizardContext = createContext<WizardContextValue | null>(null);

// Public subset of the wizard context exposed to consumers via useWizard(). Internal members (registerStep, refs, animation state, etc.) are only accessible via useWizardInternal() for Wizard.Step and the sidebar.
export type UseWizardReturn = Pick<
  WizardContextValue,
  | "back"
  | "close"
  | "complete"
  | "goToStep"
  | "isChangingStep"
  | "isFirstStep"
  | "isLastStep"
  | "items"
  | "next"
  | "onStepChange"
  | "previousStepNavigation"
  | "step"
  | "stepKey"
  | "totalSteps"
>;

/**
 * Hook to access wizard state from any descendant component.
 *
 * @example
 * ```tsx
 * const { step, stepKey, goToStep, next, back, close, isLastStep, complete } = useWizard();
 * ```
 *
 * @throws Error if used outside a `Wizard`.
 */
export function useWizard(): UseWizardReturn {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a <Wizard> component");
  }
  return context;
}

// @internal — Full context access for internal sub-components (Wizard.Step, sidebar). Consumers should use useWizard() instead.
export function useWizardInternal(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error(
      "useWizardInternal must be used within a <Wizard> component",
    );
  }
  return context;
}

export interface StepContextValue {
  isActive: boolean;
}

/** @internal — Used by Wizard.Step and Wizard.Page. Consumers should use `useWizard()` instead. */
const StepContext = createContext<StepContextValue>({ isActive: true });
StepContext.displayName = "Wizard.StepContext";

export { StepContext };

/** @internal — Provides the render-order index to each Wizard.Step via context instead of cloneElement. */
const StepIndexContext = createContext<number>(0);
StepIndexContext.displayName = "Wizard.StepIndexContext";

export { StepIndexContext };

// Resolve a step identifier (number or string key) to a numeric index.
function resolveStepIndex(
  value: number | string,
  items: WizardStepItem[],
): number {
  if (typeof value === "number") return value;
  const index = items.findIndex((i) => i.key === value);
  if (index === -1 && process.env.NODE_ENV !== "production") {
    console.warn(
      `[Wizard] Step key "${value}" is not mounted. Navigation skipped.`,
    );
  }
  return index;
}

/**
 * Wizard component props — the root context provider and animation engine.
 */
export interface WizardProps {
  /** Wizard content — `Wizard.Steps`, `Wizard.Step`, etc. */
  children: ReactNode;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /**
   * Initial step (index or `stepKey`) for uncontrolled mode. Ignored when `step` is provided.
   * @default 0
   */
  defaultStep?: number | string;
  /** Labels for internationalization of aria-labels. All labels have English defaults. */
  labels?: WizardLabels;
  /** Controls implicit previous-step affordances (previous card/sidebar clicks). Explicit `back()` still works. @default "enabled" */
  previousStepNavigation?: WizardPreviousStepNavigation;
  /**
   * Callback invoked when the active step's DOM element changes.
   * Used by `useWizardGrid()` to track card height for the animated grid.
   */
  onActiveStepElementChange?: (element: HTMLDivElement | null) => void;
  /**
   * Async validation guard fired before every step transition.
   * Return `false` (or resolve to `false`) to block the transition.
   */
  onBeforeStepChange?: (from: number, to: number) => boolean | Promise<boolean>;
  /**
   * Fired when the user advances past the last step (e.g. clicks "Done").
   * Does not trigger a step change beyond the last index.
   */
  onComplete?: () => void;
  /**
   * Callback when the wizard wants to change step (after `onBeforeStepChange` passes).
   * In controlled mode the consumer must update `step`; in uncontrolled mode the
   * wizard also updates its internal state. The second argument is the step's key.
   */
  onStepChange?: (step: number, key: string) => void;
  /**
   * Current active step (0-based index or `stepKey` string) in controlled mode.
   * When provided, the wizard is controlled — the consumer owns step state.
   * When omitted, the wizard manages its own step state internally (uncontrolled).
   */
  step?: number | string;
}

/**
 * Multi-step wizard with card-stack slide transitions.
 *
 * Compound component with `Wizard.Sidebar`, `Wizard.Steps`, `Wizard.Step`, and `Wizard.Page`.
 * Supports both controlled (`step`) and uncontrolled (`defaultStep`) modes.
 * The `step` prop accepts a numeric index or a string `stepKey`.
 *
 * @example Controlled (by key)
 * ```tsx
 * const [stepKey, setStepKey] = useState("account");
 *
 * <Wizard step={stepKey} onStepChange={(i, key) => setStepKey(key)}>
 *   <Wizard.Steps>
 *     <Wizard.Step stepKey="account">...</Wizard.Step>
 *     <Wizard.Step stepKey="profile">...</Wizard.Step>
 *   </Wizard.Steps>
 * </Wizard>
 * ```
 *
 * @example Controlled (numeric — backward compatible)
 * ```tsx
 * const [step, setStep] = useState(0);
 *
 * <Wizard step={step} onStepChange={setStep}>
 *   <Wizard.Steps>
 *     <Wizard.Step stepKey="account">...</Wizard.Step>
 *     <Wizard.Step stepKey="profile">...</Wizard.Step>
 *   </Wizard.Steps>
 * </Wizard>
 * ```
 *
 * @example Uncontrolled
 * ```tsx
 * <Wizard defaultStep="account" onStepChange={(i, key) => console.log(key)}>
 *   ...
 * </Wizard>
 * ```
 */
function WizardRoot({
  children,
  className,
  defaultStep = 0,
  labels: labelsProp,
  onActiveStepElementChange,
  onBeforeStepChange,
  onComplete,
  onStepChange: onStepChangeProp,
  previousStepNavigation = "enabled",
  step: stepProp,
}: WizardProps) {
  // Require Wizard.Fullscreen ancestor
  const fullscreenContext = useWizardFullscreen();

  if (process.env.NODE_ENV !== "production" && !fullscreenContext) {
    throw new Error(
      "Wizard must be rendered inside <Wizard.Fullscreen>. " +
        "Wrap your <Wizard> in <Wizard.Fullscreen open> to provide the required fullscreen context.",
    );
  }
  const closeButtonRef = fullscreenContext?.closeButtonRef ?? null;
  const headerContentRef = fullscreenContext?.headerContentRef ?? null;
  const onClose = fullscreenContext?.onClose;

  // Controlled vs uncontrolled step state (stored as number internally)
  const isControlled = stepProp !== undefined;
  const [internalStep, setInternalStep] = useState<number | string>(
    defaultStep,
  );

  const [registeredItems, setRegisteredItems] = useState<
    WizardRegisteredStepItem[]
  >([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeStepFocusable, setActiveStepFocusable] = useState(true);
  const [isChangingStep, setIsChangingStep] = useState(false);
  const currentStepRef = useRef<HTMLDivElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const stepElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const isInitialMount = useRef(true);
  const shouldReduceMotion = useReducedMotion();

  // Merge provided labels with defaults
  const labels = useMemo(
    () => ({ ...DEFAULT_WIZARD_LABELS, ...labelsProp }),
    [labelsProp],
  );

  const items = useMemo<WizardStepItem[]>(
    () =>
      registeredItems.map(
        ({ order: _order, ...registeredItem }) => registeredItem,
      ),
    [registeredItems],
  );

  // Resolve the prop/internal value to a numeric index against the current items
  const rawStep = isControlled ? stepProp : internalStep;
  const step =
    typeof rawStep === "string"
      ? Math.max(0, resolveStepIndex(rawStep, items))
      : rawStep;

  const registerStep = useCallback((item: WizardRegisteredStepItem) => {
    setRegisteredItems((prev) => {
      const exists = prev.some((i) => i.key === item.key);
      const next = exists
        ? prev.map((i) => (i.key === item.key ? item : i))
        : [...prev, item];
      return [...next].sort((a, b) => a.order - b.order);
    });
  }, []);

  const unregisterStep = useCallback((key: string) => {
    setRegisteredItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const totalSteps = items.length;
  const isLastStep = totalSteps > 0 && step >= totalSteps - 1;
  const isFirstStep = step === 0;
  const stepKey = items[step]?.key;
  const isPreviousStepNavigationEnabled = previousStepNavigation === "enabled";

  // Keep a ref to items so commit-time resolution reads the latest set
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Gated step change — runs onBeforeStepChange, then commits
  const handleStepChange = useCallback(
    async (to: number) => {
      if (isChangingStep) return;

      if (onBeforeStepChange) {
        setIsChangingStep(true);
        try {
          const allowed = await onBeforeStepChange(step, to);
          if (!allowed) return;
        } finally {
          setIsChangingStep(false);
        }
      }

      const key = itemsRef.current[to]?.key ?? "";
      if (!isControlled) {
        setInternalStep(to);
      }
      onStepChangeProp?.(to, key);
    },
    [step, isControlled, isChangingStep, onBeforeStepChange, onStepChangeProp],
  );

  // Navigate by step key — resolves at commit time
  const goToStep = useCallback(
    (key: string) => {
      const index = resolveStepIndex(key, itemsRef.current);
      if (index === -1) return;
      void handleStepChange(index);
    },
    [handleStepChange],
  );

  const next = useCallback(() => {
    if (step < itemsRef.current.length - 1) {
      void handleStepChange(step + 1);
    }
  }, [step, handleStepChange]);

  const back = useCallback(() => {
    if (step > 0) {
      void handleStepChange(step - 1);
    }
  }, [step, handleStepChange]);

  // Complete handler — fires onComplete when on the last step
  const complete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  // Close handler — delegates to Wizard.Fullscreen's onClose
  const close = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Sync the current step ref when the DOM updates
  useIsomorphicLayoutEffect(() => {
    const currentStepElement = stepElementsRef.current.get(step) || null;
    currentStepRef.current = currentStepElement;
    onActiveStepElementChange?.(currentStepElement);

    // Reset scroll position so a short step doesn't inherit the previous step's scrollTop
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTop = 0;
    }
  }, [step, stepKey, items, onActiveStepElementChange]);

  const focusStepContainer = useCallback(() => {
    if (currentStepRef.current) {
      currentStepRef.current.focus({ preventScroll: true });
      setActiveStepFocusable(true);
    }
  }, []);

  // Focus first step on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const rafId = requestAnimationFrame(() => {
        focusStepContainer();
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [focusStepContainer]);

  // Reset animation and focus state when navigating between steps
  useEffect(() => {
    if (!isInitialMount.current) {
      setIsAnimating(true);
      setActiveStepFocusable(true);

      if (shouldReduceMotion) {
        setIsAnimating(false);
        focusStepContainer();
      }
    }
  }, [step, shouldReduceMotion, focusStepContainer]);

  // Focus trap
  useEffect(() => {
    const container = modalContainerRef.current;
    if (!container) return;

    const dialogContainer = container.closest('[role="dialog"]') as HTMLElement;
    if (!dialogContainer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const currentStepFocusable =
        currentStepRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
        );

      const stepFocusableElements = currentStepFocusable
        ? Array.from(currentStepFocusable)
        : [];
      const hasStepContent = stepFocusableElements.length > 0;
      const allowedElements: HTMLElement[] = [];

      if (currentStepRef.current && (activeStepFocusable || !hasStepContent)) {
        allowedElements.push(currentStepRef.current);
      }

      allowedElements.push(...stepFocusableElements);

      const previousStepElement = stepElementsRef.current.get(step - 1);
      if (isPreviousStepNavigationEnabled && previousStepElement && step > 0) {
        allowedElements.push(previousStepElement);
      }

      // Include focusable header elements (e.g. theme toggle, close button)
      if (headerContentRef?.current) {
        const headerFocusable =
          headerContentRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
          );
        allowedElements.push(...Array.from(headerFocusable));
      }

      // Add close button only if not already included via header focusables
      if (
        closeButtonRef?.current &&
        !allowedElements.includes(closeButtonRef.current)
      ) {
        allowedElements.push(closeButtonRef.current);
      }

      if (!hasStepContent && allowedElements.length <= 1) {
        return;
      }

      if (allowedElements.length === 0) return;

      e.preventDefault();

      const activeElement = document.activeElement as HTMLElement;
      const currentIndex = allowedElements.indexOf(activeElement);

      if (
        activeElement === currentStepRef.current &&
        activeStepFocusable &&
        hasStepContent
      ) {
        setActiveStepFocusable(false);
      }

      if (e.shiftKey) {
        if (currentIndex <= 0) {
          allowedElements[allowedElements.length - 1].focus();
        } else {
          allowedElements[currentIndex - 1].focus();
        }
      } else {
        if (currentIndex === -1 || currentIndex >= allowedElements.length - 1) {
          allowedElements[0].focus();
        } else {
          allowedElements[currentIndex + 1].focus();
        }
      }
    };

    dialogContainer.addEventListener("keydown", handleKeyDown);
    return () => dialogContainer.removeEventListener("keydown", handleKeyDown);
  }, [
    step,
    activeStepFocusable,
    closeButtonRef,
    headerContentRef,
    isPreviousStepNavigationEnabled,
  ]);

  const contextValue = useMemo<WizardContextValue>(
    () => ({
      activeStepFocusable,
      back,
      close,
      complete,
      currentStepRef,
      goToStep,
      isAnimating,
      isChangingStep,
      isFirstStep,
      isLastStep,
      items,
      labels,
      next,
      onStepChange: handleStepChange,
      previousStepNavigation,
      registerStep,
      setActiveStepFocusable,
      setIsAnimating,
      shouldReduceMotion,
      step,
      stepElementsRef,
      stepKey,
      totalSteps,
      unregisterStep,
    }),
    [
      activeStepFocusable,
      back,
      close,
      complete,
      goToStep,
      handleStepChange,
      isAnimating,
      isChangingStep,
      isFirstStep,
      isLastStep,
      items,
      labels,
      next,
      previousStepNavigation,
      registerStep,
      shouldReduceMotion,
      step,
      stepKey,
      totalSteps,
      unregisterStep,
    ],
  );

  return (
    <WizardContext.Provider value={contextValue}>
      <div
        className={cn(
          "@container relative isolate mx-auto w-full min-h-[calc(100vh-var(--wizard-header-height,0px))] max-w-(--wizard-card-max-width,38rem)",
          className,
        )}
        data-kumo-component="Wizard"
        ref={modalContainerRef}
      >
        {children}
      </div>
    </WizardContext.Provider>
  );
}

WizardRoot.displayName = "Wizard";

export { WizardRoot };
