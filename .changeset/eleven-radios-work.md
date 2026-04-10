---
"@cloudflare/kumo": patch
---

fix(pagination): add ARIA attributes for screen reader accessibility

Wrapped pagination controls in `<nav aria-label="Pagination">` for proper landmark navigation. Added `aria-live="polite"` and `aria-atomic="true"` to the "Showing X-Y of Z" text so screen readers announce page changes.
