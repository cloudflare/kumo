# KUMO KNOWLEDGE BASE

**Generated:** 2026-03-18 | **Commit:** 38518e34 | **Branch:** rozenmd/fix-preview

## OVERVIEW

Cloudflare's React component library (`@cloudflare/kumo`). pnpm monorepo: component library (Base UI + Tailwind v4), Astro docs site, Figma plugin, screenshot worker. ESM-only, Node 24+.

## STRUCTURE

```
kumo/
├── packages/
│   ├── kumo/                     # Component library → see packages/kumo/AGENTS.md
│   ├── kumo-docs-astro/          # Astro docs site → see packages/kumo-docs-astro/AGENTS.md
│   ├── kumo-figma/               # Figma plugin → see packages/kumo-figma/AGENTS.md
│   └── kumo-screenshot-worker/   # Visual regression Worker → see packages/kumo-screenshot-worker/AGENTS.md
├── ci/                           # CI/CD scripts → see ci/AGENTS.md
├── lint/                         # Custom oxlint rules (5 rules in package, 4 at root)
├── .changeset/                   # Changeset files
├── .github/workflows/            # 6 workflow YAMLs (release, pullrequest, preview, etc.)
└── lefthook.yml                  # Pre-push changeset validation
```

## WHERE TO LOOK

| Task                 | Location                                         | Notes                                                    |
| -------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| Component API        | `packages/kumo/ai/component-registry.{json,md}`  | Source of truth. Query with `jq` or CLI                  |
| Component source     | `packages/kumo/src/components/{name}/{name}.tsx` | Standard pattern                                         |
| Blocks (installable) | `packages/kumo/src/blocks/`                      | NOT library exports; installed via CLI                   |
| Semantic tokens      | `packages/kumo/src/styles/theme-kumo.css`        | AUTO-GENERATED; edit `scripts/theme-generator/config.ts` |
| Custom lint rules    | `lint/` (4 rules) + `packages/kumo/lint/` (+1)   | Package copy adds `no-deprecated-props`                  |
| Demo examples        | `packages/kumo-docs-astro/src/components/demos/` | Feed into registry codegen                               |
| CI scripts           | `ci/`                                            | Reporter system, versioning, deployment                  |
| Figma generators     | `packages/kumo-figma/src/generators/`            | 37 component generators                                  |

## CONVENTIONS

### Styling (CRITICAL)

- **ONLY semantic tokens**: `bg-kumo-base`, `text-kumo-default`, `border-kumo-line`, `ring-kumo-hairline`
- **NEVER raw Tailwind colors**: `bg-blue-500`, `text-gray-900` → fails lint
- **NEVER `dark:` variant**: dark mode automatic via `light-dark()` in CSS custom properties
- **Exceptions**: `bg-white`, `bg-black`, `text-white`, `text-black`, `transparent`
- **`cn()` utility**: Always compose classNames via `cn("base", conditional && "extra", className)`
- **Surface hierarchy**: `bg-kumo-base` → `bg-kumo-elevated` → `bg-kumo-recessed`
- **Mode/theme**: `data-mode="light"|"dark"` + `data-theme="fedramp"` on parent element

### Components

- **Scaffold new**: `pnpm --filter @cloudflare/kumo new:component` (never create manually)
- **Registry first**: Always check `component-registry.json` before using/modifying a component
- See `packages/kumo/AGENTS.md` for component conventions (variants, forwardRef, displayName)

### Imports

- **No cross-package relative imports**: Use `@cloudflare/kumo` not `../../kumo/src/...` (lint-enforced)
- **ESM-only**: `"type": "module"` throughout. No CJS.

### Changesets

- **Enforced for `packages/kumo/`**: Pre-push hook requires changeset for npm-published library
- **Optional for `kumo-docs-astro`**: Version appears in `/api/version` endpoint (debugging) but nothing depends on it
- **Not needed for `kumo-figma`**: Figma plugin, not published to npm
- **Pre-push hook**: Lefthook validates before push. Bypass: `git push --no-verify`
- **AI agents NEVER**: `pnpm version`, `pnpm release`, `pnpm publish:beta`, `pnpm release:production`

### Pull Request Descriptions

PR descriptions are validated by CI. Include this checklist at the end of your PR body:

```markdown
- Reviews
- [ ] bonk has reviewed the change
- [x] automated review not possible because: <your reason here>
- Tests
- [ ] Tests included/updated
- [ ] Automated tests not possible - manual testing has been completed as follows: <description>
- [x] Additional testing not necessary because: <your reason here>
```

Rules:

- Check ONE option in each section (Reviews and Tests)
- If providing a justification (`because:` or `as follows:`), text must follow on the same line
- Indentation is flexible — nested under headers is fine
- Skip validation entirely with the `skip-pr-description-validation` label

## ANTI-PATTERNS

| Pattern                        | Why                                                          | Instead                                     |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------- |
| `bg-blue-500`, `text-gray-*`   | Breaks theming, fails lint                                   | `bg-kumo-brand`, `text-kumo-default`        |
| `dark:bg-black`                | Redundant; tokens auto-adapt                                 | Remove `dark:` prefix                       |
| Missing `displayName`          | Breaks React DevTools                                        | Set `.displayName` on forwardRef components |
| Manual component file creation | Misses vite/package.json/index updates                       | Use scaffolding tool                        |
| Editing auto-generated files   | `theme-kumo.css`, `ai/schemas.ts`, `ai/component-registry.*` | Edit source configs, run codegen            |

## COMMANDS

```bash
# Cross-cutting
pnpm dev                                          # Docs dev server (localhost:4321)
pnpm lint                                         # oxlint + custom rules
pnpm typecheck                                    # TypeScript check all packages
pnpm changeset                                    # Create changeset (required for kumo changes)

# Package-specific (see child AGENTS.md for full lists)
pnpm --filter @cloudflare/kumo build              # Build library
pnpm --filter @cloudflare/kumo test               # Vitest
pnpm --filter @cloudflare/kumo codegen:registry   # Regenerate component-registry
pnpm --filter @cloudflare/kumo-figma build        # Build Figma plugin
```

## BUILD PIPELINE

```
kumo-docs-astro demos → dist/demo-metadata.json
                              ↓
kumo codegen:registry → ai/component-registry.{json,md} + ai/schemas.ts
                              ↓
kumo-figma build:data → generated/*.json → esbuild → code.js (IIFE, ES2017)
```

Cross-package dependency: registry codegen requires docs demo metadata. Run `codegen:demos` in docs before `codegen:registry` in kumo.

## TOOLCHAIN

| Tool       | Version   | Notes                                  |
| ---------- | --------- | -------------------------------------- |
| Node       | ^24.12.0  | Engine constraint                      |
| pnpm       | >=10.21.0 | Workspace manager                      |
| TypeScript | 5.9.2     | Via pnpm catalog                       |
| Vite       | 7.1.7     | Library mode (kumo), dev server (docs) |
| Tailwind   | 4.1.17    | v4 with `light-dark()` tokens          |
| oxlint     | 1.42.0    | Primary linter + 5 custom JS rules     |
| Vitest     | 3.2.4     | happy-dom env, v8 coverage             |
| Changesets | latest    | Version management                     |
| Astro      | latest    | Docs framework                         |

## SECURITY

- **NEVER commit** Figma tokens, npm tokens, or API keys
- `.env` files are gitignored
- `wrangler.jsonc` contains Cloudflare account IDs (not secret but don't expose)

## NOTES

- `ai/component-registry.json`, `ai/component-registry.md` are auto-generated at build time and gitignored (shipped in npm package). `ai/schemas.ts` is a stub for fresh clones (full version generated during build)
- `src/primitives/` (40 files) are auto-generated Base UI re-exports
- Blocks in `src/blocks/` are NOT exported from package index; installed via CLI `kumo add`
- `src/catalog/` is a runtime JSON-UI rendering module (separate concern from component library)
- Dual linter: oxlint (fast, custom rules) + ESLint (7 jsx-a11y rules only via oxlint JS plugin)
- `PLOP_INJECT_EXPORT` and `PLOP_INJECT_COMPONENT_ENTRY` markers in source for scaffolding
- 6 GitHub Actions workflows exist in `.github/workflows/` (release, pullrequest, preview, preview-deploy, bonk, reviewer)
