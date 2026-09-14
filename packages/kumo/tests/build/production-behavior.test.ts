import { createElement } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const textEntryPath = join(__dirname, "../../dist/components/text.js");
const isBuilt = existsSync(textEntryPath);

describe.skipIf(!isBuilt)("Production behavior (Post-Build)", () => {
  it("does not emit deprecated Text variant warnings", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { Text } = await import("../../dist/components/text.js");

    render(
      createElement(Text, {
        variant: "heading1",
        as: "h1",
        children: "Legacy heading",
      }),
    );

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
