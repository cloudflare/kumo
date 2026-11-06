---
"@cloudflare/kumo": patch
---

Loosen and balance choice descriptions: `Radio.Item` and `Checkbox.Item` card descriptions, and the `Radio.Group`, `Checkbox.Group`, and `Switch.Group` descriptions, now use `leading-snug` (matching `Field` and `Select` descriptions) and `text-pretty`, so multi-line descriptions are easier to read and don't end on a single orphaned word.
