---
"@cloudflare/kumo": patch
---

fix(Select): prevent `renderValue` from being called with `null`

When using Select with object values and `value={objectOrNull}`, the `renderValue` callback would previously receive `null` at runtime. Now, when value is null, the `placeholder` is shown instead of calling `renderValue`.

This is a behavioral change: use `placeholder` for the empty state, and `renderValue` will only be called with actual values.

```tsx
// Before (anti-pattern)
<Select
  value={value}
  renderValue={(v) => v?.name ?? "Select..."}
/>

// After (recommended)
<Select
  placeholder="Select..."
  value={value}
  renderValue={(v) => v.name}
/>
```
