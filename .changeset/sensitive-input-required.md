---
"@cloudflare/kumo": patch
---

Fix `SensitiveInput` not forwarding `required` to the native input. The prop only decorated the label, so an empty required field did not block form submission.
