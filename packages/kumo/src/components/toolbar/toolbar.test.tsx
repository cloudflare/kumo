import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input/input";
import { InputGroup } from "../input-group/input-group";
import { Select } from "../select/select";
import { Combobox } from "../combobox/combobox";
import { Toolbar } from "./toolbar";

describe("Toolbar", () => {
  it("applies toolbar size and item styles through Toolbar.Input", () => {
    render(
      <Toolbar size="sm">
        <Toolbar.Input aria-label="Toolbar input" />
        <Input aria-label="Direct input" size="lg" />
      </Toolbar>,
    );

    const toolbarInput = screen.getByRole("textbox", { name: "Toolbar input" });
    const directInput = screen.getByRole("textbox", { name: "Direct input" });

    expect(toolbarInput.className).toContain("h-6.5");
    expect(toolbarInput.className).toContain("rounded-none");
    expect(directInput.className).toContain("h-10");
    expect(directInput.className).not.toContain("rounded-none");
  });

  it("passes toolbar size and item styles directly to Toolbar.InputGroup", () => {
    const { container } = render(
      <Toolbar size="sm">
        <Toolbar.InputGroup aria-label="Hostname">
          <InputGroup.Input placeholder="example" aria-label="Hostname" />
          <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        </Toolbar.InputGroup>
        <InputGroup>
          <InputGroup.Input placeholder="plain" aria-label="Plain" />
        </InputGroup>
      </Toolbar>,
    );

    const groups = container.querySelectorAll('[data-slot="input-group"]');
    const toolbarGroup = groups[0] as HTMLElement;
    const plainGroup = groups[1] as HTMLElement;
    const input = screen.getByRole("textbox", { name: "Hostname" });

    expect(toolbarGroup.className).toContain("h-6.5");
    expect(toolbarGroup.className).toContain("rounded-none");
    expect(plainGroup.className).not.toContain("rounded-none");
    expect(input.className).not.toContain("not-first:border-l");
  });

  it("moves focus from Toolbar.InputGroup input to the next toolbar button", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar>
        <Toolbar.InputGroup aria-label="Search DNS records">
          <InputGroup.Input placeholder="Search DNS records" />
        </Toolbar.InputGroup>
        <Toolbar.Button aria-label="Filter">Filter</Toolbar.Button>
        <Toolbar.Button aria-label="Settings">Settings</Toolbar.Button>
      </Toolbar>,
    );

    const input = screen.getByRole("textbox", { name: "Search DNS records" });
    const filter = screen.getByRole("button", { name: "Filter" });
    const settings = screen.getByRole("button", { name: "Settings" });

    await user.click(input);
    expect(document.activeElement).toBe(input);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(filter);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(settings);
  });

  it("moves focus from Toolbar.InputGroup input with suffix to the next toolbar button", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar>
        <Toolbar.InputGroup aria-label="Worker subdomain">
          <InputGroup.Input placeholder="my-worker" />
          <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        </Toolbar.InputGroup>
        <Toolbar.Button>Visit</Toolbar.Button>
      </Toolbar>,
    );

    const input = screen.getByRole("textbox", { name: "Worker subdomain" });
    const visit = screen.getByRole("button", { name: "Visit" });

    await user.click(input);
    expect(document.activeElement).toBe(input);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(visit);
  });

  it("uses regular Select.Option and Combobox children under toolbar roots", () => {
    render(
      <Toolbar size="sm">
        <Toolbar.Select
          aria-label="Sort records"
          defaultValue="name"
          name="sort"
        >
          <Select.Option value="name">Name</Select.Option>
          <Select.Option value="created">Created</Select.Option>
        </Toolbar.Select>
        <Toolbar.Combobox
          items={["All", "Active"]}
          defaultValue="All"
          name="status"
        >
          <Combobox.TriggerValue placeholder="Choose status" />
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

    const selectSurface = document.querySelector(
      '[data-kumo-component="Toolbar.Select"]',
    );
    const comboboxSurface = document.querySelector(
      '[data-kumo-component="Toolbar.Combobox"]',
    );
    const controls = screen.getAllByRole("combobox");

    expect(selectSurface).toBeTruthy();
    expect(comboboxSurface).toBeTruthy();
    expect(selectSurface?.className).toContain("first:rounded-l-lg");
    expect(comboboxSurface?.className).toContain("last:rounded-r-lg");
    expect(controls[0]?.className).toContain("h-6.5");
    expect(controls[0]?.className).toContain("bg-transparent");
    expect(controls[1]?.className).toContain("h-6.5");
    expect(controls[1]?.className).toContain("bg-transparent");
    const selectFormInput = selectSurface?.querySelector(
      'input[aria-hidden="true"][name="sort"]',
    );
    const comboboxFormInput = comboboxSurface?.querySelector(
      'input[aria-hidden="true"][name="status"]',
    );
    expect(selectFormInput).not.toBeNull();
    expect(comboboxFormInput).not.toBeNull();
    expect(selectFormInput?.parentElement).toBe(selectSurface);
    expect(comboboxFormInput?.parentElement).toBe(comboboxSurface);
  });

  it("keeps direct Select and Combobox controls isolated from toolbar overrides", () => {
    render(
      <Toolbar size="xs">
        <Select aria-label="Direct select" size="lg">
          <Select.Option value="a">A</Select.Option>
        </Select>
        <Combobox items={["A"]} size="lg">
          <Combobox.TriggerValue placeholder="Direct combobox" />
        </Combobox>
      </Toolbar>,
    );

    const controls = screen.getAllByRole("combobox");
    expect(controls[0]?.className).toContain("h-10");
    expect(controls[0]?.className).not.toContain("rounded-none");
    expect(controls[1]?.className).toContain("h-10");
    expect(controls[1]?.className).not.toContain("rounded-none");
    expect(
      document.querySelector('[data-kumo-component="Toolbar.Select"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-kumo-component="Toolbar.Combobox"]'),
    ).toBeNull();
  });

  it("supports full-width editable and multiple Combobox triggers with inherited size", () => {
    const values = ["Apple", "Banana"];
    render(
      <Toolbar size="xs">
        <Toolbar.Combobox items={values}>
          <Combobox.TriggerInput placeholder="Single fruit" />
        </Toolbar.Combobox>
        <Toolbar.Combobox<string, true>
          items={values}
          multiple
          defaultValue={["Apple"]}
        >
          <Combobox.TriggerMultipleWithInput<string>
            placeholder="Multiple fruits"
            renderItem={(item) => (
              <Combobox.Chip key={item}>{item}</Combobox.Chip>
            )}
          />
        </Toolbar.Combobox>
      </Toolbar>,
    );

    const singleInput = screen.getByPlaceholderText("Single fruit");
    const multipleInput = screen.getByPlaceholderText("Multiple fruits");
    const multipleSurface = multipleInput.closest(
      '[data-kumo-component="Toolbar.Combobox"]',
    );

    expect(singleInput.className).toContain("h-5");
    expect(singleInput.className).toContain("bg-transparent");
    expect(singleInput.parentElement?.className).toContain("w-full");
    expect(singleInput.parentElement?.className).toContain("max-w-none");
    expect(singleInput.parentElement?.className).not.toContain("max-w-xs");
    expect(
      multipleSurface?.querySelector('[data-kumo-part="chip-remove"]'),
    ).toBeTruthy();
    expect(multipleInput.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("supports multiple Select without replacing regular options", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Toolbar>
        <Toolbar.Select<string, true>
          aria-label="Visible columns"
          multiple
          defaultValue={["name"]}
          onValueChange={onValueChange}
        >
          <Select.Option value="name">Name</Select.Option>
          <Select.Option value="status">Status</Select.Option>
        </Toolbar.Select>
      </Toolbar>,
    );

    await user.click(screen.getByRole("combobox", { name: "Visible columns" }));
    await user.click(screen.getByRole("option", { name: "Status" }));

    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(["name", "status"]);
  });

  it("forwards disabled focus metadata through the toolbar adapters", () => {
    render(
      <Toolbar>
        <Toolbar.Select
          aria-label="Disabled select"
          disabled
          focusableWhenDisabled={false}
        >
          <Select.Option value="a">A</Select.Option>
        </Toolbar.Select>
        <Toolbar.Combobox items={["A"]} disabled focusableWhenDisabled>
          <Combobox.TriggerInput placeholder="Disabled combobox" />
        </Toolbar.Combobox>
      </Toolbar>,
    );

    const select = screen.getByRole("combobox", { name: "Disabled select" });
    const combobox = screen.getByPlaceholderText("Disabled combobox");

    expect(select.hasAttribute("data-disabled")).toBe(true);
    expect(select.hasAttribute("data-focusable")).toBe(false);
    expect(combobox.hasAttribute("data-disabled")).toBe(true);
    expect(combobox.hasAttribute("data-focusable")).toBe(true);
  });

  it("moves focus through closed Select and button Combobox triggers", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar>
        <Toolbar.Button>Before</Toolbar.Button>
        <Toolbar.Select aria-label="Sort records">
          <Select.Option value="name">Name</Select.Option>
        </Toolbar.Select>
        <Toolbar.Combobox items={["All"]}>
          <Combobox.TriggerValue placeholder="Status" />
        </Toolbar.Combobox>
        <Toolbar.Button>After</Toolbar.Button>
      </Toolbar>,
    );

    const before = screen.getByRole("button", { name: "Before" });
    const [select, combobox] = screen.getAllByRole("combobox");
    const after = screen.getByRole("button", { name: "After" });

    await user.click(before);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(select);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(combobox);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(after);
  });

  it("moves from an editable Combobox only at cursor boundaries", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar>
        <Toolbar.Button>Before</Toolbar.Button>
        <Toolbar.Combobox items={["Apple", "Banana"]} defaultValue="Apple">
          <Combobox.TriggerInput aria-label="Fruit" />
        </Toolbar.Combobox>
        <Toolbar.Button>After</Toolbar.Button>
      </Toolbar>,
    );

    const before = screen.getByRole("button", { name: "Before" });
    const input = screen.getByRole("combobox", {
      name: "Fruit",
    }) as HTMLInputElement;
    const after = screen.getByRole("button", { name: "After" });

    input.focus();
    input.setSelectionRange(2, 2);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(input);

    input.setSelectionRange(input.value.length, input.value.length);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(after);

    input.focus();
    input.setSelectionRange(0, 0);
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(before);
  });

  it("sets display names for the new toolbar root replacements", () => {
    expect(Toolbar.Select.displayName).toBe("Toolbar.Select");
    expect(Toolbar.Combobox.displayName).toBe("Toolbar.Combobox");
  });
});
