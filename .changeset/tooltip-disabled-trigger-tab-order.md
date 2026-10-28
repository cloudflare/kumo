---
"@cloudflare/kumo": patch
---

`Tooltip` now keeps its own trigger out of the tab order while the tooltip is `disabled`. This applies only when Kumo renders the trigger (no `render` or `asChild`), for example around truncated `Text` that needs a tooltip only when it overflows. A disabled tooltip there has nothing to reveal, so keyboard users no longer stop on it. Custom triggers passed through `render` keep their own focus behavior.
