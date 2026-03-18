---
"@cloudflare/kumo": minor
---

Add neutral variant to Switch component and improve accessibility

- New `variant="neutral"` option: monochrome switch with squircle shape, matching the design from stratus
- Improved off-state visibility for default variant with darker background/ring colors
- Removed `error` variant (not useful for toggle switches)
- Added defensive fallback so invalid variant values don't cause runtime crashes
