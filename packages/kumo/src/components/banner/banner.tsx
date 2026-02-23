import { type ReactNode, isValidElement, forwardRef } from "react";
import { cn } from "../../utils/cn";

/** Base styles applied to all banner variants. */
export const KUMO_BANNER_BASE_STYLES =
  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-base";

/** Banner variant definitions mapping variant names to their Tailwind classes and descriptions. */
export const KUMO_BANNER_VARIANTS = {
  variant: {
    default: {
      classes:
        "bg-kumo-info/10 border-kumo-info/30 text-kumo-info selection:bg-kumo-info-tint",
      iconClasses: "text-kumo-info",
      description: "Informational banner for general messages",
    },
    alert: {
      classes:
        "bg-kumo-warning/10 border-kumo-warning/30 text-kumo-warning selection:bg-kumo-warning-tint",
      iconClasses: "text-kumo-warning",
      description: "Warning banner for cautionary messages",
    },
    error: {
      classes:
        "bg-kumo-danger/10 border-kumo-danger/30 text-kumo-danger selection:bg-kumo-danger-tint",
      iconClasses: "text-kumo-danger",
      description: "Error banner for critical issues",
    },
  },
} as const;

export const KUMO_BANNER_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

// Derived types from KUMO_BANNER_VARIANTS
export type KumoBannerVariant = keyof typeof KUMO_BANNER_VARIANTS.variant;

export interface KumoBannerVariantsProps {
  /**
   * Visual style of the banner.
   * - `"default"` — Informational banner for general messages
   * - `"alert"` — Warning banner for cautionary messages
   * - `"error"` — Error banner for critical issues
   * @default "default"
   */
  variant?: KumoBannerVariant;
}

export function bannerVariants({
  variant = KUMO_BANNER_DEFAULT_VARIANTS.variant,
}: KumoBannerVariantsProps = {}) {
  return cn(
    // Base styles (exported as KUMO_BANNER_BASE_STYLES for Figma plugin)
    KUMO_BANNER_BASE_STYLES,
    // Apply variant styles from KUMO_BANNER_VARIANTS
    KUMO_BANNER_VARIANTS.variant[variant].classes,
  );
}

// Legacy enum for backwards compatibility
export enum BannerVariant {
  DEFAULT,
  ALERT,
  ERROR,
}

/**
 * Banner component props.
 *
 * @example
 * ```tsx
 * <Banner title="Update available" description="A new version is ready to install." />
 * <Banner variant="alert" title="Session expiring" description="Your session will expire soon." />
 * <Banner variant="error" title="Save failed" description="We couldn't save your changes." />
 * ```
 */
export interface BannerProps {
  /** Icon element rendered before the banner content (e.g. from `@phosphor-icons/react`). */
  icon?: ReactNode;
  /** Primary heading text for the banner. Use for i18n string injection. */
  title?: string;
  /** Secondary description text displayed below the title. Use for i18n string injection. */
  description?: ReactNode;
  /** @deprecated Use `title` and `description` instead. Will be removed in a future major version. */
  text?: string;
  /** @deprecated Use `title` and `description` instead for better i18n support. */
  children?: ReactNode;
  /**
   * Visual style of the banner.
   * - `"default"` — Informational blue banner for general messages
   * - `"alert"` — Warning yellow banner for cautionary messages
   * - `"error"` — Error red banner for critical issues
   * @default "default"
   */
  variant?: KumoBannerVariant;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
}

/**
 * Full-width message bar for informational, warning, or error notices.
 * Supports structured title/description for i18n, or simple children for basic usage.
 *
 * @example
 * ```tsx
 * // Structured (recommended for i18n)
 * <Banner
 *   variant="alert"
 *   icon={<WarningCircle />}
 *   title="Review required"
 *   description="Please review your billing information."
 * />
 *
 * // Simple (backwards compatible)
 * <Banner variant="alert" icon={<WarningCircle />}>
 *   Review your billing information.
 * </Banner>
 * ```
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    icon,
    title,
    description,
    children,
    text,
    variant = KUMO_BANNER_DEFAULT_VARIANTS.variant,
    className,
  },
  ref,
) {
  const variantConfig = KUMO_BANNER_VARIANTS.variant[variant];

  // Structured mode: title and/or description provided
  if (title || description) {
    return (
      <div ref={ref} className={cn(bannerVariants({ variant }), className)}>
        {icon && (
          <span
            className={cn(
              "shrink-0 flex items-center h-[1.375em]",
              variantConfig.iconClasses,
            )}
          >
            {icon}
          </span>
        )}
        <div className="flex flex-col gap-0.5">
          {title && <p className="font-medium leading-snug">{title}</p>}
          {description && (
            <div className="text-sm leading-snug">
              {isValidElement(description) ? description : <p>{description}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Legacy mode: children or text prop
  const value = children ?? text;
  const content = isValidElement(value) ? value : <p>{value}</p>;

  return (
    <div ref={ref} className={cn(bannerVariants({ variant }), className)}>
      {icon && (
        <span className={cn("shrink-0", variantConfig.iconClasses)}>
          {icon}
        </span>
      )}
      {content}
    </div>
  );
});

Banner.displayName = "Banner";
