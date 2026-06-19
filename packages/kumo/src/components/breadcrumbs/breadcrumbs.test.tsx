import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HouseIcon } from "@phosphor-icons/react";
import { Breadcrumb } from "./breadcrumbs";

function mockClipboardWrite() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

describe("Breadcrumbs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (navigator as Partial<Navigator>).clipboard;
  });

  it("uses default accessible labels", async () => {
    const user = userEvent.setup();

    render(
      <Breadcrumb>
        <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
        <Breadcrumb.Separator />
        <Breadcrumb.Current>Docs</Breadcrumb.Current>
        <Breadcrumb.Clipboard text="#docs" />
      </Breadcrumb>,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();

    const copyButton = screen.getAllByRole("button", { name: "Copy" })[0];
    await user.hover(copyButton);

    expect(await screen.findByText("Click to copy")).toBeTruthy();
  });

  it("reveals clipboard controls on keyboard focus", () => {
    render(
      <Breadcrumb>
        <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
        <Breadcrumb.Separator />
        <Breadcrumb.Current>Docs</Breadcrumb.Current>
        <Breadcrumb.Clipboard text="#docs" />
      </Breadcrumb>,
    );

    const copyButton = screen.getAllByRole("button", { name: "Copy" })[0];

    act(() => copyButton.focus());

    expect(document.activeElement).toBe(copyButton);
    expect(copyButton.className).toContain("focus:opacity-100");
    expect(copyButton.className).toContain("focus-visible:opacity-100");
    expect(copyButton.className).toContain("group-focus-within:opacity-100");
  });

  it("hides decorative icons from assistive technology", () => {
    const { container } = render(
      <Breadcrumb>
        <Breadcrumb.Link href="#" icon={<HouseIcon data-testid="home-icon" />}>
          Home
        </Breadcrumb.Link>
        <Breadcrumb.Separator />
        <Breadcrumb.Current icon={<HouseIcon data-testid="docs-icon" />}>
          Docs
        </Breadcrumb.Current>
        <Breadcrumb.Clipboard text="#docs" />
      </Breadcrumb>,
    );

    const homeIcon = container.querySelector('[data-testid="home-icon"]');
    const docsIcon = container.querySelector('[data-testid="docs-icon"]');
    const separatorIcon = container.querySelector(
      '[aria-hidden="true"] > svg[viewBox="0 0 24 24"]',
    );
    const copyButtonIcon = screen
      .getAllByRole("button", { name: "Copy" })[0]
      .querySelector("svg");

    expect(homeIcon?.getAttribute("aria-hidden")).toBe("true");
    expect(homeIcon?.getAttribute("focusable")).toBe("false");
    expect(docsIcon?.getAttribute("aria-hidden")).toBe("true");
    expect(docsIcon?.getAttribute("focusable")).toBe("false");
    expect(separatorIcon?.getAttribute("aria-hidden")).toBe("true");
    expect(separatorIcon?.getAttribute("focusable")).toBe("false");
    expect(copyButtonIcon?.getAttribute("aria-hidden")).toBe("true");
    expect(copyButtonIcon?.getAttribute("focusable")).toBe("false");
  });

  it("uses localized root and clipboard labels", async () => {
    const user = userEvent.setup();
    const writeText = mockClipboardWrite();

    render(
      <Breadcrumb
        labels={{
          navigation: "Trilha de navegação",
          copyAction: "Copiar",
          copyTooltip: "Clique para copiar",
          copiedFeedback: "Copiado",
        }}
      >
        <Breadcrumb.Link href="#">Início</Breadcrumb.Link>
        <Breadcrumb.Separator />
        <Breadcrumb.Current>Documentação</Breadcrumb.Current>
        <Breadcrumb.Clipboard text="#documentacao" />
      </Breadcrumb>,
    );

    expect(
      screen.getByRole("navigation", { name: "Trilha de navegação" }),
    ).toBeTruthy();

    const copyButton = screen.getAllByRole("button", { name: "Copiar" })[0];
    await user.hover(copyButton);
    expect(await screen.findByText("Clique para copiar")).toBeTruthy();

    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith("#documentacao");
    await waitFor(() => expect(screen.getByText("Copiado")).toBeTruthy());
  });

  it("allows clipboard labels to override root labels", async () => {
    const user = userEvent.setup();
    mockClipboardWrite();

    render(
      <Breadcrumb
        labels={{
          navigation: "Trilha de navegação",
          copyAction: "Copiar",
          copiedFeedback: "Copiado",
        }}
      >
        <Breadcrumb.Current>Página atual</Breadcrumb.Current>
        <Breadcrumb.Clipboard
          text="#atual"
          labels={{
            copyAction: "Copiar link",
            copiedFeedback: "Link copiado",
          }}
        />
      </Breadcrumb>,
    );

    const copyButton = screen.getAllByRole("button", {
      name: "Copiar link",
    })[0];
    await user.click(copyButton);

    await waitFor(() =>
      expect(screen.getByText("Link copiado")).toBeTruthy(),
    );
  });
});
