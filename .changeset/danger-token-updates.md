---
"@cloudflare/kumo": patch
---

Adjust semantic tint usage for status/error ring styles across core form and feedback components.

- Update error ring styling in `Checkbox`, `Radio`, and `Input` to use `*-tint` tokens.
- Update status ring styling in `Toast` variants (`success`, `error`, `warning`, `info`) to use corresponding `*-tint` tokens.
- Update theme generator color mappings used by these tints to improve visual consistency.
