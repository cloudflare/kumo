# CI/CD Scripts

TypeScript scripts + shell scripts for validation, reporting, versioning, and deployment. 6 GitHub Actions workflows in `.github/workflows/`.

**Parent:** See [root AGENTS.md](../AGENTS.md) for monorepo context.

## STRUCTURE

```
ci/
├── tsconfig.json              # ES2022, strict, Node types
├── reporters/
│   ├── types.ts               # Core types + artifact I/O (ci/reports/*.json)
│   ├── index.ts               # Reporter registry + re-exports
│   ├── npm-release.ts         # NPM beta install instructions (priority 10)
│   ├── kumo-docs-preview.ts   # Docs preview URL (priority 30)
│   └── visual-regression.ts   # Screenshot diff report
├── scripts/
│   ├── validate-kumo-changeset.ts   # Pre-push + CI changeset enforcement
│   ├── ensure-changeset-config.ts   # Guard: .changeset/config.json exists
│   ├── write-npm-report.ts          # Writes ci/reports/npm-release.json
│   ├── write-kumo-docs-report.ts    # Writes ci/reports/kumo-docs-preview.json
│   ├── post-pr-report.ts            # Aggregates artifacts → GitHub PR comment
│   └── create-release-pr.ts         # Creates release PR via GitHub API
├── utils/
│   ├── git-operations.ts      # Git ref detection (CI + local), diff, changed files
│   ├── github-api.ts          # Octokit wrapper (hardcoded: cloudflare/kumo)
│   └── pr-reporter.ts         # Markdown assembly + comment posting
├── visual-regression/
│   └── run-visual-regression.ts  # Creates vr-screenshots-{pr}-{runId} branches
└── versioning/
    ├── version-beta.sh        # changeset version + append -beta.<sha> via jq
    ├── publish-beta.sh        # Full pipeline: version → build → publish → verify (45s) → report
    ├── release-production.sh  # Branch → version → build → publish → verify (30s) → push → PR
    ├── deploy-kumo-docs-preview.sh   # Build → wrangler versions upload → preview URL → report
    └── deploy-kumo-docs-staging.sh   # Build → wrangler deploy --env staging
```

## WHERE TO LOOK

| Task                 | Location                                     | Notes                                                   |
| -------------------- | -------------------------------------------- | ------------------------------------------------------- |
| Changeset validation | `scripts/validate-kumo-changeset.ts`         | Used by lefthook pre-push AND CI                        |
| PR comment system    | `reporters/` + `scripts/post-pr-report.ts`   | Artifact bus via `ci/reports/*.json`                    |
| Beta release         | `versioning/publish-beta.sh`                 | Calls version-beta.sh internally                        |
| Production release   | `versioning/release-production.sh`           | Creates release branch + PR                             |
| Git operations       | `utils/git-operations.ts`                    | Dual-mode: GitHub Actions env vars / local `merge-base` |
| Visual regression    | `visual-regression/run-visual-regression.ts` | Creates ephemeral branches for screenshot diffs         |

## CONVENTIONS

### Artifact Bus Pattern

Jobs communicate via filesystem: each writes JSON to `ci/reports/{id}.json`, final job reads all.

```
publish-beta.sh → write-npm-report.ts → ci/reports/npm-release.json ──┐
                                                                       ├→ post-pr-report.ts → PR comment
deploy-docs-preview.sh → write-kumo-docs-report.ts → ci/reports/kumo-docs-preview.json ─┘
```

- Priority determines display order (lower = higher in comment): npm=10, docs=30
- Reporter returns `null` to skip (e.g., no package version = no npm section)
- `readReportArtifacts()` handles partial failures via `failures` array

### Shell ↔ TypeScript Boundary

- Shell scripts: orchestration (npm auth, git config, sequential builds, wrangler)
- TypeScript: structured operations (report generation, PR creation, GitHub API)
- Data channel: environment variables (`PACKAGE_VERSION`, `KUMO_DOCS_PREVIEW_URL`, `GITHUB_*`)

### Dual-Mode Git Operations

`getGitRefs()` adapts automatically:

- **CI**: Uses `GITHUB_BASE_REF` / `GITHUB_HEAD_REF`
- **Local**: Computes `git merge-base origin/main HEAD`
- Uses `execFileSync` (array args) to prevent shell injection

## GITHUB WORKFLOWS

| Workflow             | Trigger           | Purpose                                   |
| -------------------- | ----------------- | ----------------------------------------- |
| `release.yml`        | push:main         | changesets/action (Version PR or publish) |
| `pullrequest.yml`    | pull_request      | Build, lint, typecheck, test              |
| `preview.yml`        | pull_request      | pkg-pr-new, docs artifact upload          |
| `preview-deploy.yml` | workflow_run      | Fork PR deploy from artifact              |
| `bonk.yml`           | workflow_dispatch | AI agent integration                      |
| `reviewer.yml`       | pull_request      | Code review automation                    |

## ANTI-PATTERNS

| Pattern                                  | Why                    | Instead                                |
| ---------------------------------------- | ---------------------- | -------------------------------------- |
| Reading `process.env.*` directly         | Bypasses typed context | Use `buildContextFromEnv()`            |
| Adding reporter without registry         | Won't be collected     | Add to `reporters/index.ts` array      |
| Running `release-production.sh` as agent | Sensitive operation    | Human-only; use `DRY_RUN=true` to test |

## NOTES

- **Verify-after-publish**: Both beta (45s) and production (30s) scripts sleep then check npm registry. No retry logic.
- **`DRY_RUN=true`**: Production release script gates all destructive operations; logs what would happen
- **Hardcoded repo**: `github-api.ts` uses `owner: "cloudflare", repo: "kumo"`
- **Required secrets**: `NPM_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `GITHUB_TOKEN`, `FIGMA_TOKEN` (optional)
- **Visual regression**: Creates ephemeral `vr-screenshots-{pr}-{runId}` branches for diff images
- **Fork PR security**: `preview-deploy.yml` handles fork PRs via `workflow_run` (no secrets in fork context)
