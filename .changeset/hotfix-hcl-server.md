---
"@cloudflare/kumo": patch
---

Add missing HCL language import to server-side Shiki bundle

The HCL language was added to SupportedLanguage type and the client-side
provider in a previous commit, but the server.tsx BUNDLED_LANGS object
was missed. This caused typecheck failures when building.
