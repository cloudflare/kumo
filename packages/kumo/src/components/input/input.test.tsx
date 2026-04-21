import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import {
  Input,
  inputVariants,
  KUMO_INPUT_VARIANTS,
  KUMO_INPUT_DEFAULT_VARIANTS,
} from "./input";

describe("Input", () => {
  // Rendering
  it("renders a basic input element", () => {
    render(<Input aria-label="Test" />);
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("forwards ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("sets displayName to 'Input'", () => {
    expect(Input.displayName).toBe("Input");
  });

  it("applies custom className", () => {
    render(<Input aria-label="Test" className="custom-class" />);
    expect(screen.getByRole("textbox").className).toContain("custom-class");
  });

  it("passes through native input attributes", () => {
    render(
      <Input
        aria-label="Test"
        placeholder="Enter text"
        type="email"
        disabled
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("placeholder")).toBe("Enter text");
    expect(input.getAttribute("type")).toBe("email");
    expect(input).toHaveProperty("disabled", true);
  });

  // Size variants
  it("renders with default size 'base'", () => {
    render(<Input aria-label="Test" />);
    expect(screen.getByRole("textbox").className).toContain("h-9");
  });

  it("renders with size 'xs'", () => {
    render(<Input aria-label="Test" size="xs" />);
    expect(screen.getByRole("textbox").className).toContain("h-5");
  });

  it("renders with size 'sm'", () => {
    render(<Input aria-label="Test" size="sm" />);
    expect(screen.getByRole("textbox").className).toContain("h-6.5");
  });

  it("renders with size 'lg'", () => {
    render(<Input aria-label="Test" size="lg" />);
    expect(screen.getByRole("textbox").className).toContain("h-10");
  });

  // Variant styles
  it("renders with default variant 'default'", () => {
    render(<Input aria-label="Test" />);
    expect(screen.getByRole("textbox").className).toContain(
      "focus:ring-kumo-hairline",
    );
  });

  it("renders with variant 'error'", () => {
    render(<Input aria-label="Test" variant="error" />);
    expect(screen.getByRole("textbox").className).toContain("ring-kumo-danger");
  });

  // Field wrapping
  it("renders without Field wrapper when no label is provided", () => {
    render(<Input aria-label="Test" />);
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("renders with Field wrapper when label is provided", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeTruthy();
  });

  it("renders label text when label prop is set", () => {
    render(<Input label="Username" />);
    expect(screen.getByText("Username")).toBeTruthy();
  });

  it("renders description text when description prop is set", () => {
    render(<Input label="Password" description="Must be 8+ characters" />);
    expect(screen.getByText("Must be 8+ characters")).toBeTruthy();
  });

  it("renders error message when error is a string", () => {
    render(<Input label="Email" error="Invalid email" variant="error" />);
    expect(screen.getByText("Invalid email")).toBeTruthy();
  });

  it("renders error message when error is an object with match", () => {
    render(
      <Input
        label="Email"
        error={{ message: "Required field", match: true }}
        variant="error"
      />,
    );
    expect(screen.getByText("Required field")).toBeTruthy();
  });

  // Accessibility
  it("warns in dev when no accessible name is provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Input />);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Kumo Input]"),
    );
    warnSpy.mockRestore();
  });

  it("does not warn when label prop is set", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Input label="Email" />);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("does not warn when placeholder + aria-label are set", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Input placeholder="Search" aria-label="Search" />);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("does not warn when aria-labelledby is set", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Input aria-labelledby="custom-label" />);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  // inputVariants function
  it("returns base classes with default arguments", () => {
    const classes = inputVariants();
    expect(classes).toContain("bg-kumo-control");
    expect(classes).toContain("text-kumo-default");
  });

  it("applies size classes from KUMO_INPUT_VARIANTS", () => {
    const classes = inputVariants({ size: "lg" });
    expect(classes).toContain("h-10");
    expect(classes).toContain("px-4");
  });

  it("applies variant classes from KUMO_INPUT_VARIANTS", () => {
    const classes = inputVariants({ variant: "error" });
    expect(classes).toContain("ring-kumo-danger");
  });

  it("applies parentFocusIndicator class when true", () => {
    const classes = inputVariants({ parentFocusIndicator: true });
    expect(classes).toContain("focus-within");
  });

  it("applies focusIndicator class when true", () => {
    const classes = inputVariants({ focusIndicator: true });
    expect(classes).toContain("focus:ring-kumo-hairline");
  });

  // Variants export
  it("exports KUMO_INPUT_VARIANTS with size and variant axes", () => {
    expect(KUMO_INPUT_VARIANTS.size.xs).toBeDefined();
    expect(KUMO_INPUT_VARIANTS.size.sm).toBeDefined();
    expect(KUMO_INPUT_VARIANTS.size.base).toBeDefined();
    expect(KUMO_INPUT_VARIANTS.size.lg).toBeDefined();
    expect(KUMO_INPUT_VARIANTS.variant.default).toBeDefined();
    expect(KUMO_INPUT_VARIANTS.variant.error).toBeDefined();
  });

  it("exports KUMO_INPUT_DEFAULT_VARIANTS with correct defaults", () => {
    expect(KUMO_INPUT_DEFAULT_VARIANTS.size).toBe("base");
    expect(KUMO_INPUT_DEFAULT_VARIANTS.variant).toBe("default");
  });
});
