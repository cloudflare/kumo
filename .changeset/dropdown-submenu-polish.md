---
"@cloudflare/kumo": patch
---

DropdownMenu: keep an open submenu's trigger highlighted (`data-popup-open`), give every menu row (Item, LinkItem, SubTrigger, CheckboxItem, RadioItem) the same `bg-kumo-tint` highlight and `rounded-md` radius, align submenus with their trigger by default (`SubContent` defaults to `alignOffset={-6}` and `sideOffset={2}`), let `SubTrigger` accept `Icon | ReactNode` for `icon`, and space icons via the row's `gap-2` so element and component icons line up identically.
