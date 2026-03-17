---
"@cloudflare/kumo": patch
---

fix(Select): prevent chevron overflow with long multi-select values

Added `min-w-0 truncate` to the value element and `shrink-0` to the chevron icon so that long option names truncate gracefully instead of pushing the chevron outside the select bounds.
