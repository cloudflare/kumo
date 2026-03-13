---
"@cloudflare/kumo": patch
---

Fix Jest module resolution failures caused by double-dash chunk filenames

Rollup's default chunk naming produced filenames like `combobox--ec3iibR.js` which Jest's module resolver cannot handle. This adds explicit `chunkFileNames` config to use single-dash separators and moves chunks to a `chunks/` subdirectory.
