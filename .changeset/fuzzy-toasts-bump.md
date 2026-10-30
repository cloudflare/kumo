---
"@cloudflare/kumo": minor
---

Fix the toast bump animation cutting off a toast's slide-in when the same `id` is added again while the toast is still entering. Duplicate adds through `createKumoToastManager()` now bump too, and toast motion respects `prefers-reduced-motion`. Toast surface styles now live on an inner `[data-kumo-part="surface"]` element instead of the `role="dialog"` root.
