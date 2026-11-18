---
"@cloudflare/kumo": patch
---

Fix `Sidebar.SlidingViews` showing the wrong view, shifted sideways, after the sidebar collapses and expands. `Sidebar.Collapsible` with `autoScrollOnOpen` now scrolls only the sidebar's own scroll area, vertically, and only when the section itself opens, not every time the sidebar expands.
