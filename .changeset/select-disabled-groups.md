---
"@cloudflare/kumo": minor
---

Add disabled option support, groups, group labels, and separators to Select

- `Select.Option` now accepts `disabled` and `className` props
- New `Select.Group` and `Select.GroupLabel` sub-components for organizing options under labeled headers
- New `Select.Separator` sub-component for visual dividers between groups
- The `items` object-map prop now accepts `SelectItemDescriptor` values with `disabled` metadata
