import { render, screen } from "@testing-library/react";
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
});
