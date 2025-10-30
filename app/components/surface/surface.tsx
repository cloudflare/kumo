import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type PropsWithChildren,
  type ForwardedRef,
} from "react";
import { cn } from "../utils";

type PolymorphicAsProp<E extends ElementType> = {
  as?: E;
};

type PolymorphicProps<E extends ElementType> = PropsWithChildren<
  ComponentPropsWithoutRef<E> & PolymorphicAsProp<E>
>;

const defaultElement = "div";

type SurfaceProps<E extends ElementType = typeof defaultElement> =
  PolymorphicProps<E> & {
    color?: "primary" | "secondary";
  };

export const Surface = forwardRef(function Surface<
  E extends ElementType = typeof defaultElement
>(
  { as, children, className, ...restProps }: SurfaceProps<E>,
  ref: ForwardedRef<E>
) {
  const Component = as ?? defaultElement;
  return (
    <Component
      ref={ref}
      {...restProps}
      className={cn(
        "ring ring-neutral-950/10 shadow-xs dark:ring-neutral-800",
        className
      )}
    >
      {children}
    </Component>
  );
});
