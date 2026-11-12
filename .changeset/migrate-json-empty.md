---
"@cloudflare/kumo": patch
---

Fix `kumo migrate` so that stdout stays valid JSON when no token migrations are pending. The "No pending token migrations." text now goes to stderr, and stdout is a JSON object with an empty `classes` map. `--classes` output is unchanged.
