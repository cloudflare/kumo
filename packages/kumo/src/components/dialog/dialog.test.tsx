import { describe, expect, it } from "vite-plus/test";
import { dialogVariants } from "./dialog";

describe("dialogVariants", () => {
  it("positions dialogs near the top of the viewport", () => {
    const classes = dialogVariants();

    expect(classes).toContain("fixed");
    expect(classes).toContain("top-16");
    expect(classes).not.toContain("top-1/2");
    expect(classes).not.toContain("-translate-y-1/2");
  });
});
