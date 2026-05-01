---
"@cloudflare/kumo": minor
"@cloudflare/kumo-docs-astro": minor
"@cloudflare/kumo-figma": minor
---

Surface `LinkButton` and `RefreshButton` in the component registry, CLI, docs, and Figma plugin.

Adds a `KUMO_REGISTRY_COMPONENTS` marker that a component directory's `index.ts` can export to register multiple sibling components from a single source file. Previously the registry codegen assumed one component per directory, which silently dropped `LinkButton` and `RefreshButton` (both co-located in `button/button.tsx`). They are now first-class registry entries with their own props tables, examples, doc pages, and Figma generators backed by direct registry data instead of borrowing from `Button`.

User-visible changes:

- `kumo doc link-button` and `kumo doc refresh-button` now return component info from the CLI.
- `kumo ls` now lists `LinkButton` and `RefreshButton`.
- New documentation pages at `/components/link-button` and `/components/refresh-button`.
- Sidebar navigation includes the two new entries alphabetically.

Internal changes:

- `KUMO_LINK_BUTTON_VARIANTS` and `KUMO_REFRESH_BUTTON_VARIANTS` are exported from `button.tsx` as aliases of `KUMO_BUTTON_VARIANTS` so each component carries attributable variant data.
- `RefreshButtonProps` is now exported (previously the component used `ButtonProps` directly).
- The `enforce-variant-standard` lint rule now accepts variant constants for any PascalCase component declared in the same file.
