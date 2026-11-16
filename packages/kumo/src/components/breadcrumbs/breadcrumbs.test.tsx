import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";
import {
  KumoLocaleProvider,
  type KumoTranslations,
} from "../../utils/locale-provider";
import { Breadcrumbs } from "./index";

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
