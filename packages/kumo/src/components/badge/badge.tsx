import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** Base styles applied to all badge variants. */
export const KUMO_BADGE_BASE_STYLES =
  "inline-flex w-fit flex-none shrink-0 items-center justify-self-start rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

/** Badge variant definitions mapping variant names to their Tailwind classes and descriptions. */
export const KUMO_BADGE_VARIANTS = {
  variant: {
    /** Semantic token badges */
    primary: {
      classes: "bg-kumo-badge-inverted text-kumo-badge-inverted",
      description: "Primary badge",
    },
    secondary: {
      classes: "bg-kumo-fill text-kumo-badge-neutral-subtle",
      description: "Secondary badge",
    },
    error: {
      classes: "bg-kumo-danger-tint/60 text-kumo-danger",
      description: "Error badge",
    },
    warning: {
      classes: "bg-kumo-warning-tint/70 text-kumo-warning",
      description: "Warning badge",
    },
    success: {
      classes: "bg-kumo-success-tint/70 text-kumo-success",
      description: "Success badge",
    },
    destructive: {
      classes: "bg-kumo-badge-red text-white",
      description: "Deprecated. Use red instead.",
    },
    info: {
      classes: "bg-kumo-info-tint/70 text-kumo-info",
      description: "Info badge",
    },
    beta: {
      classes:
        "border border-dashed border-kumo-brand bg-transparent text-kumo-link",
      description: "Indicates beta or experimental features",
    },
    outline: {
      classes: "border border-kumo-fill bg-transparent text-kumo-default",
      description: "Bordered badge with transparent background",
    },

    /** Other color token variants */

    red: {
      classes: "bg-kumo-badge-red text-white",
      description: "Red badge",
    },
    green: {
      classes: "bg-kumo-badge-green text-white",
      description: "Green badge",
    },
    neutral: {
      classes: "bg-kumo-badge-neutral text-white",
      description: "Neutral badge",
    },
    orange: {
      classes: "bg-kumo-badge-orange text-black",
      description: "Orange badge",
    },
    purple: {
      classes: "bg-kumo-badge-purple text-white",
      description: "Purple badge",
    },
    teal: {
      classes: "bg-kumo-badge-teal text-white",
      description: "Teal badge",
    },
    "teal-subtle": {
      classes: "bg-kumo-badge-teal-subtle text-kumo-badge-teal-subtle",
      description: "Subtle teal badge",
    },
    blue: {
      classes: "bg-kumo-badge-blue text-white",
      description: "Blue badge",
    },
  },
} as const;

export const KUMO_BADGE_DEFAULT_VARIANTS = {
  variant: "primary",
} as const;

// Derived types from KUMO_BADGE_VARIANTS
export type KumoBadgeVariant = keyof typeof KUMO_BADGE_VARIANTS.variant;

export interface KumoBadgeVariantsProps {
  variant?: KumoBadgeVariant;
}

export function badgeVariants({
  variant = KUMO_BADGE_DEFAULT_VARIANTS.variant,
}: KumoBadgeVariantsProps = {}) {
  const variantConfig = KUMO_BADGE_VARIANTS.variant[variant];
  return cn(
    // Base styles (exported as KUMO_BADGE_BASE_STYLES for Figma plugin)
    KUMO_BADGE_BASE_STYLES,
    // Apply variant styles from KUMO_BADGE_VARIANTS (fallback to primary if variant not found)
    variantConfig?.classes ??
      KUMO_BADGE_VARIANTS.variant[KUMO_BADGE_DEFAULT_VARIANTS.variant].classes,
  );
}

// Legacy type alias for backwards compatibility
export type BadgeVariant = KumoBadgeVariant;

/**
 * Badge component props.
 *
 * @example
 * ```tsx
 * <Badge variant="green">Active</Badge>
 * <Badge variant="red">Error</Badge>
 * <Badge variant="neutral">Inactive</Badge>
 * ```
 */
export interface BadgeProps {
  /**
   * Color variant of the badge.
   * Recommended semantic variants:
   * - `"primary"` — Primary badge
   * - `"secondary"` — Secondary badge
   * - `"error"` — Error badge
   * - `"warning"` — Warning badge
   * - `"success"` — Success badge
   * - `"info"` — Info badge
   *
   * Additional token variants:
   * - `"red"`, `"orange"`, `"green"`, `"teal"`, `"blue"`, `"purple"`, `"neutral"`
   * - `"teal-subtle"`, `"neutral-subtle"`
   * - `"inverted"`
   * - `"outline"` — Bordered badge with transparent background
   * - `"beta"` — Dashed-border badge for beta/experimental features
   * @default "secondary"
   */
  variant?: KumoBadgeVariant;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Content rendered inside the badge. */
  children: ReactNode;
}

/**
 * Small status label for categorizing or highlighting content.
 *
 * @example
 * ```tsx
 * <Badge variant="green">Active</Badge>
 * ```
 */
export function Badge({
  variant = KUMO_BADGE_DEFAULT_VARIANTS.variant,
  className,
  children,
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}
