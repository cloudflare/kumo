---
"@cloudflare/kumo": patch
---

Checkbox.Group & Radio.Group: remove fieldset border box and simplify styling

- Remove `rounded-lg border border-kumo-line p-4` wrapper from both group fieldsets
- Downsize legend from `text-lg` to `text-base` with inline-flex layout
- Drop `font-medium` from Checkbox.Item and Radio.Item labels
