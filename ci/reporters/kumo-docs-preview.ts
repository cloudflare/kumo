/**
 * Kumo Docs Preview Reporter
 *
 * Reports the deployed kumo-docs preview URL.
 */

import type { CIContext, ReportItem, Reporter } from "./types";

export const kumoDocsPreviewReporter: Reporter = {
  id: "kumo-docs-preview",
  name: "Kumo Docs Preview",

  async collect(context: CIContext): Promise<ReportItem | null> {
    const { kumoDocsPreviewUrl, shortSha } = context;

    if (!kumoDocsPreviewUrl) {
      return null;
    }

    const content = `**Preview URL:** [${kumoDocsPreviewUrl}](${kumoDocsPreviewUrl})

This preview deployment (\`${shortSha}\`) contains the latest documentation changes from this MR.`;

    return {
      id: "kumo-docs-preview",
      title: "📚 Documentation Preview",
      priority: 30,
      content,
      success: true,
    };
  },
};
