---
"@cloudflare/kumo": patch
---

fix(Select): TypeScript inference with `strictNullChecks` and `renderValue`/`placeholder` interaction

**TypeScript fix:** Under `strictNullChecks`, using `value={objectOrNull}` would cause `T` to be inferred as `never`, making callbacks like `onValueChange` and `renderValue` unusable. This is now fixed.

**Runtime fix:** `renderValue` is now only called with non-null values. When value is null, the `placeholder` is shown instead. Previously, `renderValue` would receive `null` at runtime despite being typed as `(value: T) => ReactNode`.

```tsx
// Recommended pattern
<Select
  placeholder="Select..."
  value={value}
  onValueChange={setValue} // value is T | null (works with strictNullChecks)
  renderValue={(v) => v.name} // v is T (non-null), no defensive coding needed
/>
```
