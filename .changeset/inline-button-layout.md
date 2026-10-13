---
"@cloudflare/kumo": patch
---

Use inline-flex instead of flex for Button and LinkButton so buttons participate in inline flow without forcing a new line. Consumers can still opt into block-level flex layout with className="flex".
