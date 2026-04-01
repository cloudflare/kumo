import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** Base styles applied to all badge variants. */
export const KUMO_BADGE_BASE_STYLES =
  "inline-flex w-fit flex-none shrink-0 items-center justify-self-start rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

/** Badge variant definitions mapping variant names to their Tailwind classes and descriptions. */
export const KUMO_BADGE_VARIANTS = {
  variant: {
    red: {
      classes: "bg-kumo-badge-red text-white",
      description: "Red badge",
    },
    "red-subtle": {
      classes: "bg-kumo-badge-red-subtle text-kumo-badge-red-subtle",
      description: "Subtle red badge",
    },
    orange: {
      classes: "bg-kumo-badge-orange text-white",
      description: "Orange badge",
    },
    "orange-subtle": {
      classes: "bg-kumo-badge-orange-subtle text-kumo-badge-orange-subtle",
      description: "Subtle orange badge",
    },
    yellow: {
      classes: "bg-kumo-badge-yellow text-white",
      description: "Yellow badge",
    },
    "yellow-subtle": {
      classes: "bg-kumo-badge-yellow-subtle text-kumo-badge-yellow-subtle",
      description: "Subtle yellow badge",
    },
    green: {
      classes: "bg-kumo-badge-green text-white",
      description: "Green badge",
    },
    "green-subtle": {
      classes: "bg-kumo-badge-green-subtle text-kumo-badge-green-subtle",
      description: "Subtle green badge",
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
    "blue-subtle": {
      classes: "bg-kumo-badge-blue-subtle text-kumo-badge-blue-subtle",
      description: "Subtle blue badge",
    },
    neutral: {
      classes: "bg-kumo-badge-neutral text-white",
      description: "Neutral badge",
    },
    "neutral-subtle": {
      classes: "bg-kumo-fill text-kumo-badge-neutral-subtle",
      description: "Subtle neutral badge",
    },
    inverted: {
      classes: "bg-kumo-badge-inverted text-kumo-badge-inverted",
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
      classes: "bg-kumo-badge-inverted text-kumo-badge-inverted",
      description: "Deprecated. Use inverted instead.",
    },
    /** @deprecated Use `"neutral"` instead. */
    secondary: {
      classes: "bg-kumo-badge-neutral text-white",
      description: "Deprecated. Use neutral instead.",
    },
    /** @deprecated Use `"red"` instead. */
    destructive: {
      classes: "bg-kumo-badge-red text-white",
      description: "Deprecated. Use red instead.",
    },
    /** @deprecated Use `"green"` instead. */
    success: {
      classes: "bg-kumo-badge-green text-white",
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
