---
"@cloudflare/kumo": patch
---

Remove inert Tailwind classes surfaced by class sorting: `ring` alongside `ring-2` (overridden — later stylesheet rule wins) and bare `outline` in three places (no such utility in Tailwind v4; `outline-1` already applies the default solid style). No visual changes.
