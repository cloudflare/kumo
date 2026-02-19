---
"@cloudflare/kumo": minor
---

Refactor Banner component with softer styling and i18n-friendly props

- Added `title` and `description` props for structured content with i18n support
- Softened visual appearance: reduced background opacity (20% -> 10%), muted border colors
- Text now uses `text-kumo-default` for readability, with colored icons for variant indication
- Added `iconClasses` to variant config for per-variant icon coloring
- Component now uses `forwardRef` and sets `displayName` per conventions
- Deprecated `children` and `text` props in favor of `title`/`description`
- Legacy `children` prop still works for backwards compatibility
