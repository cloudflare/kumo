import type { CSSProperties } from "react";
import { describe, expect, test } from "vite-plus/test";
import { render } from "vitest-browser-react";
import { Button } from "./button";

const customTheme = {
  "--text-color-kumo-button-emphasis": "rgb(17 24 39)",
} as CSSProperties;

describe("Button emphasis theme", () => {
  test("preserves the default white foreground", async () => {
    const { getByRole } = await render(
      <>
        <Button variant="primary">Save</Button>
        <Button variant="destructive">Delete</Button>
      </>,
    );

    for (const button of [
      getByRole("button", { name: "Save" }),
      getByRole("button", { name: "Delete" }),
    ]) {
      await expect.element(button).toBeVisible();
      expect(getComputedStyle(button.element()).color).toBe(
        "rgb(255, 255, 255)",
      );
    }
  });

  test("uses a custom semantic foreground in enabled, disabled, and loading states", async () => {
    const { getByRole } = await render(
      <div style={customTheme}>
        <Button variant="primary">Save</Button>
        <Button variant="destructive" disabled>
          Delete
        </Button>
        <Button variant="primary" loading>
          Loading
        </Button>
      </div>,
    );

    const save = getByRole("button", { name: "Save" });
    const deleteButton = getByRole("button", { name: "Delete" });
    const loading = getByRole("button", { name: "Loading" });

    await Promise.all([
      expect.element(save).toBeVisible(),
      expect.element(deleteButton).toBeVisible(),
      expect.element(loading).toBeVisible(),
    ]);

    for (const button of [save, deleteButton, loading]) {
      expect(getComputedStyle(button.element()).color).toBe("rgb(17, 24, 39)");
    }
    expect(getComputedStyle(deleteButton.element()).opacity).toBe("0.5");
    expect(getComputedStyle(loading.element()).opacity).toBe("0.5");
  });
});
