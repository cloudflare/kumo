import { describe, it, expect, beforeAll } from "vitest";
import { getMainEntryExports } from "./test-utils";

describe("Main Entry Point Imports", () => {
  let mainEntryExports: string[] = [];

  beforeAll(async () => {
    mainEntryExports = await getMainEntryExports();
  }, 30000);

  it("should import the main module without errors", async () => {
    expect(async () => {
      await import("@cloudflare/kumo");
    }).not.toThrow();
  });

  describe("Component exports", () => {
    it("should export all discovered exports from main entry point", async () => {
      const module = (await import("@cloudflare/kumo")) as Record<
        string,
        unknown
      >;

      mainEntryExports.forEach((exportName: string) => {
        expect(module).toHaveProperty(exportName);
        expect(module[exportName]).toBeDefined();
      });
    });
  });

  it("should have all expected exports", async () => {
    const module = await import("@cloudflare/kumo");
    const actualExports = Object.keys(module)
      .filter((key) => key !== "default")
      .sort();

    // Check that all expected exports are present
    mainEntryExports.forEach((exportName: string) => {
      expect(actualExports).toContain(exportName);
    });

    // Verify counts match
    expect(actualExports.length).toBe(mainEntryExports.length);
  });
});
