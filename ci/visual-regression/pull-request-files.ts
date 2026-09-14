interface PullRequestFilesOptions {
  repository: string;
  pullRequestNumber: string;
  token: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePullRequestFiles(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error("GitHub pull request files response must be an array.");
  }

  return value.map((item, index) => {
    if (!isRecord(item) || typeof item.filename !== "string") {
      throw new Error(`Pull request file ${index} has no filename.`);
    }
    return item.filename;
  });
}

export async function getPullRequestFiles({
  repository,
  pullRequestNumber,
  token,
}: PullRequestFilesOptions): Promise<string[]> {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error("GITHUB_REPOSITORY must have the form owner/repo.");
  }
  if (!/^[1-9]\d*$/.test(pullRequestNumber)) {
    throw new Error("GITHUB_PR_NUMBER must be a positive integer.");
  }

  const filenames: string[] = [];
  for (let page = 1; page <= 30; page += 1) {
    const response = await fetch(
      `https://api.github.com/repos/${repository}/pulls/${pullRequestNumber}/files?per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (!response.ok) {
      throw new Error(
        `GitHub API returned HTTP ${response.status} for PR files.`,
      );
    }

    const pageFilenames = parsePullRequestFiles(await response.json());
    filenames.push(...pageFilenames);
    if (pageFilenames.length < 100) {
      return filenames;
    }
  }

  throw new Error("Pull request has more than 3,000 changed files.");
}
