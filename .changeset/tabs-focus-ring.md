---
"@cloudflare/kumo": patch
---

fix(tabs): improve focus ring and hover styling

- Fixed focus ring to use proper `ring-kumo-ring` token instead of browser default blue
- Segmented variant: inset focus ring to avoid overlap with adjacent tabs, hidden on active tab
- Underline variant: added padding for better focus ring spacing around text
- Added subtle hover states for both variants
