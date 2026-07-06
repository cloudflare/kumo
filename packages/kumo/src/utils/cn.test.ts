import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it.each([
    [["p-2", "p-4"], "p-4"],
    [["px-2 py-1", "px-4"], "py-1 px-4"],
    [["text-kumo-default", "text-kumo-subtle"], "text-kumo-subtle"],
    [["bg-kumo-base", "bg-kumo-elevated"], "bg-kumo-elevated"],
    [["border-kumo-line", "border-kumo-strong"], "border-kumo-strong"],
    [["hover:bg-kumo-base", "hover:bg-kumo-elevated"], "hover:bg-kumo-elevated"],
    [["sm:p-2", "sm:p-4", "md:p-6"], "sm:p-4 md:p-6"],
    [
      ["data-[state=open]:bg-kumo-base", "data-[state=open]:bg-kumo-elevated"],
      "data-[state=open]:bg-kumo-elevated",
    ],
    [["rounded-[10px]", "rounded-[12px]"], "rounded-[12px]"],
    [["!p-2", "p-4"], "!p-2 p-4"],
    [["p-2", "!p-4"], "p-2 !p-4"],
    [["base", false, null, undefined, { active: true, disabled: false }], "base active"],
    [[["flex", ["gap-2", "gap-4"]]], "flex gap-4"],
  ])("merges classes without changing expected output for case %#", (inputs, expected) => {
    expect(cn(...inputs)).toBe(expected);
  });
});
