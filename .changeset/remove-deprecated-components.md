---
"@cloudflare/kumo": major
---

Remove deprecated components: `Code`, `CodeBlock`, `DateRangePicker`, `MenuBar` (and `useMenuNavigation`), and `Surface`. Their `@cloudflare/kumo/components/*` subpath exports are removed too.

Migration:

- `Code` / `CodeBlock` → `CodeHighlighted` from `@cloudflare/kumo/code`
- `DateRangePicker` → `DatePicker` with `mode="range"`
- `MenuBar` → `Tabs` with `variant="segmented"`
- `Surface` → `LayerCard`
