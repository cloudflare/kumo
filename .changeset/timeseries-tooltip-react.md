---
"@cloudflare/kumo": minor
---

**TimeseriesChart: React-native tooltip**

Replaces ECharts' HTML-string tooltip with a proper React component:

- Tooltip is a real React component rendered via portal — correct theme colours, Tailwind tokens, no `getComputedStyle` hacks
- GPU-accelerated positioning via `transform: translate3d`, same approach as ECharts, with quadrant-based anchoring (flips side when crossing chart midpoint)
- Date formatted as `May 26, 13:04:21` instead of ISO string
- Values sorted descending; fallback formatter avoids scientific notation
- New `tooltipMode` prop: `"all"` (default) or `"single"` (nearest series to cursor)
- New `tooltipMaxItems` prop: caps rows in `"all"` mode with `+N more` footer (default `10`)
