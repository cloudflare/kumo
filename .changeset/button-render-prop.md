---
"@cloudflare/kumo": minor
---

feat(button): add render prop support for polymorphic composition

Add `render` prop to Button component using Base UI's `useRender` hook. This enables rendering Button as anchors, React Router Links, Next.js Links, or any custom component while preserving all Button styling and behavior.

New exports:

- `ButtonState` type for render callback consumers

Usage:

```tsx
// As an anchor
<Button render={<a href="/about" />}>About</Button>

// With React Router
<Button render={<Link to="/dashboard" />}>Dashboard</Button>

// Render callback for state access
<Button
  loading={isLoading}
  render={(props, state) => (
    <a {...props} href="/link">
      {state.loading ? "Loading..." : "Click"}
    </a>
  )}
/>
```
