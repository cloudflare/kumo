---
"@cloudflare/kumo": patch
---

Guard `Combobox.TriggerValue`'s `placeholder` prop type so it stays `ReactNode` and can't be narrowed to `string` by the forwarded trigger (button) props.
