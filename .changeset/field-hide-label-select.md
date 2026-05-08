---
"@cloudflare/kumo": patch
---

Add `hideLabel` prop to Field so components can skip the native `<label>` while keeping description/error wiring. Use it in Select with Base UI's `Select.Label` to fix hover/focus coupling between the label text and trigger.
