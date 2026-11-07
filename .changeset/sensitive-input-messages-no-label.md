---
"@cloudflare/kumo": patch
---

Render `description` and `error` on `SensitiveInput` when no `label` is set. The `Field` wrapper is now used when any of `label`, `error` or `description` is provided, matching `Input`.
