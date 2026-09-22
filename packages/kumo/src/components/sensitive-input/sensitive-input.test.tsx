import { afterEach, describe, it, expect, vi } from "vite-plus/test";
import { createElement } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { SensitiveInput } from "./sensitive-input";

describe("SensitiveInput", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

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

  it("ignores stale completions and resets after the latest successful click", async () => {
    vi.useFakeTimers();
    let resolveFirstCopy!: () => void;
    const pendingFirstCopy = new Promise<void>((resolve) => {
      resolveFirstCopy = resolve;
    });
    const writeText = vi
      .fn()
      .mockReturnValueOnce(pendingFirstCopy)
      .mockResolvedValueOnce(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<SensitiveInput defaultValue="secret-value" />);
    const copyButton = screen.getByRole("button", {
      name: "Copy to clipboard",
    });

    fireEvent.click(copyButton);
    fireEvent.click(copyButton);
    await act(() => Promise.resolve());
    expect(copyButton.getAttribute("aria-label")).toBe("Copied");

    await act(async () => vi.advanceTimersByTime(1000));
    await act(async () => {
      resolveFirstCopy();
      await pendingFirstCopy;
    });
    await act(async () => vi.advanceTimersByTime(1000));

    expect(copyButton.getAttribute("aria-label")).toBe("Copy to clipboard");
  });
});
