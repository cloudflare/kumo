---
"@cloudflare/kumo": patch
---

Fix SensitiveInput focus ring and global CSS pollution

- Fix focus ring not showing on container when inner input is focused (focus-within:outline)
- Add defensive styles to eye toggle and copy buttons to prevent global CSS pollution
- Fix inputVariants parentFocusIndicator using wrong selector ([&:has(:focus-within)] → focus-within:)
