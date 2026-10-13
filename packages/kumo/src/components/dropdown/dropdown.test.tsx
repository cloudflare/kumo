import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { CopyIcon, GearIcon } from "@phosphor-icons/react";
import { DropdownMenu } from "./dropdown";

function renderMenu(children: React.ReactNode) {
  return render(
    <DropdownMenu open>
      <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
      <DropdownMenu.Content>{children}</DropdownMenu.Content>
    </DropdownMenu>,
  );
}

function part(name: string) {
  const el = document.querySelector(`[data-kumo-part="${name}"]`);
  expect(el).toBeTruthy();
  return el as HTMLElement;
}

describe("DropdownMenu", () => {
  describe("row styling", () => {
    it("uses the same highlight colour, radius and state for every row", () => {
      renderMenu(
        <>
          <DropdownMenu.Item>Item</DropdownMenu.Item>
          <DropdownMenu.LinkItem href="/x">Link</DropdownMenu.LinkItem>
          <DropdownMenu.CheckboxItem>Checkbox</DropdownMenu.CheckboxItem>
          <DropdownMenu.RadioGroup value="a">
            <DropdownMenu.RadioItem value="a">Radio</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
          </DropdownMenu.Sub>
        </>,
      );

      for (const name of [
        "item",
        "link-item",
        "checkbox-item",
        "radio-item",
        "submenu-trigger",
      ]) {
        const classes = part(name).className.split(" ");
        expect(classes, name).toContain("data-highlighted:bg-kumo-tint");
        expect(classes, name).toContain("rounded-md");
        expect(classes, name).toContain("gap-2");
        expect(
          classes.filter((c) => /^(focus:)?bg-|^data-highlighted:bg-/.test(c)),
          name,
        ).toEqual(["data-highlighted:bg-kumo-tint"]);
      }
    });

    it("keeps the danger highlight on danger items", () => {
      renderMenu(
        <DropdownMenu.Item variant="danger">Delete</DropdownMenu.Item>,
      );
      const classes = part("item").className.split(" ");
      expect(classes).toContain("data-highlighted:bg-kumo-danger/5");
      expect(classes).not.toContain("data-highlighted:bg-kumo-tint");
    });
  });

  describe("SubTrigger", () => {
    it("stays highlighted while its submenu is open", () => {
      render(
        <DropdownMenu open>
          <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub open>
              <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Nested</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu>,
      );

      const trigger = part("submenu-trigger");
      expect(trigger.hasAttribute("data-popup-open")).toBe(true);
      expect(trigger.className).toContain("data-popup-open:bg-kumo-tint");
      expect(trigger.className).not.toContain("data-[state=open]");
      expect(screen.getByText("Nested")).toBeTruthy();
    });

    it("accepts a Phosphor icon component", () => {
      renderMenu(
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger icon={GearIcon}>
            More
          </DropdownMenu.SubTrigger>
        </DropdownMenu.Sub>,
      );
      const svg = part("submenu-trigger").querySelector("svg");
      expect(svg?.getAttribute("class")).toContain("h-4 w-4");
    });

    it("accepts an icon element", () => {
      renderMenu(
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger icon={<span data-testid="custom-icon" />}>
            More
          </DropdownMenu.SubTrigger>
        </DropdownMenu.Sub>,
      );
      expect(screen.getByTestId("custom-icon").className).toContain("h-4 w-4");
    });
  });

  describe("icon spacing", () => {
    it("spaces component and element icons the same way via the row gap", () => {
      renderMenu(
        <>
          <DropdownMenu.Item icon={CopyIcon}>Component</DropdownMenu.Item>
          <DropdownMenu.LinkItem
            href="/x"
            icon={
              <span data-testid="element-icon" className="text-kumo-danger" />
            }
          >
            Element
          </DropdownMenu.LinkItem>
        </>,
      );

      const componentIcon = part("item").querySelector("svg");
      const elementIcon = screen.getByTestId("element-icon");

      for (const icon of [componentIcon, elementIcon]) {
        const classes = (icon?.getAttribute("class") ?? "").split(" ");
        expect(classes).toEqual(
          expect.arrayContaining(["h-4", "w-4", "shrink-0"]),
        );
        expect(classes).not.toContain("mr-2");
      }
      // Custom classes on element icons are preserved.
      expect(elementIcon.className).toContain("text-kumo-danger");
    });
  });
});
