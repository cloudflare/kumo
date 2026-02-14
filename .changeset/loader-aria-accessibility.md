---
"@cloudflare/kumo": patch
---

fix(loader): add ARIA attributes for screen reader accessibility

Added `role="status"` and `aria-label="Loading"` to the Loader SVG component to make it accessible to screen readers. This resolves a WCAG 2.1 SC 4.1.3 (Status Messages) violation where assistive technology users received no indication that content was loading.
