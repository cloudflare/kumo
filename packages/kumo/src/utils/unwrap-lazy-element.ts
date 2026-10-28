import React from "react";

const REACT_LAZY_TYPE = Symbol.for("react.lazy");

/**
 * Unwraps a lazy element reference produced by React Flight.
 *
 * When an element prop (e.g. `icon={<Star />}`) is passed from a Server
 * Component, the Flight client can deliver it as a lazy wrapper instead of an
 * element. The wrapper fails `React.isValidElement`, and rendering it as a
 * component throws React error #306 because it resolves to an element rather
 * than a component. `React.Children.toArray` unwraps it to the underlying
 * element.
 *
 * Mirrors Base UI's `unwrapLazyRenderProp`. Remove once
 * https://github.com/react/react/issues/32392 is fixed.
 */
export function unwrapLazyElement<T>(value: T): T {
  if ((value as { $$typeof?: symbol } | null)?.$$typeof !== REACT_LAZY_TYPE) {
    return value;
  }
  const unwrapped = React.Children.toArray(value as React.ReactNode)[0];
  return React.isValidElement(unwrapped) ? (unwrapped as T) : value;
}
