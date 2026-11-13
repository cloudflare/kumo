import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";
import { Text } from "../text/text";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("does not override the line height of nested text", () => {
    render(
      <Tooltip content="More information">
        <Text as="span" size="sm">
          Trigger label
        </Text>
      </Tooltip>,
    );

    const trigger = screen
      .getByText("Trigger label")
      .closest("[data-base-ui-tooltip-trigger]");

    expect(trigger).not.toBeNull();
    expect(trigger?.className).not.toMatch(/\bleading-/);
  });

  describe("trigger tab order", () => {
    function renderBetweenButtons(tooltip: React.ReactNode) {
      render(
        <>
          <button type="button">Before</button>
          {tooltip}
          <button type="button">After</button>
        </>,
      );
    }

    it("keeps Kumo's trigger out of the tab order when disabled", async () => {
      renderBetweenButtons(
        <Tooltip content="FULL_VARIABLE_NAME" disabled>
          <Text truncate>FULL_VARIABLE_NAME</Text>
        </Tooltip>,
      );
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Before" }));
      await user.tab();

      expect(
        screen
          .getByRole("button", { name: "FULL_VARIABLE_NAME" })
          .getAttribute("tabindex"),
      ).toBe("-1");
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "After" }),
      );
    });

    it("keeps Kumo's trigger focusable when enabled", async () => {
      renderBetweenButtons(
        <Tooltip content="FULL_VARIABLE_NAME">
          <Text truncate>FULL_VARIABLE_NAME</Text>
        </Tooltip>,
      );
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Before" }));
      await user.tab();

      const trigger = screen.getByRole("button", {
        name: "FULL_VARIABLE_NAME",
      });
      expect(trigger.hasAttribute("tabindex")).toBe(false);
      expect(document.activeElement).toBe(trigger);
    });

    it("leaves a custom trigger's focus behavior alone when disabled", async () => {
      renderBetweenButtons(
        <Tooltip
          content="Save changes"
          disabled
          render={<button type="button" />}
        >
          Save
        </Tooltip>,
      );
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Before" }));
      await user.tab();

      const trigger = screen.getByRole("button", { name: "Save" });
      expect(trigger.hasAttribute("tabindex")).toBe(false);
      expect(document.activeElement).toBe(trigger);
    });
  });
});
