import { describe, it } from "node:test";
import assert from "node:assert";
import { validateDescription } from "./validate-pr-description.ts";

const NO_LABELS = "[]";
const NO_FILES = "[]";
const WITH_CHANGESET = '[".changeset/some-change.md"]';

describe("validateDescription", () => {
  describe("Reviews section", () => {
    it("passes when bonk has reviewed", () => {
      const body = `
- Reviews
- [x] bonk has reviewed the change
- Tests
- [x] Tests included/updated
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });

    it("passes when automated review is not possible with justification", () => {
      const body = `
- Reviews
- [x] automated review not possible because: simple prop change
- Tests
- [x] Tests included/updated
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });

    it("fails when automated review justification is empty", () => {
      const body = `
- Reviews
- [x] automated review not possible because:
- Tests
- [x] Tests included/updated
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.ok(
        errors.some(
          (e) => e.includes("bonk review") && e.includes("same line"),
        ),
      );
    });

    it("fails when automated review justification is only whitespace", () => {
      const body = `
- Reviews
- [x] automated review not possible because:    
- Tests
- [x] Tests included/updated
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.ok(
        errors.some(
          (e) => e.includes("bonk review") && e.includes("same line"),
        ),
      );
    });

    it("fails when no review checkbox is checked", () => {
      const body = `
- Reviews
- [ ] bonk has reviewed the change
- [ ] automated review not possible because:
- Tests
- [x] Tests included/updated
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.ok(errors.some((e) => e.includes("bonk review")));
    });

    it("allows indented checkboxes", () => {
      const body = `
- Reviews
  - [x] bonk has reviewed the change
- Tests
  - [x] Tests included/updated
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });

    it("allows extra whitespace around checkbox", () => {
      const body = `
- Reviews
-  [x]  bonk has reviewed the change
- Tests
-  [x]  Tests included/updated
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });

    it("allows tabs in indentation", () => {
      const body =
        "- Reviews\n\t- [x] bonk has reviewed the change\n- Tests\n\t- [x] Tests included/updated";
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });
  });

  describe("Tests section", () => {
    it("passes when tests are included", () => {
      const body = `
- Reviews
- [x] bonk has reviewed the change
- Tests
- [x] Tests included/updated
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });

    it("passes when manual testing is described", () => {
      const body = `
- Reviews
- [x] bonk has reviewed the change
- Tests
- [x] Automated tests not possible - manual testing has been completed as follows: tested in browser
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });

    it("passes when testing is not necessary with justification", () => {
      const body = `
- Reviews
- [x] bonk has reviewed the change
- Tests
- [x] Additional testing not necessary because: docs only change
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });

    it("fails when manual testing description is empty", () => {
      const body = `
- Reviews
- [x] bonk has reviewed the change
- Tests
- [x] Automated tests not possible - manual testing has been completed as follows:
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.ok(
        errors.some((e) => e.includes("tests") && e.includes("same line")),
      );
    });

    it("fails when testing not necessary justification is empty", () => {
      const body = `
- Reviews
- [x] bonk has reviewed the change
- Tests
- [x] Additional testing not necessary because:
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.ok(
        errors.some((e) => e.includes("tests") && e.includes("same line")),
      );
    });

    it("fails when no test checkbox is checked", () => {
      const body = `
- Reviews
- [x] bonk has reviewed the change
- Tests
- [ ] Tests included/updated
- [ ] Automated tests not possible - manual testing has been completed as follows:
- [ ] Additional testing not necessary because:
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.ok(errors.some((e) => e.includes("tests")));
    });
  });

  describe("Changesets", () => {
    it("passes when changeset is included", () => {
      const body = `
- Reviews
- [x] bonk has reviewed the change
- Tests
- [x] Tests included/updated
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });

    it("fails when changeset is missing", () => {
      const body = `
- Reviews
- [x] bonk has reviewed the change
- Tests
- [x] Tests included/updated
      `;
      const errors = validateDescription("Test PR", body, NO_LABELS, NO_FILES);
      assert.ok(errors.some((e) => e.includes("changeset")));
    });

    it("passes when no-changeset-required label is applied", () => {
      const body = `
- Reviews
- [x] bonk has reviewed the change
- Tests
- [x] Tests included/updated
      `;
      const labels = '["no-changeset-required"]';
      const errors = validateDescription("Test PR", body, labels, NO_FILES);
      assert.deepStrictEqual(errors, []);
    });
  });

  describe("skip-pr-description-validation label", () => {
    it("skips all validation when label is applied", () => {
      const body = "This PR has no checklist at all";
      const labels = '["skip-pr-description-validation"]';
      const errors = validateDescription("Test PR", body, labels, NO_FILES);
      assert.deepStrictEqual(errors, []);
    });
  });

  describe("real-world PR bodies", () => {
    it("handles GitHub-style nested checkboxes", () => {
      const body = `
## Summary
Some changes here.

---

- Reviews
  - [ ] bonk has reviewed the change
  - [x] automated review not possible because: simple prop type change
- Tests
  - [ ] Tests included/updated
  - [ ] Automated tests not possible - manual testing has been completed as follows:
  - [x] Additional testing not necessary because: this is a type-only change
      `;
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });

    it("handles Windows line endings", () => {
      const body =
        "- Reviews\r\n- [x] bonk has reviewed the change\r\n- Tests\r\n- [x] Tests included/updated";
      const errors = validateDescription(
        "Test PR",
        body,
        NO_LABELS,
        WITH_CHANGESET,
      );
      assert.deepStrictEqual(errors, []);
    });
  });
});
