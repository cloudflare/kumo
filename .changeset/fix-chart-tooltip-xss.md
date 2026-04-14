---
"@cloudflare/kumo": patch
---

fix(chart): escape HTML in tooltip series name and values

Escapes HTML entities in TimeseriesChart tooltip series names and values before rendering.
