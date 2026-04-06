---
"@cloudflare/kumo": patch
---

Fix Switch label click not toggling when a custom `id` prop is provided

The `id` was not being forwarded to Base UI's `Switch.Root`, causing a mismatch between the label's `htmlFor` and the button's actual `id`.
