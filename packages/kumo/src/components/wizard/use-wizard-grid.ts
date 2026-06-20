import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_CARD_HEIGHT } from "./wizard-grid";

const TRANSITION_TIMEOUT = 500; // Duration to keep isTransitioning true
const MEASURE_DELAY = 50; // Delay before first measurement to allow content render

interface UseWizardGridOptions {
  initialHeight?: number;
}

export interface UseWizardGridReturn {
  gridProps: {
    activeCardHeight: number;
    isTransitioning: boolean;
  };
  onActiveStepElementChange: (element: HTMLDivElement | null) => void;
}

/**
 * Bridges the Wizard and Wizard.Grid components by tracking the active step
 * card's height via ResizeObserver and managing transition state.
 *
 * Returns `gridProps` to spread onto `<Wizard.Grid>` and an
 * `onActiveStepElementChange` callback for step element tracking.
 *
 * @param options.initialHeight - Initial height before first measurement (default: DEFAULT_CARD_HEIGHT)
 *
 * @example
 * ```tsx
 * const { gridProps, onActiveStepElementChange } = useWizardGrid();
 *
 * <Wizard.Grid {...gridProps}>
 *   <Wizard
 *     step={step}
 *     onStepChange={setStep}
 *     onActiveStepElementChange={onActiveStepElementChange}
 *   >
 *     <Wizard.Steps>...</Wizard.Steps>
 *   </Wizard>
 * </Wizard.Grid>
 * ```
 */
export function useWizardGrid(
  options: UseWizardGridOptions = {},
): UseWizardGridReturn {
  const { initialHeight = DEFAULT_CARD_HEIGHT } = options;

  const [activeCardHeight, setActiveCardHeight] = useState(initialHeight);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentElementRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true);
  const measureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure the [data-wizard-card] element's height inside the active step
  const measureActiveCard = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      const activeCard =
        element.querySelector("[data-wizard-card]") ||
        element.querySelector(":scope > div");
      if (activeCard instanceof HTMLElement) {
        const height = activeCard.offsetHeight;
        if (height > 0) {
          setActiveCardHeight(height);
        }
      }
    }
  }, []);

  const onActiveStepElementChange = useCallback(
    (element: HTMLDivElement | null) => {
      currentElementRef.current = element;

      // Clean up previous observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      // Track transitions (skip initial mount)
      if (isInitialMount.current) {
        isInitialMount.current = false;
      } else {
        setIsTransitioning(true);
        if (transitionTimerRef.current)
          clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = setTimeout(
          () => setIsTransitioning(false),
          TRANSITION_TIMEOUT,
        );
      }

      if (element) {
        // Measure with a small delay to allow content to render
        if (measureTimerRef.current) clearTimeout(measureTimerRef.current);
        measureTimerRef.current = setTimeout(() => {
          if (currentElementRef.current === element) {
            measureActiveCard(element);
          }
        }, MEASURE_DELAY);

        // Set up ResizeObserver on the card element
        const cardElement =
          element.querySelector("[data-wizard-card]") ||
          element.querySelector(":scope > div");
        if (cardElement instanceof HTMLElement) {
          const observer = new ResizeObserver(() => {
            if (currentElementRef.current === element) {
              measureActiveCard(element);
            }
          });
          observer.observe(cardElement);
          resizeObserverRef.current = observer;
        }
      }
    },
    [measureActiveCard],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      if (measureTimerRef.current) {
        clearTimeout(measureTimerRef.current);
      }
    };
  }, []);

  return {
    gridProps: {
      activeCardHeight,
      isTransitioning,
    },
    onActiveStepElementChange,
  };
}
