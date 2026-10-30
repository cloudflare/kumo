---
"@cloudflare/kumo": minor
---

Add `flyout="collapsed"` to `Sidebar.Provider`: on the collapsed icon rail, collapsible sections open as menus beside the rail on hover, click, Enter or Space, and nested collapsibles become submenus. The menu heading defaults to the trigger's `tooltip` and can be set with the new `label` prop on `Sidebar.CollapsibleContent`. Also fixes `Sidebar.Provider` context going stale when props such as `peekable` change at runtime.
