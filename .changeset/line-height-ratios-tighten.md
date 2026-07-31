---
"@cloudflare/kumo": patch
---

Tighten line-height ratios on the refreshed typography scale so dense UI
surfaces (sidebar rows, table of contents, form controls) don't gain
excess leading versus the previous scale:

- `--text-sm--line-height`: `1.45` → `1.35` (12px × 1.35 = 16.2px)
- `--text-base--line-height`: `1.5` → `1.4` (13px × 1.4 = 18.2px)
- `--text-lg--line-height`: `1.5` → `1.45` (15px × 1.45 ≈ 21.75px)

Rationale: the old scale used tight ratios (`1/0.85 ≈ 1.176` for sm,
`1/0.75 ≈ 1.333` for xs) that produced roughly constant absolute leading
across the small end of the scale. The refreshed scale switched to
conventional per-size ratios, which loosened `text-sm` and `text-base`
by ~2–4px per line at the same rendered font-size. Components that
swapped from `text-sm` → `text-base` (Sidebar, TableOfContents) were
particularly affected. The new ratios split the difference — still
airier than the old tight scale, but closer to the previous dense feel.

`xs`, `xl`, and `2xl` ratios are unchanged.
