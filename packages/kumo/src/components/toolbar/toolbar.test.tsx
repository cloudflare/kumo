import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input/input";
import { InputGroup } from "../input-group/input-group";
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
});
