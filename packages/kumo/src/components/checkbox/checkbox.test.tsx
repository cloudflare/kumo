import { describe, expect, it } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { KumoLocaleProvider } from "../../utils/locale-provider";
import { Checkbox } from "./checkbox";

describe("Checkbox.Group", () => {
  it("resets inherited fieldset padding", () => {
    const { container } = render(
      <Checkbox.Group legend="Preferences">
        <Checkbox.Item label="Email notifications" value="email" />
      </Checkbox.Group>,
    );

    expect(screen.getByText("Preferences")).toBeTruthy();
    expect(container.querySelector("fieldset")?.className).toContain("p-0");
  });
});

describe("Checkbox", () => {
  it("forwards translated label text", () => {
    render(
      <KumoLocaleProvider
        translations={{
          label: {
            optional: "(opcional)",
            tooltip: "Mais informações",
          },
        }}
      >
        <Checkbox label="Atualizações" required={false} labelTooltip="Ajuda" />
      </KumoLocaleProvider>,
    );

    expect(screen.getByText("(opcional)")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Mais informações" }),
    ).toBeTruthy();
  });
});
