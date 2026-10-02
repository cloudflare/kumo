---
"@cloudflare/kumo": patch
---

Fix `Flow` nodes with a custom `render` element briefly laying out at the wrong position on mount. Unpositioned nodes are now measured as absolutely positioned elements, so their first reported width matches their final width.
