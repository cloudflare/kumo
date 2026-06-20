import { type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { LayerCard } from "../layer-card";
import { Text } from "../text";
import { ScrollMask } from "./scroll-mask";

/**
 * Card height cap — three-tier formula:
 *  1. Normal viewports: available height - 400px (compact card with comfortable bottom margin).
 *  2. Medium-short: holds at 320px floor so the card doesn't collapse.
 *  3. Very short: ceiling (available - content-top - 2rem) binds, filling available space.
 * Available height subtracts header via --wizard-header-height.
 * The outer min() guarantees the card never overflows past content-top + 2rem.
 */
const DEFAULT_MAX_HEIGHT =
  "min(calc(100vh - var(--wizard-header-height, 0px) - var(--wizard-content-top, 180px) - 2rem), max(calc(100vh - var(--wizard-header-height, 0px) - 400px), 320px))";

export interface WizardPageProps {
  /** Card body content. */
  children: ReactNode;
  /** Additional CSS classes for the card. */
  className?: string;
  /** Description shown below the title. */
  description?: string | ReactNode;
  /** Footer content (e.g., navigation buttons). Rendered outside the primary card surface. */
  footer?: ReactNode;
  /**
   * Raw CSS value for the card's max-height (e.g. `"calc(100vh - 16rem)"`).
   * @default Adaptive formula subtracting --wizard-header-height and --wizard-content-top
   */
  maxHeight?: string;
  /** Card heading text. */
  title?: string;
}

/**
 * Card layout inside a wizard step. Wraps content in a `LayerCard`
 * with optional title, description, scrollable body, and footer.
 *
 * @example
 * ```tsx
 * <Wizard.Page
 *   title="Create your account"
 *   description="Fill in the details below"
 *   footer={
 *     <>
 *       <Button variant="secondary">Back</Button>
 *       <Button>Continue</Button>
 *     </>
 *   }
 * >
 *   <form>...</form>
 * </Wizard.Page>
 * ```
 */
function WizardPage({
  children,
  className,
  description,
  footer,
  maxHeight = DEFAULT_MAX_HEIGHT,
  title,
}: WizardPageProps) {
  return (
    <>
      <LayerCard
        className={cn("relative flex flex-col rounded-xl", className)}
        data-kumo-component="Wizard"
        data-kumo-part="page"
        data-wizard-card=""
        style={{ maxHeight }}
      >
        <LayerCard.Primary className="min-h-0 flex-1 p-0">
          <ScrollMask className="min-h-0">
            <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
              {(title || description) && (
                <div className="flex flex-col gap-1">
                  {title && (
                    <Text as="h2" variant="body" size="lg" bold>
                      {title}
                    </Text>
                  )}
                  {description && (
                    <Text size="sm" variant="secondary">
                      {description}
                    </Text>
                  )}
                </div>
              )}
              {children}
            </div>
          </ScrollMask>
        </LayerCard.Primary>
        {footer && (
          <div className="-my-2 flex shrink-0 items-center justify-between gap-2 py-4 px-2">
            {footer}
          </div>
        )}
      </LayerCard>
    </>
  );
}

WizardPage.displayName = "Wizard.Page";

export { WizardPage };
