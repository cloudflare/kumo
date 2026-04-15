import { createElement, type ElementType } from "react";
import { cn } from "../../utils/cn";
import { LayerCard, type LayerCardProps } from "../layer-card/layer-card";

/** Surface color variant definitions. */
export const KUMO_SURFACE_VARIANTS = {
  color: {
    primary: {
      classes: "",
      description: "Primary surface color",
    },
    secondary: {
      classes: "",
      description: "Secondary surface color",
    },
  },
} as const;

export const KUMO_SURFACE_DEFAULT_VARIANTS = {
  color: "primary",
} as const;

// Derived types from KUMO_SURFACE_VARIANTS
export type KumoSurfaceColor = keyof typeof KUMO_SURFACE_VARIANTS.color;

export interface KumoSurfaceVariantsProps {
  /**
   * Surface color variant.
   * - `"primary"` — Primary surface color
   * - `"secondary"` — Secondary surface color
   * @default "primary"
   */
  color?: KumoSurfaceColor;
}

export function surfaceVariants({
  color = KUMO_SURFACE_DEFAULT_VARIANTS.color,
}: KumoSurfaceVariantsProps = {}) {
  return KUMO_SURFACE_VARIANTS.color[color].classes;
}

/**
 * Surface component props.
 *
 * @deprecated Use `LayerCard` instead. `Surface` is now a compatibility wrapper
 * around `LayerCard` for simple one-layer card containers.
 *
 * @example
 * ```tsx
 * <Surface className="rounded-lg p-4">Card content</Surface>
 * <Surface render={<section />} className="rounded-lg p-6">Section content</Surface>
 * ```
 */
export type SurfaceProps = LayerCardProps &
  KumoSurfaceVariantsProps & {
    /**
     * @deprecated Use the `render` prop instead.
     * @example `<Surface render={<section />}>` instead of `<Surface as="section">`
     */
    as?: ElementType;
  };

/**
 * @deprecated Use `LayerCard` instead.
 *
 * Polymorphic compatibility wrapper that preserves the `Surface` API while
 * delegating rendering and styling to `LayerCard`.
 *
 * @example
 * ```tsx
 * <LayerCard className="rounded-lg p-4">Card content</LayerCard>
 * ```
 */
export const Surface = function Surface({
  color = "primary",
  className,
  render,
  as,
  ...props
}: SurfaceProps) {
  const resolvedRender = render ?? (as ? createElement(as) : undefined);
  return (
    <LayerCard
      className={cn("overflow-visible rounded-none", className)}
      render={resolvedRender}
      {...props}
      data-surface-color={color}
      data-deprecated="surface"
    />
  );
};

Surface.displayName = "Surface";
