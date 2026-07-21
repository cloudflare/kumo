---
"@cloudflare/kumo-docs-astro": patch
---

Fix broken chart links in the docs site search.

Chart components (`Chart`, `SankeyChart`, `TimeseriesChart`, `BubbleMap`, `ChoroplethMap`) are auto-discovered from the component registry, but their search results linked to `/components/<name>` (e.g. `/components/bubble-map`), which 404s — chart docs live under `/charts/*`. Search now links `SankeyChart`, `TimeseriesChart`, `BubbleMap`, and `ChoroplethMap` to their correct `/charts/*` pages, and excludes `Chart`/`ChartLegend`, which are already covered by the curated "Charts" and "Custom Chart" entries. Components that share the `/charts/maps` page (`BubbleMap`, `ChoroplethMap`) deep-link to their section anchor, so e.g. searching "bubble" resolves to `/charts/maps#bubble-map`.
