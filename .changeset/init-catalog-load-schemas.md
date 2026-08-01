---
"@cloudflare/kumo": patch
---

Fix `initCatalog` so it actually loads the validation schemas.

Previously it triggered a synchronous validation whose "schemas not loaded" error was swallowed, so `await initCatalog(catalog)` could resolve while `hasComponent`, `componentNames`, and the other synchronous catalog APIs still reported no components. It now awaits `loadSchemas()` directly.

A failed schema load is also no longer cached: retrying `initCatalog` (or `loadSchemas`) after a transient failure now re-attempts the import instead of returning the stale rejection.
