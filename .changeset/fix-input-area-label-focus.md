---
"@cloudflare/kumo": patch
---

Fix InputArea label click not focusing textarea. Use FieldBase.Control with render callback to properly associate the label with the textarea element.
