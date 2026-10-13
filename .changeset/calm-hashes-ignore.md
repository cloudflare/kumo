---
"@cloudflare/kumo": patch
---

Stop throwing on malformed URL hashes while syncing table-of-contents sections. Hashes that can't be percent-decoded are matched as-is, so ids containing a literal `%` still deep-link.
