---
"@cloudflare/kumo": patch
---

Fix Combobox.TriggerValue icon misalignment caused by inherited line-height

The caret icon span was inheriting `line-height` from the parent button's `text-base` class, causing the span's height to exceed the icon's height (e.g., 21.5px vs 16px). The icon sits at the top of the span by default, so when the span is centered via `top-1/2 -translate-y-1/2`, the icon appears offset.

Added `flex items-center` to the icon wrapper to ensure proper vertical centering regardless of inherited styles. This matches the pattern used in TriggerInput.
