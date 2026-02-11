# Docs Site (`@cloudflare/kumo-docs-astro`)

Astro documentation site for Kumo. React islands architecture. Deployed to Cloudflare Workers at `kumo-ui.com`.

**Parent:** See [root AGENTS.md](../../AGENTS.md) for monorepo context.

## STRUCTURE

```
kumo-docs-astro/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Homepage (HomeGrid showcase)
│   │   ├── components/{name}.astro  # 35 component doc pages
│   │   ├── blocks/{name}.astro      # 2 block doc pages
│   │   └── api/                     # JSON endpoints (version, component-registry)
│   ├── components/
│   │   ├── demos/                   # 40 *Demo.tsx files + 2 non-demo (feed into registry codegen!)
│   │   └── docs/                    # Doc components (PropsTable, CodeBlock, etc.)
│   ├── layouts/                     # BaseLayout → MainLayout → DocLayout
│   ├── lib/
│   │   ├── vite-plugin-kumo-colors.ts    # virtual:kumo-colors
│   │   ├── vite-plugin-kumo-registry.ts  # virtual:kumo-registry
│   │   └── component-registry.ts         # Server-side registry access
│   └── global.css                   # Tailwind entry + @source to kumo dist
├── scripts/
│   └── extract-demo-examples.ts     # Parses demos → dist/demo-metadata.json
├── astro.config.mjs                 # React + Tailwind + 2 custom Vite plugins
└── wrangler.jsonc                   # CF Workers deployment (static assets)
```

## WHERE TO LOOK

| Task               | Location                                        | Notes                              |
| ------------------ | ----------------------------------------------- | ---------------------------------- |
| Component doc page | `src/pages/components/{name}.astro`             | Uses DocLayout + ComponentExample  |
| Demo examples      | `src/components/demos/{Name}Demo.tsx`           | Naming is load-bearing (see below) |
| Props table        | `src/components/docs/PropsTable.astro`          | Server-rendered from registry      |
| Layout/nav         | `src/layouts/`, `src/components/SidebarNav.tsx` | Nav items are hard-coded           |
| Color tokens page  | `src/pages/colors.astro` + `ColorsDemo.tsx`     | Uses `virtual:kumo-colors`         |
| Registry viewer    | `src/pages/registry.astro` + `RegistryDemo.tsx` | Uses `virtual:kumo-registry`       |

## CONVENTIONS

### Demo File Naming (CRITICAL)

Demo extraction relies on exact naming:

- **File**: `{Component}Demo.tsx` (e.g., `ButtonDemo.tsx`)
- **Exports**: Functions ending in `Demo` suffix (e.g., `export function ButtonPrimaryDemo()`)
- **Both forms work**: `export function FooDemo()` and `export const FooDemo = () =>`
- **JSDoc** on demos becomes the `description` field in metadata

Wrong naming = function not extracted = missing from component registry.

### Hydration Directives

| Directive             | When                                         |
| --------------------- | -------------------------------------------- |
| `client:visible`      | Most component demos (lazy)                  |
| `client:load`         | Interactive: Dialog, Search, Toast, Registry |
| `client:only="react"` | SSR mismatch: ThemeToggle, HomeGrid          |

### Two Registry Access Patterns

- **Server-side** (`.astro` files): Import from `~/lib/component-registry.ts`
- **Client-side** (React demos): Use `virtual:kumo-registry` Vite module
- Do NOT mix them.

### Page Template

Pattern: `DocLayout` (title, sourceFile) → `ComponentSection` → `ComponentExample` → `<DemoComponent client:visible />`

Imports: `~/layouts/DocLayout.astro`, `~/components/docs/ComponentExample.astro`, `~/components/demos/{Name}Demo`

## ANTI-PATTERNS

| Pattern                             | Why                             | Instead                                  |
| ----------------------------------- | ------------------------------- | ---------------------------------------- |
| Demo function without `Demo` suffix | Won't be extracted for registry | Always suffix with `Demo`                |
| Manually updating PropsTable        | Data comes from registry        | Run `pnpm codegen:registry`              |
| Forgetting `@source` in global.css  | Tailwind misses kumo classes    | Keep `@source "../../../kumo/dist/**/*"` |
| Using system `prefers-color-scheme` | Site uses `data-mode` attribute | Use ThemeToggle / `localStorage.theme`   |

## NOTES

- **Build order**: `codegen:demos` runs first in `build` script; produces `dist/demo-metadata.json` consumed by kumo registry codegen
- **`dist/` is gitignored**: If `dist/demo-metadata.json` is missing, `codegen:registry` produces incomplete output
- **SidebarNav is manual**: Adding a component page requires updating `SidebarNav.tsx` arrays
- **HomeGrid is manual**: New components need adding to the showcase grid + `componentRoutes`
- **Search uses CommandPalette**: Client-side search powered by component registry API; works in dev mode without build step
- **PropsTable error message is stale**: Says `pnpm build:ai-metadata` but correct command is `pnpm codegen:registry`
- **BaseLayout has blocking inline script**: Reads `localStorage.theme` synchronously to prevent dark mode FOUC
- **`global.css`**: `@custom-variant dark` overrides Tailwind dark to match `[data-mode="dark"]`
- **Installed block**: `src/components/kumo/page-header/` is a block installed via `kumo add`, not a package import
