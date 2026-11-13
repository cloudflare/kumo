import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  upsertPRCommentWithClient,
  type PRCommentClient,
  type PRCommentSummary,
} from "./github-api";

function createFakeClient(comments: readonly PRCommentSummary[]) {
  const created: string[] = [];
  const updated: Array<{ commentId: number; body: string }> = [];
  const client: PRCommentClient = {
    async listComments() {
      return comments;
    },
    async createComment(body) {
      created.push(body);
    },
    async updateComment(commentId, body) {
      updated.push({ commentId, body });
    },
  };

  return { client, created, updated };
}

describe("upsertPRCommentWithClient", () => {
  it("updates the existing GitHub Actions bot comment", async () => {
    const marker = "<!-- bundle-size -->";
    const fake = createFakeClient([
      {
        id: 42,
        authorLogin: "github-actions[bot]",
        body: `${marker}\nold content`,
      },
    ]);

    await upsertPRCommentWithClient(fake.client, marker, "new content");

    assert.deepEqual(fake.created, []);
    assert.deepEqual(fake.updated, [
      { commentId: 42, body: `${marker}\nnew content` },
    ]);
  });

  it("creates a comment when only a human comment has the marker", async () => {
    const marker = "<!-- bundle-size -->";
    const fake = createFakeClient([
      { id: 7, authorLogin: "contributor", body: `${marker}\nspoofed` },
    ]);

    await upsertPRCommentWithClient(fake.client, marker, "new content");

    assert.deepEqual(fake.updated, []);
    assert.deepEqual(fake.created, [`${marker}\nnew content`]);
  });
});
