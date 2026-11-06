---
"@cloudflare/kumo": patch
---

Forward trigger props (`aria-label`, `aria-labelledby`, `aria-describedby`, `id`, handlers, etc.) from `Combobox.TriggerValue` to its trigger button instead of dropping them on `Value`, so comboboxes without a visible `label` can have an accessible name. `Combobox.TriggerMultipleWithInput` now accepts `aria-label`, `aria-labelledby` and `aria-describedby` for its input.
