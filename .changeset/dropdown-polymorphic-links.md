---
"@cloudflare/kumo": major
---

**BREAKING**: Remove `href`, `target`, and `rel` props from `DropdownMenu.Item`. Use the `render` prop for polymorphic link rendering instead.

```tsx
// Before (no longer works)
<DropdownMenu.Item href="https://example.com">Link</DropdownMenu.Item>

// After
<DropdownMenu.Item render={<a href="https://example.com" target="_blank" rel="noreferrer" />}>
  Link
</DropdownMenu.Item>

// Works with any router
<DropdownMenu.Item render={<Link to="/settings" />}>
  Settings
</DropdownMenu.Item>
```

This gives you full control over link behavior rather than the component making assumptions.
