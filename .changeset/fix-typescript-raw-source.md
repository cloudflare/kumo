---
"@cloudflare/kumo": patch
---

Fix TypeScript errors when consumers type-check their projects with kumo installed.

Previously, TypeScript would attempt to type-check raw `.tsx` and `.ts` source files
shipped in the package (block sources in `dist/src/blocks/`, `ai/schemas.ts`, and
`scripts/theme-generator/*.ts`), causing build failures in downstream projects.

This change:
- Moves block source files to a separate `dist/blocks-source/` directory
- Compiles `ai/schemas.ts` and `scripts/theme-generator/*.ts` to JavaScript
- Updates package exports to point to compiled `.js` files with proper `.d.ts` types
