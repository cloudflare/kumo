/* eslint-disable turbo/no-undeclared-env-vars */
import { fileURLToPath } from "node:url";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateDescription(
    process.env.TITLE as string,
    process.env.BODY as string,
    process.env.LABELS as string,
    process.env.FILES as string,
  );
  if (errors.length > 0) {
    console.error("Validation errors in PR description:");
    for (const error of errors) {
      console.error("- ", error);
    }
    if (process.env.DRAFT !== "true") {
      process.exit(1);
    } else {
      console.error("These errors must be fixed before you can merge this PR.");
      console.error(
        "When you mark this PR as ready for review the CI check will start failing.",
      );
    }
  }
}

export function validateDescription(
  title: string,
  body: string,
  labels: string,
  changedFilesJson: string,
) {
  const errors: string[] = [];

  console.log("PR:", title);

  const parsedLabels = JSON.parse(labels) as string[];

  if (parsedLabels.includes("skip-pr-description-validation")) {
    console.log(
      "Skipping validation because the `skip-pr-description-validation` label has been applied",
    );
    return [];
  }

  // Validate bonk review
  if (
    !(
      /- \[x\] bonk has reviewed the change/i.test(body) ||
      /- \[x\] automated review not possible because:\s*.+/i.test(body)
    )
  ) {
    errors.push(
      "Your PR must have bonk review, or provide justification for why automated review is not possible",
    );
  }

  // Validate tests
  if (
    !(
      /- \[x\] Tests included\/updated/i.test(body) ||
      /- \[x\] Automated tests not possible - manual testing has been completed as follows:\s*.+/i.test(
        body,
      ) ||
      /- \[x\] Additional testing not necessary because:\s*.+/i.test(body)
    )
  ) {
    errors.push(
      "Your PR must include tests, or provide justification for why no tests are required",
    );
  }

  // Validate changeset
  const changedFiles = JSON.parse(changedFilesJson) as string[];
  const changesetIncluded = changedFiles.some((f) =>
    f.startsWith(".changeset/"),
  );

  if (!changesetIncluded && !parsedLabels.includes("no-changeset-required")) {
    errors.push(
      "Your PR doesn't include a changeset. Either include one (following the instructions in CONTRIBUTING.md) or add the 'no-changeset-required' label to bypass this check. See https://github.com/cloudflare/kumo/blob/main/CONTRIBUTING.md#changesets for more details.",
    );
  }

  return errors;
}
