---
"@cloudflare/kumo": patch
---

`Text` sizes now use the line height from their `--text-*` token instead of inheriting it from the parent. `--text-sm` (13px) now uses Tailwind v4's default line-height ratio (`calc(1.25 / 0.875)`).
