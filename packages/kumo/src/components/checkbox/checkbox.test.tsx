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

  it("joins vertical card items into one card with dividers", () => {
    const { container } = render(
      <Checkbox.Group legend="Products" appearance="card">
        <Checkbox.Item label="Web traffic" value="gateway" />
        <Checkbox.Item label="AI prompts" value="ai" />
      </Checkbox.Group>,
    );

    const labels = container.querySelectorAll("label");
    expect(labels[0].parentElement?.className).toContain("rounded-lg");
    expect(labels[0].parentElement?.className).toContain("ring-kumo-line");
    for (const label of labels) {
      expect(label.className).toContain("border-b");
      expect(label.className).not.toContain("rounded-lg");
      // Card items place the checkbox after the label by default.
      expect(label.firstElementChild?.getAttribute("data-kumo-part")).not.toBe(
        "item",
      );
    }
  });

  it("joins horizontal card items into one two-column card", () => {
    const { container } = render(
      <Checkbox.Group
        legend="Products"
        appearance="card"
        orientation="horizontal"
      >
        <Checkbox.Item label="Web traffic" value="gateway" />
        <Checkbox.Item label="AI prompts" value="ai" />
        <Checkbox.Item label="Outbound email" value="email" />
      </Checkbox.Group>,
    );

    const labels = container.querySelectorAll("label");
    expect(labels[0].parentElement?.className).toContain("grid-cols-2");
    for (const label of labels) {
      expect(label.className).toContain("odd:border-r");
    }
  });

  it("renders card item descriptions", () => {
    render(
      <Checkbox.Group legend="Products" appearance="card">
        <Checkbox.Item
          label="Web traffic"
          description="Gateway HTTP policies"
          value="gateway"
        />
      </Checkbox.Group>,
    );

    expect(screen.getByText("Gateway HTTP policies")).toBeTruthy();
  });

  it("keeps the checkbox first in default appearance", () => {
    const { container } = render(
      <Checkbox.Group legend="Products">
        <Checkbox.Item label="Web traffic" value="gateway" />
      </Checkbox.Group>,
    );

    const label = container.querySelector("label");
    expect(label?.firstElementChild?.getAttribute("data-kumo-part")).toBe(
      "item",
    );
    expect(label?.className).not.toContain("flex-row-reverse");
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
