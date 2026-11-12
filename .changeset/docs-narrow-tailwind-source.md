---
"@cloudflare/kumo": patch
---

Document an optional narrow Tailwind setup in the README and `ai/USAGE.md`. The default `@source` scans all of `dist/` and writes the utilities of every component. The new section shows how to scan only the chunks of the components an app renders, with `source(none)`, and lists what to watch for: components that draw other components, globs like `button-*` that also match `button-group-*`, and content-hashed chunk names.
