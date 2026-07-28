---
"@cloudflare/kumo": patch
---

Toast: align title and description with the role-based typography scale.

- Title: `text-[0.975rem]` (15.6px) → `text-lg` (15px medium) — matches `Text variant="section-title"` role.
- Description: `text-[0.925rem]` (14.8px) → `text-lg` (15px regular) — body-lg, muted color.
- Weight-first hierarchy: title and description share the 15px `lg` size; the medium weight on the title carries the differentiation (consistent with Linear's approach).
- `leading-5` retained on both for a compact toast footprint (vs. the default `lg--line-height` of 1.5).
- Figma metadata (`KUMO_TOAST_STYLING`) updated: title fontSize 16 → 15.

No API changes.
