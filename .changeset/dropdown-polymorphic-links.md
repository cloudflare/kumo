---
"@cloudflare/kumo": major
---

**BREAKING**: Remove `href`, `target`, and `rel` props from `DropdownMenu.Item`. Use the new `DropdownMenu.LinkItem` for navigation links instead.

```tsx
// Before (no longer works)
<DropdownMenu.Item href="https://example.com">Link</DropdownMenu.Item>

// After - use LinkItem for links
<DropdownMenu.LinkItem href="https://example.com" target="_blank">
  Link
</DropdownMenu.LinkItem>

// Internal links
<DropdownMenu.LinkItem href="/settings">
  Settings
</DropdownMenu.LinkItem>
```

Also upgrades `@base-ui/react` from 1.0.0 to 1.2.0 (no breaking changes in Base UI).
