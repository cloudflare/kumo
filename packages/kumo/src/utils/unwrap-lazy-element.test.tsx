import React from "react";
import { describe, expect, it } from "vite-plus/test";
import { Plus } from "@phosphor-icons/react";
import { unwrapLazyElement } from "./unwrap-lazy-element";

// Server Components, and with them Flight lazy elements, require React 19.
const isReact18 = React.version.startsWith("18.");

function flightLazy(payload: unknown) {
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: payload,
    _init: (value: unknown) => value,
  };
}

async function unwrapAfterLoad(value: unknown): Promise<unknown> {
  try {
    return unwrapLazyElement(value);
  } catch (pending) {
    await pending;
    return unwrapLazyElement(value);
  }
}

describe("unwrapLazyElement", () => {
  it.skipIf(isReact18)(
    "unwraps a lazy reference that resolves to an element",
    () => {
      const result = unwrapLazyElement<unknown>(flightLazy(<Plus />));
      expect(React.isValidElement(result)).toBe(true);
      expect((result as React.ReactElement).type).toBe(Plus);
    },
  );

  it.skipIf(isReact18)("unwraps nested lazy references", () => {
    const result = unwrapLazyElement<unknown>(flightLazy(flightLazy(<Plus />)));
    expect((result as React.ReactElement).type).toBe(Plus);
  });

  it.each([
    ["forwardRef", Plus],
    ["function", () => <svg />],
    ["memo", React.memo(() => <svg />)],
  ])("returns a React.lazy %s component unchanged", async (_, component) => {
    const LazyIcon = React.lazy(() =>
      Promise.resolve({ default: component as React.ComponentType }),
    );
    expect(await unwrapAfterLoad(LazyIcon)).toBe(LazyIcon);
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
