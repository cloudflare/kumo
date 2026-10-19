---
"@cloudflare/kumo": patch
---

Fix `TimeseriesChart` crashing with `RangeError: Maximum call stack size exceeded` on large datasets. Marker clustering no longer spreads every timestamp into `Math.max`/`Math.min`, and is skipped entirely when the chart has no markers.
