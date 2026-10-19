---
"@cloudflare/kumo": patch
---

Fix disabled `Input` text color. It used an undefined `text-kumo-disabled` token, so disabled inputs looked the same as enabled ones. It now uses `text-kumo-inactive`.
