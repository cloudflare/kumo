---
"@cloudflare/kumo": patch
---

Fix `Pagination` page validation. The page input no longer calls `setPage` with `NaN` or fractional values. Invalid input now restores the current page. With `totalCount={0}`, Next and Last are now disabled and nothing requests page 0.
