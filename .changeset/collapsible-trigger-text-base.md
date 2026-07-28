---
"@cloudflare/kumo": patch
---

`Collapsible.DefaultTrigger`: align tokens with the refreshed typography
scale.

- Label class swaps `text-sm` → `text-base`. Rendered pixel size is
  unchanged (old `text-sm` = 13px, new `text-base` = 13px); only the class
  name changes so the trigger reads consistently with the refreshed body
  scale.
- Caret icon shrinks from 16×16 (`h-4 w-4`) to 14×14 (`h-3.5 w-3.5`) so it
  sits visually flush with the 13px label rather than looming larger than
  it. This is the actual visible change.

Only affects `Collapsible.DefaultTrigger`. Bare `Collapsible.Trigger` still
inherits its label size from its consumer as before.
