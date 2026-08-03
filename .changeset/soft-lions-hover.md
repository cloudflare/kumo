---
"@cloudflare/kumo": minor
---

Add opt-in hover previews for nested sidebar collapsible content via the new
`previewOnHover` prop on `Sidebar.Provider`. When the rail is collapsed,
previews appear regardless of the section's open state.

`Sidebar.MenuButton` now falls back to its own text for the collapsed-rail
tooltip when no explicit `tooltip` is set, so every icon-only item is labelled.
