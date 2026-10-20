---
"@cloudflare/kumo": patch
---

Fix `SensitiveInput` staying revealed after blur when an `onBlur` prop is passed. The consumer's handler used to replace the internal one that re-masks the value; it now runs alongside it.
