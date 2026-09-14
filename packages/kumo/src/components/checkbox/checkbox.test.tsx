import { describe, expect, it } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
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
