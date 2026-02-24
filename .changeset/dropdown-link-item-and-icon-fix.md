---
"@cloudflare/kumo": minor
---

feat(dropdown): add LinkItem for navigation links and fix icon rendering

**New Features:**

- Add `DropdownMenu.LinkItem` for navigation links (semantic `<a>` element with proper menu item behavior)
- Upgrade `@base-ui/react` from 1.0.0 to 1.2.0
- Add new primitives: `csp-provider` and `drawer` from Base UI 1.2.0

**Bug Fixes:**

- Fix `icon` prop not rendering on `DropdownMenu.Item` when no `href` is provided

**Deprecations:**

- `href` prop on `DropdownMenu.Item` is deprecated. Use `DropdownMenu.LinkItem` instead.

**Migration:**

```tsx
// Before (deprecated)
<DropdownMenu.Item href="https://example.com">Link</DropdownMenu.Item>

// After (recommended)
<DropdownMenu.LinkItem href="https://example.com" target="_blank">
  Link
</DropdownMenu.LinkItem>
```

`DropdownMenu.LinkItem` gives you full control over link attributes (`target`, `rel`, etc.) without the component making assumptions about your intent.
