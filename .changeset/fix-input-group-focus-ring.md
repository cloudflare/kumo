---
"@cloudflare/kumo": patch
---

Fix InputGroup focus ring thickness and color: container mode uses 1.5px ring (wraps entire group including buttons), hybrid container zone and individual mode use 1px ring (thin to avoid colliding with adjacent buttons), and all modes use `ring-kumo-focus/50` (50% opacity) to match the standalone Input component.
