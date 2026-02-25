---
"@cloudflare/kumo": patch
---

Fix Select to render description and error when hideLabel is true

Previously, the `description` and `error` props were silently ignored when
`hideLabel` was `true` (the default). Now, helper text and error messages
display correctly even when the label is visually hidden.
