import { describe, expect, test, vi } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { Combobox } from "../combobox/combobox";
import { Select } from "../select/select";
import { Toolbar } from "./toolbar";

const fruits = ["Apple", "Banana", "Cherry"];

describe("Toolbar.Button interactions", () => {
  test("disabled buttons expose their state and cannot be activated", async () => {
    const onDisabledClick = vi.fn();
    const onEnabledClick = vi.fn();
    const { getByRole } = await render(
      <Toolbar>
        <Toolbar.Button disabled onClick={onDisabledClick}>
          Disabled
        </Toolbar.Button>
        <Toolbar.Button onClick={onEnabledClick}>Enabled</Toolbar.Button>
      </Toolbar>,
    );

    const disabled = getByRole("button", { name: "Disabled" });
    const enabled = getByRole("button", { name: "Enabled" });
    const disabledElement = disabled.element() as HTMLButtonElement;
    const enabledElement = enabled.element() as HTMLButtonElement;

    await expect.element(disabled).toHaveAttribute("aria-disabled", "true");
    disabledElement.click();
    enabledElement.click();

    expect(onDisabledClick).not.toHaveBeenCalled();
    expect(onEnabledClick).toHaveBeenCalledOnce();
  });

  test("loading disables the outer toolbar control", async () => {
    const onClick = vi.fn();
    const { getByRole } = await render(
      <Toolbar>
        <Toolbar.Button aria-label="Save" loading onClick={onClick}>
          Save
        </Toolbar.Button>
      </Toolbar>,
    );

    const button = getByRole("button", { name: "Save" });
    const buttonElement = button.element() as HTMLButtonElement;
    await expect.element(button).toHaveAttribute("aria-disabled", "true");
    buttonElement.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  test("focusableWhenDisabled controls roving focus", async () => {
    const { getByRole } = await render(
      <Toolbar>
        <Toolbar.Button>Before</Toolbar.Button>
        <Toolbar.Button disabled>Focusable disabled</Toolbar.Button>
        <Toolbar.Button disabled focusableWhenDisabled={false}>
          Skipped disabled
        </Toolbar.Button>
        <Toolbar.Button>After</Toolbar.Button>
      </Toolbar>,
    );

    const before = getByRole("button", { name: "Before" });
    const focusableDisabled = getByRole("button", {
      name: "Focusable disabled",
    });
    const after = getByRole("button", { name: "After" });

    await before.click();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(focusableDisabled).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(after).toHaveFocus();
  });
});

describe("Toolbar popup control interactions", () => {
  test("Select opens and selects through a rendered Toolbar.Button", async () => {
    const { getByRole } = await render(
      <Toolbar>
        <Toolbar.Button>Before</Toolbar.Button>
        <Select
          aria-label="Sort records"
          placeholder="Sort by"
          render={<Toolbar.Button />}
        >
          <Select.Option value="name">Name</Select.Option>
          <Select.Option value="created">Created</Select.Option>
        </Select>
      </Toolbar>,
    );

    const trigger = getByRole("combobox", { name: "Sort records" });
    await trigger.click();
    await expect
      .element(getByRole("option", { name: "Created" }))
      .toBeVisible();
    await getByRole("option", { name: "Created" }).click();
    await expect.element(trigger).toHaveTextContent("created");
  });

  test("Combobox opens, filters, and selects through a rendered Toolbar.Input", async () => {
    const { getByRole } = await render(
      <Toolbar>
        <Combobox items={fruits}>
          <Combobox.TriggerInput
            aria-label="Search fruits"
            render={<Toolbar.Input />}
          />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>
      </Toolbar>,
    );

    const input = getByRole("combobox", { name: "Search fruits" });
    await input.fill("ban");
    await expect.element(getByRole("listbox")).toBeVisible();
    await expect.element(getByRole("option", { name: "Banana" })).toBeVisible();
    await getByRole("option", { name: "Banana" }).click();
    await expect.element(input).toHaveValue("Banana");
  });

  test("composed popup controls participate in toolbar focus movement", async () => {
    const { getByRole } = await render(
      <Toolbar>
        <Toolbar.Button>Before</Toolbar.Button>
        <Select aria-label="Sort records" render={<Toolbar.Button />}>
          <Select.Option value="name">Name</Select.Option>
        </Select>
        <Combobox items={fruits} defaultValue="Apple">
          <Combobox.TriggerInput
            aria-label="Fruit"
            render={<Toolbar.Input />}
          />
        </Combobox>
        <Toolbar.Button>After</Toolbar.Button>
      </Toolbar>,
    );

    const before = getByRole("button", { name: "Before" });
    const select = getByRole("combobox", { name: "Sort records" });
    const input = getByRole("combobox", { name: "Fruit" });
    const after = getByRole("button", { name: "After" });

    await before.click();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(select).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(input).toHaveFocus();

    const inputElement = input.element() as HTMLInputElement;
    inputElement.setSelectionRange(
      inputElement.value.length,
      inputElement.value.length,
    );
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(after).toHaveFocus();
  });
});
