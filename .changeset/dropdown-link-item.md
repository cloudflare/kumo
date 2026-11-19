---
"@cloudflare/kumo": major
---

`DropdownMenu.LinkItem` resolves through `LinkProvider`, and `DropdownMenu.Item`'s deprecated `href` prop is removed.

## Migration

- `DropdownMenu.Item`'s `href` prop is removed. Replace `<DropdownMenu.Item href="…">` with `<DropdownMenu.LinkItem href="…">`. `icon`, `variant`, and `inset` work the same. `selected` isn't supported on `LinkItem`.
- `Item href` opened every `http(s)://` and `//` URL in a new tab with `rel="noreferrer"`. `LinkItem` doesn't. To keep that behavior, set `externalLinks="new-tab"` on `LinkProvider` or pass `target="_blank"` on the item.
- `DropdownMenu.LinkItem` now resolves through `LinkProvider`. Before, it always rendered a plain `<a>`, so internal items did a full page load even with a router configured. Now they render through `router`.
- `DropdownMenu.LinkItem` no longer accepts `render`. Configure routing on `LinkProvider`, and use `newTabIcon` to hide the new-tab icon.

## Added

- `newTabIcon` on `DropdownMenu.LinkItem`
