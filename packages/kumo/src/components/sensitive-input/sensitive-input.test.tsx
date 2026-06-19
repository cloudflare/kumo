import { afterEach, describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SensitiveInput, type SensitiveInputLabels } from "./sensitive-input";

describe("SensitiveInput", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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

  it("associates description with an aria-label-only input", () => {
    const { container } = render(
      <SensitiveInput
        aria-label="API Key"
        description="Use a key with read-only permissions"
      />,
    );

    const input = container.querySelector("input");
    const description = screen.getByText("Use a key with read-only permissions");

    expect(description.id).toBeTruthy();
    expect(input?.getAttribute("aria-describedby")).toBe(description.id);
    expect(container.querySelector("label")).toBeNull();
  });

  it("associates error with an aria-label-only input", () => {
    const { container } = render(
      <SensitiveInput aria-label="API Key" error="Invalid API key" />,
    );

    const input = container.querySelector("input");
    const error = screen.getByText("Invalid API key");

    expect(error.id).toBeTruthy();
    expect(input?.getAttribute("aria-invalid")).toBe("true");
    expect(input?.getAttribute("aria-describedby")).toBe(error.id);
    expect(container.querySelector("label")).toBeNull();
  });

  it("uses sibling native buttons instead of a button-role container", () => {
    const { container } = render(
      <SensitiveInput label="API Key" defaultValue="secret-value" />,
    );

    expect(
      container.querySelector('[data-kumo-part="masked-container"]'),
    ).toBeNull();
    expect(container.querySelector('[role="button"]')).toBeNull();
    expect(
      screen.getByRole("button", { name: "Reveal value: API Key" }),
    ).toBeInstanceOf(HTMLButtonElement);
  });

  it("uses non-layout hit areas for copy and visibility controls", async () => {
    const user = userEvent.setup();
    render(<SensitiveInput label="API Key" defaultValue="secret-value" />);

    const copyButton = screen.getByRole("button", {
      name: "Copy to clipboard",
    });
    expect(copyButton.className).toContain("before:min-h-6");
    expect(copyButton.className).toContain("before:min-w-6");
    expect(copyButton.className).not.toContain("min-h-6 min-w-6");

    await user.click(
      screen.getByRole("button", { name: "Reveal value: API Key" }),
    );

    const visibilityButton = screen.getByRole("button", {
      name: "Hide value: API Key",
    });
    expect(visibilityButton.className).toContain("before:min-h-6");
    expect(visibilityButton.className).toContain("before:min-w-6");
    expect(visibilityButton.className).not.toContain("size-6");
    expect(visibilityButton.querySelector("svg")?.getAttribute("class")).toContain(
      "size-4",
    );
  });

  it("uses localized labels and live-region status text", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const navigatorWithClipboard = Object.create(navigator) as Navigator;
    Object.defineProperty(navigatorWithClipboard, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    vi.stubGlobal("navigator", navigatorWithClipboard);
    const labels: SensitiveInputLabels = {
      maskedValue: "••••",
      clickToReveal: "Clique para revelar",
      revealValue: "Revelar valor",
      hideValue: "Ocultar valor",
      copy: "Copiar",
      copyToClipboard: "Copiar para a área de transferência",
      copied: "Copiado",
      valueRevealed: "Valor revelado",
      valueHidden: "Valor oculto",
      copiedToClipboard: "Copiado para a área de transferência",
      revealInstruction: "Pressione Enter ou Espaço para revelar.",
    };

    render(
      <SensitiveInput
        label="Chave de API"
        defaultValue="secret-value"
        labels={labels}
      />,
    );

    expect(screen.getByText("••••")).toBeTruthy();
    expect(screen.getByText("Clique para revelar")).toBeTruthy();
    expect(screen.getByText("Valor oculto")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "Revelar valor: Chave de API" }),
    );
    expect(
      screen.getByRole("textbox", { name: "Chave de API" }).getAttribute("type"),
    ).toBe("text");
    expect(screen.getByText("Valor revelado")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "Ocultar valor: Chave de API" }),
    );
    expect(screen.getByText("Valor oculto")).toBeTruthy();

    await user.click(
      screen.getByRole("button", {
        name: "Copiar para a área de transferência",
      }),
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("secret-value");
    });
    expect(screen.getByRole("button", { name: "Copiado" })).toBeTruthy();
    expect(
      screen.getByText("Copiado para a área de transferência"),
    ).toBeTruthy();
  });

  it("supports keyboard reveal and hide", async () => {
    const user = userEvent.setup();
    render(<SensitiveInput label="API Key" defaultValue="secret-value" />);

    screen.getByRole("button", { name: "Reveal value: API Key" }).focus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("textbox", { name: "API Key" }).getAttribute("type"),
    ).toBe("text");
    expect(screen.getByText("Value revealed")).toBeTruthy();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Reveal value: API Key" }),
      ).toBeTruthy();
    });
    expect(screen.getByText("Value hidden")).toBeTruthy();
  });

  it("preserves a user-provided aria-label across reveal and hide controls", async () => {
    const user = userEvent.setup();
    render(
      <SensitiveInput
        aria-label="Production API token"
        defaultValue="secret-value"
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Reveal value: Production API token",
      }),
    );

    expect(
      screen
        .getByRole("textbox", { name: "Production API token" })
        .getAttribute("type"),
    ).toBe("text");
    expect(
      screen.getByRole("button", { name: "Hide value: Production API token" }),
    ).toBeTruthy();
  });

  it("does not use a generic fallback name when no accessible name is provided", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<SensitiveInput defaultValue="secret-value" />);

    expect(
      screen.queryByRole("button", { name: "Reveal value: Sensitive value" }),
    ).toBeNull();
    expect(container.querySelector("input")?.getAttribute("aria-label")).not.toBe(
      "Sensitive value",
    );
    expect(screen.getByRole("button", { name: "Reveal value" })).toBeTruthy();
  });

  it("warns when no accessible name is provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<SensitiveInput defaultValue="secret-value" />);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "[Kumo SensitiveInput]: SensitiveInput must have an accessible name.",
      ),
    );
  });

  it("does not warn when a string label provides the accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<SensitiveInput label="API Key" defaultValue="secret-value" />);

    expect(warn).not.toHaveBeenCalled();
  });

  it("does not warn when aria-label provides the accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <SensitiveInput
        aria-label="Production API token"
        defaultValue="secret-value"
      />,
    );

    expect(warn).not.toHaveBeenCalled();
  });

  it("does not warn or override rich labels associated with aria-labelledby", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <SensitiveInput
        label={
          <span id="token-label">
            Production <strong>API token</strong>
          </span>
        }
        aria-labelledby="token-label"
        defaultValue="secret-value"
      />,
    );

    expect(warn).not.toHaveBeenCalled();
    const revealButton = screen.getByRole("button", {
      name: /Reveal value.*Production API token/,
    });
    expect(revealButton.getAttribute("aria-labelledby")).toContain(
      "token-label",
    );
    expect(revealButton.hasAttribute("aria-label")).toBe(false);
  });
});
