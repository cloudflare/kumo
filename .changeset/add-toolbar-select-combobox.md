---
"@cloudflare/kumo": minor
---

Allow Select and Combobox triggers to compose directly with `Toolbar.Button` and `Toolbar.Input` through their `render` props, adding grouped styling and arrow-key focus management while preserving regular `Select.*` and `Combobox.*` APIs.

Deprecate Toolbar's configurable `size` prop and size metadata exports. They remain functional for compatibility; omitting `size` continues to use the base size.
