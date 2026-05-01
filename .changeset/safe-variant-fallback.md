---
"@cloudflare/kumo": patch
---

Gracefully fall back to default variant instead of crashing when an invalid variant prop is passed at runtime. Previously 22 of 25 components would throw `TypeError` on unknown variant values; all 25 now use a shared `resolveVariant()` utility that returns the default config and logs a dev warning.
