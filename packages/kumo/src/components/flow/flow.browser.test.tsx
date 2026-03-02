import { describe, test, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Flow } from ".";

describe("Flow Integration", () => {
  test("renders a sequence of nodes", async () => {
    const { getByText } = await render(
      <Flow>
        <Flow.Node>Node 1</Flow.Node>
        <Flow.Node>Node 2</Flow.Node>
      </Flow>,
    );
    await Promise.all([
      expect.element(getByText("Node 1")).toBeVisible(),
      expect.element(getByText("Node 2")).toBeVisible(),
    ]);
  });
});
