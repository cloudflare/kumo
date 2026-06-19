import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("associates group description and error text with the group fieldset", () => {
    const { container } = render(
      <Checkbox.Group
        legend="Preferences"
        error="Select at least one preference"
        description="Choose all that apply."
      >
        <Checkbox.Item label="Email" value="email" />
      </Checkbox.Group>,
    );

    const fieldset = container.querySelector("fieldset");
    const group = container.querySelector('[role="group"]');
    const error = screen.getByText("Select at least one preference");
    const description = screen.getByText("Choose all that apply.");

    expect(error.id).toBeTruthy();
    expect(description.id).toBeTruthy();
    expect(error.getAttribute("role")).toBe("alert");
    expect(fieldset?.getAttribute("aria-invalid")).toBe("true");
    expect(group?.getAttribute("aria-invalid")).toBe("true");
    expect(fieldset?.getAttribute("aria-describedby")).toBe(
      `${error.id} ${description.id}`,
    );
    expect(group?.getAttribute("aria-describedby")).toBe(
      `${error.id} ${description.id}`,
    );
  });
});
