---
"@cloudflare/kumo": patch
---

Fix `Pagination` page validation. The page input only accepts whole numbers written as digits, so it no longer calls `setPage` with `NaN`, fractions, or values like `0x10` and `1e1`. Invalid input now restores the current page. With `totalCount={0}`, or when `page` is past the last page, Next and Last are disabled and nothing requests page 0.
