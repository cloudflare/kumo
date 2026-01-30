/**
 * NPM Release Reporter
 *
 * Reports the published npm package version with installation instructions.
 */

import type { CIContext, ReportItem, Reporter } from "./types";

export const npmReleaseReporter: Reporter = {
  id: "npm-release",
  name: "NPM Release",

  async collect(context: CIContext): Promise<ReportItem | null> {
    const { packageName, packageVersion } = context;

    if (!packageVersion) {
      return null;
    }

    const content = `\`${packageName}@${packageVersion}\` has been published to the npm registry.

**Installation:**
\`\`\`bash
pnpm add ${packageName}@${packageVersion}
\`\`\`

**Testing:** You can now test this beta version in your projects before the final release.`;

    return {
      id: "npm-release",
      title: "📦 NPM Package",
      priority: 10,
      content,
      success: true,
    };
  },
};
