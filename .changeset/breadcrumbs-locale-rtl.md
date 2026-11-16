---
"@cloudflare/kumo": minor
---

Breadcrumbs' built-in strings can now be translated with `KumoLocaleProvider`, through the new `breadcrumbs.label` (the `nav` landmark name), `breadcrumbs.copy` and `breadcrumbs.copyTooltip` keys. A new `aria-label` prop on `Breadcrumbs` overrides the landmark name for one trail. In right-to-left layouts, the separator now points toward the current page and the root's end margin is on the left. The root uses the logical `me-4` instead of `mr-4`. Left-to-right layouts look the same, and a `className` such as `mr-0` still removes the margin.
