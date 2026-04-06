---
"@cloudflare/kumo": patch
---

Fix CodeBlock crash when an unsupported `lang` value is passed at runtime. The `codeVariants()` function now uses optional chaining with a nullish coalescing fallback to the default language, matching the defensive pattern already used by `switchVariants()` and `badgeVariants()`.
