---
"@cloudflare/kumo": minor
---

Add items-based API with overflow support to Breadcrumbs component

- New `items` prop accepts an array of `BreadcrumbItem` objects for declarative breadcrumb definition
- New `currentItem` prop for the current page item
- Automatic overflow detection collapses items that don't fit into a dropdown menu
- Tree visualization in overflow menu shows breadcrumb hierarchy with L-shaped SVG connectors
- Support for custom router links via `render` prop on items
- Loading state support on current item
- Fully backward compatible - existing compound component API continues to work
