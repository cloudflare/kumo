---
"@cloudflare/kumo-docs-astro": patch
---

Improve mobile and tablet responsive layout of the docs site.

- Introduce a tiered horizontal padding scale for docs content: tight on mobile, medium on tablet, full-width on desktop.
- Move the desktop sidebar to the `lg:` breakpoint (≥1024px) so tablets use the mobile drawer UX instead of a cramped side-by-side layout.
- Align padding across chrome bars (hamburger, sticky doc header) with content wrappers at each breakpoint for visual consistency.
