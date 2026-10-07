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
});
