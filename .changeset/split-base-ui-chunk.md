---
"@cloudflare/kumo": patch
---

Split Base UI across fine-grained chunks instead of one `vendor-base-ui` chunk

Components now pull in only the Base UI modules they actually use, improving
consumer tree-shaking: a single-Button app bundle drops from ~173 KB to
~129 KB minified (~57 KB to ~44 KB gzipped) compared to 2.8.0.
