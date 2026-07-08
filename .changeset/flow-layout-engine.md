---
"@cloudflare/kumo": minor
---

Rewrite `Flow` to use computed layout over relying on DOM layout.

`Flow` now measures node sizes, reconstructs the flow tree, and computes node positions and connector paths from that derived state instead of chaining DOM rect reads. This keeps connectors aligned through resize and scroll changes, supports nested flow structures more predictably, and makes anchor-based connector placement follow the anchor midpoint.
