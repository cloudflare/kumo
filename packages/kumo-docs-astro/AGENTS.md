# KUMO DOCS KNOWLEDGE BASE

**Generated:** 2026-09-03 | **Commit:** 9b4eb70 | **Branch:** rozenmd/test-preview

## OVERVIEW

Astro documentation site for `@cloudflare/kumo`. Static output uses React islands,
MDX reference pages, Tailwind v4, and Cloudflare Workers static assets.

**Parent:** See [root AGENTS.md](../../AGENTS.md) for monorepo-wide rules.

## STRUCTURE

```text
kumo-docs-astro/
├── src/
│   ├── components/
│   │   ├── demos/       # Executable examples; registry codegen input
│   │   ├── docs/        # MDX/Astro documentation building blocks
│   │   ├── kumo/        # CLI-installed blocks owned by this site
│   │   └── skill/       # Interactive design-skill content
│   ├── layouts/         # Base shell, navigation, and document layouts
│   ├── lib/             # Vite plugins, Markdown conversion, registry access
│   ├── pages/           # File-based routes and API/static text endpoints
│   └── styles/global.css
├── scripts/             # Demo metadata and design-skill generators
├── astro.config.mjs     # Astro, MDX, React, Tailwind, and custom plugins
├── vite.config.ts       # Type-aware lint rules
└── wrangler.jsonc       # Static-assets Worker routes and environments
```

## WHERE TO LOOK

| Task                    | Location                               | Notes                                           |
| ----------------------- | -------------------------------------- | ----------------------------------------------- |
| Component reference     | `src/pages/components/`                | MDX joins demos, props, and VR metadata         |
| Demo behavior           | `src/components/demos/`                | Also feeds registry metadata                    |
| Page chrome             | `src/layouts/`                         | `BaseLayout` -> `MainLayout` -> document layout |
| Navigation              | `src/components/SidebarNav.tsx`        | Route lists are manual                          |
| Docs building blocks    | `src/components/docs/`                 | Examples, props, code, headings, TOC            |
| Registry data           | `src/lib/component-registry.ts`        | Server-side access                              |
| Client registry         | `src/lib/vite-plugin-kumo-registry.ts` | Provides `virtual:kumo-registry`                |
| Development HMR         | `src/lib/vite-plugin-kumo-hmr.ts`      | Rewrites Kumo imports to source                 |
| Demo extraction         | `scripts/extract-demo-examples.ts`     | Writes `dist/demo-metadata.json`                |
| Design skill generation | `scripts/generate-design-skill.mjs`    | Writes `public/skill.md`                        |
| Worker deployment       | `wrangler.jsonc`                       | `dist` assets; production and staging routes    |

## DATA FLOW

```text
src/components/demos/*Demo.tsx
  -> codegen:demos
  -> dist/demo-metadata.json
  -> Kumo component-registry codegen

src/components/skill/*
  -> generate-design-skill
  -> public/skill.md
```

`vp run build:docs` builds `@cloudflare/kumo` first. Production Astro builds use
the package output, while development aliases Kumo imports to source for HMR.

## CONVENTIONS

- Use `~/*` for package-local imports; it maps to `src/*`.
- Standard component pages use `MdxDocLayout`, then present the primary demo,
  installation, usage, examples, and registry-backed props.
- Give visual-regression examples stable `vrSection` slugs and `vrTitle` values.
- Use semantic Kumo tokens only. Raw Tailwind colors and `dark:` variants fail lint.
- Compose Kumo component classes with established package patterns; do not bypass
  `kumo/no-cross-package-imports`.
- Server-side Astro code imports `~/lib/component-registry.ts`. React islands use
  `virtual:kumo-registry`.
- Choose hydration by behavior: `client:visible` for ordinary demos,
  `client:load` for immediately interactive UI, and `client:only="react"` only for
  known SSR mismatches.
- Keep `@cloudflare/kumo/styles` before Tailwind imports. Keep the Kumo `@source`
  directive so Tailwind discovers package classes.
- View transitions persist parts of the page shell. Browser state that follows
  navigation must listen for Astro lifecycle events.

## ANTI-PATTERNS

- Do not edit `dist/`, `.astro/`, or `public/skill.md`; builds regenerate them.
- Do not put `AGENTS.md` or other non-route Markdown under `src/pages/`. Astro
  treats Markdown there as a route and emits unwanted build output.
- Do not treat blocks in `src/components/kumo/` as package exports. They are
  installed source owned by the docs site.
- Do not add a route without updating the applicable list in `SidebarNav.tsx`.
- Do not import the server registry module into hydrated React components.
- Do not assume `astro preview` models Cloudflare routing; deployment serves
  `dist` through the static-assets Worker configuration.

## COMMANDS

```bash
pnpm --filter @cloudflare/kumo-docs-astro dev
pnpm --filter @cloudflare/kumo-docs-astro build
pnpm --filter @cloudflare/kumo-docs-astro test
pnpm --filter @cloudflare/kumo-docs-astro typecheck
pnpm --filter @cloudflare/kumo-docs-astro lint
pnpm vp run build:docs
```

## NOTES

- `dist/demo-metadata.json` is a build intermediate but is also consumed across
  packages. Missing it produces incomplete component registry data.
- Build metadata in `astro.config.mjs` reads both package versions and Git state,
  then injects constants used by the site shell and version endpoint.
- Preview URLs require Wrangler to run with this directory as its project root,
  or with an explicit path to this `wrangler.jsonc`.
- Docs-only changes do not normally require a changeset.
