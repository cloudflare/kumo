---
"@cloudflare/kumo": patch
---

Add a `labelNative` option to `Field` so consumers can opt out of rendering a native `<label>` wrapper when needed.

Update `Select` to pass `labelNative={false}` to avoid invalid nested label semantics while preserving label rendering.
