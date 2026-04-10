import {
  type MutableRefObject,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { motion } from "motion/react";
import { SparkleIcon, XIcon } from "@phosphor-icons/react";
import { LayerCard } from "../../components/layer-card";
import { Button } from "../../components/button";
import { Text } from "../../components/text";
import { cn } from "../../utils/cn";
import { KumoPortalProvider } from "../../utils/portal-provider";

// SSR-safe useLayoutEffect - uses useEffect on server, useLayoutEffect on client
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// =============================================================================
// Variants
// =============================================================================

export const KUMO_CREATE_RESOURCE_VARIANTS = {
  size: {
    base: {
      classes: "max-w-[38rem]",
      description: "Default wizard width for most creation flows",
    },
    lg: {
      classes: "max-w-[48rem]",
      description: "Wide wizard for steps with complex content",
    },
  },
} as const;

export const KUMO_CREATE_RESOURCE_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoCreateResourceSize =
  keyof typeof KUMO_CREATE_RESOURCE_VARIANTS.size;

export interface KumoCreateResourceVariantsProps {
  /** Width of the card stack. @default "base" */
  size?: KumoCreateResourceSize;
}

// =============================================================================
// Animation Variants (for motion.dev)
// =============================================================================

const stepVariants = {
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
    y: "210%",
    scale: 1,
    opacity: 0,
    zIndex: 0,
  },
  hidden: {
    y: "300%",
    scale: 1,
    opacity: 0,
    zIndex: -10,
    pointerEvents: "none" as const,
  },
};

const getStepVariant = (index: number, step: number) => {
  if (index === step) return "current";
  if (index === step - 1) return "previous";
  if (index < step - 1) return "beforePrevious";
  return "after";
};

// =============================================================================
// Types
// =============================================================================

export interface CreateResourceStepItem {
  /** Unique identifier for the step */
  key: string;
  /** Label shown in the sidebar navigation */
  label?: string;
  /** The step content (typically a CreateResourceStep) */
  content: ReactNode;
  /** Whether to show an error indicator on this step */
  showError?: boolean;
  /** Hide this step from the sidebar navigation */
  hideFromNavigation?: boolean;
}

export interface CreateResourceProps extends KumoCreateResourceVariantsProps {
  /** Content rendered in the left side of the header bar (e.g., Breadcrumbs) */
  breadcrumbs: ReactNode;
  /** Called when the X button is clicked */
  onClose: () => void;
  /**
   * Called when the "Ask AI" button is clicked.
   * When provided, renders a default "Ask AI" button in the header.
   * For custom header actions, use `headerActions` instead.
   */
  onAskAI?: () => void;
  /** Optional slot between breadcrumbs and close button for custom actions */
  headerActions?: ReactNode;
  /** Current active step index (controlled) */
  step: number;
  /** Called when user navigates to a different step */
  onStepChange: (step: number) => void;
  /** Step definitions */
  steps: CreateResourceStepItem[];
  /** Prevents clicking sidebar/previous steps to navigate back */
  lockNavigation?: boolean;
  /** Hides sidebar + stacked card peek-back interaction */
  hideStepNavigation?: boolean;
  /** Ref to the close button (for external focus management) */
  closeButtonRef?: RefObject<HTMLButtonElement>;
  /** Additional class for the outer container */
  className?: string;
}

// =============================================================================
// CreateResource Component
// =============================================================================

/**
 * Full-page creation wizard with header bar, sidebar navigation, and animated card stack.
 *
 * @example
 * ```tsx
 * <CreateResource
 *   breadcrumbs={<Breadcrumbs>...</Breadcrumbs>}
 *   onClose={handleClose}
 *   step={step}
 *   onStepChange={setStep}
 *   steps={[
 *     { key: 'name', label: 'Name', content: <CreateResourceStep ... /> },
 *     { key: 'config', label: 'Configure', content: <CreateResourceStep ... /> },
 *   ]}
 * />
 * ```
 */
export function CreateResource({
  breadcrumbs,
  onClose,
  onAskAI,
  headerActions,
  step,
  onStepChange,
  steps,
  size = KUMO_CREATE_RESOURCE_DEFAULT_VARIANTS.size,
  lockNavigation = false,
  hideStepNavigation = false,
  closeButtonRef: externalCloseButtonRef,
  className,
}: CreateResourceProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeStepFocusable, setActiveStepFocusable] = useState(true);
  const currentStepRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const internalCloseButtonRef = useRef<HTMLButtonElement>(null);
  const isInitialMount = useRef(true);

  // Check for reduced motion preference (SSR-safe)
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) =>
      setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const mergeCloseButtonRef = useCallback(
    (el: HTMLButtonElement | null) => {
      internalCloseButtonRef.current = el;
      if (externalCloseButtonRef) {
        // Use type assertion since RefObject.current is readonly in types
        // but we need to set it for ref forwarding
        (
          externalCloseButtonRef as MutableRefObject<HTMLButtonElement | null>
        ).current = el;
      }
    },
    [externalCloseButtonRef],
  );

  // Map to store refs for all step elements
  const stepElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  // Stable ref callbacks — same function instance returned for the same index across renders
  const stepRefCallbacksRef = useRef<
    Map<number, (el: HTMLDivElement | null) => void>
  >(new Map());

  // Cleanup refs when component unmounts
  useEffect(() => {
    return () => {
      stepElementsRef.current.clear();
      stepRefCallbacksRef.current.clear();
    };
  }, []);

  // Create a stable ref callback for each step
  const getStepRef = useCallback((index: number) => {
    if (!stepRefCallbacksRef.current.has(index)) {
      stepRefCallbacksRef.current.set(
        index,
        (element: HTMLDivElement | null) => {
          if (element) {
            stepElementsRef.current.set(index, element);
          } else {
            stepElementsRef.current.delete(index);
            stepRefCallbacksRef.current.delete(index);
          }
        },
      );
    }
    return stepRefCallbacksRef.current.get(index)!;
  }, []);

  // Sync refs when step changes
  useIsomorphicLayoutEffect(() => {
    const currentStepElement = stepElementsRef.current.get(step) || null;
    currentStepRef.current = currentStepElement;
  }, [step]);

  const focusStepContainer = useCallback(() => {
    if (currentStepRef.current) {
      currentStepRef.current.focus();
      setActiveStepFocusable(true);
    }
  }, []);

  // Handle initial mount focus
  useEffect(() => {
    if (isInitialMount.current) {
      requestAnimationFrame(() => {
        focusStepContainer();
      });
    }
  }, [focusStepContainer]);

  // Set animating state and reset container focusability when step changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setIsAnimating(true);
    setActiveStepFocusable(true);

    // For reduced motion, immediately complete since there's no animation
    if (shouldReduceMotion) {
      setIsAnimating(false);
      focusStepContainer();
    }
  }, [step, shouldReduceMotion, focusStepContainer]);

  // Handle animation complete - focuses step container after animation completes
  const handleAnimationComplete = useCallback(
    (index: number) => {
      if (index === step) {
        setIsAnimating(false);
        focusStepContainer();
      }
    },
    [step, focusStepContainer],
  );

  // Focus trap: only allow focus on current step children, previous step div, and close button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      // Rebuild focusable elements list on every Tab press to handle dynamic content
      const currentStepFocusableElements =
        currentStepRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([tabindex="-1"]), [href]:not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
        );

      const allowedElements: HTMLElement[] = [];

      // Add active step container if it's still focusable
      if (activeStepFocusable && currentStepRef.current) {
        allowedElements.push(currentStepRef.current);
      }

      // Add current step's focusable children FIRST (so they're focused before close button)
      if (currentStepFocusableElements) {
        allowedElements.push(...Array.from(currentStepFocusableElements));
      }

      // Add previous step div (not its children) for back navigation
      const previousStepElement = stepElementsRef.current.get(step - 1);
      if (previousStepElement && step > 0 && !hideStepNavigation) {
        allowedElements.push(previousStepElement);
      }

      // Add sidebar navigation items (completed clickable steps)
      if (sidebarRef.current && !hideStepNavigation && !lockNavigation) {
        const sidebarItems =
          sidebarRef.current.querySelectorAll<HTMLElement>('[tabindex="0"]');
        allowedElements.push(...Array.from(sidebarItems));
      }

      // Add close button last
      if (internalCloseButtonRef.current) {
        allowedElements.push(internalCloseButtonRef.current);
      }

      // If we have no step content elements, don't trap focus
      const hasStepContent =
        currentStepFocusableElements && currentStepFocusableElements.length > 0;
      const minExpectedElements = step > 0 && !hideStepNavigation ? 2 : 1;

      if (!hasStepContent && allowedElements.length <= minExpectedElements) {
        return;
      }

      if (allowedElements.length === 0) return;

      e.preventDefault();

      const activeElement = document.activeElement as HTMLElement;
      const currentIndex = allowedElements.indexOf(activeElement);

      // If user is tabbing from the step container, remove it from future tab order
      if (activeElement === currentStepRef.current && activeStepFocusable) {
        setActiveStepFocusable(false);
      }

      if (e.shiftKey) {
        // Shift+Tab: go backwards
        if (currentIndex <= 0) {
          allowedElements[allowedElements.length - 1].focus();
        } else {
          allowedElements[currentIndex - 1].focus();
        }
      } else {
        // Tab: go forwards
        if (currentIndex === -1 || currentIndex >= allowedElements.length - 1) {
          allowedElements[0].focus();
        } else {
          allowedElements[currentIndex + 1].focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [step, activeStepFocusable, hideStepNavigation, lockNavigation]);

  return (
    <KumoPortalProvider container={portalContainerRef}>
      <div
        ref={containerRef}
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-kumo-elevated",
          className,
        )}
      >
        {/* Portal container for nested overlays (Select, Dropdown, etc.) */}
        <div
          ref={portalContainerRef}
          className="absolute inset-0 z-50 pointer-events-none"
        />

        {/* Header bar */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-kumo-line bg-kumo-elevated px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center">{breadcrumbs}</div>
          <div className="ml-auto flex items-center gap-1">
            {onAskAI && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAskAI}
                icon={
                  <SparkleIcon
                    weight="fill"
                    className="size-4 text-kumo-subtle"
                  />
                }
              >
                <span className="hidden sm:inline">Ask AI</span>
              </Button>
            )}
            {headerActions}
            {(onAskAI || headerActions) && (
              <div className="mx-1 h-8 w-px bg-kumo-line" aria-hidden="true" />
            )}
            <Button
              ref={mergeCloseButtonRef}
              variant="ghost"
              shape="square"
              size="sm"
              aria-label="Close"
              onClick={onClose}
            >
              <XIcon weight="bold" className="size-4 text-kumo-subtle" />
            </Button>
          </div>
        </header>

        {/* Wizard body */}
        <div className="relative flex flex-1 items-start justify-center overflow-y-auto">
          <div
            className={cn(
              "absolute top-[180px] w-full",
              KUMO_CREATE_RESOURCE_VARIANTS.size[size].classes,
            )}
          >
            {/* Sidebar navigation */}
            {!hideStepNavigation && (
              <nav
                ref={sidebarRef}
                aria-label="Wizard steps"
                className="absolute left-full hidden w-max translate-x-5 flex-col lg:flex"
              >
                {steps
                  .filter((item) => !item.hideFromNavigation)
                  .map((item) => {
                    const originalIndex = steps.findIndex(
                      (s) => s.key === item.key,
                    );
                    const isCompleted = originalIndex < step;
                    const isCurrent = originalIndex === step;
                    const isClickable = isCompleted && !lockNavigation;

                    const sharedClassName = cn(
                      "flex w-full items-center gap-2 rounded-lg py-2 text-kumo-subtle transition-colors duration-300",
                      isCurrent && "text-kumo-default",
                    );

                    const indicator = isCompleted ? (
                      <div className="size-1.5 rounded-full border border-kumo-line bg-kumo-fill" />
                    ) : isCurrent ? (
                      <div className="size-1.5 rounded-full bg-kumo-contrast" />
                    ) : (
                      <div className="size-1.5 rounded-full border border-kumo-line" />
                    );

                    if (isClickable) {
                      return (
                        <button
                          key={item.key}
                          type="button"
                          aria-label={`Go back to ${item.label ?? "previous step"}`}
                          className={cn(
                            sharedClassName,
                            "cursor-pointer hover:bg-kumo-fill-hover",
                          )}
                          onClick={() => onStepChange(originalIndex)}
                        >
                          {indicator}
                          <span className="flex whitespace-nowrap text-sm font-medium">
                            {item.label}
                          </span>
                        </button>
                      );
                    }

                    return (
                      <div
                        key={item.key}
                        aria-current={isCurrent ? "step" : undefined}
                        className={sharedClassName}
                      >
                        {indicator}
                        <span className="flex whitespace-nowrap text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
              </nav>
            )}

            {/* Animated step cards */}
            {steps.map((page, index) => {
              const isCurrentStep = index === step;
              const isPreviousStep = index === step - 1;
              const canNavigateBack =
                isPreviousStep && !hideStepNavigation && !lockNavigation;

              return (
                <motion.div
                  key={page.key}
                  ref={getStepRef(index)}
                  variants={stepVariants}
                  initial={false}
                  animate={
                    hideStepNavigation && !isCurrentStep
                      ? "hidden"
                      : getStepVariant(index, step)
                  }
                  transition={{
                    type: "tween",
                    duration: shouldReduceMotion ? 0 : 0.6,
                    ease: [0.3, 1, 0.35, 1],
                  }}
                  onAnimationComplete={() => handleAnimationComplete(index)}
                  className={cn(
                    "absolute top-0 w-full px-6 pb-8 outline-none",
                    // Hover state for previous step (peek-back interaction)
                    isPreviousStep &&
                      !hideStepNavigation &&
                      !lockNavigation &&
                      "cursor-pointer hover:opacity-100 focus:opacity-100 [&_button,[href]]:pointer-events-none after:pointer-events-none after:absolute after:inset-x-0 after:bottom-8 after:top-0 after:rounded-xl after:ring-1 after:ring-transparent after:transition-all focus-visible:after:ring-kumo-hairline",
                    isAnimating && "animating",
                    // Hide non-active steps when hideStepNavigation is true
                    hideStepNavigation &&
                      !isCurrentStep &&
                      "pointer-events-none invisible",
                  )}
                  tabIndex={
                    isCurrentStep
                      ? activeStepFocusable
                        ? 0
                        : -1
                      : canNavigateBack
                        ? 0
                        : -1
                  }
                  onClick={() => {
                    if (canNavigateBack) {
                      onStepChange(index);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      canNavigateBack &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      onStepChange(index);
                    }
                  }}
                  aria-hidden={
                    hideStepNavigation
                      ? !isCurrentStep
                      : !isCurrentStep && !isPreviousStep
                  }
                  aria-label={
                    canNavigateBack
                      ? `Go back to ${page.label || "previous step"}`
                      : undefined
                  }
                  role={canNavigateBack ? "button" : undefined}
                >
                  {page.content}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </KumoPortalProvider>
  );
}

CreateResource.displayName = "CreateResource";

// =============================================================================
// CreateResourceStep Component
// =============================================================================

export interface CreateResourceStepProps {
  /** Step heading */
  title: string;
  /** Step description text */
  description?: string;
  /** Footer content (typically Back/Next buttons) */
  footer: ReactNode;
  /** Step body content */
  children: ReactNode;
  /** Additional class for the card */
  className?: string;
}

/**
 * Step content card using LayerCard for consistent layout.
 *
 * @example
 * ```tsx
 * <CreateResourceStep
 *   title="Create a tunnel"
 *   description="Give your tunnel a name."
 *   footer={<Button variant="primary">Next</Button>}
 * >
 *   <Input label="Tunnel name" ... />
 * </CreateResourceStep>
 * ```
 */
export function CreateResourceStep({
  title,
  description,
  footer,
  children,
  className,
}: CreateResourceStepProps) {
  return (
    <LayerCard className={cn("max-h-[calc(100vh-350px)]", className)}>
      <LayerCard.Primary className="p-6 gap-4">
        <div className="flex flex-col gap-1.5">
          <Text variant="heading3">{title}</Text>
          {description && (
            <Text variant="secondary" size="sm">
              {description}
            </Text>
          )}
        </div>
        <div className="flex flex-col gap-4">{children}</div>
      </LayerCard.Primary>

      <LayerCard.Secondary className="flex justify-between">
        {footer}
      </LayerCard.Secondary>
    </LayerCard>
  );
}

CreateResourceStep.displayName = "CreateResourceStep";
