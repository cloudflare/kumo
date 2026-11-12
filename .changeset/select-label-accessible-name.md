---
"@cloudflare/kumo": patch
---

Select: a visible `label` now names the trigger whatever its type. A ReactNode label, such as a translated `<Trans>` element, used to leave the trigger unnamed or named by its placeholder. The trigger now points `aria-labelledby` at the rendered label, which also keeps the name when `render` sets the trigger's `id`. A consumer `aria-labelledby` next to a visible label is now honored.
