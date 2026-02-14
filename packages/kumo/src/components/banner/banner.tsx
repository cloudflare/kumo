import { type ReactNode, isValidElement } from "react";
import { cn } from "../../utils/cn";

/** Base styles applied to all banner variants. */
export const KUMO_BANNER_BASE_STYLES =
  "flex w-full items-center gap-2 rounded-lg border px-4 py-1.5 text-base";

/** Banner variant definitions mapping variant names to their Tailwind classes and descriptions. */
export const KUMO_BANNER_VARIANTS = {
  variant: {
    default: {
      classes: "bg-kumo-info/20 border-kumo-info text-kumo-link selection:bg-kumo-info-tint",
      description: "Informational banner for general messages",
    },
    alert: {
      classes:
        "bg-kumo-warning/20 border-kumo-warning text-kumo-warning selection:bg-kumo-warning-tint",
      description: "Warning banner for cautionary messages",
    },
    error: {
      classes:
        "bg-kumo-danger/20 border-kumo-danger text-kumo-danger selection:bg-kumo-danger-tint",
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
 * <Banner>This is an informational banner.</Banner>
 * <Banner variant="alert">Your session will expire soon.</Banner>
 * <Banner variant="error">We couldn't save your changes.</Banner>
 * ```
 */
export interface BannerProps {
  /** Icon element rendered before the banner text (e.g. from `@phosphor-icons/react`). */
  icon?: ReactNode;
  /** @deprecated Use `children` instead. Will be removed in a future major version. */
  text?: string;
  /** Banner message content. Accepts strings or custom React elements. */
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
 *
 * @example
 * ```tsx
 * <Banner variant="alert" icon={<WarningCircle />}>
 *   Review your billing information.
 * </Banner>
 * ```
 */
export function Banner({
  icon,
  children,
  text,
  variant = KUMO_BANNER_DEFAULT_VARIANTS.variant,
  className,
}: BannerProps) {
  // Prefer children over deprecated text prop
  const value = children ?? text;

  const content = isValidElement(value) ? value : <p>{value}</p>;

  return (
    <div className={cn(bannerVariants({ variant }), className)}>
      {icon}
      {content}
    </div>
  );
}
