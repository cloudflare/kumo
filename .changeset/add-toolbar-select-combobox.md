---
"@cloudflare/kumo": minor
---

Add `Toolbar.Select` and `Toolbar.Combobox` root replacements with inherited toolbar sizing, grouped styling, full-width editable Combobox triggers, and arrow-key focus management while preserving regular `Select.*` and `Combobox.*` children.

Deprecate Toolbar's configurable `size` prop and size metadata exports. They remain functional for compatibility; omitting `size` continues to use the base size.
