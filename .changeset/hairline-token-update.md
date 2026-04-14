---
"@cloudflare/kumo": patch
"@cloudflare/kumo-docs-astro": patch
---

Updated the token value for `kumo-line` and `kumo-hairline` in dark mode so they are more visible.

- replace `kumo-line` usages with `kumo-hairline` across Kumo components and docs UI/content styles
- use `ring-kumo-line` for shadowed surfaces (for example combobox, dialog, select, dropdown, toast, and related surface wrappers)
- adjust theme token configuration and generated styles to support updated neutral/hairline appearance