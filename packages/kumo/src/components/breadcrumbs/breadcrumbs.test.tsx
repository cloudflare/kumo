import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";
import {
  KumoLocaleProvider,
  type KumoTranslations,
} from "../../utils/locale-provider";
import { Breadcrumbs } from "./index";
import { forwardRef } from "react";
import { LinkProvider, type RouterLinkProps } from "../../utils/link-provider";

function Trail(props: { "aria-label"?: string }) {
  return (
    <Breadcrumbs {...props}>
      <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Settings</Breadcrumbs.Current>
      <Breadcrumbs.Clipboard text="/settings" />
    </Breadcrumbs>
  );
}

describe("Breadcrumbs", () => {
  it("keeps the default English labels", () => {
    render(<Trail />);

    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Copy" })[0]).toBeTruthy();
  });

  it("uses labels from KumoLocaleProvider", () => {
    render(
      <KumoLocaleProvider
        translations={{
          breadcrumbs: { label: "Fil d'Ariane", copy: "Copier" },
        }}
      >
        <Trail />
      </KumoLocaleProvider>,
    );

    expect(
      screen.getByRole("navigation", { name: "Fil d'Ariane" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Copier" })[0]).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Copy" })).toBeNull();
  });

  it("shows the translated copy tooltip on hover", async () => {
    render(
      <KumoLocaleProvider
        translations={{ breadcrumbs: { copyTooltip: "Cliquer pour copier" } }}
      >
        <Trail />
      </KumoLocaleProvider>,
    );
    const user = userEvent.setup();

    await user.hover(screen.getAllByRole("button", { name: "Copy" })[0]);

    expect(await screen.findByText("Cliquer pour copier")).toBeTruthy();
  });

  it("accepts existing full translation objects without breadcrumbs translations", () => {
    const translations: KumoTranslations = {
      layerDialog: { close: "Fermer", cancel: "Annuler" },
    };

    render(
      <KumoLocaleProvider translations={translations}>
        <Trail />
      </KumoLocaleProvider>,
    );

    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeTruthy();
  });

  it("prefers the aria-label prop over the provider label", () => {
    render(
      <KumoLocaleProvider
        translations={{ breadcrumbs: { label: "Fil d'Ariane" } }}
      >
        <Trail aria-label="Chemin de la page" />
      </KumoLocaleProvider>,
    );

    expect(
      screen.getByRole("navigation", { name: "Chemin de la page" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("navigation", { name: "Fil d'Ariane" }),
    ).toBeNull();
  });
});

const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function RouterLink(props, ref) {
    // oxlint-disable-next-line anchor-has-content
    return <a ref={ref} data-router="" {...props} />;
  },
);

describe("Breadcrumbs links with LinkProvider", () => {
  it("renders links through the router with href", () => {
    render(
      <LinkProvider router={RouterLink}>
        <Trail />
      </LinkProvider>,
    );

    const links = screen.getAllByRole("link", { name: "Home" });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.hasAttribute("data-router")).toBe(true);
      expect(link.getAttribute("href")).toBe("/");
      expect(link.hasAttribute("to")).toBe(false);
    }
  });

  it("hides the visible new-tab icon with newTabIcon={false}", () => {
    render(
      <LinkProvider externalLinks="new-tab">
        <Breadcrumbs>
          <Breadcrumbs.Link href="https://example.com/a">
            Shown
          </Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Link href="https://example.com/b" newTabIcon={false}>
            Hidden
          </Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Here</Breadcrumbs.Current>
        </Breadcrumbs>
      </LinkProvider>,
    );

    for (const link of screen.getAllByRole("link", {
      name: "Shown (opens in a new tab)",
    })) {
      expect(link.hasAttribute("data-kumo-new-tab-icon")).toBe(true);
    }
    for (const link of screen.getAllByRole("link", {
      name: "Hidden (opens in a new tab)",
    })) {
      expect(link.hasAttribute("data-kumo-new-tab-icon")).toBe(false);
    }
  });
});
