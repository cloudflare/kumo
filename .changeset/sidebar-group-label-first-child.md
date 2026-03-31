---
"@cloudflare/kumo": patch
---

Sidebar: hide GroupLabel spacer/border when first-child and collapsed

The `SidebarGroupLabel` now takes up no vertical space and hides its collapsed-state border line when it's inside the first `Sidebar.Group`. Previously, the first group label would still render a horizontal divider and margin even though there was nothing above it to separate from.
