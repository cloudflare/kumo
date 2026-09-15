import { describe, expect, test } from "vite-plus/test";
import { render } from "vitest-browser-react";
import { Text } from "../text/text";
import { Tooltip } from "./tooltip";

describe("Tooltip visual contracts", () => {
  test("keeps a truncating Text trigger visible", async () => {
    const { getByTestId } = await render(
      <div className="w-24" data-testid="tooltip-text-trigger">
        <Tooltip content="Network range details">
          <Text as="span" size="sm" truncate>
            192.0.2.0/24
          </Text>
        </Tooltip>
      </div>,
    );

    await expect
      .element(getByTestId("tooltip-text-trigger"))
      .toMatchScreenshot("truncating-text-trigger");
  });
});
