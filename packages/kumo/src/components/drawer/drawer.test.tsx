import { describe, it, expect } from "vitest";
import {
  Drawer,
  KUMO_DRAWER_DEFAULT_VARIANTS,
  KUMO_DRAWER_VARIANTS,
  drawerVariants,
} from "./drawer";

describe("Drawer", () => {
  it("should be importable", () => {
    expect(Drawer).toBeDefined();
    expect(typeof Drawer).toBe("function");
  });

  it("should expose compound parts", () => {
    expect(Drawer.Root).toBeDefined();
    expect(Drawer.Trigger).toBeDefined();
    expect(Drawer.Title).toBeDefined();
    expect(Drawer.Description).toBeDefined();
    expect(Drawer.Close).toBeDefined();
    expect(Drawer.Actions).toBeDefined();
    expect(Drawer.Footer).toBeDefined();
  });

  it("should include default variant values", () => {
    expect(KUMO_DRAWER_DEFAULT_VARIANTS.swipeDirection).toBe("right");
    expect(KUMO_DRAWER_VARIANTS.swipeDirection.right).toBeDefined();
    expect(KUMO_DRAWER_VARIANTS.swipeDirection.down).toBeDefined();
  });

  it("should generate class names from variants", () => {
    const classes = drawerVariants({ swipeDirection: "left" });
    expect(classes).toContain("left-0");
  });
});
