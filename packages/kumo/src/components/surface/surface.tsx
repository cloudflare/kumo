import React, {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ElementType,
  type PropsWithChildren,
} from "react";
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

type PolymorphicAsProp<E extends ElementType> = {
  as?: E;
};

type PolymorphicProps<E extends ElementType> = PropsWithChildren<
  ComponentPropsWithoutRef<E> & PolymorphicAsProp<E>
>;

type PolymorphicRef<E extends ElementType> = ComponentPropsWithRef<E>["ref"];

const defaultElement = "div";

type SurfacePropsGeneric<E extends ElementType = typeof defaultElement> =
  PolymorphicProps<E> & KumoSurfaceVariantsProps;

/**
 * Surface component props.
 *
 * @example
 * ```tsx
 * <Surface className="rounded-lg p-4">Card content</Surface>
 * <Surface as="section" className="rounded-lg p-6">Section content</Surface>
 * ```
 */
export interface SurfaceProps {
  /** The HTML element type to render as (e.g. `"div"`, `"section"`, `"article"`). @default "div" */
  as?: ElementType;
  /** Surface color variant. @default "primary" */
  color?: KumoSurfaceColor;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Content rendered inside the surface. */
  children?: React.ReactNode;
}

type SurfaceComponent = <E extends ElementType = typeof defaultElement>(
  props: SurfacePropsGeneric<E> & { ref?: PolymorphicRef<E> },
) => React.JSX.Element;

/**
 * Polymorphic container with consistent background, shadow, and border styling.
 *
 * @example
 * ```tsx
 * <Surface className="rounded-lg p-4">Card content</Surface>
 * ```
 */
const SurfaceImpl = function Surface<
  E extends ElementType = typeof defaultElement,
>(
  { as, children, className, ...restProps }: SurfacePropsGeneric<E>,
  ref: PolymorphicRef<E>,
) {
  const Component = as ?? defaultElement;
  return (
    <Component
      ref={ref}
      {...restProps}
      className={cn("bg-kumo-base shadow-xs ring ring-kumo-line", className)}
    >
      {children}
    </Component>
  );
};

export const Surface = forwardRef(
  SurfaceImpl as any,
) as unknown as SurfaceComponent;
