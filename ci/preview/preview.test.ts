import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  commitsMatch,
  getWranglerPreviewUrl,
  getWorkerPreviewUrl,
  parsePreviewCommit,
} from "./preview";

describe("preview contract", () => {
  it("derives the public URL from a Worker Builds details URL", () => {
    assert.equal(
      getWorkerPreviewUrl(
        "https://dash.cloudflare.com/account/workers/services/view/kumo-docs/production/previews/feature-branch",
      ),
      "https://feature-branch-kumo-docs.design-engineering.workers.dev",
    );
  });

  it("rejects details URLs for other Workers", () => {
    assert.throws(() =>
      getWorkerPreviewUrl(
        "https://dash.cloudflare.com/account/workers/services/view/other/production/previews/feature-branch",
      ),
    );
  });

  it("parses a valid docs build commit", () => {
    assert.equal(parsePreviewCommit('{"commit":"abcdef1"}'), "abcdef1");
  });

  it("matches short and full forms of the same commit", () => {
    assert.equal(commitsMatch("abcdef1234567890", "abcdef1"), true);
    assert.equal(commitsMatch("abcdef1", "1234567"), false);
  });

  it("reads the preview URL from Wrangler output", () => {
    assert.equal(
      getWranglerPreviewUrl(
        "Version Preview URL: https://abcdef12-kumo-docs.design-engineering.workers.dev",
      ),
      "https://abcdef12-kumo-docs.design-engineering.workers.dev",
    );
  });

  it("derives the preview URL from a Wrangler version ID", () => {
    assert.equal(
      getWranglerPreviewUrl(
        "Worker Version ID: abcdef12-3456-7890-abcd-ef1234567890",
      ),
      "https://abcdef12-kumo-docs.design-engineering.workers.dev",
    );
  });

  it("rejects invalid Wrangler output", () => {
    assert.throws(() => getWranglerPreviewUrl("Upload failed"));
  });
});
