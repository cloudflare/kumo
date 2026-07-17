---
"@cloudflare/kumo-docs-astro": patch
---

Fix broken chart links in the docs site search.

Chart components (`Chart`, `SankeyChart`, `TimeseriesChart`, `BubbleMap`, `ChoroplethMap`) are auto-discovered from the component registry, but their search results linked to `/components/<name>` (e.g. `/components/chart`), which 404s — chart docs live under `/charts/*`. Those pages are already covered by curated static search entries, so the registry-derived duplicates are now excluded from search.
