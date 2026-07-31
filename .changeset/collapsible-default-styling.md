---
"@cloudflare/kumo": patch
---

Update the default collapsible trigger and panel styling.

`Collapsible.DefaultPanel` now uses an inner content wrapper so the outer panel can animate height smoothly while clipping overflow during the transition. Consumers applying custom layout or spacing classes directly to `DefaultPanel` may need to move those styles to their content, or use `Collapsible.Panel` for a fully custom layout.
