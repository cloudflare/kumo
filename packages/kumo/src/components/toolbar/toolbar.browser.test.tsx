import { describe, expect, test } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { Combobox } from "../combobox/combobox";
import { Select } from "../select/select";
import { Toolbar } from "./toolbar";

const fruits = ["Apple", "Banana", "Cherry"];

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
