---
"@cloudflare/kumo": minor
---

Add opt-in hover flyouts for nested sidebar collapsible content via the new
`flyout` prop on `Sidebar.Provider`. When the rail is collapsed,
flyouts appear regardless of the section's open state.

`Sidebar.MenuButton` now falls back to its own text for the collapsed-rail
tooltip when no explicit `tooltip` is set, so every icon-only item is labelled.
