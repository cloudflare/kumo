import { afterEach, describe, expect, test } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { Dialog } from "./dialog";
import { Button } from "../button/button";
import { LayerCard } from "../layer-card/layer-card";

afterEach(async () => {
  await page.viewport(1280, 720);
});

describe("Dialog viewport bounds", () => {
  test.each([
    [390, 600, "dialog"],
    [800, 400, "dialog"],
    [390, 600, "alertdialog"],
    [800, 400, "alertdialog"],
  ] as const)(
    "keeps a tall %s × %s %s scrollable",
    async (width, height, role) => {
      await page.viewport(width, height);
      const { getByRole } = await render(
        <Dialog.Root role={role}>
          <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
          <Dialog className="p-6">
            <Dialog.Title>Review settings</Dialog.Title>
            <Dialog.Description>
              Review all settings before saving.
            </Dialog.Description>
            <div style={{ height: 900 }}>Long form content</div>
            <Dialog.Close render={<Button />}>Save settings</Dialog.Close>
          </Dialog>
        </Dialog.Root>,
      );
      await getByRole("button", { name: "Open" }).click();
      const popup = getByRole(role).element();
      await expect.poll(() => getComputedStyle(popup).opacity).toBe("1");
      expect(popup.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        height - 16,
      );
      expect(popup.scrollHeight).toBeGreaterThan(popup.clientHeight);
      expect(getComputedStyle(popup).overflowY).toBe("auto");
      expect(getComputedStyle(popup).overscrollBehaviorY).toBe("contain");
      popup.scrollTop = popup.scrollHeight;
      await expect.poll(() => popup.scrollTop).toBeGreaterThan(0);
      const save = getByRole("button", { name: "Save settings" });
      expect(save.element().getBoundingClientRect().bottom).toBeLessThanOrEqual(
        height,
      );
      await save.click();
      await expect.element(getByRole("button", { name: "Open" })).toHaveFocus();
    },
  );

  test("does not shrink and clip structured LayerCard sections", async () => {
    await page.viewport(800, 400);
    const { getByRole } = await render(
      <Dialog.Root>
        <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
        <Dialog>
          <LayerCard.Secondary>
            <Dialog.Title>Layered settings</Dialog.Title>
          </LayerCard.Secondary>
          <LayerCard.Primary>
            <Dialog.Description>Review all settings.</Dialog.Description>
            <div style={{ height: 900, flexShrink: 0 }}>Long form content</div>
          </LayerCard.Primary>
          <LayerCard.Secondary>
            <Dialog.Close render={<Button />}>Save settings</Dialog.Close>
          </LayerCard.Secondary>
        </Dialog>
      </Dialog.Root>,
    );
    await getByRole("button", { name: "Open" }).click();
    const popup = getByRole("dialog").element();
    await expect.poll(() => getComputedStyle(popup).opacity).toBe("1");
    expect(popup.getBoundingClientRect().bottom).toBeLessThanOrEqual(384);
    expect(popup.scrollHeight).toBeGreaterThan(900);
    popup.scrollTop = popup.scrollHeight;
    const save = getByRole("button", { name: "Save settings" });
    await expect
      .poll(() => save.element().getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(400);
    await userEvent.keyboard("{Escape}");
    await expect.element(getByRole("button", { name: "Open" })).toHaveFocus();
  });

  test("keeps short content at its natural height and responds to viewport changes", async () => {
    await page.viewport(800, 700);
    const { getByRole } = await render(
      <Dialog.Root>
        <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
        <Dialog className="p-6">
          <Dialog.Title>Confirm settings</Dialog.Title>
          <Dialog.Description>Ready to save these settings?</Dialog.Description>
          <div style={{ height: 200 }} />
          <Dialog.Close render={<Button />}>Save settings</Dialog.Close>
        </Dialog>
      </Dialog.Root>,
    );
    await getByRole("button", { name: "Open" }).click();
    const popup = getByRole("dialog").element();
    await expect.poll(() => getComputedStyle(popup).opacity).toBe("1");
    expect(popup.clientHeight).toBeLessThan(400);
    expect(popup.scrollHeight).toBe(popup.clientHeight);
    await page.viewport(800, 300);
    await expect
      .poll(() => popup.getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(284);
    expect(popup.scrollHeight).toBeGreaterThan(popup.clientHeight);
    // Keyboard navigation must scroll the final action into view, too.
    await userEvent.tab();
    const save = getByRole("button", { name: "Save settings" });
    await expect.element(save).toHaveFocus();
    expect(save.element().getBoundingClientRect().bottom).toBeLessThanOrEqual(
      300,
    );
  });
});
