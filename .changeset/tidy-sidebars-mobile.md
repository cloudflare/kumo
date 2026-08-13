---
"@cloudflare/kumo": patch
---

Fix hydration mismatch in the Sidebar's `useIsMobile` hook on SSR frameworks like Next.js. The hook now uses `useSyncExternalStore` with a desktop `getServerSnapshot`, so the server-rendered HTML (desktop `<aside>`) hydrates cleanly on mobile viewports before switching to the mobile overlay.
