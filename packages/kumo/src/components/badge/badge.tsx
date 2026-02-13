import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/** Base styles applied to all badge variants. */
export const KUMO_BADGE_BASE_STYLES =
  "inline-flex w-fit flex-none shrink-0 items-center justify-self-start rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

/** Badge variant definitions mapping variant names to their Tailwind classes and descriptions. */
export const KUMO_BADGE_VARIANTS = {
  variant: {
    primary: {
      classes: "bg-kumo-contrast text-kumo-inverse",
      description: "Default high-emphasis badge for important labels",
    },
    secondary: {
      classes: "bg-kumo-fill text-kumo-default",
      description: "Subtle badge for secondary information",
    },
    destructive: {
      classes: "bg-kumo-danger text-white",
      description: "Error or danger state indicator",
    },
    outline: {
      classes: "border border-kumo-fill bg-transparent text-kumo-default",
      description: "Bordered badge with transparent background",
    },
    beta: {
      classes: "border border-dashed border-kumo-brand bg-transparent text-kumo-link",
      description: "Indicates beta or experimental features",
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
  return cn(
    // Base styles (exported as KUMO_BADGE_BASE_STYLES for Figma plugin)
    KUMO_BADGE_BASE_STYLES,
    // Apply variant styles from KUMO_BADGE_VARIANTS
    KUMO_BADGE_VARIANTS.variant[variant].classes,
  );
}

// Legacy type alias for backwards compatibility
export type BadgeVariant = KumoBadgeVariant;

/**
 * Badge component props.
 *
 * @example
 * ```tsx
 * <Badge variant="primary">New</Badge>
 * <Badge variant="destructive">Error</Badge>
 * <Badge variant="beta">Beta</Badge>
 * ```
 */
export interface BadgeProps {
  /**
   * Visual style of the badge.
   * - `"primary"` — High-emphasis badge for important labels
   * - `"secondary"` — Subtle badge for secondary information
   * - `"destructive"` — Error or danger state indicator
   * - `"outline"` — Bordered badge with transparent background
   * - `"beta"` — Dashed-border badge for beta/experimental features
   * @default "primary"
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
 * <Badge variant="primary">Active</Badge>
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
