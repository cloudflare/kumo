import { describe, expect, test } from "vite-plus/test";
import { render } from "vitest-browser-react";
import { Select } from "./select";

describe("Select visual contracts", () => {
  test("does not overflow horizontally when options are separated", async () => {
    const { getByRole } = await render(
      <Select aria-label="Pick an option">
        <Select.Option value="a">Option A</Select.Option>
        <Select.Separator />
        <Select.Option value="b">Option B</Select.Option>
      </Select>,
    );

    await getByRole("combobox").click();
    await expect.element(getByRole("listbox")).toBeVisible();

    const listbox = getByRole("listbox").element();
    expect(listbox.scrollWidth).toBe(listbox.clientWidth);
  });
});
