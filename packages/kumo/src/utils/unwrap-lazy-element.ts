import React from "react";

const REACT_LAZY_TYPE = Symbol.for("react.lazy");

function isLazyReference(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { $$typeof?: unknown }).$$typeof === REACT_LAZY_TYPE
  );
}

function isThenable(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

/**
 * Unwraps a lazy element reference produced by React Flight.
 *
 * When an element prop (e.g. `icon={<Star />}`) is passed from a Server
 * Component, the Flight client can deliver it as a lazy wrapper instead of an
 * element (https://github.com/react/react/issues/32392, closed as not
 * planned). The wrapper fails `React.isValidElement`, and rendering it as a
 * component throws React error #306 because it resolves to an element rather
 * than a component.
 *
 * `React.Children.toArray` resolves the wrapper to its element, the same
 * approach Base UI (`unwrapLazyRenderProp`) and Ark UI use. A pending wrapper
 * suspends.
 *
 * Anything that does not resolve to an element is returned unchanged, so the
 * caller renders it as a component as before. That includes a `React.lazy`
 * component: `toArray` returns nothing for one resolving to a function, and
 * throws for one resolving to a `forwardRef` or `memo` object (such as a
 * Phosphor icon). It also includes every lazy value on React 18, whose
 * `toArray` does not resolve lazy values; Server Components require React 19.
 * A genuine error resurfaces when React renders the returned wrapper.
 */
export function unwrapLazyElement<T>(value: T): T {
  if (!isLazyReference(value)) return value;
  let unwrapped: unknown;
  try {
    unwrapped = React.Children.toArray(value as React.ReactNode)[0];
  } catch (error) {
    if (isThenable(error)) throw error;
    return value;
  }
  return React.isValidElement(unwrapped) ? (unwrapped as T) : value;
}
