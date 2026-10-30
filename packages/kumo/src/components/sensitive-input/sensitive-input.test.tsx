import { describe, it, expect, vi } from "vite-plus/test";
import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { SensitiveInput } from "./sensitive-input";

describe("SensitiveInput", () => {
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

  it("masks the value again on blur when an onBlur handler is passed", () => {
    const onBlur = vi.fn();
    render(<SensitiveInput defaultValue="example-value" onBlur={onBlur} />);
    fireEvent.keyDown(screen.getByRole("button", { name: /masked/ }), {
      key: "Enter",
    });
    const input = screen.getByDisplayValue("example-value");
    expect(input.getAttribute("type")).toBe("text");

    fireEvent.blur(input);

    expect(input.getAttribute("type")).toBe("password");
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("calls onBlur but stays revealed when focus moves to the visibility toggle", () => {
    const onBlur = vi.fn();
    render(<SensitiveInput defaultValue="example-value" onBlur={onBlur} />);
    fireEvent.keyDown(screen.getByRole("button", { name: /masked/ }), {
      key: "Enter",
    });
    const input = screen.getByDisplayValue("example-value");

    fireEvent.blur(input, {
      relatedTarget: screen.getByRole("button", { name: "Hide value" }),
    });

    expect(input.getAttribute("type")).toBe("text");
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
