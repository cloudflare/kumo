import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseTarballReport } from "./bundle-size";

describe("parseTarballReport", () => {
  it("reports package sizes and flags prohibited files", () => {
    const report = parseTarballReport(
      JSON.stringify([
        {
          files: [
            { path: "dist/index.js" },
            { path: "dist/example.test.js" },
            { path: "scripts/internal.ts" },
          ],
          size: 1024,
          unpackedSize: 4096,
        },
      ]),
    );

    assert.deepEqual(report, {
      fileCount: 3,
      packedSize: 1024,
      unpackedSize: 4096,
      flaggedFiles: ["dist/example.test.js", "scripts/internal.ts"],
    });
  });

  it("rejects malformed npm output", () => {
    assert.throws(
      () => parseTarballReport(JSON.stringify([{ files: [] }])),
      /invalid JSON report/,
    );
    assert.throws(
      () =>
        parseTarballReport(
          JSON.stringify([{ files: [{}], size: 1, unpackedSize: 2 }]),
        ),
      /invalid file entry/,
    );
  });
});
