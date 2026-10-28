import React from "react";

const REACT_LAZY_TYPE = Symbol.for("react.lazy");

interface LazyReference {
  $$typeof: symbol;
  _payload: unknown;
  _init: (payload: unknown) => unknown;
}

function isLazyReference(value: unknown): value is LazyReference {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { $$typeof?: unknown }).$$typeof === REACT_LAZY_TYPE
  );
}

/**
 * Unwraps a lazy element reference produced by React Flight.
 *
 * When an element prop (e.g. `icon={<Star />}`) is passed from a Server
 * Component, the Flight client can deliver it as a lazy wrapper instead of an
 * element. The wrapper fails `React.isValidElement`, and rendering it as a
 * component throws React error #306 because it resolves to an element rather
 * than a component.
 *
 * Resolves the wrapper the same way React does when rendering it as a child.
 * A pending wrapper throws its thenable, suspending like rendering it would.
 * Anything that does not resolve to an element (e.g. a `React.lazy`
 * component) is returned unchanged. Base UI's `unwrapLazyRenderProp` uses
 * `React.Children.toArray` instead, which does not resolve lazy wrappers in
 * React 18.
 *
 * Remove once https://github.com/react/react/issues/32392 is fixed.
 */
export function unwrapLazyElement<T>(value: T): T {
  let resolved: unknown = value;
  while (isLazyReference(resolved)) {
    resolved = resolved._init(resolved._payload);
  }
  return React.isValidElement(resolved) ? (resolved as T) : value;
}
