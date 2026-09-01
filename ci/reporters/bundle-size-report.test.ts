import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BUNDLE_SIZE_FIXTURES,
  BUNDLE_SIZE_SCHEMA_VERSION,
  buildBundleSizeMarkdown,
  parseBundleSizeArtifact,
  parseBundleSizeData,
  type BundleSizeData,
} from "./bundle-size-report";

function createBundleSizeData(): BundleSizeData {
  return {
    schemaVersion: BUNDLE_SIZE_SCHEMA_VERSION,
    fixtures: BUNDLE_SIZE_FIXTURES.map((fixture) => ({
      ...fixture,
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
    const original = createBundleSizeData();
    const input = {
      ...original,
      fixtures: original.fixtures.map((fixture, index) =>
        index === 0 ? { ...fixture, label: "untrusted label" } : fixture,
      ),
    };

    const data = parseBundleSizeData(input);

    assert.equal(data.fixtures[0]?.label, "Button (root)");

    const unknownFixture = {
      ...original,
      fixtures: original.fixtures.map((fixture, index) =>
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

  it("extracts data from a report artifact without a type assertion", () => {
    const data = createBundleSizeData();

    assert.deepEqual(parseBundleSizeArtifact({ data }), data);
    assert.throws(
      () => parseBundleSizeArtifact({}),
      /artifact is missing data/,
    );
  });
});

describe("buildBundleSizeMarkdown", () => {
  it("escapes artifact text before rendering Markdown", () => {
    const original = createBundleSizeData();
    const firstFixture = original.fixtures.at(0);
    assert.ok(firstFixture);
    const data: BundleSizeData = {
      ...original,
      fixtures: [
        {
          ...firstFixture,
          label: "Button | root",
          warnings: ["warning `with code`"],
        },
      ],
      tarball: {
        ...original.tarball,
        flaggedFiles: ["bad`file.test.ts"],
      },
    };

    const markdown = buildBundleSizeMarkdown(data);

    assert.ok(markdown.includes("Button \\| root"));
    assert.match(markdown, /bad'file\.test\.ts/);
    assert.match(markdown, /warning 'with code'/);
  });
});
