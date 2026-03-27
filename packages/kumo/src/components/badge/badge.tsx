import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** Base styles applied to all badge variants. */
export const KUMO_BADGE_BASE_STYLES =
  "inline-flex w-fit flex-none shrink-0 items-center justify-self-start rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

/** Badge variant definitions mapping variant names to their Tailwind classes and descriptions. */
export const KUMO_BADGE_VARIANTS = {
  variant: {
    red: {
      classes: "bg-red-600 text-white dark:bg-red-700",
      description: "Red badge",
    },
    "red-subtle": {
      classes: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      description: "Subtle red badge",
    },
    orange: {
      classes: "bg-orange-600 text-white dark:bg-orange-700",
      description: "Orange badge",
    },
    "orange-subtle": {
      classes:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      description: "Subtle orange badge",
    },
    yellow: {
      classes: "bg-yellow-600 text-white dark:bg-yellow-700",
      description: "Yellow badge",
    },
    "yellow-subtle": {
      classes:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      description: "Subtle yellow badge",
    },
    green: {
      classes: "bg-emerald-600 text-white dark:bg-emerald-700",
      description: "Green badge",
    },
    "green-subtle": {
      classes:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      description: "Subtle green badge",
    },
    teal: {
      classes: "bg-teal-600 text-white dark:bg-teal-700",
      description: "Teal badge",
    },
    "teal-subtle": {
      classes: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      description: "Subtle teal badge",
    },
    blue: {
      classes: "bg-blue-600 text-white dark:bg-blue-700",
      description: "Blue badge",
    },
    "blue-subtle": {
      classes: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      description: "Subtle blue badge",
    },
    neutral: {
      classes: "bg-neutral-600 text-white",
      description: "Neutral badge",
    },
    "neutral-subtle": {
      classes:
        "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
      description: "Subtle neutral badge",
    },
    inverted: {
      classes: "bg-neutral-950 text-white dark:bg-white dark:text-black",
      description: "Inverted badge",
    },
    outline: {
      classes: "border border-kumo-fill bg-transparent text-kumo-default",
      description: "Bordered badge with transparent background",
    },
    beta: {
      classes:
        "border border-dashed border-kumo-brand bg-transparent text-kumo-link",
      description: "Indicates beta or experimental features",
    },
    /** @deprecated Use `"inverted"` instead. */
    primary: {
      classes: "bg-neutral-950 text-white dark:bg-white dark:text-black",
      description: "Deprecated. Use inverted instead.",
    },
    /** @deprecated Use `"neutral"` instead. */
    secondary: {
      classes: "bg-neutral-600 text-white",
      description: "Deprecated. Use neutral instead.",
    },
    /** @deprecated Use `"red"` instead. */
    destructive: {
      classes: "bg-red-600 text-white dark:bg-red-700",
      description: "Deprecated. Use red instead.",
    },
    /** @deprecated Use `"green"` instead. */
    success: {
      classes: "bg-emerald-600 text-white dark:bg-emerald-700",
      description: "Deprecated. Use green instead.",
    },
  },
} as const;

export const KUMO_BADGE_DEFAULT_VARIANTS = {
  variant: "neutral",
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
   * - `"red"` / `"red-subtle"` — Red badge
   * - `"orange"` / `"orange-subtle"` — Orange badge
   * - `"yellow"` / `"yellow-subtle"` — Yellow badge
   * - `"green"` / `"green-subtle"` — Green badge (emerald scale)
   * - `"teal"` / `"teal-subtle"` — Teal badge
   * - `"blue"` / `"blue-subtle"` — Blue badge
   * - `"neutral"` / `"neutral-subtle"` — Neutral badge
   * - `"inverted"` — Inverted badge (near-black, white in dark mode)
   * - `"outline"` — Bordered badge with transparent background
   * - `"beta"` — Dashed-border badge for beta/experimental features
   * - `"primary"` — **Deprecated.** Use `"inverted"` instead.
   * - `"secondary"` — **Deprecated.** Use `"neutral"` instead.
   * - `"destructive"` — **Deprecated.** Use `"red"` instead.
   * - `"success"` — **Deprecated.** Use `"green"` instead.
   * @default "neutral"
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
