---
"@cloudflare/kumo": patch
---

Stop `LayerDialog.Body` from clipping the top of its first child. The body now has a little top padding so a leading input's border and focus ring stay visible, and the top scroll fade no longer masks content in Safari before the scroll area is measured.
