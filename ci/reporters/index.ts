/**
 * Reporter Registry
 *
 * Central registry of all available reporters.
 * Add new reporters here to include them in PR comments.
 */

import type { Reporter } from "./types";
import { npmReleaseReporter } from "./npm-release";
import { kumoDocsPreviewReporter } from "./kumo-docs-preview";

/**
 * All registered reporters, executed in order
 */
export const reporters: Reporter[] = [
  npmReleaseReporter,
  kumoDocsPreviewReporter,
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
