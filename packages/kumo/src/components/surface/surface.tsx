import { forwardRef } from "react";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import { cn } from "../../utils/cn";

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
  return cn(
    // Base styles
    "shadow-xs ring ring-kumo-line",
    // Apply color-specific styles
    KUMO_SURFACE_VARIANTS.color[color].classes,
  );
}

/**
 * Surface component props.
 *
 * @example
 * ```tsx
 * <Surface className="rounded-lg p-4">Card content</Surface>
 * <Surface render={<section />} className="rounded-lg p-6">Section content</Surface>
 * ```
 */
export type SurfaceProps = useRender.ComponentProps<"div"> &
  KumoSurfaceVariantsProps;

/**
 * Polymorphic container with consistent background, shadow, and border styling.
 *
 * Use the `render` prop to change the underlying element:
 * ```tsx
 * <Surface render={<section />} className="rounded-lg p-4">Card content</Surface>
 * ```
 *
 * @example
 * ```tsx
 * <Surface className="rounded-lg p-4">Card content</Surface>
 * ```
 */
export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  function Surface({ color = "primary", className, render, ...props }, ref) {
    const defaultProps: useRender.ElementProps<"div"> = {
      className: cn(
        "bg-kumo-base shadow-xs ring ring-kumo-line",
        KUMO_SURFACE_VARIANTS.color[color].classes,
      ),
    };

    return useRender({
      defaultTagName: "div",
      render,
      ref,
      props: mergeProps<"div">(defaultProps, props, { className }),
    });
  },
);

Surface.displayName = "Surface";
