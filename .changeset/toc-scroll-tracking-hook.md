---
"@cloudflare/kumo": minor
"@cloudflare/kumo-docs-astro": patch
---

Add `useTableOfContentsActiveId` hook for `TableOfContents` scroll tracking.

The `TableOfContents` component is presentational, so consumers had to wire up their own scroll-position tracking. This adds a shared hook that derives the active section from scroll position via an `IntersectionObserver` (scrollspy) and pins a section on click / hash deep-link (resuming scrollspy once the smooth scroll settles).

- Highlights the topmost section actually in view as you scroll — it no longer stays pinned to the first item.
- Never force-jumps to the last item at the page bottom, so short trailing sections stay reachable.
- `selectSection` keeps a clicked or deep-linked section active even when it's too short to reach the activation line.

The docs site "On this page" table of contents now consumes this hook instead of its own bespoke observer.
