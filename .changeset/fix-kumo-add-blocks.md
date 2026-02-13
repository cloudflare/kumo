---
"@cloudflare/kumo": patch
---

fix(cli): include block source files in build for `kumo add` command

The `kumo add` command was failing because block source files (`.tsx`) were not being copied to `dist/` during the build process. This adds copying of block source files from `src/blocks/` to `dist/src/blocks/` so the CLI can install them into user projects.
