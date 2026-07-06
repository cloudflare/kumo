import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";

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
  appearance: {
    filled: {
      classes: "",
      description: "Filled badge with background color (default)",
    },
    dot: {
      classes:
        "gap-1.5 bg-transparent text-kumo-default ring ring-kumo-hairline",
      description: "Outlined badge with a colored circle dot indicating status",
    },
  },
  dotColor: {
    none: {
      classes: "",
      description: "No dot indicator (used when appearance is not dot, or variant has no dot color)",
    },
    success: {
      classes: "bg-kumo-success",
      description: "Green dot for success status",
    },
    warning: {
      classes: "bg-kumo-badge-orange",
      description: "Orange dot for warning status",
    },
    error: {
      classes: "bg-kumo-badge-red",
      description: "Red dot for error status",
    },
    neutral: {
      classes: "bg-kumo-badge-neutral",
      description: "Neutral dot for informational status",
    },
  },
} as const;

export const KUMO_BADGE_DEFAULT_VARIANTS = {
  variant: "primary",
  appearance: "filled",
  dotColor: "none",
} as const;

// Derived types from KUMO_BADGE_VARIANTS
export type KumoBadgeVariant = keyof typeof KUMO_BADGE_VARIANTS.variant;
export type KumoBadgeAppearance = keyof typeof KUMO_BADGE_VARIANTS.appearance;
export type KumoBadgeDotColor = keyof typeof KUMO_BADGE_VARIANTS.dotColor;

export interface KumoBadgeVariantsProps {
  variant?: KumoBadgeVariant;
  appearance?: KumoBadgeAppearance;
}

export function badgeVariants({
  variant = KUMO_BADGE_DEFAULT_VARIANTS.variant,
  appearance = KUMO_BADGE_DEFAULT_VARIANTS.appearance,
}: KumoBadgeVariantsProps = {}) {
  const variantClasses = resolveVariant(
    KUMO_BADGE_VARIANTS.variant,
    variant,
    KUMO_BADGE_DEFAULT_VARIANTS.variant,
  ).classes;
  const appearanceClasses = resolveVariant(
    KUMO_BADGE_VARIANTS.appearance,
    appearance,
    KUMO_BADGE_DEFAULT_VARIANTS.appearance,
  ).classes;
  return cn(
    // Base styles (exported as KUMO_BADGE_BASE_STYLES for Figma plugin)
    KUMO_BADGE_BASE_STYLES,
    // The dot appearance overrides background/text colors from the variant,
    // so only apply variant classes when we're not in dot mode.
    appearance === "dot" ? "" : variantClasses,
    appearanceClasses,
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
 * <Badge variant="success" appearance="dot">Healthy</Badge>
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
   * @default "primary"
   */
  variant?: KumoBadgeVariant;
  /**
   * Visual appearance of the badge.
   * - `"filled"` — Filled background using the variant color (default)
   * - `"dot"` — Outlined badge with a colored circle dot. Only `success`,
   *   `warning`, `error`, and `neutral` variants show a dot; other variants
   *   render the badge without a dot.
   * @default "filled"
   */
  appearance?: KumoBadgeAppearance;
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
 * <Badge variant="success" appearance="dot">Healthy</Badge>
 * ```
 */
export function Badge({
  variant = KUMO_BADGE_DEFAULT_VARIANTS.variant,
  appearance = KUMO_BADGE_DEFAULT_VARIANTS.appearance,
  className,
  children,
}: BadgeProps) {
  // Crash-safe dot-color lookup via resolveVariant — unknown variants fall
  // back to "none" (no dot) instead of throwing.
  const dotColor =
    appearance === "dot"
      ? resolveVariant(
          KUMO_BADGE_VARIANTS.dotColor,
          variant,
          KUMO_BADGE_DEFAULT_VARIANTS.dotColor,
        ).classes
      : "";

  return (
    <span className={cn(badgeVariants({ variant, appearance }), className)}>
      {dotColor ? (
        <span
          aria-hidden="true"
          className={cn("size-1.75 rounded-full shrink-0", dotColor)}
        />
      ) : null}
      {children}
    </span>
  );
}
