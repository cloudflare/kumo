# Component Library (`@cloudflare/kumo`)

React component library: Base UI + Tailwind v4 + Vite library mode. ESM-only, tree-shakeable per-component exports.

**Parent:** See [root AGENTS.md](../../AGENTS.md) for monorepo context.

## STRUCTURE

```
kumo/
├── src/
│   ├── components/          # 39 UI components → see src/components/AGENTS.md
│   ├── blocks/              # Installable blocks (NOT library exports; via CLI `kumo add`)
│   ├── primitives/          # AUTO-GENERATED Base UI re-exports (40 files)
│   ├── catalog/             # JSON-UI rendering runtime (DynamicValue, visibility conditions)
│   ├── code/                # Shiki-based code highlighting (lazy-loaded, 16 bundled languages)
│   ├── command-line/        # CLI: ls, doc, add, blocks, init, migrate
│   ├── styles/              # CSS: kumo-binding.css + theme files (AUTO-GENERATED)
│   ├── utils/               # cn(), safeRandomId, LinkProvider
│   ├── registry/            # Type-only exports for registry metadata
│   └── index.ts             # Main barrel export (PLOP_INJECT_EXPORT marker)
├── ai/                      # AUTO-GENERATED: component-registry.{json,md}, schemas.ts
├── scripts/
│   ├── component-registry/  # Registry codegen (13 sub-modules, 930+ lines orchestrator)
│   ├── theme-generator/     # Theme CSS codegen from config.ts
│   ├── generate-primitives.ts
│   └── css-build.ts         # Post-Vite CSS processing
├── lint/                    # 5 custom oxlint rules (superset of root lint/)
├── tests/imports/           # Structural validation: export paths, package.json, build entries
├── vite.config.ts           # Library mode, dynamic primitive discovery, PLOP marker
└── vitest.config.ts         # happy-dom, v8 coverage, path aliases
```

## WHERE TO LOOK

| Task                     | Location                                        | Notes                                                                      |
| ------------------------ | ----------------------------------------------- | -------------------------------------------------------------------------- |
| Component implementation | `src/components/{name}/{name}.tsx`              | Always check registry first                                                |
| Component API reference  | `ai/component-registry.json`                    | Source of truth for props/variants                                         |
| Variant definitions      | `KUMO_{NAME}_VARIANTS` export in component file | Machine-readable + lint-enforced                                           |
| CLI commands             | `src/command-line/commands/`                    | `ls`, `doc`, `add`, `blocks`, `init`, `migrate`                            |
| Catalog runtime          | `src/catalog/`                                  | JSON pointer resolution, visibility conditions                             |
| Code highlighting        | `src/code/`                                     | ShikiProvider, lazy-loaded highlighter, 16 bundled languages               |
| Blocks source            | `src/blocks/{name}/`                            | Installed to consumers via CLI, not exported                               |
| Scaffold new component   | `plopfile.js`                                   | Injects into index.ts, vite.config.ts, package.json                        |
| Token definitions        | `scripts/theme-generator/config.ts`             | Source of truth; generates theme CSS                                       |
| Registry codegen         | `scripts/component-registry/index.ts`           | 13 sub-modules; pipeline: discovery → cache → type extraction → enrichment |

## CONVENTIONS

### Build System

- **Three-step build**: `vite build` → `css-build.ts` (copies CSS + `@tailwindcss/cli`) → `build-cli.ts` (esbuild)
- **Bundled deps**: `@base-ui/react`, `clsx`, `tailwind-merge` are bundled (not external)
- **External peers**: `react`, `react-dom`, `@phosphor-icons/react` only
- **`"use client"` banner**: Injected on ALL output chunks for RSC compatibility
- **`sideEffects: ["*.css"]`**: Only CSS is side-effectful; enables aggressive tree-shaking
- **Manual chunks**: `vendor-styling`, `vendor-floating-ui`, `vendor-base-ui`, `vendor-utils`

### Component File Pattern

See `src/components/AGENTS.md` for detailed component conventions.

### Registry Codegen Pipeline

```
kumo-docs-astro demos → dist/demo-metadata.json  (cross-package dependency!)
                              ↓
ts-json-schema-generator → TypeScript type extraction
                              ↓
Enrichment: variants + examples + sub-components + styling metadata
                              ↓
Output: ai/component-registry.{json,md} + ai/schemas.ts
```

- **Cache**: Hash-based at `.cache/component-registry-cache.json`. Bypass: `--no-cache`
- **Parallel**: Processes components in batches of 8
- **Fallback**: If type extraction fails, falls back to variants-only props (silent)
- **Metadata overrides**: `scripts/component-registry/metadata.ts` has manual `ADDITIONAL_COMPONENT_PROPS`, `PROP_TYPE_OVERRIDES`

### Testing

- **Vitest** with `happy-dom`, globals enabled
- **Path aliases**: `@/` → `src/`, `@cloudflare/kumo` → `src/index.ts`
- **Structural tests** in `tests/imports/`: validate all export paths resolve, package.json matches vite entries
- **Sparse component tests**: Only ~6 components have unit tests; emphasis on infrastructure testing
- **`describe.skipIf(!isBuilt)`**: Export validation tests skip gracefully when `dist/` missing

## ANTI-PATTERNS

| Pattern                                              | Why                                    | Instead                              |
| ---------------------------------------------------- | -------------------------------------- | ------------------------------------ |
| Editing `src/primitives/`                            | Auto-generated from Base UI            | Run `pnpm codegen:primitives`        |
| Editing `ai/schemas.ts` or `ai/component-registry.*` | Auto-generated at build time           | Edit source files, CI generates them |
| Creating component files manually                    | Misses index/vite/package.json updates | `pnpm new:component`                 |
| `as any` in component code                           | 3 existing instances; don't add more   | Model types correctly                |
| Dynamic Tailwind class construction                  | JIT can't detect `leading-[${val}]`    | Use static class strings             |

## DEPRECATED COMPONENTS/PROPS

### Components

| Component         | Replacement                          |
| ----------------- | ------------------------------------ |
| `DateRangePicker` | Use `DatePicker` with `mode="range"` |

### Props (lint-enforced via `no-deprecated-props`)

| Component           | Prop                                | Replacement                                              |
| ------------------- | ----------------------------------- | -------------------------------------------------------- |
| `Select`            | `hideLabel`                         | Use `aria-label` instead of `label` + `hideLabel={true}` |
| `DropdownMenu.Item` | `href`                              | Use `DropdownMenu.LinkItem` for navigation               |
| `Checkbox`          | `onChange`, `onIndeterminateChange` | Use `onCheckedChange`                                    |
| `Banner`            | `text`, `children`                  | Use `title` and `description` props                      |
| `TimeseriesChart`   | `formatValue`                       | Use `tooltipValueFormat`                                 |
| `Code`              | `CodeLanguage` type                 | Use `CodeLang` type                                      |

## NOTES

- **Compound components**: CommandPalette (14 sub-components), Dialog, Select use two-level contexts
- **13 components use createContext**: SwitchGroup, PaginationContext, RadioGroup, FlowNodeAnchor, Diagram, Descendants, InputGroup, DialogRole, ComboboxSize, Grid, CheckboxGroup, CommandPalette (2)
- **DateRangePicker**: Contains 150 lines of duplicated ternary logic (refactoring target)
- **Catalog `initCatalog`**: Appears to have race condition with async schema loading
- **CLI path inconsistency**: `ls`/`doc` read from `catalog/`, `blocks` from `ai/` directory
- **`PLOP_INJECT_EXPORT`** in `src/index.ts` and `PLOP_INJECT_COMPONENT_ENTRY` in `vite.config.ts` are scaffolding markers
- **5th lint rule** (`no-deprecated-props`): Only in `packages/kumo/lint/`, reads deprecation data from registry
- **LinkProvider**: Framework-agnostic link abstraction; wrap app with custom Link component (e.g., Next.js)
