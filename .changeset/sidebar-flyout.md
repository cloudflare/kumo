---
"@cloudflare/kumo": minor
---

Add opt-in flyouts to `Sidebar` with the new `flyout` prop on `Sidebar.Provider`:

- `flyout="collapsed"`: on the collapsed icon rail, collapsible sections open as menus beside the rail on hover, click, Enter or Space. Nested sections open as submenus. The menu heading defaults to the trigger's `tooltip` and can be set with the new `label` prop on `Sidebar.CollapsibleContent`.
- `flyout="always"`: also previews closed sections on the expanded sidebar when the pointer rests on them. Clicking and the keyboard still expand sections inline.

Moving between sections moves the open flyout instead of reopening it. Flyouts are ignored on the collapsed rail when `peekable` is set.

Also fixes `Sidebar.Provider` context going stale when props such as `peekable` change at runtime.
