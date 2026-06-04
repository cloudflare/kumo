---
"@cloudflare/kumo": patch
---

Fix segmented `Tabs` scroll fade, scroll-into-view, and ring styling:

- Rewrite CSS scroll-fade masking to use `@property`-animated custom properties, fixing proportional fade rendering across browsers.
- Scroll the selected tab into view on click so it stays visible in overflowing tab lists.
- Move `ring ring-kumo-hairline/70` from the inner list to the root container so the segmented variant ring wraps the entire component correctly.
