---
"@cloudflare/kumo": patch
---

Fix z-index stacking issues with nested portaled components (e.g., Select inside Dialog)

- Remove unnecessary z-index values from Dialog, Select, Combobox, and Dropdown
- Delete `.z-modal { z-index: 9999 }` - DOM order now handles stacking naturally
- Components opened later correctly appear on top without z-index wars
