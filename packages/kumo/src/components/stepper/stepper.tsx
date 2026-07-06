import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { Button, type ButtonProps } from "../button/button";
import { Select } from "../select/select";
import { cn } from "../../utils/cn";

// =============================================================================
// Variants
// =============================================================================

export const KUMO_STEPPER_VARIANTS = {} as const;

export const KUMO_STEPPER_DEFAULT_VARIANTS = {} as const;

export interface KumoStepperVariantsProps {}

export function stepperVariants(_props: KumoStepperVariantsProps = {}) {
  return cn(
    // Elevated card surface so steps stand off the canvas (not the gray that
    // blends into the background).
    "flex w-full flex-col overflow-hidden rounded-lg bg-kumo-base text-base ring ring-kumo-line",
  );
}

// =============================================================================
// Context
// =============================================================================

type StepStatus = "active" | "complete" | "upcoming" | "error";
export type StepperOrientation = "vertical" | "horizontal";

interface StepperContextValue {
  /** Index of the currently active step. */
  activeStep: number;
  /** Total number of steps registered under the Root. */
  totalSteps: number;
  /** Highest step index the user has reached (for gating forward navigation). */
  maxStepReached: number;
  /** Layout orientation. */
  orientation: StepperOrientation;
  /** Whether an async step transition is currently in flight. */
  isLoading: boolean;
  /** Whether the active step is the first step. */
  isFirstStep: boolean;
  /** Whether the active step is the last step. */
  isLastStep: boolean;
  /** Jump to an arbitrary step index. */
  goToStep: (index: number) => void;
  /**
   * Advance to the next step. Optionally awaits `beforeNext` first; if it
   * rejects, the stepper stays on the current step. On the final step this
   * runs `onComplete` instead of advancing.
   */
  nextStep: (beforeNext?: () => void | Promise<void>) => Promise<void>;
  /** Return to the previous step. */
  previousStep: () => void;
}

const StepperContext = createContext<StepperContextValue | null>(null);

/**
 * Access stepper state and navigation from anywhere inside `Stepper.Root`.
 * Useful for building custom navigation controls or progress indicators.
 *
 * @example
 * ```tsx
 * function ProgressLabel() {
 *   const { activeStep, totalSteps } = useStepper();
 *   return <Text>Step {activeStep + 1} of {totalSteps}</Text>;
 * }
 * ```
 */
export function useStepper(): StepperContextValue {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a <Stepper.Root>.");
  }
  return context;
}

// Root injects each step's index; Step derives the rest so it can layer in its
// own `error` prop.
const StepIndexContext = createContext<number>(0);

interface StepContextValue {
  index: number;
  status: StepStatus;
  isActive: boolean;
  isLast: boolean;
}

const StepContext = createContext<StepContextValue | null>(null);

/**
 * Access the surrounding step's index and status. Available to anything
 * rendered inside a `Stepper.Step`.
 */
export function useStep(): StepContextValue {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error("useStep must be used within a <Stepper.Step>.");
  }
  return context;
}

// =============================================================================
// Stepper Root
// =============================================================================

export interface StepperRootProps {
  /** `Stepper.Step` children. */
  children: ReactNode;
  /** Layout orientation. @default "vertical" */
  orientation?: StepperOrientation;
  /** Controlled active step index. */
  activeStep?: number;
  /** Initial active step index for uncontrolled usage. @default 0 */
  defaultActiveStep?: number;
  /** Called whenever the active step changes. */
  onStepChange?: (index: number) => void;
  /** Called when `Next` is pressed on the final step (after `beforeNext`). */
  onComplete?: () => void | Promise<void>;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * Root that owns wizard state and lays steps out as a layered card. Vertical
 * (default) stacks steps as an accordion; horizontal renders the headers as a
 * top rail with the active step's panel below.
 *
 * @example
 * ```tsx
 * <Stepper.Root onComplete={submit}>
 *   <Stepper.Step>
 *     <Stepper.Header icon={<UserIcon />}>Account</Stepper.Header>
 *     <Stepper.Panel>
 *       …fields…
 *       <Stepper.Footer>
 *         <Stepper.Back />
 *         <Stepper.Next>Continue</Stepper.Next>
 *       </Stepper.Footer>
 *     </Stepper.Panel>
 *   </Stepper.Step>
 * </Stepper.Root>
 * ```
 */
function StepperRoot({
  children,
  orientation = "vertical",
  activeStep: activeStepProp,
  defaultActiveStep = 0,
  onStepChange,
  onComplete,
  className,
}: StepperRootProps) {
  const [uncontrolledStep, setUncontrolledStep] = useState(defaultActiveStep);
  const [isLoading, setIsLoading] = useState(false);
  const [maxStepReached, setMaxStepReached] = useState(defaultActiveStep);

  const isControlled = activeStepProp !== undefined;
  const activeStep = isControlled ? activeStepProp : uncontrolledStep;

  // Track the furthest step the user has reached so the nav can gate forward
  // jumps (advancing past it must go through `Next`, which runs validation).
  useEffect(() => {
    setMaxStepReached((m) => Math.max(m, activeStep));
  }, [activeStep]);

  // Only count direct Step children toward navigation bounds.
  const steps = useMemo(
    () =>
      Children.toArray(children).filter(
        (child) => isValidElement(child) && child.type === Step,
      ),
    [children],
  );
  const totalSteps = steps.length;

  const isFirstStep = activeStep <= 0;
  const isLastStep = activeStep >= totalSteps - 1;

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalSteps - 1));
      if (!isControlled) setUncontrolledStep(clamped);
      onStepChange?.(clamped);
    },
    [isControlled, onStepChange, totalSteps],
  );

  const nextStep = useCallback(
    async (beforeNext?: () => void | Promise<void>) => {
      if (isLoading) return;
      try {
        setIsLoading(true);
        await beforeNext?.();
        if (isLastStep) {
          await onComplete?.();
        } else {
          goToStep(activeStep + 1);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [activeStep, goToStep, isLastStep, isLoading, onComplete],
  );

  const previousStep = useCallback(() => {
    if (isLoading) return;
    goToStep(activeStep - 1);
  }, [activeStep, goToStep, isLoading]);

  const context = useMemo<StepperContextValue>(
    () => ({
      activeStep,
      totalSteps,
      maxStepReached,
      orientation,
      isLoading,
      isFirstStep,
      isLastStep,
      goToStep,
      nextStep,
      previousStep,
    }),
    [
      activeStep,
      totalSteps,
      maxStepReached,
      orientation,
      isLoading,
      isFirstStep,
      isLastStep,
      goToStep,
      nextStep,
      previousStep,
    ],
  );

  // Pull each step's header content so the horizontal layouts (desktop rail +
  // mobile picker) can render it outside the per-step flow.
  const stepHeaders = useMemo(() => {
    const headers: { label: ReactNode; icon?: ReactNode }[] = [];
    Children.forEach(children, (child) => {
      if (!isValidElement(child) || child.type !== Step) return;
      const stepChildren = (child as ReactElement<{ children?: ReactNode }>)
        .props.children;
      let header: { label: ReactNode; icon?: ReactNode } = { label: null };
      Children.forEach(stepChildren, (part) => {
        if (isValidElement(part) && part.type === StepHeader) {
          const headerProps = (
            part as ReactElement<{ children?: ReactNode; icon?: ReactNode }>
          ).props;
          header = { label: headerProps.children, icon: headerProps.icon };
        }
      });
      headers.push(header);
    });
    return headers;
  }, [children]);

  // Assign each Step a stable index (composition-friendly: Steps don't need an
  // explicit `index` prop).
  let stepIndex = -1;
  const renderedChildren = Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== Step) return child;
    stepIndex += 1;
    const index = stepIndex;
    return (
      <StepIndexContext.Provider value={index}>
        {child}
      </StepIndexContext.Provider>
    );
  });

  const isHorizontal = orientation === "horizontal";

  return (
    <StepperContext.Provider value={context}>
      <div
        data-kumo-component="Stepper"
        data-orientation={orientation}
        className={cn(
          stepperVariants(),
          !isHorizontal && "divide-y divide-kumo-line",
          className,
        )}
      >
        {isHorizontal ? (
          <>
            {/* Desktop: connected rail. Mobile: compact picker. */}
            <StepperRail headers={stepHeaders} className="hidden sm:flex" />
            <StepperNav headers={stepHeaders} className="flex sm:hidden" />
          </>
        ) : null}
        {renderedChildren}
      </div>
    </StepperContext.Provider>
  );
}

StepperRoot.displayName = "Stepper.Root";

type HeaderInfo = { label: ReactNode; icon?: ReactNode };

function statusFor(index: number, activeStep: number): StepStatus {
  return index === activeStep
    ? "active"
    : index < activeStep
      ? "complete"
      : "upcoming";
}

// =============================================================================
// Stepper Rail (horizontal — desktop)
// =============================================================================

/**
 * Connected rail of step nodes for wide viewports: badge + icon + label with a
 * progress line between each. Visited steps are clickable to jump back.
 */
function StepperRail({
  headers,
  className,
}: {
  headers: HeaderInfo[];
  className?: string;
}) {
  const { activeStep, maxStepReached, goToStep } = useStepper();

  return (
    <div
      data-kumo-part="rail"
      className={cn("items-center gap-2 border-b border-kumo-line px-2", className)}
    >
      {headers.map((header, i) => {
        const status = statusFor(i, activeStep);
        const navigable = i <= maxStepReached && i !== activeStep;
        const isLast = i === headers.length - 1;
        return (
          <div key={i} className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!navigable}
              aria-current={status === "active" ? "step" : undefined}
              onClick={() => navigable && goToStep(i)}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-md px-2 py-2.5 transition-colors",
                "m-0 border-none bg-transparent",
                navigable
                  ? "cursor-pointer hover:bg-kumo-tint"
                  : "cursor-default",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-info",
              )}
            >
              <StepIndicator index={i} status={status} />
              {header.icon ? (
                <span
                  aria-hidden
                  className={cn(
                    "grid size-5 shrink-0 place-items-center [&_svg]:size-5",
                    status === "upcoming" ? "text-kumo-subtle" : "text-kumo-info",
                  )}
                >
                  {header.icon}
                </span>
              ) : null}
              <span
                className={cn(
                  "truncate text-base font-medium",
                  status === "active"
                    ? "text-kumo-default"
                    : "text-kumo-subtle",
                )}
              >
                {header.label}
              </span>
            </button>
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1 transition-colors",
                  status === "complete" ? "bg-kumo-info" : "bg-kumo-line",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Stepper Nav (horizontal — mobile picker)
// =============================================================================

/**
 * Compact navigation for narrow viewports: prev/next buttons flanking a Select
 * that lists every step (jump to any already-visited one).
 */
function StepperNav({
  headers,
  className,
}: {
  headers: HeaderInfo[];
  className?: string;
}) {
  const {
    activeStep,
    maxStepReached,
    isLoading,
    isFirstStep,
    goToStep,
    previousStep,
  } = useStepper();

  const items = headers.map((header, i) => ({
    label: header.label,
    value: String(i),
    // Steps past the furthest reached require Next (so validation isn't skipped).
    disabled: i > maxStepReached,
  }));

  const canPrev = !isFirstStep && !isLoading;
  const canNext = activeStep < maxStepReached && !isLoading;

  return (
    <div
      data-kumo-part="nav"
      className={cn("items-center gap-2 border-b border-kumo-line p-2", className)}
    >
      <Button
        shape="square"
        variant="secondary"
        icon={CaretLeftIcon}
        aria-label="Previous step"
        disabled={!canPrev}
        onClick={previousStep}
      />
      <Select
        aria-label="Go to step"
        className="min-w-0 flex-1"
        value={String(activeStep)}
        onValueChange={(v) => {
          if (v != null) goToStep(Number(v));
        }}
        items={items}
      />
      <Button
        shape="square"
        variant="secondary"
        icon={CaretRightIcon}
        aria-label="Next step"
        disabled={!canNext}
        onClick={() => goToStep(activeStep + 1)}
      />
    </div>
  );
}

// =============================================================================
// Stepper Step
// =============================================================================

export interface StepProps extends ComponentPropsWithoutRef<"div"> {
  /** Mark this step as errored (e.g. failed validation). Renders red. */
  error?: boolean;
}

/**
 * A single step. Compose a `Stepper.Header` (always visible) and a
 * `Stepper.Panel` (revealed when active) inside it. In horizontal mode the
 * Step is layout-transparent so headers and panels flow into the Root's rail.
 */
const Step = forwardRef<HTMLDivElement, StepProps>(function Step(
  { children, className, error = false, ...props },
  ref,
) {
  const index = useContext(StepIndexContext);
  const { activeStep, totalSteps, orientation } = useStepper();

  const isActive = index === activeStep;
  const baseStatus: StepStatus = isActive
    ? "active"
    : index < activeStep
      ? "complete"
      : "upcoming";
  const status: StepStatus = error ? "error" : baseStatus;

  const stepContext = useMemo<StepContextValue>(
    () => ({ index, status, isActive, isLast: index === totalSteps - 1 }),
    [index, status, isActive, totalSteps],
  );

  return (
    <StepContext.Provider value={stepContext}>
      <div
        ref={ref}
        data-kumo-component="Stepper"
        data-kumo-part="step"
        data-status={status}
        className={cn(
          // Horizontal: transparent wrapper so header + panel become direct
          // children of the Root's flex rail.
          orientation === "horizontal" ? "contents" : "bg-kumo-base",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </StepContext.Provider>
  );
});

Step.displayName = "Stepper.Step";

// =============================================================================
// Stepper Header
// =============================================================================

export interface StepHeaderProps
  extends Omit<ComponentPropsWithoutRef<"button">, "title"> {
  /** Title content. */
  children: ReactNode;
  /** Optional leading icon slot (e.g. a Phosphor icon element). */
  icon?: ReactNode;
  /**
   * Allow clicking the header to jump to this step. Completed steps are
   * navigable by default (so users can go back); set `false` to lock them.
   */
  clickable?: boolean;
  /**
   * Override the status indicator. Defaults to an automatic number / check /
   * warning badge derived from step state.
   */
  indicator?: ReactNode;
}

/**
 * Always-visible header for a step: a status badge, optional icon, and title.
 * In horizontal mode it becomes a connected rail node.
 */
const StepHeader = forwardRef<HTMLButtonElement, StepHeaderProps>(
  function StepHeader(
    { children, icon, clickable, indicator, className, onClick, ...props },
    ref,
  ) {
    const { index, status, isActive } = useStep();
    const { orientation, goToStep } = useStepper();

    // In horizontal mode the header is represented by the Root's nav Select.
    if (orientation === "horizontal") return null;

    const isError = status === "error";
    // Completed steps are navigable by default so users can go back.
    const navigable = clickable ?? status === "complete";

    return (
      <button
        ref={ref}
        type="button"
        disabled={!navigable}
        aria-current={isActive ? "step" : undefined}
        data-kumo-part="header"
        onClick={(event) => {
          onClick?.(event);
          if (navigable) goToStep(index);
        }}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
          "m-0 border-none bg-transparent",
          navigable ? "cursor-pointer hover:bg-kumo-tint" : "cursor-default",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-info",
          className,
        )}
        {...props}
      >
        {icon ? (
          <span
            aria-hidden
            className={cn(
              "grid size-5 shrink-0 place-items-center transition-colors [&_svg]:size-5",
              isError
                ? "text-kumo-danger"
                : status === "upcoming"
                  ? "text-kumo-subtle"
                  : "text-kumo-info",
            )}
          >
            {icon}
          </span>
        ) : null}
        <span
          className={cn(
            "flex-1 text-base font-medium transition-colors",
            isError
              ? "text-kumo-danger"
              : isActive
                ? "text-kumo-default"
                : "text-kumo-subtle",
          )}
        >
          {children}
        </span>
        {indicator ?? <StepIndicator index={index} status={status} />}
      </button>
    );
  },
);

StepHeader.displayName = "Stepper.Header";

// =============================================================================
// Step Indicator (status badge)
// =============================================================================

export interface StepIndicatorProps {
  index: number;
  status: StepStatus;
  className?: string;
}

/** The numbered / check / warning status badge shown alongside a header. */
function StepIndicator({ index, status, className }: StepIndicatorProps) {
  return (
    <span
      aria-hidden
      data-kumo-part="indicator"
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors",
        status === "active" &&
          "bg-kumo-info text-kumo-inverse ring-2 ring-kumo-info-tint",
        status === "complete" && "bg-kumo-info text-kumo-inverse",
        status === "upcoming" && "bg-kumo-fill text-kumo-subtle",
        status === "error" && "bg-kumo-danger-tint text-kumo-danger",
        className,
      )}
    >
      {status === "complete" ? (
        <CheckIcon weight="bold" className="size-3.5" />
      ) : status === "error" ? (
        <WarningIcon weight="fill" className="size-3.5" />
      ) : (
        index + 1
      )}
    </span>
  );
}

// =============================================================================
// Stepper Panel
// =============================================================================

export type StepPanelProps = ComponentPropsWithoutRef<"div">;

/**
 * Content region for a step. In vertical mode it smoothly collapses via a
 * `grid-template-rows` 0fr → 1fr transition; in horizontal mode it renders as a
 * full-width band beneath the rail when its step is active.
 */
const StepPanel = forwardRef<HTMLDivElement, StepPanelProps>(function StepPanel(
  { children, className, ...props },
  ref,
) {
  const { isActive } = useStep();
  const { orientation } = useStepper();

  if (orientation === "horizontal") {
    // Only the active step's panel renders, as a band beneath the nav.
    return (
      <div
        data-kumo-part="panel"
        data-state={isActive ? "open" : "closed"}
        className={cn(!isActive && "hidden")}
      >
        <div ref={ref} className={cn("px-4 py-5", className)} {...props}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      data-kumo-part="panel"
      data-state={isActive ? "open" : "closed"}
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="overflow-hidden">
        {/* pt-1/pb-5 keeps button shadows & focus rings from being clipped by
            the collapse wrapper's overflow-hidden. */}
        <div ref={ref} className={cn("px-4 pt-1 pb-5", className)} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
});

StepPanel.displayName = "Stepper.Panel";

// =============================================================================
// Stepper Footer
// =============================================================================

export type StepperFooterProps = ComponentPropsWithoutRef<"div">;

/**
 * Action row for a step, typically holding `Stepper.Back` and `Stepper.Next`.
 */
function StepperFooter({ children, className, ...props }: StepperFooterProps) {
  return (
    <div
      data-kumo-part="footer"
      className={cn("mt-4 flex items-center justify-between gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

StepperFooter.displayName = "Stepper.Footer";

// =============================================================================
// Stepper Back
// =============================================================================

export type StepperBackProps = Omit<ButtonProps, "onClick"> & {
  /** Hide instead of disable when on the first step. @default false */
  hideOnFirst?: boolean;
};

/**
 * Returns to the previous step. Disabled (or hidden) on the first step.
 */
function StepperBack({
  children = "Back",
  variant = "ghost",
  hideOnFirst = false,
  disabled,
  ...props
}: StepperBackProps) {
  const { previousStep, isFirstStep, isLoading } = useStepper();

  // Keep the footer's justify-between layout balanced when hidden.
  if (hideOnFirst && isFirstStep) return <span aria-hidden />;

  return (
    <Button
      variant={variant}
      onClick={previousStep}
      disabled={disabled ?? (isFirstStep || isLoading)}
      {...(props as ButtonProps)}
    >
      {children}
    </Button>
  );
}

StepperBack.displayName = "Stepper.Back";

// =============================================================================
// Stepper Next
// =============================================================================

export type StepperNextProps = Omit<ButtonProps, "onClick"> & {
  /**
   * Async (or sync) work to run before advancing — e.g. validation or a save.
   * If it throws, the stepper stays on the current step. The button shows a
   * loading state while it runs.
   */
  beforeNext?: () => void | Promise<void>;
  /** Label shown on the final step. @default "Finish" */
  finishLabel?: ReactNode;
};

/**
 * Advances to the next step, awaiting `beforeNext` first. On the last step it
 * triggers the Root's `onComplete` and renders `finishLabel`.
 */
function StepperNext({
  children = "Next",
  finishLabel = "Finish",
  variant = "primary",
  beforeNext,
  disabled,
  ...props
}: StepperNextProps) {
  const { nextStep, isLastStep, isLoading } = useStepper();

  return (
    <Button
      variant={variant}
      loading={isLoading}
      disabled={disabled}
      onClick={() => {
        void nextStep(beforeNext);
      }}
      {...(props as ButtonProps)}
    >
      {isLastStep ? finishLabel : children}
    </Button>
  );
}

StepperNext.displayName = "Stepper.Next";

// =============================================================================
// Compound Component Export
// =============================================================================

/**
 * Stepper — a layered wizard for multi-step forms and flows, in vertical
 * (accordion) or horizontal (rail) orientation.
 *
 * Built around a small internal state machine with first-class support for
 * async transitions (validation, saves), error states, and clear back
 * affordances. Favors composition: assemble `Header`, `Panel`, and `Footer`
 * parts inside each `Step` rather than configuring it through a wall of props.
 *
 * ```tsx
 * <Stepper.Root orientation="horizontal" onComplete={submit}>
 *   <Stepper.Step error={hasError}>
 *     <Stepper.Header icon={<BuildingsIcon />}>Details</Stepper.Header>
 *     <Stepper.Panel>
 *       …content…
 *       <Stepper.Footer>
 *         <Stepper.Back hideOnFirst />
 *         <Stepper.Next beforeNext={validate}>Continue</Stepper.Next>
 *       </Stepper.Footer>
 *     </Stepper.Panel>
 *   </Stepper.Step>
 * </Stepper.Root>
 * ```
 */
export const Stepper = Object.assign(StepperRoot, {
  Root: StepperRoot,
  Step,
  Header: StepHeader,
  Indicator: StepIndicator,
  Panel: StepPanel,
  Footer: StepperFooter,
  Back: StepperBack,
  Next: StepperNext,
});

export type StepperProps = StepperRootProps;
