import { describe, test, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Combobox } from "./combobox";

const fruits = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

describe("Combobox Playwright Interactions", () => {
  describe("TriggerInput", () => {
    test("clicking the input opens the listbox", async () => {
      const { getByPlaceholder, getByRole } = await render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput placeholder="Search fruits..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>,
      );

      // Listbox should not be visible initially
      await expect.element(getByRole("listbox")).not.toBeInTheDocument();

      // Click the input
      await getByPlaceholder("Search fruits...").click();

      // Listbox should now be visible
      await expect.element(getByRole("listbox")).toBeVisible();
    });

    test("focusing the input does NOT open the listbox (click required)", async () => {
      const { getByPlaceholder, getByRole } = await render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput placeholder="Search fruits..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>,
      );

      // Focus the input (use native focus on the element)
      getByPlaceholder("Search fruits...").element().focus();

      // Listbox should NOT be visible - focus alone doesn't open it
      // This is expected Base UI behavior: openOnInputClick applies to click, not focus
      await expect.element(getByRole("listbox")).not.toBeInTheDocument();
    });

    test("typing in the input opens the listbox and filters items", async () => {
      const { getByPlaceholder, getByRole } = await render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput placeholder="Search fruits..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>,
      );

      // Type in the input
      await getByPlaceholder("Search fruits...").fill("ban");

      // Listbox should be visible
      await expect.element(getByRole("listbox")).toBeVisible();

      // Should show filtered result
      await expect
        .element(getByRole("option", { name: "Banana" }))
        .toBeVisible();
    });

    test("clicking an option selects it", async () => {
      const { getByPlaceholder, getByRole } = await render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput placeholder="Search fruits..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>,
      );

      // Open by clicking input
      await getByPlaceholder("Search fruits...").click();

      // Click an option
      await getByRole("option", { name: "Cherry" }).click();

      // Input should now contain the selected value
      const input = getByPlaceholder("Search fruits...");
      await expect.element(input).toHaveValue("Cherry");
    });

    test("trigger button (caret icon) can be clicked to open listbox", async () => {
      const { getByPlaceholder, getByRole } = await render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput placeholder="Search fruits..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>,
      );

      // Find the trigger button - it's a button element inside the combobox wrapper
      // The trigger wraps the caret icon
      const inputWrapper =
        getByPlaceholder("Search fruits...").element().parentElement;
      const triggerButton = inputWrapper?.querySelector("button");

      expect(triggerButton, "trigger button should exist").toBeTruthy();

      // Click the trigger button
      triggerButton!.click();

      // Wait for listbox to appear
      await expect.element(getByRole("listbox")).toBeVisible();
    });

    test("trigger button can be located with Playwright locator pattern", async () => {
      const { getByPlaceholder, getByRole } = await render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput placeholder="Search fruits..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>,
      );

      // This mimics what a Playwright user would do:
      // await page.getByPlaceholder('Search fruits...').locator('..').getByRole('button').click()
      const input = getByPlaceholder("Search fruits...").element();
      const wrapper = input.parentElement!;
      const button = wrapper.querySelector("button");

      expect(button, "should find button sibling to input").toBeTruthy();

      // Verify clicking the button opens the listbox
      button!.click();
      await expect.element(getByRole("listbox")).toBeVisible();
    });

    test("trigger button can be located with CSS adjacent sibling selector (+button)", async () => {
      const { getByPlaceholder, getByRole } = await render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput placeholder="Search fruits..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>,
      );

      // Scott's pattern: page.getByPlaceholder('IATA').locator('+button')
      // This uses CSS adjacent sibling selector
      const input = getByPlaceholder("Search fruits...").element();

      // CSS: input + button (adjacent sibling)
      // NOTE: There's also a Clear button before the Trigger button!
      // The order in DOM is: input, [Clear button], Trigger button
      const adjacentButton =
        input.parentElement?.querySelector("input + button");

      expect(
        adjacentButton,
        "should find button via CSS adjacent sibling selector (input + button)",
      ).toBeTruthy();

      // Verify clicking the button opens the listbox
      adjacentButton!.click();
      await expect.element(getByRole("listbox")).toBeVisible();
    });

    test("trigger button has zero size due to p-0 and absolute icon positioning", async () => {
      const { getByPlaceholder } = await render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput placeholder="Search fruits..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>,
      );

      const input = getByPlaceholder("Search fruits...").element();
      const wrapper = input.parentElement!;

      // Find the trigger button (last button in wrapper)
      const buttons = wrapper.querySelectorAll("button");
      const triggerButton = buttons[buttons.length - 1];

      const rect = triggerButton.getBoundingClientRect();

      // Document the issue: button has p-0 and its icon is absolutely positioned
      // relative to the wrapper, so the button itself may have minimal/zero size
      console.log("Trigger button dimensions:", {
        width: rect.width,
        height: rect.height,
        classList: triggerButton.className,
      });

      // The button exists but may have very small dimensions
      expect(triggerButton).toBeTruthy();
    });
  });

  describe("TriggerValue", () => {
    test("clicking TriggerValue opens the listbox", async () => {
      const { getByRole } = await render(
        <Combobox items={fruits} defaultValue="Apple">
          <Combobox.TriggerValue placeholder="Select a fruit" />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>,
      );

      // TriggerValue renders as a button with role="combobox"
      const trigger = getByRole("combobox");
      await expect.element(trigger).toBeVisible();

      // Click to open
      await trigger.click();

      // Listbox should be visible
      await expect.element(getByRole("listbox")).toBeVisible();
    });
  });
});
