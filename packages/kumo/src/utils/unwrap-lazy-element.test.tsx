import React from "react";
import { describe, expect, it } from "vite-plus/test";
import { Plus } from "@phosphor-icons/react";
import { unwrapLazyElement } from "./unwrap-lazy-element";

function flightLazy(payload: unknown) {
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: payload,
    _init: (value: unknown) => value,
  };
}

describe("unwrapLazyElement", () => {
  it("unwraps a lazy reference that resolves to an element", () => {
    const element = <Plus data-testid="plus" />;
    const result: unknown = unwrapLazyElement<unknown>(flightLazy(element));
    expect(React.isValidElement(result)).toBe(true);
    expect((result as React.ReactElement).type).toBe(Plus);
  });

  it("unwraps nested lazy references", () => {
    const element = <Plus />;
    expect(unwrapLazyElement(flightLazy(flightLazy(element)))).toBe(element);
  });

  it("returns a lazy component unchanged", async () => {
    const LazyIcon = React.lazy(() => Promise.resolve({ default: Plus }));
    // Uninitialized: starts loading and throws the pending thenable.
    let thrown: unknown;
    try {
      unwrapLazyElement(LazyIcon);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(Promise);
    await thrown;
    // Resolved to a component, not an element.
    expect(unwrapLazyElement(LazyIcon)).toBe(LazyIcon);
  });

  it("returns non-lazy values unchanged", () => {
    const element = <Plus />;
    expect(unwrapLazyElement(element)).toBe(element);
    expect(unwrapLazyElement(Plus)).toBe(Plus);
    expect(unwrapLazyElement("text")).toBe("text");
    expect(unwrapLazyElement(null)).toBe(null);
    expect(unwrapLazyElement(undefined)).toBe(undefined);
  });

  it("keeps the wrapper when it does not resolve to an element", () => {
    const lazy = flightLazy("text");
    expect(unwrapLazyElement(lazy)).toBe(lazy);
  });
});
