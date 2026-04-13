---
"@cloudflare/kumo": minor
---

feat(link): add router-agnostic client routing events

- Emit `kumo:navigate` and `kumo:prefetch` from eligible internal links
- Add `useClientRouting()` to integrate Link events with application routers
