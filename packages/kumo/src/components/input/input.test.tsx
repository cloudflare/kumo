import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  Input,
  inputVariants,
  KUMO_INPUT_VARIANTS,
  KUMO_INPUT_DEFAULT_VARIANTS,
} from "./input";
import { InputArea } from "./input-area";

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

  it("applies password manager ignore hints when requested", () => {
    render(<Input aria-label="Test" passwordManagerIgnore />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("keeper-ignore");
    expect(input.getAttribute("data-1p-ignore")).toBe("true");
    expect(input.getAttribute("data-bwignore")).toBe("true");
    expect(input.getAttribute("data-form-type")).toBe("other");
    expect(input.getAttribute("data-lpignore")).toBe("true");
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
      "focus:ring-kumo-focus/50",
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

  // Error without label
  it("renders error message without label when error is a string", () => {
    render(<Input aria-label="Email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeTruthy();
  });

  it("renders error message without label when error is an object", () => {
    render(
      <Input
        aria-label="Email"
        error={{ message: "Required field", match: true }}
      />,
    );
    expect(screen.getByText("Required field")).toBeTruthy();
  });

  it("applies error variant styling without label", () => {
    render(<Input aria-label="Email" error="Bad value" />);
    expect(screen.getByRole("textbox").className).toContain("ring-kumo-danger");
  });

  it("renders description without label", () => {
    render(<Input aria-label="Email" description="Enter your work email" />);
    expect(screen.getByText("Enter your work email")).toBeTruthy();
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
    expect(classes).toContain("focus:ring-kumo-focus/50");
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

describe("InputArea", () => {
  it("auto-resizes to its scrollHeight when autoResize is true", () => {
    const scrollHeight = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockReturnValue(80);

    render(
      <InputArea aria-label="Notes" autoResize defaultValue="Initial value" />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea.style.height).toBe("80px");
    expect(textarea.className).toContain("resize-none");
    expect(textarea.className).toContain("field-sizing-content");
    expect(textarea.style.overflowY).toBe("hidden");

    scrollHeight.mockRestore();
  });

  it("does not touch inline height when autoResize is false", () => {
    const { rerender } = render(
      <InputArea aria-label="Notes" value="one" onChange={() => {}} />,
    );

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    // Simulate the user dragging the native resize handle
    textarea.style.height = "240px";

    rerender(
      <InputArea aria-label="Notes" value="one two" onChange={() => {}} />,
    );
    fireEvent.change(textarea, { target: { value: "one two three" } });

    expect(textarea.style.height).toBe("240px");
    expect(textarea.className).not.toContain("field-sizing-content");
    expect(textarea.className).not.toContain("[scrollbar-width:thin]");
  });

  it("clamps to maxRows and becomes scrollable past the clamp", () => {
    const scrollHeight = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockReturnValue(200);

    render(
      <InputArea
        aria-label="Notes"
        autoResize
        maxRows={5}
        style={{ lineHeight: "20px" }}
        defaultValue="Lots of content"
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea.style.height).toBe("100px");
    expect(textarea.style.overflowY).toBe("auto");

    scrollHeight.mockRestore();
  });

  it("clamps to minRows when content is shorter", () => {
    const scrollHeight = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockReturnValue(20);

    render(
      <InputArea
        aria-label="Notes"
        autoResize
        minRows={3}
        style={{ lineHeight: "20px" }}
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea.getAttribute("rows")).toBe("3");
    expect(textarea.style.height).toBe("60px");
    expect(textarea.style.overflowY).toBe("hidden");

    scrollHeight.mockRestore();
  });

  it("treats a unitless line-height as a font-size multiplier for maxRows", () => {
    const scrollHeight = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockReturnValue(500);

    render(
      <InputArea
        aria-label="Notes"
        autoResize
        maxRows={4}
        style={{ lineHeight: "1.5", fontSize: "16px" }}
        defaultValue="Lots of content"
      />,
    );

    // 1.5 * 16px * 4 rows = 96px, not 1.5px * 4 rows
    const textarea = screen.getByRole("textbox");
    expect(textarea.style.height).toBe("96px");
    expect(textarea.style.overflowY).toBe("auto");

    scrollHeight.mockRestore();
  });

  it("clears inline styles on unmount", () => {
    const scrollHeight = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockReturnValue(80);

    const { unmount } = render(
      <InputArea aria-label="Notes" autoResize defaultValue="Initial" />,
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.style.height).toBe("80px");

    unmount();
    expect(textarea.style.height).toBe("");
    expect(textarea.style.overflowY).toBe("");

    scrollHeight.mockRestore();
  });

  it("restores inline styles when autoResize is turned off", () => {
    const scrollHeight = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockReturnValue(80);

    const { rerender } = render(
      <InputArea aria-label="Notes" autoResize defaultValue="Initial" />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea.style.height).toBe("80px");

    rerender(<InputArea aria-label="Notes" defaultValue="Initial" />);
    expect(textarea.style.height).toBe("");
    expect(textarea.style.overflowY).toBe("");

    scrollHeight.mockRestore();
  });

  it("auto-resizes on change and preserves value callbacks", () => {
    const scrollHeight = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockReturnValue(96);
    const onChange = vi.fn();
    const onValueChange = vi.fn();

    render(
      <InputArea
        aria-label="Notes"
        autoResize
        onChange={onChange}
        onValueChange={onValueChange}
      />,
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Longer value" } });

    expect(textarea.style.height).toBe("96px");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("Longer value");

    scrollHeight.mockRestore();
  });

  it("forwards ref to the underlying textarea with autoResize", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<InputArea ref={ref} aria-label="Notes" autoResize />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
