---
"@cloudflare/kumo": patch
---

`Surface`: replace `as` prop with Base UI `render` prop for polymorphism

The `as` prop used a hand-rolled generic `forwardRef` pattern (with `as any` casts) that conflicted with how the rest of the library handles polymorphism via Base UI's `useRender` hook.

`Surface` now accepts a `render` prop, consistent with `Link` and other components. The old `as` prop is kept as a deprecated alias and continues to work unchanged — no migration required.

```tsx
// Still works (deprecated)
<Surface as="section">...</Surface>

// Preferred going forward
<Surface render={<section />}>...</Surface>
```
