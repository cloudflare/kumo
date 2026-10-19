import { describe, expect, test } from "vite-plus/test";
import { render } from "vitest-browser-react";
import { Button } from "../button/button";
import { Loader } from "./loader";

// Loader animates, so assert rendered geometry rather than pixel snapshots.
function renderedSize(element: Element) {
  const { width, height } = element.getBoundingClientRect();
  return { width, height };
}

describe("Loader visual contracts", () => {
  test.each([
    ["sm", 16],
    ["base", 24],
    ["lg", 32],
    [45, 45],
  ] as const)("renders size=%s at %ipx", async (size, expected) => {
    const { getByRole } = await render(<Loader size={size} />);

    expect(renderedSize(getByRole("status").element())).toEqual({
      width: expected,
      height: expected,
    });
  });

  test.each([
    ["xs", 14],
    ["sm", 14],
    ["base", 14],
    ["lg", 16],
  ] as const)(
    "keeps the Button size=%s loading spinner at %ipx",
    async (size, expected) => {
      const { getByRole } = await render(
        <Button size={size} loading>
          Save
        </Button>,
      );

      expect(renderedSize(getByRole("status").element())).toEqual({
        width: expected,
        height: expected,
      });
    },
  );
});
