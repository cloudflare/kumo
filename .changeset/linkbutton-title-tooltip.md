---
"@cloudflare/kumo": minor
---

`LinkButton` now wraps in a Kumo `Tooltip` when a `title` is provided, matching `Button`'s behavior. Previously an enabled `LinkButton` only set a native `title` attribute; it now surfaces the same styled tooltip on hover and focus.
