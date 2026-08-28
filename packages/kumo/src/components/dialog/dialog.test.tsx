import { describe, expect, it } from "vite-plus/test";
import { dialogVariants } from "./dialog";

describe("dialogVariants", () => {
  it("positions dialogs closer to the top on small viewports", () => {
    const classes = dialogVariants().split(" ");

    expect(classes).toContain("fixed");
    expect(classes).toContain("top-8");
    expect(classes).toContain("sm:top-16");
    expect(classes).not.toContain("top-1/2");
    expect(classes).not.toContain("-translate-y-1/2");
  });
});
