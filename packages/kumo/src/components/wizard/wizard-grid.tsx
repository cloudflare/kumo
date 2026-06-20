import { useMemo, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../utils/cn";

// Layout offsets relative to topOffset
const TITLE_OFFSET = 38;
const CONTENT_OFFSET = 33;
const CROSS_INSET = 5;

/** Initial card height before first measurement. */
export const DEFAULT_CARD_HEIGHT = 375.25;
/** Default distance from viewport top to the grid. */
export const DEFAULT_TOP_OFFSET = 147;

const CARD_BORDER_PADDING = 60;
const CARD_FOOTER_SPACING = 54;
const BORDER_Y_OFFSET = 30;

const REFERENCE_HEIGHT = DEFAULT_CARD_HEIGHT + CARD_BORDER_PADDING;

const ANIMATION_DURATION = 0.6;
const ANIMATION_EASING = [0.3, 1, 0.35, 1] as const;

const crossClasses =
  "absolute size-[7px] rounded-[1.5px] bg-kumo-elevated ring-1 ring-kumo-interact";

const CARD_MAX_WIDTH_CLASS = "max-w-[var(--wizard-card-max-width,38rem)]";

export interface WizardGridProps {
  /** Measured height of the active card for border/cross animation. */
  activeCardHeight: number;
  children: ReactNode;
  className?: string;
  /** Whether a step transition is in progress. */
  isTransitioning: boolean;
  /** Title displayed on the left side, visible at `lg` (1024px). */
  title?: string;
  /** Distance from viewport top to the grid. @default 147 */
  topOffset?: number;
}

interface WizardGridInternalProps {
  children: ReactNode;
  className?: string;
  title?: string;
  activeCardHeight: number;
  isTransitioning: boolean;
  shouldReduceMotion: boolean;
  topOffset: number;
}

function WizardGridAnimated({
  activeCardHeight,
  children,
  className,
  isTransitioning,
  shouldReduceMotion,
  title,
  topOffset,
}: WizardGridInternalProps) {
  // Rebased to the adaptive container (topOffset removed — container owns the base offset)
  const bottomCrossTop = useMemo(
    () =>
      activeCardHeight > 0
        ? `${CROSS_INSET + activeCardHeight + CARD_FOOTER_SPACING}px`
        : `${CROSS_INSET + DEFAULT_CARD_HEIGHT + CARD_FOOTER_SPACING}px`,
    [activeCardHeight],
  );

  const animationTransition =
    isTransitioning && !shouldReduceMotion
      ? {
          type: "tween" as const,
          duration: ANIMATION_DURATION,
          ease: ANIMATION_EASING,
        }
      : { duration: 0 };

  return (
    <div
      className={cn(
        "@container/wizard relative flex flex-1 flex-col overflow-hidden bg-kumo-canvas",
        className,
      )}
      style={
        {
          minHeight: `calc(100vh - var(--wizard-header-height, 0px) - ${topOffset}px)`,
          // Adaptive content-top: at normal/tall viewports this equals the fixed topOffset + 33. On short viewports it shrinks toward 56px so the card reclaims the reserved top space instead of collapsing.
          "--wizard-content-top": `max(56px, min(${topOffset + CONTENT_OFFSET}px, calc(100vh - var(--wizard-header-height, 0px) - 280px)))`,
        } as CSSProperties
      }
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-1/2 w-full -translate-x-1/2",
          CARD_MAX_WIDTH_CLASS,
        )}
      >
        <div className="absolute left-[-6px] h-full w-[calc(100%+12px)] border-x border-y-0 border-dashed border-kumo-hairline" />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0"
        style={{
          top: `calc(var(--wizard-content-top, ${topOffset + CONTENT_OFFSET}px) - ${CONTENT_OFFSET}px)`,
        }}
      >
        {title && (
          <div
            className={cn(
              "absolute left-1/2 w-full -translate-x-1/2",
              CARD_MAX_WIDTH_CLASS,
            )}
          >
            <h1
              className="absolute right-[calc(100%+3rem)] hidden text-right text-base font-medium whitespace-nowrap text-kumo-strong @5xl/wizard:block"
              style={{ top: TITLE_OFFSET }}
            >
              {title}
            </h1>
          </div>
        )}
        <div
          className={cn(
            "absolute left-1/2 flex h-[calc(100vh+1000px)] w-full -translate-x-1/2 items-center justify-center",
            CARD_MAX_WIDTH_CLASS,
          )}
        >
          <div className="absolute inset-x-[-9px] top-0 z-10">
            <div className={cn(crossClasses, "left-0")} />
            <div className={cn(crossClasses, "right-0 rotate-90")} />
          </div>

          <motion.div
            animate={{ top: bottomCrossTop }}
            className="absolute inset-x-[-9px] z-10"
            initial={false}
            transition={animationTransition}
          >
            <div className={cn(crossClasses, "left-0 -rotate-90")} />
            <div className={cn(crossClasses, "right-0 rotate-180")} />
          </motion.div>

          <div
            className="absolute left-1/2 w-screen -translate-x-1/2 border-x-0 border-t border-b-0 border-dashed border-kumo-hairline"
            style={{ top: CONTENT_OFFSET - BORDER_Y_OFFSET }}
          />

          <motion.div
            animate={{
              top: `${
                CONTENT_OFFSET -
                BORDER_Y_OFFSET +
                (activeCardHeight > 0
                  ? activeCardHeight + CARD_BORDER_PADDING
                  : REFERENCE_HEIGHT)
              }px`,
            }}
            className="absolute left-1/2 w-screen -translate-x-1/2 border-x-0 border-t border-b-0 border-dashed border-kumo-hairline"
            initial={false}
            transition={animationTransition}
          />
        </div>
      </div>

      {children}
    </div>
  );
}

/**
 * Decorative animated wireframe grid for wizard flows.
 *
 * Renders dashed borders, corner crosses, and an optional left-side title.
 * The bottom border and crosses animate with the active card's measured height.
 *
 * @example
 * ```tsx
 * <Wizard.Grid
 *   activeCardHeight={cardHeight}
 *   isTransitioning={isTransitioning}
 *   title="Create Project"
 * >
 *   <Wizard step={step} onStepChange={setStep}>...</Wizard>
 * </Wizard.Grid>
 * ```
 */
export function WizardGrid({
  activeCardHeight,
  children,
  className,
  isTransitioning,
  title,
  topOffset = DEFAULT_TOP_OFFSET,
}: WizardGridProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <WizardGridAnimated
      activeCardHeight={activeCardHeight}
      className={className}
      isTransitioning={isTransitioning}
      shouldReduceMotion={shouldReduceMotion ?? false}
      title={title}
      topOffset={topOffset}
    >
      {children}
    </WizardGridAnimated>
  );
}

WizardGrid.displayName = "Wizard.Grid";
