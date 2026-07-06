import { describe, expect, it, vi } from "vitest";
import { resolveVariant } from "./resolve-variant";

const VARIANTS = {
  primary: { classes: "bg-blue", description: "Primary" },
  secondary: { classes: "bg-gray", description: "Secondary" },
} as const;

describe("resolveVariant", () => {
  it("returns the matching config for a valid key", () => {
    expect(resolveVariant(VARIANTS, "primary", "secondary")).toBe(
      VARIANTS.primary,
    );
  });

  it("returns the fallback config for an invalid key", () => {
    expect(resolveVariant(VARIANTS, "bogus", "secondary")).toBe(
      VARIANTS.secondary,
    );
  });

  it("returns the fallback config for an empty string", () => {
    expect(resolveVariant(VARIANTS, "", "primary")).toBe(VARIANTS.primary);
  });

  it("logs a warning in development when falling back", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    resolveVariant(VARIANTS, "nope", "primary");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain('Unknown variant "nope"');
    spy.mockRestore();
  });

  it("does not log a warning for valid keys", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    resolveVariant(VARIANTS, "primary", "secondary");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("works with non-.classes configs (e.g. .value)", () => {
    const sizeVariants = {
      sm: { value: 16 },
      base: { value: 24 },
    } as const;
    expect(resolveVariant(sizeVariants, "invalid", "base")).toBe(
      sizeVariants.base,
    );
    expect(resolveVariant(sizeVariants, "invalid", "base").value).toBe(24);
  });
});
