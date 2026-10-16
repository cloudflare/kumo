---
"@cloudflare/kumo": patch
---

Fix `Loader` crashing with `can't access property "height"` in browsers with SVG disabled (e.g. Tor Browser at the "Safest" security level). The spinner is now sized via `width`/`height` SVG attributes instead of an inline `style`. Note that sizing classes passed via `className` (e.g. `size-4`) now take precedence over the `size` prop.
