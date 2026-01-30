# GitHub Migration Plan: Kumo Repository

> **Generated:** January 22, 2026  
> **Status:** IMPLEMENTED  
> **Purpose:** Guide for migrating Kumo from internal GitLab to public GitHub

## Implementation Summary

All migration tasks have been completed. The following changes were made:

### Files Removed

- `.gitlab-ci.yml` - Replaced with GitHub Actions workflows
- `ci/utils/gitlab-api.ts` - Replaced with `github-api.ts`
- `ci/scripts/create-release-mr.ts` - Replaced with `create-release-pr.ts`
- `CODEOWNERS` (root) - Moved to `.github/CODEOWNERS`

### Files Created

- `.github/CODEOWNERS` - GitHub-format code owners
- `.github/workflows/ci.yml` - CI workflow (build, lint, test, typecheck)
- `.github/workflows/preview.yml` - Preview deployments and beta releases
- `.github/workflows/release.yml` - Production releases and staging deployments
- `ci/utils/github-api.ts` - GitHub API utilities using Octokit
- `ci/scripts/create-release-pr.ts` - GitHub PR creation script

### Files Modified

- `packages/kumo/package.json` - Updated repository URL and publishConfig
- `.npmrc` - Updated for public npm registry
- `README.md` - Removed wiki links, updated npm instructions, updated CI references
- `ci/README.md` - Rewritten for GitHub Actions
- `ci/utils/mr-reporter.ts` - Updated for GitHub PRs
- `ci/utils/git-operations.ts` - Updated for GitHub Actions environment
- `ci/reporters/types.ts` - Updated for GitHub context
- `ci/versioning/publish-beta.sh` - Updated npm registry and git config
- `ci/versioning/release-production.sh` - Updated for GitHub
- `packages/kumo-docs-astro/src/layouts/DocLayout.astro` - GitLab → GitHub
- `packages/kumo-docs-astro/src/components/docs/StickyDocHeader.tsx` - GitLab → GitHub
- `packages/kumo-docs-astro/src/pages/installation.astro` - Removed internal registry docs
- `packages/kumo-docs-astro/src/pages/contributing.astro` - GitLab → GitHub
- `packages/kumo/scripts/figma/README.md` - Added internal file note
- `packages/figma/src/README.md` - Added internal file note

### Dependencies Added

- `@octokit/rest` - For GitHub API interactions

---

## Executive Summary

**The repository is safe for migration** - no actual secrets or credentials are committed. The main work involves:

1. Removing/replacing GitLab-specific CI/CD configuration
2. Updating internal URLs (GitLab, wiki, npm registry)
3. Converting CODEOWNERS format
4. Documenting internal Figma file references

---

## Security Assessment

### Files NOT Found (Confirming Good Hygiene)

| File Type                                  | Status                              |
| ------------------------------------------ | ----------------------------------- |
| `.env` files                               | Not committed (properly gitignored) |
| `.dev.vars` files                          | Not committed (properly gitignored) |
| Private keys (`*.pem`, `*.key`, `id_rsa*`) | None found                          |
| Certificates (`*.crt`, `*.cert`)           | None found                          |
| Hardcoded passwords or API tokens          | None found                          |
| AWS credentials or service account files   | None found                          |

### Risk Assessment

| Risk                  | Level      | Notes                                     |
| --------------------- | ---------- | ----------------------------------------- |
| Secrets exposure      | **NONE**   | No secrets found in codebase              |
| Internal URLs in code | **LOW**    | All identified, straightforward to update |
| CI/CD downtime        | **MEDIUM** | Plan GitHub Actions before migration      |
| npm publish issues    | **LOW**    | Test with beta release first              |

---

## Phase 1: Files to REMOVE

| File             | Reason                                          |
| ---------------- | ----------------------------------------------- |
| `.gitlab-ci.yml` | GitLab-specific CI, replace with GitHub Actions |

---

## Phase 2: Files to MODIFY

### 2.1 Critical Path (Must complete before migration)

#### `packages/kumo/package.json`

| Line | Current                                                            | Change To                                  |
| ---- | ------------------------------------------------------------------ | ------------------------------------------ |
| 9    | `"url": "https://gitlab.cfdata.org/cloudflare/fe/kumo.git"`        | GitHub repository URL                      |
| 349  | `"access": "restricted"`                                           | `"access": "public"`                       |
| 350  | `"registry": "https://registry-gateway.cloudflare-ui.workers.dev"` | `"registry": "https://registry.npmjs.org"` |

#### `.npmrc`

```diff
- @cloudflare:registry=https://registry-gateway.cloudflare-ui.workers.dev
- //registry-gateway.cloudflare-ui.workers.dev/:_authToken="${NPM_TOKEN}"
+ @cloudflare:registry=https://registry.npmjs.org
+ //registry.npmjs.org/:_authToken="${NPM_TOKEN}"
```

#### `CODEOWNERS`

Convert from GitLab format to GitHub format:

| GitLab Syntax                         | GitHub Equivalent                       |
| ------------------------------------- | --------------------------------------- |
| `[Repo Maintainers][2] @user1 @user2` | `* @org/team-name` or `* @user1 @user2` |
| `!pnpm-lock.yaml` (exclusion)         | Not directly supported - remove         |
| `^[Notification]` syntax              | Not supported - remove                  |

Also:

- Remove internal wiki link (line 6)
- Remove GitLab group reference (line 11)
- Update usernames to GitHub usernames (lines 20, 27)

---

### 2.2 CI Scripts (Functional changes required)

| File                                  | Changes Required                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `ci/utils/gitlab-api.ts`              | Rewrite for GitHub API (Octokit) - export `GITHUB_API`, `GITHUB_REPO`        |
| `ci/utils/mr-reporter.ts`             | Convert from GitLab MR comments to GitHub PR comments                        |
| `ci/utils/git-operations.ts`          | Replace `CI_MERGE_REQUEST_*` env vars with `GITHUB_*` equivalents            |
| `ci/scripts/create-release-mr.ts`     | Convert to GitHub PR creation                                                |
| `ci/scripts/post-mr-report.ts`        | Update for GitHub Actions context                                            |
| `ci/reporters/types.ts`               | Update CI environment variable references                                    |
| `ci/versioning/publish-beta.sh`       | Update npm registry (lines 11-12), change git email from `ci@cloudflare.com` |
| `ci/versioning/release-production.sh` | Convert GitLab push/MR logic to GitHub                                       |

---

### 2.3 Documentation Updates

| File                                                               | Line(s)  | Change                                                                      |
| ------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------- |
| `README.md`                                                        | 88       | Remove `wiki.cfdata.org` link                                               |
| `README.md`                                                        | 94-95    | Update npm registry instructions for public npm                             |
| `ci/README.md`                                                     | Multiple | Document GitHub Actions equivalents, remove Vault paths, remove account IDs |
| `packages/kumo-docs-astro/src/layouts/DocLayout.astro`             | 30       | Change GitLab source links to GitHub format                                 |
| `packages/kumo-docs-astro/src/pages/installation.astro`            | 22       | Remove wiki link                                                            |
| `packages/kumo-docs-astro/src/pages/installation.astro`            | 46-47    | Update npm registry instructions                                            |
| `packages/kumo-docs-astro/src/pages/contributing.astro`            | 723      | Update to GitHub URL                                                        |
| `packages/kumo-docs-astro/src/components/docs/StickyDocHeader.tsx` | 179      | Update to GitHub URL                                                        |

---

### 2.4 Figma Documentation Updates

These files reference an internal Cloudflare Figma file (`sKKZc6pC6W1TtzWBLxDGSU`). The file key is **not a secret**, but external users won't have access to this file.

| File                                    | Line(s)     | Change                                                                                                                                  |
| --------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/figma/src/code.ts`            | 7           | Add comment noting this is an internal Figma file                                                                                       |
| `packages/figma/src/README.md`          | 26, 162-163 | Add note: "This Figma file is internal to Cloudflare. External users would need to create their own Figma file and run the token sync." |
| `packages/kumo/scripts/figma/README.md` | 71, 85      | Add note about internal Figma file                                                                                                      |
| `AGENTS.md`                             | 911         | Add note about internal Figma file                                                                                                      |

---

## Phase 3: Files to KEEP (No Changes)

### Configuration Files

| File                                       | Reason                                        |
| ------------------------------------------ | --------------------------------------------- |
| `.gitignore`                               | Already excludes sensitive files              |
| `.vscode/settings.json`                    | Editor config only                            |
| `lefthook.yml`                             | Platform-agnostic git hooks                   |
| `.changeset/config.json`                   | Standard changeset config                     |
| `packages/kumo/wrangler.jsonc`             | Account ID is public identifier, safe to keep |
| `packages/kumo-docs-astro/wrangler.jsonc`  | Same as above                                 |
| `packages/kumo/scripts/figma/.env.example` | Template with empty values                    |

### Source Code

| Directory                           | Notes                          |
| ----------------------------------- | ------------------------------ |
| `packages/kumo/src/**/*`            | No internal references         |
| `packages/kumo-docs-astro/src/**/*` | Except files listed in Phase 2 |
| `packages/figma/src/**/*`           | No secrets, plugin is clean    |

### Generated/Build Files

| File                                       | Notes                                   |
| ------------------------------------------ | --------------------------------------- |
| `packages/kumo/ai/component-registry.json` | Auto-generated, contains demo data only |
| `packages/kumo/ai/component-registry.md`   | Same as above                           |

### Mock/Demo Data (Safe)

| File                                           | Content                                  | Status           |
| ---------------------------------------------- | ---------------------------------------- | ---------------- |
| `src/components/sensitive-input/*.stories.tsx` | `"secret-api-key-123"`                   | Demo data - KEEP |
| `src/pages/active-sessions/*-mocks.ts`         | RFC 1918 IPs (`192.168.x.x`, `10.0.0.x`) | Mock data - KEEP |

---

## Phase 4: New Files to Create

### GitHub Actions Workflows

```
.github/
├── workflows/
│   ├── ci.yml              # PR checks: build, lint, test, typecheck
│   ├── preview.yml         # Deploy Storybook/docs previews
│   └── release.yml         # Production releases
├── CODEOWNERS              # Converted from GitLab format
└── dependabot.yml          # (Optional) Dependency updates
```

### Required GitHub Secrets

| Secret Name             | Purpose                  | Source                          |
| ----------------------- | ------------------------ | ------------------------------- |
| `NPM_TOKEN`             | Publishing to public npm | npm access token                |
| `CLOUDFLARE_API_TOKEN`  | Workers deployments      | Cloudflare dashboard            |
| `CLOUDFLARE_ACCOUNT_ID` | Workers deployments      | (Optional - can keep in config) |

---

## Vault → GitHub Secrets Migration

These Vault paths in `.gitlab-ci.yml` need equivalent GitHub Secrets:

| Vault Path                                                     | GitHub Secret                           |
| -------------------------------------------------------------- | --------------------------------------- |
| `gitlab/_ci_components/_dev/npm/kv_token@kv`                   | `NPM_TOKEN`                             |
| `gitlab/cloudflare/fe/kumo/_dev/cloudflare_api_token/data@kv`  | `CLOUDFLARE_API_TOKEN`                  |
| `gitlab/cloudflare/fe/kumo/_dev/cloudflare_account_id/data@kv` | `CLOUDFLARE_ACCOUNT_ID`                 |
| `gitlab/cloudflare/fe/kumo/_dev/kumo_preview_bot_v2/data@kv`   | `GITHUB_TOKEN` (built-in) or custom PAT |
| `gitlab/cloudflare/fe/kumo/_dev/ci_release_token_v2/data@kv`   | `RELEASE_TOKEN`                         |

---

## Internal URL Reference Summary

| Type                  | Current Value                                | Files Affected                                                                                    |
| --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| GitLab Host           | `gitlab.cfdata.org`                          | `.gitlab-ci.yml`, `ci/utils/gitlab-api.ts`, `ci/utils/mr-reporter.ts`, `package.json`, docs files |
| Vault URL             | `vault.cfdata.org`                           | `.gitlab-ci.yml`                                                                                  |
| NPM Registry          | `registry-gateway.cloudflare-ui.workers.dev` | `.npmrc`, `.gitlab-ci.yml`, `package.json`, `publish-beta.sh`, docs files                         |
| Wiki                  | `wiki.cfdata.org`                            | `README.md`, `CODEOWNERS`                                                                         |
| Workers Subdomain     | `design-engineering.workers.dev`             | `deploy-storybook-preview.sh`, `deploy-kumo-docs-preview.sh`, `ci/README.md`                      |
| Cloudflare Account ID | `61e3887ff0554f81e1e175d106c3926f`           | `wrangler.jsonc` files, `ci/README.md`                                                            |
| Figma File Key        | `sKKZc6pC6W1TtzWBLxDGSU`                     | `packages/figma/src/code.ts`, Figma READMEs, `AGENTS.md`                                          |

---

## Migration Checklist

### Pre-Migration

- [ ] Create new GitHub repository
- [ ] Set up GitHub Secrets (`NPM_TOKEN`, `CLOUDFLARE_API_TOKEN`)
- [x] Prepare GitHub CODEOWNERS file
- [x] Plan GitHub Actions workflows

### File Modifications

- [x] Update `packages/kumo/package.json` - repository URL, publishConfig
- [x] Update `.npmrc` - public npm registry
- [x] Rewrite `CODEOWNERS` for GitHub format
- [x] Update `README.md` - remove wiki links, update npm instructions
- [x] Update docs site files - GitLab → GitHub URLs
- [x] Update Figma documentation with internal file notes
- [x] Update CI scripts for GitHub API/environment

### Post-Migration

- [x] Create GitHub Actions workflows (`ci.yml`, `preview.yml`, `release.yml`)
- [x] Remove `.gitlab-ci.yml`
- [ ] Test npm publish workflow with beta release
- [ ] Test preview deployments
- [ ] Verify CODEOWNERS works correctly
- [ ] Update any remaining internal links found during testing

---

## Appendix: Files by Action Summary

| Action     | Count      | Files                                |
| ---------- | ---------- | ------------------------------------ |
| **REMOVE** | 1          | `.gitlab-ci.yml`                     |
| **MODIFY** | 18         | See Phase 2 sections                 |
| **KEEP**   | All others | Source code, configs, assets         |
| **CREATE** | 3-4        | GitHub Actions workflows, CODEOWNERS |
