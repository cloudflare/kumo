---
"@cloudflare/kumo": minor
---

DropdownMenu submenu and row improvements:

- A SubTrigger now opens its submenu when it receives keyboard focus, while focus stays on the trigger. ArrowRight (or Enter/Space) moves focus into the submenu, moving to a sibling closes it, and Escape/ArrowLeft from inside the submenu don't reopen it.
- An open submenu's trigger stays highlighted (`data-popup-open`).
- Every menu row (Item, LinkItem, SubTrigger, CheckboxItem, RadioItem) uses the same `bg-kumo-tint` highlight and `rounded-md` radius.
- Submenus line up with their trigger by default: `SubContent` defaults to `alignOffset={-6}` and `sideOffset={2}`.
- `SubTrigger`'s `icon` prop accepts `Icon | ReactNode`.
- Icons are spaced by the row's `gap-2`, so element and component icons line up identically.
- Rows without an icon (including labels) are inset automatically when another row in the same menu has an icon, so their text lines up. `inset` still forces it.
