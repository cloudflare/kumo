import { useState } from "react";
import { describe, expect, test } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { Combobox } from "../combobox/combobox";
import { Select } from "../select/select";
import { Toolbar } from "./toolbar";

const fruits = ["Apple", "Banana", "Cherry"];

describe("Toolbar popup control interactions", () => {
  test("Select opens and selects a regular Select.Option", async () => {
    const { getByRole } = await render(
      <Toolbar>
        <Toolbar.Button>Before</Toolbar.Button>
        <Toolbar.Select aria-label="Sort records" placeholder="Sort by">
          <Select.Option value="name">Name</Select.Option>
          <Select.Option value="created">Created</Select.Option>
        </Toolbar.Select>
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

  test("Combobox opens, filters, and selects through regular children", async () => {
    const { getByPlaceholder, getByRole } = await render(
      <Toolbar>
        <Toolbar.Combobox items={fruits}>
          <Combobox.TriggerInput placeholder="Search fruits" />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Toolbar.Combobox>
      </Toolbar>,
    );

    const input = getByPlaceholder("Search fruits");
    await input.fill("ban");
    await expect.element(getByRole("listbox")).toBeVisible();
    await expect.element(getByRole("option", { name: "Banana" })).toBeVisible();
    await getByRole("option", { name: "Banana" }).click();
    await expect.element(input).toHaveValue("Banana");
  });

  test("multiple Combobox selection renders chips", async () => {
    function MultipleCombobox() {
      const [value, setValue] = useState<string[]>([]);

      return (
        <Toolbar>
          <Toolbar.Combobox<string, true>
            items={fruits}
            multiple
            value={value}
            onValueChange={setValue}
          >
            <Combobox.TriggerMultipleWithInput<string>
              placeholder="Add fruits"
              value={value}
              renderItem={(item) => (
                <Combobox.Chip key={item}>{item}</Combobox.Chip>
              )}
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
          </Toolbar.Combobox>
          <output data-testid="selection">{value.join(",")}</output>
        </Toolbar>
      );
    }

    const { getByPlaceholder, getByRole, getByTestId } = await render(
      <MultipleCombobox />,
    );

    await getByPlaceholder("Add fruits").click();
    await getByRole("option", { name: "Apple" }).click();
    await getByRole("option", { name: "Banana" }).click();
    await expect
      .element(getByTestId("selection"))
      .toHaveTextContent("Apple,Banana");
  });

  test("closed popup controls participate in toolbar focus movement", async () => {
    const { getByRole } = await render(
      <Toolbar>
        <Toolbar.Button>Before</Toolbar.Button>
        <Toolbar.Select aria-label="Sort records">
          <Select.Option value="name">Name</Select.Option>
        </Toolbar.Select>
        <Toolbar.Combobox items={fruits} defaultValue="Apple">
          <Combobox.TriggerInput aria-label="Fruit" />
        </Toolbar.Combobox>
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
