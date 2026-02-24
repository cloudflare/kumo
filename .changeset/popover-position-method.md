---
"@cloudflare/kumo": minor
---

Add `positionMethod` prop to `Popover.Content` to control CSS positioning strategy. Use `"fixed"` when the popover needs to escape stacking contexts (e.g., inside sticky headers). Defaults to `"absolute"`.
