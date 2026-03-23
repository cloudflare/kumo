---
"@cloudflare/kumo": patch
---

Generate component-registry files at build time, remove from git

Eliminates contributor friction by generating component-registry.json,
component-registry.md, and schemas.ts during the build process instead of
tracking them in git. Contributors will no longer see stale diffs or need to
manually regenerate these files.

- Add ai/component-registry.json and ai/component-registry.md to .gitignore
- Convert ai/schemas.ts to a stub file for TypeScript compilation
- Add codegen:registry to build script for deterministic generation
