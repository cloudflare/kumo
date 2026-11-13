import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { KumoLocaleProvider } from "../../utils/locale-provider";
import { Field } from "./field";

describe("Field", () => {
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
        <Field label="Nome" required={false} labelTooltip="Ajuda">
          <input />
        </Field>
      </KumoLocaleProvider>,
    );

    expect(screen.getByText("(opcional)")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Mais informações" }),
    ).toBeTruthy();
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["true", true],
    ["false", false],
    ["an empty string", ""],
  ])("renders no label element when label is %s", (_, label) => {
    const { container } = render(
      <Field label={label} description="Help text">
        <input aria-label="Name" />
      </Field>,
    );

    expect(container.querySelector("label")).toBeNull();
    expect(screen.getByText("Help text")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Name" })).toBeTruthy();
  });

  it.each([
    ["text", "Name", {}],
    ["the number 0", 0, {}],
    ["only an optional indicator", undefined, { required: false }],
    ["only a tooltip", undefined, { labelTooltip: "More" }],
  ])("keeps the label element for %s", (_, label, props) => {
    const { container } = render(
      <Field label={label} {...props}>
        <input />
      </Field>,
    );

    expect(container.querySelector("label")).not.toBeNull();
  });

  it("renders no label element for an empty tooltip", () => {
    const { container } = render(
      <Field label={undefined} labelTooltip="">
        <input />
      </Field>,
    );

    expect(container.querySelector("label")).toBeNull();
  });

  it("still hides the label element with hideLabel", () => {
    const { container } = render(
      <Field label="Name" hideLabel>
        <input />
      </Field>,
    );

    expect(container.querySelector("label")).toBeNull();
  });
});
