---
"@cloudflare/kumo": patch
---

Fix `Sidebar.SlidingViews` showing the wrong view, shifted sideways, after the sidebar collapses and expands. `Sidebar.Collapsible` with `autoScrollOnOpen` now scrolls only the sidebar's own scroll area, vertically, and only when the section itself opens. Sections that are already open when they mount, or when the sidebar expands, no longer scroll.
