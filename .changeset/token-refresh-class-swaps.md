---
"@cloudflare/kumo": minor
---

Align internal typography class tokens with the refreshed scale for `Badge`,
`Sidebar`, and `TableOfContents`. **Rendered pixel size is unchanged** in
every case — old `text-sm` / `text-xs` and new `text-base` / `text-sm`
resolve to the same pixel values on their respective scales. Only the
class names change so component internals read consistently with the
refreshed scale (body = `text-base`, caption = `text-sm`, escape hatch =
`text-xs`).

**Affected surfaces:**

- `Badge` (`KUMO_BADGE_BASE_STYLES`): `text-xs` → `text-sm` (12px both
  scales)
- `Sidebar.GroupLabel`, `Sidebar.MenuButton` (`base` and `sm`), and
  `Sidebar.MenuSubButton`: `text-sm` → `text-base` (13px both scales)
- `TableOfContents` items and group-labels: `text-sm` → `text-base` (13px
  both scales). `TableOfContents.Title` (uppercase eyebrow) remains
  `text-xs`.

Consumers extending these components via `className` or selecting on the
old class names (e.g. `[class*="text-sm"]` on sidebar rows, custom styling
that extends `KUMO_BADGE_BASE_STYLES`) will need to update their
references. The bump is `minor` (not `patch`) because sidebar internals in
particular ship stringly-typed class contracts that consumers occasionally
lean on.

No visible change to rendered typography on any of these components.
