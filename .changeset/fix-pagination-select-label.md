---
"@cloudflare/kumo": patch
---

fix(Pagination): use aria-label instead of label for PageSize select

The Select component now shows visible labels by default. Since Pagination.PageSize
already displays "Per page:" text next to the select, the internal Select should use
`aria-label` for accessibility without showing a duplicate visible label.
