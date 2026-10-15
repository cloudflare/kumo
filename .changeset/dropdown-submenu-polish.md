---
"@cloudflare/kumo": minor
---

DropdownMenu submenu and row improvements:

- An open submenu's trigger stays highlighted (`data-popup-open`).
- Every menu row (Item, LinkItem, SubTrigger, CheckboxItem, RadioItem) uses the same `bg-kumo-tint` highlight and `rounded-md` radius.
- Submenus line up with their trigger by default. `SubContent`'s default `sideOffset` and `alignOffset` depend on the resolved side, so they stay correct if the submenu has to move above or below the trigger.
- The menu popup now animates with Base UI's `data-starting-style` / `data-ending-style` (the old `data-[state=*]` classes never matched).
- New `DropdownMenu.Positioner` and `DropdownMenu.Popup` parts. `Content` and `SubContent` are built from them, and you can compose them yourself. `DropdownMenu.Portal` now respects `KumoPortalProvider`.
- `SubTrigger`'s `icon` prop accepts `Icon | ReactNode`.
- Icons are spaced by the row's `gap-2`, so element and component icons line up identically.
- Rows without an icon (including labels) are inset automatically when another row in the same menu has an icon, so their text lines up. `inset` still forces it.
