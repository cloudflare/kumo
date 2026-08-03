import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BUNDLE_SIZE_FIXTURE_LABELS,
  BUNDLE_SIZE_SCHEMA_VERSION,
  buildBundleSizeMarkdown,
  parseBundleSizeData,
  type BundleSizeData,
  type BundleSizeFixtureId,
} from "./bundle-size-report";

function createBundleSizeData(): BundleSizeData {
  return {
    schemaVersion: BUNDLE_SIZE_SCHEMA_VERSION,
    fixtures: Object.entries(BUNDLE_SIZE_FIXTURE_LABELS).map(([id, label]) => ({
      id: id as BundleSizeFixtureId,
      label,
      raw: 2048,
      gzip: 1024,
      brotli: 768,
      warnings: [],
    })),
    tarball: {
      fileCount: 1,
      packedSize: 1024,
      unpackedSize: 2048,
      flaggedFiles: [],
    },
  };
}

describe("parseBundleSizeData", () => {
  it("uses trusted fixture labels and validates structured data", () => {
    const input = createBundleSizeData();
    input.fixtures[0]!.label = "untrusted label";

    const data = parseBundleSizeData(input);

    assert.equal(data.fixtures[0]?.label, "Button (root)");

    const unknownFixture = {
      ...createBundleSizeData(),
      fixtures: createBundleSizeData().fixtures.map((fixture, index) =>
        index === 0 ? { ...fixture, id: "unknown" } : fixture,
      ),
    };
    assert.throws(() => parseBundleSizeData(unknownFixture), /unknown fixture/);
  });

  it("rejects unsupported artifact schema versions", () => {
    assert.throws(
      () =>
        parseBundleSizeData({
          ...createBundleSizeData(),
          schemaVersion: 2,
        }),
      /Unsupported bundle size schema version: 2/,
    );
  });
});

describe("buildBundleSizeMarkdown", () => {
  it("escapes artifact text before rendering Markdown", () => {
    const data = createBundleSizeData();
    data.fixtures = [
      {
        id: "root-button",
        label: "Button | root",
        raw: 2048,
        gzip: 1024,
        brotli: 768,
        warnings: ["warning `with code`"],
      },
    ];
    data.tarball.flaggedFiles = ["bad`file.test.ts"];

    const markdown = buildBundleSizeMarkdown(data);

    assert.match(markdown, /Button \\| root/);
    assert.match(markdown, /bad'file\.test\.ts/);
    assert.match(markdown, /warning 'with code'/);
  });
});
