---
"@cloudflare/kumo": patch
---

`Table`: align header styling with the refreshed typography scale.

- Column header (`<th>`) weight bumped down from `font-semibold` to
  `font-medium`. 13px semibold was louder than any Text heading variant;
  medium matches the `Text variant="heading"` role, which is what a column
  header structurally is.
- Compact table header size bumped up from `text-xs` (11px) to `text-sm`
  (12px). 11px is the escape-hatch tier reserved for chart labels and dense
  metadata; a compact table header is still a header and reads more
  comfortably at 12px.

Body cell typography is unchanged (`text-base`, 13px).
