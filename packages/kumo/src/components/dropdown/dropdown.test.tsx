import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";
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
        expect(classes).toEqual(expect.arrayContaining(["h-4", "w-4"]));
        expect(classes).not.toContain("mr-2");
        // Both icon types sit in the same non-shrinking slot.
        const slot = icon?.parentElement;
        expect(slot?.dataset.kumoPart).toBe("icon");
        expect(slot?.className).toContain("shrink-0");
        expect(slot?.className).not.toContain("mr-2");
      }
      // Custom classes on element icons are preserved.
      expect(elementIcon.className).toContain("text-kumo-danger");
    });
  });

  describe("auto inset", () => {
    it("wraps icons in an icon slot and gives every row the auto-inset rule", () => {
      renderMenu(
        <>
          <DropdownMenu.Group>
            <DropdownMenu.Label>Actions</DropdownMenu.Label>
          </DropdownMenu.Group>
          <DropdownMenu.Item icon={CopyIcon}>Copy</DropdownMenu.Item>
          <DropdownMenu.Item>Move</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
          </DropdownMenu.Sub>
        </>,
      );

      const autoInset =
        "group-has-[[data-kumo-part=icon]]/menu:not-has-[[data-kumo-part=icon]]:pl-8";
      expect(screen.getByRole("menu").className).toContain("group/menu");
      expect(screen.getByText("Actions").className).toContain(autoInset);
      for (const name of ["item", "submenu-trigger"]) {
        expect(part(name).className).toContain(autoInset);
      }

      const copy = screen.getByRole("menuitem", { name: "Copy" });
      const slot = copy.querySelector('[data-kumo-part="icon"]');
      expect(slot?.querySelector("svg")).toBeTruthy();
      expect(
        screen
          .getByRole("menuitem", { name: "Move" })
          .querySelector('[data-kumo-part="icon"]'),
      ).toBeNull();
    });
  });

  describe("submenu keyboard behaviour", () => {
    function renderNested(onOpenChange?: (open: boolean) => void) {
      return render(
        <DropdownMenu defaultOpen>
          <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>First</DropdownMenu.Item>
            <DropdownMenu.Sub onOpenChange={onOpenChange}>
              <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Nested</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
            <DropdownMenu.Item>Last</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>,
      );
    }

    async function focusTrigger(user: ReturnType<typeof userEvent.setup>) {
      screen.getByRole("menuitem", { name: "First" }).focus();
      await user.keyboard("{ArrowDown}");
      const trigger = screen.getByRole("menuitem", { name: "More" });
      await waitFor(() => expect(document.activeElement).toBe(trigger));
      return trigger;
    }

    it("opens the submenu on keyboard focus without moving focus into it", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderNested(onOpenChange);

      const trigger = await focusTrigger(user);
      await waitFor(() => expect(screen.getByText("Nested")).toBeTruthy());
      expect(trigger.hasAttribute("data-popup-open")).toBe(true);
      expect(document.activeElement).toBe(trigger);
      expect(onOpenChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ reason: "trigger-focus" }),
      );
    });

    it("moves focus into the submenu on ArrowRight", async () => {
      const user = userEvent.setup();
      renderNested();

      await focusTrigger(user);
      await waitFor(() => expect(screen.getByText("Nested")).toBeTruthy());
      await user.keyboard("{ArrowRight}");
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole("menuitem", { name: "Nested" }),
        ),
      );
    });

    it("closes the previewed submenu when focus moves to a sibling", async () => {
      const user = userEvent.setup();
      renderNested();

      const trigger = await focusTrigger(user);
      await waitFor(() => expect(screen.getByText("Nested")).toBeTruthy());
      await user.keyboard("{ArrowDown}");
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole("menuitem", { name: "Last" }),
        ),
      );
      await waitFor(() =>
        expect(trigger.hasAttribute("data-popup-open")).toBe(false),
      );
    });

    it("does not reopen the submenu when Escape returns focus to the trigger", async () => {
      const user = userEvent.setup();
      renderNested();

      const trigger = await focusTrigger(user);
      await waitFor(() => expect(screen.getByText("Nested")).toBeTruthy());
      await user.keyboard("{ArrowRight}");
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole("menuitem", { name: "Nested" }),
        ),
      );
      await user.keyboard("{Escape}");
      await waitFor(() => expect(document.activeElement).toBe(trigger));
      await waitFor(() =>
        expect(trigger.hasAttribute("data-popup-open")).toBe(false),
      );
    });

    it("still supports a controlled open state", () => {
      render(
        <DropdownMenu open>
          <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub open={false}>
              <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Nested</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu>,
      );
      expect(screen.queryByText("Nested")).toBeNull();
    });
  });
});
