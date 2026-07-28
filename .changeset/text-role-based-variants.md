---
"@cloudflare/kumo": minor
---

`Text` component: introduce role-based heading variants and deprecate raw
size steps on body variants.

**New variants** (all require the `as` prop for document-outline safety):

- `variant="display"` — hero / prominent moments (24px semibold)
- `variant="page-title"` — the single title of a page or dialog (17px medium)
- `variant="section-title"` — card / panel / section heading (15px medium)
- `variant="heading"` — inline / row / list-item heading (13px medium)

**Deprecated (still functional, emits a dev warning):**

- `variant="heading1"` → use `variant="display"`
- `variant="heading2"` → use `variant="page-title"`
- `variant="heading3"` → use `variant="section-title"`
- `size="xs"` (11px) and `size="lg"` (15px) on body variants → use `size="sm"`
  (12px) or `size="base"` (13px), or reach for a heading variant for
  hierarchy. Both still render and look the same as before but emit a
  `console.warn` in development and will be removed in a future major
  version.

For monospace variants, `size="lg"` remains accepted for backwards
compatibility but no longer changes the rendered size (mono always renders
at 12px, one step below body, for optical parity).

**`bold` prop (kept, refined):**

The `bold` prop is retained but its type is now narrowed to copy variants
only (`body`, `secondary`, `success`, `error`), where it bumps weight to
`font-medium` (500). Passing it on heading or monospace variants is a type
error — headings already carry their role's weight, and mono deliberately
stays regular.

The role-based names make it obvious which variant to reach for based on
what the text **is**, not what size you want. Weight-first hierarchy —
differentiating by weight rather than raw size steps on body text — is the
recommended pattern going forward. Use `bold` for inline emphasis; use
`variant="heading"` for structural hierarchy inside a document outline.
