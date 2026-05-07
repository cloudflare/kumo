---
"@cloudflare/kumo": patch
---

Deprecate `to` prop on Link in favor of `href`. The `to` prop is a routing-framework concept that doesn't belong on a presentational component. Use `href` for all link destinations and configure a `LinkProvider` wrapper to bridge to your router. `to` continues to work but emits a dev-mode deprecation warning.
