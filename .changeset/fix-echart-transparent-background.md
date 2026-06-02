---
"@cloudflare/kumo": patch
---

Fix `Chart` (and `SankeyChart`) rendering in dark mode. The chart canvas
now stays transparent so the surrounding `bg-kumo-*` surface shows through
symmetrically in both modes, and ECharts' built-in `"dark"` theme is
applied when `isDarkMode` is true so the tooltip card, axes, splitLines,
and legend text are themed correctly.
