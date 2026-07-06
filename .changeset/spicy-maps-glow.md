---
"@cloudflare/kumo": minor
---

feat(chart): add `BubbleMap` chart component

New `BubbleMap` component renders proportional bubbles over a registered
geographic map using ECharts' scatter series. Includes value-based radius
scaling, a `mapColors` palette addition to `ChartPalette`, and supporting
types. Also extracts `escapeHtml` / `defaultValueFormat` tooltip helpers into a
shared `tooltip-utils` module reused by `SankeyChart`.
