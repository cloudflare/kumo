---
"@cloudflare/kumo": patch
---

Migrate the toolchain to Vite+ (`vp`): the library now builds with Vite 8 on Rolldown, tests run through `vp test` (Vitest), and linting/formatting run through `vp lint` (Oxlint) / `vp fmt` (Oxfmt, replacing Prettier). No API changes; published output is functionally identical, though entry files are now re-export facades whose source maps live in the shared chunks, and `use-sync-external-store` is now an explicit dependency instead of being bundled (bundling it left CJS `require("react")` calls that broke importing the package directly in Node).
