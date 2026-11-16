---
"@cloudflare/kumo": minor
---

Add a `breadcrumbs` section to `KumoLocaleProvider` (`label`, `copy`, `copyTooltip`) and an `aria-label` prop to `Breadcrumbs`, so its built-in labels can be translated. In right-to-left layouts the separator now flips and the end margin moves to the left, so use `me-0` instead of `mr-0` to remove it.
