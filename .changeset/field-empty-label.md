---
"@cloudflare/kumo": patch
---

`Field` no longer renders a `<label>` when it would be empty: when `label` and `labelTooltip` are each `undefined`, `null`, a boolean or `""`, and there is no "(optional)" indicator. This fixes `Input`, `InputArea` and `TagInput` without a `label` but with a description or error: they no longer show an empty row above the control, and their `aria-label` is no longer replaced by an empty accessible name.
