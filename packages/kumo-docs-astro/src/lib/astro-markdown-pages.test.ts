import { describe, it, expect } from "vitest";
import { existsSync, readdirSync } from "fs";
import { join } from "path";

const distDir = join(import.meta.dirname, "../../dist");

describe("markdown pages integration", () => {
  it("generates .md files for component pages", () => {
    const componentsDir = join(distDir, "components");

    if (!existsSync(componentsDir)) {
      throw new Error(
        "dist/components/ not found - run `pnpm build` before testing",
      );
    }

    const entries = readdirSync(componentsDir, { withFileTypes: true });
    const mdFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".md"));
    const dirs = entries.filter((e) => e.isDirectory());

    // Every component directory should have a corresponding .md file
    expect(mdFiles.length).toBeGreaterThan(0);
    expect(mdFiles.length).toBe(dirs.length);

    // Spot check known components
    expect(existsSync(join(componentsDir, "badge.md"))).toBe(true);
    expect(existsSync(join(componentsDir, "button.md"))).toBe(true);
    expect(existsSync(join(componentsDir, "dialog.md"))).toBe(true);
  });

  it("generates .md files for other doc pages", () => {
    // Check a few key non-component pages
    expect(existsSync(join(distDir, "installation.md"))).toBe(true);
    expect(existsSync(join(distDir, "colors.md"))).toBe(true);
  });
});
