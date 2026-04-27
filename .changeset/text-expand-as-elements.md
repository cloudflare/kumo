---
"@cloudflare/kumo": minor
---

Expand `Text` component's `as` prop to accept additional HTML text elements: `label`, `dt`, `dd`, `li`, `figcaption`, `legend`, `pre`, `code`, `em`, `strong`, `small`, `abbr`, and `time`. This unblocks downstream usage in Stratus where `Text` needs to render as definition list terms, labels, and code elements.
