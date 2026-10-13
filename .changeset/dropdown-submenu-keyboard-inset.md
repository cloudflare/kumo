---
"@cloudflare/kumo": minor
---

DropdownMenu: a SubTrigger now opens its submenu when it receives keyboard focus, while focus stays on the trigger. ArrowRight (or Enter/Space) moves focus into the submenu, moving to a sibling closes it, and Escape/ArrowLeft from inside the submenu don't reopen it. Rows without an icon (including labels) are now inset automatically when another row in the same menu has an icon, so their text lines up; `inset` is still available to force it.
