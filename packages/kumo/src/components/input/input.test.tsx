import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  Input,
  inputVariants,
  KUMO_INPUT_VARIANTS,
  KUMO_INPUT_DEFAULT_VARIANTS,
} from "./input";
import { InputArea, RichTextInputArea } from "./input-area";

function selectEditorContents(editor: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(editor);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

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
    render(
      <Input aria-label="Email" description="Enter your work email" />,
    );
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
  it("renders toolbar controls inside the textarea shell", () => {
    const { container } = render(
      <InputArea
        aria-label="Comment"
        toolbar={<button type="button">Bold</button>}
      />,
    );

    expect(screen.getByRole("textbox")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bold" })).toBeTruthy();
    expect(
      container.querySelector('[data-kumo-component="InputArea.Control"]'),
    ).toBeTruthy();
  });

  it("renders toolbar controls above the textarea by default", () => {
    const { container } = render(
      <InputArea
        aria-label="Comment"
        toolbar={<button type="button">Bold</button>}
      />,
    );

    const control = container.querySelector(
      '[data-kumo-component="InputArea.Control"]',
    );
    expect(
      control?.firstElementChild?.getAttribute("data-kumo-component"),
    ).toBe("InputArea.Toolbar");
    expect(control?.firstElementChild?.className).toContain("border-b");
  });

  it("supports rendering toolbar controls below the textarea", () => {
    const { container } = render(
      <InputArea
        aria-label="Comment"
        toolbar={<button type="button">Bold</button>}
        toolbarPlacement="bottom"
      />,
    );

    const control = container.querySelector(
      '[data-kumo-component="InputArea.Control"]',
    );
    expect(
      control?.lastElementChild?.getAttribute("data-kumo-component"),
    ).toBe("InputArea.Toolbar");
    expect(control?.lastElementChild?.className).toContain("border-t");
  });
});

describe("RichTextInputArea", () => {
  it("renders a hard formatting toolbar above the editable box", () => {
    render(<RichTextInputArea aria-label="Reply" />);

    expect(screen.getByRole("textbox")).toHaveProperty(
      "contentEditable",
      "true",
    );
    expect(screen.getByRole("button", { name: "Bold" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Italic" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bulleted list" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Inline code" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Code block" })).toBeTruthy();
  });

  it("applies formatting commands from toolbar buttons", () => {
    document.execCommand = vi.fn(() => true);
    const execCommand = vi
      .spyOn(document, "execCommand")
      .mockImplementation(() => true);
    render(<RichTextInputArea aria-label="Reply" />);

    fireEvent.click(screen.getByRole("button", { name: "Bold" }));

    expect(execCommand).toHaveBeenCalledWith("bold", false, undefined);
    execCommand.mockRestore();
  });

  it("applies inline code formatting", () => {
    document.execCommand = vi.fn(() => true);
    const execCommand = vi
      .spyOn(document, "execCommand")
      .mockImplementation(() => true);
    render(<RichTextInputArea aria-label="Reply" />);

    fireEvent.click(screen.getByRole("button", { name: "Inline code" }));

    expect(execCommand).toHaveBeenCalledWith(
      "insertHTML",
      false,
      "<code>code</code>",
    );
    execCommand.mockRestore();
  });

  it("applies code block formatting", () => {
    document.execCommand = vi.fn(() => true);
    const execCommand = vi
      .spyOn(document, "execCommand")
      .mockImplementation(() => true);
    render(<RichTextInputArea aria-label="Reply" />);

    fireEvent.click(screen.getByRole("button", { name: "Code block" }));

    expect(execCommand).toHaveBeenCalledWith(
      "insertHTML",
      false,
      "<pre><code>code</code></pre><div><br></div>",
    );
    execCommand.mockRestore();
  });

  it("inserts bulleted list markup from selected lines", () => {
    render(<RichTextInputArea aria-label="Reply" defaultValue={"One\nTwo"} />);

    const editor = screen.getByRole("textbox");
    selectEditorContents(editor);
    const button = screen.getByRole("button", { name: "Bulleted list" });
    fireEvent.mouseDown(button);
    fireEvent.click(button);

    expect(editor.innerHTML).toContain("<ul>");
    expect(editor.innerHTML).toContain("<li>One</li>");
    expect(editor.innerHTML).toContain("<li>Two</li>");
  });

  it("inserts numbered list markup from selected lines", () => {
    render(<RichTextInputArea aria-label="Reply" defaultValue={"One\nTwo"} />);

    const editor = screen.getByRole("textbox");
    selectEditorContents(editor);
    const button = screen.getByRole("button", { name: "Numbered list" });
    fireEvent.mouseDown(button);
    fireEvent.click(button);

    expect(editor.innerHTML).toContain("<ol>");
    expect(editor.innerHTML).toContain("<li>One</li>");
    expect(editor.innerHTML).toContain("<li>Two</li>");
  });

  it("converts selected bulleted lists to numbered lists", () => {
    render(
      <RichTextInputArea
        aria-label="Reply"
        defaultValue="<ul><li>One</li><li>Two</li></ul>"
      />,
    );

    const editor = screen.getByRole("textbox");
    selectEditorContents(editor);
    const button = screen.getByRole("button", { name: "Numbered list" });
    fireEvent.mouseDown(button);
    fireEvent.click(button);

    expect(editor.querySelector("ul")).toBeNull();
    expect(editor.querySelector("ol")?.innerHTML).toBe(
      "<li>One</li><li>Two</li>",
    );
  });

  it("converts selected numbered lists to bulleted lists", () => {
    render(
      <RichTextInputArea
        aria-label="Reply"
        defaultValue="<ol><li>One</li><li>Two</li></ol>"
      />,
    );

    const editor = screen.getByRole("textbox");
    selectEditorContents(editor);
    const button = screen.getByRole("button", { name: "Bulleted list" });
    fireEvent.mouseDown(button);
    fireEvent.click(button);

    expect(editor.querySelector("ol")).toBeNull();
    expect(editor.querySelector("ul")?.innerHTML).toBe(
      "<li>One</li><li>Two</li>",
    );
  });

  it("inserts quote markup from selected text", () => {
    render(<RichTextInputArea aria-label="Reply" defaultValue="Quoted text" />);

    const editor = screen.getByRole("textbox");
    selectEditorContents(editor);
    const button = screen.getByRole("button", { name: "Quote" });
    fireEvent.mouseDown(button);
    fireEvent.click(button);

    expect(editor.innerHTML).toContain("<blockquote>Quoted text</blockquote>");
  });

  it("inserts inline links from the link toolbar button", () => {
    document.execCommand = vi.fn(() => true);
    const execCommand = vi
      .spyOn(document, "execCommand")
      .mockImplementation(() => true);
    render(<RichTextInputArea aria-label="Reply" />);

    fireEvent.click(screen.getByRole("button", { name: "Insert link" }));
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Insert" }));

    expect(execCommand).toHaveBeenCalledWith(
      "insertHTML",
      false,
      '<a class="text-kumo-link underline underline-offset-[0.15em] decoration-[0.0625em] link-current transition-colors" href="https://example.com">https://example.com</a>',
    );
    execCommand.mockRestore();
  });

  it("inserts inline links with display text and normalizes bare domains", () => {
    document.execCommand = vi.fn(() => true);
    const execCommand = vi
      .spyOn(document, "execCommand")
      .mockImplementation(() => true);
    render(<RichTextInputArea aria-label="Reply" />);

    fireEvent.click(screen.getByRole("button", { name: "Insert link" }));
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "www.google.com" },
    });
    fireEvent.change(screen.getByLabelText("Display text"), {
      target: { value: "Google" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Insert" }));

    expect(execCommand).toHaveBeenCalledWith(
      "insertHTML",
      false,
      '<a class="text-kumo-link underline underline-offset-[0.15em] decoration-[0.0625em] link-current transition-colors" href="https://www.google.com">Google</a>',
    );
    execCommand.mockRestore();
  });

  it("opens editor links on modifier click", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(
      <RichTextInputArea
        aria-label="Reply"
        defaultValue={'<a href="https://example.com">Example</a>'}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: "Example" }), {
      metaKey: true,
    });

    expect(open).toHaveBeenCalledWith(
      "https://example.com/",
      "_blank",
      "noopener,noreferrer",
    );
    open.mockRestore();
  });

  it("reports edited HTML through onValueChange", () => {
    const onValueChange = vi.fn();
    render(
      <RichTextInputArea aria-label="Reply" onValueChange={onValueChange} />,
    );

    const editor = screen.getByRole("textbox");
    editor.innerHTML = "<strong>Hello</strong>";
    fireEvent.input(editor);

    expect(onValueChange).toHaveBeenCalledWith("<strong>Hello</strong>");
  });
});
