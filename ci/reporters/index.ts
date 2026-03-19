/**
 * Reporter Registry
 *
 * Central registry of all available reporters.
 * Add new reporters here to include them in PR comments.
 */

import type { Reporter } from "./types";
import { npmReleaseReporter } from "./npm-release";
import { kumoDocsPreviewReporter } from "./kumo-docs-preview";
import { visualRegressionReporter } from "./visual-regression";

export const reporters: Reporter[] = [
  npmReleaseReporter,
  kumoDocsPreviewReporter,
  visualRegressionReporter,
];

export * from "./types";
export {
  REPORTS_DIR,
  writeReportArtifact,
  readReportArtifacts,
  buildContextFromEnv,
} from "./types";
export { npmReleaseReporter } from "./npm-release";
export { kumoDocsPreviewReporter } from "./kumo-docs-preview";
export { visualRegressionReporter } from "./visual-regression";
