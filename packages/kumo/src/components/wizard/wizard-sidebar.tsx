import { cn } from "../../utils/cn";
import { useWizard } from "./wizard";

export interface WizardSidebarProps {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
}

/**
 * Right-side step indicator showing step labels with dot indicators.
 * Reads step info from `WizardContext`. Hidden when the `wizard`
 * container is narrower than `@5xl` (64rem). Does not require `Wizard.Grid`.
 *
 * Steps with `hideFromSidebar: true` are excluded from the list.
 * Completed steps are clickable when `previousStepNavigation` is enabled.
 *
 * @example
 * ```tsx
 * <Wizard step={step} onStepChange={setStep}>
 *   <Wizard.Sidebar />
 *   <Wizard.Steps>...</Wizard.Steps>
 * </Wizard>
 * ```
 */
export function WizardSidebar({ className }: WizardSidebarProps) {
  const { items, step, onStepChange, previousStepNavigation } = useWizard();

  const visibleItems = items.filter((item) => !item.hideFromSidebar);

  return (
    <div
      className={cn(
        "absolute start-full top-(--wizard-content-top,180px) hidden w-max translate-x-5 flex-col rtl:-translate-x-5 @5xl/wizard:flex",
        className,
      )}
      data-kumo-component="Wizard"
      data-kumo-part="sidebar"
    >
      {visibleItems.map((item) => {
        // Find the original index in the full items array
        const originalIndex = items.findIndex((i) => i.key === item.key);
        const isActive = originalIndex === step;
        const isCompleted = originalIndex < step;
        const isClickable = isCompleted && previousStepNavigation === "enabled";

        const isFuture = !isActive && !isCompleted;

        const dotClassName = cn(
          "size-1.5 shrink-0 rounded-full",
          isActive && "bg-kumo-contrast",
          isCompleted && "border border-kumo-interact bg-kumo-interact",
          isFuture && "border border-kumo-interact",
        );

        const label = (
          <span className="whitespace-nowrap text-sm font-medium">
            {item.label}
          </span>
        );

        const sharedClassName = cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-kumo-subtle transition-colors duration-300",
          isActive && "text-kumo-strong",
        );

        if (isClickable) {
          return (
            <button
              className={cn(
                sharedClassName,
                "cursor-pointer hover:bg-kumo-fill-hover",
              )}
              key={item.key}
              onClick={() => onStepChange(originalIndex)}
              type="button"
            >
              <div className={dotClassName} />
              {label}
            </button>
          );
        }

        return (
          <div key={item.key} className={sharedClassName}>
            <div className={dotClassName} />
            {label}
          </div>
        );
      })}
    </div>
  );
}

WizardSidebar.displayName = "Wizard.Sidebar";
