---
"@cloudflare/kumo": patch
"@cloudflare/kumo-docs-astro": patch
---

Fix missing disabled styling on Combobox triggers. `TriggerValue` and `TriggerMultipleWithInput` now apply `opacity-50` and `cursor-not-allowed` when disabled, matching the behaviour of the `Select` component.
