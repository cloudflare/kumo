---
"@cloudflare/kumo": major
---

feat(Text): decouple visual heading variants from semantic HTML elements

**Breaking change:** `heading1`, `heading2`, `heading3` variants no longer auto-render `<h1>`, `<h2>`, `<h3>` tags. They now render as `<span>` by default. Use the `as` prop to set the appropriate semantic heading level for your document outline.

Before:

```tsx
<Text variant="heading1">Title</Text> // rendered <h1>
```

After:

```tsx
<Text variant="heading1" as="h1">
  Title
</Text> // explicit semantic element
```

The `as` prop is now restricted to valid text elements: `"h1"` through `"h6"`, `"p"`, and `"span"`.
