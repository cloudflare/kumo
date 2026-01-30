import React, {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ElementType,
  type PropsWithChildren,
} from "react";
import { cn } from "../../utils/cn";

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
 * Props for the Surface component.
 * @description A polymorphic container component for creating elevated surfaces with consistent styling.
 */
export interface SurfaceProps {
  /** The element type to render as (default: "div") */
  as?: ElementType;
  /** Surface color variant */
  color?: KumoSurfaceColor;
  /** Additional CSS classes */
  className?: string;
  /** Child elements */
  children?: React.ReactNode;
}

type SurfaceComponent = <E extends ElementType = typeof defaultElement>(
  props: SurfacePropsGeneric<E> & { ref?: PolymorphicRef<E> },
) => React.JSX.Element;

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
