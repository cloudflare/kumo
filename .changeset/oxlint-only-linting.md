---
"@cloudflare/kumo": patch
---

Replace the package-level ESLint pass with Oxlint JS plugin coverage for the remaining jsx-a11y rules, and pin the library build to `es2022` with a post-build browser-compat test that blocks newer runtime APIs from shipping in `dist`.
