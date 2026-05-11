---
"@cloudflare/kumo": minor
---

Forward `toastManager` prop on `<Toasty>` so code outside the React tree (timers, query-cache listeners, module-load callbacks) can dispatch toasts via a manager created by `createKumoToastManager()`. Also surface `createKumoToastManager` on the top-level package export (previously only available via the deep `@cloudflare/kumo/components/toast` path).
