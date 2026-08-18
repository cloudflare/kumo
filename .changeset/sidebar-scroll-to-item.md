---
"@cloudflare/kumo": patch
---

Add `scrollToItem(id, options?)` to `useSidebar()` for imperatively scrolling
a nav item into the sidebar viewport. Tag items with the new `itemId` prop on
`Sidebar.MenuButton` or `Sidebar.MenuItem`.

Options:

- `align`: `"start" | "center" | "end" | "auto"` (default `"auto"` — no-op if
  the item is already visible; otherwise scroll the minimum distance).
- `behavior`: `"auto" | "smooth"` (default `"auto"` — instant, best for
  cross-app landings so users don't watch the sidebar animate on entry).
  `prefers-reduced-motion` forces `"auto"`.

Scrolls only the sidebar viewport (never the document) and works with
`Sidebar.SlidingViews`: items register with the provider via an internal
map, so `scrollToItem` walks up from the target to find its owning viewport
rather than querying the DOM.
