import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePullRequestFiles } from "./pull-request-files";

describe("parsePullRequestFiles", () => {
  it("reads filenames from the GitHub response", () => {
    assert.deepEqual(
      parsePullRequestFiles([
        { filename: "packages/kumo/src/components/button/button.tsx" },
        { filename: "packages/kumo/src/components/input/input.tsx" },
      ]),
      [
        "packages/kumo/src/components/button/button.tsx",
        "packages/kumo/src/components/input/input.tsx",
      ],
    );
  });

  it("rejects malformed file entries", () => {
    assert.throws(() => parsePullRequestFiles([{ status: "modified" }]));
  });
});
