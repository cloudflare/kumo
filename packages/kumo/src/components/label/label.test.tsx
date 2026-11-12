import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";
import {
  KumoLocaleProvider,
  type KumoTranslations,
} from "../../utils/locale-provider";
import { Label } from "./label";

describe("Label", () => {
  it("keeps the default English labels", () => {
    render(
      <Label showOptional tooltip="Help">
        Name
      </Label>,
    );

    expect(screen.getByText("(optional)")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "More information" }),
    ).toBeTruthy();
  });

  it("uses labels from KumoLocaleProvider", () => {
    render(
      <KumoLocaleProvider
        translations={{
          label: {
            optional: "(opcional)",
            tooltip: "Mais informações",
          },
        }}
      >
        <Label showOptional tooltip="Ajuda">
          Nome
        </Label>
      </KumoLocaleProvider>,
    );

    expect(screen.getByText("(opcional)")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Mais informações" }),
    ).toBeTruthy();
  });

  it("accepts existing full translation objects without label translations", () => {
    const translations: KumoTranslations = {
      layerDialog: { close: "Fermer", cancel: "Annuler" },
    };

    render(
      <KumoLocaleProvider translations={translations}>
        <Label showOptional>Name</Label>
      </KumoLocaleProvider>,
    );

    expect(screen.getByText("(optional)")).toBeTruthy();
  });

  it("renders a custom optional label", () => {
    render(
      <Label showOptional optionalLabel={<strong>(opcional)</strong>}>
        Nome
      </Label>,
    );

    expect(screen.getByText("(opcional)").tagName).toBe("STRONG");
    expect(screen.queryByText("(optional)")).toBeNull();
  });

  it("opens the info popover on click, so touch and keyboard users reach it", async () => {
    const user = userEvent.setup();
    render(<Label tooltip="Billed per request">Plan</Label>);

    const trigger = screen.getByRole("button", { name: "More information" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    await user.click(trigger);
    expect((await screen.findByRole("dialog")).textContent).toContain(
      "Billed per request",
    );
  });

  it("uses a custom accessible label for the tooltip button", () => {
    render(
      <KumoLocaleProvider
        translations={{ label: { tooltip: "Ajuda do provedor" } }}
      >
        <Label tooltip="Ajuda" tooltipAriaLabel="Mais informações">
          Nome
        </Label>
      </KumoLocaleProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Mais informações" }),
    ).toBeTruthy();
  });
});
