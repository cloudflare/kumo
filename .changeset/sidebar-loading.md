---
"@cloudflare/kumo": minor
---

Add `Sidebar.Loading`, a nav loading skeleton so apps stop hand-rolling their own. It renders nav-item-shaped placeholder rows (icon + label) grouped like the real nav, composed from `SkeletonLine` and matching the `Sidebar.MenuButton` box model so there's no layout shift when the real nav swaps in. Collapse-aware (icon squares only when collapsed) and exposes `role="status"` with a configurable `label`.
