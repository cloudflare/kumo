---
"@cloudflare/kumo": patch
---

Name `Radio.Group`'s radiogroup with its legend.

`Radio.Group` rendered an unnamed `role="radiogroup"` element around a `<fieldset>` that the legend named, so assistive technology announced a radiogroup with no name. The radiogroup now renders as the fieldset itself, so there is one element, `<fieldset role="radiogroup">`, named by its `legend` or `Radio.Legend`. Queries like `getByRole("group", { name })` for a radio group's legend become `getByRole("radiogroup", { name })`.
