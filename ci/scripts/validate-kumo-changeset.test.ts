import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { requiresKumoChangeset } from "./validate-kumo-changeset";

describe("requiresKumoChangeset", () => {
  it("ignores a package README-only change", () => {
    assert.equal(requiresKumoChangeset(["packages/kumo/README.md"]), false);
  });

  it("requires a changeset for package source changes", () => {
    assert.equal(
      requiresKumoChangeset([
        "packages/kumo/README.md",
        "packages/kumo/src/index.ts",
      ]),
      true,
    );
  });
});
