---
"@cloudflare/kumo": patch
---

fix(sidebar): add text truncation with ellipsis to Sidebar.MenuButton content

Previously, `Sidebar.MenuButton` used `overflow-hidden` which clipped long text without showing an ellipsis. Now uses `truncate` to match `Sidebar.MenuSubButton`'s behavior.
