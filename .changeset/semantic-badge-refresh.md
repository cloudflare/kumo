---
"@cloudflare/kumo": patch
---

Refine badge semantics/fill styling and banner tone updates

- Rework `Badge` variant model to prioritize semantic variants (`primary`, `secondary`, `error`, `warning`, `success`, `info`) with updated descriptions and `primary` as default.
- Keep token color variants for product-specific use cases while updating class mappings so semantic and token variants are distinct.
- Slight updates to token color variants to meet a11y contrast requirements.
- Update token color variants by replacing `yellow` with `purple` since `yellow` doesn't meet a11y contrast requirements, and keeping docs/demo examples in sync.
- Update badge docs demos/content to focus on primary semantic badges and a consolidated "other variants" section.
- Adjust banner variant surfaces (`default`, `alert`, `error`) to stronger tinted backgrounds and borders.
- Update theme generator badge/semantic token mappings and regenerate `theme-kumo.css` to match the new badge color system.