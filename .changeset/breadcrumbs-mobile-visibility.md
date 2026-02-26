---
"@cloudflare/kumo": patch
---

fix(breadcrumbs): improve mobile breadcrumb readability

breadcrumbs now render a compact mobile trail for deeper hierarchies by collapsing early levels to `...` and keeping the trailing path visible. labels in breadcrumb links and the current page now truncate correctly to prevent stacking or overlap on narrow viewports.
