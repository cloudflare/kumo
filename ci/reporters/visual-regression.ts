import type { CIContext, ReportItem, Reporter } from "./types";

export const visualRegressionReporter: Reporter = {
  id: "visual-regression",
  name: "Visual Regression",

  async collect(context: CIContext): Promise<ReportItem | null> {
    const { visualRegressionReport } = context;

    if (!visualRegressionReport) {
      return null;
    }

    return {
      id: "visual-regression",
      title: "Visual Regression",
      priority: 25,
      content: visualRegressionReport,
      success: true,
    };
  },
};
