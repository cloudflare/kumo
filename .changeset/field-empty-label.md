---
"@cloudflare/kumo": patch
---

`Field` no longer renders an empty `<label>` when it has no label, tooltip or optional indicator. This fixes `Input`, `InputArea` and `TagInput` without a `label` but with a description or error: they no longer show an empty row above the control, and their `aria-label` is no longer replaced by an empty accessible name.
