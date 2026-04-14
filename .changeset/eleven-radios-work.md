---
"@cloudflare/kumo": patch
---

fix(pagination): add ARIA attributes for screen reader accessibility

- Wrap pagination controls in `<nav>` for proper landmark navigation
- Add `aria-live="polite"` and `aria-atomic="true"` to status text for page change announcements
- Add `navigation` to `PaginationLabels` for i18n customization of the nav aria-label
