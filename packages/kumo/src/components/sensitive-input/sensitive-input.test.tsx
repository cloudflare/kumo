import { describe, it, expect, vi } from "vite-plus/test";
import { createElement } from "react";
import { render } from "@testing-library/react";
import { SensitiveInput } from "./sensitive-input";

describe("SensitiveInput", () => {
  it.each(["xs", "lg"])(
    "uses base padding for the removed %s size",
    (removedSize) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { container } = render(
        // Removed sizes can still arrive from untyped callers.
        <SensitiveInput
          aria-label="API key"
          defaultValue="secret"
          size={removedSize as never}
        />,
      );

      const input = container.querySelector("input")!;
      expect(input.className).toContain("pr-8");
      warn.mockRestore();
    },
  );

  it("should be defined", () => {
    expect(SensitiveInput).toBeDefined();
  });

  it("should accept required props", () => {
    const props = {
      label: "API Key",
    };
    expect(() => createElement(SensitiveInput, props)).not.toThrow();
  });

  it("should accept all optional props", () => {
    const props = {
      value: "secret-value",
      defaultValue: "default-secret",
      onChange: () => {},
      onValueChange: () => {},
      onCopy: () => {},
      size: "base" as const,
      variant: "default" as const,
      label: "API Key",
      disabled: false,
      readOnly: false,
      id: "api-key-input",
      name: "apiKey",
      placeholder: "Enter API key",
      required: true,
      autoComplete: "off",
      className: "custom-class",
    };
    expect(() => createElement(SensitiveInput, props)).not.toThrow();
  });

  it("applies error border when error prop is truthy", () => {
    const { container } = render(
      <SensitiveInput aria-label="API Key" error="Invalid key" />,
    );
    // Error styling (ring-kumo-danger) is on the container div wrapping the password input
    const inputEl = container.querySelector("input");
    expect(inputEl?.parentElement?.className).toContain("ring-kumo-danger");
  });

  it("forwards required to the native input", () => {
    const { container } = render(<SensitiveInput label="API Key" required />);
    const inputEl = container.querySelector("input");
    expect(inputEl?.required).toBe(true);
    expect(inputEl?.checkValidity()).toBe(false);
  });
});
