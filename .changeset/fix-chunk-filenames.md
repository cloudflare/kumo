---
"@cloudflare/kumo": patch
---

Fix Jest module resolution failures and reduce Shiki bundle size

**Jest Fix:**
- Add `chunkFileNames` config to prevent double-dash filenames (e.g., `combobox--ec3iibR.js`) that Jest cannot resolve
- Move chunks to `dist/chunks/` subdirectory for cleaner structure

**Bundle Size Reduction:**
- Switch from full Shiki bundle to fine-grained imports via `shiki/core`
- Reduce from ~300 language/theme chunks to ~16 bundled languages
- Total JS files reduced from 358 to ~163 (54% reduction)

**Supported Languages:**
`javascript`, `typescript`, `jsx`, `tsx`, `json`, `jsonc`, `html`, `css`, `python`, `yaml`, `markdown`, `graphql`, `sql`, `bash`, `shell`, `diff`

**Breaking Change:**
- `BundledLanguage` type is now deprecated, use `SupportedLanguage` instead
- Only the languages listed above are bundled; other Shiki languages are no longer available out of the box
