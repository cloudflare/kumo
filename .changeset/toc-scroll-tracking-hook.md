---
"@cloudflare/kumo": minor
"@cloudflare/kumo-docs-astro": patch
---

Add `useTableOfContentsActiveId` hook for `TableOfContents` scroll tracking.

The `TableOfContents` component is presentational, so consumers had to wire up their own scroll-position tracking. This adds a shared hook: pass the section ids (in document order) and it returns the active section id plus a `selectSection` action for click handling.

```tsx
const { activeId, selectSection } = useTableOfContentsActiveId({
  ids: headings.map((h) => h.slug),
  offset: HEADER_HEIGHT,
});
```

- Highlights the topmost section actually in view (via `IntersectionObserver`), offset by an optional fixed-header `offset`; supports custom scroll containers via `root`.
- Handles `location.hash` deep links on load and `hashchange` automatically (opt out with `trackHash: false`).
- `selectSection` pins a clicked section until scrolling settles, so short sections stay highlighted after a jump. Works on browsers without `scrollend` support.
- SSR-safe: all DOM access happens in effects, so it renders under Astro/Next SSR (`activeId` is `null` on the server).

The docs site "On this page" table of contents now consumes this hook instead of its own bespoke observer.
