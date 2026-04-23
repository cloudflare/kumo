---
"@cloudflare/kumo": patch
---

Fix `InputGroup` hover state incorrectly propagating to the first child button (e.g. in `Pagination.Controls`). Root now renders as `<div>` instead of `<label>` when it contains multiple labelable controls.
