---
"@cloudflare/kumo": minor
---

**TimeseriesChart: React tooltip with Base UI positioning**

Replaces ECharts' HTML-string tooltip with a React component positioned by Base UI's Tooltip primitive:

- Tooltip rendered as a React component with correct theme tokens — no more inline styles or `getComputedStyle` hacks
- Positioning handled by Base UI Tooltip (Floating UI), with automatic collision avoidance and viewport flipping
- New `tooltipFollowCursor` prop: `"both"` (default, free-following) or `"x"` (axis-locked, Recharts-style)
- New `tooltipMode` prop: `"all"` (default) or `"single"` (nearest series to cursor)
- New `tooltipMaxItems` prop: caps rows in `"all"` mode with `+N more` footer (default `10`)
- Date formatted with `Intl.DateTimeFormat` (locale-aware) instead of ISO string
- Values sorted descending; fallback formatter avoids scientific notation
