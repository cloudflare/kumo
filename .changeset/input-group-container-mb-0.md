---
"@cloudflare/kumo": patch
---

Fix `InputGroup` container className to enforce `mb-0`, ensuring all container variants (not just the standalone `<label>` mode) reset inherited bottom margin.
