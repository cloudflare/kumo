import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getBranchSkipReason,
  requiresKumoChangeset,
} from "./validate-kumo-changeset";

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

describe("getBranchSkipReason", () => {
  it("skips Changesets release PRs", () => {
    assert.notEqual(
      getBranchSkipReason("changeset-release/main", "main"),
      null,
    );
  });

  it("skips main → next sync PRs", () => {
    assert.notEqual(
      getBranchSkipReason("sync/main-into-next-2026-11-24", "next"),
      null,
    );
  });

  it("validates sync/ branches that target main", () => {
    assert.equal(getBranchSkipReason("sync/something", "main"), null);
  });

  it("validates regular PRs into next", () => {
    assert.equal(getBranchSkipReason("feat/remove-old-props", "next"), null);
  });

  it("validates regular PRs into main", () => {
    assert.equal(getBranchSkipReason("fix/toast-rtl", "main"), null);
  });
});
