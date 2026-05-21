---
"@cloudflare/kumo": patch
---

Fix Tooltip popup overflowing viewport when content is wider than available space. The popup now constrains its width to `var(--available-width)`, a CSS variable provided by Base UI's Positioner that reflects the space between the trigger and the viewport edge.
