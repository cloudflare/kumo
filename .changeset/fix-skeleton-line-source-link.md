---
"@cloudflare/kumo-docs-astro": patch
---

Fix the broken "View source" link on the SkeletonLine docs page. It pointed at `primitives/skeleton-line`, which resolved to a non-existent file; the component lives at `components/loader/skeleton-line.tsx`.
