import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
import { Text } from "../text/text";
import { cn } from "../../utils/cn";

// =============================================================================
// Variants
// =============================================================================

export const KUMO_STEPPER_VARIANTS = {} as const;

export const KUMO_STEPPER_DEFAULT_VARIANTS = {} as const;

export interface KumoStepperVariantsProps {}

export function stepperVariants(_props: KumoStepperVariantsProps = {}) {
  return cn(
    // LayerDialog frame: inactive steps sit on the elevated gray, and the
    // active step lifts onto a white LayerCard.Primary-style surface.
    "flex w-full flex-col rounded-xl bg-kumo-elevated p-1.5 text-base ring ring-kumo-hairline",
  );
}

// Matches LayerCard.Primary so the active step reads as the focused layer.
const ACTIVE_SURFACE_CLASSES = "bg-kumo-base ring-kumo-fill";

// Ghost hovers need more contrast than `bg-kumo-tint` on the elevated frame.
// Mirrors LayerDialog's dismiss button.
const FRAME_HOVER_CLASSES = "hover:bg-kumo-fill/50";

// =============================================================================
// Context
// =============================================================================

export type StepStatus = "active" | "complete" | "upcoming" | "error";
export type StepperOrientation = "vertical" | "horizontal";
/**
 * Which steps get the white surface. Exploration: pick one, then drop the prop.
 */
export type StepperFill = "active" | "progress";

export interface GoToStepOptions {
  /**
   * Jump past the furthest step reached. Off by default so navigation can't
   * skip a step's `beforeNext` validation.
   */
  force?: boolean;
}

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
  /**
   * Whether the flow has been finished (Next on the last step succeeded).
   * Cleared by navigating to a step or calling `reset`.
   */
  isComplete: boolean;
  /**
   * Jump to a step index. Ignored for steps past `maxStepReached` unless
   * `force` is set; a forced jump counts every earlier step as complete.
   */
  goToStep: (index: number, options?: GoToStepOptions) => void;
  /**
   * Advance to the next step. Optionally awaits `beforeNext` first; if it
   * rejects, the stepper stays on the current step. On the final step this
   * runs `onComplete` and marks the flow complete instead of advancing.
   */
  nextStep: (beforeNext?: () => void | Promise<void>) => Promise<void>;
  /** Return to the previous step (or from `Stepper.Complete` to the last). */
  previousStep: () => void;
  /** Start over: back to `defaultActiveStep` with no steps reached. */
  reset: () => void;
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

type HeaderInfo = {
  label: ReactNode;
  icon?: ReactNode;
  indicator?: ReactNode;
  error?: boolean;
};

interface StepperInternalContextValue {
  /** Header content hoisted from each Step, for the rail, picker, and titles. */
  headers: HeaderInfo[];
  fill: StepperFill;
  /** Last step index inside the white progress fill. */
  fillEnd: number;
  /** Finished and a `Stepper.Complete` is mounted, so it replaces the steps. */
  showCompleteView: boolean;
  /** `Stepper.Complete` registers itself so it works at any depth. */
  registerCompleteView: () => () => void;
}

const StepperInternalContext = createContext<StepperInternalContextValue>({
  headers: [],
  fill: "active",
  fillEnd: 0,
  showCompleteView: false,
  registerCompleteView: () => () => {},
});

// Horizontal panels and `Stepper.Complete` lift direct `Stepper.Footer`
// children out of the white card onto the frame, like LayerDialog's actions.
const FooterPlacementContext = createContext<"panel" | "frame">("panel");

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
  /** `Stepper.Step` children, plus an optional `Stepper.Complete`. */
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
  /**
   * `"active"` lifts only the active step onto white. `"progress"` fills
   * white from the first step through the furthest one reached, so the white
   * grows as the user advances. @default "active"
   */
  fill?: StepperFill;
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
  fill = "active",
  className,
}: StepperRootProps) {
  const [uncontrolledStep, setUncontrolledStep] = useState(defaultActiveStep);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [furthestStep, setFurthestStep] = useState(defaultActiveStep);

  const isControlled = activeStepProp !== undefined;
  const activeStep = isControlled ? activeStepProp : uncontrolledStep;

  // Track the furthest step the user has reached so the nav can gate forward
  // jumps (advancing past it must go through `Next`, which runs validation).
  // Derived during render too, so a just-advanced step never flashes as
  // "upcoming" for the frame before the effect commits.
  useEffect(() => {
    setFurthestStep((m) => Math.max(m, activeStep));
  }, [activeStep]);
  const maxStepReached = Math.max(furthestStep, activeStep);

  // Only count direct Step children toward navigation bounds.
  const steps = useMemo(
    () =>
      Children.toArray(children).filter(
        (child) => isValidElement(child) && child.type === Step,
      ),
    [children],
  );
  const totalSteps = steps.length;

  // Counted rather than detected from `children` so a Stepper.Complete
  // wrapped in the consumer's own component still counts.
  const [completeViews, setCompleteViews] = useState(0);
  const registerCompleteView = useCallback(() => {
    setCompleteViews((n) => n + 1);
    return () => setCompleteViews((n) => n - 1);
  }, []);
  const showCompleteView = isComplete && completeViews > 0;

  const isFirstStep = activeStep <= 0;
  const isLastStep = activeStep >= totalSteps - 1;

  const goToStep = useCallback(
    (index: number, options?: GoToStepOptions) => {
      if (!options?.force && index > maxStepReached) return;
      const clamped = Math.max(0, Math.min(index, totalSteps - 1));
      setIsComplete(false);
      if (!isControlled) setUncontrolledStep(clamped);
      onStepChange?.(clamped);
    },
    [isControlled, maxStepReached, onStepChange, totalSteps],
  );

  const nextStep = useCallback(
    async (beforeNext?: () => void | Promise<void>) => {
      if (isLoading) return;
      // Nothing to await: advance synchronously so Next doesn't flash a
      // loading state for a microtask.
      if (!beforeNext && !(isLastStep && onComplete)) {
        if (isLastStep) setIsComplete(true);
        else goToStep(activeStep + 1, { force: true });
        return;
      }
      try {
        setIsLoading(true);
        try {
          await beforeNext?.();
        } catch {
          // A rejected `beforeNext` is the documented way to stay on this
          // step; the consumer surfaces why via the Step's `error` prop.
          return;
        }
        if (isLastStep) {
          await onComplete?.();
          setIsComplete(true);
        } else {
          goToStep(activeStep + 1, { force: true });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [activeStep, goToStep, isLastStep, isLoading, onComplete],
  );

  const previousStep = useCallback(() => {
    if (isLoading) return;
    // Back from the completion view returns to the last step.
    if (showCompleteView) {
      setIsComplete(false);
      return;
    }
    goToStep(activeStep - 1);
  }, [activeStep, goToStep, isLoading, showCompleteView]);

  const reset = useCallback(() => {
    setIsComplete(false);
    setFurthestStep(defaultActiveStep);
    if (!isControlled) setUncontrolledStep(defaultActiveStep);
    onStepChange?.(defaultActiveStep);
  }, [defaultActiveStep, isControlled, onStepChange]);

  // Pull each step's header content (and its `error` flag) so the horizontal
  // layouts can render it outside the per-step flow.
  const headers = useMemo(
    () =>
      steps.map((child) => {
        const stepProps = (child as ReactElement<StepProps>).props;
        const header: HeaderInfo = { label: null, error: stepProps.error };
        Children.forEach(stepProps.children, (part) => {
          if (isValidElement(part) && part.type === StepHeader) {
            const headerProps = (part as ReactElement<StepHeaderProps>).props;
            header.label = headerProps.children;
            header.icon = headerProps.icon;
            header.indicator = headerProps.indicator;
          }
        });
        return header;
      }),
    [steps],
  );

  const context = useMemo<StepperContextValue>(
    () => ({
      activeStep,
      totalSteps,
      maxStepReached,
      orientation,
      isLoading,
      isFirstStep,
      isLastStep,
      isComplete,
      goToStep,
      nextStep,
      previousStep,
      reset,
    }),
    [
      activeStep,
      totalSteps,
      maxStepReached,
      orientation,
      isLoading,
      isFirstStep,
      isLastStep,
      isComplete,
      goToStep,
      nextStep,
      previousStep,
      reset,
    ],
  );

  // Progress never recedes: jumping back keeps later reached steps white.
  const fillEnd = showCompleteView ? totalSteps - 1 : maxStepReached;

  const internal = useMemo<StepperInternalContextValue>(
    () => ({
      headers,
      fill,
      fillEnd,
      showCompleteView,
      registerCompleteView,
    }),
    [headers, fill, fillEnd, showCompleteView, registerCompleteView],
  );

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
      <StepperInternalContext.Provider value={internal}>
        <div
          data-kumo-component="Stepper"
          data-orientation={orientation}
          data-fill={fill}
          data-complete={showCompleteView || undefined}
          className={cn(stepperVariants(), className)}
        >
          {isHorizontal ? (
            <>
              {/* Desktop: connected rail. Mobile: compact picker. */}
              <StepperRail className="hidden sm:flex" />
              <StepperNav className="flex sm:hidden" />
            </>
          ) : null}
          {renderedChildren}
        </div>
      </StepperInternalContext.Provider>
    </StepperContext.Provider>
  );
}

StepperRoot.displayName = "Stepper.Root";

/**
 * A step is complete once the user has advanced past it, so it keeps its
 * check after they jump back to an earlier step. Every step is complete while
 * `Stepper.Complete` is showing.
 */
function statusFor(
  index: number,
  activeStep: number,
  maxStepReached: number,
  error: boolean | undefined,
  showCompleteView: boolean,
): StepStatus {
  if (error) return "error";
  if (showCompleteView) return "complete";
  if (index === activeStep) return "active";
  return index < maxStepReached ? "complete" : "upcoming";
}

// =============================================================================
// Stepper Rail (horizontal — desktop)
// =============================================================================

/**
 * Connected rail of step nodes for wide viewports: badge + icon + label with a
 * progress line between each. Visited steps are clickable to jump back.
 */
function StepperRail({ className }: { className?: string }) {
  const { activeStep, maxStepReached, goToStep } = useStepper();
  const { headers, fill, fillEnd, showCompleteView } = useContext(
    StepperInternalContext,
  );
  const isProgress = fill === "progress";

  // Progress fill: one white pill behind the rail, measured to end at the
  // furthest reached node so its width can animate as the user advances.
  const railRef = useRef<HTMLOListElement>(null);
  const [fillWidth, setFillWidth] = useState(0);
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!isProgress || !rail) return;
    const measure = () => {
      const node = rail.querySelectorAll<HTMLElement>(
        '[data-kumo-part="rail-step"]',
      )[fillEnd];
      if (!node) return;
      setFillWidth(
        node.getBoundingClientRect().right - rail.getBoundingClientRect().left,
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [isProgress, fillEnd, headers.length]);

  return (
    <ol
      ref={railRef}
      data-kumo-part="rail"
      className={cn(
        "relative m-0 list-none items-center gap-1 p-0 pb-1.5",
        className,
      )}
    >
      {isProgress ? (
        <span
          aria-hidden
          data-kumo-part="rail-fill"
          style={{ width: fillWidth }}
          className={cn(
            "pointer-events-none absolute top-0 bottom-1.5 left-0 rounded-lg ring",
            ACTIVE_SURFACE_CLASSES,
            "transition-[width] duration-300 ease-out motion-reduce:transition-none",
          )}
        />
      ) : null}
      {headers.map((header, i) => {
        const status = statusFor(
          i,
          activeStep,
          maxStepReached,
          header.error,
          showCompleteView,
        );
        const isActive = !showCompleteView && i === activeStep;
        const navigable = i <= maxStepReached && !isActive;
        const isLast = i === headers.length - 1;
        return (
          <li
            key={i}
            className={cn(
              "flex min-w-0 items-center gap-1",
              isLast ? "shrink-0" : "flex-1",
            )}
          >
            <button
              type="button"
              data-kumo-part="rail-step"
              disabled={!navigable}
              aria-current={isActive ? "step" : undefined}
              onClick={() => navigable && goToStep(i)}
              className={cn(
                "relative m-0 flex min-w-0 shrink-0 items-center gap-2 rounded-lg border-none px-2.5 py-1.5 ring",
                "transition-[background-color,box-shadow] duration-200 ease-out",
                // Progress mode: the shared pill is the surface.
                isActive && !isProgress
                  ? ACTIVE_SURFACE_CLASSES
                  : "bg-transparent ring-transparent",
                navigable
                  ? cn("cursor-pointer", FRAME_HOVER_CLASSES)
                  : "cursor-default",
                "focus-visible:ring-2 focus-visible:ring-kumo-info focus-visible:outline-none",
              )}
            >
              {header.indicator ?? <StepIndicator index={i} status={status} />}
              {header.icon ? (
                <span
                  aria-hidden
                  className={cn(
                    "grid size-4 shrink-0 place-items-center [&_svg]:size-4",
                    status === "error"
                      ? "text-kumo-danger"
                      : status === "upcoming"
                        ? "text-kumo-subtle"
                        : "text-kumo-info",
                  )}
                >
                  {header.icon}
                </span>
              ) : null}
              <span
                className={cn(
                  "truncate text-base font-medium",
                  status === "error"
                    ? "text-kumo-danger"
                    : status === "upcoming" ||
                        // Inside the shared white pill, only the active
                        // label stays strong so focus still reads.
                        (isProgress && !isActive)
                      ? "text-kumo-subtle"
                      : "text-kumo-default",
                )}
              >
                {header.label}
              </span>
            </button>
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "relative h-px min-w-3 flex-1 transition-colors",
                  i < maxStepReached ? "bg-kumo-info" : "bg-kumo-line",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

// =============================================================================
// Stepper Nav (horizontal — mobile picker)
// =============================================================================

/**
 * Compact navigation for narrow viewports: ghost prev/next buttons flush left
 * and right flanking a full-width Select that lists every step (jump to any
 * already-visited one).
 */
function StepperNav({ className }: { className?: string }) {
  const {
    activeStep,
    maxStepReached,
    isLoading,
    isFirstStep,
    goToStep,
    previousStep,
  } = useStepper();
  const { headers } = useContext(StepperInternalContext);

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
      className={cn("items-center gap-2 pb-1.5", className)}
    >
      <Button
        shape="square"
        variant="ghost"
        className={FRAME_HOVER_CLASSES}
        icon={CaretLeftIcon}
        aria-label="Previous step"
        disabled={!canPrev}
        onClick={previousStep}
      />
      <div className="min-w-0 flex-1">
        <Select
          aria-label="Go to step"
          className="w-full"
          value={String(activeStep)}
          onValueChange={(v) => {
            if (v != null) goToStep(Number(v));
          }}
          items={items}
        />
      </div>
      <Button
        shape="square"
        variant="ghost"
        className={FRAME_HOVER_CLASSES}
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
  const { activeStep, maxStepReached, totalSteps, orientation } = useStepper();
  const { fill, fillEnd, showCompleteView } = useContext(
    StepperInternalContext,
  );

  const isActive = !showCompleteView && index === activeStep;
  const isFilled = fill === "progress" ? index <= fillEnd : isActive;
  const status = statusFor(
    index,
    activeStep,
    maxStepReached,
    error,
    showCompleteView,
  );

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
        data-filled={isFilled || undefined}
        className={cn(
          // Horizontal: transparent wrapper so header + panel become direct
          // children of the Root's flex rail. Vertical: unfilled steps sit on
          // the gray frame; filled ones lift onto white.
          orientation === "horizontal"
            ? "contents"
            : cn(
                "rounded-lg ring transition-[background-color,box-shadow] duration-200 ease-out",
                isFilled ? ACTIVE_SURFACE_CLASSES : "ring-transparent",
                // Progress fill: adjacent white rows merge into one card, and
                // their overlapping 1px rings read as row dividers.
                fill === "progress" &&
                  isFilled &&
                  cn(
                    "rounded-none",
                    index === 0 && "rounded-t-lg",
                    index === fillEnd && "rounded-b-lg",
                  ),
              ),
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

export interface StepHeaderProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "title"
> {
  /** Title content. */
  children: ReactNode;
  /** Optional leading icon slot (e.g. a Phosphor icon element). */
  icon?: ReactNode;
  /**
   * Allow clicking the header to jump to this step. Any step already reached
   * is navigable by default; set `false` to lock it, or `true` to allow
   * jumping ahead.
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
    const { orientation, maxStepReached, goToStep } = useStepper();

    // In horizontal mode the header is represented by the Root's rail/picker.
    if (orientation === "horizontal") return null;

    const isError = status === "error";
    // Any step already reached is navigable by default, matching the rail:
    // users can go back, then return to where they were without re-running
    // Next.
    const navigable = clickable ?? (index <= maxStepReached && !isActive);

    return (
      <button
        ref={ref}
        type="button"
        disabled={!navigable}
        aria-current={isActive ? "step" : undefined}
        data-kumo-part="header"
        onClick={(event) => {
          onClick?.(event);
          if (navigable) goToStep(index, { force: clickable === true });
        }}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left transition-colors",
          "m-0 border-none bg-transparent",
          navigable
            ? cn("cursor-pointer", FRAME_HOVER_CLASSES)
            : "cursor-default",
          "focus-visible:ring-2 focus-visible:ring-kumo-info focus-visible:outline-none focus-visible:ring-inset",
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
              : status === "upcoming"
                ? "text-kumo-subtle"
                : "text-kumo-default",
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
        "grid size-5 shrink-0 place-items-center rounded-full text-[0.6875rem] font-semibold transition-colors",
        status === "active" &&
          "bg-kumo-info text-kumo-inverse ring-2 ring-kumo-info-tint",
        status === "complete" && "bg-kumo-info text-kumo-inverse",
        // White dot so upcoming steps still read against the gray frame.
        status === "upcoming" &&
          "bg-kumo-base text-kumo-subtle ring ring-kumo-line",
        status === "error" && "bg-kumo-danger-tint text-kumo-danger",
        className,
      )}
    >
      {status === "complete" ? (
        <CheckIcon weight="bold" className="size-3" />
      ) : status === "error" ? (
        <WarningIcon weight="fill" className="size-3" />
      ) : (
        index + 1
      )}
    </span>
  );
}

/** Separate direct `Stepper.Footer` children so they can sit on the frame. */
function splitFooters(children: ReactNode) {
  const parts = Children.toArray(children);
  const footers = parts.filter(
    (part) => isValidElement(part) && part.type === StepperFooter,
  );
  const content = parts.filter((part) => !footers.includes(part));
  return { content, footers };
}

// =============================================================================
// Stepper Panel
// =============================================================================

export type StepPanelProps = ComponentPropsWithoutRef<"div">;

/**
 * Content region for a step. In vertical mode it smoothly collapses via a
 * `grid-template-rows` 0fr → 1fr transition; in horizontal mode the active
 * panel renders as a white card beneath the rail, titled like a LayerDialog,
 * with its direct `Stepper.Footer` lifted onto the frame below.
 */
const StepPanel = forwardRef<HTMLDivElement, StepPanelProps>(function StepPanel(
  { children, className, ...props },
  ref,
) {
  const { index, isActive } = useStep();
  const { orientation, totalSteps } = useStepper();
  const { headers } = useContext(StepperInternalContext);

  if (orientation === "horizontal") {
    const { content, footers } = splitFooters(children);

    // Inactive panels stay mounted (hidden) so uncontrolled fields keep state.
    return (
      <div
        data-kumo-part="panel"
        data-state={isActive ? "open" : "closed"}
        className={cn("flex-col", isActive ? "flex" : "hidden")}
      >
        <div className="rounded-lg bg-kumo-base ring ring-kumo-fill">
          <div className="flex items-baseline justify-between gap-4 px-4 pt-4 pb-3">
            <Text as="h3" variant="heading" DANGEROUS_className="font-medium">
              {headers[index]?.label}
            </Text>
            <Text variant="secondary" DANGEROUS_className="shrink-0">
              Step {index + 1} of {totalSteps}
            </Text>
          </div>
          <div ref={ref} className={cn("px-4 pb-4", className)} {...props}>
            {content}
          </div>
        </div>
        <FooterPlacementContext.Provider value="frame">
          {footers}
        </FooterPlacementContext.Provider>
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
        {/* pt-1/pb-3.5 keeps button shadows & focus rings from being clipped
            by the collapse wrapper's overflow-hidden. */}
        <div
          ref={ref}
          className={cn("px-3.5 pt-1 pb-3.5", className)}
          {...props}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

StepPanel.displayName = "Stepper.Panel";

// =============================================================================
// Stepper Complete
// =============================================================================

export type StepperCompleteProps = ComponentPropsWithoutRef<"div">;

/**
 * Optional completion view, placed inside `Stepper.Root` after the steps. Once `Next` succeeds on
 * the last step it replaces the active panel and every step shows its check.
 * Pair it with a `Stepper.Footer` holding `Stepper.Back` or a button that
 * calls `useStepper().reset`.
 */
const StepperComplete = forwardRef<HTMLDivElement, StepperCompleteProps>(
  function StepperComplete({ children, className, ...props }, ref) {
    const { showCompleteView, registerCompleteView } = useContext(
      StepperInternalContext,
    );
    // Layout effect so the first Finish click already sees the view.
    useLayoutEffect(registerCompleteView, [registerCompleteView]);
    if (!showCompleteView) return null;

    const { content, footers } = splitFooters(children);

    return (
      <div data-kumo-part="complete" className="flex flex-col">
        <div
          ref={ref}
          className={cn(
            "rounded-lg p-4 ring",
            ACTIVE_SURFACE_CLASSES,
            className,
          )}
          {...props}
        >
          {content}
        </div>
        <FooterPlacementContext.Provider value="frame">
          {footers}
        </FooterPlacementContext.Provider>
      </div>
    );
  },
);

StepperComplete.displayName = "Stepper.Complete";

// =============================================================================
// Stepper Footer
// =============================================================================

export type StepperFooterProps = ComponentPropsWithoutRef<"div">;

/**
 * Action row for a step, typically holding `Stepper.Back` and `Stepper.Next`.
 */
function StepperFooter({ children, className, ...props }: StepperFooterProps) {
  const placement = useContext(FooterPlacementContext);
  return (
    <div
      data-kumo-part="footer"
      className={cn(
        "flex items-center justify-between gap-2",
        // On the frame it mirrors LayerDialog.Actions spacing.
        placement === "frame" ? "pt-1.5" : "mt-4",
        className,
      )}
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
  className,
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
      className={cn(variant === "ghost" && FRAME_HOVER_CLASSES, className)}
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
  Complete: StepperComplete,
  Footer: StepperFooter,
  Back: StepperBack,
  Next: StepperNext,
});

export type StepperProps = StepperRootProps;
